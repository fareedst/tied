/**
 * [REQ-AGENT_HARNESS_EVALUATION_DOCS] Layout contract for agent-harness-evaluation docs.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  AHE_COHORT_EVIDENCE_REL,
  AHE_COMPARISON_TABLE_REL,
  AHE_HARNESS_EVAL_REL,
  AHE_READOUTS_REL,
  AHE_REGISTRY_REL,
  AHE_ROOT_REL,
  AHE_WF_CATALOG_REL,
  AHE_WORKFLOW_TRIALS_GUIDE_REL,
  resolveAhePaths,
} from "./agent-harness-eval-docs-paths.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

describe("agent harness eval docs paths [REQ-AGENT_HARNESS_EVALUATION_DOCS]", () => {
  it("T-AHE-PATH-01: relative constants match expected layout", () => {
    assert.equal(AHE_ROOT_REL, "docs/agent-harness-evaluation");
    assert.match(AHE_READOUTS_REL, /readouts$/);
    assert.match(AHE_WF_CATALOG_REL, /catalog-traditional-workflow-trial-prompts\.md$/);
    assert.match(AHE_REGISTRY_REL, /traditional-workflow-trial-runs-registry\.md$/);
    assert.equal(AHE_COMPARISON_TABLE_REL, `${AHE_ROOT_REL}/cohort/comparison-table.md`);
    assert.equal(AHE_COHORT_EVIDENCE_REL, `${AHE_ROOT_REL}/cohort/evidence`);
    assert.equal(AHE_HARNESS_EVAL_REL, `${AHE_ROOT_REL}/harness-eval`);
    assert.equal(
      AHE_WORKFLOW_TRIALS_GUIDE_REL,
      `${AHE_ROOT_REL}/workflow-trials-guide.md`,
    );
  });

  it("T-AHE-PATH-02: resolveAhePaths joins under store root", () => {
    const p = resolveAhePaths(repoRoot);
    assert.equal(p.root, path.join(repoRoot, AHE_ROOT_REL));
    assert.equal(p.readoutsDir, path.join(repoRoot, AHE_READOUTS_REL));
    assert.equal(p.comparisonTable, path.join(repoRoot, AHE_COMPARISON_TABLE_REL));
    assert.equal(p.workflowTrialsGuide, path.join(repoRoot, AHE_WORKFLOW_TRIALS_GUIDE_REL));
  });

  it("T-AHE-MV-01: corpus directories exist on disk", () => {
    const p = resolveAhePaths(repoRoot);
    for (const dir of [
      p.root,
      p.readoutsDir,
      path.dirname(p.wfCatalog),
      path.dirname(p.registry),
      path.dirname(p.comparisonTable),
      p.cohortEvidenceDir,
      path.dirname(p.modelCatalogYaml),
      p.harnessEvalRoot,
    ]) {
      assert.ok(fs.existsSync(dir), `missing ${dir}`);
    }
  });
});