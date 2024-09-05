// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {$, ProcessOutput} from 'zx';
import {Logger} from './logger.js';

$.verbose = true;

export class CommandRunner {
  constructor(private readonly logger: Logger) {}

  /**
   * Small wrapper around zx's $ that also logs the result of the command and not
   * throw.
   * This should be called as a template string function: runCommand`foo ${bar}`
   */
  async run(
    templateObj: TemplateStringsArray,
    ...rest: string[]
  ): Promise<ProcessOutput> {
    let command = templateObj[0];
    for (let i = 0; i < rest.length; i += 1) {
      command += rest[i] + templateObj[i + 1];
    }
    this.logger.log(command, {silent: true});

    // Use .pipe to stream the command output to stdout in real time.
    const output = await $(templateObj, ...rest)
      .pipe(process.stdout)
      .nothrow();
    const textOutput = output.text();
    if (!hasSucceeded(output)) {
      this.logger.log(`Failed! exit code: ${output.exitCode}`);
    }
    if (textOutput.length !== 0) {
      this.logger.log(textOutput, {silent: true});
    }
    return output;
  }
}

/**
 * @param output zx's command output
 * @returns true of the output's exit code is 0. False otherwise.
 */
export function hasSucceeded(output: ProcessOutput): boolean {
  return output.exitCode === 0;
}
