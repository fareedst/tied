/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-GOAGENT-CLI] [REQ-GOAGENT-CLI-CONFIG]
 * Minimal CLI config parse for TS-native executor dry-run (slice 2a).
 */
import fs from "node:fs";
import path from "node:path";

import { findRepoRootFromPath } from "./repo-root.js";
import {
  selectAgentHarness,
  type AgentHarnessProfile,
} from "./harness-select.js";

export type DryRunConfig = {
  dryRun: boolean;
  sessionId: string;
  workspace: string;
  model: string;
  agentPath: string;
  agentHarness: AgentHarnessProfile;
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
  nonCompactHtmlStableIndent: number;
  checklistTrackerYaml: string;
  adherenceLedger: string;
  runID: string;
  enforceEnvelope: boolean;
  allowMissingEnvelope: boolean;
  integratedDepth: boolean;
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
    agentHarness: "cursor",
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
    nonCompactHtmlStableIndent: 0,
    checklistTrackerYaml: "",
    adherenceLedger: "",
    runID: "",
    enforceEnvelope: false,
    allowMissingEnvelope: false,
    integratedDepth: false,
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
      case "--harness":
        needVal(k, v, ok, flagPart, i);
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
      case "--non-compact-html-indent": {
        const val = needVal(k, v, ok, flagPart, i);
        if (!ok) {
          i += 1;
        }
        const n = Number.parseInt(val, 10);
        if (Number.isNaN(n) || n < 0) {
          throw new Error("--non-compact-html-indent requires a non-negative integer");
        }
        c.nonCompactHtmlStableIndent = n;
        break;
      }
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
      case "--adherence-ledger":
        c.adherenceLedger = needVal(k, v, ok, flagPart, i);
        if (!ok) {
          i += 1;
        }
        break;
      case "--enforce-envelope":
        c.enforceEnvelope = true;
        break;
      case "--allow-missing-envelope":
        c.allowMissingEnvelope = true;
        break;
      case "--integrated-depth":
        c.integratedDepth = true;
        break;
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
  applyTrackerDefaults(c);
  if (!c.featureSpecBatchExplicit) {
    const p = path.join(c.workspace, "prompts", "all.yaml");
    if (fileReadable(p)) {
      c.featureSpecBatchYamls = [p, ...c.featureSpecBatchYamls];
    }
  }

  c.agentHarness = selectAgentHarness(flagPart, { dryRun: c.dryRun });

  validateDryRunConfig(c);
  return c;
}

export function trackerRequestTokenFromVars(
  vars: Record<string, string>,
): string {
  for (const key of ["REQUEST", "REQ_TOKEN", "REQUEST_TOKEN"]) {
    const v = String(vars[key] ?? "").trim();
    if (v !== "") {
      return v;
    }
  }
  return "";
}

function applyTrackerDefaults(c: DryRunConfig): void {
  if (c.runID.trim() === "") {
    for (const key of ["RUN_ID", "AGENTSTREAM_RUN_ID"]) {
      const v = String(c.checklistVars[key] ?? "").trim();
      if (v !== "") {
        c.runID = v;
        break;
      }
    }
    if (c.runID.trim() === "") {
      const envRun = String(process.env.AGENTSTREAM_RUN_ID ?? "").trim();
      if (envRun !== "") {
        c.runID = envRun;
      }
    }
  }
  if (
    c.checklistTrackerYaml.trim() !== "" &&
    c.adherenceLedger.trim() === ""
  ) {
    const token = trackerRequestTokenFromVars(c.checklistVars);
    if (token !== "") {
      const root = findRepoRootFromPath(c.workspace);
      if (root !== "") {
        c.adherenceLedger = path.join(
          root,
          "working",
          token,
          "adherence",
          "events.jsonl",
        );
      }
    }
  }
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
  if (c.checklistTrackerYaml.trim() !== "") {
    if (c.leadChecklistYaml.trim() === "") {
      throw new Error("--checklist-tracker-yaml requires --lead-checklist-yaml");
    }
    const def = path.resolve(path.normalize(c.leadChecklistYaml));
    const track = path.resolve(path.normalize(c.checklistTrackerYaml));
    if (def === track) {
      throw new Error(
        "--checklist-tracker-yaml must not equal --lead-checklist-yaml",
      );
    }
  }
}

export function skipTiedMcpPreflightEffective(c: DryRunConfig): boolean {
  return c.skipTiedMcpPreflight;
}

/** True when TS-native dry-run can handle argv without Go forward (2a–2b + Phase 4a extensions). */
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
  const hasChecklist = c.leadChecklistYaml.trim() !== "";
  const hasBatch = c.featureSpecBatchYamls.length > 0;
  const hasArgv = c.argvWords.length > 0;
  const hasPrompts = c.promptsFiles.length > 0;
  const hasTdd = c.tddYamls.length > 0;
  if (!hasChecklist && !hasBatch && !hasArgv && !hasPrompts && !hasTdd) {
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
