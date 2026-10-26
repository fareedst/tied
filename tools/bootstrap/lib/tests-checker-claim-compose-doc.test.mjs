/**
 * [REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE] Tests vs checker-backed claims compose doc (Wave 3 Phase 1).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const guidePath = path.join(repoRoot, "tied-bundle", "docs", "tests-vs-checker-backed-claims.md");
const indexPath = path.join(repoRoot, "tied-bundle", "docs", "client-development-index.md");
const pseudocodePath = path.join(repoRoot, "tied-bundle", "docs", "pseudocode-writing-and-validation.md");

const GUIDE_MARKERS = [
  "## Proof boundary",
  "## Claim classes",
  "## TIED surfaces (reference)",
  "anthropic-llm-formal-verification-vs-tied-agent-management.md",
  "pseudocode_validate",
  "tied_verify",
  "not_measured",
];

describe("tests vs checker-backed claims compose doc [REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE]", () => {
  it("guide exists with required sections and comparison link", () => {
    assert.ok(fs.existsSync(guidePath), `missing guide: ${guidePath}`);
    const text = fs.readFileSync(guidePath, "utf8");
    for (const marker of GUIDE_MARKERS) {
      assert.ok(text.includes(marker), `guide missing marker: ${marker}`);
    }
  });

  it("client-development-index links the guide in Quick reads", () => {
    const text = fs.readFileSync(indexPath, "utf8");
    assert.ok(
      text.includes("tests-vs-checker-backed-claims.md"),
      "client-development-index missing tests-vs-checker-backed-claims.md link",
    );
    assert.ok(
      text.includes("anthropic-llm-formal-verification-vs-tied-agent-management.md"),
      "client-development-index missing Anthropic FV comparison link",
    );
  });

  it("pseudocode-writing-and-validation cross-links the guide", () => {
    const text = fs.readFileSync(pseudocodePath, "utf8");
    assert.ok(
      text.includes("tests-vs-checker-backed-claims.md"),
      "pseudocode guide missing cross-link to tests-vs-checker-backed-claims.md",
    );
  });
});
