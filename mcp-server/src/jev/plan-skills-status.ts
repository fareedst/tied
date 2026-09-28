/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 */

import { DEFAULT_JEV_API_BASE, DEFAULT_JEV_MODEL } from "./constants.js";
import { resolveJevConfig } from "./client.js";
import { resolvePlanSkillsConfig } from "./plan-skills-config.js";
import {
  PLAN_SKILLS_STATUS_PROOF_BOUNDARY,
  PLAN_SKILLS_STATUS_SCHEMA,
} from "./plan-skills-types.js";

function redactApiBase(apiBase: string): string {
  try {
    const u = new URL(apiBase);
    return `${u.protocol}//${u.host}/…`;
  } catch {
    return "[invalid-base]";
  }
}

export function buildPlanSkillsStatus(
  projectRoot: string,
  env: NodeJS.ProcessEnv = process.env,
): Record<string, unknown> {
  const cfg = resolvePlanSkillsConfig(projectRoot, env);
  const jevCfg = resolveJevConfig(env);
  const keyPresent = (jevCfg.apiKey?.trim() ?? "").length > 0;

  return {
    schema: PLAN_SKILLS_STATUS_SCHEMA,
    enabled: cfg.enabled,
    enabled_source: cfg.enabled_source,
    key_present: keyPresent,
    model: jevCfg.model ?? DEFAULT_JEV_MODEL,
    api_base_redacted: redactApiBase(jevCfg.apiBase ?? DEFAULT_JEV_API_BASE),
    timeout_ms: cfg.timeout_ms,
    readiness: cfg.enabled ? "not_probed" : "disabled",
    proof_boundary: PLAN_SKILLS_STATUS_PROOF_BOUNDARY,
    ...(cfg.diagnostics.length > 0 ? { diagnostics: cfg.diagnostics } : {}),
  };
}
