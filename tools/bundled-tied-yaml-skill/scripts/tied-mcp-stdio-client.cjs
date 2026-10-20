#!/usr/bin/env node
/**
 * MCP stdio client for tied-cli.sh: spawns the MCP server, sends initialize +
 * notifications/initialized + tools/call as newline-delimited JSON (built with
 * JSON.stringify so large arguments never go through execve env limits),
 * buffers stdout, extracts tools/call result text, and normalizes IMPL detail JSON
 * so essence_pseudocode is never omitted from stringify (undefined / spread edge cases).
 */
"use strict";

const fs = require("node:fs");
const { spawn } = require("node:child_process");

/** [IMPL-TIED_TOOL_INPUT_NORMALIZATION] [REQ-TIED_TOOL_INPUT_COMPATIBILITY] Machine-readable CLI hindrance line; exit codes unchanged. */
function emitCliHindranceDiagnostic(payload) {
  try {
    process.stderr.write(`DIAGNOSTIC: TIED_CLI_HINDRANCE ${JSON.stringify(payload)}\n`);
  } catch {
    /* diagnostic_serialization_fail — omit secondary line */
  }
}

const mcpBin = process.env.TIED_CLI_MCP_BIN || "";
const umbrellaEntry = process.env.TIED_CLI_UMBRELLA_ENTRY || "";
const useUmbrellaMcp = process.env.TIED_CLI_UMBRELLA_MCP === "1" && umbrellaEntry;
const requestId = Number(process.env.TIED_CLI_REQUEST_ID || "1");
const toolName = process.env.TIED_CLI_TOOL_NAME || "";
const argsFile = process.env.TIED_CLI_ARGS_FILE || "";

if (!mcpBin) {
  console.error("ERROR: TIED_CLI_MCP_BIN is not set.");
  process.exit(1);
}

/** Load tools/call arguments object (never rely on huge TIED_CLI_ARGS_JSON in env). */
function loadArgumentsObject() {
  if (argsFile) {
    try {
      const raw = fs.readFileSync(argsFile, "utf8");
      return JSON.parse(raw);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      emitCliHindranceDiagnostic({
        failure_kind: "parse_error",
        recovery_hint: "Ensure TIED_CLI_ARGS_FILE is valid UTF-8 JSON object.",
      });
      console.error(`ERROR: Failed to read or parse TIED_CLI_ARGS_FILE (${argsFile}): ${msg}`);
      process.exit(1);
    }
  }
  const raw = process.env.TIED_CLI_ARGS_JSON || "{}";
  try {
    return JSON.parse(raw);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    emitCliHindranceDiagnostic({
      failure_kind: "parse_error",
      recovery_hint: "Ensure TIED_CLI_ARGS_JSON is a single JSON object.",
    });
    console.error(`ERROR: Invalid TIED_CLI_ARGS_JSON: ${msg}`);
    process.exit(1);
  }
}

/**
 * For impl_detail_set_essence_pseudocode, inject body from a UTF-8 file (TIED_CLI_IMPL_ESSENCE_FILE)
 * or from stdin (TIED_CLI_IMPL_ESSENCE_STDIN=1) so callers need not build JSON with a huge string.
 * File/stdin content becomes essence_pseudocode; any essence_pseudocode_path in args is removed.
 */
function mergeImplEssencePseudocodeFromEnv(baseArgs) {
  if (toolName !== "impl_detail_set_essence_pseudocode") {
    return baseArgs;
  }
  const fromFile = process.env.TIED_CLI_IMPL_ESSENCE_FILE;
  const fromStdin =
    process.env.TIED_CLI_IMPL_ESSENCE_STDIN === "1" || process.env.TIED_CLI_IMPL_ESSENCE_STDIN === "true";
  if (fromFile && fromStdin) {
    console.error("ERROR: Set at most one of TIED_CLI_IMPL_ESSENCE_FILE and TIED_CLI_IMPL_ESSENCE_STDIN=1");
    process.exit(1);
  }
  if (fromFile) {
    let content;
    try {
      content = fs.readFileSync(fromFile, "utf8");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`ERROR: TIED_CLI_IMPL_ESSENCE_FILE: ${msg}`);
      process.exit(1);
    }
    const next = { ...baseArgs };
    delete next.essence_pseudocode_path;
    next.essence_pseudocode = content;
    return next;
  }
  if (fromStdin) {
    let content;
    try {
      content = fs.readFileSync(0, "utf8");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`ERROR: reading stdin: ${msg}`);
      process.exit(1);
    }
    const next = { ...baseArgs };
    delete next.essence_pseudocode_path;
    next.essence_pseudocode = content;
    return next;
  }
  return baseArgs;
}

const argsObj = mergeImplEssencePseudocodeFromEnv(loadArgumentsObject());
const argsJsonForNormalize = JSON.stringify(argsObj);

function ensureImplEssencePseudocodeKey(record) {
  if (!record || typeof record !== "object" || Array.isArray(record) || record.error) {
    return record;
  }
  const next = { ...record };
  if (!("essence_pseudocode" in next) || next.essence_pseudocode === undefined) {
    next.essence_pseudocode = null;
  }
  return next;
}

