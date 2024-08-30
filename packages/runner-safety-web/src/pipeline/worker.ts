#!/usr/bin/env node
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

import {workerData, parentPort} from 'node:worker_threads';
import {run} from '../runner.js';
import {Summary} from 'types-safety-web';

function postToParent(workerMessage: WorkerSuccess | WorkerError) {
  parentPort.postMessage(workerMessage);
}

export interface WorkerSuccess {
  type: 'success';
  summary: Summary;
  rootDir: string;
}

export interface WorkerError {
  type: 'error';
  message: string;
  rootDir: string;
}

export async function workerMain(rootDir: string) {
  const summary = await run(rootDir);
  postToParent({type: 'success', summary, rootDir});
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
workerMain(workerData.rootDir as string).catch((error: Error) => {
  process.exitCode = 1;
  console.error(
    `### Worker top-level error: ${error.message} -- ${error.stack}`,
  );
  postToParent({
    type: 'error',
    message: `${error.message} -- ${error.stack}`,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    rootDir: workerData.rootDir as string,
  });
});
