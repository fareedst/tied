#!/usr/bin/env node
/**
 * TIED YAML Index MCP Server
 * Exposes tools and resources for requirements, architecture, and implementation decision YAML indexes.
 */

import "./mcp-stdio-console-guard-side-effect.js";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { allTools } from "./tools/index.js";
import { registerResources } from "./resources.js";
import { instrumentToolHandlers } from "./usage-metrics.js";
import {
  InvalidToolProfileError,
  resolveToolProfile,
  selectToolsForProfile,
  shouldRegisterResources,
} from "./tool-profiles.js";

let profile: ReturnType<typeof resolveToolProfile>;
try {
  profile = resolveToolProfile();
} catch (err) {
  if (err instanceof InvalidToolProfileError) {
    console.error(err.message);
    process.exit(1);
  }
  throw err;
}

type RegisteredTool = (typeof allTools)[number];
const activeTools: RegisteredTool[] = selectToolsForProfile(allTools, profile);

if (process.env.TIED_MCP_DIAGNOSTICS?.trim()) {
  console.error(`DIAGNOSTIC: TIED_MCP_TOOL_PROFILE=${profile} tools=${activeTools.length}`);
}

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
  },
);

const registeredHandlers = instrumentToolHandlers(
  activeTools as Array<{ name: string; handler: import("./usage-metrics.js").ToolHandler }>,
);
for (const tool of activeTools) {
  const handler = registeredHandlers.get(tool.name);
  if (!handler) throw new Error(`Missing registered handler for ${tool.name}`);
  server.registerTool(
    tool.name,
    tool.config,
    handler as (args: unknown) => Promise<{ content: Array<{ type: "text"; text: string }> }>,
  );
}

if (shouldRegisterResources(profile)) {
  registerResources(server);
}

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TIED YAML MCP Server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
