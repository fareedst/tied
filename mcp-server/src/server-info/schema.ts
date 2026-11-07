/**
 * [REQ-MCP_SERVER_INFO] [IMPL-MCP_SERVER_INFO] Load output JSON Schema from contracts/.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

/** Resolved path works from src/ or dist/server-info/. */
export function resolveServerInfoOutputSchemaPath(): string {
  return path.resolve(moduleDir, "../../contracts/server_info/server_info.response.schema.json");
}

export function loadServerInfoOutputSchema(): Record<string, unknown> {
  const raw = fs.readFileSync(resolveServerInfoOutputSchemaPath(), "utf8");
  return JSON.parse(raw) as Record<string, unknown>;
}
