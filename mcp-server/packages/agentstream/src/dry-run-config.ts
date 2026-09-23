/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-GOAGENT-CLI] [REQ-GOAGENT-CLI-CONFIG]
 * Minimal CLI config parse for TS-native executor dry-run (slice 2a).
 */
import fs from "node:fs";
import path from "node:path";

export type DryRunConfig = {
  dryRun: boolean;
  sessionId: string;
  workspace: string;
  model: string;
  agentPath: string;
  leadChecklistYaml: string;
  leadChecklistSkipSub: boolean;
  leadChecklistStepFromId: string;
  leadChecklistStepToId: string;
  leadChecklistBeforeFeatureSpec: boolean;
  firstTurn: number;
  checklistVars: Record<string, string>;
  checklistVarStrict: boolean;
  skipTiedMcpPreflight: boolean;
  assumeTiedMcpYes: boolean;
  mcpJsonPath: string;
  argvWords: string[];
  promptFiles: string[];
  promptsFiles: string[];
  tddYamls: string[];
  featureSpecBatchYamls: string[];
  previewFeatureSpecBatchYaml: string;
  previewLeadChecklist: boolean;
  previewChecklistTrackerYaml: string;
  verifySession: boolean;
  nonCompactHtml: boolean;
  checklistTrackerYaml: string;
  featureSpecBatchExplicit: boolean;
  orderFilterRaw: string;
};

function splitEq(a: string): [string, string, boolean] {
  const i = a.indexOf("=");
  if (i <= 0) {
    return [a, "", false];
  }
  return [a.slice(0, i), a.slice(i + 1), true];
}

function needVal(
  flag: string,
  inline: string | undefined,
  hasEq: boolean,
  args: string[],
  index: number,
): string {
  if (hasEq) {
    return inline ?? "";
  }
  const next = args[index + 1];
  if (next === undefined || next.startsWith("-")) {
    throw new Error(`missing value for ${flag}`);
  }
  return next;
}

function fileReadable(p: string): boolean {
  try {
    const st = fs.statSync(p);
    return st.isFile();
  } catch {
    return false;
  }
}

function splitDoubleDash(args: string[]): [string[], string[]] {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--") {
      return [args.slice(0, i), args.slice(i + 1)];
    }
  }
  return [args, []];
}

