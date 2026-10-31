/**
 * [IMPL-TIED_DURABLE_CHECKLIST_CONTROLLER] [REQ-TIED_DURABLE_CHECKLIST_CONTROLLER]
 * Tri-state policy for checklist.resume_from_tracker in tied-project/config.yaml.
 */

export type ResumeFromTrackerPolicy = "auto" | "cli_only" | "disabled";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

// [IMPL-TIED_DURABLE_CHECKLIST_CONTROLLER] — How: absent key preserves Wave 4 CLI-only apply; true auto-applies when tracker path set; false blocks CLI.
export function resolveResumeFromTrackerPolicy(
  record: Record<string, unknown> | undefined,
): ResumeFromTrackerPolicy {
  if (!isRecord(record)) {
    return "cli_only";
  }
  const checklist = record.checklist;
  if (!isRecord(checklist)) {
    return "cli_only";
  }
  const flag = checklist.resume_from_tracker;
  if (flag === false) {
    return "disabled";
  }
  if (flag === true) {
    return "auto";
  }
  return "cli_only";
}
