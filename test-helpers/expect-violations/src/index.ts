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

import { expect } from 'chai';
import fs from 'node:fs';
import type { ViolationReport } from './violations.js';
import * as path from 'path';

function main() {
  const argv = process.argv;
  // TODO process with Yargs as more flags are added.
  if (argv.length !== 3) {
    console.error('Usage: <eslint JSON output> | npx expect-violations <path/to/expectated_violations.json>');
    return;
  }
  const expectatedViolationReportPath = argv[2];
  const expectedViolationReport = getExpectedViolations(expectatedViolationReportPath) as ViolationReport;
  const actualESLintReport = JSON.parse(fs.readFileSync(0).toString()) as ViolationReport; // STDIN_FILENO = 0
  const canonicalizedReport = canonicalizeViolationReport(actualESLintReport);


  expect(canonicalizedReport).to.deep.equal(expectedViolationReport);

}

function canonicalizeViolationReport(report: ViolationReport): ViolationReport {
  const canonicalizedReport = [];
  for (const fileEntry of report) {
    if (fileEntry.messages.length !== 0) {
      canonicalizedReport.push({
        filePath: canonicalizePath(fileEntry.filePath),
        messages: fileEntry.messages.map(({ ruleId, message, line, column, messageId, endLine, endColumn, }) => ({ ruleId, message, line, column, messageId, endLine, endColumn, }))
      });
    }
  }
  return canonicalizedReport;
}

function canonicalizePath(filePath: string): string {
  // This is not enough to identity the file, but it's good enough in the test to compare ouputs.
  return `[...]/${path.basename(filePath)}`;
}

function getExpectedViolations(path: string) {
  try {
    const jsonViolations = fs.readFileSync(path, 'utf8');
    return JSON.parse(jsonViolations);
  } catch (err) {
    console.error(err);
  }
}

main();
