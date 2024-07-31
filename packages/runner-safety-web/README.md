# runner-safety-web

A NodeJS binary that wraps ESLint and safety-web. `runner-safety-web` makes it
easier to scan a project that is not yet setup with ESLint. It:

- Uses heuristics to determine the project structure
- Generate an eslint config and tsconfig if needed
- Invokes ESLint with safety-web on the codebase

## Usage

```bash
npm exec runner-safety-web run --rootDir path/to/repository_to_scan
```
