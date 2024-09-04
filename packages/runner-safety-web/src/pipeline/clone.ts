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
import {hasSucceeded, CommandRunner} from './command.js';
import {Logger} from './logger.js';

// Used to prevent naming collision when generating a directory name.
let cloneCounter = 1;
const commandRunner = new CommandRunner(new Logger('pipeline:clone'));

/**
 * Clone a repository from a url. Create a new directory in a base directory.
 * @param url of the repository, e.g. https://github.com/foo/bar
 * @param baseDir absolute or relative path to a directory where to create the
 *     new repository directory
 * @returns the path to the directory for the repository if it succeededs, or an
 *     error if it fails
 */
export async function cloneRepository(
  url: string,
  baseDir: string,
): Promise<string | Error> {
  const repoDirectoryPath = nodePath.resolve(
    baseDir,
    generateDirectoryName(url),
  );
  const output = await commandRunner.run`git clone ${url} ${repoDirectoryPath}`;
  if (!hasSucceeded(output)) {
    return new Error(`Failed to clone ${url} in ${baseDir}.`);
  }
  return repoDirectoryPath;
}

function generateDirectoryName(url: string): string {
  const githubMatcher = new RegExp(
    '^https://github[.]com/(?<user>[a-zA-Z-_0-9]+)/(?<name>[a-zA-Z-_0-9]+)([.]git)?$',
  );
  const match = url.match(githubMatcher);
  const name = match
    ? `${cloneCounter}-${match.groups.user}:${match.groups.name}`
    : `${cloneCounter}-unknown-name`;
  cloneCounter += 1;
  return name;
}
