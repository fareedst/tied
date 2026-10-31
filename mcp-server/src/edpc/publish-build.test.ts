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

  it("records ofsm and health gaps when bundle missing", () => {
    const result = buildEdpcPublishManifest({
      scm_shell: {
        schema_version: "scm-snapshot-shell.v1",
        minimum_fields: {
          request_token: "REQ-TIED_EDPC_COMPREHENSION",
          baseline_revision: "abc",
          tier: "toolchain_readonly",
        },
      },
      claims_ledger: [],
      access_matrix: { evidence_access_tier: "toolchain_readonly" },
      charter: { critical_outcomes: ["billing"] },
      ofsm_bundle: null,
    });
    assert.ok(result.manifest!.gaps.some((g) => g === "ofsm:bundle_missing"));
  });

  it("rejects summary healthy without row evidence via health gap", () => {
    const result = buildEdpcPublishManifest({
      scm_shell: {
        schema_version: "scm-snapshot-shell.v1",
        minimum_fields: {
          request_token: "REQ-TIED_EDPC_COMPREHENSION",
          baseline_revision: "abc",
          tier: "toolchain_readonly",
        },
      },
      claims_ledger: [],
      access_matrix: { evidence_access_tier: "toolchain_readonly" },
      charter: { critical_outcomes: ["billing"] },
      ofsm_bundle: {
        schema_version: "operational-failure-state-bundle.v1",
        observation_window: {
          start: "2026-10-19T00:00:00Z",
          end: "2026-10-19T23:59:59Z",
          timezone: "UTC",
          environment: "local",
        },
        health_snapshot: { rows: [] },
        blind_spot_gaps: ["blind_spot:billing"],
        summary_healthy: true,
      },
    });
    assert.ok(result.manifest!.gaps.some((g) => g.startsWith("health:")));
  });

  it("accepts DOC-shaped shell with top-level request_token hoisted into minimum_fields", () => {
    const result = buildEdpcPublishManifest({
      scm_shell: {
        schema_version: "scm-snapshot-shell.v1",
        request_token: "DOC-STDD-TIED-PROJECT-BROWNFIELD",
        minimum_fields: {
          baseline_revision: "cf321c96",
          tier: "toolchain_readonly",
        },
      },
      claims_ledger: [],
      access_matrix: { evidence_access_tier: "toolchain_readonly" },
    });
    assert.ok(result.manifest);
    assert.ok(
      !result.manifest!.gaps.some((g) => g === "minimum_field_gap:request_token"),
      result.manifest!.gaps.join(", "),
    );
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
