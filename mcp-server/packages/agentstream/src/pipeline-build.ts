/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-GOAGENT-PIPELINE] [REQ-GOAGENT-PIPELINE-CHAIN]
 * Pipeline Build + prompt preload (Go pipeline/pipeline.go parity subset, slice 2b).
 */
import fs from "node:fs";

import {
  loadChecklistTurns,
  type Turn,
} from "./checklist-load-turns.js";
import {
  loadFeatureSpecTurns,
  type FeatureSpecOptions,
} from "./featurespec-load-turns.js";
import { chainBetween, sessionForTurn } from "./pipeline-session.js";
import { loadTddTurns } from "./tddloop-load.js";

export const VERIFY_SESSION_PROMPT = "what was the most recent prompt?";

export type PipelineInput = {
  argvWords: string[];
  promptsFiles: string[];
  tddYamls: string[];
  featureSpecBatchYamlPaths: string[];
  featureSpecOpts?: FeatureSpecOptions;
  leadChecklistYaml: string;
  leadChecklistSkipSub: boolean;
  leadChecklistStepFromId: string;
  leadChecklistStepToId: string;
  checklistVars: Record<string, string>;
  checklistVarStrict: boolean;
  verifySession: boolean;
  leadChecklistBeforeFeatureSpec: boolean;
};

function argvTurn(words: string[]): Turn[] {
  if (words.length === 0) {
    return [];
  }
  return [{ parts: [...words], chainFromPrevious: true, stepStub: "" }];
}

export function readPromptFilePreload(paths: string[]): string[] {
  return paths.map((p) => fs.readFileSync(p, "utf8").trim());
}

export function applyPromptFilePreload(
  turns: Turn[],
  initialSession: string,
  preload: string[],
): void {
  if (preload.length === 0 || turns.length === 0) {
    return;
  }
  const chain = chainBetween(turns);
  const runningSim = "session-placeholder";
  let running = "";
  for (let i = 0; i < turns.length; i++) {
    const sess = sessionForTurn(i, initialSession, chain, running);
    if (sess === "") {
      turns[i]!.parts = [...preload, ...turns[i]!.parts];
    }
    running = runningSim;
  }
}

export function buildPipeline(in_: PipelineInput): Turn[] {
  let turns: Turn[] = [];
  turns = turns.concat(argvTurn(in_.argvWords));

  for (const p of in_.promptsFiles) {
    const body = fs.readFileSync(p, "utf8").trim();
    turns.push({ parts: [body], chainFromPrevious: true, stepStub: "" });
  }

  for (const p of in_.tddYamls) {
    turns = turns.concat(loadTddTurns(p));
  }

  const fsTurns: Turn[] = [];
  for (const p of in_.featureSpecBatchYamlPaths) {
    fsTurns.push(...loadFeatureSpecTurns(p, in_.featureSpecOpts));
  }

  let clTurns: Turn[] = [];
  if (in_.leadChecklistYaml !== "") {
    clTurns = loadChecklistTurns(in_.leadChecklistYaml, {
      includeSubProcedures: !in_.leadChecklistSkipSub,
      stepFromId: in_.leadChecklistStepFromId,
      stepToId: in_.leadChecklistStepToId,
      vars: in_.checklistVars,
      checklistVarStrict: in_.checklistVarStrict,
    });
  }

  const both = fsTurns.length > 0 && clTurns.length > 0;
  if (in_.leadChecklistBeforeFeatureSpec && both) {
    turns = turns.concat(clTurns, fsTurns);
  } else {
    turns = turns.concat(fsTurns, clTurns);
  }

  if (in_.verifySession) {
    turns.push({
      parts: [VERIFY_SESSION_PROMPT],
      chainFromPrevious: true,
      stepStub: "",
    });
  }

  if (turns.length === 0) {
    throw new Error(
      "no prompts: provide argv after --, --prompt-file, --prompts-file, --tdd-yaml, --feature-spec-batch-yaml, and/or --lead-checklist-yaml",
    );
  }
  return turns;
}

export function buildPipelineFromDryRunConfig(
  cfg: import("./dry-run-config.js").DryRunConfig,
  featureSpecOpts?: FeatureSpecOptions,
): Turn[] {
  const turns = buildPipeline({
    argvWords: cfg.argvWords,
    promptsFiles: cfg.promptsFiles,
    tddYamls: cfg.tddYamls,
    featureSpecBatchYamlPaths: cfg.featureSpecBatchYamls,
    featureSpecOpts,
    leadChecklistYaml: cfg.leadChecklistYaml,
    leadChecklistSkipSub: cfg.leadChecklistSkipSub,
    leadChecklistStepFromId: cfg.leadChecklistStepFromId,
    leadChecklistStepToId: cfg.leadChecklistStepToId,
    checklistVars: cfg.checklistVars,
    checklistVarStrict: cfg.checklistVarStrict,
    verifySession: cfg.verifySession,
    leadChecklistBeforeFeatureSpec: cfg.leadChecklistBeforeFeatureSpec,
  });
  const preload = readPromptFilePreload(cfg.promptFiles);
  applyPromptFilePreload(turns, cfg.sessionId, preload);
  return turns;
}
