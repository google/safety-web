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

import {expect} from 'chai';
import {Volume} from 'memfs';
import {exploreRepository} from '../src/repository.js';
import * as fs from 'node:fs';

const multiPackageRepository = Volume.fromJSON({
  '/repository_root/package.json': `{
  "private": true,
  "workspaces": [
    "packages/**"
  ],
}`,
  '/repository_root/packages/foo/package.json': `{
  "name": "foo",
  "version": "0.0.1",
}`,
  '/repository_root/packages/bar/package.json': `{
  "name": "bar",
  "version": "0.0.1",
}`,
  '/repository_root/packages/utils/baz/package.json': `{
  "name": "@utils/baz",
  "version": "0.0.1",
}`,
});

describe('repository', () => {
  it('finds nested packages under the root directory', async () => {
    const packages = await exploreRepository(
      '/repository_root',
      multiPackageRepository as unknown as typeof fs,
    );
    const relativPaths = [...packages].map((p) => p.relativePath);
    expect(relativPaths).to.have.members([
      '', // TODO private packages should not be surfaced in future iterations.
      'packages/foo',
      'packages/bar',
      'packages/utils/baz',
    ]);
  });

  // it('ignore packages that are private', async () => {
  //   expect('foo').to.have.property('bar');
  // });
});
