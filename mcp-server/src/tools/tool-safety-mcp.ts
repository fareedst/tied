/**
 * [IMPL-TIED_JEV_TOOL_SAFETY_GATING] [REQ-TIED_JEV_TOOL_SAFETY_GATING]
 * Read-only tied_jev_tool_safety_evaluate diagnostic over evaluateHarnessToolCall.
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { z } from "zod";
import {
  evaluateHarnessToolCall,
  resolveHarnessFromEnv,
  type HarnessToolEvaluation,
} from "../jev/harness-tool-guard.js";
import { textContent } from "../types.js";
import { getBasePath } from "../yaml-loader.js";

let evaluateFnForTests: typeof evaluateHarnessToolCall | undefined;

export function setToolSafetyEvaluateFnForTests(
  fn: typeof evaluateHarnessToolCall | undefined,
): void {
  evaluateFnForTests = fn;
}

function resolveProjectRoot(projectRoot?: string): string {
  return projectRoot ? path.resolve(projectRoot) : path.resolve(getBasePath(), "..");
}

function manifestEnablesHarness(projectRoot: string): boolean {
  const manifestPath = path.join(projectRoot, ".tied-yaml.yaml");
  if (!fs.existsSync(manifestPath)) {
    return false;
  }
  try {
    const doc = yaml.load(fs.readFileSync(manifestPath, "utf8")) as Record<string, unknown>;
    const jev = doc.jev as Record<string, unknown> | undefined;
    return jev?.agentstream_harness === true;
  } catch {
    return false;
  }
}

export type ToolSafetyDiagnosticResult = {
  ok: boolean;
  decision: HarnessToolEvaluation["decision"];
  risk: number | null;
  reason: string;
  destructive_pattern: boolean;
  scope_class?: string;
  jev_skipped: boolean;
  harness_enabled: boolean;
  /** Never present: gate authority fields */
  allowed?: never;
  gate_receipt?: never;
};

export async function runToolSafetyDiagnostic(input: {
  tool: string;
  arguments: string;
  workspace: string;
  goal?: string;
  context?: string;
  projectRoot: string;
  env?: NodeJS.ProcessEnv;
}): Promise<ToolSafetyDiagnosticResult> {
  if (!input.workspace.trim()) {
    throw new Error("workspace is required for tied_jev_tool_safety_evaluate");
  }
  const env = input.env ?? process.env;
  const manifestFlag = manifestEnablesHarness(input.projectRoot);
  const harness = resolveHarnessFromEnv(env, manifestFlag);
  const evaluate = evaluateFnForTests ?? evaluateHarnessToolCall;
  const evaluation = await evaluate(
    {
      tool: input.tool,
      arguments: input.arguments,
      goal: input.goal,
      context: input.context,
      workspace: input.workspace,
    },
    harness,
    { apiKey: env.JEV_API_KEY },
  );
  return {
    ok: true,
    decision: evaluation.decision,
    risk: evaluation.risk,
    reason: evaluation.reason,
    destructive_pattern: evaluation.destructive_pattern,
    scope_class: evaluation.scope_class,
    jev_skipped: evaluation.jev_skipped,
    harness_enabled: harness.enabled,
  };
}

export const toolSafetyMcpTools = [
  {
    name: "tied_jev_tool_safety_evaluate",
    config: {
      description:
        "[REQ-TIED_JEV_TOOL_SAFETY_GATING] Read-only Blueprint D harness tool safety evaluation. Never executes commands or emits checklist gate allowed.",
      inputSchema: z.object({
        tool: z.string(),
        arguments: z.string(),
        workspace: z.string().min(1),
        goal: z.string().optional(),
        context: z.string().optional(),
        project_root: z.string().optional(),
      }),
    },
    handler: async (args: {
      tool: string;
      arguments: string;
      workspace: string;
      goal?: string;
      context?: string;
      project_root?: string;
    }) => {
      try {
        const projectRoot = resolveProjectRoot(args.project_root);
        const payload = await runToolSafetyDiagnostic({
          tool: args.tool,
          arguments: args.arguments,
          workspace: args.workspace,
          goal: args.goal,
          context: args.context,
          projectRoot,
        });
        return textContent(JSON.stringify(payload, null, 2));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return textContent(JSON.stringify({ ok: false, error: msg }, null, 2));
      }
    },
  },
];
