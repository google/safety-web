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

const SAFETY_WEB_RULE_NAME = 'safety-web/trusted-types-checks';

export interface SafetyWebSummary {
  cwd: string;
  violations: Array<Violation>;
  silencedViolations: Array<Violation>;
  otherErrors: Array<Violation>;
  otherWarnings: Array<Violation>;
  safetyWebViolations: number;
  safetyWebSilencedViolations: number;
  warnings: number;
  errors: number;
  // TODO: add other metrics on other errors like tsconfigs used, typechecking
  // errors, ...
}

export interface Violation {
  message: string;
  ruleId: string;
  filePath: string;
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
  link: string;
  justification?: string;
  snippet: string;
}

function formatFileLink(
  filePath: string,
  line: number,
  column: number,
): string {
  return `file://${filePath}:${line}:${column}`;
}

export const format: ESLint.Formatter['format'] = function (
  results: ESLint.LintResult[],
  context: ESLint.LintResultData,
): string {
  return JSON.stringify(formatToObject(results, context), null, 2);
};

export const formatToObject = function (
  results: ESLint.LintResult[],
  context: ESLint.LintResultData,
): SafetyWebSummary {
  const safetyWebSummary: SafetyWebSummary = {
    cwd: context?.cwd,
    violations: [],
    silencedViolations: [],
    otherErrors: [],
    otherWarnings: [],
    safetyWebViolations: 0,
    safetyWebSilencedViolations: 0,
    warnings: 0,
    errors: 0,
  };

  for (const fileResult of results) {
    for (const lintMessage of fileResult.messages) {
      const violation = createViolation(lintMessage, fileResult.filePath);
      if (lintMessage.ruleId === SAFETY_WEB_RULE_NAME) {
        safetyWebSummary.violations.push(violation);
        safetyWebSummary.safetyWebViolations += 1;
      } else {
        safetyWebSummary.otherErrors.push(violation);
      }
    }
    for (const lintMessage of fileResult.suppressedMessages) {
      const violation = createViolation(lintMessage, fileResult.filePath);
      if (lintMessage.ruleId === SAFETY_WEB_RULE_NAME) {
        safetyWebSummary.silencedViolations.push(violation);
        safetyWebSummary.safetyWebSilencedViolations += 1;
      } else {
        safetyWebSummary.otherErrors.push(violation);
      }
    }
    safetyWebSummary.warnings += fileResult.warningCount;
    safetyWebSummary.errors += fileResult.errorCount;
  }

  return safetyWebSummary;
};

function createViolation(
  lintMessage: Linter.LintMessage | Linter.SuppressedLintMessage,
  path: string,
): Violation {
  const violation: Violation = {
    message: lintMessage.message,
    ruleId: lintMessage.ruleId,
    filePath: path,
    line: lintMessage.line,
    column: lintMessage.column,
    endLine: lintMessage.endLine,
    endColumn: lintMessage.endColumn,
    link: formatFileLink(path, lintMessage.line, lintMessage.column),
    snippet: 'TODO',
  };
  if (isSuppressedLintMessage(lintMessage)) {
    violation.justification =
      lintMessage.suppressions.map((e) => e.justification).join(' | ') ||
      'NO JUSTIFICATION';
  }
  return violation;
}

function isSuppressedLintMessage(
  message: Linter.LintMessage | Linter.SuppressedLintMessage,
): message is Linter.SuppressedLintMessage {
  return Array.isArray((message as Linter.SuppressedLintMessage).suppressions);
}
