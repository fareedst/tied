/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Unit tests — fleet migration apply (header assist).
 */
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  applyPlannedActions,
  computeDryRunContentHash,
  insertGrammarV2Header,
  planActionForSidecar,
} from "./fleet-migration-apply.ts";

test("planActionForSidecar maps legacy-v1 to insert_grammar_v2_header", () => {
  const text = "# Title\n\nprocedure FOO\n  RETURN\n";
  const plan = planActionForSidecar(
    "tied/implementation-decisions/IMPL-FOO-pseudocode.md",
    "IMPL-FOO",
    text,
  );
  assert.equal(plan.action, "insert_grammar_v2_header");
  assert.equal(plan.classification_before, "legacy-v1");
});

test("planActionForSidecar skips header-only-v2", () => {
  const text = "Grammar-Version: v2\nprocedure BAR\n";
  const plan = planActionForSidecar("tied/x.md", "IMPL-BAR", text);
  assert.equal(plan.action, "none");
  assert.equal(plan.classification_before, "header-only-v2");
});

test("insertGrammarV2Header inserts before procedure block", () => {
  const text = "# IMPL\n\nprocedure BAZ\n";
  const out = insertGrammarV2Header(text);
  assert.match(out, /Grammar-Version: v2/);
  assert.ok(out.indexOf("Grammar-Version: v2") < out.indexOf("procedure BAZ"));
});

test("computeDryRunContentHash is stable for same actions", () => {
  const a = planActionForSidecar("p/a.md", "IMPL-A", "procedure X\n");
  const b = planActionForSidecar("p/b.md", "IMPL-B", "Grammar-Version: v2\nprocedure Y\n");
  const h1 = computeDryRunContentHash([a, b]);
  const h2 = computeDryRunContentHash([a, b]);
  assert.equal(h1, h2);
  assert.equal(h1.length, 64);
});

test("applyPlannedActions writes snapshot and updates legacy sidecar", async () => {
  const root = await mkdtemp(join(tmpdir(), "fleet-apply-"));
  const rel = "tied/implementation-decisions/IMPL-TEST-pseudocode.md";
  const abs = join(root, rel);
  const dir = join(root, "tied/implementation-decisions");
  await import("node:fs/promises").then((fs) => fs.mkdir(dir, { recursive: true }));
  const before = "# Sidecar\n\nprocedure TEST\n  RETURN\n";
  await writeFile(abs, before, "utf8");
  const plan = planActionForSidecar(rel, "IMPL-TEST", before);
  const snapDir = join(root, "snapshots");
  const result = await applyPlannedActions({
    repositoryRoot: root,
    actions: [plan],
    snapshotDir: snapDir,
  });
  assert.equal(result.modified_paths.length, 1);
  const after = await readFile(abs, "utf8");
  assert.match(after, /Grammar-Version: v2/);
  const snap = await readFile(join(snapDir, "IMPL-TEST.before.bytes"), "utf8");
  assert.equal(snap, before);
});
