/**
 * [IMPL-TIED_JEV_TOOL_SAFETY_GATING] [IMPL-TIED_JEV_DECISION_COPROCESSOR]
 * [REQ-TIED_JEV_TOOL_SAFETY_GATING] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 * W5 fail-closed tool gate when harness enabled; Blueprint D question ids and scope signals.
 */

import path from "node:path";
import type { JevClientConfig } from "./client.js";
import { jevDecide } from "./client.js";
import { resolveJevHarnessConfig, type JevHarnessConfig } from "./harness-config.js";
import { redactString } from "./redact-state.js";

export const DEFAULT_BLOCKING_TOOLS = new Set(["bash", "Shell"]);

export type HarnessToolCallInput = {
  tool: string;
  arguments?: string;
  goal?: string;
  context?: string;
  /** Declared workspace root for scope evaluation; omit for not_evaluated scope. */
  workspace?: string;
};

export type HarnessToolDecision = "allow" | "block" | "confirm";

export type WorkspaceScopeClass =
  | "in_scope"
  | "out_of_scope"
  | "unknown"
  | "not_evaluated";

export type HarnessToolEvaluation = {
  decision: HarnessToolDecision;
  risk: number | null;
  reason: string;
  jev_skipped: boolean;
  destructive_pattern: boolean;
  scope_class?: WorkspaceScopeClass;
};

const DESTRUCTIVE_PATTERNS: RegExp[] = [
  /\bgit\s+push\s+.*--force\b/i,
  /\bgit\s+push\s+-f\b/i,
  /\bmkfs\b/i,
  /\bdd\s+if=/i,
  /\bgit\s+reset\s+--hard\b/i,
  /\bchmod\s+-R\s+777\b/i,
  /\bformat\s+[a-z]:/i,
];

export const BLOCK_RISK_THRESHOLD = 0.72;
export const CONFIRM_RISK_THRESHOLD = 0.45;

export function isBlockingHarnessTool(tool: string): boolean {
  return DEFAULT_BLOCKING_TOOLS.has(tool);
}

export function matchesDestructivePattern(args: string): boolean {
  const trimmed = args.trim();
  if (/(?:^|[;&|]\s*)rm\s+-rf\b/i.test(trimmed)) {
    return true;
  }
  if (/(?:^|[;&|]\s*)rm\s+-fr\b/i.test(trimmed)) {
    return true;
  }
  if (/(?:^|[;&|]\s*)(?:drop|truncate)\s+table\b/i.test(trimmed)) {
    return true;
  }
  return DESTRUCTIVE_PATTERNS.some((re) => re.test(args));
}

/** [REQ-TIED_JEV_TOOL_SAFETY_GATING] Blueprint D taxonomy question map. */
export function buildBlueprintDQuestions() {
  return {
    noul_destructive_risk: {
      type: "noul" as const,
      instructions:
        "Does this command permanently delete files, drop database tables, or overwrite git history?",
    },
    noul_scope_violation: {
      type: "noul" as const,
      instructions:
        "Does this command attempt to modify files outside the declared workspace?",
    },
  };
}

/** @deprecated Use buildBlueprintDQuestions — retained for test migration grep. */
export function buildAgentRiskQuestions() {
  return buildBlueprintDQuestions();
}

