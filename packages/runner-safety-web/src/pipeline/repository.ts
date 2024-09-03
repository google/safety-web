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
import {logAndRecord} from './logger.js';
import {PackageJson} from './typing.js';
import {Reader} from './reader.js';
import * as semver from 'semver';
import {$, cd, ProcessOutput} from 'zx';
import {hasSucceeded} from './command.js';
import {Repository, PackageManager} from '../protos/pipeline.js';

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
 * Explore the repository and try to determine the package manager used.
 * @param repository the repository to explore
 * @param rootPath the path where the repository is cloned
 * @param reader a reader to read files from the repository
 * @returns an error if the repository could not be explored, undefined if
 * otherwise successful.
 */
export async function exploreRepository(
  repository: Repository,
  rootPath: string,
  reader: Reader,
): Promise<Error | undefined> {
  const rootPackageJson = await reader.readJsonFile(
    nodePath.resolve(rootPath, 'package.json'),
  );
  if (rootPackageJson instanceof Error) {
    return rootPackageJson;
  }
  repository.packageManagerFound = getPackageManager(
    rootPackageJson as PackageJson,
  );
}

/** Sets of heuristics to determine the package manager used */
function getPackageManager(packageJson: PackageJson): PackageManager {
  if (packageJson.packageManager) {
    const [packageManagerKind, version] = packageJson.packageManager.split(
      '@',
    ) as [KnownPackageManagerKinds | undefined, string];
    if (!knownPackageManagerKinds.includes(packageManagerKind)) {
      logAndRecord(`Found unknown package manager "${packageManagerKind}".`);
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
      return {kind: 'yarn', version: engines['yarn']};
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
export async function installRepository(
  repository: Repository,
  rootPath: string,
): Promise<Error | undefined> {
  const manager = repository.packageManagerFound;
  const version = tryGetPackageManagerVersion(manager);
  cd(rootPath);
  $.verbose = true;
  let installOutput: ProcessOutput;
  switch (manager.kind) {
    case 'yarn':
    case 'pnpm':
    case 'npm':
      if (version === undefined) {
        logAndRecord(
          `Could not determine a package manager version for ${manager.kind} with '${manager.version}'. Defaulting to latest...`,
        );
        installOutput = await $`corepack use ${manager.kind}@latest`.nothrow();
      } else {
        installOutput =
          await $`corepack use ${manager.kind}@${version}`.nothrow();
      }
      break;
    default:
      installOutput = await $`corepack use npm@latest`.nothrow();
      break;
  }
  if (!hasSucceeded(installOutput)) {
    return new Error(installOutput.text());
  }
  return undefined;
}

// By spec https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
const SEMVER_STRING_REGEX =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

/**
 * Try to resolve a package manager version to use. If an explicit version is
 * used in the constraints, use this one. Otherwise, if a pattern is used, try
 * to resolve one of the known manger versions.
 * @param manager a description of the package manager and semver contraints
 * @returns the version to use if successful, undefined otherwise.
 */
function tryGetPackageManagerVersion(manager: PackageManager): string {
  // Matches a well formed and well defined semver version
  if (manager.version?.match(SEMVER_STRING_REGEX)) {
    return semver.clean(manager.version);
  }

  // Otherwise we assume it's a version range that we need to resolve
  const maxVersion = semver.maxSatisfying(
    knownPackageManagerVersions[manager.kind as KnownPackageManagerKinds],
    manager.version,
  );
  return maxVersion || undefined;
}
