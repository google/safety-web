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
import {crawl, testOnlyMockFs} from '../src/repository.js';
import * as fs from 'node:fs';

const multiPackageRepository = Volume.fromJSON({
  '/repository_root/package.json': `{
  "private": true,
  "workspaces": [
    "packages/**"
  ]
}`,
  '/repository_root/packages/foo/package.json': `{
  "name": "foo",
  "version": "0.0.1"
}`,
  '/repository_root/packages/bar/package.json': `{
  "name": "bar",
  "version": "0.0.1"
}`,
  '/repository_root/packages/utils/baz/package.json': `{
  "name": "@utils/baz",
  "version": "0.0.1"
}`,
});

describe('repository', () => {
  it('finds nested packages under the root directory that are not private', async () => {
    testOnlyMockFs(multiPackageRepository as unknown as typeof fs);
    const packages = await crawl('/repository_root');
    const relativPaths = [...packages].map((p) => p.relativePath);
    // "./" is a private package so it's not expected here.
    expect(relativPaths).to.have.members([
      'packages/foo',
      'packages/bar',
      'packages/utils/baz',
    ]);
  });
});
