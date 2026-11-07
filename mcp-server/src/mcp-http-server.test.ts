/**
 * [REQ-MCP_HTTPS_REMOTE_ACCESS] [IMPL-MCP_HTTP_SERVER]
 */
import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTiedYamlMcpServer } from "./tied-mcp-server-factory.js";
import { startMcpHttpServer } from "./mcp-http-server.js";
import { bindWritableProjectCorpus } from "./test-helpers/client-path-env.js";
import { allTools } from "./tools/index.js";
import { selectToolsForProfile } from "./tool-profiles.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storeRoot = path.resolve(__dirname, "../..");
const tiedProject = path.join(storeRoot, "tied-project");

describe("mcp-http-server [REQ-MCP_HTTPS_REMOTE_ACCESS]", () => {
  let close: (() => Promise<void>) | null = null;
  const bearer = "test-bearer-mhr";
  let baseUrl = "";

  after(async () => {
    if (close) await close();
  });

  it("rejects unauthenticated POST with 401 when bearer configured", async () => {
    bindWritableProjectCorpus(tiedProject);
    process.env.TIED_MCP_TOOL_PROFILE = "core";
    const { server } = createTiedYamlMcpServer("core", {
      transport: "streamable_http",
      httpListen: { host: "127.0.0.1", port: 0, bearer_configured: true },
    });
    const handle = await startMcpHttpServer(server, {
      host: "127.0.0.1",
      port: 0,
      bearerToken: bearer,
      mountPath: "/mcp",
    });
    close = handle.close;
    baseUrl = `http://127.0.0.1:${handle.port}/mcp`;
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "test", version: "1" },
        },
      }),
    });
    assert.equal(res.status, 401);
  });

  it("tools/list count matches core profile over HTTP", async () => {
    bindWritableProjectCorpus(tiedProject);
    const transport = new StreamableHTTPClientTransport(new URL(baseUrl), {
      requestInit: {
        headers: { Authorization: `Bearer ${bearer}` },
      },
    });
    const client = new Client({ name: "mhr-test", version: "1.0.0" });
    await client.connect(transport);
    const listed = await client.listTools();
    const expected = selectToolsForProfile(allTools, "core").length;
    assert.equal(listed.tools.length, expected);
    await client.close();
  });
});
