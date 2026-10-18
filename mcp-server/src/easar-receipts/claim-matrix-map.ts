/**
 * [IMPL-TIED_EASAR_RECEIPTS] [ARCH-TIED_EASAR_ARTIFACT_MODEL] [REQ-TIED_EASAR_RECOVERY]
 * Stable claim.id ↔ matrix # mapping (generic claim.id, not CLM- prefix).
 */

import { createHash } from "node:crypto";

export const CLAIM_MATRIX_MAP_SCHEMA = "claim-matrix-map.v1";

// [IMPL-TIED_EASAR_RECEIPTS] [REQ-TIED_EASAR_RECOVERY] — deterministic claim.id anchor from matrix Claim column text.
export function deriveClaimIdFromMatrixClaimText(claimText: string): string {
  const normalized = claimText.trim().replace(/\s+/g, " ");
  return createHash("sha256").update(normalized, "utf8").digest("hex").slice(0, 16);
}

export type ClaimMatrixEntry = {
  claim_id: string;
  matrix_row_number: number;
};

export type ClaimMatrixMap = {
  schema_version: typeof CLAIM_MATRIX_MAP_SCHEMA;
  request_token: string;
  entries: ClaimMatrixEntry[];
};

// [IMPL-TIED_EASAR_RECEIPTS] [REQ-TIED_EASAR_RECOVERY] — POST: sorted entries, duplicate claim_id or row rejected.
export function buildClaimMatrixMap(input: {
  request_token: string;
  entries: ClaimMatrixEntry[];
}): { ok: true; map: ClaimMatrixMap } | { ok: false; error: string } {
  const sorted = input.entries
    .map((entry) => ({
      claim_id: entry.claim_id.trim(),
      matrix_row_number: entry.matrix_row_number,
    }))
    .filter((entry) => entry.claim_id.length > 0)
    .sort((left, right) => left.claim_id.localeCompare(right.claim_id));

  const claimIds = new Set<string>();
  const rowNumbers = new Set<number>();
  for (const entry of sorted) {
    if (claimIds.has(entry.claim_id)) {
      return { ok: false, error: `duplicate_claim_id:${entry.claim_id}` };
    }
    if (rowNumbers.has(entry.matrix_row_number)) {
      return { ok: false, error: `duplicate_matrix_row:${entry.matrix_row_number}` };
    }
    claimIds.add(entry.claim_id);
    rowNumbers.add(entry.matrix_row_number);
  }

  return {
    ok: true,
    map: {
      schema_version: CLAIM_MATRIX_MAP_SCHEMA,
      request_token: input.request_token,
      entries: sorted,
    },
  };
}
