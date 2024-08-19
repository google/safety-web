# safety-web - ESLint plugin for Trusted Types and CSP compatibility

**This is not an officially supported Google product.**

**This project is under development and is not ready for production yet.**

eslint-plugin-safety-web (aka. safety-web in short) is an ESLint plugin that
works on TypeScript and JavaScript projects and surfaces security issues like
Trusted Types violations statically. This repository contains several packages.
Refer to the package specific READMEs for more information. The eslint-plugin
sources live in
[`packages/eslint-plugin-safety-web/`](./packages/eslint-plugin-safety-web).

## Development

This project uses yarn "modern" Berry (Yarn 4) with workspaces, and Node
`"^20.11.0 || >21.2.0"`. To install the dependencies for all
[workspaces](https://yarnpkg.com/features/workspaces):

```bash
yarn
```

The commands `clean`, `build`, `lint`, `test` are defined in all workspaces.
This makes it possible to run them in all workspaces:

```bash
# Build all workspaces
yarn workspaces foreach --all run build
```

```bash
# Build-watch all TypeScript workspaces in parallel
yarn workspaces foreach -Ap run build:watch
```

To format the repository:

```bash
yarn format
# prettier . --write
```

## safety-web unit testing

```bash
yarn workspace eslint-plugin-safety-web run test
```

## unit tests + integrations tests

```bash
yarn run unit_tests
```

## Updating tsetse

The core logic behind this plugin is re-used from
[tsec](https://github.com/google/tsec). The
[`common`](https://github.com/google/tsec/tree/main/common) directory of tsec is
mirrored in `packages/eslint-plugin-safety-web/src/common`, as vendored
dependency.

Run tsetse_update.sh to pull the latest version of tsetse in:

```bash
bash update_tsetse.sh
```
