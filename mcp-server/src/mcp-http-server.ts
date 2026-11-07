/**
 * [REQ-MCP_HTTPS_REMOTE_ACCESS] [IMPL-MCP_HTTP_SERVER] Streamable HTTP listener with bearer gate.
 */

import { randomUUID } from "node:crypto";
import type { Server as HttpServer } from "node:http";
import { createServer } from "node:http";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createBearerGateMiddleware } from "./mcp-http-auth.js";

export type McpHttpServerOptions = {
  host: string;
  port: number;
  bearerToken: string | null;
  allowedHosts?: string[];
  mountPath?: string;
};

export type McpHttpServerHandle = {
  httpServer: HttpServer;
  port: number;
  close: () => Promise<void>;
};

function parseAllowedHosts(env: NodeJS.ProcessEnv): string[] | undefined {
  const raw = env.TIED_MCP_HTTP_ALLOWED_HOSTS?.trim();
  if (!raw) return undefined;
  const hosts = raw
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  return hosts.length > 0 ? hosts : undefined;
}

export function resolveMcpHttpListenOptions(
  env: NodeJS.ProcessEnv = process.env,
): McpHttpServerOptions {
  const profile = (env.TIED_MCP_TOOL_PROFILE ?? "core").trim().toLowerCase();
  const defaultPort = profile === "optin" ? 8788 : 8787;
  const port = Number.parseInt(env.TIED_MCP_HTTP_PORT ?? String(defaultPort), 10);
  const host = env.TIED_MCP_HTTP_HOST?.trim() || "127.0.0.1";
  const bearerToken = env.TIED_MCP_HTTP_BEARER_TOKEN?.trim() || null;
  return {
    host,
    port: Number.isFinite(port) ? port : defaultPort,
    bearerToken,
    allowedHosts: parseAllowedHosts(env),
    mountPath: "/mcp",
  };
}

export async function startMcpHttpServer(
  mcpServer: McpServer,
  options: McpHttpServerOptions,
): Promise<McpHttpServerHandle> {
  const mountPath = options.mountPath ?? "/mcp";
  const app = createMcpExpressApp({
    host: options.host,
    allowedHosts: options.allowedHosts,
  });

  if (options.bearerToken) {
    app.use(mountPath, createBearerGateMiddleware(options.bearerToken));
  }

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });

  await mcpServer.connect(transport);

  const handler = async (
    req: import("express").Request,
    res: import("express").Response,
  ): Promise<void> => {
    try {
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error("DIAGNOSTIC: TIED_MCP_HTTP_REQUEST_ERROR", err);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  };

  app.get(mountPath, handler);
  app.post(mountPath, handler);
  app.delete(mountPath, handler);

  const httpServer = createServer(app);
  await new Promise<void>((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(options.port, options.host, () => resolve());
  });

  const address = httpServer.address();
  const boundPort =
    typeof address === "object" && address !== null ? address.port : options.port;

  console.error(
    `TIED YAML MCP Server running on streamable HTTP http://${options.host}:${boundPort}${mountPath}`,
  );

  return {
    httpServer,
    port: boundPort,
    close: async () => {
      await transport.close();
      await mcpServer.close();
      await new Promise<void>((resolve, reject) => {
        httpServer.close((err) => (err ? reject(err) : resolve()));
      });
    },
  };
}
