/**
 * [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [IMPL-TIED_UNIFIED_TOOLCHAIN]
 * Deterministic sha256 hex matching Go checklist.StableHash / MCP stableHash.
 */
import { createHash } from "node:crypto";

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => stableValue(item));
  }
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    const out: Record<string, unknown> = {};
    for (const key of keys) {
      out[key] = stableValue(record[key]);
    }
    return out;
  }
  return value;
}

export function stableHash(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(stableValue(value)), "utf8")
    .digest("hex");
}

export function fileContentHash(data: Buffer | string): string {
  const buf = typeof data === "string" ? Buffer.from(data, "utf8") : data;
  return `sha256:${createHash("sha256").update(buf).digest("hex")}`;
}