function normalizeToolOutput(toolName, argsJsonStr, text) {
  if (toolName !== "yaml_detail_read_many" && toolName !== "yaml_detail_read") {
    return text;
  }
  let args = {};
  try {
    args = JSON.parse(argsJsonStr);
  } catch {
    /* ignore */
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return text;
  }

  if (toolName === "yaml_detail_read_many" && data && typeof data === "object" && !data.error) {
    const out = { ...data };
    for (const [tok, rec] of Object.entries(out)) {
      if (tok.startsWith("IMPL-") && rec && typeof rec === "object" && !rec.error) {
        out[tok] = ensureImplEssencePseudocodeKey(rec);
      }
    }
    return JSON.stringify(out, null, 2);
  }

  if (
    toolName === "yaml_detail_read" &&
    typeof args.token === "string" &&
    args.token.startsWith("IMPL-") &&
    data &&
    typeof data === "object" &&
    !data.error &&
    data._format !== "markdown"
  ) {
    return JSON.stringify(ensureImplEssencePseudocodeKey(data), null, 2);
  }

  return text;
}

function extractToolText(result) {
  const c = result && result.content;
  if (Array.isArray(c)) {
    return c.map((b) => (typeof b?.text === "string" ? b.text : JSON.stringify(b))).join("");
  }
  return JSON.stringify(result);
}

const initLine = JSON.stringify({
  jsonrpc: "2.0",
  id: 0,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "tied-cli", version: "1.0.0" },
  },
});
const initializedLine = JSON.stringify({
  jsonrpc: "2.0",
  method: "notifications/initialized",
});
const callLine = JSON.stringify({
  jsonrpc: "2.0",
  id: requestId,
  method: "tools/call",
  params: {
    name: toolName,
    arguments: argsObj,
  },
});

const spawnArgs = useUmbrellaMcp ? [umbrellaEntry, "mcp"] : [mcpBin];
const child = spawn(process.execPath, spawnArgs, {
  stdio: ["pipe", "pipe", "pipe"],
});

const quietMcpStderr = process.env.TIED_CLI_QUIET_MCP_STDERR !== "0";
if (quietMcpStderr) {
  child.stderr.on("data", () => {});
} else {
  child.stderr.pipe(process.stderr);
}

child.stdin.write(`${initLine}\n${initializedLine}\n${callLine}\n`, "utf8", () => {
  child.stdin.end();
});

let buffer = Buffer.alloc(0);
let done = false;

function finish(d) {
  if (done) return;
  done = true;
  if (d.error) {
    const code = typeof d.error.code === "number" ? d.error.code : undefined;
    emitCliHindranceDiagnostic({
      failure_kind: code === -32602 ? "invalid_arguments" : "tool_error",
      jsonrpc_code: code,
      tool_name: toolName,
      recovery_hint:
        code === -32602
          ? "Fix tools/call arguments per tool schema; record fields accept native objects or legacy JSON strings."
          : "Read JSON-RPC error output; verify TIED_BASE_PATH and server build.",
    });
    console.error(JSON.stringify(d.error));
    child.kill("SIGTERM");
    process.exit(2);
  }
  const raw = extractToolText(d.result);
  if (d.result && d.result.isError) {
    const invalidArgs =
      /(?:^|\s)-32602\b/.test(raw) || /Input validation error/i.test(raw);
    emitCliHindranceDiagnostic({
      failure_kind: invalidArgs ? "invalid_arguments" : "tool_error",
      jsonrpc_code: invalidArgs ? -32602 : undefined,
      tool_name: toolName,
      recovery_hint: invalidArgs
        ? "Fix tools/call arguments per tool schema; record fields accept native objects or legacy JSON strings."
        : "Tool returned isError; read stderr ERROR text for handler message.",
    });
    console.error(raw);
    child.kill("SIGTERM");
    process.exit(2);
  }
  const out = normalizeToolOutput(toolName, argsJsonForNormalize, raw);
  process.stdout.write(out + "\n");
  child.kill("SIGTERM");
  process.exit(0);
}

child.stdout.on("data", (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  while (!done) {
    const nl = buffer.indexOf(10);
    if (nl < 0) break;
    const line = buffer.subarray(0, nl).toString("utf8").replace(/\r$/, "");
    buffer = buffer.subarray(nl + 1);
    let d;
    try {
      d = JSON.parse(line);
    } catch {
      continue;
    }
    if (d != null && Number(d.id) === requestId) {
      finish(d);
      return;
    }
  }
});

child.stdout.on("end", () => {
  if (!done) {
    emitCliHindranceDiagnostic({
      failure_kind: "transport_error",
      tool_name: toolName,
      recovery_hint: "MCP server exited early; rebuild mcp-server and check TIED_MCP_BIN.",
    });
    console.error("ERROR: MCP stdout closed before tools/call response.");
    process.exit(1);
  }
});

child.on("error", (err) => {
  emitCliHindranceDiagnostic({
    failure_kind: "transport_error",
    recovery_hint: "Failed to spawn MCP server; verify TIED_MCP_BIN path and Node version.",
  });
  console.error("ERROR: Failed to spawn MCP server:", err.message);
  process.exit(1);
});
