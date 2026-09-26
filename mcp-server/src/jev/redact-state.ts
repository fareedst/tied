/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 */

import type { JevState } from "./types.js";

const SECRET_PATTERNS: RegExp[] = [
  /\.env\b/i,
  /\bjv_live_[a-zA-Z0-9_]+/g,
  /\b(api[_-]?key|secret|password|token)\s*[:=]\s*\S+/gi,
];

export function redactString(input: string): string {
  let out = input;
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.global) {
      out = out.replace(pattern, "[REDACTED]");
    } else {
      out = out.replace(pattern, "[REDACTED]");
    }
  }
  return out;
}

export function redactState(state: JevState): JevState {
  if (typeof state === "string") {
    return redactString(state);
  }
  const serialized = JSON.stringify(state);
  return JSON.parse(redactString(serialized)) as JevState;
}

export function stateSerializedLength(state: JevState): number {
  const redacted = redactState(state);
  if (typeof redacted === "string") {
    return redacted.length;
  }
  return JSON.stringify(redacted).length;
}
