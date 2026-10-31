/**
 * [IMPL-TIED_EDPC_PUBLISH] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_COMPREHENSION]
 */

import type { EvidenceAccessMatrix, EvidenceAccessTier } from "./types.js";
import {
  type EdpcCharterCriticalOutcomes,
  type OperationalFailureStateBundle,
  ofsmPublishGaps,
} from "./failure-state-validate.js";

export type ClaimsLedgerRow = {
  claim_id: string;
  claim_class?: string;
  text?: string;
};

export type ScmSnapshotShell = {
  schema_version: string;
  request_token?: string;
  receipt_refs?: Record<string, string>;
  minimum_fields?: Record<string, unknown>;
};

export type EdpcPublishManifest = {
  schema_version: "edpc-publish-manifest.v1";
  gaps: string[];
  receipt_refs: Record<string, string | null>;
  tier: EvidenceAccessTier;
};

const SCM_MINIMUM_KEYS = ["request_token", "baseline_revision", "tier"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// [IMPL-TIED_EDPC_PUBLISH] [REQ-TIED_EDPC_COMPREHENSION] [IMPL-TIED_EDPC_ACCESS]
export function classifyClaimsForTier(
  claims: ClaimsLedgerRow[],
  tier: EvidenceAccessTier,
): string[] {
  const gaps: string[] = [];
  if (tier !== "source_static") return gaps;
  for (const row of claims) {
    const cls = row.claim_class?.trim();
    if (cls === "Observed" || cls === "Verified") {
      gaps.push(`evidence_gap:${row.claim_id}:${cls}`);
    }
  }
  return gaps;
}

// [IMPL-TIED_EDPC_PUBLISH] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_COMPREHENSION]
export function buildEdpcPublishManifest(input: {
  scm_shell: unknown;
  claims_ledger: ClaimsLedgerRow[];
  access_matrix: EvidenceAccessMatrix;
  receipt_refs?: Record<string, string>;
  receipt_exists?: (path: string) => boolean;
  charter?: EdpcCharterCriticalOutcomes;
  ofsm_bundle?: OperationalFailureStateBundle | null;
}): { ok: boolean; manifest?: EdpcPublishManifest; diagnostics: string[] } {
  const diagnostics: string[] = [];
  if (!isRecord(input.scm_shell)) {
    return { ok: false, diagnostics: ["invalid_scm_shell"] };
  }
  const shell = input.scm_shell as ScmSnapshotShell;
  if (shell.schema_version !== "scm-snapshot-shell.v1") {
    diagnostics.push("invalid_scm_shell");
  }
  const gaps: string[] = [...diagnostics.filter((d) => d.startsWith("invalid"))];
  const shellRecord = shell as unknown as Record<string, unknown>;
  const minimum: Record<string, unknown> = isRecord(shell.minimum_fields)
    ? { ...shell.minimum_fields }
    : {};
  for (const key of SCM_MINIMUM_KEYS) {
    const current = minimum[key];
    if (current === undefined || current === null || current === "") {
      const topLevel = shellRecord[key];
      if (topLevel !== undefined && topLevel !== null && topLevel !== "") {
        minimum[key] = topLevel;
      }
    }
  }
  for (const key of SCM_MINIMUM_KEYS) {
    if (minimum[key] === undefined || minimum[key] === null || minimum[key] === "") {
      gaps.push(`minimum_field_gap:${key}`);
    }
  }
  gaps.push(...classifyClaimsForTier(input.claims_ledger, input.access_matrix.evidence_access_tier));

  if (input.charter || input.ofsm_bundle !== undefined) {
    gaps.push(
      ...ofsmPublishGaps({
        charter: input.charter ?? {},
        bundle: input.ofsm_bundle ?? null,
      }),
    );
  }

  const resolvedRefs: Record<string, string | null> = {};
  const refs = { ...shell.receipt_refs, ...input.receipt_refs };
  const exists = input.receipt_exists ?? (() => true);
  for (const [name, refPath] of Object.entries(refs ?? {})) {
    resolvedRefs[name] = exists(refPath) ? refPath : null;
    if (!exists(refPath)) gaps.push(`unresolved_receipt_ref:${name}`);
  }

  const manifest: EdpcPublishManifest = {
    schema_version: "edpc-publish-manifest.v1",
    gaps: [...gaps].sort(),
    receipt_refs: Object.fromEntries(
      Object.entries(resolvedRefs).sort(([a], [b]) => a.localeCompare(b)),
    ),
    tier: input.access_matrix.evidence_access_tier,
  };

  return { ok: diagnostics.length === 0, manifest, diagnostics };
}
