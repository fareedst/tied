/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 */

import type { JevClientConfig } from "./client.js";
import { jevDecide } from "./client.js";
import type { JevHarnessConfig } from "./harness-config.js";

export type ContextFilterAction = "keep" | "truncate" | "drop";

export type ContextFilterAdvisory = {
  action: ContextFilterAction;
  relevance: string | null;
  jev_skipped: boolean;
  reason: string;
};

export async function adviseContextFilter(
  taskSummary: string,
  contextItem: string,
  harness: JevHarnessConfig,
  jevConfig: JevClientConfig = {},
): Promise<ContextFilterAdvisory> {
  if (!harness.enabled) {
    return {
      action: "keep",
      relevance: null,
      jev_skipped: true,
      reason: "harness_disabled",
    };
  }

  if (!harness.hasApiKey) {
    return {
      action: "keep",
      relevance: null,
      jev_skipped: true,
      reason: "no_jev_key_advisory_only",
    };
  }

  const result = await jevDecide(
    {
      task: taskSummary.slice(0, 1500),
      item: contextItem.slice(0, 3000),
    },
    {
      drop_item: {
        type: "noul",
        instructions: "Should this context item be dropped as irrelevant or redundant?",
      },
      truncate_item: {
        type: "noul",
        instructions: "Should this item be truncated to save tokens while keeping signal?",
      },
    },
    jevConfig,
  );

  if (!result.ok) {
    return {
      action: "keep",
      relevance: null,
      jev_skipped: true,
      reason: result.skipped ? "jev_skipped" : "jev_error",
    };
  }

  const drop = result.response.answers.drop_item;
  const trunc = result.response.answers.truncate_item;
  const dropN = drop?.type === "noul" ? drop.noul : 0;
  const truncN = trunc?.type === "noul" ? trunc.noul : 0;

  if (dropN >= 0.6) {
    return {
      action: "drop",
      relevance: "low",
      jev_skipped: false,
      reason: "jev_drop",
    };
  }
  if (truncN >= 0.55) {
    return {
      action: "truncate",
      relevance: "partial",
      jev_skipped: false,
      reason: "jev_truncate",
    };
  }
  return {
    action: "keep",
    relevance: "high",
    jev_skipped: false,
    reason: "jev_keep",
  };
}
