/**
 * [REQ-WF_TRIAL_MODEL_COMPOSE] [IMPL-WF_TRIAL_MODEL_COMPOSE]
 */
import { loadWfTrialModelCatalog, defaultWfTrialModelCatalogPath } from "./wf-trial-model-catalog.mjs";

export const WF_TRIAL_MODEL_EFFORT_TIERS = ["low", "medium", "high", "xhigh", "max"];

/**
 * @param {string} effort
 */
export function normalizeComposeEffort(effort) {
  const t = String(effort ?? "").trim().toLowerCase();
  if (t === "" || t === "-") {
    return "";
  }
  return t;
}

/**
 * @param {string} effort
 */
export function effortToModelConfigSuffix(effort) {
  const e = normalizeComposeEffort(effort);
  if (e === "medium") {
    return "med";
  }
  return e;
}

/**
 * @param {string} effort
 */
export function isAllowedComposeEffort(effort) {
  const e = normalizeComposeEffort(effort);
  return e !== "" && WF_TRIAL_MODEL_EFFORT_TIERS.includes(e);
}

/**
 * @typedef {{
 *   catalog_base: string;
 *   model_config_prefix: string;
 *   speed_suffix?: string;
 *   effort_in_slug?: boolean;
 * }} WfTrialComposeFamily
 */

/**
 * @param {string} familyKey
 * @param {string} effort
 * @param {WfTrialComposeFamily} family
 * @param {string} [catalogPath]
 */
export function composeCursorCatalogSlug(familyKey, effort, family, catalogPath) {
  const e = normalizeComposeEffort(effort);
  if (!isAllowedComposeEffort(e)) {
    const err = new Error(`effort required for compose family ${familyKey} (low|medium|high|xhigh|max)`);
    err.code = "EFFORT_REQUIRED_FOR_COMPOSE";
    throw err;
  }
  const speed = family.speed_suffix ?? "fast";
  const effortInSlug = family.effort_in_slug !== false;
  let modelSlug;
  if (!effortInSlug) {
    modelSlug = speed ? `${family.catalog_base}-${speed}` : family.catalog_base;
  } else {
    modelSlug = `${family.catalog_base}-${e}-${speed}`;
  }
  const cfgSuffix = effortToModelConfigSuffix(e);
  const modelConfig = `${family.model_config_prefix}-${cfgSuffix}`;
  const catalog = loadWfTrialModelCatalog(catalogPath ?? defaultWfTrialModelCatalogPath());
  if (!catalog.cursorBySlug.has(modelSlug)) {
    const err = new Error(
      `composed slug not in catalog: ${modelSlug} (regen: node tools/bootstrap/sync-wf-trial-model-catalog.mjs)`,
    );
    err.code = "COMPOSED_SLUG_NOT_IN_CATALOG";
    throw err;
  }
  return {
    family: familyKey,
    model_slug: modelSlug,
    model_config: modelConfig,
    effort: e,
  };
}
