/**
 * [REQ-TIED_FURMANOV_FACTORY_PROFILE_WAVE3] Furmanov factory profile compose doc.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const guidePath = path.join(repoRoot, "tied-bundle", "docs", "furmanov-factory-profile-compose.md");
const indexPath = path.join(repoRoot, "tied-bundle", "docs", "client-development-index.md");
const citdpPolicyPath = path.join(repoRoot, "tied-bundle", "docs", "citdp-policy.md");
const checklistPath = path.join(
  repoRoot,
  "tied-project",
  "working",
  "REQ-TIED_FURMANOV_FACTORY_PROFILE_WAVE3",
  "factory-profile-operator-checklist.md",
);
const comparisonPath = path.join(
  repoRoot,
  "docs",
  "comparisons",
  "afurmanov-harness-profiler-vs-tied-agent-management.md",
);
const stubPath = path.join(repoRoot, "docs", "comparisons", "afurmanov-harness-profiler.md");

const GUIDE_MARKERS = [
  "REQ-TIED_FURMANOV_FACTORY_PROFILE_WAVE3",
  "## Proof boundary",
  "## Scope slice",
  "## Context and fork analog table",
  "## PASS vs structure catalog",
  "## check-trace vs gates table",
  "## Pair-read",
  "## CITDP prompt",
  "## Anti-patterns",
  "afurmanov-harness-profiler-vs-tied-agent-management.md",
  "langchain-harness-engineering-vs-tied-agent-management.md",
  "cursor-harness-engineering-vs-tied-agent-management.md",
  "not_measured",
  "tied_checklist_gate_validate",
  "check-trace",
  "factory invariants",
];

describe("furmanov factory profile compose [REQ-TIED_FURMANOV_FACTORY_PROFILE_WAVE3]", () => {
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
      text.includes("furmanov-factory-profile-compose.md"),
      "client-development-index missing compose guide link",
    );
    assert.ok(
      text.includes("afurmanov-harness-profiler-vs-tied-agent-management.md"),
      "client-development-index missing Furmanov comparison link",
    );
    assert.ok(
      text.includes("REQ-TIED_FURMANOV_FACTORY_PROFILE_WAVE3"),
      "client-development-index missing REQ token",
    );
  });

  it("factory profile checklist exists with HPS and comparison links", () => {
    assert.ok(fs.existsSync(checklistPath), `missing checklist: ${checklistPath}`);
    const text = fs.readFileSync(checklistPath, "utf8");
    assert.ok(
      text.includes("authority-boundary-operator-checklist.md"),
      "checklist missing HPS authority checklist link",
    );
    assert.ok(
      text.includes("afurmanov-harness-profiler-vs-tied-agent-management.md"),
      "checklist missing Furmanov comparison link",
    );
  });

  it("citdp-policy documents factory profile literacy", () => {
    const text = fs.readFileSync(citdpPolicyPath, "utf8");
    assert.ok(/factory profile/i.test(text), "citdp-policy missing factory profile pointer");
    assert.ok(/check-trace/i.test(text), "citdp-policy missing check-trace pointer");
  });

  it("comparison Wave 3 doc slice Implemented and names REQ", () => {
    const text = fs.readFileSync(comparisonPath, "utf8");
    assert.ok(
      text.includes("REQ-TIED_FURMANOV_FACTORY_PROFILE_WAVE3"),
      "comparison missing REQ back-link",
    );
    assert.ok(
      /\|\s*\*\*2\*\*\s*\|[^|]*\|\s*\*\*Implemented\*\*/.test(text),
      "comparison Phase 2 row not Implemented",
    );
  });

  it("stub capture notes link compose guide", () => {
    const text = fs.readFileSync(stubPath, "utf8");
    assert.ok(
      text.includes("furmanov-factory-profile-compose.md"),
      "stub missing compose guide link",
    );
  });
});