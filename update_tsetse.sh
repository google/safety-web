# Copyright 2024 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

#!/bin/bash

SAFETY_WEB_GIT_ROOT="$(dirname $0)"
LOG_FILE="${SAFETY_WEB_GIT_ROOT}/packages/eslint-plugin-safety-web/update_tsetse_logs.txt"

## Update the vendored copy of tsetse, from the latest tsec commit.
TMPDIR="$(mktemp -d)"
trap 'rm -rf -- "$TMPDIR"' EXIT
git clone https://github.com/google/tsec.git "${TMPDIR}"
rm -rf "${SAFETY_WEB_GIT_ROOT}/packages/eslint-plugin-safety-web/src/common"
cp -r "${TMPDIR}/common/" "${SAFETY_WEB_GIT_ROOT}/packages/eslint-plugin-safety-web/src/"

echo \
"Most recent run of update_tsetse.sh: $(date)
---
Most recent tsetse commit (from https://github.com/google/tsec.git):" > $LOG_FILE
git -C "${TMPDIR}/" log -n 1 >> $LOG_FILE
