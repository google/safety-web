import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import {commonMonorepoConfig} from '../../eslint-common.config.mjs';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  commonMonorepoConfig,
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: 'tsconfig.json', // Indicates to find the closest tsconfig.json for each source file (see https://typescript-eslint.io/packages/parser#project).
        tsconfigRootDir: import.meta.dirname,
      },
    },
    files: ['**/*.ts'],
  },
  {
    rules: {
      'no-undef': 'off',
      'no-dupe-class-members': 'off',
    },
    files: ['**/*.ts'],
  },
  {
    ignores: [
      '**/*.js',
      '**/*.mjs',
      'test/test_fixtures/',
      'lib/',
      'node_modules/',
      'src/common/', // tsetse folder is linted internally.
    ],
  },
);
