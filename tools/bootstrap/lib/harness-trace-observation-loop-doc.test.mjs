/**
 * [REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP] Harness trace observation loop guide contract.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const guidePath = path.join(repoRoot, "tied-bundle", "docs", "harness-trace-observation-loop.md");

const REQUIRED_MARKERS = [
  "## Proof boundary",
  "## Procedure",
  "## Failure-mode taxonomy",
  "## Promotion path",
  "## Test-strategy executable matrix",
  "REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP",
  "tied_feedback_capture_observation",
  "model self-check",
];

describe("harness trace observation loop guide [REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP]", () => {
  it("exists under tied-bundle/docs with required sections", () => {
    assert.ok(fs.existsSync(guidePath), `missing guide: ${guidePath}`);
    const text = fs.readFileSync(guidePath, "utf8");
    for (const marker of REQUIRED_MARKERS) {
      assert.ok(text.includes(marker), `guide missing marker: ${marker}`);
    }
  });
});
