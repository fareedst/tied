/**
 * [REQ-WF_TRIAL_COMPOSITION_EVIDENCE_SUBCHECK] [SC-SUB-01] [SC-SUB-04]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const TEMPLATE = path.join(
  REPO_ROOT,
  "tied-bundle/templates/wf-composition-evidence-subcheck.v2.template.json",
);

describe("wf-composition-evidence-subcheck contract", () => {
  it("template schema_version and verdict enum [SC-SUB-01]", () => {
    const doc = JSON.parse(fs.readFileSync(TEMPLATE, "utf8"));
    assert.equal(doc.schema_version, "wf-composition-evidence-subcheck.v2");
    assert.ok(["pass", "fail", "n_a"].includes(doc.composition_evidence_subcheck));
    assert.equal(doc.primary_lens, "wf-cohort");
  });

  it("MCP tool registered in tools index [SC-SUB-01]", () => {
    const indexPath = path.join(REPO_ROOT, "mcp-server/src/tools/index.ts");
    const src = fs.readFileSync(indexPath, "utf8");
    assert.ok(src.includes("tied_trial_composition_evidence_subcheck"));
  });

  it("record-wf-trial reference cites proof labels dissection [SC-SUB-03]", () => {
    const ref = path.join(REPO_ROOT, "tools/bundled-record-wf-trial-skill/reference.md");
    const text = fs.readFileSync(ref, "utf8");
    assert.match(text, /Proof labels \(dissection\)/i);
  });
});
