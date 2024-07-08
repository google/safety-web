#!/usr/bin/env node
import { expect } from 'chai';
import fs from 'node:fs';

function main() {
  const argv = process.argv;
  // TODO process with Yargs as more flags are added.
  if (argv.length !== 3) {
    console.error('Usage: <eslint JSON output> | npx expect-violations <path/to/expectated_violations.json>');
    return;
  }
  const expectatedViolationsPath = argv[2];
  const expectedViolations = getExpectedViolations(expectatedViolationsPath);
  const actualViolations = JSON.parse(fs.readFileSync(0).toString()); // STDIN_FILENO = 0

  expect(actualViolations).to.deep.equal(expectedViolations);

}

function getExpectedViolations(path: string) {
  try {
    const jsonViolations = fs.readFileSync(path, 'utf8');
    return JSON.parse(jsonViolations);
  } catch (err) {
    console.error(err);
  }
}

main();
