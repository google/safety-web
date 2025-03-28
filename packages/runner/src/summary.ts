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

import {PackageSummary, Violation} from '@safety-web/types';
import {Repository} from './repository.js';
import * as path from 'node:path';

export function createSummaries(
  allViolations: Violation[],
  repository: Repository,
): Set<PackageSummary> {
  const summaries = new Set<PackageSummary>();

  for (const pack of repository.packages) {
    const summary: PackageSummary = {
      summaryVersion: 'TODO-0.0.1',
      packageName: pack.name,
      packageVersion: pack.version,
      packagePath: pack.relativePath,
      repository: {
        url: repository.url,
        commitId: repository.commitId,
      },
      violations: undefined,
    };
    addViolations(summary, allViolations);
    summaries.add(summary);
  }
  return summaries;
}

function addViolations(summary: PackageSummary, violations: Violation[]) {
  const packagePath = path.normalize(summary.packagePath);
  summary.violations = violations.filter((v) =>
    path.normalize(v.location.filePath).startsWith(packagePath),
  );
}
