/**
 * [REQ-TIED_INCIDENT_REVERT_EVAL_CORPUS] Guide doc contract (Claude comparison Phase 4).
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
  "incident-revert-evaluation-corpus.md",
);
const templatePath = path.join(
  repoRoot,
  "tied-bundle",
  "templates",
  "evaluation-corpus-incident-revert-rows.v1.example.yaml",
);

const REQUIRED_MARKERS = [
  "## Proof boundary",
  "## Case kinds",
  "## Evaluation corpus rows",
  "## Pilot bounds and stop criteria",
  "## Compose with closed Loop 3 programs",
  "evaluation-corpus.v1",
  "review false positive",
  "REQ-TIED_REVIEW_CONVERGENCE_POLICY",
  "denominator",
];

describe("incident revert eval corpus guide [REQ-TIED_INCIDENT_REVERT_EVAL_CORPUS]", () => {
  it("exists under tied-bundle/docs with required sections", () => {
    assert.ok(fs.existsSync(guidePath), `missing guide: ${guidePath}`);
    const text = fs.readFileSync(guidePath, "utf8");
    for (const marker of REQUIRED_MARKERS) {
      assert.ok(text.includes(marker), `guide missing marker: ${marker}`);
    }
  });

  it("ships example corpus rows template under tied-bundle/templates", () => {
    assert.ok(fs.existsSync(templatePath), `missing template: ${templatePath}`);
    const text = fs.readFileSync(templatePath, "utf8");
    assert.ok(text.includes('schema_version: "evaluation-corpus.v1"'));
    assert.ok(text.includes("review_false_positive"));
    assert.ok(text.includes("post_merge_incident"));
  });
});
