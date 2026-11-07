#!/usr/bin/env node
/**
 * [REQ-MCP_HTTPS_REMOTE_ACCESS] [IMPL-MCP_HTTP_SERVER] Streamable HTTP MCP entry (not stdio).
 */

import "./mcp-stdio-console-guard-side-effect.js";

import {
  createTiedYamlMcpServer,
  resolveTiedMcpProfile,
} from "./tied-mcp-server-factory.js";
import { assertHttpBindAllowed } from "./mcp-http-auth.js";
import {
  resolveMcpHttpListenOptions,
  startMcpHttpServer,
} from "./mcp-http-server.js";

async function main(): Promise<void> {
  const listen = resolveMcpHttpListenOptions();
  assertHttpBindAllowed(listen.host);
  const profile = resolveTiedMcpProfile();

  const bearerConfigured = Boolean(listen.bearerToken);
  const { server } = createTiedYamlMcpServer(profile, {
    transport: "streamable_http",
    httpListen: {
      host: listen.host,
      port: listen.port,
      bearer_configured: bearerConfigured,
    },
  });

  await startMcpHttpServer(server, listen);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
