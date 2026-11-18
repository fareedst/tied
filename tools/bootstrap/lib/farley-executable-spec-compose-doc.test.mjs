/**
 * [REQ-TIED_FARLEY_EXECUTABLE_SPEC_WAVE3] Farley executable spec compose doc.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const guidePath = path.join(repoRoot, "tied-bundle", "docs", "farley-executable-spec-compose.md");
const indexPath = path.join(repoRoot, "tied-bundle", "docs", "client-development-index.md");
const citdpPolicyPath = path.join(repoRoot, "tied-bundle", "docs", "citdp-policy.md");
const checklistPath = path.join(
  repoRoot,
  "tied-project",
  "working",
  "REQ-TIED_FARLEY_EXECUTABLE_SPEC_WAVE3",
  "executable-spec-operator-checklist.md",
);
const comparisonPath = path.join(
  repoRoot,
  "docs",
  "comparisons",
  "dave-farley-spec-must-be-executable-vs-tied-agent-management.md",
);
const stubPath = path.join(repoRoot, "docs", "comparisons", "dave-farley-spec-must-be-executable.md");

const GUIDE_MARKERS = [
  "REQ-TIED_FARLEY_EXECUTABLE_SPEC_WAVE3",
  "## Proof boundary",
  "## Scope slice",
  "## Executable acceptance vs IMP pseudo-code",
  "## Red-first and protected contract",
  "## Markdown SDD vs running examples",
  "## Pair-read",
  "## CITDP prompt",
  "## Anti-patterns",
  "dave-farley-spec-must-be-executable-vs-tied-agent-management.md",
  "ai-sdlc-atdd-software-factory-vs-tied.md",
  "persante-sdd-skills-vs-tied-agent-management.md",
  "not_measured",
  "tied_verify",
  "tied_checklist_gate_validate",
  "executable behavioral contract",
];

describe("farley executable spec compose [REQ-TIED_FARLEY_EXECUTABLE_SPEC_WAVE3]", () => {
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
      text.includes("farley-executable-spec-compose.md"),
      "client-development-index missing compose guide link",
    );
    assert.ok(
      text.includes("dave-farley-spec-must-be-executable-vs-tied-agent-management.md"),
      "client-development-index missing comparison link",
    );
    assert.ok(
      text.includes("ai-sdlc-atdd-software-factory-vs-tied.md"),
      "client-development-index missing AI-SDLC factory pair-read link",
    );
    assert.ok(
      text.includes("REQ-TIED_FARLEY_EXECUTABLE_SPEC_WAVE3"),
      "client-development-index missing REQ token",
    );
  });

  it("executable-spec checklist exists with pre-handoff and comparison links", () => {
    assert.ok(fs.existsSync(checklistPath), `missing checklist: ${checklistPath}`);
    const text = fs.readFileSync(checklistPath, "utf8");
    assert.ok(
      text.includes("pre-handoff-verification-charter.md"),
      "checklist missing pre-handoff charter link",
    );
    assert.ok(
      text.includes("dave-farley-spec-must-be-executable-vs-tied-agent-management.md"),
      "checklist missing comparison link",
    );
  });

  it("citdp-policy documents executable behavioral contract literacy", () => {
    const text = fs.readFileSync(citdpPolicyPath, "utf8");
    assert.ok(/executable behavioral contract/i.test(text), "citdp-policy missing contract pointer");
    assert.ok(/markdown-only tacit/i.test(text), "citdp-policy missing tacit zones pointer");
  });

  it("farley comparison Phase 1 Implemented and names REQ", () => {
    const text = fs.readFileSync(comparisonPath, "utf8");
    assert.ok(text.includes("REQ-TIED_FARLEY_EXECUTABLE_SPEC_WAVE3"), "comparison missing REQ back-link");
    assert.ok(
      /\|\s*\*\*1\*\*\s*\|[^|]*\|\s*\*\*Implemented\*\*/.test(text),
      "comparison Phase 1 row not Implemented",
    );
    assert.ok(
      text.includes("farley-executable-spec-compose.md"),
      "comparison missing compose guide link",
    );
  });

  it("stub capture notes link compose guide", () => {
    const text = fs.readFileSync(stubPath, "utf8");
    assert.ok(text.includes("farley-executable-spec-compose.md"), "stub missing compose guide link");
  });
});