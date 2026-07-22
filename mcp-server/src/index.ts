#!/usr/bin/env node
/**
 * TIED YAML Index MCP Server
 * Exposes tools and resources for requirements, architecture, and implementation decision YAML indexes.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { allTools } from "./tools/index.js";
import { registerResources } from "./resources.js";
import { isMetricsEnabled, wrapToolHandler } from "./usage-metrics.js";

const server = new McpServer(
  {
    name: "tied-yaml",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

for (const tool of allTools) {
  const handler = isMetricsEnabled()
    ? wrapToolHandler(tool.name, tool.handler as import("./usage-metrics.js").ToolHandler)
    : tool.handler;
  server.registerTool(
    tool.name,
    tool.config,
    handler as (args: unknown) => Promise<{ content: Array<{ type: "text"; text: string }> }>
  );
}

registerResources(server);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TIED YAML MCP Server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
