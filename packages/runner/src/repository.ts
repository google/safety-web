// Copyright 2025 Google LLC
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

import * as fs from 'node:fs';
import * as nodePath from 'node:path';

import debug from 'debug';

const logDebug = debug('safety-web:runner:repository');

export interface Package {
  name: string;
  relativePath: string; // Relative the repository root
  version: string;
}

export async function exploreRepository(
  repoRootDir: string,
  iFs = fs,
): Promise<Set<Package>> {
  const directories: string[] = [repoRootDir];
  const packages = new Set<Package>();

  while (directories.length > 0) {
    const dir = directories.pop();
    try {
      for await (const entry of await iFs.promises.opendir(dir)) {
        if (entry.isDirectory()) {
          if (entry.name !== 'node_modules') {
            directories.push(nodePath.resolve(entry.parentPath, entry.name));
          }
        } else if (entry.isFile()) {
          if (entry.name === 'package.json') {
            // TODO parse package.json. Look for fields: private, name, version
            packages.add({
              name: 'TODO',
              relativePath: nodePath.relative(repoRootDir, entry.parentPath),
              version: 'TODO',
            });
          }
        }
      }
    } catch (e) {
      logDebug(`Error while listing the repository root directory: ${e}`);
    }
  }
  debug(`packages: ${JSON.stringify([...packages])}`);
  return packages;
}
