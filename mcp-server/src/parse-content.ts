/**
 * Parse JSON or YAML string into an object for MCP write-tool payloads.
 * Agents can pass either format; the server re-emits with safe YAML quoting.
 * [IMPL-TIED_TOOL_INPUT_NORMALIZATION] [ARCH-TIED_TOOL_INPUT_NORMALIZATION] [REQ-TIED_TOOL_INPUT_COMPATIBILITY]
 */

import yaml from "js-yaml";
import { z } from "zod";

export type ParseResult =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; error: string };

/** Zod schema: legacy JSON/YAML string or native record object on MCP tools/call. */
export const recordInputSchema = z.union([
  z.string(),
  z.record(z.string(), z.unknown()),
]);

/**
 * Parse a string as JSON or YAML into a record object.
 * Tries JSON first; if that fails, tries YAML. Returns an error if neither yields a non-null object.
 */
export function parseRecordOrYaml(str: string): ParseResult {
  let value: unknown;
  try {
    value = JSON.parse(str);
  } catch {
    try {
      value = yaml.load(str);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { ok: false, error: `Invalid JSON and YAML: ${msg}` };
    }
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: "Payload must be a JSON or YAML object (not null, array, or primitive)" };
  }
  return { ok: true, value: value as Record<string, unknown> };
}

/**
 * Normalize MCP write-tool record field: plain object pass-through or legacy string parsing.
 */
export function normalizeRecordPayload(raw: unknown): ParseResult {
  if (raw === undefined) {
    return {
      ok: false,
      error: "Payload must be a JSON or YAML object (not null, array, or primitive)",
    };
  }
  if (typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
    return { ok: true, value: raw as Record<string, unknown> };
  }
  if (typeof raw === "string") {
    return parseRecordOrYaml(raw);
  }
  return {
    ok: false,
    error: "Payload must be a JSON or YAML object (not null, array, or primitive)",
  };
}
