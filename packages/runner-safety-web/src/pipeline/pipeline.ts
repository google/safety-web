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
import {CommandRunner} from './command.js';
import {Logger} from './logger.js';
import {RepositoryImpl} from './repository.js';
import {readJsonFile} from './reader.js';
import {run} from '../runner.js';
import {Repository} from 'types-safety-web';

const logger = new Logger('pipeline:main');
const commandRunner = new CommandRunner(logger);

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
    await commandRunner.run`rm -rf ${baseCloneDir}`;
  }
  await commandRunner.run`mkdir -p ${baseCloneDir}`;
  for (const url of parsedCommand.repositories as string[]) {
    const repository = new RepositoryImpl(
      url,
      {
        readJsonFile,
      },
      new Logger(`pipeline:repository:${url}`),
    );
    // Clone the repository sources
    const cloneError = await repository.clone(baseCloneDir);
    if (cloneError !== undefined) {
      logger.log(cloneError.message);
      logger.log(`Error while cloning ${url}. Skipping ...`);
      continue;
    }

    const repositoryMap = new Map<string, Repository>();

    // Populate the repository structure. Look for the preferred package
    // manager, sub packages, etc
    const exploreError = await repository.explore();
    if (exploreError !== undefined) {
      logger.log(exploreError.message);
      logger.log(`Error while exploring repository ${url}. Skipping ...`);
      continue;
    }
    repositoryMap.set(url, repository);

    // Install the dependencies for the repository
    const installError = await repository.install();
    if (installError !== undefined) {
      logger.log(`Error while installing repository ${url}. Skipping ...`);
      continue;
    }

    // TODO run safety-web per sub-package instead of at the root.
    const summary = await run(repository.rootPath);
    logger.log(`Safety-web summary for ${url}:`);
    logger.log(JSON.stringify(summary, null, 2));

    console.log(Repository.toJsonString(Repository.create(repository)));
  }
}

main()
  .catch((error) => {
    process.exitCode = 1;
    logger.log(`Pipeline top-level error: ${error}`);
  })
  .finally(() => {
    logger.log('');
    logger.log('### Done ###');
  });
