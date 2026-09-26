/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 * W5 fail-closed tool gate when harness enabled; Jev agent/risk when key present.
 */

import type { JevClientConfig } from "./client.js";
import { jevDecide } from "./client.js";
import { resolveJevHarnessConfig, type JevHarnessConfig } from "./harness-config.js";

export const DEFAULT_BLOCKING_TOOLS = new Set(["bash", "Shell"]);

export type HarnessToolCallInput = {
  tool: string;
  arguments?: string;
  goal?: string;
  context?: string;
};

export type HarnessToolDecision = "allow" | "block" | "confirm";

export type HarnessToolEvaluation = {
  decision: HarnessToolDecision;
  risk: number | null;
  reason: string;
  jev_skipped: boolean;
  destructive_pattern: boolean;
};

const DESTRUCTIVE_PATTERNS: RegExp[] = [
  /\brm\s+-rf\b/i,
  /\bgit\s+push\s+.*--force\b/i,
  /\bdrop\s+table\b/i,
  /\btruncate\s+table\b/i,
];

const BLOCK_RISK_THRESHOLD = 0.72;
const CONFIRM_RISK_THRESHOLD = 0.45;

export function isBlockingHarnessTool(tool: string): boolean {
  return DEFAULT_BLOCKING_TOOLS.has(tool);
}

export function matchesDestructivePattern(args: string): boolean {
  return DESTRUCTIVE_PATTERNS.some((re) => re.test(args));
}

function buildAgentRiskQuestions() {
  return {
    high_risk: {
      type: "noul" as const,
      instructions:
        "Is this tool invocation likely destructive, irreversible, or harmful if mistaken?",
    },
    needs_confirm: {
      type: "noul" as const,
      instructions:
        "Should a human confirm before running, even if not fully blocked?",
    },
  };
}

export async function evaluateHarnessToolCall(
  input: HarnessToolCallInput,
  harness: JevHarnessConfig,
  jevConfig: JevClientConfig = {},
): Promise<HarnessToolEvaluation> {
  const args = input.arguments ?? "";
  const destructive_pattern = matchesDestructivePattern(args);

  if (!harness.enabled) {
    return {
      decision: "allow",
      risk: null,
      reason: "harness_disabled",
      jev_skipped: true,
      destructive_pattern,
    };
  }

  if (!isBlockingHarnessTool(input.tool)) {
    return {
      decision: "allow",
      risk: null,
      reason: "non_blocking_tool",
      jev_skipped: true,
      destructive_pattern,
    };
  }

  if (destructive_pattern) {
    return {
      decision: "block",
      risk: 1,
      reason: "destructive_pattern",
      jev_skipped: true,
      destructive_pattern: true,
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
      };
    }
    return {
      decision: "allow",
      risk: null,
      reason: "jev_unavailable_allow",
      jev_skipped: true,
      destructive_pattern,
    };
  }

  const state = {
    goal: (input.goal ?? "").slice(0, 1000),
    tool: input.tool,
    arguments: args.slice(0, 2000),
    context: (input.context ?? "").slice(0, 1000),
  };

  const result = await jevDecide(state, buildAgentRiskQuestions(), jevConfig);
  if (!result.ok) {
    if (harness.blockWhenUnavailable) {
      return {
        decision: "block",
        risk: null,
        reason: result.skipped ? "jev_skip_fail_closed" : "jev_error_fail_closed",
        jev_skipped: true,
        destructive_pattern,
      };
    }
    return {
      decision: "confirm",
      risk: null,
      reason: "jev_error_confirm",
      jev_skipped: !result.skipped,
      destructive_pattern,
    };
  }

  const high = result.response.answers.high_risk;
  const confirm = result.response.answers.needs_confirm;
  const highRisk =
    high?.type === "noul" && typeof high.noul === "number" ? high.noul : 0;
  const needsConfirm =
    confirm?.type === "noul" && typeof confirm.noul === "number"
      ? confirm.noul
      : 0;

  const risk = Math.max(highRisk, needsConfirm);

  if (highRisk >= BLOCK_RISK_THRESHOLD) {
    return {
      decision: "block",
      risk: highRisk,
      reason: "jev_high_risk",
      jev_skipped: false,
      destructive_pattern,
    };
  }
  if (needsConfirm >= CONFIRM_RISK_THRESHOLD) {
    return {
      decision: "confirm",
      risk: needsConfirm,
      reason: "jev_needs_confirm",
      jev_skipped: false,
      destructive_pattern,
    };
  }
  return {
    decision: "allow",
    risk,
    reason: "jev_allow",
    jev_skipped: false,
    destructive_pattern,
  };
}

export function resolveHarnessFromEnv(
  env: NodeJS.ProcessEnv = process.env,
  manifestFlag = false,
): JevHarnessConfig {
  return resolveJevHarnessConfig(env, manifestFlag);
}
