#!/usr/bin/env node
/**
 * TIED YAML Index MCP Server — stdio transport (default IDE spawn).
 */

import "./mcp-stdio-console-guard-side-effect.js";

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createTiedYamlMcpServer, resolveTiedMcpProfile } from "./tied-mcp-server-factory.js";

async function main(): Promise<void> {
  const profile = resolveTiedMcpProfile();
  const { server } = createTiedYamlMcpServer(profile, { transport: "stdio" });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TIED YAML MCP Server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
