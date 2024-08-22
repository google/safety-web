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

import {expect} from 'chai';
import {ESLint} from 'eslint';
import * as safetyWebFormatter from '../src/index.js';

describe('eslint-formatter-safety-web', () => {
  const results: ESLint.LintResult[] = [
    {
      filePath: '/path/to/file_with_no_error.js',
      messages: [],
      suppressedMessages: [],
      errorCount: 0,
      fatalErrorCount: 0,
      warningCount: 0,
      fixableErrorCount: 0,
      fixableWarningCount: 0,
      usedDeprecatedRules: [],
    },
    {
      filePath: '/path/to/file_with_safety_web_errors.ts',
      messages: [
        {
          ruleId: 'safety-web/trusted-types-checks',
          severity: 2,
          message:
            '[ban-element-innerhtml-assignments] Assigning directly to Element#innerHTML can result in XSS vulnerabilities.',
          line: 3,
          column: 1,
          nodeType: null,
          messageId: 'ban_element_innerhtml_assignments',
          endLine: 3,
          endColumn: 22,
        },
        {
          ruleId: 'safety-web/trusted-types-checks',
          severity: 2,
          message:
            '[ban-element-outerhtml-assignments] Assigning directly to Element#outerHTML can result in XSS vulnerabilities.',
          line: 4,
          column: 1,
          nodeType: null,
          messageId: 'ban_element_outerhtml_assignments',
          endLine: 4,
          endColumn: 25,
        },
      ],
      suppressedMessages: [],
      errorCount: 2,
      fatalErrorCount: 0,
      warningCount: 0,
      fixableErrorCount: 0,
      fixableWarningCount: 0,
      source:
        "const foo = 'hello world';\nconst myDiv = document.createElement('div');\nmyDiv.innerHTML = foo;\nmyDiv.outerHTML = 'ciao';\n",
      usedDeprecatedRules: [],
    },
    {
      filePath: '/path/to/file_with_safety_web_errors_silenced.ts',
      messages: [
        {
          ruleId: 'safety-web/trusted-types-checks',
          severity: 2,
          message:
            '[ban-element-innerhtml-assignments] Assigning directly to Element#innerHTML can result in XSS vulnerabilities.',
          line: 3,
          column: 1,
          nodeType: null,
          messageId: 'ban_element_innerhtml_assignments',
          endLine: 3,
          endColumn: 22,
        },
      ],
      suppressedMessages: [
        {
          ruleId: 'safety-web/trusted-types-checks',
          severity: 2,
          message:
            '[ban-element-outerhtml-assignments] Assigning directly to Element#outerHTML can result in XSS vulnerabilities.',
          line: 5,
          column: 1,
          nodeType: null,
          messageId: 'ban_element_outerhtml_assignments',
          endLine: 5,
          endColumn: 25,
          suppressions: [
            {
              kind: 'directive',
              justification: 'This is a legacy violation.',
            },
          ],
        },
      ],
      errorCount: 1,
      fatalErrorCount: 0,
      warningCount: 0,
      fixableErrorCount: 0,
      fixableWarningCount: 0,
      source:
        "const foo = 'hello world';\nconst myDiv = document.createElement('div');\nmyDiv.innerHTML = foo;\n// eslint-disable-next-line safety-web/trusted-types-checks -- This is a legacy violation.\nmyDiv.outerHTML = 'ciao';\n",
      usedDeprecatedRules: [],
    },
    {
      filePath: '/path/to/file_with_other_errors.ts',
      messages: [
        {
          ruleId: null,
          severity: 2,
          message: 'Parsing error: X was not found by the project service.',
          line: undefined,
          column: undefined,
          fatal: true,
          nodeType: null,
        },
      ],
      suppressedMessages: [],
      errorCount: 1,
      fatalErrorCount: 1,
      warningCount: 0,
      fixableErrorCount: 0,
      fixableWarningCount: 0,
      source: 'something();',
      usedDeprecatedRules: [],
    },
  ];

  const formattedResults = safetyWebFormatter.formatToObject(
    results,
    undefined,
  );

  it('only lists safety-web errors', () => {
    expect(formattedResults.violations).has.length(3);
    formattedResults.violations.forEach((violation) => {
      expect(violation.ruleId).equals('safety-web/trusted-types-checks');
    });
  });

  it('lists safety-web silenced violations with their justification', () => {
    expect(formattedResults.silencedViolations).has.length(1);
    expect(formattedResults.silencedViolations[0].filePath).equals(
      '/path/to/file_with_safety_web_errors_silenced.ts',
    );
    expect(formattedResults.silencedViolations[0].justification).equals(
      'This is a legacy violation.',
    );
  });

  it('lists other errors in a separate list', () => {
    expect(formattedResults.otherErrors).has.length(1);
    expect(formattedResults.otherErrors[0].filePath).equals(
      '/path/to/file_with_other_errors.ts',
    );
    expect(formattedResults.otherErrors[0].message).equals(
      'Parsing error: X was not found by the project service.',
    );
  });
});
