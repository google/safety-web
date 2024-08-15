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

import {ESLint, Linter} from 'eslint';
import typescriptESLintParser from '@typescript-eslint/parser';
import safetyWeb from 'eslint-plugin-safety-web';

/**
 * @param explicitTSConfig When provided, passed to tsc for the compilation.
 *     Otherwise, the TS service will resolve the tsconfig.json to use
 *     automatically.
 * @returns a Linter.Config object that will run safety-web on all TS and JS
 *     files found in the project directory.
 */
function generateESLintConfigOverride(
  explicitTSConfig?: string,
): Linter.Config<Linter.RulesRecord> {
  const overrideConfig: Linter.Config<Linter.RulesRecord> = {
    name: 'runner-safety-web override',
    files: ['**/*js', '**/*.ts'],
    ignores: ['**/.*.js'], // Ignores config files, e.g. `.config.eslint.js`
    languageOptions: {
      ecmaVersion: 'latest', // | 2015 | 2020 | ...
      // sourceType: 'module',  // | 'commonjs' | 'script'
      // globals: {...globals.browser},
      parser: typescriptESLintParser,
      parserOptions: {}, // Populated later.
    },
    rules: {
      'safety-web/trusted-types-checks': 'error',
    },
  };

  if (explicitTSConfig) {
    overrideConfig.languageOptions.parserOptions.project = [explicitTSConfig];
  } else {
    // TODO: detect and if necessary define a default project for files in scope for ESLint but not in a existing tsconfig.
    overrideConfig.languageOptions.parserOptions.projectService = {};
  }
  return overrideConfig;
}

/**
 * @param rootDir The absolute path for the project to lint
 * @param explicitTSConfig when defined, used to type check the source.
 *     If undefined, defer to the project service which looks for existing
 *     tsconfig.
 * @returns ESLint options to run safety-web on the project living in rootDir.
 */
export function generateESLintOptions(
  rootDir: string,
  explicitTSConfig: string,
): ESLint.Options {
  return {
    cwd: rootDir,
    allowInlineConfig: true,
    cache: false,
    errorOnUnmatchedPattern: false,
    ignore: false, // Maybe generate a list of files to ignore (e.g. node_modules, eslint.config.js, ...)
    overrideConfigFile: true, // Ignore an existing config file if it exists.
    stats: false,
    warnIgnored: true,
    overrideConfig: [generateESLintConfigOverride(explicitTSConfig)],
    plugins: {
      'safety-web': safetyWeb as unknown as ESLint.Plugin,
    },
  };
}
