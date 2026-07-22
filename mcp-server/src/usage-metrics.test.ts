/**
 * Unit tests for usage metrics.
 * - [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS] How: Return true when TIED_MCP_COLLECT_METRICS is 1 or true (case-insensitive); else false (zero file I/O).
 * - [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS] How: Use TIED_MCP_METRICS_PATH when set; else path.join(os.homedir(), '.cursor', 'logs', 'tied-mcp-metrics.jsonl').
 * - [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS] How: Build args_summary preserving scalar keys (token, index, type, format, dry_run, view, field, value, old_token, new_token, booleans). For blob keys (record, updates, detail_record, index_record, essence_pseudocode, steps, context) emit { _bytes: N } or { _keys: [...] } only. Truncate remaining strings to 200 chars; stable JSON stringify + SHA-256 hex prefix for args_signature.
 * - [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS] How: mkdir parent of metrics path; append JSON.stringify(record) + newline; ON IO error log DIAGNOSTIC to stderr and continue (non-fatal).
 * - [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS] How: If not isMetricsEnabled(), return handler unchanged. Else return async wrapper: start timer; invoke handler; catch throws as ok false; detect result.isError; getBasePath() for base_path; client from TIED_MCP_METRICS_CLIENT or cursor-mcp; recordToolCall; rethrow or return result.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";
import {
  isMetricsEnabled,
  recordToolCall,
  resolveMetricsPath,
  sanitizeArgs,
  wrapToolHandler,
} from "./usage-metrics.js";
import { clearBasePathCache } from "./yaml-loader.js";

const ENV_KEYS = [
  "TIED_MCP_COLLECT_METRICS",
  "TIED_MCP_METRICS_PATH",
  "TIED_MCP_METRICS_CLIENT",
  "TIED_BASE_PATH",
] as const;

function saveEnv(): Record<string, string | undefined> {
  const saved: Record<string, string | undefined> = {};
  for (const k of ENV_KEYS) saved[k] = process.env[k];
  return saved;
}

function restoreEnv(saved: Record<string, string | undefined>): void {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
}

describe("isMetricsEnabled", () => {
  it("returns false when env unset [REQ-MCP_USAGE_METRICS]", () => {
    const saved = saveEnv();
    try {
      delete process.env.TIED_MCP_COLLECT_METRICS;
      assert.equal(isMetricsEnabled(), false);
    } finally {
      restoreEnv(saved);
    }
  });

  it("returns true for 1 or true [REQ-MCP_USAGE_METRICS]", () => {
    const saved = saveEnv();
    try {
      process.env.TIED_MCP_COLLECT_METRICS = "1";
      assert.equal(isMetricsEnabled(), true);
      process.env.TIED_MCP_COLLECT_METRICS = "TRUE";
      assert.equal(isMetricsEnabled(), true);
    } finally {
      restoreEnv(saved);
    }
  });
});

describe("sanitizeArgs", () => {
  it("preserves token and redacts large essence_pseudocode [IMPL-MCP_USAGE_METRICS]", () => {
    const body = "x".repeat(5000);
    const { args_summary, args_signature } = sanitizeArgs("impl_detail_set_essence_pseudocode", {
      token: "IMPL-FOO",
      essence_pseudocode: body,
    });
    assert.equal(args_summary.token, "IMPL-FOO");
    assert.deepEqual(args_summary.essence_pseudocode, { _bytes: Buffer.byteLength(body, "utf8") });
    assert.equal(typeof args_signature, "string");
    assert.equal(args_signature.length, 24);
  });

  it("stable signature for same args [IMPL-MCP_USAGE_METRICS]", () => {
    const a = sanitizeArgs("yaml_detail_read", { token: "REQ-A" });
    const b = sanitizeArgs("yaml_detail_read", { token: "REQ-A" });
    assert.equal(a.args_signature, b.args_signature);
  });
});

describe("recordToolCall and wrapToolHandler", () => {
  let tempDir: string;
  let metricsFile: string;
  let saved: Record<string, string | undefined>;

  afterEach(() => {
    restoreEnv(saved);
    clearBasePathCache();
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("does not write when metrics disabled [REQ-MCP_USAGE_METRICS]", () => {
    saved = saveEnv();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-metrics-off-"));
    metricsFile = path.join(tempDir, "metrics.jsonl");
    delete process.env.TIED_MCP_COLLECT_METRICS;
    process.env.TIED_MCP_METRICS_PATH = metricsFile;
    recordToolCall({
      tool: "yaml_index_read",
      client: "test",
      base_path: tempDir,
      duration_ms: 1,
      ok: true,
      error_snippet: null,
      args_summary: {},
      args_signature: "abc",
    });
    assert.equal(fs.existsSync(metricsFile), false);
  });

  it("appends JSONL when enabled [REQ-MCP_USAGE_METRICS]", async () => {
    saved = saveEnv();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-metrics-on-"));
    metricsFile = path.join(tempDir, "metrics.jsonl");
    process.env.TIED_MCP_COLLECT_METRICS = "1";
    process.env.TIED_MCP_METRICS_PATH = metricsFile;
    process.env.TIED_BASE_PATH = tempDir;
    clearBasePathCache();

    const handler = wrapToolHandler("yaml_detail_read", async () => ({
      content: [{ type: "text", text: "{}" }],
    }));
    await handler({ token: "REQ-TEST" });

    assert.ok(fs.existsSync(metricsFile));
    const lines = fs.readFileSync(metricsFile, "utf8").trim().split("\n");
    assert.equal(lines.length, 1);
    const row = JSON.parse(lines[0]!) as {
      tool: string;
      ok: boolean;
      args_summary: { token: string };
      client: string;
    };
    assert.equal(row.tool, "yaml_detail_read");
    assert.equal(row.ok, true);
    assert.equal(row.args_summary.token, "REQ-TEST");
    assert.equal(row.client, "cursor-mcp");
  });

  it("records ok false on throw [IMPL-MCP_USAGE_METRICS]", async () => {
    saved = saveEnv();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-metrics-err-"));
    metricsFile = path.join(tempDir, "metrics.jsonl");
    process.env.TIED_MCP_COLLECT_METRICS = "1";
    process.env.TIED_MCP_METRICS_PATH = metricsFile;

    const handler = wrapToolHandler("tied_validate_consistency", async () => {
      throw new Error("boom");
    });
    await assert.rejects(() => handler({}), /boom/);

    const row = JSON.parse(fs.readFileSync(metricsFile, "utf8").trim()) as {
      ok: boolean;
      error_snippet: string;
    };
    assert.equal(row.ok, false);
    assert.match(row.error_snippet, /boom/);
  });

  it("records ok false when isError [IMPL-MCP_USAGE_METRICS]", async () => {
    saved = saveEnv();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-metrics-iserr-"));
    metricsFile = path.join(tempDir, "metrics.jsonl");
    process.env.TIED_MCP_COLLECT_METRICS = "1";
    process.env.TIED_MCP_METRICS_PATH = metricsFile;

    const handler = wrapToolHandler("yaml_index_read", async () => ({
      content: [{ type: "text", text: "bad" }],
      isError: true,
    }));
    await handler({ index: "requirements" });

    const row = JSON.parse(fs.readFileSync(metricsFile, "utf8").trim()) as { ok: boolean };
    assert.equal(row.ok, false);
  });
});

describe("resolveMetricsPath", () => {
  it("uses TIED_MCP_METRICS_PATH when set [ARCH-MCP_USAGE_METRICS]", () => {
    const saved = saveEnv();
    try {
      process.env.TIED_MCP_METRICS_PATH = "/tmp/custom-metrics.jsonl";
      assert.equal(resolveMetricsPath(), path.resolve("/tmp/custom-metrics.jsonl"));
    } finally {
      restoreEnv(saved);
    }
  });
});
