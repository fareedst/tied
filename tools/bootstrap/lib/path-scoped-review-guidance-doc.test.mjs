/**
 * [REQ-TIED_PATH_SCOPED_REVIEW_GUIDANCE] Path-scoped REVIEW.md guidance doc contract.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const guidePath = path.join(repoRoot, "tied-bundle", "docs", "path-scoped-review-guidance.md");
const reviewExamplePath = path.join(
  repoRoot,
  "tied-bundle",
  "templates",
  "path-scoped-REVIEW.v1.example.md",
);
const indexExamplePath = path.join(
  repoRoot,
  "tied-bundle",
  "templates",
  "tied-project-review-index.v1.example.md",
);
const indexPath = path.join(repoRoot, "tied-bundle", "docs", "client-development-index.md");

const REQUIRED_MARKERS = [
  "## Proof boundary",
  "## Layout patterns",
  "tied-project/review/",
  "REVIEW.md",
  "pre-handoff-verification-charter.md",
  "review-convergence-policy.md",
  "client-owned",
  "REQ-TIED_PATH_SCOPED_REVIEW_GUIDANCE",
];

describe("path-scoped review guidance [REQ-TIED_PATH_SCOPED_REVIEW_GUIDANCE]", () => {
  it("exists under tied-bundle/docs with required sections", () => {
    assert.ok(fs.existsSync(guidePath), `missing guide: ${guidePath}`);
    const text = fs.readFileSync(guidePath, "utf8");
    for (const marker of REQUIRED_MARKERS) {
      assert.ok(text.includes(marker), `guide missing marker: ${marker}`);
    }
  });

  it("ships example REVIEW.md and review index templates", () => {
    assert.ok(fs.existsSync(reviewExamplePath), `missing: ${reviewExamplePath}`);
    assert.ok(fs.existsSync(indexExamplePath), `missing: ${indexExamplePath}`);
    const reviewText = fs.readFileSync(reviewExamplePath, "utf8");
    assert.ok(reviewText.includes("path-scoped-REVIEW.v1"));
    assert.ok(reviewText.includes("Proof boundary"));
    const indexText = fs.readFileSync(indexExamplePath, "utf8");
    assert.ok(indexText.includes("tied-project-review-index.v1"));
    assert.ok(indexText.includes("Path map"));
  });

  it("is linked from client-development-index Quick read", () => {
    const text = fs.readFileSync(indexPath, "utf8");
    assert.ok(text.includes("path-scoped-review-guidance.md"));
  });
});
