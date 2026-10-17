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
  resolvePromotionAffectedFeature,
  resolvePromotionEvidenceLinks,
  type OperationalSource,
} from "./feedback-promotion.js";
import type { FeedbackEntry } from "./feedback.js";

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
    if (result.ok) {
      assert.equal(result.entry.promotion_status, "promotion_pending");
      assert.equal(result.entry.type, "bug_report");
      assert.equal(result.entry.context?.observation_kind, "incident");
    }
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

  it("[REQ-KAIZEN-SOURCE-NORMALIZATION] user_report stays methodology_improvement with other qualifier", () => {
    const friction: OperationalSource = {
      source_type: "user_report",
      source_id: "ur-1",
      affected_feature: "FEAT-UX",
      severity: "low",
      evidence_links: ["note://1"],
      occurred_at: "2026-08-13T10:00:00.000Z",
      title: "Confusing docs",
      description: "Could not find the checklist",
      payload: { other_qualifier: "user_report" },
    };
    const result = normalizeOperationalSource(friction);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.entry.type, "methodology_improvement");
      assert.equal(result.entry.context?.observation_kind, "other");
    }
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

  it("[REQ-FEEDBACK_TO_TIED] methodology_improvement uses context evidence_links for LEAP hints", () => {
    const entry: FeedbackEntry = {
      id: "fb-mvclklsa-t5gzbo",
      type: "methodology_improvement",
      title: "Compose review layers",
      description: "Outreach discovery",
      created_at: "2026-10-17T16:14:49.930Z",
      context: {
        evidence_links: ["docs/comparisons/claude-code-team-code-review-vs-tied.md"],
        observation_kind: "discovery",
      },
    };
    assert.deepEqual(resolvePromotionEvidenceLinks(entry), [
      "docs/comparisons/claude-code-team-code-review-vs-tied.md",
    ]);
    assert.equal(resolvePromotionAffectedFeature(entry), "TIED-METHODOLOGY");
    const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "feedback-promotion-"));
    try {
      const created = createReviewedLeapProposal(entry as never, {
        projectRoot,
        review: {
          reviewer: "sponsor",
          decision: "create_proposal",
          rationale: "Queue phased methodology work",
          evidence_links: ["docs/comparisons/claude-code-team-code-review-vs-tied.md"],
        },
      });
      assert.equal(created.ok, true);
      if (created.ok) {
        assert.deepEqual(created.proposal.leap_hints?.evidence_links, [
          "docs/comparisons/claude-code-team-code-review-vs-tied.md",
        ]);
        assert.equal(created.proposal.leap_hints?.affected_feature, "TIED-METHODOLOGY");
      }
    } finally {
      fs.rmSync(projectRoot, { recursive: true, force: true });
    }
  });
});
