/**
 * [REQ-WF_TRIAL_PROOF_MANIFEST_LITE] [SC-MAN-01] [SC-MAN-04]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const TEMPLATE = path.join(REPO_ROOT, "tied-bundle/templates/proof-facet-manifest.v1.template.json");
const VALID_SUBTYPES = [
  "unit.default",
  "composition.wiring",
  "composition.integration",
  "composition.contract",
  "composition.general",
  "binding_inventory.table",
  "e2e.ui",
];

describe("wf-trial-proof-manifest contract", () => {
  it("template schema_version and enums [SC-MAN-01]", () => {
    const raw = fs.readFileSync(TEMPLATE, "utf8");
    const doc = JSON.parse(raw);
    assert.equal(doc.schema_version, "proof-facet-manifest.v1");
    assert.match(doc.prompt_id, /^PROMPT-WF-/);
    for (const row of doc.files ?? []) {
      assert.ok(VALID_SUBTYPES.includes(row.proof_subtype) || row.proof_subtype.startsWith("unit."));
    }
  });

  it("MCP tool registered in built index when dist present", () => {
    const indexPath = path.join(REPO_ROOT, "mcp-server/src/tools/index.ts");
    const src = fs.readFileSync(indexPath, "utf8");
    assert.ok(src.includes("tied_wf_proof_manifest_validate"));
  });
});
