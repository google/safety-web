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

import {ESLint} from 'eslint';
import * as nodePath from 'node:path';
import * as fs from 'fs/promises';
import {generateESLintOptions} from './eslint_config.js';
import {generateTSConfig} from './ts_config.js';
import * as formatter from 'eslint-formatter-safety-web';

const safetyWebFormatter = formatter as unknown as ESLint.Formatter & {
  formatToObject: (
    results: ESLint.LintResult[],
    context: ESLint.LintResultData,
  ) => formatter.SafetyWebSummary;
};

export const SAFETY_WEB_TSCONFIG_FILENAME = 'tsconfig.safety-web.json';

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

async function writeConfig(tsconfig: object, path: string) {
  await fs.writeFile(path, JSON.stringify(tsconfig, null, 2));
}

export async function run(rootDir: string, useDefaultTSConfig = false) {
  const resolvedRootDir = await resolvePath(rootDir);
  if (resolvedRootDir === undefined) {
    throw new Error('Could not resolve the root directory. Aborting...');
  }

  let tsConfigPath: string = undefined;
  if (!useDefaultTSConfig) {
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
  return safetyWebFormatter.formatToObject(results, {
    cwd: options.cwd,
    rulesMeta: undefined,
  });
}
