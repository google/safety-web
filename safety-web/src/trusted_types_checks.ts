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

import { ESLintUtils } from '@typescript-eslint/utils';
import { getConfiguredChecker } from './common/configured_checker';
import { Checker } from './common/third_party/tsetse/checker';
import * as ts from 'typescript';
import { tsetseMessageToMessageId, messageIdMap } from './tsetse_compat';

const createRule = ESLintUtils.RuleCreator(
  () => 'safety-web',
);

// Cached checker instantiated only once.
let checker: Checker;

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
      ...messageIdMap,
      unknown_rule_triggered: 'trusted-types-checks reported a violation that could not be mapped to a known violation id.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    // Skip checking declaration files
    if (context.filename.endsWith('.d.ts')) {
      return {};
    }

    const parserServices = ESLintUtils.getParserServices(context);
    if (!checker) {
      checker = getConfiguredChecker(
        parserServices.program,
        ts.createCompilerHost(parserServices.program.getCompilerOptions()),
      ).checker;
    }
    return {
      Program(node) {
        const parserServices = ESLintUtils.getParserServices(context);
        const rootNode = parserServices.esTreeNodeToTSNodeMap.get(node);

        // Run all enabled checks
        const { failures } = checker.execute(rootNode, true);

        // Report the detected errors
        for (const failure of failures) {
          const diagnostic = failure.toDiagnostic();
          const start = ts.getLineAndCharacterOfPosition(
            rootNode,
            diagnostic.start,
          );
          const end = ts.getLineAndCharacterOfPosition(
            rootNode,
            diagnostic.end,
          );

          context.report({
            loc: {
              start: { line: start.line + 1, column: start.character },
              end: { line: end.line + 1, column: end.character },
            },
            messageId: tsetseMessageToMessageId(
              // TODO: refine `toDiagnostic` to refine type and remove this cast.
              diagnostic.messageText as string) || 'unknown_rule_triggered',
            data: {
              tsetseMessage: diagnostic.messageText
            }
          });
        }
      },
    };
  }
});
