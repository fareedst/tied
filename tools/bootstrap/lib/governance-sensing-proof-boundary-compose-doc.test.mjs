/**
 * [REQ-TIED_OPEN_GOVERNANCE_SENSING_WAVE3] Governance sensing proof-boundary compose doc.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const guidePath = path.join(repoRoot, "tied-bundle", "docs", "governance-sensing-proof-boundary-compose.md");
const indexPath = path.join(repoRoot, "tied-bundle", "docs", "client-development-index.md");
const citdpPolicyPath = path.join(repoRoot, "tied-bundle", "docs", "citdp-policy.md");
const checklistPath = path.join(
  repoRoot,
  "tied-project",
  "working",
  "REQ-TIED_OPEN_GOVERNANCE_SENSING_WAVE3",
  "odourless-zones-operator-checklist.md",
);
const comparisonPath = path.join(
  repoRoot,
  "docs",
  "comparisons",
  "open-governance-cannot-sense-vs-tied-agent-management.md",
);
const stubPath = path.join(repoRoot, "docs", "comparisons", "open-governance-cannot-sense.md");

const GUIDE_MARKERS = [
  "REQ-TIED_OPEN_GOVERNANCE_SENSING_WAVE3",
  "## Proof boundary",
  "## Scope slice",
  "## Mercaptan analog table",
  "## Odourless-zone catalog",
  "## Pair-read",
  "## CITDP prompt",
  "## Anti-patterns",
  "open-governance-cannot-sense-vs-tied-agent-management.md",
  "andras-ludanyi-illusion-of-measurement-judgment-cooperation-vs-tied-agent-management.md",
  "not_measured",
  "tied_checklist_gate_validate",
  "tied_config_get_base_path",
];

describe("governance sensing proof-boundary compose [REQ-TIED_OPEN_GOVERNANCE_SENSING_WAVE3]", () => {
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
      text.includes("governance-sensing-proof-boundary-compose.md"),
      "client-development-index missing compose guide link",
    );
    assert.ok(
      text.includes("open-governance-cannot-sense-vs-tied-agent-management.md"),
      "client-development-index missing Open Governance comparison link",
    );
    assert.ok(
      text.includes("andras-ludanyi-illusion-of-measurement-judgment-cooperation-vs-tied-agent-management.md"),
      "client-development-index missing Ludanyi comparison link",
    );
    assert.ok(
      text.includes("REQ-TIED_OPEN_GOVERNANCE_SENSING_WAVE3"),
      "client-development-index missing REQ token",
    );
  });

  it("odourless zones checklist exists with HPS and comparison links", () => {
    assert.ok(fs.existsSync(checklistPath), `missing checklist: ${checklistPath}`);
    const text = fs.readFileSync(checklistPath, "utf8");
    assert.ok(
      text.includes("authority-boundary-operator-checklist.md"),
      "checklist missing HPS authority checklist link",
    );
    assert.ok(
      text.includes("open-governance-cannot-sense-vs-tied-agent-management.md"),
      "checklist missing Open Governance comparison link",
    );
  });

  it("citdp-policy documents odourless zones literacy", () => {
    const text = fs.readFileSync(citdpPolicyPath, "utf8");
    assert.ok(/odourless/i.test(text), "citdp-policy missing odourless literacy pointer");
  });

  it("Open Governance comparison Phase 1 Implemented and names REQ", () => {
    const text = fs.readFileSync(comparisonPath, "utf8");
    assert.ok(
      text.includes("REQ-TIED_OPEN_GOVERNANCE_SENSING_WAVE3"),
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
      text.includes("governance-sensing-proof-boundary-compose.md"),
      "stub missing compose guide link",
    );
  });
});