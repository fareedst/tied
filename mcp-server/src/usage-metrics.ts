/**
 * Opt-in local MCP tool usage metrics.
 * - [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS] How: INPUT/OUTPUT/DATA for usage-metrics module. Composition: independent of feedback.yaml; metrics file is append-only JSONL outside project TIED YAML unless path overridden.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { resolveProjectIdentity, anonymizedProjectId } from "./project-identity.js";
import { getBasePath } from "./yaml-loader.js";

export { anonymizedProjectId };

export const METRICS_SCHEMA_VERSION = 1;

const BLOB_KEYS = new Set([
  "record",
  "updates",
  "detail_record",
  "index_record",
  "essence_pseudocode",
  "steps",
  "context",
]);

const PRESERVED_SCALAR_KEYS = new Set([
  "token",
  "index",
  "type",
  "format",
  "dry_run",
  "view",
  "field",
  "value",
  "old_token",
  "new_token",
  "base_path",
  "project_root",
  "proposal_id",
  "explicit_opt_in",
  "run_validate_consistency",
  "set_unpassed_reqs_to_planned",
  "set_unpassed_impl_to_planned",
  "upsert_index",
  "sync_index",
  "include_report_snippet",
  "essence_pseudocode_path",
  "run_id",
  "profile_depth",
  "scope_hash",
  "commit",
]);

const MAX_STRING_LEN = 200;

export type ToolHandlerResult = {
  content: Array<{ type: string; text?: string }>;
  isError?: boolean;
};

export type ToolHandler = (args: unknown) => Promise<ToolHandlerResult>;

export interface MetricsRecord {
  v: number;
  ts: string;
  tool: string;
  client: string;
  project_id?: string;
  run_id?: string;
  profile_depth?: string;
  scope_hash?: string;
  commit?: string;
  duration_ms: number;
  ok: boolean;
  error_snippet: string | null;
  args_summary: Record<string, unknown>;
  args_signature: string;
}

function envTruthy(name: string): boolean {
  const raw = process.env[name];
  if (raw == null || raw === "") return false;
  const v = raw.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/** True when TIED_MCP_COLLECT_METRICS is 1 or true. [IMPL-MCP_USAGE_METRICS] */
export function isMetricsEnabled(): boolean {
  return envTruthy("TIED_MCP_COLLECT_METRICS");
}

/** Resolve JSONL path; override via TIED_MCP_METRICS_PATH. [ARCH-MCP_USAGE_METRICS] */
export function resolveMetricsPath(): string {
  const override = process.env.TIED_MCP_METRICS_PATH?.trim();
  if (override) return path.resolve(override);
  return path.join(os.homedir(), ".cursor", "logs", "tied-mcp-metrics.jsonl");
}

function byteLengthOf(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "string") return Buffer.byteLength(value, "utf8");
  try {
    return Buffer.byteLength(JSON.stringify(value), "utf8");
  } catch {
    return String(value).length;
  }
}

