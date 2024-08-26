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
