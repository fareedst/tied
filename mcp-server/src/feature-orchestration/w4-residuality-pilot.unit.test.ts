/**
 * W4 residuality pilot — unit matrix [REQ-FEAT_TASK_EXECUTION_RECOVERY] [REQ-FEAT_IDEMPOTENT_CREATION]
 * Matrix: working/PLAN-TIED-RESIDUALITY-ANALYSIS/pilot/w4-test-strategy.md
 */
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import {
  appendEvidence,
  applyRetryStormBackpressure,
  evaluateDependencies,
  previewBulkCancelBlastRadius,
  readExecutionStatusWithConsistency,
  recordTerminalFailureAfterMaxRetries,
  resumeExecution,
  validateOperatorOverride,
  validateRecordVersion,
  ExecutionStateStore,
} from "./execution-state.js";
import {
  FeatureStore,
  applyCreatePathBackpressure,
  enforceLockFencing,
  exposeLockHolderObservability,
  handleLockTtl,
  validateRequestSchemaVersion,
} from "./store.js";
import type { TaskEntry } from "./task-graph.js";

const baseTask = {
  task_id: "TASK-W4",
  source_revision: "r1",
  status: "pending",
  depends_on: [],
  source_tokens: ["REQ-FEAT_TASK_EXECUTION_RECOVERY"],
  deliverables: [],
  test_level: "unit",
  parallel_group: null,
  evidence: { required: [], history: [] },
} as TaskEntry;

