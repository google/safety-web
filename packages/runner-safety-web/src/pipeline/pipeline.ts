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
import {RepositoryImpl} from './repository.js';
import {readJsonFile} from './reader.js';
import {run} from '../runner.js';
import {Repository} from '../protos/pipeline.js';

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
    const repoDirectoryPath = await cloneRepository(url, baseCloneDir);
    if (repoDirectoryPath instanceof Error) {
      logAndRecord(repoDirectoryPath.message);
      logAndRecord(`Error while cloning ${url}. Skipping ...`);
      continue;
    }
    const repository = new RepositoryImpl(url, repoDirectoryPath, {
      readJsonFile,
    });

    const repositoryMap = new Map<string, Repository>();

    // Populate the repository structure. Look for the preferred package
    // manager, sub packages, etc
    const exploreError = await repository.explore();
    if (exploreError !== undefined) {
      logAndRecord(exploreError.message);
      logAndRecord(
        `Error while exploring ${url} in ${repoDirectoryPath}. Skipping ...`,
      );
      continue;
    }
    repositoryMap.set(url, repository);

    // Install the dependencies for the repository
    const installError = await repository.install();
    if (installError !== undefined) {
      logAndRecord(
        `Error while installing ${url} in ${repoDirectoryPath}. Skipping ...`,
      );
      continue;
    }

    // TODO run safety-web per sub-package instead of at the root.
    const summary = await run(repoDirectoryPath);
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
