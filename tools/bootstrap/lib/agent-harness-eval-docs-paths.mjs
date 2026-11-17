/**
 * [REQ-AGENT_HARNESS_EVALUATION_DOCS] [IMPL-AGENT_HARNESS_EVALUATION_DOCS_PATHS]
 * [REQ-WF_TRIAL_EVALUATION_GUIDE] [IMPL-WF_TRIAL_EVALUATION_GUIDE]
 * Canonical relative and absolute paths for facilitator benchmarking docs.
 */
import path from "node:path";

/** @type {readonly string} */
export const AHE_ROOT_REL = "docs/agent-harness-evaluation";

/** @type {readonly string} */
export const AHE_READOUTS_REL = `${AHE_ROOT_REL}/readouts`;

/** @type {readonly string} */
export const AHE_WF_CATALOG_REL = `${AHE_ROOT_REL}/catalogs/catalog-traditional-workflow-trial-prompts.md`;

/** @type {readonly string} */
export const AHE_SIZE_CATALOG_REL = `${AHE_ROOT_REL}/catalogs/catalog-tied-size-and-trial-statistics.md`;

/** @type {readonly string} */
export const AHE_METERING_CATALOG_REL = `${AHE_ROOT_REL}/catalogs/catalog-harness-metering-lite-workflow.md`;

/** @type {readonly string} */
export const AHE_REGISTRY_REL = `${AHE_ROOT_REL}/registries/traditional-workflow-trial-runs-registry.md`;

/** @type {readonly string} */
export const AHE_COMPARISON_TABLE_REL = `${AHE_ROOT_REL}/cohort/comparison-table.md`;

/** @type {readonly string} */
export const AHE_COHORT_EVIDENCE_REL = `${AHE_ROOT_REL}/cohort/evidence`;

/** @type {readonly string} */
export const AHE_MODEL_CATALOG_REL = `${AHE_ROOT_REL}/config/wf-trial-model-catalog.yaml`;

/** @type {readonly string} */
export const AHE_MODEL_SPECS_REL = `${AHE_ROOT_REL}/config/wf-trial-model-specs.yaml`;

/** @type {readonly string} */
export const AHE_HARNESS_EVAL_REL = `${AHE_ROOT_REL}/harness-eval`;

/** @type {readonly string} */
export const AHE_WORKFLOW_TRIALS_GUIDE_REL = `${AHE_ROOT_REL}/workflow-trials-guide.md`;

/**
 * @param {string} storeRoot repository root (stdd)
 * @returns {{
 *   root: string;
 *   readoutsDir: string;
 *   wfCatalog: string;
 *   sizeCatalog: string;
 *   meteringCatalog: string;
 *   registry: string;
 *   comparisonTable: string;
 *   cohortEvidenceDir: string;
 *   modelCatalogYaml: string;
 *   modelSpecsYaml: string;
 *   harnessEvalRoot: string;
 *   workflowTrialsGuide: string;
 *   readme: string;
 *   operatorCheatsheet: string;
 * }}
 */
export function resolveAhePaths(storeRoot) {
  const root = path.join(storeRoot, AHE_ROOT_REL);
  return {
    root,
    readoutsDir: path.join(root, "readouts"),
    wfCatalog: path.join(root, "catalogs", "catalog-traditional-workflow-trial-prompts.md"),
    sizeCatalog: path.join(root, "catalogs", "catalog-tied-size-and-trial-statistics.md"),
    meteringCatalog: path.join(
      root,
      "catalogs",
      "catalog-harness-metering-lite-workflow.md",
    ),
    registry: path.join(root, "registries", "traditional-workflow-trial-runs-registry.md"),
    comparisonTable: path.join(root, "cohort", "comparison-table.md"),
    cohortEvidenceDir: path.join(root, "cohort", "evidence"),
    modelCatalogYaml: path.join(root, "config", "wf-trial-model-catalog.yaml"),
    modelSpecsYaml: path.join(root, "config", "wf-trial-model-specs.yaml"),
    harnessEvalRoot: path.join(root, "harness-eval"),
    workflowTrialsGuide: path.join(root, "workflow-trials-guide.md"),
    readme: path.join(root, "README.md"),
    operatorCheatsheet: path.join(root, "operator-cheatsheet.md"),
  };
}