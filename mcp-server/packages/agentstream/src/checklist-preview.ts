/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-GOAGENT-YAML-STEPS] [REQ-GOAGENT-YAML-STEP-RENDER]
 * --preview-lead-checklist stdout (Go checklist.Preview parity).
 */
import type { ChecklistLoadOptions } from "./checklist-load-turns.js";
import { messagesFromChecklistYaml } from "./checklist-load-turns.js";
import type { DryRunConfig } from "./dry-run-config.js";

export function checklistLoadOptionsFromConfig(
  c: DryRunConfig,
): ChecklistLoadOptions {
  return {
    includeSubProcedures: !c.leadChecklistSkipSub,
    stepFromId: c.leadChecklistStepFromId,
    stepToId: c.leadChecklistStepToId,
    vars: c.checklistVars,
    checklistVarStrict: c.checklistVarStrict,
  };
}

export function previewLeadChecklist(
  path: string,
  opts: ChecklistLoadOptions,
): string {
  const msgs = messagesFromChecklistYaml(path, opts);
  const n = msgs.length;
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    parts.push(`=== prompt ${i + 1}/${n} ===\n`);
    parts.push(msgs[i]!);
    if (i < n - 1) {
      parts.push("\n---\n");
    } else {
      parts.push("\n");
    }
  }
  return parts.join("");
}
