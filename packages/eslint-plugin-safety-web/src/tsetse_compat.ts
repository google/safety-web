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

import {Rule as banBaseHrefAssignments} from './common/rules/dom_security/ban_base_href_assignments';
import {Rule as banDocumentExeccommand} from './common/rules/dom_security/ban_document_execcommand';
import {Rule as banDocumentWriteCalls} from './common/rules/dom_security/ban_document_write_calls';
import {Rule as banDocumentWritelnCalls} from './common/rules/dom_security/ban_document_writeln_calls';
import {Rule as banDomparserParsefromstring} from './common/rules/dom_security/ban_domparser_parsefromstring';
import {Rule as banElementInnerhtmlAssignments} from './common/rules/dom_security/ban_element_innerhtml_assignments';
import {Rule as banElementInsertadjacenthtml} from './common/rules/dom_security/ban_element_insertadjacenthtml';
import {Rule as banElementOuterhtmlAssignments} from './common/rules/dom_security/ban_element_outerhtml_assignments';
import {Rule as banElementSetattribute} from './common/rules/dom_security/ban_element_setattribute';
import {Rule as banEvalCalls} from './common/rules/dom_security/ban_eval_calls';
import {Rule as banFunctionCalls} from './common/rules/dom_security/ban_function_calls';
import {Rule as banIframeSrcdocAssignments} from './common/rules/dom_security/ban_iframe_srcdoc_assignments';
import {Rule as banObjectDataAssignments} from './common/rules/dom_security/ban_object_data_assignments';
import {Rule as banRangeCreatecontextualfragment} from './common/rules/dom_security/ban_range_createcontextualfragment';
import {Rule as banScriptAppendchildCalls} from './common/rules/dom_security/ban_script_appendchild_calls';
import {Rule as banScriptContentAssignments} from './common/rules/dom_security/ban_script_content_assignments';
import {Rule as banScriptSrcAssignments} from './common/rules/dom_security/ban_script_src_assignments';
import {Rule as banServiceworkercontainerRegister} from './common/rules/dom_security/ban_serviceworkercontainer_register';
import {Rule as banSharedWorkerCalls} from './common/rules/dom_security/ban_shared_worker_calls';
import {Rule as banTrustedtypesCreatepolicy} from './common/rules/dom_security/ban_trustedtypes_createpolicy';
import {Rule as banWindowStringfunctiondef} from './common/rules/dom_security/ban_window_stringfunctiondef';
import {Rule as banWorkerCalls} from './common/rules/dom_security/ban_worker_calls';
import {Rule as banWorkerImportscripts} from './common/rules/dom_security/ban_worker_importscripts';
import {Rule as banLegacyConversions} from './common/rules/unsafe/ban_legacy_conversions';
import {Rule as banReviewedConversions} from './common/rules/unsafe/ban_reviewed_conversions';

export const messageIdMap = {
  ban_base_href_assignments: '{{ tsetseMessage }}',
  ban_document_execcommand: '{{ tsetseMessage }}',
  ban_document_write_calls: '{{ tsetseMessage }}',
  ban_document_writeln_calls: '{{ tsetseMessage }}',
  ban_domparser_parsefromstring: '{{ tsetseMessage }}',
  ban_element_innerhtml_assignments: '{{ tsetseMessage }}',
  ban_element_insertadjacenthtml: '{{ tsetseMessage }}',
  ban_element_outerhtml_assignments: '{{ tsetseMessage }}',
  ban_element_setattribute: '{{ tsetseMessage }}',
  ban_eval_calls: '{{ tsetseMessage }}',
  ban_function_calls: '{{ tsetseMessage }}',
  ban_iframe_srcdoc_assignments: '{{ tsetseMessage }}',
  ban_object_data_assignments: '{{ tsetseMessage }}',
  ban_range_createcontextualfragment: '{{ tsetseMessage }}',
  ban_script_appendchild_calls: '{{ tsetseMessage }}',
  ban_script_content_assignments: '{{ tsetseMessage }}',
  ban_script_src_assignments: '{{ tsetseMessage }}',
  ban_serviceworkercontainer_register: '{{ tsetseMessage }}',
  ban_shared_worker_calls: '{{ tsetseMessage }}',
  ban_trustedtypes_createpolicy: '{{ tsetseMessage }}',
  ban_window_stringfunctiondef: '{{ tsetseMessage }}',
  ban_worker_calls: '{{ tsetseMessage }}',
  ban_worker_importscripts: '{{ tsetseMessage }}',
  ban_legacy_conversions: '{{ tsetseMessage }}',
  ban_reviewed_conversions: '{{ tsetseMessage }}',
};

export type TrustedTypeCheckMessageId = keyof typeof messageIdMap;

const ruleNameToMessageIdMap: Map<string, TrustedTypeCheckMessageId> = new Map([
  [banBaseHrefAssignments.RULE_NAME, 'ban_base_href_assignments'],
  [banDocumentExeccommand.RULE_NAME, 'ban_document_execcommand'],
  [banDocumentWriteCalls.RULE_NAME, 'ban_document_write_calls'],
  [banDocumentWritelnCalls.RULE_NAME, 'ban_document_writeln_calls'],
  [banDomparserParsefromstring.RULE_NAME, 'ban_domparser_parsefromstring'],
  [
    banElementInnerhtmlAssignments.RULE_NAME,
    'ban_element_innerhtml_assignments',
  ],
  [banElementInsertadjacenthtml.RULE_NAME, 'ban_element_insertadjacenthtml'],
  [
    banElementOuterhtmlAssignments.RULE_NAME,
    'ban_element_outerhtml_assignments',
  ],
  [banElementSetattribute.RULE_NAME, 'ban_element_setattribute'],
  [banEvalCalls.RULE_NAME, 'ban_eval_calls'],
  [banFunctionCalls.RULE_NAME, 'ban_function_calls'],
  [banIframeSrcdocAssignments.RULE_NAME, 'ban_iframe_srcdoc_assignments'],
  [banObjectDataAssignments.RULE_NAME, 'ban_object_data_assignments'],
  [
    banRangeCreatecontextualfragment.RULE_NAME,
    'ban_range_createcontextualfragment',
  ],
  [banScriptAppendchildCalls.RULE_NAME, 'ban_script_appendchild_calls'],
  [banScriptContentAssignments.RULE_NAME, 'ban_script_content_assignments'],
  [banScriptSrcAssignments.RULE_NAME, 'ban_script_src_assignments'],
  [
    banServiceworkercontainerRegister.RULE_NAME,
    'ban_serviceworkercontainer_register',
  ],
  [banSharedWorkerCalls.RULE_NAME, 'ban_shared_worker_calls'],
  [banTrustedtypesCreatepolicy.RULE_NAME, 'ban_trustedtypes_createpolicy'],
  [banWindowStringfunctiondef.RULE_NAME, 'ban_window_stringfunctiondef'],
  [banWorkerCalls.RULE_NAME, 'ban_worker_calls'],
  [banWorkerImportscripts.RULE_NAME, 'ban_worker_importscripts'],
  [banLegacyConversions.RULE_NAME, 'ban_legacy_conversions'],
  [banReviewedConversions.RULE_NAME, 'ban_reviewed_conversions'],
]);

export function tsetseMessageToMessageId(
  tsetseMessage: string,
): TrustedTypeCheckMessageId | undefined {
  const match = tsetseMessage.match(/^\[([a-z-]+)\]/);
  if (match !== null) {
    return ruleNameToMessageIdMap.get(match[1]);
  }
  return undefined;
}
