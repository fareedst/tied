import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildEdpcPublishManifest } from "./publish-build.js";

// [IMPL-TIED_EDPC_PUBLISH] [REQ-TIED_EDPC_COMPREHENSION]
describe("EDPC publish build [REQ-TIED_EDPC_COMPREHENSION]", () => {
  it("records gaps for source_static Observed claims", () => {
    const result = buildEdpcPublishManifest({
      scm_shell: {
        schema_version: "scm-snapshot-shell.v1",
        minimum_fields: {
          request_token: "REQ-TIED_EDPC_COMPREHENSION",
          baseline_revision: "abc",
          tier: "source_static",
        },
      },
      claims_ledger: [{ claim_id: "c1", claim_class: "Observed" }],
      access_matrix: { evidence_access_tier: "source_static" },
    });
    assert.ok(result.manifest);
    assert.ok(result.manifest!.gaps.some((g) => g.startsWith("evidence_gap:c1")));
  });

  it("flags unresolved receipt refs", () => {
    const result = buildEdpcPublishManifest({
      scm_shell: {
        schema_version: "scm-snapshot-shell.v1",
        minimum_fields: {
          request_token: "REQ-TIED_EDPC_COMPREHENSION",
          baseline_revision: "abc",
          tier: "toolchain_readonly",
        },
        receipt_refs: { inventory: "missing/path.json" },
      },
      claims_ledger: [],
      access_matrix: { evidence_access_tier: "toolchain_readonly" },
      receipt_exists: () => false,
    });
    assert.ok(result.manifest!.gaps.some((g) => g.startsWith("unresolved_receipt_ref:inventory")));
    assert.equal(result.manifest!.receipt_refs.inventory, null);
  });
});
