# safety-web - ESLint plugin for Trusted Types and CSP compatibility

**This is not an officially supported Google product.**

**This project is under development and is not ready for production yet.**

@safety-web/eslint-plugin (aka. safety-web in short) is an ESLint plugin that
works on TypeScript and JavaScript projects and surfaces security issues like
Trusted Types violations statically. This repository contains several packages.
Refer to the package specific READMEs for more information. The eslint-plugin
sources live in [`packages/eslint-plugin/`](./packages/eslint-plugin).

## Development

This project uses yarn "modern" Berry (Yarn 4) with workspaces, and Node
`"^20.11.0 || >21.2.0"`. To install the dependencies for all
[workspaces](https://yarnpkg.com/features/workspaces):

```bash
yarn
```

Scripts are defined using [Wireit](https://github.com/google/wireit). It makes
it very it to build all the packages and watch for changes. Just run :

```bash
# Build all workspaces. Rebuild the necessary steps if files are updated.
yarn run build --watch
```

To format the repository:

```bash
yarn format
```

## safety-web unit testing

```bash
yarn run unit_tests
```

## unit tests + integrations tests

```bash
yarn run test
```

## Updating tsetse

The core logic behind this plugin is re-used from
[tsec](https://github.com/google/tsec). The
[`common`](https://github.com/google/tsec/tree/main/common) directory of tsec is
mirrored in `packages/eslint-plugin/src/common`, as vendored dependency.

Run tsetse_update.sh to pull the latest version of tsetse in:

```bash
bash update_tsetse.sh
```
