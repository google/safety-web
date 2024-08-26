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
import {exploreRepository, Repository} from '../../src/pipeline/repository.js';

describe('exploreRepository', () => {
  it('populates the repository name', async () => {
    const reader = {
      readJsonFile: (_: string) => Promise.resolve({name: 'repository-name'}),
    };
    const repo = await exploreRepository('/path/to/repo/', reader);
    expect((repo as Repository).clonePath).to.equal('/path/to/repo/');
  });

  it('uses the packageManager field to determine the package manager', async () => {
    const reader = {
      readJsonFile: (_: string) =>
        Promise.resolve({
          name: 'foo',
          packageManager: 'yarn@3.2.3',
        }),
    };
    const repo = (await exploreRepository(
      '/path/to/repo/',
      reader,
    )) as Repository;
    expect(repo.packageManager.kind).to.equal('yarn');
    expect(repo.packageManager.semver).to.equal('3.2.3');
  });

  it('uses the engines field to determine the package manager', async () => {
    const reader = {
      readJsonFile: (_: string) =>
        Promise.resolve({
          name: 'foo',
          engines: {
            npm: '~1.0.20',
            node: '>=0.10.3 <15',
          },
        }),
    };
    const repo = (await exploreRepository(
      '/path/to/repo/',
      reader,
    )) as Repository;
    expect(repo.packageManager.kind).to.equal('npm');
    expect(repo.packageManager.semver).to.equal('~1.0.20');
  });

  it('return undefined fields when an unknown package manager is required', async () => {
    const reader = {
      readJsonFile: (_: string) =>
        Promise.resolve({
          name: 'foo',
          packageManager: 'superLitManager@13.3.7',
        }),
    };
    const repo = (await exploreRepository(
      '/path/to/repo/',
      reader,
    )) as Repository;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(repo.packageManager.kind).to.be.undefined;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(repo.packageManager.semver).to.be.undefined;
  });
});
