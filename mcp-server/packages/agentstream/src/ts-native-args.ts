/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
 * Minimal argv extraction for TS-native agentstream subcommands (Phase 3b).
 */
import fs from "node:fs";

export type ChecklistTrackerPreviewArgs = {
  leadChecklistYaml: string;
  trackerPreviewPath: string;
};

function needVal(
  flag: string,
  args: string[],
  index: number,
): { value: string; nextIndex: number } {
  const inline = args[index]?.startsWith(`${flag}=`)
    ? args[index].slice(flag.length + 1)
    : undefined;
  if (inline !== undefined && inline !== "") {
    return { value: inline, nextIndex: index };
  }
  const next = args[index + 1];
  if (next === undefined || next.startsWith("-")) {
    throw new Error(`missing value for ${flag}`);
  }
  return { value: next, nextIndex: index + 1 };
}

export function extractChecklistTrackerPreview(
  args: string[],
): ChecklistTrackerPreviewArgs | null {
  let leadChecklistYaml = "";
  let trackerPreviewPath = "";

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "-c" || arg === "--lead-checklist-yaml") {
      const { value, nextIndex } = needVal(arg, args, i);
      leadChecklistYaml = value;
      i = nextIndex;
      continue;
    }
    if (arg === "--checklist-tracker-preview") {
      const { value, nextIndex } = needVal(arg, args, i);
      trackerPreviewPath = value;
      i = nextIndex;
      continue;
    }
    if (arg.startsWith("--lead-checklist-yaml=")) {
      leadChecklistYaml = arg.slice("--lead-checklist-yaml=".length);
      continue;
    }
    if (arg.startsWith("--checklist-tracker-preview=")) {
      trackerPreviewPath = arg.slice("--checklist-tracker-preview=".length);
    }
  }

  if (trackerPreviewPath === "") {
    return null;
  }
  if (leadChecklistYaml.trim() === "") {
    throw new Error("--checklist-tracker-preview requires --lead-checklist-yaml");
  }
  if (!fileReadable(leadChecklistYaml)) {
    throw new Error(
      `lead checklist yaml is not a readable file: ${leadChecklistYaml}`,
    );
  }
  if (!fileReadable(trackerPreviewPath)) {
    throw new Error(
      `tracker preview file is not a readable file: ${trackerPreviewPath}`,
    );
  }
  return { leadChecklistYaml, trackerPreviewPath };
}

function fileReadable(p: string): boolean {
  try {
    fs.accessSync(p, fs.constants.R_OK);
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}