describe("W4 residuality pilot unit [REQ-FEAT_TASK_EXECUTION_RECOVERY]", () => {
  it("[S-T01] APPEND_EVIDENCE redelivery does not fork task_id — IMPL-FEAT_TASK_EXECUTION_STATE", () => {
    const first = appendEvidence(baseTask, undefined, "r1", {
      attempt_key: "attempt-1",
      idempotency_key: "delivery-a",
      outcome: "failed",
      provenance: "worker-1",
    });
    assert.equal(first.ok, true);
    if (!first.ok) return;
    const redelivery = appendEvidence(baseTask, first.state, "r1", {
      attempt_key: "attempt-1-redelivered",
      idempotency_key: "delivery-a",
      outcome: "passed",
      provenance: "worker-1-retry",
    });
    assert.equal(redelivery.ok, true);
    if (!redelivery.ok) return;
    assert.equal(redelivery.duplicate_delivery, true);
    assert.equal(redelivery.state.task_id, first.state.task_id);
    assert.equal(redelivery.state.evidence.length, 1);
  });

  it("[S-T04] RESUME_EXECUTION unknown_outcome_flag leaves non-terminal resumable state", () => {
    const state = {
      task_id: baseTask.task_id,
      source_revision: "r1",
      status: "failed" as const,
      attempt: 1,
      evidence: [],
    };
    const resumed = resumeExecution(state, "r1", false, true);
    assert.equal(resumed.ok, true);
    if (!resumed.ok) return;
    assert.equal(resumed.state.status, "running");
    assert.equal(resumed.state.unknown_outcome_reason, "UNKNOWN_OUTCOME_RETRY");
  });

  it("[S-T05] EVALUATE_DEPENDENCIES uses store completion order not broker order alone", () => {
    const predecessor = {
      task_id: "TASK-PRED",
      source_revision: "r1",
      status: "passed" as const,
      attempt: 1,
      evidence: [],
    };
    const dependents = [
      { task_id: "TASK-DEP-A", depends_on: ["TASK-PRED", "TASK-OTHER"] },
      { task_id: "TASK-DEP-B", depends_on: ["TASK-PRED", "TASK-OTHER"] },
    ];
    const brokerFirst = evaluateDependencies("TASK-PRED", predecessor, dependents, ["TASK-PRED"]);
    assert.deepEqual(brokerFirst.unlocked, []);
    assert.deepEqual(brokerFirst.locked, ["TASK-DEP-A", "TASK-DEP-B"]);
    const storeOrder = evaluateDependencies("TASK-PRED", predecessor, dependents, ["TASK-OTHER", "TASK-PRED"]);
    assert.deepEqual(storeOrder.unlocked, ["TASK-DEP-A", "TASK-DEP-B"]);
  });

  it("[S-T12] APPEND_EVIDENCE rejects duplicate attempt_key — EVIDENCE_DUPLICATE_REJECTED", () => {
    const first = appendEvidence(baseTask, undefined, "r1", {
      attempt_key: "same-key",
      outcome: "failed",
      provenance: "unit",
    });
    assert.equal(first.ok, true);
    if (!first.ok) return;
    const duplicate = appendEvidence(baseTask, first.state, "r1", {
      attempt_key: "same-key",
      outcome: "passed",
      provenance: "unit-2",
    });
    assert.equal(duplicate.ok, false);
    if (duplicate.ok) return;
    assert.equal(duplicate.error, "EVIDENCE_DUPLICATE_REJECTED");
  });

  it("[S-T14] RECORD_TERMINAL_FAILURE_AFTER_MAX_RETRIES locks dependents after max retries", () => {
    const state = { task_id: baseTask.task_id, source_revision: "r1", status: "failed" as const, attempt: 3, evidence: [] };
    const below = recordTerminalFailureAfterMaxRetries(state, 1, 3);
    assert.equal(below.ok, true);
    if (!below.ok) return;
    assert.equal(below.terminal, false);
    const terminal = recordTerminalFailureAfterMaxRetries(state, 3, 3);
    assert.equal(terminal.ok, true);
    if (!terminal.ok) return;
    assert.equal(terminal.terminal, true);
    assert.equal(terminal.state.status, "failed");
    assert.equal(terminal.state.dependents_locked, true);
  });

  it("[S-T15] APPEND_EVIDENCE returns STORE_WRITE_FAILED without success transition", () => {
    const store = new ExecutionStateStore({
      persistence: {
        write() {
          return { ok: false, error: "STORE_WRITE_FAILED" as const };
        },
      },
    });
    const result = store.append(baseTask, "r1", {
      attempt_key: "attempt-io-fail",
      outcome: "passed",
      provenance: "worker",
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error, "STORE_WRITE_FAILED");
    assert.equal(store.get(baseTask.task_id), undefined);
  });

  it("[S-T06] resumeExecution returns STALE_INPUT on revision mismatch — finding confirmation", () => {
    const state = { task_id: baseTask.task_id, source_revision: "r1", status: "failed" as const, attempt: 1, evidence: [] };
    const stale = resumeExecution(state, "r2");
    assert.equal(stale.ok, false);
    if (stale.ok) return;
    assert.equal(stale.error, "STALE_INPUT");
  });

  it("[S-O01] resumeExecution returns CANCELLATION_NOT_RESUMABLE without recovery flag", () => {
    const state = { task_id: baseTask.task_id, source_revision: "r1", status: "cancelled" as const, attempt: 1, evidence: [] };
    const cancelled = resumeExecution(state, "r1");
    assert.equal(cancelled.ok, false);
    if (cancelled.ok) return;
    assert.equal(cancelled.error, "CANCELLATION_NOT_RESUMABLE");
  });

  it("[S-O04] operator stale retry surfaces STALE_INPUT — finding confirmation", () => {
    const stale = appendEvidence(baseTask, undefined, "r9", {
      attempt_key: "operator-retry",
      outcome: "failed",
      provenance: "operator",
    });
    assert.equal(stale.ok, false);
    if (stale.ok) return;
    assert.equal(stale.error, "STALE_INPUT");
  });

  it("[S-T09] validateRecordVersion and appendEvidence reject schema skew — IMPL-FEAT_TASK_EXECUTION_STATE", () => {
    assert.deepEqual(validateRecordVersion(2, 1), { ok: false, error: "SCHEMA_VERSION_MISMATCH" });
    const skew = appendEvidence(baseTask, undefined, "r1", {
      attempt_key: "skew-attempt",
      outcome: "failed",
      provenance: "worker",
      record_schema_version: 2,
      expected_schema_version: 1,
    });
    assert.equal(skew.ok, false);
    if (skew.ok) return;
    assert.equal(skew.error, "SCHEMA_VERSION_MISMATCH");
  });

  it("[S-T11] applyRetryStormBackpressure throttles under storm — architecture_constraint", () => {
    assert.equal(applyRetryStormBackpressure(10, 10, 1, 5_000), "throttle_retryable");
    assert.equal(applyRetryStormBackpressure(1, 10, 1, 5_000), "proceed");
  });

  it("[S-T16] readExecutionStatusWithConsistency surfaces stale_lag under partition", () => {
    const state = { task_id: baseTask.task_id, source_revision: "r1", status: "passed" as const, attempt: 1, evidence: [] };
    const lagging = readExecutionStatusWithConsistency(state, 1, 3, false);
    assert.equal(lagging.stale_lag, true);
    const partitioned = readExecutionStatusWithConsistency(state, 3, 3, true);
    assert.equal(partitioned.stale_lag, true);
  });

  it("[S-O02] validateOperatorOverride rejects without audit channel — architecture_constraint", () => {
    assert.deepEqual(validateOperatorOverride(true, false), { ok: false, error: "OVERRIDE_REJECTED" });
    assert.deepEqual(validateOperatorOverride(true, true), { ok: true, audited: true });
  });

  it("[S-O06] previewBulkCancelBlastRadius lists locked dependents — architecture_constraint", () => {
    const preview = previewBulkCancelBlastRadius(["TASK-PRED"], {
      "TASK-DEP-A": ["TASK-PRED"],
      "TASK-DEP-B": ["TASK-OTHER"],
    });
    assert.deepEqual(preview.locked_dependents, ["TASK-DEP-A"]);
    assert.equal(preview.requires_explicit_confirm, true);
  });
});

describe("W4 residuality pilot unit [REQ-FEAT_IDEMPOTENT_CREATION]", () => {
  it("[S-T01] createIdempotently redelivery returns existing_feature — IMPL-FEAT_IDEMPOTENT_CREATE", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "w4-idem-"));
    const store = new FeatureStore(root);
    const first = store.createIdempotently("req-redelivery", "Pilot Feature");
    const second = store.createIdempotently("req-redelivery", "Pilot Feature");
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    if (!first.ok || !second.ok) return;
    assert.equal(second.outcome, "existing");
    assert.equal(second.manifest.feature_id, first.manifest.feature_id);
  });

  it("[S-T04] unknown prior in-progress reservation consults store before re-allocate", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "w4-lock-"));
    const store = new FeatureStore(root);
    const lockPath = path.join(root, `.request-${crypto.createHash("sha256").update("orphan-key").digest("hex")}.lock`);
    fs.mkdirSync(lockPath);
    fs.writeFileSync(path.join(lockPath, "lock-meta.json"), JSON.stringify({ expires_at_ms: Date.now() + 60_000 }), "utf8");
    const blocked = store.createIdempotently("orphan-key", "Blocked");
    assert.equal(blocked.ok, false);
    if (blocked.ok) return;
    assert.equal(blocked.error, "REQUEST_KEY_COLLISION");
    fs.writeFileSync(path.join(lockPath, "lock-meta.json"), JSON.stringify({ expires_at_ms: Date.now() - 1 }), "utf8");
    const expired = store.createIdempotently("orphan-key", "After TTL", { now_ms: Date.now() });
    assert.equal(expired.ok, true);
  });

  it("[S-T18] HANDLE_LOCK_TTL allows allocation after expiry when metadata shows no commit", () => {
    const ttl = handleLockTtl({}, "fresh-key", { expires_at_ms: 100 }, 200);
    assert.equal(ttl.ok, true);
    if (!ttl.ok) return;
    assert.equal(ttl.action, "eligible_for_allocation");
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "w4-ttl-"));
    const store = new FeatureStore(root);
    const created = store.createIdempotently("ttl-key", "TTL Feature", { lock_ttl_ms: 10, now_ms: Date.now() + 20 });
    assert.equal(created.ok, true);
  });

  it("[S-T17] empty request_key returns REQUEST_KEY_REQUIRED — finding confirmation", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "w4-req-"));
    const store = new FeatureStore(root);
    const missing = store.createIdempotently("  ", "Title");
    assert.deepEqual(missing, { ok: false, error: "REQUEST_KEY_REQUIRED" });
  });

  it("[S-O05] fingerprint mismatch returns REQUEST_KEY_COLLISION — finding confirmation", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "w4-fp-"));
    const store = new FeatureStore(root);
    assert.equal(store.createIdempotently("same-key", "Alpha").ok, true);
    const collision = store.createIdempotently("same-key", "Beta");
    assert.deepEqual(collision, { ok: false, error: "REQUEST_KEY_COLLISION" });
  });

  it("[S-T09] validateRequestSchemaVersion rejects rollout skew — REQ-FEAT_IDEMPOTENT_CREATION", () => {
    assert.deepEqual(validateRequestSchemaVersion(3, 2), { ok: false, error: "SCHEMA_VERSION_MISMATCH" });
  });

  it("[S-T10] enforceLockFencing fails on stale fencing token — architecture_constraint", () => {
    assert.deepEqual(enforceLockFencing(2, 1, undefined, true), { ok: false, error: "FENCING_TOKEN_STALE" });
    assert.deepEqual(enforceLockFencing(2, 1, "valid-token", true), { ok: true });
  });

  it("[S-T11] applyCreatePathBackpressure throttles create storm — architecture_constraint", () => {
    assert.equal(applyCreatePathBackpressure(100, 50, 1, 10), "throttle_retryable");
  });

  it("[S-O07] exposeLockHolderObservability marks stale_lock past TTL — REQ-FEAT_IDEMPOTENT_CREATION", () => {
    const view = exposeLockHolderObservability(
      { expires_at_ms: 100, holder_id: "worker-7", acquired_at_ms: 50 },
      200,
    );
    assert.equal(view.holder_id, "worker-7");
    assert.equal(view.stale_lock, true);
    assert.equal(view.age_ms, 150);
  });
});
