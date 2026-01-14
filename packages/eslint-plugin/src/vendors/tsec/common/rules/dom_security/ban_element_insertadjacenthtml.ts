// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {Allowlist} from '../../third_party/tsetse/allowlist';
import {Checker} from '../../third_party/tsetse/checker';
import {ErrorCode} from '../../third_party/tsetse/error_code';
import {AbstractRule} from '../../third_party/tsetse/rule';
import {shouldExamineNode} from '../../third_party/tsetse/util/ast_tools';
import {isExpressionOfAllowedTrustedType} from '../../third_party/tsetse/util/is_trusted_type';
import {PropertyMatcher} from '../../third_party/tsetse/util/property_matcher';
import {TRUSTED_HTML} from '../../third_party/tsetse/util/trusted_types_configuration';
import * as ts from 'typescript';

import {RuleConfiguration} from '../../rule_configuration';

const BANNED_PROPERTY = 'Element.prototype.insertAdjacentHTML';

let errMsg = 'Do not use Element#insertAdjacentHTML, as this can lead to XSS.';

/**
 * Checks if insertAdjacentHTML is called with a TrustedHTML value.
 * The second argument (index 1) must be TrustedHTML.
 */
function isCalledWithTrustedHTML(n: ts.Node, tc: ts.TypeChecker): boolean {
  const par = n.parent;
  // Check if this is a call expression
  if (!ts.isCallExpression(par) || par.expression !== n) return false;
  // insertAdjacentHTML needs at least 2 arguments
  if (par.arguments.length < 2) return false;

  // Check if the second argument (the HTML string) is TrustedHTML
  return isExpressionOfAllowedTrustedType(tc, par.arguments[1], TRUSTED_HTML);
}

function checkNode(
  tc: ts.TypeChecker,
  n: ts.PropertyAccessExpression | ts.ElementAccessExpression,
  matcher: PropertyMatcher,
): ts.Node | undefined {
  if (!shouldExamineNode(n)) return;
  if (!matcher.typeMatches(tc.getTypeAtLocation(n.expression))) return;
  if (isCalledWithTrustedHTML(n, tc)) return;
  return n;
}

/**
 * A Rule that looks for use of Element#insertAdjacentHTML method.
 */
export class Rule extends AbstractRule {
  static readonly RULE_NAME = 'ban-element-insertadjacenthtml';
  readonly ruleName = Rule.RULE_NAME;
  readonly code = ErrorCode.CONFORMANCE_PATTERN;

  private readonly propMatcher: PropertyMatcher;
  private readonly allowlist?: Allowlist;

  constructor(configuration: RuleConfiguration = {}) {
    super();
    this.propMatcher = PropertyMatcher.fromSpec(BANNED_PROPERTY);
    if (configuration?.allowlistEntries) {
      this.allowlist = new Allowlist(configuration?.allowlistEntries);
    }
  }

  register(checker: Checker) {
    checker.onNamedPropertyAccess(
      this.propMatcher.bannedProperty,
      (c, n) => {
        const node = checkNode(c.typeChecker, n, this.propMatcher);
        if (node) {
          checker.addFailureAtNode(
            node,
            errMsg,
            Rule.RULE_NAME,
            this.allowlist,
          );
        }
      },
      this.code,
    );

    checker.onStringLiteralElementAccess(
      this.propMatcher.bannedProperty,
      (c, n) => {
        const node = checkNode(c.typeChecker, n, this.propMatcher);
        if (node) {
          checker.addFailureAtNode(
            node,
            errMsg,
            Rule.RULE_NAME,
            this.allowlist,
          );
        }
      },
      this.code,
    );
  }
}
