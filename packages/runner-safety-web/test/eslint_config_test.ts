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
import {generateESLintOptions} from '../src/eslint_config.js';
import {ESLint} from 'eslint';

describe('eslint_config', () => {
  describe('generateESLintOptions', () => {
    describe('with no explicit tsconfig', () => {
      const options = generateESLintOptions('/root/dir', undefined);
      const eslint = new ESLint(options);

      it('uses the ts service', async () => {
        // calculateConfigForFile is untyped
        const config = (await eslint.calculateConfigForFile(
          'some_file.js',
        )) as unknown;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(config['languageOptions']['parser']['meta']['name']).to.equal(
          'typescript-eslint/parser',
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(config['languageOptions']['parserOptions']).to.have.property(
          'projectService',
        );
      });

      it('registers safety-web and the TrustedTypes rule on JavaScript files', async () => {
        const config = (await eslint.calculateConfigForFile(
          'some_file.js',
        )) as unknown;
        expect(config['plugins']).to.have.property('safety-web');
        expect(config['rules']).to.have.property(
          'safety-web/trusted-types-checks',
        );
      });

      it('registers safety-web and the TrustedTypes rule on TypeScript files', async () => {
        const config = (await eslint.calculateConfigForFile(
          'some_file.ts',
        )) as unknown;
        expect(config['plugins']).to.have.property('safety-web');
        expect(config['rules']).to.have.property(
          'safety-web/trusted-types-checks',
        );
      });
    });

    describe('with an explicit tsconfig', () => {
      const options = generateESLintOptions('/root/dir', 'my.tsconfig.json');
      const eslint = new ESLint(options);

      it('uses the actual tsconfig for a project', async () => {
        const config = (await eslint.calculateConfigForFile(
          'some_file.js',
        )) as unknown;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(config['languageOptions']['parser']['meta']['name']).to.equal(
          'typescript-eslint/parser',
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(config['languageOptions']['parserOptions']).to.have.property(
          'project',
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(config['languageOptions']['parserOptions']['project'])
          .to.be.an('array')
          .that.include('my.tsconfig.json');
      });

      it('registers safety-web and the TrustedTypes rule on JavaScript files', async () => {
        const config = (await eslint.calculateConfigForFile(
          'some_file.js',
        )) as unknown;
        expect(config['plugins']).to.have.property('safety-web');
        expect(config['rules']).to.have.property(
          'safety-web/trusted-types-checks',
        );
      });

      it('registers safety-web and the TrustedTypes rule on TypeScript files', async () => {
        const config = (await eslint.calculateConfigForFile(
          'some_file.ts',
        )) as unknown;
        expect(config['plugins']).to.have.property('safety-web');
        expect(config['rules']).to.have.property(
          'safety-web/trusted-types-checks',
        );
      });
    });
  });
});
