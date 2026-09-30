/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function readRepoTiedYaml(projectRoot: string): Record<string, unknown> | undefined {
  const configPath = path.join(projectRoot, ".tied-yaml.yaml");
  if (!fs.existsSync(configPath)) {
    return undefined;
  }
  try {
    const raw = yaml.load(fs.readFileSync(configPath, "utf8"));
    return isRecord(raw) ? raw : undefined;
  } catch {
    return undefined;
  }
}

export function manifestEnablesJevPlanSkills(projectRoot: string): boolean {
  const repo = readRepoTiedYaml(projectRoot);
  const jev = repo && isRecord(repo.jev) ? repo.jev : undefined;
  return jev?.plan_skills === true;
}

/** [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] */
export function manifestEnablesChecklistEvidenceSufficiency(projectRoot: string): boolean {
  const repo = readRepoTiedYaml(projectRoot);
  const jev = repo && isRecord(repo.jev) ? repo.jev : undefined;
  return jev?.checklist_evidence_sufficiency === true;
}
