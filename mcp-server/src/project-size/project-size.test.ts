import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { buildProjectSizeSnapshot } from "./snapshot-builder.js";
import { PROOF_BOUNDARY, RECEIPT_SCHEMA_VERSION } from "./types.js";

const fixtureRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../test/fixtures/project-size/mini-client",
);

describe("project-size snapshot [IMPL-TIED_PROJECT_SIZE_SNAPSHOT] [REQ-TIED_PROJECT_SIZE_LAYERS]", () => {
  it("atoms counts match fixture indexes and vocab", async () => {
    const receipt = await buildProjectSizeSnapshot({ repo_root: fixtureRoot });
    assert.equal(receipt.schema_version, RECEIPT_SCHEMA_VERSION);
    assert.equal(receipt.proof_boundary, PROOF_BOUNDARY);
    assert.equal(receipt.layers.atoms.index_req, 1);
    assert.equal(receipt.layers.atoms.index_impl, 1);
    assert.equal(receipt.layers.atoms.vocab_preferred_terms, 1);
    assert.ok(receipt.ok);
  });

  it("template mass: applied lines are less than gross when sidecar exists", async () => {
    const receipt = await buildProjectSizeSnapshot({ repo_root: fixtureRoot });
    const oi = receipt.layers.operational_intent;
    assert.ok(oi.gross_lines > 0);
    assert.ok(oi.applied_lines <= oi.gross_lines);
    assert.ok(oi.sidecar_count >= 1);
  });

  it("operational_intent_hash changes when sidecar content changes", async () => {
    const before = await buildProjectSizeSnapshot({ repo_root: fixtureRoot });
    const work = await mkdtemp(path.join(tmpdir(), "psl-hash-"));
    try {
      const { cp } = await import("node:fs/promises");
      await cp(fixtureRoot, work, { recursive: true });
      const sidecar = path.join(
        work,
        "tied-project/implementation-decisions/IMPL-MINI_SIZE-pseudocode.md",
      );
      const original = await readFile(sidecar, "utf8");
      await writeFile(sidecar, `${original}\n# mutation line for hash test\n`, "utf8");
      const after = await buildProjectSizeSnapshot({ repo_root: work });
      assert.notEqual(before.hashes.operational_intent_hash, after.hashes.operational_intent_hash);
    } finally {
      await rm(work, { recursive: true, force: true });
    }
  });

  it("proof facets: unit_tests count matches fixture files", async () => {
    const receipt = await buildProjectSizeSnapshot({ repo_root: fixtureRoot });
    assert.equal(receipt.layers.proof_facets.unit_tests, 2);
  });
});
