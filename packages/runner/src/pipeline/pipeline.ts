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
import {Repository, PackageSummary} from '@safety-web/types';
import * as fs from 'node:fs/promises';
import {Worker} from 'node:worker_threads';
import {WorkerSuccess, WorkerError} from './worker.js';

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
    .option('outputDir', {
      default: './pipelineResult/',
      describe: 'Directory path where to write the results of the pipeline',
      type: 'string',
    })
    .command('run', 'run the pipeline and report the violations')
    .demandCommand()
    .parse();
}

async function processRepository(
  url: string,
  baseCloneDir: string,
): Promise<RepositoryImpl | undefined> {
  // Clone the repository sources
  const repositoryOrError = await RepositoryImpl.clone(
    baseCloneDir,
    url,
    {
      readJsonFile,
    },
    new Logger(`pipeline:repository:${url}`),
  );
  if (repositoryOrError instanceof Error) {
    logger.log(repositoryOrError.message);
    logger.log(`Error while cloning ${url}. Stopping processing here ...`);
    return undefined;
  }
  const repository = repositoryOrError;

  // Populate the repository structure. Look for the preferred package
  // manager, sub packages, etc
  const exploreError = await repository.explore();
  if (exploreError !== undefined) {
    logger.log(exploreError.message);
    logger.log(
      `Error while exploring repository ${url}. Stopping processing here ...`,
    );
    return repository;
  }

  // Install the dependencies for the repository
  const installError = await repository.install();
  if (installError !== undefined) {
    logger.log(
      `Error while installing repository ${url}. Stopping processing here ...`,
    );
    return repository;
  }

  const summaries = await new Promise<Set<PackageSummary>>(
    (resolveSummaries, reject) => {
      const repoWorker = new Worker(
        nodePath.resolve(import.meta.dirname, 'worker.js'),
        {workerData: {rootDir: repository.rootPath}},
      );
      repoWorker.on('message', (message: WorkerSuccess | WorkerError) => {
        if (message.type === 'success') {
          resolveSummaries(message.summaries);
        } else {
          reject(new Error());
        }
      });
    },
  );

  repository.summaries = [...summaries];
  return repository;
}

/**
 * Main entry point for the pipeline that runs safety-web on a set of
 * repositories.
 */
async function main() {
  const parsedCommand = await parseCli();
  const baseCloneDir = nodePath.resolve(parsedCommand.cloneDir);
  const outputDir = nodePath.resolve(parsedCommand.outputDir);
  await commandRunner.run`mkdir -p ${baseCloneDir} ${outputDir}`;
  for (const url of parsedCommand.repositories as string[]) {
    const repository = await processRepository(url, baseCloneDir);
    if (repository === undefined) {
      logger.log(`Error while processing repository at ${url}. Skipping...`);
      continue;
    }
    const repositoryProto = Repository.toBinary(Repository.create(repository));
    const outputFile = nodePath.resolve(
      outputDir,
      `${nodePath.basename(repository.rootPath)}.pb`,
    );
    await fs.writeFile(outputFile, repositoryProto);
    logger.log(`Wrote serialized proto to ${outputFile}`);
    logger.log(
      Repository.toJsonString(Repository.create(repository), {prettySpaces: 2}),
    );
    // Delete the clone repository to free disk space
    await repository.clean();
  }
}

main()
  .catch((error: Error) => {
    process.exitCode = 1;
    logger.log(`Pipeline top-level error: ${error.message} -- ${error.stack}`);
  })
  .finally(() => {
    logger.log('');
    logger.log('### Done ###');
  });