function truncateString(s: string): string {
  if (s.length <= MAX_STRING_LEN) return s;
  return s.slice(0, MAX_STRING_LEN) + "…";
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(",")}]`;
  }
  if (value != null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function summarizeValue(key: string, value: unknown): unknown {
  if (BLOB_KEYS.has(key)) {
    if (value != null && typeof value === "object" && !Array.isArray(value)) {
      return { _keys: Object.keys(value as object).sort() };
    }
    return { _bytes: byteLengthOf(value) };
  }
  if (value == null || typeof value === "boolean" || typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return truncateString(value);
  }
  if (Array.isArray(value)) {
    return { _bytes: byteLengthOf(value), _length: value.length };
  }
  if (typeof value === "object") {
    return { _keys: Object.keys(value as object).sort() };
  }
  return truncateString(String(value));
}

/** Build sanitized args_summary and stable args_signature. [IMPL-MCP_USAGE_METRICS] */
export function sanitizeArgs(
  _toolName: string,
  args: unknown
): { args_summary: Record<string, unknown>; args_signature: string } {
  const summary: Record<string, unknown> = {};
  if (args != null && typeof args === "object" && !Array.isArray(args)) {
    const record = args as Record<string, unknown>;
    for (const [key, value] of Object.entries(record)) {
      if (PRESERVED_SCALAR_KEYS.has(key)) {
        summary[key] = summarizeValue(key, value);
      } else if (BLOB_KEYS.has(key)) {
        summary[key] = summarizeValue(key, value);
      } else if (
        typeof value === "boolean" ||
        typeof value === "number" ||
        value == null
      ) {
        summary[key] = value;
      } else if (typeof value === "string") {
        summary[key] = truncateString(value);
      } else {
        summary[key] = summarizeValue(key, value);
      }
    }
  }
  const stable = stableSerialize(summary);
  const args_signature = crypto.createHash("sha256").update(stable).digest("hex").slice(0, 24);
  return { args_summary: summary, args_signature };
}

function redactErrorMessage(message: string): string {
  return truncateString(message.replace(/(?:[A-Za-z]:[\\/]|\/)[^\s]+/g, "<path>"));
}

function extractErrorSnippet(result: ToolHandlerResult | undefined, thrown: unknown): string | null {
  if (thrown != null) {
    const msg = thrown instanceof Error ? thrown.message : String(thrown);
    return redactErrorMessage(msg);
  }
  if (result?.isError) {
    const text = result.content?.map((b) => b.text ?? "").join("") ?? "";
    return text ? redactErrorMessage(text) : "isError";
  }
  return null;
}

/** Append one metrics record; non-fatal on IO failure. [ARCH-MCP_USAGE_METRICS] */
export function recordToolCall(input: Omit<MetricsRecord, "v" | "ts">): void {
  if (!isMetricsEnabled()) return;
  const filePath = resolveMetricsPath();
  const record: MetricsRecord = {
    v: METRICS_SCHEMA_VERSION,
    ts: new Date().toISOString(),
    ...input,
  };
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.appendFileSync(filePath, `${JSON.stringify(record)}\n`, "utf8");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`DIAGNOSTIC: TIED MCP metrics append failed (${filePath}): ${msg}`);
  }
}

/** Wrap a tool handler with timing and JSONL recording when enabled. [IMPL-MCP_USAGE_METRICS] */
export function wrapToolHandler(toolName: string, handler: ToolHandler): ToolHandler {
  if (!isMetricsEnabled()) return handler;
  return async (args: unknown) => {
    const start = performance.now();
    let result: ToolHandlerResult | undefined;
    let thrown: unknown;
    try {
      result = await handler(args);
      return result;
    } catch (e) {
      thrown = e;
      throw e;
    } finally {
      const duration_ms = Math.round(performance.now() - start);
      const ok = thrown == null && !result?.isError;
      const { args_summary, args_signature } = sanitizeArgs(toolName, args);
      const client = process.env.TIED_MCP_METRICS_CLIENT?.trim() || "cursor-mcp";
      let base_path = "";
      try {
        base_path = getBasePath();
      } catch {
        base_path = process.env.TIED_BASE_PATH ?? "";
      }
      const argRecord =
        args != null && typeof args === "object" && !Array.isArray(args)
          ? (args as Record<string, unknown>)
          : {};
      const runMetadata =
        argRecord.run_metadata != null && typeof argRecord.run_metadata === "object"
          ? (argRecord.run_metadata as Record<string, unknown>)
          : {};
      recordToolCall({
        tool: toolName,
        client,
        project_id: resolveProjectIdentity(base_path).project_id,
        run_id: typeof argRecord.run_id === "string" ? argRecord.run_id : typeof runMetadata.run_id === "string" ? runMetadata.run_id : undefined,
        profile_depth: typeof argRecord.profile_depth === "string" ? argRecord.profile_depth : undefined,
        scope_hash: typeof argRecord.scope_hash === "string" ? argRecord.scope_hash : undefined,
        commit: typeof argRecord.commit === "string" ? argRecord.commit : typeof runMetadata.commit === "string" ? runMetadata.commit : undefined,
        duration_ms,
        ok,
        error_snippet: extractErrorSnippet(result, thrown),
        args_summary,
        args_signature,
      });
    }
  };
}

/** Instrument every registered tool exactly once when metrics are enabled. [IMPL-MCP_USAGE_METRICS] */
export function instrumentToolHandlers<T extends { name: string; handler: unknown }>(
  tools: readonly T[],
): Map<string, ToolHandler> {
  const handlers = new Map<string, ToolHandler>();
  for (const tool of tools) {
    const handler = tool.handler as ToolHandler;
    handlers.set(tool.name, isMetricsEnabled() ? wrapToolHandler(tool.name, handler) : handler);
  }
  return handlers;
}
