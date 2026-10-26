/**
 * [REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE] [IMPL-TIED_CHECKER_BACKED_ENVELOPE_PROOF]
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { IndependentProofRecord, RequestEvidenceEnvelope } from "./types.js";
import { ENVELOPE_SCHEMA_VERSION } from "./types.js";
import {
  INDEPENDENT_PROOF_GAP_MISSING_BOUNDARY,
  INDEPENDENT_PROOF_GAP_UNKNOWN_KIND,
  PROOF_KIND_CHECKER_BACKED_CLAIM,
  PROOF_KIND_THEOREM_STATEMENT_METADATA,
} from "./proof-kinds.js";
import { validateRequestEvidenceEnvelope } from "./validate.js";

const REQUEST_TOKEN = "REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE";

function baseProof(overrides: Partial<IndependentProofRecord> = {}): IndependentProofRecord {
  return {
    proof_id: "proof-1",
    role: "asserted",
    proof_kind: PROOF_KIND_CHECKER_BACKED_CLAIM,
    locator: { path: "vendor/proof.o" },
    scope_limits: ["external"],
    proof_boundary: "Rocq discharge only; not tied_verify",
    review_status: "pending",
    ...overrides,
  };
}

function envelopeWithProofs(proofs: IndependentProofRecord[]): RequestEvidenceEnvelope {
  return {
    schema_version: ENVELOPE_SCHEMA_VERSION,
    envelope_meta: { generated_at: "2026-10-26T00:00:00Z", generator: "test", revision: 1 },
    identity: {
      request_token: REQUEST_TOKEN,
      project_id: "abc",
      depth_tier: "minimal",
      gate_policy: "advisory",
      methodology_snapshot_id: "4.0.0",
    },
    runs: [],
    artifacts: [],
    cross_links: {
      tracker_path: null,
      tracker_hash: null,
      citdp_path: null,
      evidence_chain_profile_path: null,
    },
    gaps: [],
    independent_proofs: proofs,
  };
}

describe("checker-backed envelope advisory validate [REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE]", () => {
  it("accepts valid checker_backed_claim with proof_boundary", async () => {
    const result = await validateRequestEvidenceEnvelope({
      envelope: envelopeWithProofs([baseProof()]),
    });
    assert.equal(result.ok, true);
    const codes = (result.envelope?.gaps ?? []).map((g) => g.code);
    assert.ok(!codes.includes(INDEPENDENT_PROOF_GAP_UNKNOWN_KIND));
    assert.ok(!codes.includes(INDEPENDENT_PROOF_GAP_MISSING_BOUNDARY));
  });

  it("warns on unknown proof_kind without blocking validate", async () => {
    const result = await validateRequestEvidenceEnvelope({
      envelope: envelopeWithProofs([baseProof({ proof_kind: "rocq_auto_gate" })]),
    });
    assert.equal(result.ok, true);
    assert.ok(
      (result.envelope?.gaps ?? []).some((g) => g.code === INDEPENDENT_PROOF_GAP_UNKNOWN_KIND),
    );
    assert.ok((result.advisory_gap_count ?? 0) >= 1);
  });

  it("warns when checker_backed_claim lacks proof_boundary", async () => {
    const result = await validateRequestEvidenceEnvelope({
      envelope: envelopeWithProofs([baseProof({ proof_boundary: "   " })]),
    });
    assert.equal(result.ok, true);
    assert.ok(
      (result.envelope?.gaps ?? []).some((g) => g.code === INDEPENDENT_PROOF_GAP_MISSING_BOUNDARY),
    );
  });

  it("accepts theorem_statement_metadata without checker discharge boundary requirement", async () => {
    const result = await validateRequestEvidenceEnvelope({
      envelope: envelopeWithProofs([
        baseProof({
          proof_kind: PROOF_KIND_THEOREM_STATEMENT_METADATA,
          proof_boundary: "",
          verifier_hint: "sponsor-readable short spec",
        }),
      ]),
    });
    assert.equal(result.ok, true);
    const codes = (result.envelope?.gaps ?? []).map((g) => g.code);
    assert.ok(!codes.includes(INDEPENDENT_PROOF_GAP_MISSING_BOUNDARY));
  });
});
