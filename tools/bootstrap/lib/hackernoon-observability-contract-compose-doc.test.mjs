/**
 * [REQ-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3] HackerNoon observability contract compose doc.
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
  "hackernoon-observability-contract-compose.md",
);
const indexPath = path.join(repoRoot, "tied-bundle", "docs", "client-development-index.md");
const citdpPolicyPath = path.join(repoRoot, "tied-bundle", "docs", "citdp-policy.md");
const checklistPath = path.join(
  repoRoot,
  "tied-project",
  "working",
  "REQ-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3",
  "intent-verify-operator-checklist.md",
);
const comparisonPath = path.join(
  repoRoot,
  "docs",
  "comparisons",
  "hackernoon-observability-contract-ci-vs-tied-agent-management.md",
);
const stubPath = path.join(repoRoot, "docs", "comparisons", "hackernoon-observability-contract-ci.md");

const GUIDE_MARKERS = [
  "REQ-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3",
  "## Proof boundary",
  "## Scope slice",
  "## Intent vs verify table",
  "## Observably dead catalog",
  "## Receipt contract schema",
  "## Pair-read",
  "## CITDP prompt",
  "## Anti-patterns",
  "hackernoon-observability-contract-ci-vs-tied-agent-management.md",
  "governance-sensing-proof-boundary-compose.md",
  "pre-handoff-verification-charter.md",
  "implement-complete-receipt-contract",
  "not_measured",
  "tied_checklist_gate_validate",
  "tied_config_get_base_path",
];

describe("HackerNoon observability contract compose [REQ-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3]", () => {
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
      text.includes("hackernoon-observability-contract-compose.md"),
      "client-development-index missing compose guide link",
    );
    assert.ok(
      text.includes("hackernoon-observability-contract-ci-vs-tied-agent-management.md"),
      "client-development-index missing HackerNoon comparison link",
    );
    assert.ok(
      text.includes("REQ-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3"),
      "client-development-index missing REQ token",
    );
  });

  it("intent-verify checklist exists with HPS and comparison links", () => {
    assert.ok(fs.existsSync(checklistPath), `missing checklist: ${checklistPath}`);
    const text = fs.readFileSync(checklistPath, "utf8");
    assert.ok(
      text.includes("authority-boundary-operator-checklist.md"),
      "checklist missing HPS authority checklist link",
    );
    assert.ok(
      text.includes("hackernoon-observability-contract-ci-vs-tied-agent-management.md"),
      "checklist missing HackerNoon comparison link",
    );
  });

  it("citdp-policy documents intent vs verify literacy", () => {
    const text = fs.readFileSync(citdpPolicyPath, "utf8");
    assert.ok(/intent vs verify/i.test(text), "citdp-policy missing intent-vs-verify pointer");
  });

  it("HackerNoon comparison Phase 1 Implemented and names REQ", () => {
    const text = fs.readFileSync(comparisonPath, "utf8");
    assert.ok(
      text.includes("REQ-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3"),
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
      text.includes("hackernoon-observability-contract-compose.md"),
      "stub missing compose guide link",
    );
  });
});