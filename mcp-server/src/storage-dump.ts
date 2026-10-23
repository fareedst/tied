/**
 * [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
 * Shared storage marshalling: canonical tree before YAML or JSON emission.
 */

import { canonicalizeValue, compareLexical } from "./yaml-canonicalizer.js";
import { safeDump } from "./yaml-dump.js";

export { canonicalizeValue as canonicalizeForStorage, compareLexical };

/** Serialize with tied-yaml-canonical-v1 profile (same as MCP index/detail writers). */
export function safeDumpYaml(obj: unknown): string {
  return safeDump(obj);
}

/** Deterministic pretty JSON for gate artifacts and hashed receipts. */
export function safeStringifyJson(obj: unknown): string {
  return `${JSON.stringify(canonicalizeValue(obj), null, 2)}\n`;
}

/** Compact canonical JSON for content hashes (no pretty-print). */
export function stableJsonForHash(obj: unknown): string {
  return JSON.stringify(canonicalizeValue(obj));
}

export function sortStringSet(items: readonly string[]): string[] {
  return [...items].sort(compareLexical);
}
