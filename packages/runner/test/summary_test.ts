// Copyright 2025 Google LLC
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

import {ConfidenceLevel, Violation} from '@safety-web/types';
import {Repository} from '../src/repository.js';
import {expect} from 'chai';
import {createSummaries} from '../src/summary.js';

describe('createSummaries', () => {
  const repository: Repository = {
    url: 'https://github.com/foo/bar',
    commitId: 'abcdef',
    packages: new Set([
      {
        name: 'foo',
        relativePath: 'packages/foo',
        version: '0.0.1',
      },
      {
        name: 'bar',
        relativePath: 'packages/bar',
        version: '0.0.2',
      },
    ]),
  };
  const violations: Violation[] = [
    {
      category: 'unknown',
      ruleId: 'unknown',
      confidence: ConfidenceLevel.VIOLATION,
      location: {
        filePath: 'packages/foo/src/index.js',
        line: 32,
        column: 1,
        endLine: 32,
        endColumn: 10,
      },
    },
  ];

  it('creates as many summaries as packages found in the repository', () => {
    const summaries = createSummaries(violations, repository);
    expect(summaries).to.have.lengthOf(2);
  });

  it('dispatches violations per packages depending on their path', () => {
    const summaries = createSummaries(violations, repository);
    const fooSummaryFilter = [...summaries].filter(
      (s) => s.packageName === 'foo',
    );
    expect(fooSummaryFilter).to.have.lengthOf(1);
    const fooSummary = fooSummaryFilter[0];
    expect(fooSummary.violations).to.have.lengthOf(1);

    const barSummaryFilter = [...summaries].filter(
      (s) => s.packageName === 'bar',
    );
    expect(barSummaryFilter).to.have.lengthOf(1);
    const barSummary = barSummaryFilter[0];
    expect(barSummary.violations).to.have.lengthOf(0);
  });

  it('creates the expected summary structure for a package that has violations', () => {
    const summaries = createSummaries(violations, repository);
    const fooSummary = [...summaries].filter((s) => s.packageName === 'foo')[0];
    expect(fooSummary.packageName).to.equal('foo');
    expect(fooSummary.packagePath).to.equal('packages/foo');
    expect(fooSummary.packageVersion).to.equal('0.0.1');
    expect(fooSummary.repository?.url).to.equal('https://github.com/foo/bar');
    expect(fooSummary.repository?.commitId).to.equal('abcdef');
  });
});