export function parseDryRunConfig(cwd: string, args: string[]): DryRunConfig {
  const [flagPart, argvWords] = splitDoubleDash(args);
  const c: DryRunConfig = {
    dryRun: false,
    sessionId: "",
    workspace: cwd,
    model: "Auto",
    agentPath: "",
    leadChecklistYaml: "",
    leadChecklistSkipSub: false,
    leadChecklistStepFromId: "",
    leadChecklistStepToId: "",
    leadChecklistBeforeFeatureSpec: false,
    firstTurn: 1,
    checklistVars: {},
    checklistVarStrict: process.env.AGENTSTREAM_CHECKLIST_VAR_STRICT === "1",
    skipTiedMcpPreflight: true,
    assumeTiedMcpYes: false,
    mcpJsonPath: "",
    argvWords,
    promptFiles: [],
    promptsFiles: [],
    tddYamls: [],
    featureSpecBatchYamls: [],
    previewFeatureSpecBatchYaml: "",
    previewLeadChecklist: false,
    previewChecklistTrackerYaml: "",
    verifySession: false,
    nonCompactHtml: false,
    checklistTrackerYaml: "",
    featureSpecBatchExplicit: false,
    orderFilterRaw: "",
  };

  let tiedMcpUserSet = false;

  for (let i = 0; i < flagPart.length; i++) {
    const a = flagPart[i];
    if (!a) {
      continue;
    }
    if (!a.startsWith("-")) {
      continue;
    }
    const [k, v, ok] = splitEq(a);
    switch (k) {
      case "-h":
      case "--help":
        throw new Error("help");
      case "-d":
      case "--dry-run":
        c.dryRun = true;
        break;
      case "--lead-checklist-skip-sub":
        c.leadChecklistSkipSub = true;
        break;
      case "--lead-checklist-before-feature":
        c.leadChecklistBeforeFeatureSpec = true;
        break;
      case "--verify-session":
        c.verifySession = true;
        break;
      case "-s":
      case "--session-id":
        c.sessionId = needVal(k, v, ok, flagPart, i);
        if (!ok) {
          i += 1;
        }
        break;
      case "-f":
      case "--first-turn": {
        const val = needVal(k, v, ok, flagPart, i);
        if (!ok) {
          i += 1;
        }
        const n = Number.parseInt(val.trim(), 10);
        if (!Number.isFinite(n) || n < 1) {
          throw new Error(`${k} must be a positive integer`);
        }
        c.firstTurn = n;
        break;
      }
      case "-w":
      case "--workspace":
        c.workspace = needVal(k, v, ok, flagPart, i);
        if (!ok) {
          i += 1;
        }
        break;
      case "-m":
      case "--model":
        c.model = needVal(k, v, ok, flagPart, i);
        if (!ok) {
          i += 1;
        }
        break;
      case "-c":
      case "--lead-checklist-yaml":
        c.leadChecklistYaml = needVal(k, v, ok, flagPart, i);
        if (!ok) {
          i += 1;
        }
        break;
      case "--checklist-tracker-yaml":
        c.checklistTrackerYaml = needVal(k, v, ok, flagPart, i);
        if (!ok) {
          i += 1;
        }
        break;
      case "--checklist-tracker-preview":
        c.previewChecklistTrackerYaml = needVal(k, v, ok, flagPart, i);
        if (!ok) {
          i += 1;
        }
        break;
      case "--lead-checklist-from-step":
        c.leadChecklistStepFromId = needVal(k, v, ok, flagPart, i);
        if (!ok) {
          i += 1;
        }
        break;
      case "--lead-checklist-to-step":
        c.leadChecklistStepToId = needVal(k, v, ok, flagPart, i);
        if (!ok) {
          i += 1;
        }
        break;
      case "-p":
      case "--prompt-file":
        c.promptFiles.push(needVal(k, v, ok, flagPart, i));
        if (!ok) {
          i += 1;
        }
        break;
      case "--prompts-file":
        c.promptsFiles.push(needVal(k, v, ok, flagPart, i));
        if (!ok) {
          i += 1;
        }
        break;
      case "--tdd-yaml":
        c.tddYamls.push(needVal(k, v, ok, flagPart, i));
        if (!ok) {
          i += 1;
        }
        break;
      case "-b":
      case "--feature-spec-batch-yaml":
        c.featureSpecBatchYamls.push(needVal(k, v, ok, flagPart, i));
        c.featureSpecBatchExplicit = true;
        if (!ok) {
          i += 1;
        }
        break;
      case "-o":
      case "--select-order":
      case "--feature-spec-batch-order":
        c.orderFilterRaw = needVal(k, v, ok, flagPart, i);
        if (!ok) {
          i += 1;
        }
        break;
      case "--preview-feature-spec-batch-yaml":
        c.previewFeatureSpecBatchYaml = needVal(k, v, ok, flagPart, i);
        if (!ok) {
          i += 1;
        }
        break;
      case "--preview-lead-checklist":
        c.previewLeadChecklist = true;
        break;
      case "--agent-path":
        c.agentPath = needVal(k, v, ok, flagPart, i);
        if (!ok) {
          i += 1;
        }
        break;
      case "--mcp-json":
        c.mcpJsonPath = needVal(k, v, ok, flagPart, i);
        if (!ok) {
          i += 1;
        }
        break;
      case "--skip-tied-mcp-preflight":
        c.skipTiedMcpPreflight = true;
        tiedMcpUserSet = true;
        break;
      case "--tied-mcp-preflight":
        c.skipTiedMcpPreflight = false;
        tiedMcpUserSet = true;
        break;
      case "-y":
      case "--yes":
        c.assumeTiedMcpYes = true;
        break;
      case "--non-compact-html":
        c.nonCompactHtml = true;
        break;
      case "--checklist-var": {
        const val = needVal(k, v, ok, flagPart, i);
        if (!ok) {
          i += 1;
        }
        const eq = val.indexOf("=");
        if (eq <= 0) {
          throw new Error("--checklist-var requires KEY=VALUE");
        }
        c.checklistVars[val.slice(0, eq)] = val.slice(eq + 1);
        break;
      }
      default:
        break;
    }
  }

  if (!tiedMcpUserSet) {
    if (process.env.AGENTSTREAM_SKIP_TIED_MCP_PREFLIGHT === "1") {
      c.skipTiedMcpPreflight = true;
    } else if (process.env.AGENTSTREAM_TIED_MCP_PREFLIGHT === "1") {
      c.skipTiedMcpPreflight = false;
    }
  }

  applyWorkspacePreloadDefault(c);
  if (!c.featureSpecBatchExplicit) {
    const p = path.join(c.workspace, "prompts", "all.yaml");
    if (fileReadable(p)) {
      c.featureSpecBatchYamls = [p, ...c.featureSpecBatchYamls];
    }
  }

  validateDryRunConfig(c);
  return c;
}

