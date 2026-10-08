/**
 * [REQ-KAIZEN-REVIEW-BRIDGE] [ARCH-KAIZEN-REVIEW-BRIDGE] [IMPL-KAIZEN-REVIEW-BRIDGE]
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import yaml from "js-yaml";
import { fileURLToPath } from "node:url";
import { getFeedbackPath } from "./feedback.js";
import { computeProjectionHash, type FeedbackAnalysisDigestV1 } from "./feedback-analysis.js";
import { getQueuePath, loadQueue } from "./analysis/leap-proposal-queue.js";
import {
  resolveFindingToEntryIds,
  runDigestReviewBridge,
  type RunDigestReviewBridgeParams,
} from "./feedback-review-bridge.js";
import type { OperationalFeedbackEntry } from "./feedback-promotion.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = path.join(__dirname, "..", "test", "fixtures", "kaizen-review-bridge");
const SHARED = path.join(FIXTURE_ROOT, "_shared");

const FIXTURE_NAMES = [
  "review_required",
  "reject_decision",
  "approve_create_proposal",
  "canonical_write_attempt",
  "stale_evidence",
  "proposal_link_integrity",
] as const;

function loadSharedDigest(): FeedbackAnalysisDigestV1 {
  return JSON.parse(fs.readFileSync(path.join(SHARED, "digest.json"), "utf8")) as FeedbackAnalysisDigestV1;
}

function loadSharedEntries(): OperationalFeedbackEntry[] {
  return JSON.parse(fs.readFileSync(path.join(SHARED, "operational-entries.json"), "utf8")) as OperationalFeedbackEntry[];
}

function entriesMap(entries: OperationalFeedbackEntry[]): Map<string, OperationalFeedbackEntry> {
  return new Map(entries.map((entry) => [entry.id, entry]));
}

function loadFixture(name: string): {
  params: Record<string, unknown>;
  expected: Record<string, unknown>;
} {
  const dir = path.join(FIXTURE_ROOT, name);
  return {
    params: JSON.parse(fs.readFileSync(path.join(dir, "params.json"), "utf8")) as Record<string, unknown>,
    expected: JSON.parse(fs.readFileSync(path.join(dir, "expected.json"), "utf8")) as Record<string, unknown>,
  };
}

function tmpProjectRoot(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "kaizen-review-bridge-"));
}

function queueCount(projectRoot: string): number {
  const queuePath = getQueuePath(projectRoot);
  if (!fs.existsSync(queuePath)) return 0;
  return loadQueue(projectRoot).proposals.length;
}

function runFromFixture(
  name: string,
  projectRoot: string,
): ReturnType<typeof runDigestReviewBridge> {
  const fx = loadFixture(name);
  const digest = loadSharedDigest();
  const entries = loadSharedEntries();
  const params = fx.params;
  const bridgeParams: RunDigestReviewBridgeParams = {
    digest,
    observation_group: params.observation_group as string,
    projectRoot,
    entriesById: entriesMap(entries),
    ...(params.review ? { review: params.review as RunDigestReviewBridgeParams["review"] } : {}),
    ...(params.review_context
      ? { review_context: params.review_context as RunDigestReviewBridgeParams["review_context"] }
      : {}),
    ...(params.canonicalWrite ? { canonicalWrite: Boolean(params.canonicalWrite) } : {}),
  };
  return runDigestReviewBridge(bridgeParams);
}

function fileSha256(filePath: string): string {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

describe("feedback-review-bridge golden fixtures [REQ-KAIZEN-REVIEW-BRIDGE]", () => {
  for (const name of FIXTURE_NAMES) {
    it(`fixture: ${name}`, () => {
      const fx = loadFixture(name);
      const projectRoot = tmpProjectRoot();
      try {
        const beforeCount = queueCount(projectRoot);
        const result = runFromFixture(name, projectRoot);
        const afterCount = queueCount(projectRoot);
        const delta = afterCount - beforeCount;

        if (fx.expected.ok === false) {
          assert.equal(result.ok, false);
          if (!result.ok) assert.equal(result.error, fx.expected.error);
          if (typeof fx.expected.queue_count_delta === "number") {
            assert.equal(delta, fx.expected.queue_count_delta);
          }
          return;
        }

        assert.equal(result.ok, true, JSON.stringify(result));
        if (!result.ok) return;

        if (fx.expected.review_outcome) {
          assert.equal(result.review_outcome, fx.expected.review_outcome);
        }
        if (fx.expected.lead_entry_id) assert.equal(result.lead_entry_id, fx.expected.lead_entry_id);
        if (fx.expected.member_ids) assert.deepEqual(result.member_ids, fx.expected.member_ids);
        if (fx.expected.promotion_status) assert.equal(result.promotion_status, fx.expected.promotion_status);
        if (typeof fx.expected.queue_count_delta === "number") {
          assert.equal(delta, fx.expected.queue_count_delta);
        }
        if (fx.expected.proposal_non_canonical) {
          assert.ok(result.proposal);
          assert.equal(result.proposal?.non_canonical, true);
        }
        if (fx.expected.proposal_link_required) {
          assert.ok(result.proposal_link);
          assert.equal(result.proposal_link?.proposal_id, result.proposal?.id);
          assert.ok(result.proposal_link?.queue_path.endsWith("leap-proposals/queue.json"));
        }
        if (fx.expected.leap_hints_feedback_id) {
          assert.equal(result.proposal?.leap_hints?.feedback_id, fx.expected.leap_hints_feedback_id);
        }
        if (fx.expected.leap_hints_member_ids) {
          assert.deepEqual(result.proposal?.leap_hints?.member_ids, fx.expected.leap_hints_member_ids);
        }
        if (result.proposal_link && result.proposal) {
          const queue = loadQueue(projectRoot);
          const stored = queue.proposals.find((p) => p.id === result.proposal_link!.proposal_id);
          assert.ok(stored, "proposal_id must exist in queue");
          assert.equal(stored?.id, result.proposal.id);
        }
      } finally {
        fs.rmSync(projectRoot, { recursive: true, force: true });
      }
    });
  }

  it("InvalidFinding when observation_group is unknown", () => {
    const digest = loadSharedDigest();
    const resolved = resolveFindingToEntryIds(digest, "dg-missing");
    assert.equal(resolved.ok, false);
    if (!resolved.ok) assert.equal(resolved.error, "InvalidFinding");
  });

  it("store immutability — feedback.yaml and tied-project sample YAML unchanged", () => {
    const projectRoot = tmpProjectRoot();
    const tiedSampleDir = path.join(projectRoot, "tied-project");
    fs.mkdirSync(tiedSampleDir, { recursive: true });
    const sampleYaml = path.join(tiedSampleDir, "requirements.yaml");
    fs.writeFileSync(sampleYaml, "REQ-SAMPLE:\n  status: Planned\n", "utf8");
    const entries = loadSharedEntries();
    fs.mkdirSync(path.dirname(getFeedbackPath(projectRoot)), { recursive: true });
    fs.writeFileSync(getFeedbackPath(projectRoot), yaml.dump({ entries }, { lineWidth: -1, noRefs: true }), "utf8");

    const feedbackBefore = fileSha256(getFeedbackPath(projectRoot));
    const yamlBefore = fileSha256(sampleYaml);

    try {
      const result = runFromFixture("approve_create_proposal", projectRoot);
      assert.equal(result.ok, true);
      assert.equal(fileSha256(getFeedbackPath(projectRoot)), feedbackBefore);
      assert.equal(fileSha256(sampleYaml), yamlBefore);
    } finally {
      fs.rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it("fresh projection_hash anchor matches digest and allows approve", () => {
    const digest = loadSharedDigest();
    const hash = computeProjectionHash(digest);
    const projectRoot = tmpProjectRoot();
    try {
      const result = runDigestReviewBridge({
        digest,
        observation_group: "dg-checkout",
        review_context: { projection_hash: hash },
        review: {
          reviewer: "human@example.test",
          decision: "create_proposal",
          rationale: "Fresh anchor",
          evidence_links: ["incident://inc-42"],
        },
        projectRoot,
        entriesById: entriesMap(loadSharedEntries()),
      });
      assert.equal(result.ok, true);
    } finally {
      fs.rmSync(projectRoot, { recursive: true, force: true });
    }
  });
});
