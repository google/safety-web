# NPM binary to check for expected violations in integration tests

Usage:

```bash
yarn --silent eslint --format json | npx expected-violations <path/to/expectations.json>
```
