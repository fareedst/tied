/**
 * [REQ-MCP_SERVER_INFO] [IMPL-MCP_SERVER_INFO] Redacted configuration summary from tied-config-report.
 */

import type { ServerInfoSnapshot } from "./types.js";

export type ConfigurationSummary = ServerInfoSnapshot["configuration"];

export function mapConfigurationSummary(
  report: Record<string, unknown> | null,
): ConfigurationSummary {
  const empty: ConfigurationSummary = {
    schema_version: null,
    revision: null,
    environment: null,
    operating_mode: null,
    storage_backend: "filesystem",
  };
  if (!report) {
    return { ...empty, storage_backend: "filesystem" };
  }
  const schema = typeof report.schema === "string" ? report.schema : null;
  const generatedAt =
    typeof report.generated_at === "string" ? report.generated_at : null;
  const layout =
    typeof report.layout_mode === "string" ? report.layout_mode : null;
  return {
    schema_version: schema,
    revision: generatedAt,
    environment: layout,
    operating_mode: "normal",
    storage_backend: "filesystem",
  };
}
