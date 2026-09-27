/**
 * Working-folder identity tokens for checklist gates and request-evidence envelopes.
 * [REQ-REQUEST_EVIDENCE_ENVELOPE] [IMPL-REQUEST_EVIDENCE_ENVELOPE]
 *
 * Product change requests use REQ-*; methodology/analysis plans use PLAN-* under working/.
 */
export const WORKING_REQUEST_TOKEN_RE = /^(?:REQ|PLAN)-[A-Z0-9][A-Z0-9_-]*$/u;

export function isValidWorkingRequestToken(token: string): boolean {
  return WORKING_REQUEST_TOKEN_RE.test(token);
}
