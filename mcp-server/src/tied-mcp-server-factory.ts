/**
 * [REQ-MCP_HTTPS_REMOTE_ACCESS] [IMPL-MCP_HTTP_SERVER] [ARCH-MCP_HTTPS_REMOTE_TRANSPORT]
 * Shared MCP server assembly for stdio and Streamable HTTP transports.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { allTools } from "./tools/index.js";
import { registerResources } from "./resources.js";
import { instrumentToolHandlers } from "./usage-metrics.js";
import {
  InvalidToolProfileError,
  resolveToolProfile,
  selectToolsForProfile,
  shouldRegisterResources,
  type ToolProfile,
} from "./tool-profiles.js";
import { setServerInfoRuntimeContext } from "./server-info/runtime-context.js";
import type { ServerInfoBuildOptions } from "./server-info/types.js";

const SERVER_IMPLEMENTATION = { name: "tied-yaml", version: "1.0.0" } as const;

export type TiedMcpAssembly = {
  server: McpServer;
  profile: ToolProfile;
  activeToolCount: number;
  resourcesRegistered: boolean;
};

export function resolveTiedMcpProfile(env: NodeJS.ProcessEnv = process.env): ToolProfile {
  try {
    return resolveToolProfile(env);
  } catch (err) {
    if (err instanceof InvalidToolProfileError) {
      console.error(err.message);
      process.exit(1);
    }
    throw err;
  }
}

export function createTiedYamlMcpServer(
  profile: ToolProfile,
  serverInfoExtras?: Partial<Pick<ServerInfoBuildOptions, "transport" | "httpListen">>,
): TiedMcpAssembly {
  type RegisteredTool = (typeof allTools)[number];
  const activeTools: RegisteredTool[] = selectToolsForProfile(allTools, profile);
  const resourcesRegistered = shouldRegisterResources(profile);

  setServerInfoRuntimeContext({
    implementation: { ...SERVER_IMPLEMENTATION },
    toolProfile: profile,
    activeToolCount: activeTools.length,
    resourcesRegistered,
    transport: serverInfoExtras?.transport ?? "stdio",
    httpListen: serverInfoExtras?.httpListen ?? null,
  });

  if (process.env.TIED_MCP_DIAGNOSTICS?.trim()) {
    console.error(`DIAGNOSTIC: TIED_MCP_TOOL_PROFILE=${profile} tools=${activeTools.length}`);
  }

  const server = new McpServer(SERVER_IMPLEMENTATION, {
    capabilities: {
      tools: {},
      resources: {},
    },
  });

  const registeredHandlers = instrumentToolHandlers(
    activeTools as Array<{ name: string; handler: import("./usage-metrics.js").ToolHandler }>,
  );
  for (const tool of activeTools) {
    const handler = registeredHandlers.get(tool.name);
    if (!handler) throw new Error(`Missing registered handler for ${tool.name}`);
    server.registerTool(
      tool.name,
      tool.config,
      handler as (args: unknown) => Promise<import("./types.js").McpToolResult>,
    );
  }

  if (resourcesRegistered) {
    registerResources(server);
  }

  return {
    server,
    profile,
    activeToolCount: activeTools.length,
    resourcesRegistered,
  };
}
