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
const qaVocabPath = path.join(repoRoot, "tied-project", "vocab", "quality-assurance.md");
const comparisonPath = path.join(
  repoRoot,
  "docs",
  "comparisons",
  "anthropic-llm-formal-verification-vs-tied-agent-management.md",
);

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

  it("Phase 2: quality-assurance vocab RECORD for checker-backed claim and theorem statement", () => {
    assert.ok(fs.existsSync(qaVocabPath), `missing vocab: ${qaVocabPath}`);
    const text = fs.readFileSync(qaVocabPath, "utf8");
    assert.ok(text.includes("CHECKER_BACKED_CLAIM"), "quality-assurance missing CHECKER_BACKED_CLAIM bridge");
    assert.ok(text.includes("THEOREM_STATEMENT"), "quality-assurance missing THEOREM_STATEMENT bridge");
    assert.ok(
      text.includes("does not imply") && text.includes("tied_verify"),
      "quality-assurance missing checker-backed non-implication vs tied_verify",
    );
  });

  it("Phase 2: guide bidirectionally links canonical vocab", () => {
    const text = fs.readFileSync(guidePath, "utf8");
    assert.ok(
      text.includes("tied-project/vocab/quality-assurance.md"),
      "guide missing link to quality-assurance canonical vocab",
    );
    assert.ok(
      text.includes("CHECKER_BACKED_CLAIM") || text.includes("Canonical vocab"),
      "guide missing Phase 2 canonical vocab pointer",
    );
  });

  it("Phase 2: Anthropic comparison phased table marks vocab RECORD Done", () => {
    const text = fs.readFileSync(comparisonPath, "utf8");
    assert.ok(
      text.includes("checker-backed claim") &&
        text.includes("theorem statement") &&
        /\|\s*\*\*2\*\*\s*\|[^|]*\|\s*\*\*Done\*\*/.test(text),
      "comparison Phase 2 row not Done",
    );
  });

  it("Phase 3: guide documents envelope compose for independent_proofs", () => {
    const text = fs.readFileSync(guidePath, "utf8");
    assert.ok(text.includes("## Envelope compose"), "guide missing Envelope compose section");
    assert.ok(text.includes("independent_proofs"), "guide missing independent_proofs");
    assert.ok(text.includes("checker_backed_claim"), "guide missing proof_kind checker_backed_claim");
    assert.ok(
      text.includes("does not imply") && text.includes("tied_verify"),
      "guide envelope compose missing non-implication vs tied_verify",
    );
  });

  it("Phase 3: Anthropic comparison phased table marks matrix and envelope Done", () => {
    const text = fs.readFileSync(comparisonPath, "utf8");
    assert.ok(
      /\|\s*\*\*3\*\*\s*\|[^|]*formal-methods[^|]*\|\s*\*\*Done\*\*/i.test(text),
      "comparison Phase 3 matrix row not Done",
    );
    assert.ok(
      /\|\s*\*\*3\*\*\s*\|[^|]*envelope[^|]*\|\s*\*\*Done\*\*/i.test(text),
      "comparison Phase 3 envelope row not Done",
    );
    assert.ok(
      /\|\s*\*\*3\*\*\s*\|[^|]*36-task[^|]*\|\s*\*\*Defer\*\*/i.test(text),
      "comparison Phase 3 benchmark row must remain Defer",
    );
  });
});
