/**
 * [REQ-TIED_CLIENT_OPERATOR_TOOLING] Close-out runner runs reconcile after gate receipt persist.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const scriptPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "run-close-out-gates.mjs");

test("run-close-out-gates reconcile follows gate receipt persist", () => {
  const source = readFileSync(scriptPath, "utf8");
  const mainSource = source.slice(source.indexOf("async function main"));
  const persistIdx = mainSource.indexOf("persistGateDecisionReceipt");
  const reconcileCallIdx = mainSource.indexOf("if (args.reconcile)");
  const earlyReconcileIdx = source.indexOf("repo_root: REPO_ROOT");
  assert.ok(persistIdx >= 0, "expected persistGateDecisionReceipt in runner");
  assert.ok(reconcileCallIdx >= 0, "expected reconcile block in main");
  assert.ok(reconcileCallIdx > persistIdx, "reconcile must run after receipt persist");
  assert.equal(earlyReconcileIdx, -1, "must not pass template REPO_ROOT to reconcile");
});
