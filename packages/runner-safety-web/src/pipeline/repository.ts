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

export interface Repository {
  url?: string;
  clonePath: string;
  packageManager: PackageManager;
  packages: Array<Package>;
}

export interface Package {
  name: string;
  path: string;
  version: string;
}

const knownPackageManagerKinds = ['npm', 'yarn', 'pnpm'] as const;
type KnownPackageManagerKinds = (typeof knownPackageManagerKinds)[number];
interface PackageManager {
  kind?: KnownPackageManagerKinds;
  semver?: string;
}

/**
 * A subset of versions that we know exist. These are either the latest versions
 * at the time of authoring or LTS.
 */
const knownPackageManagerVersions = {
  npm: ['6.14.18', '8.19.4', '10.7.0', '10.8.2'],
  yarn: ['1.22.22', '3.8.5', '4.4.0'],
  pnpm: ['8.15.9', '9.9.0'],
};

export async function exploreRepository(
  root: string,
  reader: Reader,
): Promise<Repository | Error> {
  const rootPackageJson = await reader.readJsonFile(
    nodePath.resolve(root, 'package.json'),
  );
  if (rootPackageJson instanceof Error) {
    return rootPackageJson;
  }
  const packageManager = getPackageManager(rootPackageJson as PackageJson);
  return {
    clonePath: root,
    packageManager: packageManager,
    packages: [],
  };
}

/** Sets of heuristics to determine the package manager used */
function getPackageManager(packageJson: PackageJson): PackageManager {
  if (packageJson.packageManager) {
    const [packageManagerKind, semver] = packageJson.packageManager.split(
      '@',
    ) as [KnownPackageManagerKinds | undefined, string];
    if (!knownPackageManagerKinds.includes(packageManagerKind)) {
      logAndRecord(`Found unknown package manager "${packageManagerKind}".`);
      return {kind: undefined, semver: undefined};
    } else {
      return {kind: packageManagerKind, semver};
    }
  }

  if (packageJson['engines']) {
    const engines = packageJson['engines'];
    if (engines['npm']) {
      return {kind: 'npm', semver: engines['npm']};
    } else if (engines['yarn']) {
      return {kind: 'yarn', semver: engines['yarn']};
    } else if (engines['pnpm']) {
      return {kind: 'yarn', semver: engines['yarn']};
    }
  }

  // Default to NPM.
  return {kind: undefined, semver: undefined};
}

/**
 * Install the dependencies using a package manager that follows the constraints
 * found.
 * @param repository
 * @returns
 */
export async function installRepository(
  repository: Repository,
): Promise<Error | undefined> {
  const manager = repository.packageManager;
  const version = tryGetPackageManagerVersion(manager);
  cd(repository.clonePath);
  $.verbose = true;
  let installOutput: ProcessOutput;
  switch (manager.kind) {
    case 'yarn':
    case 'pnpm':
    case 'npm':
      if (version === undefined) {
        logAndRecord(
          `Could not determine a package manager version for ${manager.kind} with '${manager.semver}'. Defaulting to latest...`,
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
  if (manager.semver?.match(SEMVER_STRING_REGEX)) {
    return semver.clean(manager.semver);
  }
  const maxVersion = semver.maxSatisfying(
    knownPackageManagerVersions[manager.kind],
    manager.semver,
  );
  return maxVersion || undefined;
}
