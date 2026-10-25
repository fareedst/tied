/**
 * [REQ-TIED_VERIFICATION_GATED] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] PLAN-GF-05-SCOPE-VERIFY-GATE-COMMON
 * How: contract tests lock SC-SUB-VERIFY-GATE and SC-SKILL-EXAMPLE for common checklist_gate before tied_verify update.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const checklistYaml = path.join(
  repoRoot,
  "tied-bundle/docs/agent-req-implementation-checklist.yaml",
);
const checklistMd = path.join(repoRoot, "tied-bundle/docs/agent-req-implementation-checklist.md");
const processesMd = path.join(repoRoot, "tied-bundle/docs/processes.md");
const tiedYamlSkill = path.join(repoRoot, "tools/bundled-tied-yaml-skill/SKILL.md");

const SUB_SLUG = "sub-checklist-gate-before-verify-update";

describe("GF-05 Track B verify gate checklist contracts [PLAN-GF-05-SCOPE-VERIFY-GATE-COMMON]", () => {
  it("checklist YAML defines sub-checklist-gate-before-verify-update [SC-SUB-VERIFY-GATE]", () => {
    const text = fs.readFileSync(checklistYaml, "utf8");
    assert.match(text, new RegExp(`slug: "${SUB_SLUG}"`));
    assert.match(text, /invoked_by:[\s\S]*verification-gate[\s\S]*traceable-commit/);
    assert.match(text, /CALL sub-checklist-gate-before-verify-update/);
    assert.match(text, /unwrapped inner CITDP/i);
  });

  it("checklist MD mirrors sub slug and inner CITDP rule [SC-SUB-VERIFY-GATE]", () => {
    const text = fs.readFileSync(checklistMd, "utf8");
    assert.match(text, new RegExp(SUB_SLUG));
    assert.match(text, /checklist_gate/i);
    assert.match(text, /inner CITDP/i);
  });

  it("processes.md PROC-TIED_VERIFICATION_GATED cross-links sub procedure [SC-PROC-XREF]", () => {
    const text = fs.readFileSync(processesMd, "utf8");
    assert.match(text, /\[PROC-TIED_VERIFICATION_GATED\][\s\S]*sub-checklist-gate-before-verify-update/);
  });

  it("bundled tied-yaml skill documents tied_verify with checklist_gate [SC-SKILL-EXAMPLE]", () => {
    const text = fs.readFileSync(tiedYamlSkill, "utf8");
    assert.match(text, /checklist_gate/);
    assert.match(text, /missing_checklist_gate/);
    assert.match(text, /sub-checklist-gate-before-verify-update/);
    assert.match(text, /inner CITDP/i);
  });
});
