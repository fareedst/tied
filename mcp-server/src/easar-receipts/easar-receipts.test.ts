import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildClaimMatrixMap } from "./claim-matrix-map.js";
import { validateEasarEngagementFacet, EASAR_FULL_ENGAGEMENT } from "./engagement-facet.js";
import { buildCodeGraphMatrixReceipt } from "./graph-matrix-link.js";
import { buildInventoryV1FromWalkSummary } from "./inventory-v1.js";
import {
  buildReflexionReportV1,
  validateReflexionReportV1Input,
} from "./reflexion-report-v1.js";

// [REQ-TIED_EASAR_RECOVERY] [IMPL-TIED_EASAR_RECEIPTS]
describe("EASAR receipts [REQ-TIED_EASAR_RECOVERY]", () => {
  it("engagement easar_full requires pilot or strict mode", () => {
    const bad = validateEasarEngagementFacet({
      brownfield_intent_elevation: { engagement: EASAR_FULL_ENGAGEMENT, mode: "report_only" },
    });
    assert.equal(bad.ok, false);
    assert.ok(bad.diagnostics.includes("easar_full_requires_pilot_or_strict_mode"));

    const good = validateEasarEngagementFacet({
      brownfield_intent_elevation: { engagement: EASAR_FULL_ENGAGEMENT, mode: "pilot" },
    });
    assert.equal(good.ok, true);
  });

  it("inventory.v1 stable content_hash for fixture walk", () => {
    const first = buildInventoryV1FromWalkSummary({
      request_token: "REQ-TIED_EASAR_RECOVERY",
      baseline_revision: "abc123",
      scoped_analysis_run_id: "scoped-run-1",
      files_scanned: 2,
      files: ["mcp-server/src/a.ts", "mcp-server/src/b.js"],
      summary: {
        roots_used: ["mcp-server/src"],
        skipped_paths_count: 0,
        followed_symlinks: false,
      },
      matrix_row_placeholders: ["1", "2"],
    });
    const second = buildInventoryV1FromWalkSummary({
      request_token: "REQ-TIED_EASAR_RECOVERY",
      baseline_revision: "abc123",
      scoped_analysis_run_id: "scoped-run-1",
      files_scanned: 2,
      files: ["mcp-server/src/a.ts", "mcp-server/src/b.js"],
      summary: {
        roots_used: ["mcp-server/src"],
        skipped_paths_count: 0,
        followed_symlinks: false,
      },
      matrix_row_placeholders: ["1", "2"],
    });
    assert.equal(first.content_hash, second.content_hash);
    assert.deepEqual(first.languages, ["js", "ts"]);
  });

  it("code_graph matrix receipt binds freshness run id", () => {
    const built = buildCodeGraphMatrixReceipt({
      matrix_row_number: 4,
      row: {
        source_type: "code_graph",
        location: "mcp-server/src/source-graph/source-graph.test.ts",
        disposition: "observed",
      },
      graph_freshness_run_id: "freshness-run-001",
      graph_trace_id: "trace-symbol-1",
    });
    assert.equal(built.ok, true);
    if (built.ok) {
      assert.equal(built.receipt.graph_freshness_run_id, "freshness-run-001");
    }
  });

  it("claim-matrix map sorts entries and rejects duplicate claim_id", () => {
    const good = buildClaimMatrixMap({
      request_token: "REQ-TIED_EASAR_RECOVERY",
      entries: [
        { claim_id: "claim-b", matrix_row_number: 2 },
        { claim_id: "claim-a", matrix_row_number: 1 },
      ],
    });
    assert.equal(good.ok, true);
    if (good.ok) {
      assert.deepEqual(
        good.map.entries.map((e) => e.claim_id),
        ["claim-a", "claim-b"],
      );
    }

    const dupClaim = buildClaimMatrixMap({
      request_token: "REQ-TIED_EASAR_RECOVERY",
      entries: [
        { claim_id: "claim-a", matrix_row_number: 1 },
        { claim_id: "claim-a", matrix_row_number: 2 },
      ],
    });
    assert.equal(dupClaim.ok, false);
    if (!dupClaim.ok) assert.match(dupClaim.error, /duplicate_claim_id/);

    const dupRow = buildClaimMatrixMap({
      request_token: "REQ-TIED_EASAR_RECOVERY",
      entries: [
        { claim_id: "claim-a", matrix_row_number: 1 },
        { claim_id: "claim-b", matrix_row_number: 1 },
      ],
    });
    assert.equal(dupRow.ok, false);
    if (!dupRow.ok) assert.match(dupRow.error, /duplicate_matrix_row/);
  });

  it("reflexion-report.v1 input validation rejects missing obligation ref", () => {
    const bad = validateReflexionReportV1Input({
      request_token: "REQ-TIED_EASAR_RECOVERY",
      inquiry_run_id: "run-1",
      gate_allowed: true,
      obligation_report_ref: "  ",
    });
    assert.equal(bad.ok, false);
    if (!bad.ok) assert.match(bad.error, /missing_obligation_report_ref/);
  });

  it("reflexion-report.v1 is export_only and keeps ledger ref separate", () => {
    const report = buildReflexionReportV1({
      request_token: "REQ-TIED_EASAR_RECOVERY",
      inquiry_run_id: "inquiry-1",
      gate_allowed: true,
      obligation_report_ref: "obligation-report.json",
      adversarial_ledger_ref: "finding-ledger.jsonl",
      divergences: [],
    });
    assert.equal(report.export_only, true);
    assert.equal(report.adversarial_ledger_ref, "finding-ledger.jsonl");
  });
});
