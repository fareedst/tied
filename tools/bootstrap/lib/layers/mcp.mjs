/**
 * [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
 * How: INSTALL_MCP_LAYER — harness MCP JSON with optional bundle env for linked mode.
 */
import path from "node:path";
import {
  assertMcpPrerequisite,
  initializeClaudeMcpConfig,
  refreshTiedMcpServersJson,
  resolveBootstrapMetricsClient,
} from "../mcp-config.mjs";
import { jsonSafeAbsolute } from "../paths.mjs";
import { sayOk } from "../console.mjs";
import fs from "node:fs";
import { resolveMethodologyBundlePath } from "./store.mjs";
import { resolveTiedLayout } from "../layout.mjs";
import { ENV_CLIENT_BUNDLE_PATH } from "../tied-path-env.mjs";

/**
 * @param {string} projectRoot
 * @param {{
 *   storeRoot: string;
 *   harness: "cursor"|"claude"|"both";
 *   mode: "linked"|"full";
 *   methodologyBundle: "live"|"pinned";
 *   env?: NodeJS.ProcessEnv;
 *   claudeHarnessLabel?: string;
 * }} options
 */
export function installMcpLayer(projectRoot, options) {
  const env = options.env ?? process.env;
  assertMcpPrerequisite(options.storeRoot);
  const mcpServerDist = path.join(options.storeRoot, "mcp-server", "dist", "index.js");
  const tiedBasePath = resolveTiedLayout(projectRoot).tiedDir;
  const collectMetrics = env.TIED_MCP_COLLECT_METRICS === "1";
  const projectBasename = path.basename(projectRoot);
  const metricsClient = resolveBootstrapMetricsClient(projectRoot, env);

  /** @type {Record<string, string>|undefined} */
  let extraEnv;
  if (options.mode === "linked") {
    const bundlePath = resolveMethodologyBundlePath(
      options.methodologyBundle,
      options.storeRoot,
      projectRoot,
    );
    extraEnv = {
      [ENV_CLIENT_BUNDLE_PATH]: jsonSafeAbsolute(bundlePath),
      TIED_STORE_ROOT: jsonSafeAbsolute(options.storeRoot),
    };
  }

  const refreshArgsBase = {
    tiedMcpIndexJs: mcpServerDist,
    tiedBasePath,
    collectMetrics,
    metricsClient,
    projectBasename,
    extraEnv,
  };

  const harness = options.harness ?? "both";
  if (harness === "cursor" || harness === "both") {
    const mcpJson = path.join(projectRoot, ".cursor", "mcp.json");
    const cursorMcpExisted = fs.existsSync(mcpJson);
    refreshTiedMcpServersJson({
      ...refreshArgsBase,
      mcpJsonPath: mcpJson,
    });
    if (!cursorMcpExisted) {
      sayOk(`Initialized ${mcpJson} mcpServers.tied-yaml + tied-yaml-optin.`);
    } else if (extraEnv) {
      sayOk(`Refreshed ${mcpJson} with linked methodology bundle env.`);
    }
  }

  if (harness === "claude" || harness === "both") {
    const label = options.claudeHarnessLabel ?? "claude";
    const mcpJson = path.join(projectRoot, ".mcp.json");
    if (!fs.existsSync(mcpJson)) {
      initializeClaudeMcpConfig(projectRoot, options.storeRoot, { env, harnessLabel: label });
    }
    refreshTiedMcpServersJson({
      ...refreshArgsBase,
      mcpJsonPath: mcpJson,
      harnessLabel: label,
    });
    if (extraEnv) sayOk(`Refreshed ${mcpJson} with linked methodology bundle env.`);
  }

  return { extraEnv };
}
