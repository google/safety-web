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
import * as nodePath from 'node:path';
import {runCommand} from './command.js';
import {cloneRepository} from './clone.js';
import {logAndRecord} from './logger.js';
import {
  exploreRepository,
  installRepository,
  Repository,
} from './repository.js';
import {readJsonFile} from './reader.js';
import { run } from '../runner.js';

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

/**
 * Main entry point for the pipeline that runs safety-web on a set of
 * repositories.
 */
async function main() {
  const parsedCommand = await parseCli();
  const baseCloneDir = nodePath.resolve(parsedCommand.cloneDir);
  if (parsedCommand.clean) {
    await runCommand`rm -rf ${baseCloneDir}`;
  }
  await runCommand`mkdir -p ${baseCloneDir}`;
  for (const url of parsedCommand.repositories as string[]) {
    // Clone the repository sources
    const repoDirectory = await cloneRepository(url, baseCloneDir);
    if (repoDirectory instanceof Error) {
      logAndRecord(repoDirectory.message);
      logAndRecord(`Error while cloning ${url}. Skipping ...`);
      continue;
    }

    const repositoryMap = new Map<string, Repository>();

    // Search the repository structure to look for the preferred package
    // manager, sub packages, etc
    const repository = await exploreRepository(repoDirectory, {readJsonFile});
    if (repository instanceof Error) {
      logAndRecord(repository.message);
      logAndRecord(
        `Error while exploring ${url} in ${repoDirectory}. Skipping ...`,
      );
      continue;
    }
    repository.url = url;
    repositoryMap.set(url, repository);

    // Install the dependencies for the repository
    const error = await installRepository(repository);
    if (error !== undefined) {
      logAndRecord(
        `Error while installing ${url} in ${repoDirectory}. Skipping ...`,
      );
      continue;
    }

    // TODO run safety-web per sub-package instead of at the root.
    const summary = run(repoDirectory);
    logAndRecord(`Safety-web summary for ${url}:`);
    logAndRecord(JSON.stringify(summary, null, 2));
  }
}

main()
  .catch((error) => {
    process.exitCode = 1;
    logAndRecord(`Pipeline top-level error: ${error}`);
  })
  .finally(() => {
    logAndRecord('');
    logAndRecord('### Done ###');
  });
