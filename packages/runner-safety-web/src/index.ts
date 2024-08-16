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
import {ESLint} from 'eslint';
import * as nodePath from 'node:path';
import * as fs from 'fs/promises';
import {generateESLintOptions} from './eslint_config.js';
import {generateTSConfig} from './ts_config.js';
import * as safetyWebFormatter from 'eslint-formatter-safety-web';

const SAFETY_WEB_TSCONFIG_FILENAME = 'tsconfig.safety-web.json';

async function resolvePath(path: string): Promise<string> | undefined {
  const resolvedPath = nodePath.resolve(path);
  try {
    await fs.access(resolvedPath);
    return resolvedPath;
  } catch (_) {
    console.error(
      `Error: path '${path}' could not be resolved. Does it exist?`,
    );
  }
  return;
}

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

async function writeConfig(tsconfig: object, path: string) {
  await fs.writeFile(path, JSON.stringify(tsconfig, null, 2));
}

async function main() {
  const parsedCommand = await parseCli();

  const resolvedRootDir = await resolvePath(parsedCommand.rootDir);
  if (resolvedRootDir === undefined) {
    throw new Error('Could not resolve the root directory. Aborting...');
  }

  let tsConfigPath: string = undefined;
  if (!parsedCommand.useDefaultTSConfig) {
    tsConfigPath = nodePath.resolve(
      resolvedRootDir,
      SAFETY_WEB_TSCONFIG_FILENAME,
    );
    await writeConfig(generateTSConfig(), tsConfigPath);
  }

  const options: ESLint.Options = generateESLintOptions(
    resolvedRootDir,
    tsConfigPath,
  );

  const eslint = new ESLint(options);
  const results = await eslint.lintFiles(['**/*.js', '**/*.ts']);
  const formatter = safetyWebFormatter as ESLint.Formatter;
  const resultText = formatter.format(results, {
    cwd: options.cwd,
    rulesMeta: undefined,
  });

  console.log(resultText);
}

main().catch((error) => {
  process.exitCode = 1;
  console.error(error);
});
