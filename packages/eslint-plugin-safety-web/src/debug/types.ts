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

import * as ts from 'typescript';

/**
 * A tree representation of a type. Used in the debugging console.
 */
interface TypeTree {
  name: string;
  symbol: ts.Symbol;
  baseTypes: Array<TypeTree>;
}

/**
 * Helper functions to be used in the debugging console. Registered globally.
 */
function getTypeTree(inspectedType: ts.Type): TypeTree {
  const res = {
    name: inspectedType.getSymbol()?.getName(),
    symbol: inspectedType.getSymbol(),
    baseTypes: (inspectedType.getBaseTypes() || []).map(getTypeTree),
  };
  return res;
}

global.getTypeTree = getTypeTree;
