import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { runClaimsEvidenceReview } from "../claims-evidence-review/run-claims-evidence-review.js";
import type { EvidenceStub } from "../claims-evidence-review/types.js";
import {
  buildClaimMatrixMap,
  deriveClaimIdFromMatrixClaimText,
} from "./claim-matrix-map.js";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const evidenceDir = path.join(
  repoRoot,
  "tied-project/working/REQ-TIED_EASAR_RECOVERY/evidence",
);

const MATRIX_CLAIMS = [
  "validateEasarEngagementFacet rejects easar_full when BFIE mode is report_only",
  "buildInventoryV1FromWalkSummary yields stable content_hash for identical walk input",
  "MCP tied_easar_inventory_receipt_build registered on tool surface",
  "tied_source_graph_refresh remains read-only on project YAML (regression guard for slice 2)",
] as const;

// [REQ-TIED_EASAR_RECOVERY] [IMPL-TIED_EASAR_RECEIPTS] [REQ-TIED_CLAIMS_EVIDENCE_REVIEW]
describe("EASAR claim-matrix choreography [REQ-TIED_EASAR_RECOVERY]", () => {
  it("maps matrix rows 1-4 to claim ids and runs claims-review under EASAR working root", () => {
    const entries = MATRIX_CLAIMS.map((text, index) => ({
      claim_id: deriveClaimIdFromMatrixClaimText(text),
      matrix_row_number: index + 1,
    }));
    const mapped = buildClaimMatrixMap({
      request_token: "REQ-TIED_EASAR_RECOVERY",
      entries,
    });
    assert.equal(mapped.ok, true);
    if (!mapped.ok) return;

    const surfacePath = path.join(evidenceDir, "claim-surface-easar.v1.json");
    const stubsPath = path.join(evidenceDir, "evidence-stubs-easar.v1.json");
    assert.ok(fs.existsSync(surfacePath));
    assert.ok(fs.existsSync(stubsPath));
    const stubs = JSON.parse(fs.readFileSync(stubsPath, "utf8")) as EvidenceStub[];

    const outputDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "easar-cer-choreography-"),
    );
    const review = runClaimsEvidenceReview({
      projectRoot: repoRoot,
      claimSurfacePath: surfacePath,
      inputBoundaryRoot: evidenceDir,
      outputDir,
      evidenceStubs: stubs,
      executionPolicy: "static_only",
      requestToken: "REQ-TIED_EASAR_RECOVERY",
      runId: "easar-cer-choreography-test",
    });
    assert.equal(review.ok, true);
    if (!review.ok) return;
    assert.ok(fs.existsSync(review.outputPaths.ledger));
    assert.ok(fs.existsSync(review.outputPaths.provenance));
    assert.equal(review.provenance.requestToken, "REQ-TIED_EASAR_RECOVERY");

    const claimIdsOnSurface = new Set(
      JSON.parse(fs.readFileSync(surfacePath, "utf8")).claims.map((c: { id: string }) => c.id),
    );
    for (const entry of mapped.map.entries) {
      assert.ok(claimIdsOnSurface.has(entry.claim_id), `missing claim ${entry.claim_id}`);
      const row = review.report.rows.find((r) => r.claimId === entry.claim_id);
      assert.ok(row, `claims-review row for matrix #${entry.matrix_row_number}`);
    }
  });
});
