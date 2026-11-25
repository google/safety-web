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
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as nodePath from 'node:path';
import {$} from 'zx';
import {RepositoryImpl} from '../../src/pipeline/repository.js';
import {Logger} from '../../src/pipeline/logger.js';
import {readJsonFile} from '../../src/pipeline/reader.js';

describe('exploreRepository', () => {
  it('uses the packageManager field to determine the package manager', async () => {
    const reader = {
      readJsonFile: (_: string) =>
        Promise.resolve({
          packageManager: 'yarn@3.2.3',
        }),
    };
    const repo = new RepositoryImpl(
      'git/foo/bar',
      'https://foo.com/bar',
      reader,
      new Logger('test'),
    );
    await repo.explore();
    expect(repo.packageManagerFound?.kind).to.equal('yarn');
    expect(repo.packageManagerFound?.version).to.equal('3.2.3');
  });

  it('uses the engines field to determine the package manager', async () => {
    const reader = {
      readJsonFile: (_: string) =>
        Promise.resolve({
          engines: {
            npm: '~1.0.20',
            node: '>=0.10.3 <15',
          },
        }),
    };
    const repo = new RepositoryImpl(
      'git/foo/bar',
      'https://foo.com/bar',
      reader,
      new Logger('test'),
    );
    await repo.explore();
    expect(repo.packageManagerFound?.kind).to.equal('npm');
    expect(repo.packageManagerFound?.version).to.equal('~1.0.20');
  });

  it('return undefined fields when an unknown package manager is required', async () => {
    const reader = {
      readJsonFile: (_: string) =>
        Promise.resolve({
          name: 'foo',
          packageManager: 'superLitManager@13.3.7',
        }),
    };
    const repo = new RepositoryImpl(
      'git/foo/bar',
      'https://foo.com/bar',
      reader,
      new Logger('test'),
    );
    await repo.explore();
    expect(repo.packageManagerFound?.kind).to.equal('UNKNOWN_KIND');
    expect(repo.packageManagerFound?.version).to.equal('UNKNOWN_VERSION');
  });
});

interface RecordedInvocation {
  argv: string[];
  cwd: string;
  env: Record<string, string | undefined>;
}

