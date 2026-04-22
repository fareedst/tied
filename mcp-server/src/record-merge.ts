/**
 * Merge MCP `updates` into an existing index or detail record without clobbering
 * nested maps when the client sends partial `metadata` / `traceability` / etc.
 */

const DEEP_MERGE_ONE_LEVEL_KEYS = new Set([
  "metadata",
  "traceability",
  "related_requirements",
  "related_decisions",
  "rationale",
  "implementation_approach",
]);

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

const METADATA_NESTED_OBJECT_KEYS = ["last_updated", "last_validated"] as const;

/**
 * Merge two metadata maps: one-level spread, plus one extra level for
 * last_updated / last_validated when both sides are plain objects (preserve date/author when only reason is sent).
 */
function mergeMetadataObjects(
  prev: Record<string, unknown>,
  incoming: Record<string, unknown>
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...prev, ...incoming };
  for (const nested of METADATA_NESTED_OBJECT_KEYS) {
    const p = prev[nested];
    const inc = incoming[nested];
    if (isPlainObject(p) && isPlainObject(inc)) {
      merged[nested] = { ...p, ...inc };
    }
  }
  return merged;
}

/**
 * Top-level shallow merge, except for whitelisted keys where both existing and
 * update values are plain objects: merge those objects one level
 * (`{ ...existing[key], ...updates[key] }`), with special handling for `metadata`.
 */
export function mergeRecordUpdate(
  existing: Record<string, unknown>,
  updates: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...existing };
  for (const [key, value] of Object.entries(updates)) {
    if (DEEP_MERGE_ONE_LEVEL_KEYS.has(key) && isPlainObject(value)) {
      const prev = out[key];
      if (isPlainObject(prev)) {
        out[key] =
          key === "metadata"
            ? mergeMetadataObjects(prev, value)
            : { ...prev, ...value };
      } else {
        out[key] = value;
      }
    } else {
      out[key] = value;
    }
  }
  return out;
}
