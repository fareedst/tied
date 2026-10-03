/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Unit tests — constraint-ready assist.
 */
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  applyConstraintReadyPlannedActions,
  applyMinimalProcedureContracts,
  computeConstraintReadyDryRunHash,
  listProceduresMissingLayerBContract,
  planConstraintReadyActionForSidecar,
} from "./fleet-constraint-ready-assist.ts";

test("listProceduresMissingLayerBContract finds procedure without Contract", () => {
  const text = `Grammar-Version: v2
procedure wire_tdd:
  parse argv
`;
  const gaps = listProceduresMissingLayerBContract(text);
  assert.equal(gaps.length, 1);
  assert.equal(gaps[0].procedure_name, "wire_tdd");
});

test("planConstraintReadyActionForSidecar maps gap to insert_minimal_procedure_contract", () => {
  const text = `Grammar-Version: v2
procedure wire_tdd:
  RETURN
`;
  const plan = planConstraintReadyActionForSidecar("tied/x.md", "IMPL-X", text);
  assert.equal(plan.action, "insert_minimal_procedure_contract");
  assert.equal(plan.classification_before, "header-only-v2");
});

test("planConstraintReadyActionForSidecar flags legacy INPUT comments without procedure", () => {
  const text = `Grammar-Version: v2
# INPUT: root
# OUTPUT: json
`;
  const plan = planConstraintReadyActionForSidecar("tied/y.md", "IMPL-Y", text);
  assert.equal(plan.action, "flag_manual_contract_migration");
});

test("applyMinimalProcedureContracts inserts stub for first procedure only when second has Contract", () => {
  const text = `Grammar-Version: v2
procedure first_missing:
  step one
procedure second_has_contract:
  Contract:
    INPUT: x
    PRE: ready
    POST:
      - success => ok
    EFFECTS: pure
  step two
`;
  const gaps = listProceduresMissingLayerBContract(text);
  assert.equal(gaps.length, 1);
  assert.equal(gaps[0].procedure_name, "first_missing");
  const out = applyMinimalProcedureContracts(text, gaps);
  const afterFirst = out.split("procedure second_has_contract:")[0];
  assert.match(afterFirst, /procedure first_missing:/);
  assert.match(afterFirst, /PRE: TBD/);
  const afterSecond = out.split("procedure second_has_contract:")[1];
  assert.match(afterSecond, /PRE: ready/);
  assert.doesNotMatch(afterSecond, /PRE: TBD/);
});

test("applyMinimalProcedureContracts inserts stub after procedure line", () => {
  const text = `Grammar-Version: v2
procedure wire_tdd:
  parse argv
`;
  const gaps = listProceduresMissingLayerBContract(text);
  const out = applyMinimalProcedureContracts(text, gaps);
  assert.match(out, /procedure wire_tdd:/);
  assert.match(out, /Contract:/);
  assert.match(out, /PRE: TBD/);
  assert.match(out, /EFFECTS: pure/);
  assert.ok(out.indexOf("Contract:") < out.indexOf("parse argv"));
});

test("applyConstraintReadyPlannedActions snapshots and writes sidecar", async () => {
  const root = await mkdtemp(join(tmpdir(), "constraint-ready-"));
  const rel = "tied/implementation-decisions/IMPL-TEST-pseudocode.md";
  const abs = join(root, rel);
  await import("node:fs/promises").then((fs) =>
    fs.mkdir(join(root, "tied/implementation-decisions"), { recursive: true }),
  );
  const before = `Grammar-Version: v2
procedure TEST:
  RETURN
`;
  await writeFile(abs, before, "utf8");
  const plan = planConstraintReadyActionForSidecar(rel, "IMPL-TEST", before);
  const snapDir = join(root, "snapshots");
  const result = await applyConstraintReadyPlannedActions({
    repositoryRoot: root,
    actions: [plan],
    snapshotDir: snapDir,
  });
  assert.equal(result.modified_paths.length, 1);
  const after = await readFile(abs, "utf8");
  assert.match(after, /Contract:/);
  const snap = await readFile(join(snapDir, "IMPL-TEST.before.bytes"), "utf8");
  assert.equal(snap, before);
});

test("computeConstraintReadyDryRunHash is stable", () => {
  const text = `Grammar-Version: v2
procedure A:
  x
`;
  const a = planConstraintReadyActionForSidecar("p/a.md", "IMPL-A", text);
  const h1 = computeConstraintReadyDryRunHash([a]);
  const h2 = computeConstraintReadyDryRunHash([a]);
  assert.equal(h1, h2);
});
