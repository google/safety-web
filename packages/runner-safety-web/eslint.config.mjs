import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import {commonMonorepoConfig} from '../../eslint-common.config.mjs';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  // Disabled until the header plugin is compatible with ESLint 9
  // commonMonorepoConfig,
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
      // Ignores unused variables named "_"
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          'argsIgnorePattern': '_',
          'varsIgnorePattern': '_',
          'caughtErrorsIgnorePattern': '_',
        },
      ],
      'no-undef': 'off',
      'no-dupe-class-members': 'off',
    },
    files: ['**/*.ts'],
  },
  {
    ignores: ['**/*.js', '**/*.mjs', 'bin/', 'node_modules/'],
  },
);
