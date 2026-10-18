/**
 * [REQ-TIED_STORE_README_CERTIFIABLE_ONBOARDING] [IMPL-TIED_STORE_README_SECTIONS]
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
  "npm install && npm run build",
  "REQ-TIED_PROCESS_CERTIFICATION_READINESS",
  "tied certification",
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

  it("satisfies three-band H2 contract and link/anchor requirements", () => {
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
  });
});

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
