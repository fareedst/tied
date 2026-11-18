/**
 * [REQ-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3] Meta Astryx DS agent plane compose doc.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const guidePath = path.join(repoRoot, "tied-bundle", "docs", "meta-astryx-ds-agent-plane-compose.md");
const indexPath = path.join(repoRoot, "tied-bundle", "docs", "client-development-index.md");
const taxonomyPath = path.join(repoRoot, "tied-project", "vocab", "harness-platform-taxonomy.md");
const checklistPath = path.join(
  repoRoot,
  "tied-project",
  "working",
  "REQ-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3",
  "ds-agent-plane-operator-checklist.md",
);
const comparisonPath = path.join(
  repoRoot,
  "docs",
  "comparisons",
  "meta-astryx-design-system-vs-tied-agent-management.md",
);
const stubPath = path.join(repoRoot, "docs", "comparisons", "meta-astryx-design-system.md");

const GUIDE_MARKERS = [
  "REQ-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3",
  "## Proof boundary",
  "## Scope slice",
  "## AGENTS.md and init vs TIED install",
  "## Knowledge records vs token graph",
  "## Vibe tests vs gates",
  "## Pair-read",
  "## CITDP prompt",
  "## Anti-patterns",
  "meta-astryx-design-system-vs-tied-agent-management.md",
  "google-agent-skills-vs-tied-agent-management.md",
  "persante-sdd-skills-vs-tied-agent-management.md",
  "not_measured",
  "tied_verify",
  "tied_checklist_gate_validate",
  "current",
];

describe("meta astryx ds agent plane compose [REQ-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3]", () => {
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
      text.includes("meta-astryx-ds-agent-plane-compose.md"),
      "client-development-index missing compose guide link",
    );
    assert.ok(
      text.includes("meta-astryx-design-system-vs-tied-agent-management.md"),
      "client-development-index missing Meta Astryx comparison link",
    );
    assert.ok(
      text.includes("REQ-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3"),
      "client-development-index missing REQ token",
    );
  });

  it("ds agent plane checklist exists with HPS and comparison links", () => {
    assert.ok(fs.existsSync(checklistPath), `missing checklist: ${checklistPath}`);
    const text = fs.readFileSync(checklistPath, "utf8");
    assert.ok(
      text.includes("authority-boundary-operator-checklist.md"),
      "checklist missing HPS authority checklist link",
    );
    assert.ok(
      text.includes("meta-astryx-design-system-vs-tied-agent-management.md"),
      "checklist missing Meta Astryx comparison link",
    );
  });

  it("harness-platform-taxonomy documents design-system agent plane cross-link", () => {
    const text = fs.readFileSync(taxonomyPath, "utf8");
    assert.ok(
      text.includes("meta-astryx-ds-agent-plane-compose.md"),
      "taxonomy missing compose guide link",
    );
    assert.ok(/design-system|agent-ready/i.test(text), "taxonomy missing design-system agent plane mention");
  });

  it("comparison Wave 3 doc slice Phase 1 Implemented and names REQ", () => {
    const text = fs.readFileSync(comparisonPath, "utf8");
    assert.ok(
      text.includes("REQ-TIED_META_ASTRYX_DESIGN_SYSTEM_WAVE3"),
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
      text.includes("meta-astryx-ds-agent-plane-compose.md"),
      "stub missing compose guide link",
    );
  });
});