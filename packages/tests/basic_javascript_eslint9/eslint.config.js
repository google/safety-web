import tseslint from 'typescript-eslint';
import safetyWeb from 'eslint-plugin-safety-web';

export default [
  {
    plugins: {
      'safety-web': safetyWeb,
    },
    rules: {
      'safety-web/trusted-types-checks': 'error',
    },
    files: ['**/*.ts', '**/*.js'],
    ignores: ['eslint.config.js'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        allowDefaultProject: ['**/*.js'],
      },
    },
  },
];