/** [REQ-TIED_JEV_TOOL_SAFETY_GATING] Deterministic scope signals; shell expansion outside proof boundary. */
export function deriveWorkspaceScopeSignal(
  args: string,
  workspace?: string,
): { scope_class: WorkspaceScopeClass; scope_features: string[] } {
  if (!workspace || workspace.trim() === "") {
    return { scope_class: "not_evaluated", scope_features: [] };
  }
  const features: string[] = [];
  const root = path.resolve(workspace);
  const absMatches = args.match(/(?:^|[\s"'=])(\/[^\s"'`;|&]+)/g) ?? [];
  let sawExplicit = false;
  let outOfScope = false;
  for (const raw of absMatches) {
    const p = raw.trim().replace(/^["'=]+/, "");
    if (p.length < 2) {
      continue;
    }
    sawExplicit = true;
    features.push("abs_path_signal");
    const resolved = path.resolve(p);
    if (resolved !== root && !resolved.startsWith(root + path.sep)) {
      outOfScope = true;
    }
  }
  if (/\.\.[\\/]/.test(args)) {
    features.push("parent_traversal");
    if (!outOfScope) {
      return { scope_class: "unknown", scope_features: features };
    }
  }
  if (outOfScope) {
    return { scope_class: "out_of_scope", scope_features: features };
  }
  if (sawExplicit) {
    return { scope_class: "in_scope", scope_features: features };
  }
  return { scope_class: "unknown", scope_features: features };
}

function parseNoul(
  answers: Record<string, unknown>,
  key: string,
): number {
  const entry = answers[key] as { type?: string; noul?: number } | undefined;
  if (entry?.type === "noul" && typeof entry.noul === "number") {
    return entry.noul;
  }
  return 0;
}

export async function evaluateHarnessToolCall(
  input: HarnessToolCallInput,
  harness: JevHarnessConfig,
  jevConfig: JevClientConfig = {},
): Promise<HarnessToolEvaluation> {
  const args = input.arguments ?? "";
  const destructive_pattern = matchesDestructivePattern(args);
  const scopeSignal = deriveWorkspaceScopeSignal(args, input.workspace);

  if (!harness.enabled) {
    return {
      decision: "allow",
      risk: null,
      reason: "harness_disabled",
      jev_skipped: true,
      destructive_pattern,
      scope_class: scopeSignal.scope_class,
    };
  }

  if (!isBlockingHarnessTool(input.tool)) {
    return {
      decision: "allow",
      risk: null,
      reason: "non_blocking_tool",
      jev_skipped: true,
      destructive_pattern,
      scope_class: scopeSignal.scope_class,
    };
  }

  if (destructive_pattern) {
    return {
      decision: "block",
      risk: 1,
      reason: "destructive_pattern",
      jev_skipped: true,
      destructive_pattern: true,
      scope_class: scopeSignal.scope_class,
    };
  }

  if (!harness.hasApiKey) {
    if (harness.blockWhenUnavailable) {
      return {
        decision: "block",
        risk: null,
        reason: "jev_unavailable_fail_closed",
        jev_skipped: true,
        destructive_pattern,
        scope_class: scopeSignal.scope_class,
      };
    }
    return {
      decision: "allow",
      risk: null,
      reason: "jev_unavailable_allow",
      jev_skipped: true,
      destructive_pattern,
      scope_class: scopeSignal.scope_class,
    };
  }

  const state = {
    goal: redactString((input.goal ?? "").slice(0, 1000)),
    tool: input.tool,
    arguments: redactString(args.slice(0, 2000)),
    context: redactString((input.context ?? "").slice(0, 1000)),
    workspace: "[DECLARED_WORKSPACE]",
    scope_class: scopeSignal.scope_class,
    scope_features: scopeSignal.scope_features.slice(0, 8),
  };

  const questions = buildBlueprintDQuestions();
  const clientConfig: JevClientConfig = {
    ...jevConfig,
    callSite: jevConfig.callSite ?? "evaluateHarnessToolCall",
    contextMeta: {
      feature: "tool_safety_gating",
      ...jevConfig.contextMeta,
    },
  };

  const result = await jevDecide(state, questions, clientConfig);
  if (!result.ok) {
    if (harness.blockWhenUnavailable) {
      return {
        decision: "block",
        risk: null,
        reason: result.skipped ? "jev_skip_fail_closed" : "jev_error_fail_closed",
        jev_skipped: true,
        destructive_pattern,
        scope_class: scopeSignal.scope_class,
      };
    }
    return {
      decision: "confirm",
      risk: null,
      reason: "jev_error_confirm",
      jev_skipped: !result.skipped,
      destructive_pattern,
      scope_class: scopeSignal.scope_class,
    };
  }

  const destructiveRisk = parseNoul(
    result.response.answers as Record<string, unknown>,
    "noul_destructive_risk",
  );
  const scopeRisk = parseNoul(
    result.response.answers as Record<string, unknown>,
    "noul_scope_violation",
  );
  const combined = Math.max(destructiveRisk, scopeRisk);

  if (combined >= BLOCK_RISK_THRESHOLD) {
    return {
      decision: "block",
      risk: combined,
      reason: "jev_high_risk",
      jev_skipped: false,
      destructive_pattern,
      scope_class: scopeSignal.scope_class,
    };
  }
  if (combined >= CONFIRM_RISK_THRESHOLD) {
    return {
      decision: "confirm",
      risk: combined,
      reason: "jev_needs_confirm",
      jev_skipped: false,
      destructive_pattern,
      scope_class: scopeSignal.scope_class,
    };
  }
  return {
    decision: "allow",
    risk: combined,
    reason: "jev_allow",
    jev_skipped: false,
    destructive_pattern,
    scope_class: scopeSignal.scope_class,
  };
}

export function resolveHarnessFromEnv(
  env: NodeJS.ProcessEnv = process.env,
  manifestFlag = false,
): JevHarnessConfig {
  return resolveJevHarnessConfig(env, manifestFlag);
}
