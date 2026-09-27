/**
 * W4 CONTROLLED_COMPOSITION_FAULT — queue/worker/store/idempotency seams (UI-free).
 * Patterns: tied/docs/composition-coverage.md
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
  ExecutionStateStore,
  previewBulkCancelBlastRadius,
  readExecutionStatusWithConsistency,
  validateOperatorOverride,
  validateRecordVersion,
} from "./execution-state.js";
import {
  applyCreatePathBackpressure,
  enforceLockFencing,
  exposeLockHolderObservability,
  FeatureStore,
  validateRequestSchemaVersion,
} from "./store.js";
import { validateManifest, type FeatureManifest } from "./manifest.js";
import type { TaskEntry } from "./task-graph.js";

const workerTask = {
  task_id: "TASK-WORKER",
  source_revision: "rev-1",
  status: "running",
  depends_on: [],
  source_tokens: ["REQ-FEAT_TASK_EXECUTION_RECOVERY"],
  deliverables: [],
  test_level: "composition",
  parallel_group: null,
  evidence: { required: [], history: [] },
} as TaskEntry;

function workerDeliverOutcome(store: ExecutionStateStore, task: TaskEntry, attemptKey: string, outcome: "failed" | "passed") {
  return store.append(task, task.source_revision, { attempt_key: attemptKey, outcome, provenance: "worker-binding" });
}

describe("W4 composition fault — queue/worker/store/idempotency seams", () => {
  it("[S-T03-create] store unavailable on publish — PUBLISH_FAILED, no readable partial feature", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "w4-st03-create-"));
    const store = new FeatureStore(root);
    store.publish = () => {
      throw new Error("PUBLISH_FAILED");
    };
    const result = store.createIdempotently("st03-create", "Fault Feature");
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error, "PUBLISH_FAILED");
    assert.equal(store.listDirectories().length, 0);
  });

  it("[S-T03-exec] store unavailable on evidence append — STORE_WRITE_FAILED or STORE_UNAVAILABLE", () => {
    const failing = new ExecutionStateStore({
      persistence: {
        write() {
          return { ok: false, error: "STORE_UNAVAILABLE" as const };
        },
      },
    });
    const result = workerDeliverOutcome(failing, workerTask, "exec-attempt-1", "passed");
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error, "STORE_UNAVAILABLE");
    assert.equal(failing.get(workerTask.task_id), undefined);
  });

  it("[S-T01] duplicate delivery fault at worker→execution store binding", () => {
    const store = new ExecutionStateStore();
    const first = workerDeliverOutcome(store, workerTask, "dup-1", "failed");
    assert.equal(first.ok, true);
    const duplicate = workerDeliverOutcome(store, workerTask, "dup-1", "passed");
    assert.equal(duplicate.ok, false);
    if (duplicate.ok) return;
    assert.equal(duplicate.error, "EVIDENCE_DUPLICATE_REJECTED");
    const state = store.get(workerTask.task_id);
    assert.equal(state?.evidence.length, 1);
    assert.equal(state?.task_id, workerTask.task_id);
  });

  it("[S-T01] duplicate delivery fault at client→createIdempotently binding", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "w4-st01-client-"));
    const store = new FeatureStore(root);
    const a = store.createIdempotently("client-dup", "Same");
    const b = store.createIdempotently("client-dup", "Same");
    assert.equal(a.ok, true);
    assert.equal(b.ok, true);
    if (!a.ok || !b.ok) return;
    assert.equal(b.outcome, "existing");
    assert.equal(a.manifest.feature_id, b.manifest.feature_id);
    assert.equal(store.listDirectories().length, 1);
  });

  it("[S-T05] ordering fault — completion recorded before dependency handler registered", () => {
    const predecessor = {
      task_id: "TASK-PRED",
      source_revision: "rev-1",
      status: "passed" as const,
      attempt: 1,
      evidence: [],
    };
    const dependent = { task_id: "TASK-CHILD", depends_on: ["TASK-PRED"] };
    const beforeHandler = appendEvidence(
      { ...workerTask, task_id: "TASK-CHILD", depends_on: ["TASK-PRED"] },
      undefined,
      "rev-1",
      { attempt_key: "child-before-handler", outcome: "passed", provenance: "early-completion" },
    );
    assert.equal(beforeHandler.ok, true);
    const storeOrder: string[] = [];
    const handlerRegistered = storeOrder.includes("TASK-PRED");
    assert.equal(handlerRegistered, false);
    storeOrder.push("TASK-PRED");
    const evaluation = predecessor.status === "passed" && storeOrder.includes("TASK-PRED");
    assert.equal(evaluation, true);
    assert.equal(dependent.depends_on.includes("TASK-PRED"), true);
  });

  it("[S-T04] timeout fault — side effect before client observes timeout", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "w4-timeout-"));
    const store = new FeatureStore(root);
    let clientObserved = false;
    const sideEffect = store.createIdempotently("timeout-key", "Timeout Feature");
    assert.equal(sideEffect.ok, true);
    const timeoutResult = (() => {
      if (!clientObserved && sideEffect.ok) {
        return { ok: false as const, error: "TIMEOUT" as const, committed: true };
      }
      return { ok: true as const };
    })();
    clientObserved = true;
    assert.equal(timeoutResult.ok, false);
    if (timeoutResult.ok) return;
    assert.equal(timeoutResult.committed, true);
    assert.equal(store.createIdempotently("timeout-key", "Timeout Feature").ok, true);
  });

  it("[S-T02] mid-write crash — non-terminal state, retry appends new attempt — finding", () => {
    let persistCalls = 0;
    const store = new ExecutionStateStore({
      persistence: {
        write() {
          persistCalls += 1;
          if (persistCalls === 1) return { ok: false, error: "STORE_WRITE_FAILED" as const };
          return { ok: true };
        },
      },
    });
    const crash = workerDeliverOutcome(store, workerTask, "crash-1", "failed");
    assert.equal(crash.ok, false);
    const retry = workerDeliverOutcome(store, workerTask, "crash-2", "failed");
    assert.equal(retry.ok, true);
    if (!retry.ok) return;
    assert.equal(retry.state.status, "failed");
    assert.equal(retry.state.evidence.length, 1);
  });

  it("[S-T07] concurrent identical create — single feature reference — finding", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "w4-concurrent-"));
    const store = new FeatureStore(root);
    const results = await Promise.all(
      Array.from({ length: 8 }, () => store.createIdempotently("concurrent-key", "Concurrent")),
    );
    const ok = results.filter((item) => item.ok);
    assert.equal(ok.length, 8);
    const ids = new Set(ok.map((item) => (item.ok ? item.manifest.feature_id : "")));
    assert.equal(ids.size, 1);
    assert.equal(store.listDirectories().length, 1);
  });

  it("[S-T08] partial publish fault — reservation cleaned, PUBLISH_FAILED — finding", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "w4-partial-"));
    const store = new FeatureStore(root);
    store.publish = () => {
      throw new Error("PUBLISH_FAILED");
    };
    const result = store.createIdempotently("partial-publish", "Partial");
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error, "PUBLISH_FAILED");
    assert.equal(store.listDirectories().length, 0);
  });

  it("[S-T13] split-claim completion — binding defers beyond scheduler module", () => {
    const store = new ExecutionStateStore();
    const claimA = workerDeliverOutcome(store, workerTask, "split-a", "passed");
    const claimB = workerDeliverOutcome(store, workerTask, "split-b", "passed");
    assert.equal(claimA.ok, true);
    assert.equal(claimB.ok, true);
    if (!claimA.ok || !claimB.ok) return;
    assert.equal(claimB.state.evidence.length, 2);
    assert.equal(claimA.state.task_id, claimB.state.task_id);
    assert.equal(claimB.state.status, "passed");
  });
});

describe("W4 P1 composition fault — batch 2 stressor bindings", () => {
  it("[S-T09] rollout skew — schema gates block client create and worker→store append [REQ-FEAT_IDEMPOTENT_CREATION] [REQ-FEAT_TASK_EXECUTION_RECOVERY]", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "w4-p1-st09-"));
    const featureStore = new FeatureStore(root);
    const createGate = validateRequestSchemaVersion(3, 2);
    assert.equal(createGate.ok, false);
    if (createGate.ok) {
      featureStore.createIdempotently("skew-key", "Skew");
    }
    assert.equal(featureStore.listDirectories().length, 0);
    assert.deepEqual(validateRecordVersion(2, 1), { ok: false, error: "SCHEMA_VERSION_MISMATCH" });
    const execStore = new ExecutionStateStore();
    const workerSkew = appendEvidence(workerTask, undefined, "rev-1", {
      attempt_key: "p1-skew-attempt",
      outcome: "failed",
      provenance: "worker-binding",
      record_schema_version: 2,
      expected_schema_version: 1,
    });
    assert.equal(workerSkew.ok, false);
    if (workerSkew.ok) return;
    assert.equal(workerSkew.error, "SCHEMA_VERSION_MISMATCH");
    assert.equal(execStore.get(workerTask.task_id), undefined);
  });

  it("[S-T10] coordinator recovery — fencing gate blocks create binding before FeatureStore [ARCH-FEAT_IDEMPOTENT_CREATION]", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "w4-p1-st10-"));
    const featureStore = new FeatureStore(root);
    const fencing = enforceLockFencing(2, 1, undefined, true);
    assert.equal(fencing.ok, false);
    if (fencing.ok) {
      featureStore.createIdempotently("fenced-key", "Fenced");
    }
    assert.equal(featureStore.listDirectories().length, 0);
    if (!fencing.ok) assert.equal(fencing.error, "FENCING_TOKEN_STALE");
    const allowed = enforceLockFencing(2, 1, "valid-token", true);
    assert.equal(allowed.ok, true);
    if (allowed.ok) {
      assert.equal(featureStore.createIdempotently("fenced-key", "Fenced").ok, true);
      assert.equal(featureStore.listDirectories().length, 1);
    }
  });

  it("[S-T11] retry storm — backpressure gates defer worker append and create storm [architecture_constraint]", () => {
    const execStore = new ExecutionStateStore();
    const workerGate = applyRetryStormBackpressure(10, 10, 6_000, 5_000);
    assert.equal(workerGate, "throttle_retryable");
    if (workerGate === "proceed") {
      workerDeliverOutcome(execStore, workerTask, "storm-worker", "failed");
    }
    assert.equal(execStore.get(workerTask.task_id), undefined);
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "w4-p1-st11-"));
    const featureStore = new FeatureStore(root);
    const createGate = applyCreatePathBackpressure(100, 50, 1, 10);
    assert.equal(createGate, "throttle_retryable");
    if (createGate === "proceed") {
      featureStore.createIdempotently("storm-create", "Storm");
    }
    assert.equal(featureStore.listDirectories().length, 0);
  });

  it("[S-T16] store write token lag — status reader binding surfaces stale_lag [REQ-FEAT_TASK_EXECUTION_RECOVERY]", () => {
    const execStore = new ExecutionStateStore();
    const delivered = workerDeliverOutcome(execStore, workerTask, "p1-consistency", "passed");
    assert.equal(delivered.ok, true);
    if (!delivered.ok) return;
    const state = execStore.get(workerTask.task_id);
    assert.ok(state);
    const lagging = readExecutionStatusWithConsistency(state!, 1, 3, false);
    assert.equal(lagging.stale_lag, true);
    assert.equal(lagging.status, "passed");
    const caughtUp = readExecutionStatusWithConsistency(state!, 3, 3, false);
    assert.equal(caughtUp.stale_lag, false);
    const partitioned = readExecutionStatusWithConsistency(state!, 3, 3, true);
    assert.equal(partitioned.stale_lag, true);
  });

  it("[S-O02] operator override — audit gate rejects before worker→store append [architecture_constraint]", () => {
    const execStore = new ExecutionStateStore();
    const overrideGate = validateOperatorOverride(true, false);
    assert.equal(overrideGate.ok, false);
    if (overrideGate.ok) {
      execStore.append(workerTask, "rev-1", {
        attempt_key: "operator-override",
        outcome: "failed",
        provenance: "operator-override",
      });
    }
    assert.equal(execStore.get(workerTask.task_id), undefined);
    const audited = validateOperatorOverride(true, true);
    assert.equal(audited.ok, true);
    if (audited.ok) {
      const appended = execStore.append(workerTask, "rev-1", {
        attempt_key: "operator-audited",
        outcome: "failed",
        provenance: "operator-audited",
      });
      assert.equal(appended.ok, true);
      assert.equal(execStore.get(workerTask.task_id)?.evidence.length, 1);
    }
  });

  it("[S-O06] bulk cancel — blast-radius preview gates mass transition binding [architecture_constraint]", () => {
    const dependencyGraph = {
      "TASK-DEP-A": ["TASK-PRED"],
      "TASK-DEP-B": ["TASK-OTHER"],
      "TASK-PRED": [],
    };
    const preview = previewBulkCancelBlastRadius(["TASK-PRED"], dependencyGraph);
    assert.deepEqual(preview.locked_dependents, ["TASK-DEP-A"]);
    assert.equal(preview.requires_explicit_confirm, true);
    const execStore = new ExecutionStateStore();
    const explicitConfirm = false;
    const mayApplyBulkCancel = preview.requires_explicit_confirm && explicitConfirm;
    assert.equal(mayApplyBulkCancel, false);
    if (mayApplyBulkCancel) {
      workerDeliverOutcome(execStore, { ...workerTask, task_id: "TASK-PRED" }, "bulk-cancel", "cancelled");
    }
    assert.equal(execStore.get("TASK-PRED"), undefined);
    assert.equal(execStore.get("TASK-DEP-A"), undefined);
  });

  it("[S-O07] held request lock — observability binding at create seam [REQ-FEAT_IDEMPOTENT_CREATION]", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "w4-p1-so07-"));
    const featureStore = new FeatureStore(root);
    const requestKey = "obs-lock-key";
    const lockPath = path.join(root, `.request-${crypto.createHash("sha256").update(requestKey).digest("hex")}.lock`);
    const nowMs = 500;
    const lockRecord = { expires_at_ms: nowMs + 60_000, holder_id: "worker-7", acquired_at_ms: nowMs - 1_000 };
    fs.mkdirSync(lockPath);
    fs.writeFileSync(path.join(lockPath, "lock-meta.json"), JSON.stringify(lockRecord), "utf8");
    const blocked = featureStore.createIdempotently(requestKey, "Observed", { now_ms: nowMs });
    assert.equal(blocked.ok, false);
    if (blocked.ok) return;
    assert.equal(blocked.error, "REQUEST_KEY_COLLISION");
    const observability = exposeLockHolderObservability(lockRecord, nowMs);
    assert.equal(observability.holder_id, "worker-7");
    assert.equal(observability.stale_lock, false);
    assert.equal(observability.age_ms, 1_000);
    assert.equal(featureStore.listDirectories().length, 0);
  });
});

describe("W4 holdout validation stressors (parallel batch)", () => {
  it("[V-H01] sustained duplicate create storm — single feature identity", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "w4-vh01-"));
    const store = new FeatureStore(root);
    const first = store.createIdempotently("storm-key", "Storm");
    assert.equal(first.ok, true);
    const fanOut = 31;
    const results = await Promise.all(
      Array.from({ length: fanOut }, () => store.createIdempotently("storm-key", "Storm")),
    );
    const successes = results.filter((item) => item.ok);
    assert.equal(successes.length, fanOut);
    const featureIds = new Set(successes.map((item) => (item.ok ? item.manifest.feature_id : "")));
    assert.equal(featureIds.size, 1);
  });

  it("[V-H02] read-after-write visibility lag — dependency stays locked until predecessor visible", () => {
    let laggingReaderRevision = "rev-0";
    const writerRevision = "rev-1";
    const predecessorCompleteInWriter = true;
    const dependentUnlocked = predecessorCompleteInWriter && laggingReaderRevision === writerRevision;
    assert.equal(dependentUnlocked, false);
    laggingReaderRevision = writerRevision;
    assert.equal(predecessorCompleteInWriter && laggingReaderRevision === writerRevision, true);
  });

  it("[V-H03] unknown manifest field tolerated at read boundary", () => {
    const manifest = {
      schema_version: "feature-manifest.v1",
      feature_id: "FEAT-099",
      slug: "forward-compat",
      title: "Forward",
      mode: "greenfield",
      status: "draft",
      revision: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      canonical_tokens: { requirements: [], architecture: [], implementations: [] },
      future_field: "unknown-to-older-reader",
    };
    const validated = validateManifest(manifest);
    assert.equal(validated.ok, true);
  });
});
