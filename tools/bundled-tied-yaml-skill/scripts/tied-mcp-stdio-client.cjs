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

const mcpBin = process.env.TIED_CLI_MCP_BIN || "";
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
      console.error(`ERROR: Failed to read or parse TIED_CLI_ARGS_FILE (${argsFile}): ${msg}`);
      process.exit(1);
    }
  }
  const raw = process.env.TIED_CLI_ARGS_JSON || "{}";
  try {
    return JSON.parse(raw);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`ERROR: Invalid TIED_CLI_ARGS_JSON: ${msg}`);
    process.exit(1);
  }
}

const argsObj = loadArgumentsObject();
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

const child = spawn(process.execPath, [mcpBin], {
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
    console.error(JSON.stringify(d.error));
    child.kill("SIGTERM");
    process.exit(2);
  }
  const raw = extractToolText(d.result);
  if (d.result && d.result.isError) {
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
    console.error("ERROR: MCP stdout closed before tools/call response.");
    process.exit(1);
  }
});

child.on("error", (err) => {
  console.error("ERROR: Failed to spawn MCP server:", err.message);
  process.exit(1);
});
