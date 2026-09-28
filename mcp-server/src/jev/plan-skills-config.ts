/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 * RESOLVE_PLAN_SKILLS_CONFIG
 */

import { manifestEnablesJevPlanSkills, readRepoTiedYaml } from "./repo-tied-yaml.js";
import type { PlanSkillsEnabledSource } from "./plan-skills-types.js";

export const DEFAULT_PLAN_SKILLS_TIMEOUT_MS = 3000;
export const MAX_PLAN_SKILLS_TIMEOUT_MS = 60_000;

export type PlanSkillsConfigResolution = {
  enabled: boolean;
  enabled_source: PlanSkillsEnabledSource;
  timeout_ms: number;
  diagnostics: string[];
};

function parseEnvPlanSkillsFlag(raw: string): { enabled: boolean; valid: boolean } {
  const v = raw.trim().toLowerCase();
  if (v === "1" || v === "true") return { enabled: true, valid: true };
  if (v === "0" || v === "false") return { enabled: false, valid: true };
  return { enabled: false, valid: false };
}

export function resolvePlanSkillsTimeoutMs(
  env: NodeJS.ProcessEnv = process.env,
): Pick<PlanSkillsConfigResolution, "timeout_ms" | "diagnostics"> {
  const diagnostics: string[] = [];
  const raw = env.JEV_PLAN_SKILLS_TIMEOUT_MS;
  if (raw === undefined || raw.trim() === "") {
    return { timeout_ms: DEFAULT_PLAN_SKILLS_TIMEOUT_MS, diagnostics };
  }
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0 || n > MAX_PLAN_SKILLS_TIMEOUT_MS) {
    diagnostics.push("invalid_plan_skills_timeout");
    return { timeout_ms: DEFAULT_PLAN_SKILLS_TIMEOUT_MS, diagnostics };
  }
  return { timeout_ms: n, diagnostics };
}

export function resolvePlanSkillsConfig(
  projectRoot: string,
  env: NodeJS.ProcessEnv = process.env,
): PlanSkillsConfigResolution {
  const diagnostics: string[] = [];
  const timeoutPart = resolvePlanSkillsTimeoutMs(env);

  const envOverride = env.TIED_JEV_PLAN_SKILLS;
  if (envOverride !== undefined && envOverride.trim() !== "") {
    const parsed = parseEnvPlanSkillsFlag(envOverride);
    if (!parsed.valid) {
      diagnostics.push("invalid_env_override");
    }
    return {
      enabled: parsed.enabled,
      enabled_source: "env",
      timeout_ms: timeoutPart.timeout_ms,
      diagnostics: [...diagnostics, ...timeoutPart.diagnostics],
    };
  }

  const yamlEnabled = manifestEnablesJevPlanSkills(projectRoot);
  if (yamlEnabled) {
    return {
      enabled: true,
      enabled_source: "tied_yaml",
      timeout_ms: timeoutPart.timeout_ms,
      diagnostics: [...diagnostics, ...timeoutPart.diagnostics],
    };
  }

  if (env.TIED_JEV_PLAN_SKILLS === undefined) {
    const repo = readRepoTiedYaml(projectRoot);
    const jev = repo?.jev;
    if (
      jev &&
      typeof jev === "object" &&
      !Array.isArray(jev) &&
      "plan_skills" in (jev as Record<string, unknown>) &&
      (jev as Record<string, unknown>).plan_skills !== true &&
      (jev as Record<string, unknown>).plan_skills !== undefined &&
      (jev as Record<string, unknown>).plan_skills !== null
    ) {
      diagnostics.push("invalid_plan_skills_flag");
    }
  }

  return {
    enabled: false,
    enabled_source: "default_off",
    timeout_ms: timeoutPart.timeout_ms,
    diagnostics: [...diagnostics, ...timeoutPart.diagnostics],
  };
}
