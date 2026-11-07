/**
 * [REQ-MCP_HTTPS_REMOTE_ACCESS] [IMPL-MCP_HTTP_SERVER] Bearer gate for Streamable HTTP.
 */

import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";

export function parseBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }
  const token = authorizationHeader.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

export function bearerTokensMatch(expected: string, provided: string): boolean {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(provided, "utf8");
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

export function createBearerGateMiddleware(expectedToken: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const provided = parseBearerToken(req.headers.authorization);
    if (!provided || !bearerTokensMatch(expectedToken, provided)) {
      res.status(401).json({
        error: "unauthorized",
        message: "Missing or invalid Authorization Bearer token",
      });
      return;
    }
    next();
  };
}

/**
 * Loopback-only HTTP may omit bearer; any other bind requires a non-empty token.
 */
export function resolveHttpBearerRequirement(
  host: string,
  env: NodeJS.ProcessEnv = process.env,
): { required: boolean; token: string | null } {
  const token = env.TIED_MCP_HTTP_BEARER_TOKEN?.trim() || null;
  const normalized = host.trim().toLowerCase();
  const loopback =
    normalized === "127.0.0.1" ||
    normalized === "localhost" ||
    normalized === "::1" ||
    normalized === "[::1]";
  if (!loopback && !token) {
    return { required: true, token: null };
  }
  return { required: !loopback, token };
}

export function assertHttpBindAllowed(host: string, env: NodeJS.ProcessEnv = process.env): string | null {
  const { required, token } = resolveHttpBearerRequirement(host, env);
  if (required && !token) {
    console.error(
      "DIAGNOSTIC: TIED_MCP_HTTP_BIND_REJECTED Non-loopback bind requires TIED_MCP_HTTP_BEARER_TOKEN.",
    );
    process.exit(1);
  }
  return token;
}
