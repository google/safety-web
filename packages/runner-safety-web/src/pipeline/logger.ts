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

const logs: string[] = [];

/**
 * Record a log in the global log table.
 */
export function recordLog(log: string) {
  logs.push(log);
}

/**
 * console.log a log and record it in the global log table.
 */
export function logAndRecord(log: string) {
  recordLog(log);
  console.log(log);
}
