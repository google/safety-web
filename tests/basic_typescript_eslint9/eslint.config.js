import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import safetyWeb from 'eslint-plugin-safety-web';

// https://typescript-eslint.io/getting-started/typed-linting/
export default tseslint.config(
  eslint.configs.recommended,
  // ...tseslint.configs.recommendedTypeChecked,  // TODO: for some reason enabling this breaks.
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,  // Indicates to find the closest tsconfig.json for each source file (see https://typescript-eslint.io/packages/parser#project).
        tsconfigRootDir: import.meta.dirname,
      },
    },
    files: ["**/*.ts", "**/*.js"],
    ignores: ["**/*.config.js"],
    plugins: {
      "safety-web": safetyWeb
    },
    rules: {
      "safety-web/trusted-types-checks": "error"
    }
  },
  // Disable undef in TS https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    rules: {
      'no-undef': 'off',
    },
  },
);
