/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [IMPL-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 */

import { readRepoTiedYaml as loadFlatProjectConfig } from "../tied-project-config.js";

export { readRepoTiedYaml, loadProjectConfig, assertConfigKeyOwnership } from "../tied-project-config.js";

export function manifestEnablesJevPlanSkills(projectRoot: string): boolean {
  const repo = loadFlatProjectConfig(projectRoot);
  const jev = repo && typeof repo.jev === "object" && repo.jev ? (repo.jev as Record<string, unknown>) : undefined;
  return jev?.plan_skills === true;
}

/** [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] */
export function manifestEnablesChecklistEvidenceSufficiency(projectRoot: string): boolean {
  const repo = loadFlatProjectConfig(projectRoot);
  const jev = repo && typeof repo.jev === "object" && repo.jev ? (repo.jev as Record<string, unknown>) : undefined;
  return jev?.checklist_evidence_sufficiency === true;
}
