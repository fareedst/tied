import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { freezeClaimSurface, parseClaimSurfaceJson } from "./claim-surface.js";
import { classifyClaimStatus } from "./classify-claim-status.js";
import { collectClaimEvidence } from "./collect-claim-evidence.js";
import { appendClaimReviewRow, createClaimReviewLedger } from "./claim-review-ledger.js";
import { CLAIM_SURFACE_SCHEMA } from "./types.js";

describe("claim-surface [REQ-TIED_CLAIMS_EVIDENCE_REVIEW]", () => {
  it("rejects path outside input boundary", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cer-boundary-"));
    const inner = path.join(dir, "fixture");
    fs.mkdirSync(inner, { recursive: true });
    const surfacePath = path.join(inner, "claim-surface.v1.json");
    fs.writeFileSync(surfacePath, JSON.stringify({
      schemaVersion: CLAIM_SURFACE_SCHEMA,
      revision: "r1",
      sourceRevision: "s1",
      requestToken: "REQ-TIED_CLAIMS_EVIDENCE_REVIEW",
      claims: [{ id: "c1", text: "t", source: "REQ-X", scope: "REQ-X" }],
    }));
    const result = freezeClaimSurface({
      claimSurfacePath: surfacePath,
      inputBoundaryRoot: path.join(dir, "other"),
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.kind, "PathOutsideBoundary");
  });

  it("rejects duplicate claim ids", () => {
    assert.throws(
      () => parseClaimSurfaceJson({
        schemaVersion: CLAIM_SURFACE_SCHEMA,
        revision: "r1",
        sourceRevision: "s1",
        requestToken: "REQ-TIED_CLAIMS_EVIDENCE_REVIEW",
        claims: [
          { id: "dup", text: "a", source: "s", scope: "s" },
          { id: "dup", text: "b", source: "s", scope: "s" },
        ],
      }),
      /DuplicateClaimId/,
    );
  });
});

describe("classify-claim-status [REQ-TIED_CLAIMS_EVIDENCE_REVIEW]", () => {
  it("marks runtime claims not_examined under static_only", () => {
    const row = classifyClaimStatus({
      claim: {
        id: "runtime",
        text: "runtime",
        source: "x",
        scope: "x",
        requiresRuntimeProof: true,
      },
      evidence: undefined,
      executionPolicy: "static_only",
    });
    assert.equal(row.disposition, "not_examined");
    assert.equal(row.unresolvedExposure, true);
  });

  it("does not treat missing evidence as shown", () => {
    const row = classifyClaimStatus({
      claim: { id: "c1", text: "t", source: "s", scope: "s" },
      evidence: { claimId: "c1", proofBoundary: "static_analysis", found: false },
      executionPolicy: "static_only",
    });
    assert.equal(row.disposition, "unsettled");
    assert.notEqual(row.disposition, "shown");
  });
});

describe("collect-claim-evidence [REQ-TIED_CLAIMS_EVIDENCE_REVIEW]", () => {
  it("rejects path traversal", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cer-traverse-"));
    const result = collectClaimEvidence({
      stub: { claimId: "c1", path: "../../etc/passwd", proofBoundary: "static_analysis" },
      projectRoot: dir,
    });
    assert.ok("kind" in result);
    assert.equal(result.kind, "PathTraversalRejected");
  });
});

describe("claim-review-ledger [REQ-TIED_CLAIMS_EVIDENCE_REVIEW]", () => {
  it("appends without overwriting duplicate claim ids", () => {
    const ledger = createClaimReviewLedger();
    const row = {
      claimId: "c1",
      disposition: "shown" as const,
      reason: "ok",
      proofBoundary: "static_analysis" as const,
      demonstratedGap: false,
      unresolvedExposure: false,
      evidenceRefs: ["path"],
    };
    assert.equal(appendClaimReviewRow(ledger, row).kind, "appended");
    assert.equal(appendClaimReviewRow(ledger, row).kind, "duplicate");
    assert.equal(ledger.rows.length, 1);
  });
});
