/**
 * [REQ-MCP_SERVER_INFO] [IMPL-MCP_SERVER_INFO] Type mirror of server_info response v1.
 */

import type { ToolProfile } from "../tool-profiles.js";

export type HealthCheckStatus =
  | "ok"
  | "degraded"
  | "failed"
  | "unknown"
  | "not_applicable";

export type HealthState = "ready" | "degraded" | "unavailable" | "unknown";

export type FeatureState = "enabled" | "disabled" | "unavailable" | "unknown";

export type HealthCheck = {
  id: string;
  status: HealthCheckStatus;
  required: boolean;
  code?: string | null;
  message?: string | null;
  observed_at?: string | null;
};

export type ServerInfoSnapshot = {
  schema_version: string;
  generated_at: string;
  server: {
    name: string;
    version: string;
    build_commit: string | null;
    build_time: string | null;
  };
  compatibility: {
    mcp_protocol_version: string;
    supported_mcp_protocol_versions: string[];
    tool_contract_version: string;
    api_schema_version: string | null;
    intent_schema_version: string | null;
    database_schema_version: string | null;
    minimum_client_version: string | null;
    supported_operations: string[];
  };
  configuration: {
    schema_version: string | null;
    revision: string | null;
    environment: string | null;
    operating_mode: string | null;
    storage_backend: string | null;
  };
  runtime: {
    instance_id: string | null;
    platform: string | null;
    architecture: string | null;
    started_at: string | null;
    uptime_seconds: number | null;
  };
  health: {
    state: HealthState;
    checks: HealthCheck[];
  };
  features: Record<string, FeatureState>;
  extensions: Record<string, Record<string, unknown>>;
};

export type McpTransportKind = "stdio" | "streamable_http";

export type HttpListenSummary = {
  host: string;
  port: number;
  bearer_configured: boolean;
};

export type ServerInfoBuildOptions = {
  implementation: { name: string; version: string };
  toolProfile: ToolProfile;
  activeToolCount: number;
  resourcesRegistered: boolean;
  transport?: McpTransportKind;
  httpListen?: HttpListenSummary | null;
  negotiatedProtocolVersion?: string | null;
  processEnv?: NodeJS.ProcessEnv;
};
