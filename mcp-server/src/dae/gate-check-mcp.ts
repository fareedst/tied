import { allTools } from "../tools/index.js";
import type { GateValidateArgs, GateValidateFn, GateValidateResult } from "./gate-check-composition.js";

/** [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: default MCP tied_checklist_gate_validate caller for CLI composition. */

function parseGateToolPayload(text: string): GateValidateResult {
  try {
    return JSON.parse(text) as GateValidateResult;
  } catch {
    return { allowed: false, ok: false, error: "invalid_gate_response" };
  }
}

export function createMcpGateValidateFn(): GateValidateFn {
  const tool = allTools.find((t) => t.name === "tied_checklist_gate_validate");
  if (!tool) {
    throw new Error("missing_tied_checklist_gate_validate_tool");
  }
  const handler = tool.handler as (args: GateValidateArgs) => Promise<{ content: Array<{ type: string; text?: string }> }>;
  return async (args: GateValidateArgs): Promise<GateValidateResult> => {
    const result = await handler(args);
    const text = result.content[0]?.text ?? "{}";
    return parseGateToolPayload(text);
  };
}
