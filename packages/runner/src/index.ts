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
import {run, SAFETY_WEB_TSCONFIG_FILENAME} from './runner.js';
import {Logger} from './logging.js';
import {PackageSummary} from '@safety-web/types';

async function parseCli() {
  return yargs(process.argv.slice(2))
    .scriptName('runner')
    .option('rootDir', {
      demandOption: false,
      default: './',
      describe: 'Root directory to check',
      type: 'string',
    })
    .option('useDefaultTSConfig', {
      demandOption: false,
      default: false,
      describe: `Try to use an existing tsconfig.json in the project instead of creating/using the custom ${SAFETY_WEB_TSCONFIG_FILENAME} one`,
      type: 'boolean',
    })
    .option('packageName', {
      demandOption: false,
      describe: 'Only output a safety-web summary this package name',
      type: 'string',
    })
    .command('run', 'run safety-web and report the violations')
    .demandCommand()
    .parse();
}

async function main() {
  const args = await parseCli();
  Logger.info(`Processing repository at ${args.rootDir}`);
  const summaries = await run(args.rootDir, args.useDefaultTSConfig);
  if (args.packageName !== undefined) {
    const summary = filterSummary(summaries, args.packageName);
    Logger.info(
      `Done processing. Summary for ${args.packageName}: ${JSON.stringify(summary, null, 2)}`,
    );
  } else {
    Logger.info(
      `Done processing. Summaries: ${JSON.stringify([...summaries], null, 2)}`,
    );
  }
}

function filterSummary(
  summaries: Set<PackageSummary>,
  packageName: string,
): PackageSummary | undefined {
  const pack = [...summaries].filter((s) => s.packageName === packageName);
  if (pack.length === 0) {
    Logger.error(
      `Error while filtering summary for package ${packageName}. Package could not be found. Found packages: ${String([...summaries].map((s) => s.packageName))}`,
    );
    return undefined;
  }
  if (pack.length > 1) {
    Logger.error(
      `Error while filtering summary for package ${packageName}. Several packages with the same name found.`,
    );
    return undefined;
  }
  return pack[0];
}

main().catch((error) => {
  process.exitCode = 1;
  console.error(error);
});
