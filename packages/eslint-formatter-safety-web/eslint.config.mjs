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

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import {commonMonorepoConfig} from '../../eslint-common.config.mjs';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  commonMonorepoConfig,
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: 'tsconfig.json', // Indicates to find the closest tsconfig.json for each source file (see https://typescript-eslint.io/packages/parser#project).
        tsconfigRootDir: import.meta.dirname,
      },
    },
    files: ['**/*.ts'],
  },
  {
    rules: {
      'no-undef': 'off',
      'no-dupe-class-members': 'off',
    },
    files: ['**/*.ts'],
  },
  {
    ignores: ['**/*.js', '**/*.mjs', 'lib/', 'node_modules/'],
  },
);
