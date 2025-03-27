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
import {
  ConfidenceLevel,
  ExemptionType,
  PackageSummary,
  Violation,
} from '@safety-web/types';

const SAFETY_WEB_RULE_NAME = 'safety-web/trusted-types-checks';

export const format: ESLint.Formatter['format'] = function (
  results: ESLint.LintResult[],
): string {
  return JSON.stringify(formatToObject(results), null, 2);
};

export const formatToObject = function (
  results: ESLint.LintResult[],
): PackageSummary {
  const safetyWebSummary: PackageSummary = {
    packageName: 'TODO',
    packageVersion: '0.0.1.TODO',
    packagePath: 'TODO',
    summaryVersion: 'TODO',
    violations: [],
  };

  for (const fileResult of results) {
    for (const lintMessage of [
      ...fileResult.messages,
      ...fileResult.suppressedMessages,
    ]) {
      const violation = createViolation(lintMessage, fileResult.filePath);
      if (lintMessage.ruleId === SAFETY_WEB_RULE_NAME) {
        safetyWebSummary.violations.push(violation);
      }
    }
  }

  return safetyWebSummary;
};

function createViolation(
  lintMessage: Linter.LintMessage | Linter.SuppressedLintMessage,
  path: string,
): Violation {
  const violation: Violation = {
    ruleId: lintMessage.ruleId,
    confidence: ConfidenceLevel.VIOLATION, // TODO populate from the LintMessage
    category: 'TODO',
    location: {
      filepath: path,
      line: lintMessage.line,
      column: lintMessage.column,
      endLine: lintMessage.endLine,
      endColumn: lintMessage.endColumn,
    },
  };
  if (isSuppressedLintMessage(lintMessage)) {
    violation.exemption = {
      type: ExemptionType.ESLINT_SILENCED,
      justification: isSuppressedLintMessage(lintMessage)
        ? lintMessage.suppressions.map((e) => e.justification).join(' | ')
        : 'NO JUSTIFICATION',
    };
  }
  return violation;
}

function isSuppressedLintMessage(
  message: Linter.LintMessage | Linter.SuppressedLintMessage,
): message is Linter.SuppressedLintMessage {
  return Array.isArray((message as Linter.SuppressedLintMessage).suppressions);
}
