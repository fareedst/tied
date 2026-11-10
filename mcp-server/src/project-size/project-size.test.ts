import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { buildProjectSizeSnapshot, scanPseudocodeLines } from "./snapshot-builder.js";
import { PROOF_BOUNDARY, RECEIPT_SCHEMA_VERSION } from "./types.js";

const fixtureRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../test/fixtures/project-size/mini-client",
);

describe("project-size snapshot [IMPL-TIED_PROJECT_SIZE_SNAPSHOT] [IMPL-TIED_PROJECT_SIZE_OPERATIONAL_UTF8_MASS] [IMPL-TIED_PROJECT_SIZE_PROOF_FACET_TEST_CASES] [REQ-TIED_PROJECT_SIZE_LAYERS] [REQ-TIED_PROJECT_SIZE_OPERATIONAL_UTF8_MASS] [REQ-TIED_PROJECT_SIZE_PROOF_FACET_TEST_CASES]", () => {
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

  it("proof facets: unit_tests count test cases not files [SC-PFC-01] [REQ-TIED_PROJECT_SIZE_PROOF_FACET_TEST_CASES]", async () => {
    const receipt = await buildProjectSizeSnapshot({ repo_root: fixtureRoot });
    assert.equal(receipt.validator_version, "1.1.0");
    const unitCases = receipt.layers.proof_facets.unit_tests;
    assert.equal(unitCases, 5);
    assert.ok(unitCases > 3, "more cases than unit-classified files in fixture");
  });

  it("utf8 mass fields on receipt [SC-UTF8-01] [REQ-TIED_PROJECT_SIZE_OPERATIONAL_UTF8_MASS]", async () => {
    const receipt = await buildProjectSizeSnapshot({ repo_root: fixtureRoot });
    const oi = receipt.layers.operational_intent;
    assert.ok(oi.gross_utf8_bytes > 0);
    assert.ok(oi.applied_utf8_bytes <= oi.gross_utf8_bytes);
    assert.ok(oi.template_overlap_utf8_bytes <= oi.gross_utf8_bytes);
    assert.equal(
      oi.applied_utf8_bytes,
      Math.max(0, oi.gross_utf8_bytes - oi.template_overlap_utf8_bytes),
    );
    assert.ok(
      typeof receipt.cross_layer.operational_intent_utf8_per_atom === "number" ||
        receipt.cross_layer.operational_intent_utf8_per_atom === null,
    );
  });

  it("equal applied_lines can differ in applied_utf8_bytes [SC-UTF8-04]", () => {
    const templateLines = new Set<string>();
    const short = "x\ny\nz";
    const long =
      "CALL verify_with_extra_margin_and_padding_for_utf8_mass_signal\n" +
      "CALL second_long_line_for_equal_line_count_abcdefghijklmnopqrstuvwxyz\n" +
      "CALL third_long_line_for_equal_line_count_abcdefghijklmnopqrstuvwxyz";
    const a = scanPseudocodeLines(short, templateLines);
    const b = scanPseudocodeLines(long, templateLines);
    assert.equal(a.grossLines, b.grossLines);
    assert.notEqual(a.grossUtf8Bytes, b.grossUtf8Bytes);
  });
});
