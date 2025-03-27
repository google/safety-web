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

export let mockableFs = fs;

export function testOnlyMockFs(mockFs: typeof fs) {
  mockableFs = mockFs;
}

export interface Package {
  name: string;
  relativePath: string; // Relative the repository root
  version: string;
}

interface PackageJson {
  name?: string;
  version?: string;
  private?: string;
}

export interface Repository {
  url: string;
  commitId?: string;
  packages: Set<Package>;
}

export async function crawl(repoRootDir: string): Promise<Set<Package>> {
  const directories: string[] = [repoRootDir];
  const packages = new Set<Package>();

  while (directories.length > 0) {
    const dir = directories.pop();
    try {
      for await (const entry of await mockableFs.promises.opendir(dir)) {
        if (entry.isDirectory()) {
          if (entry.name !== 'node_modules') {
            directories.push(nodePath.resolve(entry.parentPath, entry.name));
          }
        } else if (entry.isFile()) {
          if (entry.name === 'package.json') {
            const packageJson = await parsePackageJson(
              nodePath.resolve(entry.parentPath, 'package.json'),
            );
            if (packageJson !== undefined) {
              if (!packageJson.private) {
                packages.add({
                  name: packageJson.name ?? '__NAME_NOT_FOUND__',
                  relativePath: nodePath.relative(
                    repoRootDir,
                    entry.parentPath,
                  ),
                  version: packageJson.version ?? '__VERSION_NOT_FOUND__',
                });
              }
            } else {
              logDebug(`Failed to parse package.json at: ${entry.parentPath}.`);
            }
          }
        }
      }
    } catch (e) {
      logDebug(`Error while listing the repository root directory: ${e}`);
    }
  }
  return packages;
}

async function parsePackageJson(filePath: string): Promise<PackageJson | null> {
  try {
    const fileContent = await mockableFs.promises.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent) as PackageJson;
    return jsonData;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
}
