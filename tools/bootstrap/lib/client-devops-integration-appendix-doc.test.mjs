/**
 * [REQ-TIED_CLIENT_DEVOPS_APPENDIX] Client DevOps appendix doc contract (Claude comparison Phase 5).
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
  "client-devops-integration-appendix.md",
);
const templatePath = path.join(
  repoRoot,
  "tied-bundle",
  "templates",
  "client-pr-handoff-fields.v1.example.yaml",
);
const indexPath = path.join(repoRoot, "tied-bundle", "docs", "client-development-index.md");

const REQUIRED_MARKERS = [
  "## Proof boundary",
  "## PR handoff fields",
  "## CI and release ownership",
  "## Rollback and staged release",
  "## Compose with Claude comparison phases 1–4",
  "REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER",
  "REQ-TIED_INCIDENT_REVERT_EVAL_CORPUS",
  "rollback",
  "depth_tier",
  "client-owned",
];

describe("client DevOps integration appendix [REQ-TIED_CLIENT_DEVOPS_APPENDIX]", () => {
  it("exists under tied-bundle/docs with required sections", () => {
    assert.ok(fs.existsSync(guidePath), `missing guide: ${guidePath}`);
    const text = fs.readFileSync(guidePath, "utf8");
    for (const marker of REQUIRED_MARKERS) {
      assert.ok(text.includes(marker), `guide missing marker: ${marker}`);
    }
  });

  it("ships example PR handoff fields template under tied-bundle/templates", () => {
    assert.ok(fs.existsSync(templatePath), `missing template: ${templatePath}`);
    const text = fs.readFileSync(templatePath, "utf8");
    assert.ok(text.includes('schema_version: "client-pr-handoff-fields.v1"'));
    assert.ok(text.includes("tests_evidence"));
    assert.ok(text.includes("rollback_plan"));
  });

  it("is linked from client-development-index Quick read", () => {
    const text = fs.readFileSync(indexPath, "utf8");
    assert.ok(text.includes("client-devops-integration-appendix.md"));
  });
});
