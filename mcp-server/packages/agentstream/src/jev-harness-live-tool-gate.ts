/**
 * [IMPL-TIED_JEV_TOOL_SAFETY_GATING] [REQ-TIED_JEV_TOOL_SAFETY_GATING]
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 * Per-turn stream-json tool proposal gate via evaluateHarnessToolCall (W5 residual).
 */
import type { DryRunConfig } from "./dry-run-config.js";
import {
  jevAgentstreamHarnessEnabled,
  type HarnessToolEvaluation,
} from "./jev-harness-preflight.js";
import {
  loadJevHarnessDistModule,
  manifestEnablesJevHarness,
  resolveProjectRootForJev,
  taskSummaryFromCfg,
} from "./jev-harness-shared.js";

export type StreamToolProposal = {
  tool: string;
  arguments: string;
};

export type JevLiveToolGateEvaluate = (
  input: {
    tool: string;
    arguments?: string;
    goal?: string;
    context?: string;
    workspace?: string;
  },
) => Promise<HarnessToolEvaluation>;

export type JevLiveToolGate = {
  goal: string;
  workspace?: string;
  evaluate: JevLiveToolGateEvaluate;
};

/** Parse blocking-tool proposals from agent stream-json NDJSON (composition + Anthropic shapes). */
export function parseToolProposalFromStreamObject(
  obj: Record<string, unknown>,
): StreamToolProposal | null {
  const typ = String(obj.type ?? "");
  if (typ === "agentstream_tool_proposal") {
    const tool = String(obj.tool ?? obj.tool_name ?? "").trim();
    if (tool === "") {
      return null;
    }
    const args =
      typeof obj.arguments === "string"
        ? obj.arguments
        : typeof obj.command === "string"
          ? obj.command
          : JSON.stringify(obj.tool_input ?? obj.input ?? {});
    return { tool, arguments: args };
  }
  if (typ === "tool_use" || typ === "tool_call") {
    const tool = String(obj.name ?? obj.tool_name ?? obj.tool ?? "").trim();
    if (tool === "") {
      return null;
    }
    const input = obj.input ?? obj.tool_input ?? obj.arguments;
    const args =
      typeof input === "string"
        ? input
        : input && typeof input === "object"
          ? extractShellArgsFromInput(input as Record<string, unknown>)
          : "";
    return { tool, arguments: args };
  }
  if (typ === "assistant") {
    const msg = obj.message as Record<string, unknown> | undefined;
    const parts = msg?.content;
    if (!Array.isArray(parts)) {
      return null;
    }
    for (const p of parts) {
      const pm = p as Record<string, unknown>;
      if (pm.type !== "tool_use") {
        continue;
      }
      const tool = String(pm.name ?? "").trim();
      if (tool === "") {
        continue;
      }
      const input = pm.input;
      const args =
        typeof input === "string"
          ? input
          : input && typeof input === "object"
            ? extractShellArgsFromInput(input as Record<string, unknown>)
            : JSON.stringify(input ?? {});
      return { tool, arguments: args };
    }
  }
  return null;
}

function extractShellArgsFromInput(input: Record<string, unknown>): string {
  if (typeof input.command === "string") {
    return input.command;
  }
  if (typeof input.arguments === "string") {
    return input.arguments;
  }
  return JSON.stringify(input);
}

export function formatJevToolGateDiagnostic(
  proposal: StreamToolProposal,
  evaluation: HarnessToolEvaluation,
): string {
  return (
    `DIAGNOSTIC: jev harness live tool gate: tool=${proposal.tool} ` +
    `decision=${evaluation.decision} reason=${evaluation.reason}\n`
  );
}

/** [REQ-TIED_JEV_DECISION_COPROCESSOR] G3: local log-only; CI / explicit env treats confirm as abort. */
export function jevHarnessConfirmStrictEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const strict = env.AGENTSTREAM_JEV_HARNESS_CONFIRM_STRICT;
  if (strict === "1" || strict === "true") {
    return true;
  }
  const ci = env.CI;
  return ci === "true" || ci === "1";
}

export function shouldAbortLiveTurnOnToolGate(
  evaluation: HarnessToolEvaluation,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (evaluation.decision === "block") {
    return true;
  }
  if (evaluation.decision === "confirm" && jevHarnessConfirmStrictEnabled(env)) {
    return true;
  }
  return false;
}

export type ToolGateStreamState = {
  gateBlocked: boolean;
  gateStderrLines: string[];
  gateChain: Promise<void>;
};

export function createToolGateStreamState(): ToolGateStreamState {
  return { gateBlocked: false, gateStderrLines: [], gateChain: Promise.resolve() };
}

/** Apply Jev tool gate to one stream-json NDJSON line (Cursor + Claude live drivers). */
export function enqueueToolGateLineCheck(
  state: ToolGateStreamState,
  toolGate: JevLiveToolGate,
  line: string,
  onAbort: () => void,
): void {
  if (state.gateBlocked) {
    return;
  }
  const trimmed = line.trim();
  if (trimmed === "") {
    return;
  }
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    return;
  }
  const proposal = parseToolProposalFromStreamObject(obj);
  if (!proposal) {
    return;
  }
  state.gateChain = state.gateChain.then(async () => {
    if (state.gateBlocked) {
      return;
    }
    const out = await evaluateStreamToolProposal(toolGate, proposal);
    state.gateStderrLines.push(out.diagnostic);
    process.stderr.write(out.diagnostic);
    if (out.abort) {
      state.gateBlocked = true;
      onAbort();
    }
  });
}

/** Build live-loop gate when harness opt-in is active; null when disabled. */
export async function createJevLiveToolGate(
  cfg: DryRunConfig,
  deps?: { evaluate?: JevLiveToolGateEvaluate },
): Promise<JevLiveToolGate | null> {
  if (!jevAgentstreamHarnessEnabled(cfg.workspace)) {
    return null;
  }
  const goal = taskSummaryFromCfg(cfg);
  const projectRoot = resolveProjectRootForJev(cfg);
  if (deps?.evaluate) {
    return { goal, workspace: projectRoot, evaluate: deps.evaluate };
  }
  const mod = await loadJevHarnessDistModule(projectRoot);
  if (!mod) {
    return null;
  }
  const manifestFlag = manifestEnablesJevHarness(projectRoot);
  const harness = mod.resolveHarnessFromEnv(process.env, manifestFlag);
  const workspace = projectRoot;
  return {
    goal,
    workspace,
    evaluate: async (input) =>
      mod.evaluateHarnessToolCall(
        { ...input, workspace: input.workspace ?? workspace },
        harness,
        {
          apiKey: process.env.JEV_API_KEY,
        },
      ),
  };
}

export async function evaluateStreamToolProposal(
  gate: JevLiveToolGate,
  proposal: StreamToolProposal,
  turnContext?: string,
): Promise<{ evaluation: HarnessToolEvaluation; diagnostic: string; abort: boolean }> {
  const evaluation = await gate.evaluate({
    tool: proposal.tool,
    arguments: proposal.arguments,
    goal: gate.goal,
    context: turnContext,
    workspace: gate.workspace,
  });
  const diagnostic = formatJevToolGateDiagnostic(proposal, evaluation);
  return {
    evaluation,
    diagnostic,
    abort: shouldAbortLiveTurnOnToolGate(evaluation, process.env),
  };
}
