# eslint-plugin-safety-web

ESLint plugin for Trusted Types and CSP compatibility in TypeScript and
JavaScript projects.

The plugin is still under development.

## Installation

With Yarn:

```bash
yarn add -D eslint-plugin-safety-web
```

or NPM:

```bash
npm install -D eslint-plugin-safety-web
```

You also need to install `typescript-eslint`.

## Setup

The plugin was verified to work with ESLint 8 and 9. It wasn't tested on older
versions but may work.

### ESLint config

If you're using an ESLint
[flat config](https://eslint.org/docs/latest/use/configure/configuration-files),
add the following fields:

```javascript
import tseslint from 'typescript-eslint';
import safetyWeb from 'eslint-plugin-safety-web';

export default tseslint.config(
  {
    // ...,
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        EXPERIMENTAL_useProjectService: true,
      },
    },
    plugins: {
      'safety-web': safetyWeb,
    },
    rules: {
      'safety-web/trusted-types-checks': 'error',
    },
    // ...,
  },
)
```

If you're using an ESLint
[classic config](https://eslint.org/docs/latest/use/configure/configuration-files-deprecated),
add the following fields:

```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    EXPERIMENTAL_useProjectService: true,
  },
  plugins: [
    'eslint-plugin-safety-web',
  ],
  rules: {
    'safety-web/trusted-types-checks': 'error',
  },
};
```

You can find examples in the [tests/](../tests) directory.

### Optional: tsconfig.json

If you're setting up a TypeScript project, you should already have a
`tsconfig.json`. There's nothing else to do.

If you're setting up a JavaScript project, it's preferable to create a
`tsconfig.json`. safety-web relies on the TypeScript toolchain to extract type
information from the project. A `tsconfig.json` helps it determine your project
structure and potential compilation options. No specifying, or passing an
incorrect tsconfig.json may prevent correct type information from being
surfaced, and prevent eslint from finding certain issues.

For most project you can start with the following configuration:

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "nodenext",
    "noEmit": true,
    "lib": [
      "DOM"
    ],
    "allowJs": true,
    "checkJs": true
  },
  "include": [
    "**/*.js", "**/*.ts"
  ],
}
```

Refer to https://www.typescriptlang.org/tsconfig/ for more information on the
tsconfig.json configuration.

## Debugging

Like eslint, safety-web uses the popular
[`debug`](https://www.npmjs.com/package/debug) package to manage debug logs. You
can enable all safety-web debug logs with the environment variable
`DEBUG="safety-web:*"`.
