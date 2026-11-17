/**
 * [REQ-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3] Goal engineering feedback-scope compose doc.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const guidePath = path.join(repoRoot, "tied-bundle", "docs", "goal-engineering-feedback-scope-compose.md");
const indexPath = path.join(repoRoot, "tied-bundle", "docs", "client-development-index.md");
const citdpPolicyPath = path.join(repoRoot, "tied-bundle", "docs", "citdp-policy.md");
const checklistPath = path.join(
  repoRoot,
  "tied-project",
  "working",
  "REQ-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3",
  "goal-aligned-scope-operator-checklist.md",
);
const comparisonPath = path.join(
  repoRoot,
  "docs",
  "comparisons",
  "langchain-goal-engineering-vs-tied-agent-management.md",
);
const stubPath = path.join(repoRoot, "docs", "comparisons", "langchain-goal-engineering.md");

const GUIDE_MARKERS = [
  "REQ-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3",
  "## Proof boundary",
  "## Scope slice",
  "## Feedback-batch analog table",
  "## Tacit-context catalog",
  "## Pair-read",
  "## CITDP prompt",
  "## Anti-patterns",
  "langchain-goal-engineering-vs-tied-agent-management.md",
  "langchain-harness-engineering-vs-tied-agent-management.md",
  "not_measured",
  "tied_checklist_gate_validate",
  "goal-aligned scope",
];

describe("goal engineering feedback-scope compose [REQ-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3]", () => {
  it("compose guide exists with required sections", () => {
    assert.ok(fs.existsSync(guidePath), `missing guide: ${guidePath}`);
    const text = fs.readFileSync(guidePath, "utf8");
    for (const marker of GUIDE_MARKERS) {
      assert.ok(text.includes(marker), `guide missing marker: ${marker}`);
    }
  });

  it("client-development-index Quick reads links compose guide and comparisons", () => {
    const text = fs.readFileSync(indexPath, "utf8");
    assert.ok(
      text.includes("goal-engineering-feedback-scope-compose.md"),
      "client-development-index missing compose guide link",
    );
    assert.ok(
      text.includes("langchain-goal-engineering-vs-tied-agent-management.md"),
      "client-development-index missing goal comparison link",
    );
    assert.ok(
      text.includes("langchain-harness-engineering-vs-tied-agent-management.md"),
      "client-development-index missing harness comparison link",
    );
    assert.ok(
      text.includes("REQ-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3"),
      "client-development-index missing REQ token",
    );
  });

  it("goal-aligned scope checklist exists with HPS and comparison links", () => {
    assert.ok(fs.existsSync(checklistPath), `missing checklist: ${checklistPath}`);
    const text = fs.readFileSync(checklistPath, "utf8");
    assert.ok(
      text.includes("authority-boundary-operator-checklist.md"),
      "checklist missing HPS authority checklist link",
    );
    assert.ok(
      text.includes("langchain-goal-engineering-vs-tied-agent-management.md"),
      "checklist missing goal comparison link",
    );
  });

  it("citdp-policy documents goal-aligned scope literacy", () => {
    const text = fs.readFileSync(citdpPolicyPath, "utf8");
    assert.ok(/goal-aligned/i.test(text), "citdp-policy missing goal-aligned literacy pointer");
    assert.ok(/tacit/i.test(text), "citdp-policy missing tacit context pointer");
  });

  it("goal comparison Phase 1 Implemented and names REQ", () => {
    const text = fs.readFileSync(comparisonPath, "utf8");
    assert.ok(
      text.includes("REQ-TIED_LANGCHAIN_GOAL_ENGINEERING_WAVE3"),
      "comparison missing REQ back-link",
    );
    assert.ok(
      /\|\s*\*\*1\*\*\s*\|[^|]*\|\s*\*\*Implemented\*\*/.test(text),
      "comparison Phase 1 row not Implemented",
    );
  });

  it("stub capture notes link compose guide", () => {
    const text = fs.readFileSync(stubPath, "utf8");
    assert.ok(
      text.includes("goal-engineering-feedback-scope-compose.md"),
      "stub missing compose guide link",
    );
  });
});