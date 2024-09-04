// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as nodePath from 'node:path';
import {PackageJson} from './typing.js';
import {Reader} from './reader.js';
import * as semver from 'semver';
import {$, cd, ProcessOutput} from 'zx';
import {CommandRunner, hasSucceeded} from './command.js';
import {Repository, PackageManager, Package} from '../protos/pipeline.js';
import {Logger} from './logger.js';

const knownPackageManagerKinds = ['npm', 'yarn', 'pnpm'] as const;
type KnownPackageManagerKinds = (typeof knownPackageManagerKinds)[number];

/**
 * A subset of versions that we know exist. These are either the latest versions
 * at the time of authoring or LTS.
 */
const knownPackageManagerVersions = {
  npm: ['6.14.18', '8.19.4', '10.7.0', '10.8.2'],
  yarn: ['1.22.22', '3.8.5', '4.4.0'],
  pnpm: ['8.15.9', '9.9.0'],
};

/**
 * A repository that can be cloned and processed by safety-web. Can be
 * serialized to a `Repository` proto.
 */
export class RepositoryImpl implements Repository {
  packageManagerFound: PackageManager;
  packageManagerUsed: PackageManager;
  packages: Package[] = [];
  private commandRunner: CommandRunner;
  get logs() {
    return this.logger.get().join('\n');
  }

  constructor(
    readonly url: string,
    private readonly rootPath: string,
    private readonly reader: Reader,
    private readonly logger: Logger,
  ) {
    this.url = url;
    this.commandRunner = new CommandRunner(logger);
  }

  /**
   * Explore the repository and try to determine the package manager used.
   * @returns an error if the repository could not be explored, undefined if
   * otherwise successful.
   */
  async explore(): Promise<Error | undefined> {
    this.logger.log(`Exploring repository...`);
    const rootPackageJson = await this.reader.readJsonFile(
      nodePath.resolve(this.rootPath, 'package.json'),
    );
    if (rootPackageJson instanceof Error) {
      this.logger.log(
        `Error while exploring repository: ${rootPackageJson.message}`,
      );
      return rootPackageJson;
    }
    this.packageManagerFound = this.getPackageManager(
      rootPackageJson as PackageJson,
    );
  }

  /** Sets of heuristics to determine the package manager used */
  private getPackageManager(packageJson: PackageJson): PackageManager {
    if (packageJson.packageManager) {
      this.logger.log(
        `Found a 'packageManager' field: "${packageJson.packageManager}"`,
      );
      const [packageManagerKind, version] = packageJson.packageManager.split(
        '@',
      ) as [KnownPackageManagerKinds | undefined, string];
      if (!knownPackageManagerKinds.includes(packageManagerKind)) {
        this.logger.log(
          `Found unknown package manager "${packageManagerKind}".`,
        );
        return {kind: undefined, version: undefined};
      } else {
        return {kind: packageManagerKind, version};
      }
    }

    if (packageJson['engines']) {
      const engines = packageJson['engines'];
      if (engines['npm']) {
        return {kind: 'npm', version: engines['npm']};
      } else if (engines['yarn']) {
        return {kind: 'yarn', version: engines['yarn']};
      } else if (engines['pnpm']) {
        return {kind: 'pnpm', version: engines['pnpm']};
      }
    }

    return {kind: undefined, version: undefined};
  }

  /**
   * Install the dependencies using a package manager that follows the constraints
   * found.
   * @param repository
   * @returns
   */
  async install(): Promise<Error | undefined> {
    this.logger.log(`Installing...`);
    const version = this.tryResolvePackageManagerVersion(
      this.packageManagerFound,
    );
    cd(this.rootPath);
    $.verbose = true;
    let installOutput: ProcessOutput;
    switch (this.packageManagerFound.kind) {
      case 'yarn':
      case 'pnpm':
      case 'npm':
        if (version === undefined) {
          this.logger.log(
            `Defaulting to ${this.packageManagerFound.kind} latest...`,
          );
          installOutput = await this.commandRunner
            .run`corepack use ${this.packageManagerFound.kind}@latest`;
        } else {
          this.logger.log(
            `Installing corepack use ${this.packageManagerFound.kind}@${version}`,
          );
          installOutput = await this.commandRunner
            .run`corepack use ${this.packageManagerFound.kind}@${version}`;
        }
        break;
      default:
        installOutput = await this.commandRunner.run`corepack use npm@latest`;
        break;
    }
    if (!hasSucceeded(installOutput)) {
      this.logger.log(
        `Repository installation failed: ${installOutput.text()}`,
      );
      return new Error(installOutput.text());
    }
    return undefined;
  }

  // By spec https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
  private readonly SEMVER_STRING_REGEX =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

  /**
   * Try to resolve a package manager version to use. If an explicit version is
   * used in the constraints, use this one. Otherwise, if a pattern is used, try
   * to resolve one of the known manger versions.
   * @param manager a description of the package manager and semver contraints
   * @returns the version to use if successful, undefined otherwise.
   */
  private tryResolvePackageManagerVersion(manager: PackageManager): string {
    // Matches a well formed and well defined semver version
    if (manager.version?.match(this.SEMVER_STRING_REGEX)) {
      this.logger.log(
        `Using explicit ${manager.kind} version "${manager.version}"`,
      );
      return semver.clean(manager.version);
    }

    // Otherwise we assume it's a version range that we need to resolve
    const maxVersion = semver.maxSatisfying(
      knownPackageManagerVersions[manager.kind as KnownPackageManagerKinds],
      manager.version,
    );
    if (maxVersion === null) {
      this.logger.log(`Could not resolve to a known ${manager.kind} version`);
    } else {
      this.logger.log(`Resolved ${manager.kind} version to "${maxVersion}"`);
    }
    return maxVersion || undefined;
  }
}
