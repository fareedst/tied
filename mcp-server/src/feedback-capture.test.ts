/**
 * [REQ-KAIZEN-OBSERVATION-CAPTURE] [ARCH-KAIZEN_OBSERVATION_CAPTURE] [IMPL-KAIZEN_OBSERVATION_CAPTURE]
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { loadFeedback } from "./feedback.js";
import {
  captureOperationalObservation as capture,
  findEntryByIdempotencyKey,
  buildCaptureReceipt,
  classifyEvidenceRef,
} from "./feedback-capture.js";

function tmpBase(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "tied-capture-"));
}

const baseCapture = {
  privacy_tier: "operator_local" as const,
  title: "Waiting on lint",
  description: "Lint blocked the commit for several minutes.",
  idempotency_key: "key-001",
};

describe("classifyEvidenceRef [IMPL-KAIZEN_OBSERVATION_CAPTURE]", () => {
  it("accepts URI and path refs", () => {
    assert.equal(classifyEvidenceRef("test://run-1"), "valid");
    assert.equal(classifyEvidenceRef("/tmp/log.txt"), "valid");
  });
  it("rejects generic prose", () => {
    assert.equal(classifyEvidenceRef("tests passed"), "invalid");
  });
});

describe("captureOperationalObservation kind inference [REQ-KAIZEN-SOURCE-NORMALIZATION]", () => {
  it("infers bug_report from failed_test kind when entry_type omitted", () => {
    const dir = tmpBase();
    try {
      const result = capture(
        {
          ...baseCapture,
          idempotency_key: "kind-infer-1",
          observation_kind: "failed_test",
        },
        dir
      );
      assert.equal(result.ok, true);
      const data = loadFeedback(dir);
      assert.equal(data.entries[0].type, "bug_report");
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });
  it("caller entry_type overrides kind inference", () => {
    const dir = tmpBase();
    try {
      capture(
        {
          ...baseCapture,
          idempotency_key: "kind-override-1",
          observation_kind: "failed_test",
          entry_type: "feature_request",
        },
        dir
      );
      assert.equal(loadFeedback(dir).entries[0].type, "feature_request");
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });
});

describe("captureOperationalObservation valid minimal [REQ-KAIZEN-OBSERVATION-CAPTURE]", () => {
  it("appends entry and returns receipt without promotion fields", () => {
    const dir = tmpBase();
    try {
      const result = capture(baseCapture, dir);
      assert.equal(result.ok, true);
      const receipt = result.receipt!;
      assert.ok(receipt.feedback_id.startsWith("fb-"));
      assert.equal(receipt.notification_disposition, "not_configured");
      assert.equal(receipt.idempotent_replay, false);
      assert.ok(!("promotion_status" in receipt));
      assert.ok(!("leap_status" in receipt));
      const data = loadFeedback(dir);
      assert.equal(data.entries.length, 1);
      assert.equal(data.entries[0].type, "methodology_improvement");
      assert.equal(
        (data.entries[0].context?.capture as { entry_type_omitted?: boolean })?.entry_type_omitted,
        true
      );
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });
});

describe("captureOperationalObservation incomplete [REQ-KAIZEN-OBSERVATION-CAPTURE]", () => {
  it("rejects missing title or description", () => {
    const dir = tmpBase();
    try {
      assert.equal(capture({ ...baseCapture, title: "  " }, dir).ok, false);
      assert.equal(capture({ ...baseCapture, description: "" }, dir).ok, false);
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });
});

describe("captureOperationalObservation malformed [REQ-KAIZEN-OBSERVATION-CAPTURE]", () => {
  it("rejects bad privacy tier and entry type", () => {
    const dir = tmpBase();
    try {
      const badTier = capture({ ...baseCapture, privacy_tier: "shareable_hashed" }, dir);
      assert.equal(badTier.ok, false);
      assert.match(badTier.error ?? "", /operator_local/);

      const forbidden = capture({ ...baseCapture, idempotency_key: "k2", privacy_tier: "forbidden_export" }, dir);
      assert.equal(forbidden.ok, false);

      const badType = capture(
        { ...baseCapture, idempotency_key: "k3", entry_type: "not_a_type" as never },
        dir
      );
      assert.equal(badType.ok, false);

      const badDate = capture(
        { ...baseCapture, idempotency_key: "k4", occurred_at: "not-a-date" },
        dir
      );
      assert.equal(badDate.ok, false);
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });
});

describe("captureOperationalObservation idempotent retry [REQ-KAIZEN-OBSERVATION-CAPTURE]", () => {
  it("returns one entry and idempotent_replay on retry", () => {
    const dir = tmpBase();
    try {
      const first = capture(baseCapture, dir);
      const second = capture(
        { ...baseCapture, title: "Different title should not append" },
        dir
      );
      assert.equal(first.ok, true);
      assert.equal(second.ok, true);
      assert.equal(second.receipt!.idempotent_replay, true);
      assert.equal(loadFeedback(dir).entries.length, 1);
      assert.equal(findEntryByIdempotencyKey("key-001", dir)?.title, "Waiting on lint");
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });
});

describe("captureOperationalObservation evidence refs [REQ-KAIZEN-OBSERVATION-CAPTURE]", () => {
  it("partitions validated and rejected refs on receipt", () => {
    const dir = tmpBase();
    try {
      const result = capture(
        {
          ...baseCapture,
          idempotency_key: "key-ev",
          evidence_refs: ["test://1", "tests passed", ""],
        },
        dir
      );
      assert.equal(result.ok, true);
      assert.deepEqual(result.receipt!.evidence_refs_validated, ["test://1"]);
      assert.ok(result.receipt!.evidence_refs_rejected.length >= 1);
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });
});

describe("captureOperationalObservation persistence [REQ-KAIZEN-OBSERVATION-CAPTURE]", () => {
  it("survives reload after write", () => {
    const dir = tmpBase();
    try {
      capture({ ...baseCapture, idempotency_key: "persist-1" }, dir);
      const reloaded = loadFeedback(dir);
      assert.equal(reloaded.entries.length, 1);
      assert.equal(reloaded.entries[0].idempotency_key, "persist-1");
      assert.equal(reloaded.entries[0].privacy_tier, "operator_local");
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });
});

describe("buildCaptureReceipt [IMPL-KAIZEN_OBSERVATION_CAPTURE]", () => {
  it("echoes observation kind or unknown", () => {
    const entry = {
      id: "fb-x",
      type: "methodology_improvement" as const,
      title: "t",
      description: "d",
      created_at: "2026-10-07T00:00:00.000Z",
      context: { capture: { observation: { kind: "waiting" } } },
    };
    const receipt = buildCaptureReceipt(entry, {
      idempotent_replay: false,
      evidence_refs_validated: [],
      evidence_refs_rejected: [],
    });
    assert.equal(receipt.observation_kind, "waiting");
  });
});
