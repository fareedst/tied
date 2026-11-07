#!/usr/bin/env node
/**
 * [REQ-MCP_HTTPS_REMOTE_ACCESS] [IMPL-TIED_CLI_HTTP_TRANSPORT]
 * MCP Streamable HTTP client for tied-cli when TIED_CLI_MCP_URL is set.
 */
import fs from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

function emitCliHindranceDiagnostic(payload) {
  try {
    process.stderr.write(`DIAGNOSTIC: TIED_CLI_HINDRANCE ${JSON.stringify(payload)}\n`);
  } catch {
    /* omit */
  }
}

const urlRaw = process.env.TIED_CLI_MCP_URL?.trim();
const toolName = process.env.TIED_CLI_TOOL_NAME || "";
const bearer = process.env.TIED_CLI_MCP_BEARER?.trim() || process.env.TIED_MCP_HTTP_BEARER_TOKEN?.trim();
const argsFile = process.env.TIED_CLI_ARGS_FILE || "";

if (!urlRaw) {
  console.error("ERROR: TIED_CLI_MCP_URL is not set.");
  process.exit(1);
}

function loadArgumentsObject() {
  if (argsFile) {
    return JSON.parse(fs.readFileSync(argsFile, "utf8"));
  }
  const raw = process.env.TIED_CLI_ARGS_JSON || "{}";
  return JSON.parse(raw);
}

const headers = { "content-type": "application/json" };
if (bearer) {
  headers.Authorization = `Bearer ${bearer}`;
}

let clientUrl;
try {
  clientUrl = new URL(urlRaw);
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  emitCliHindranceDiagnostic({
    failure_kind: "parse_error",
    recovery_hint: "Set TIED_CLI_MCP_URL to a valid absolute URL (https://host/mcp).",
  });
  console.error(`ERROR: Invalid TIED_CLI_MCP_URL: ${msg}`);
  process.exit(1);
}

const transport = new StreamableHTTPClientTransport(clientUrl, { requestInit: { headers } });
const client = new Client({ name: "tied-cli", version: "1.0.0" });

try {
  await client.connect(transport);
  const argsObj = loadArgumentsObject();
  const result = await client.callTool({ name: toolName, arguments: argsObj });
  const text = result.content
    ?.map((c) => (c.type === "text" ? c.text : ""))
    .filter(Boolean)
    .join("\n");
  if (text) {
    process.stdout.write(text);
    if (!text.endsWith("\n")) process.stdout.write("\n");
  } else {
    process.stdout.write(JSON.stringify(result, null, 2));
    process.stdout.write("\n");
  }
  await client.close();
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  emitCliHindranceDiagnostic({
    failure_kind: "transport_error",
    recovery_hint: "Verify TIED_CLI_MCP_URL, bearer token, and that tied mcp serve is running.",
  });
  console.error(`ERROR: MCP HTTP tool call failed: ${msg}`);
  process.exit(1);
}
