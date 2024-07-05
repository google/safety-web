# safety-web - ESLint plugin for Trusted Types and CSP compatibility

**This is not an officially supported Google product.**

**This project is under development and is not ready for production yet.**

safety-web is an ESLint plugin that works on TypeScript and JavaScript projects and surfaces security issues like Trusted Types violations statically.

## Development

```
yarn install
yarn workspace safety-web build
```

## Unit testing

```
yarn workspace safety-web test
```

## Updating tsetse

The core logic behind this plugin is re-used from [tsec](https://github.com/google/tsec). The [`common`](https://github.com/google/tsec/tree/main/common) directory of tsec is mirrored in `safety-web/src/common`, as vendored dependency.

Run tsetse_update.sh to pull the latest version of tsetse in:

```bash
bash update_tsetse.sh
```
