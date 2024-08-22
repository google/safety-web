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

async function parseCli() {
  return yargs(process.argv.slice(2))
    .scriptName('runner-safety-web')
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
    .command('run', 'run safety-web and report the violations')
    .demandCommand()
    .parse();
}

async function main() {
  const args = await parseCli();
  const summary = await run(args.rootDir, args.useDefaultTSConfig);
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  process.exitCode = 1;
  console.error(error);
});
