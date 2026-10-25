/**
 * [REQ-TIED_STORE_README_CERTIFIABLE_ONBOARDING] [REQ-TIED_STORE_README_OPERATOR_DELIVERY_SPINE]
 * [REQ-TIED_LEGACY_LAYOUT_DOC_DECOMMISSION]
 * [IMPL-TIED_STORE_README_SECTIONS] [IMPL-TIED_LEGACY_LAYOUT_DOC_DECOMMISSION]
 */
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const readmePath = path.join(repoRoot, "README.md");

const NORMATIVE_H2 = [
  "## Quick start (macOS)",
  "## Performing work in certifiable workflows",
  "## Install and use",
] as const;

const REQUIRED_SUBSTRINGS = [
  "certification-of-workflows.md",
  "client-development-index.md",
  "process-certification-readiness",
  "build-workspace.sh",
  "npm install && npm run build",
  "REQ-TIED_PROCESS_CERTIFICATION_READINESS",
  "tied certification",
  "### Primary operator delivery path",
  "### Store workspace build",
  "tied-install.sh --help",
  "--refresh",
  "/add-feature",
  "/refine-plan",
  "/build-plan",
  "/close-out",
  "git clone",
] as const;

const FORBIDDEN_LEGACY_LAYOUT_DOC_PATTERNS = [
  /--migrate-layout/,
  /legacy `tied\//,
  /or legacy `tied\//,
  /Legacy `tied\/ layout/,
] as const;

const NORMATIVE_QUICK_START_H3 = [
  "### Primary operator delivery path",
  "### Compact feature rhythm",
  "### Store workspace build",
  "### Greenfield",
] as const;

const PRESERVED_HEADINGS = [
  "## Getting started with a new client project",
  "## Primary implementation repository",
  "## TIED source repository setup",
  "## Spec-driven execution (optional)",
  "### Methodology development layout",
] as const;

const FORBIDDEN_CLAIM_PATTERNS = [
  /\bISO\s+certified\b/i,
  /\bCMMI\s+level\s+\d/i,
  /\bcertified\s+EDSE\b/i,
] as const;

describe("store README structure [REQ-TIED_STORE_README_CERTIFIABLE_ONBOARDING]", () => {
  it("README.md exists at repo root", () => {
    assert.equal(fs.existsSync(readmePath), true);
  });

  it("satisfies three-band H2 contract, compact feature rhythm H3, and link/anchor requirements", () => {
    const text = fs.readFileSync(readmePath, "utf8");
    for (const h2 of NORMATIVE_H2) {
      assert.match(text, new RegExp(`^${escapeRegExp(h2)}`, "m"), `missing ${h2}`);
    }
    const quickIdx = text.indexOf(NORMATIVE_H2[0]);
    const certIdx = text.indexOf(NORMATIVE_H2[1]);
    const installIdx = text.indexOf(NORMATIVE_H2[2]);
    assert.ok(quickIdx < certIdx && certIdx < installIdx, "H2 band order");
    for (const sub of REQUIRED_SUBSTRINGS) {
      assert.match(text, new RegExp(escapeRegExp(sub)), `missing substring: ${sub}`);
    }
    for (const heading of PRESERVED_HEADINGS) {
      assert.match(text, new RegExp(`^${escapeRegExp(heading)}`, "m"), `missing ${heading}`);
    }
    for (const pattern of FORBIDDEN_CLAIM_PATTERNS) {
      assert.doesNotMatch(text, pattern, `forbidden certification claim: ${pattern}`);
    }
    for (const pattern of FORBIDDEN_LEGACY_LAYOUT_DOC_PATTERNS) {
      assert.doesNotMatch(text, pattern, `legacy layout doc pattern: ${pattern}`);
    }
    const quickStartEnd = certIdx;
    const quickStart = text.slice(quickIdx, quickStartEnd);
    let prev = -1;
    for (const h3 of NORMATIVE_QUICK_START_H3) {
      const idx = quickStart.indexOf(h3);
      assert.ok(idx >= 0, `missing ${h3} in Quick start band`);
      assert.ok(idx > prev, `H3 order in Quick start: ${h3}`);
      prev = idx;
    }
  });
});

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
