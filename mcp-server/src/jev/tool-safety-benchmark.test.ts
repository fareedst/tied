/**
 * [REQ-TIED_JEV_TOOL_SAFETY_GATING] tool-safety-benchmark unit tests
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  BENCHMARK_SCHEMA,
  fixtureHash,
  loadLabeledToolSafetyFixturesFromFile,
  runToolSafetyBenchmark,
} from "./tool-safety-benchmark.js";

const fixturesPath = path.join(
  import.meta.dirname,
  "../../test/fixtures/tool-safety/labeled-corpus.v1.jsonl",
);

describe("REQ-TIED_JEV_TOOL_SAFETY_GATING benchmark", () => {
  it("loads corpus with at least 30 rows", () => {
    const rows = loadLabeledToolSafetyFixturesFromFile(fixturesPath);
    assert.ok(rows.length >= 30);
  });

  it("SC-D-BENCH: five arms share one fixture hash", async () => {
    const body = fs.readFileSync(fixturesPath, "utf8");
    const fixtures = loadLabeledToolSafetyFixturesFromFile(fixturesPath);
    const report = await runToolSafetyBenchmark({
      fixtures,
      fixturePath: fixturesPath,
      fixtureBody: body,
      gitRev: "test",
      mode: "mocked",
    });
    assert.equal(report.schema, BENCHMARK_SCHEMA);
    assert.equal(report.meta.fixture_hash, fixtureHash(body));
    assert.deepEqual(report.meta.arms, [
      "deterministic_only",
      "jev_on",
      "jev_off",
      "jev_unavailable",
      "shadow_compare",
    ]);
    const hardBlocks = fixtures.filter((r) => r.expected_decision === "any_block");
    for (const row of hardBlocks) {
      const det = report.rows.find(
        (x) => x.fixture_id === row.id && x.arm === "deterministic_only",
      );
      assert.equal(det?.predicted, "block", row.id);
    }
  });
});
