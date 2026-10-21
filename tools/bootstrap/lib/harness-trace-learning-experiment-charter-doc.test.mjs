/**
 * [REQ-TIED_HARNESS_TRACE_LEARNING_PILOT] HTOL learning experiment charter doc contract.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const charterPath = path.join(
  repoRoot,
  "tied-bundle",
  "docs",
  "harness-trace-learning-experiment-charter.md",
);

const REQUIRED_MARKERS = [
  "## Proof boundary",
  "## Hypothesis template",
  "## Baseline",
  "## Pilot bounds and stop criteria",
  "## Operator sequence",
  "## Test-strategy executable matrix",
  "REQ-TIED_HARNESS_TRACE_LEARNING_PILOT",
  "methodology-learning-experiment.v1",
  "tied_methodology_learning_experiment_upsert",
  "tied_feedback_pilot_run",
  "harness-trace-review",
  "not_measured",
  "model self-check",
];

describe("HTOL learning experiment charter [REQ-TIED_HARNESS_TRACE_LEARNING_PILOT]", () => {
  it("exists under tied-bundle/docs with required sections", () => {
    assert.ok(fs.existsSync(charterPath), `missing charter: ${charterPath}`);
    const text = fs.readFileSync(charterPath, "utf8");
    for (const marker of REQUIRED_MARKERS) {
      assert.ok(text.includes(marker), `charter missing marker: ${marker}`);
    }
  });
});
