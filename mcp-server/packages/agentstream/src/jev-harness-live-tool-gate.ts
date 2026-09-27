/**
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
  input: { tool: string; arguments?: string; goal?: string; context?: string },
) => Promise<HarnessToolEvaluation>;

export type JevLiveToolGate = {
  goal: string;
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

export function shouldAbortLiveTurnOnToolGate(
  evaluation: HarnessToolEvaluation,
): boolean {
  return evaluation.decision === "block";
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
  if (deps?.evaluate) {
    return { goal, evaluate: deps.evaluate };
  }
  const projectRoot = resolveProjectRootForJev(cfg);
  const mod = await loadJevHarnessDistModule(projectRoot);
  if (!mod) {
    return null;
  }
  const manifestFlag = manifestEnablesJevHarness(projectRoot);
  const harness = mod.resolveHarnessFromEnv(process.env, manifestFlag);
  return {
    goal,
    evaluate: async (input) =>
      mod.evaluateHarnessToolCall(input, harness, {
        apiKey: process.env.JEV_API_KEY,
      }),
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
  });
  const diagnostic = formatJevToolGateDiagnostic(proposal, evaluation);
  return {
    evaluation,
    diagnostic,
    abort: shouldAbortLiveTurnOnToolGate(evaluation),
  };
}
