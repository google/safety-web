#!/usr/bin/env node
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

import yargs from 'yargs';
import {$} from 'zx';
import * as nodePath from 'node:path';

interface Repository {
  url: string;
  clonePath: string;
  packages: Array<Package>;
}

interface Package {
  name: string;
  version: string;
  summary: object;
}

async function parseCli() {
  return yargs(process.argv.slice(2))
    .scriptName('pipeline')
    .option('cloneDir', {
      demandOption: false,
      default: './git',
      describe: 'Root directory to clone the projects in',
      type: 'string',
    })
    .option('clean', {
      demandOption: false,
      describe: 'Delete the cloneDir content before pulling the projects',
      default: 'false',
      type: 'boolean',
    })
    .option('repositories', {
      demandOption: true,
      describe: `List of URLs of repositories to clone`,
      type: 'array',
    })
    .command('run', 'run the pipeline and report the violations')
    .demandCommand()
    .parse();
}

async function main() {
  const parsedCommand = await parseCli();
  const repositoryMap: Map<string, Repository> = new Map();
  const cloneDir = nodePath.resolve(parsedCommand.cloneDir);
  if (parsedCommand.clean) {
    console.log(`Deleting ${cloneDir} and its content`);
    await $`rm -rf ${cloneDir}`;
  }
  await $`mkdir -p ${cloneDir}`;
  let id = 1;
  for (const url of parsedCommand.repositories as string[]) {
    const repoDirectoryPath = nodePath.resolve(
      cloneDir,
      generateDirectoryName(url, id),
    );
    await $`git clone ${url} ${repoDirectoryPath}`;
    console.log(`Cloned ${url} in ${String(repoDirectoryPath)}`);
    repositoryMap.set(repoDirectoryPath, {
      url: url,
      clonePath: repoDirectoryPath,
      packages: [],
    });
    id += 1;
  }
}

function generateDirectoryName(url: string, id: number): string {
  const githubMatcher = new RegExp(
    '^https://github[.]com/(?<user>[a-zA-Z-_0-9]+)/(?<name>[a-zA-Z-_0-9]+)[.]git$',
  );
  const match = url.match(githubMatcher);
  if (match) {
    return `${id}-${match.groups.user}:${match.groups.name}`;
  }
  return `unknown-name:${id}`;
}

main().catch((error) => {
  process.exitCode = 1;
  console.error(error);
});
