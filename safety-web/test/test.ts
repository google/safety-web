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

import { RuleTester } from '@typescript-eslint/rule-tester';
import * as mocha from 'mocha';
import { trustedTypesChecks } from '../src/trusted_types_checks';

RuleTester.afterAll = mocha.after;
const ruleTester = new RuleTester(
  {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: "./tsconfig.json",
      tsconfigRootDir: __dirname + "/test_fixtures",
      // Required for the DOM APIs to typecheck correctly.
      lib: ['dom'],
    },
  }
);

ruleTester.run('trusted-types-checks', trustedTypesChecks,
  {
    valid: [
      'const x = 1;',
    ],
    invalid: [
      {
        code: `document.createElement('script').innerHTML = 'foo';`,
        errors: [
          {
            messageId: 'ban_element_innerhtml_assignments',
          },
        ],
      },
    ],
  });