describe('installRepository security', () => {
  let tempDir: string;
  let repoDir: string;
  let trustedBinDir: string;
  let invocationFile: string;
  let hijackedFile: string;
  let originalZxPath: string | undefined;
  let originalProcessCwd: string;

  beforeEach(async () => {
    originalZxPath = $.env['PATH'];
    originalProcessCwd = process.cwd();
    tempDir = await fs.mkdtemp(nodePath.join(os.tmpdir(), 'safety-web-repo-'));
    repoDir = nodePath.join(tempDir, 'cloned-repo');
    trustedBinDir = nodePath.join(tempDir, 'trusted-bin');
    invocationFile = nodePath.join(tempDir, 'invocation.json');
    hijackedFile = nodePath.join(tempDir, 'hijacked.txt');

    await fs.mkdir(nodePath.join(repoDir, 'node_modules', '.bin'), {
      recursive: true,
    });
    await fs.mkdir(trustedBinDir, {recursive: true});

    // Place a malicious `corepack` binary inside the untrusted cloned repo's
    // `./node_modules/.bin` to verify relative PATH entries cannot hijack execution.
    const maliciousCorepack = nodePath.join(
      repoDir,
      'node_modules',
      '.bin',
      'corepack',
    );
    await fs.writeFile(
      maliciousCorepack,
      `#!/usr/bin/env node\nrequire('node:fs').writeFileSync(${JSON.stringify(hijackedFile)}, 'hijacked');\nprocess.exit(0);\n`,
      {mode: 0o755},
    );

    // Place a trusted `corepack` recorder in an absolute directory on PATH.
    const trustedCorepack = nodePath.join(trustedBinDir, 'corepack');
    await fs.writeFile(
      trustedCorepack,
      `#!/usr/bin/env node\nrequire('node:fs').writeFileSync(${JSON.stringify(invocationFile)}, JSON.stringify({argv: process.argv.slice(2), cwd: process.cwd(), env: process.env}));\nprocess.exit(0);\n`,
      {mode: 0o755},
    );

    $.env['PATH'] =
      `./node_modules/.bin${nodePath.delimiter}${trustedBinDir}${nodePath.delimiter}${originalZxPath ?? ''}`;
  });

  afterEach(async () => {
    process.chdir(originalProcessCwd);
    if (originalZxPath === undefined) {
      delete $.env['PATH'];
    } else {
      $.env['PATH'] = originalZxPath;
    }
    await fs.rm(tempDir, {recursive: true, force: true});
  });

  const testCases: Array<{
    name: string;
    packageJson: Record<string, unknown>;
    expectedArgv: string[];
  }> = [
    {
      name: 'npm explicit version suppresses lifecycle scripts without corepack use',
      packageJson: {
        name: 'untrusted-npm',
        packageManager: 'npm@10.8.2',
        scripts: {preinstall: 'echo PWNED'},
      },
      expectedArgv: ['npm@10.8.2', 'install', '--ignore-scripts'],
    },
    {
      name: 'pnpm explicit version suppresses lifecycle scripts and pnpmfile',
      packageJson: {
        name: 'untrusted-pnpm',
        packageManager: 'pnpm@9.9.0',
        scripts: {preinstall: 'echo PWNED'},
      },
      expectedArgv: [
        'pnpm@9.9.0',
        'install',
        '--ignore-scripts',
        '--ignore-pnpmfile',
      ],
    },
    {
      name: 'yarn classic version passes --ignore-scripts',
      packageJson: {
        name: 'untrusted-yarn1',
        packageManager: 'yarn@1.22.22',
        scripts: {preinstall: 'echo PWNED'},
      },
      expectedArgv: ['yarn@1.22.22', 'install', '--ignore-scripts'],
    },
    {
      name: 'yarn berry version passes --mode=skip-build',
      packageJson: {
        name: 'untrusted-yarn-berry',
        packageManager: 'yarn@4.4.0',
        scripts: {preinstall: 'echo PWNED'},
      },
      expectedArgv: ['yarn@4.4.0', 'install', '--mode=skip-build'],
    },
    {
      name: 'unknown or missing packageManager defaults to npm@latest with --ignore-scripts',
      packageJson: {
        name: 'untrusted-default',
        scripts: {preinstall: 'echo PWNED'},
      },
      expectedArgv: ['npm@latest', 'install', '--ignore-scripts'],
    },
    {
      name: 'engines semver range resolves to known version with --ignore-scripts',
      packageJson: {
        name: 'untrusted-engines',
        engines: {npm: '^10.0.0'},
      },
      expectedArgv: ['npm@10.8.2', 'install', '--ignore-scripts'],
    },
    {
      name: 'unresolvable yarn engines range falls back to yarn@latest with --mode=skip-build',
      packageJson: {
        name: 'untrusted-yarn-unresolvable',
        engines: {yarn: '>=99.0.0'},
      },
      expectedArgv: ['yarn@latest', 'install', '--mode=skip-build'],
    },
  ];

  for (const tc of testCases) {
    it(tc.name, async () => {
      await fs.writeFile(
        nodePath.join(repoDir, 'package.json'),
        JSON.stringify(tc.packageJson),
      );

      const repo = new RepositoryImpl(
        repoDir,
        'https://example.com/untrusted.git',
        {readJsonFile},
        new Logger('test-install'),
      );
      const exploreErr = await repo.explore();
      expect(exploreErr).to.equal(undefined);

      const installErr = await repo.install();
      expect(installErr).to.equal(undefined);

      // Untrusted `./node_modules/.bin/corepack` must never be executed.
      const hijackedExists = await fs
        .access(hijackedFile)
        .then(() => true)
        .catch(() => false);
      expect(hijackedExists).to.equal(false);

      // Process working directory must not remain inside the untrusted clone.
      expect(process.cwd()).to.equal(originalProcessCwd);

      const recorded = JSON.parse(
        await fs.readFile(invocationFile, 'utf-8'),
      ) as RecordedInvocation;
      expect(recorded.argv).to.deep.equal(tc.expectedArgv);
      expect(await fs.realpath(recorded.cwd)).to.equal(
        await fs.realpath(repoDir),
      );
      expect(recorded.env['npm_config_ignore_scripts']).to.equal('true');
      expect(recorded.env['YARN_ENABLE_SCRIPTS']).to.equal('false');
      expect(recorded.env['YARN_IGNORE_PATH']).to.equal('true');
      expect(recorded.env['YARN_RC_FILENAME']).to.equal(
        '.safety-web-empty-yarnrc.yml',
      );
      expect(recorded.env['YARN_NODE_LINKER']).to.equal('node-modules');
      expect(recorded.env['COREPACK_ENABLE_AUTO_PIN']).to.equal('0');
      expect(recorded.env['COREPACK_ENABLE_PROJECT_SPEC']).to.equal('0');

      const pathEntries = (recorded.env['PATH'] ?? '').split(
        nodePath.delimiter,
      );
      expect(pathEntries.length).to.be.greaterThan(0);
      for (const entry of pathEntries) {
        expect(nodePath.isAbsolute(entry)).to.equal(true);
      }
    });
  }

  it('prevents git clone option injection when url starts with a dash', async () => {
    const markerFile = nodePath.join(tempDir, 'upload-pack-pwned.txt');
    const cloneResult = await RepositoryImpl.clone(
      tempDir,
      `--upload-pack=touch ${markerFile}`,
      {readJsonFile},
      new Logger('test-clone'),
    );
    expect(cloneResult).to.be.instanceOf(Error);
    const markerExists = await fs
      .access(markerFile)
      .then(() => true)
      .catch(() => false);
    expect(markerExists).to.equal(false);
  });
});
