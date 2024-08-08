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
import safetyWeb from 'eslint-plugin-safety-web';
import typescriptESLintParser from '@typescript-eslint/parser';

async function resolvePath(path: string): Promise<string> | undefined {
  const resolvedPath = nodePath.resolve(path);
  try {
    await fs.access(resolvedPath);
    return resolvedPath;
  } catch (e) {
    console.error(
      `Error: path '${path}' could not be resolved. Does it exist?`,
    );
  }
  return;
}

async function main() {
  const parsedCommand = await yargs(process.argv.slice(2))
    .scriptName('runner-safety-web')
    .option('rootDir', {
      demandOption: false,
      default: './',
      describe: 'Root directory to check',
      type: 'string',
    })
    .command('run', 'run safety-web and report the violations')
    .demandCommand()
    .parse();

  const resolvedRootDir = await resolvePath(parsedCommand.rootDir);
  if (resolvedRootDir === undefined) {
    throw new Error('Could not resolved the root directory. Aborting...');
  }

  const options: ESLint.Options = {
    cwd: resolvedRootDir,
    allowInlineConfig: true,
    cache: false,
    // cacheLocation: ".eslintcache",
    // cacheStrategy: "metadata",
    errorOnUnmatchedPattern: false,
    ignore: false, // Maybe generate a list of files to ignore (e.g. node_modules, eslint.confing.js, ...)
    overrideConfigFile: true, // Ignore an existing config file if it exists.
    stats: false,
    warnIgnored: true,
    overrideConfig: [
      {
        name: 'runner-safety-web override',
        files: ['**/*js', '**/*.ts'],
        languageOptions: {
          ecmaVersion: 'latest', // | 2015 | 2020 | ...
          // sourceType: 'module',  // | 'commonjs' | 'script'
          // globals: {...globals.browser},
          parser: typescriptESLintParser,
          parserOptions: {
            projectService: {
              allowDefaultProject: ['*.js'],
            },
          },
        },
        rules: {
          'safety-web/trusted-types-checks': 'error',
        },
      },
    ],
    plugins: {
      'safety-web': safetyWeb,
    },
  };

  const eslint = new ESLint(options);
  const results = await eslint.lintFiles(['**/*.js', '**/*.ts']);

  const formatter = await eslint.loadFormatter('stylish');
  const resultText = formatter.format(results, undefined /** context */);

  console.log(resultText);
}

main().catch((error) => {
  process.exitCode = 1;
  console.error(error);
});
