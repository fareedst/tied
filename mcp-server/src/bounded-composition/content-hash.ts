/**
 * [IMPL-TIED_BOUNDED_TRAJECTORY_EVIDENCE] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION]
 */

import { createHash } from "node:crypto";

export function contentHashHex(input: string | Buffer): string {
  const hash = createHash("sha256").update(input).digest("hex");
  return `sha256:${hash}`;
}

export function stableJsonHash(value: unknown): string {
  return contentHashHex(stableJsonStringify(value));
}

function stableJsonStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableJsonStringify(item)).join(",")}]`;
  }
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableJsonStringify(record[key])}`).join(",")}}`;
}
