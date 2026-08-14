import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  createReviewedLeapProposal,
  groupDuplicateFeedback,
  normalizeOperationalSource,
  reportPromotionStatus,
  type OperationalSource,
} from "./feedback-promotion.js";

const source: OperationalSource = {
  source_type: "incident",
  source_id: "inc-42",
  affected_feature: "FEAT-003",
  severity: "high",
  evidence_links: ["incident://inc-42"],
  occurred_at: "2026-08-13T10:00:00.000Z",
  title: "Checkout outage",
  description: "Checkout returned errors",
  proposed_req: "REQ-FEAT_CHECKOUT_RELIABILITY",
  payload: { region: "us-east-1" },
};

describe("feedback promotion [REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION]", () => {
  it("normalizes all source metadata and rejects missing evidence", () => {
    const result = normalizeOperationalSource(source);
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.entry.promotion_status, "promotion_pending");
    const missing = normalizeOperationalSource({ ...source, evidence_links: [] });
    assert.equal(missing.ok, false);
    if (!missing.ok) assert.equal(missing.error, "MissingEvidence");
  });

  it("groups duplicates without deleting original entries", () => {
    const first = normalizeOperationalSource(source);
    const second = normalizeOperationalSource({ ...source, source_id: "inc-43" });
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    if (!first.ok || !second.ok) return;
    const grouped = groupDuplicateFeedback(second.entry, [first.entry]);
    assert.equal(grouped.kind, "duplicate");
    assert.equal(grouped.entry.duplicate_group, first.entry.duplicate_group);
  });

  it("requires review and creates only non-canonical proposals", () => {
    const result = normalizeOperationalSource(source);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const missing = createReviewedLeapProposal(result.entry, {
      projectRoot: fs.mkdtempSync(path.join(os.tmpdir(), "feedback-promotion-")),
    });
    assert.equal(missing.ok, false);
    if (!missing.ok) assert.equal(missing.error, "ReviewRequired");
    const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "feedback-promotion-"));
    try {
      const created = createReviewedLeapProposal(result.entry, {
        projectRoot,
        review: {
          reviewer: "human@example.test",
          decision: "create_proposal",
          rationale: "Evidence supports a reliability requirement",
          evidence_links: ["incident://inc-42"],
        },
      });
      assert.equal(created.ok, true);
      if (created.ok) {
        assert.equal(created.proposal.non_canonical, true);
        assert.equal(created.proposal.leap_hints?.feedback_id, result.entry.id);
      }
      assert.equal(reportPromotionStatus(result.entry, created.ok ? created.proposal : undefined), "proposal_created");
    } finally {
      fs.rmSync(projectRoot, { recursive: true, force: true });
    }
  });
});
