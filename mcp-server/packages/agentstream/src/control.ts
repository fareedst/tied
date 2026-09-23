/**
 * [IMPL-GOAGENT-CHECKLIST-CONTROL] [ARCH-GOAGENT-CHECKLIST-CONTROL] [REQ-GOAGENT-CHECKLIST-CONTROL]
 * Parse agentstream_control trailers from agent output (Go control parity, Phase 4a live run).
 */

export const CONTROL_SCHEMA_VERSION = 1;
export const ACTION_GOTO = "goto";

export type ControlDecision = {
  schemaVersion: number;
  action: string;
  target?: string;
  reason?: string;
  evidence?: string[];
};

function fencedJsonBlocks(text: string): string[] {
  const lines = text.split("\n");
  const blocks: string[] = [];
  let inFence = false;
  let current: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!inFence) {
      if (trimmed === "```json") {
        inFence = true;
        current = [];
      }
      continue;
    }
    if (trimmed.startsWith("```")) {
      blocks.push(current.join("\n"));
      inFence = false;
      current = [];
      continue;
    }
    current.push(line);
  }
  return blocks;
}

export function parseControl(
  text: string,
): { decision: ControlDecision; ok: boolean; error?: Error } {
  const blocks = fencedJsonBlocks(text);
  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i]!;
    let raw: Record<string, unknown>;
    try {
      raw = JSON.parse(block) as Record<string, unknown>;
    } catch (err) {
      if (block.includes("agentstream_control")) {
        return {
          decision: emptyDecision(),
          ok: false,
          error: new Error(`invalid agentstream_control JSON: ${String(err)}`),
        };
      }
      continue;
    }
    if (!Object.prototype.hasOwnProperty.call(raw, "agentstream_control")) {
      continue;
    }
    const body = raw.agentstream_control as Record<string, unknown>;
    const decision: ControlDecision = {
      schemaVersion: Number(body.schema_version ?? 0),
      action: String(body.action ?? ""),
      target: body.target !== undefined ? String(body.target) : undefined,
      reason: body.reason !== undefined ? String(body.reason) : undefined,
      evidence: Array.isArray(body.evidence)
        ? body.evidence.map((e) => String(e))
        : undefined,
    };
    return { decision, ok: true };
  }
  return { decision: emptyDecision(), ok: false };
}

function emptyDecision(): ControlDecision {
  return { schemaVersion: 0, action: "" };
}

export function validateControl(
  d: ControlDecision,
  knownSlugs: Record<string, boolean>,
): Error | null {
  if (d.schemaVersion !== CONTROL_SCHEMA_VERSION) {
    return new Error(
      `agentstream_control schema_version must be ${CONTROL_SCHEMA_VERSION}, got ${d.schemaVersion}`,
    );
  }
  switch (d.action) {
    case ACTION_GOTO: {
      const target = (d.target ?? "").trim();
      if (target === "") {
        return new Error("agentstream_control goto requires target");
      }
      if (!knownSlugs[target]) {
        return new Error(
          `agentstream_control target not found in checklist turns: ${target}`,
        );
      }
      return null;
    }
    default:
      return new Error(`unsupported agentstream_control action: ${d.action}`);
  }
}
