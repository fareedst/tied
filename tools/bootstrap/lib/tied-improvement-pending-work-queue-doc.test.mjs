/**
 * [REQ-TIED_IMPROVEMENT_PENDING_WORK_QUEUE] Queue management guide contract (v1).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const guidePath = path.join(
  repoRoot,
  "tied-bundle",
  "docs",
  "tied-improvement-pending-work-queue.md",
);
const templatePath = path.join(
  repoRoot,
  "tied-bundle",
  "templates",
  "tied-improvement-pending-work-queue.v1.example.md",
);

const REQUIRED_MARKERS = [
  "## Proof boundary",
  "## Primary queue path",
  "## Task schema",
  "## Handoff and close-out maintenance",
  "## Distinction from other backlog surfaces",
  "TIED-IMPROVEMENT-PENDING-WORK-QUEUE.md",
  "REQ-TIED_IMPROVEMENT_PENDING_WORK_QUEUE",
];

describe("tied improvement pending work queue doc [REQ-TIED_IMPROVEMENT_PENDING_WORK_QUEUE]", () => {
  it("guide exists under tied-bundle/docs with required sections", () => {
    assert.ok(fs.existsSync(guidePath), `missing guide: ${guidePath}`);
    const text = fs.readFileSync(guidePath, "utf8");
    for (const marker of REQUIRED_MARKERS) {
      assert.ok(text.includes(marker), `guide missing marker: ${marker}`);
    }
  });

  it("example template exists with header and task table", () => {
    assert.ok(fs.existsSync(templatePath), `missing template: ${templatePath}`);
    const text = fs.readFileSync(templatePath, "utf8");
    assert.ok(text.includes("Primary TIED Improvement and Maintenance Queue"));
    assert.ok(text.includes("| task_id |"));
  });
});
