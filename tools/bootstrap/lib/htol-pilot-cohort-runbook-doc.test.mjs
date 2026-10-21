/**
 * [REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK] HTOL pilot cohort runbook doc contract.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const runbookPath = path.join(
  repoRoot,
  "tied-bundle",
  "docs",
  "htol-pilot-cohort-runbook.md",
);
const charterPath = path.join(
  repoRoot,
  "tied-bundle",
  "docs",
  "harness-trace-learning-experiment-charter.md",
);
const loopPath = path.join(
  repoRoot,
  "tied-bundle",
  "docs",
  "harness-trace-observation-loop.md",
);

const REQUIRED_MARKERS = [
  "## Proof boundary",
  "## Before you start (fill in)",
  "## Runbook checklist",
  "## Copy-paste pilot spec skeleton",
  "## Test-strategy executable matrix",
  "REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK",
  "REQ-TIED_HARNESS_TRACE_LEARNING_PILOT",
  "tied_methodology_learning_experiment_upsert",
  "tied_feedback_capture_observation",
  "tied_feedback_pilot_run",
  "context.denominator_fingerprint: htol-v1",
  "harness-trace-review",
  "not_measured",
  "inconclusive",
  "model self-check",
  "htol-pilot-cohort-runbook-doc.test.mjs",
];

describe("HTOL pilot cohort runbook [REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK]", () => {
  it("exists under tied-bundle/docs with required sections", () => {
    assert.ok(fs.existsSync(runbookPath), `missing runbook: ${runbookPath}`);
    const text = fs.readFileSync(runbookPath, "utf8");
    for (const marker of REQUIRED_MARKERS) {
      assert.ok(text.includes(marker), `runbook missing marker: ${marker}`);
    }
  });

  it("is linked from charter and HTOL observation loop docs", () => {
    const charter = fs.readFileSync(charterPath, "utf8");
    const loop = fs.readFileSync(loopPath, "utf8");
    assert.ok(
      charter.includes("htol-pilot-cohort-runbook.md"),
      "charter missing link to htol-pilot-cohort-runbook.md",
    );
    assert.ok(
      loop.includes("htol-pilot-cohort-runbook.md"),
      "harness-trace-observation-loop missing link to htol-pilot-cohort-runbook.md",
    );
  });
});
