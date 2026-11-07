/**
 * [REQ-MCP_SERVER_INFO] [IMPL-MCP_SERVER_INFO] [ARCH-MCP_SERVER_INFO]
 * Pure server_info snapshot builder (MCP-agnostic).
 */

import crypto from "node:crypto";
import { isMetricsEnabled } from "../usage-metrics.js";
import { resolveTiedConfigReport } from "../tied-config-report.js";
import { getBasePath, getClientProjectRoot } from "../yaml-loader.js";
import { resolveProjectIdentity, anonymizedProjectId } from "../project-identity.js";
import {
  API_SCHEMA_VERSION,
  PROCESS_STARTED_AT,
  RESPONSE_SCHEMA_VERSION,
  SUPPORTED_MCP_PROTOCOL_VERSIONS,
  SUPPORTED_OPERATIONS,
  TOOL_CONTRACT_VERSION,
} from "./constants.js";
import { resolveTiedMethodologyVersion } from "../tied-methodology-version.js";
import { mapConfigurationSummary } from "./configuration.js";
import { assembleHealthChecks, deriveHealthState } from "./health.js";
import type { FeatureState, ServerInfoBuildOptions, ServerInfoSnapshot } from "./types.js";

function pickMcpProtocolVersion(negotiated?: string | null): string {
  const supported = [...SUPPORTED_MCP_PROTOCOL_VERSIONS];
  if (negotiated && supported.includes(negotiated as (typeof supported)[number])) {
    return negotiated;
  }
  return supported[supported.length - 1]!;
}

function resolveBuildMetadata(processEnv: NodeJS.ProcessEnv): {
  build_commit: string | null;
  build_time: string | null;
} {
  const commit = processEnv.TIED_MCP_BUILD_COMMIT?.trim();
  const time = processEnv.TIED_MCP_BUILD_TIME?.trim();
  return {
    build_commit: commit ? commit : null,
    build_time: time ? time : null,
  };
}

function buildInstanceId(processEnv: NodeJS.ProcessEnv): string {
  let projectSlice = "no-corpus";
  try {
    const base = getBasePath();
    const identity = resolveProjectIdentity(base, processEnv);
    projectSlice = anonymizedProjectId(identity.project_id);
  } catch {
    /* corpus unresolved */
  }
  const raw = `${process.pid}:${PROCESS_STARTED_AT.toISOString()}:${projectSlice}`;
  return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 12);
}

function buildTiedMethodologyExtension(projectRoot: string): Record<string, Record<string, unknown>> {
  try {
    const tiedBase = getBasePath();
    const resolved = resolveTiedMethodologyVersion({
      project_root: projectRoot,
      tied_base_path: tiedBase,
    });
    if (resolved.version) {
      return {
        "tied.methodology": {
          version: resolved.version,
          source: resolved.source,
          resolution_error: null,
        },
      };
    }
    return {
      "tied.methodology": {
        version: null,
        source: null,
        resolution_error: resolved.resolution_error,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      "tied.methodology": {
        version: null,
        source: null,
        resolution_error: message,
      },
    };
  }
}

function buildFeatures(options: ServerInfoBuildOptions): Record<string, FeatureState> {
  const features: Record<string, FeatureState> = {};
  const yamlCapable = options.toolProfile !== "optin";
  features.yaml_io = yamlCapable ? "enabled" : "unavailable";
  features.consistency_validation = options.activeToolCount > 0 && yamlCapable ? "enabled" : "unknown";
  features.usage_metrics = isMetricsEnabled() ? "enabled" : "disabled";
  features.mcp_resources = options.resourcesRegistered ? "enabled" : "disabled";
  features.optin_tool_surface = options.toolProfile === "full" ? "enabled" : "disabled";
  return features;
}

/**
 * PRE: options.implementation populated. POST: server_info v1 snapshot at generated_at.
 */
export async function buildServerInfoSnapshot(
  options: ServerInfoBuildOptions,
): Promise<ServerInfoSnapshot> {
  const processEnv = options.processEnv ?? process.env;
  const now = new Date();
  const generatedAt = now.toISOString();
  const projectRoot = getClientProjectRoot();
  const buildMeta = resolveBuildMetadata(processEnv);

  const configResult = await resolveTiedConfigReport(projectRoot, processEnv);
  const configuration = mapConfigurationSummary(
    configResult.status === "ok" ? configResult.report : null,
  );

  const checks = await assembleHealthChecks({ projectRoot, processEnv });
  const healthState = deriveHealthState(checks);

  const uptimeSeconds = Math.max(
    0,
    Math.floor((now.getTime() - PROCESS_STARTED_AT.getTime()) / 1000),
  );

  return {
    schema_version: RESPONSE_SCHEMA_VERSION,
    generated_at: generatedAt,
    server: {
      name: options.implementation.name,
      version: options.implementation.version,
      build_commit: buildMeta.build_commit,
      build_time: buildMeta.build_time,
    },
    compatibility: {
      mcp_protocol_version: pickMcpProtocolVersion(options.negotiatedProtocolVersion),
      supported_mcp_protocol_versions: [...SUPPORTED_MCP_PROTOCOL_VERSIONS],
      tool_contract_version: TOOL_CONTRACT_VERSION,
      api_schema_version: API_SCHEMA_VERSION,
      intent_schema_version: null,
      database_schema_version: null,
      minimum_client_version: null,
      supported_operations: [...SUPPORTED_OPERATIONS],
    },
    configuration,
    runtime: {
      instance_id: buildInstanceId(processEnv),
      platform: process.platform,
      architecture: process.arch,
      started_at: PROCESS_STARTED_AT.toISOString(),
      uptime_seconds: uptimeSeconds,
    },
    health: {
      state: healthState,
      checks,
    },
    features: buildFeatures(options),
    extensions: buildTiedMethodologyExtension(projectRoot),
  };
}
