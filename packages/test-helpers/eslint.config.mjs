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
        // Indicates to find the closest tsconfig.json for each source file (see
        // https://typescript-eslint.io/packages/parser#project).
        project: 'tsconfig.json',
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
    ignores: ['**/*.js', '**/*.mjs', 'bin/', 'node_modules/'],
  },
);
