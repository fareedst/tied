/**
 * [IMPL-TIED_DAE_VERIFICATION_CHARTER] [ARCH-TIED_DAE_VERIFICATION_CHARTER] [REQ-TIED_DAE_VERIFICATION_CHARTER]
 * How: W4b hard disjoint verifier — implementer vs verifier session identity from ledger + gate runner.
 */

import { readCharterPolicy } from "./charter-policy.js";
import type { GatePhase } from "./checklist-validator.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function waiverFieldPresent(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed !== "~";
}

function hasDisjointVerifierWaiver(citdp: unknown): boolean {
  if (!isRecord(citdp)) return false;
  const identity = isRecord(citdp.record_identity) ? citdp.record_identity : citdp;
  const waiver = identity.disjoint_verifier_waiver;
  if (!isRecord(waiver)) return false;
  return waiverFieldPresent(waiver.owner) && waiverFieldPresent(waiver.expiry);
}

export type DisjointLedgerFixture = {
  implementer_session_id: string;
  verifier_session_id: string;
};

export function sessionIdsFromLedgerInput(ledger: unknown): {
  implementerSessionId?: string;
  verifierSessionId?: string;
} {
  if (isRecord(ledger) && typeof ledger.implementer_session_id === "string") {
    return {
      implementerSessionId: ledger.implementer_session_id.trim(),
      verifierSessionId: typeof ledger.verifier_session_id === "string"
        ? ledger.verifier_session_id.trim()
        : undefined,
    };
  }
  if (!Array.isArray(ledger)) return {};
  let implementer: string | undefined;
  let verifier: string | undefined;
  for (const row of ledger) {
    if (!isRecord(row)) continue;
    const correlation = isRecord(row.correlation) ? row.correlation : undefined;
    const session =
      identityString(correlation?.session_id)
      ?? identityString(correlation?.session_id_hash)
      ?? identityString(row.session_id);
    if (!session) continue;
    const stepSlug = identityString(correlation?.step_slug) ?? "";
    const phase = identityString(correlation?.phase) ?? "";
    if (stepSlug === "verification-gate" || phase === "verification") {
      verifier = session;
    } else if (!implementer) {
      implementer = session;
    }
  }
  return { implementerSessionId: implementer, verifierSessionId: verifier };
}

function identityString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function validateDisjointVerifier(input: {
  citdp: unknown;
  phase: GatePhase;
  adherenceLedger?: unknown;
  verifierSessionId?: string;
}): { ok: boolean; diagnostics: string[] } {
  const policy = readCharterPolicy(input.citdp);
  if (policy.disjointVerifier !== "required") {
    return { ok: true, diagnostics: [] };
  }
  if (input.phase !== "verification" && input.phase !== "close_out") {
    return { ok: true, diagnostics: [] };
  }
  if (hasDisjointVerifierWaiver(input.citdp)) {
    return { ok: true, diagnostics: [] };
  }
  const fromLedger = sessionIdsFromLedgerInput(input.adherenceLedger);
  const implementer = fromLedger.implementerSessionId;
  const verifier = input.verifierSessionId?.trim() ?? fromLedger.verifierSessionId;
  if (!implementer || !verifier) {
    return { ok: false, diagnostics: ["disjoint_verifier_missing_session_ids"] };
  }
  if (implementer === verifier) {
    return { ok: false, diagnostics: ["disjoint_verifier_same_session"] };
  }
  return { ok: true, diagnostics: [] };
}
