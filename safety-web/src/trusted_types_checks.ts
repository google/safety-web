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

import { ESLintUtils, ParserServicesWithTypeInformation } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
    () => 'safety-web',
);

/**
 * Rule to check Trusted Types compliance
 */
export const trustedTypesChecks = createRule({
    name: 'trusted-types-checks',
    meta: {
        type: 'problem',
        docs: {
            description: 'Checks Trusted Types compliance',
            recommended: 'strict',
        },
        messages: {
            // TODO: add the list of rules
            unknown_rule_triggered: 'trusted-types-checks reported a violation that could not be mapped to a known violation id.',
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        return {
            Identifier(node) {
                // TODO: implement me
                if (node.name === 'foo') {
                    context.report({
                        node,
                        messageId: 'unknown_rule_triggered',
                        data: {
                            name: 'foo',
                        }
                    });
                }
            },
        };
    }
});
