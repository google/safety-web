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

/** Simplified interface for the JSON array returned by ESLint with the findings. */
export type ViolationReport = Array<FileViolations>;

interface FileViolations {
  filePath: string;
  messages: Array<{
    ruleId: string;
    message: string;
    line: number;
    column: number;
    messageId: string;
    endLine: number;
    endColumn: number;
  }>;
}