function applyWorkspacePreloadDefault(c: DryRunConfig): void {
  const skip =
    process.env.AGENTSTREAM_SKIP_WORKSPACE_PRELOAD === "1";
  const def = path.normalize(path.join(c.workspace, "tied", "agent-preload-contract.yaml"));
  const legacy = path.normalize(path.join(c.workspace, "agent-preload-contract.yaml"));
  const seen = new Set<string>();
  const out: string[] = [];
  if (!skip) {
    if (fileReadable(def)) {
      seen.add(def);
      out.push(def);
    } else if (fileReadable(legacy)) {
      seen.add(legacy);
      out.push(legacy);
    }
  }
  for (const p of c.promptFiles) {
    const cp = path.normalize(p);
    if (seen.has(cp)) {
      continue;
    }
    seen.add(cp);
    out.push(p);
  }
  c.promptFiles = out;
}

function validateDryRunConfig(c: DryRunConfig): void {
  if (c.previewFeatureSpecBatchYaml) {
    if (!fileReadable(c.previewFeatureSpecBatchYaml)) {
      throw new Error(
        `preview file is not a readable file: ${c.previewFeatureSpecBatchYaml}`,
      );
    }
    return;
  }
  if (c.previewLeadChecklist) {
    if (c.leadChecklistYaml.trim() === "") {
      throw new Error("--preview-lead-checklist requires --lead-checklist-yaml");
    }
    if (!fileReadable(c.leadChecklistYaml)) {
      throw new Error(
        `lead checklist yaml is not a readable file: ${c.leadChecklistYaml}`,
      );
    }
    return;
  }
  if (c.previewChecklistTrackerYaml) {
    return;
  }
  let st: fs.Stats;
  try {
    st = fs.statSync(c.workspace);
  } catch {
    throw new Error(`workspace is not a directory: ${c.workspace}`);
  }
  if (!st.isDirectory()) {
    throw new Error(`workspace is not a directory: ${c.workspace}`);
  }
  for (const p of c.promptFiles) {
    if (!fileReadable(p)) {
      throw new Error(`prompt file is not a readable file: ${p}`);
    }
  }
  for (const p of c.promptsFiles) {
    if (!fileReadable(p)) {
      throw new Error(`prompts file is not a readable file: ${p}`);
    }
  }
  for (const p of c.tddYamls) {
    if (!fileReadable(p)) {
      throw new Error(`tdd yaml is not a readable file: ${p}`);
    }
  }
  for (const p of c.featureSpecBatchYamls) {
    if (!fileReadable(p)) {
      throw new Error(`feature spec batch yaml is not a readable file: ${p}`);
    }
  }
  if (c.leadChecklistYaml && !fileReadable(c.leadChecklistYaml)) {
    throw new Error(
      `lead checklist yaml is not a readable file: ${c.leadChecklistYaml}`,
    );
  }
}

export function skipTiedMcpPreflightEffective(c: DryRunConfig): boolean {
  return c.skipTiedMcpPreflight;
}

/** True when TS-native dry-run can handle argv without Go forward (slices 2a–2b). */
export function qualifiesForTsNativeDryRun(c: DryRunConfig): boolean {
  if (!c.dryRun) {
    return false;
  }
  if (
    c.previewChecklistTrackerYaml ||
    c.previewFeatureSpecBatchYaml ||
    c.previewLeadChecklist
  ) {
    return false;
  }
  if (c.nonCompactHtml) {
    return false;
  }
  if (c.argvWords.length > 0) {
    return false;
  }
  if (c.promptsFiles.length > 0 || c.tddYamls.length > 0) {
    return false;
  }
  if (c.verifySession) {
    return false;
  }
  if (c.checklistTrackerYaml) {
    return false;
  }
  const hasChecklist = c.leadChecklistYaml.trim() !== "";
  const hasBatch = c.featureSpecBatchYamls.length > 0;
  if (!hasChecklist && !hasBatch) {
    return false;
  }
  if (c.orderFilterRaw.trim() !== "" && !hasBatch) {
    return false;
  }
  return true;
}

/** TS-native --preview-feature-spec-batch-yaml (slice 2b). */
export function qualifiesForTsNativeFeatureSpecPreview(c: DryRunConfig): boolean {
  if (c.previewFeatureSpecBatchYaml.trim() === "") {
    return false;
  }
  if (c.previewChecklistTrackerYaml || c.previewLeadChecklist) {
    return false;
  }
  if (c.dryRun || c.nonCompactHtml) {
    return false;
  }
  return true;
}

/** TS-native --preview-lead-checklist (slice 2c). */
export function qualifiesForTsNativeChecklistPreview(c: DryRunConfig): boolean {
  if (!c.previewLeadChecklist) {
    return false;
  }
  if (c.previewChecklistTrackerYaml || c.previewFeatureSpecBatchYaml.trim() !== "") {
    return false;
  }
  if (c.dryRun || c.nonCompactHtml) {
    return false;
  }
  if (c.leadChecklistYaml.trim() === "") {
    return false;
  }
  return true;
}
