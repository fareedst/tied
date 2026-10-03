/**
 * [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
 * How: INSTALL_MCP_LAYER — harness MCP JSON with optional bundle env for linked mode.
 */
import path from "node:path";
import {
  assertMcpPrerequisite,
  initializeTiedMcpConfig,
  initializeClaudeMcpConfig,
  refreshTiedMcpJson,
  resolveBootstrapMetricsClient,
} from "../mcp-config.mjs";
import { jsonSafeAbsolute } from "../paths.mjs";
import { sayOk } from "../console.mjs";
import fs from "node:fs";
import { resolveMethodologyBundlePath } from "./store.mjs";
import { resolveTiedLayout } from "../layout.mjs";

/**
 * @param {object} refreshArgs
 * @param {Record<string, string>|undefined} extraEnv
 */
function refreshWithExtraEnv(refreshArgs, extraEnv) {
  if (!extraEnv || Object.keys(extraEnv).length === 0) {
    refreshTiedMcpJson(refreshArgs);
    return;
  }
  const {
    mcpJsonPath,
    tiedMcpIndexJs,
    tiedBasePath,
    collectMetrics,
    metricsClient,
    projectBasename,
    harnessLabel,
  } = refreshArgs;
  const env = { TIED_BASE_PATH: jsonSafeAbsolute(tiedBasePath), ...extraEnv };
  if (harnessLabel) env.TIED_MCP_HARNESS = harnessLabel;
  if (collectMetrics) {
    env.TIED_MCP_COLLECT_METRICS = "1";
    env.TIED_MCP_METRICS_CLIENT = metricsClient || projectBasename;
  }
  const entry = {
    type: "stdio",
    disabled: false,
    command: "node",
    args: [jsonSafeAbsolute(tiedMcpIndexJs)],
    env,
  };
  let cfg;
  if (fs.existsSync(mcpJsonPath)) {
    const raw = fs.readFileSync(mcpJsonPath, "utf8");
    cfg = JSON.parse(raw);
    if (typeof cfg !== "object" || cfg === null) cfg = {};
    if (typeof cfg.mcpServers !== "object" || cfg.mcpServers === null) cfg.mcpServers = {};
    cfg.mcpServers["tied-yaml"] = entry;
  } else {
    cfg = { mcpServers: { "tied-yaml": entry } };
  }
  fs.mkdirSync(path.dirname(mcpJsonPath), { recursive: true });
  fs.writeFileSync(mcpJsonPath, `${JSON.stringify(cfg, null, 2)}\n`, "utf8");
}

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
      TIED_METHODOLOGY_BUNDLE_PATH: jsonSafeAbsolute(bundlePath),
      TIED_STORE_ROOT: jsonSafeAbsolute(options.storeRoot),
    };
  }

  const harness = options.harness ?? "both";
  if (harness === "cursor" || harness === "both") {
    const mcpJson = path.join(projectRoot, ".cursor", "mcp.json");
    const cursorMcpExisted = fs.existsSync(mcpJson);
    if (!cursorMcpExisted) {
      initializeTiedMcpConfig(projectRoot, options.storeRoot, env);
    }
    let refreshCursor = !cursorMcpExisted;
    if (cursorMcpExisted) {
      try {
        const cfg = JSON.parse(fs.readFileSync(mcpJson, "utf8"));
        refreshCursor = Boolean(cfg?.mcpServers?.["tied-yaml"]);
      } catch {
        refreshCursor = false;
      }
    }
    if (refreshCursor) {
      refreshWithExtraEnv(
        {
          mcpJsonPath: mcpJson,
          tiedMcpIndexJs: mcpServerDist,
          tiedBasePath,
          collectMetrics,
          metricsClient,
          projectBasename,
        },
        extraEnv,
      );
      if (extraEnv) sayOk(`Refreshed ${mcpJson} with linked methodology bundle env.`);
    }
  }

  if (harness === "claude" || harness === "both") {
    const label = options.claudeHarnessLabel ?? "claude";
    const mcpJson = path.join(projectRoot, ".mcp.json");
    if (!fs.existsSync(mcpJson)) {
      initializeClaudeMcpConfig(projectRoot, options.storeRoot, { env, harnessLabel: label });
    }
    refreshWithExtraEnv(
      {
        mcpJsonPath: mcpJson,
        tiedMcpIndexJs: mcpServerDist,
        tiedBasePath,
        collectMetrics,
        metricsClient,
        projectBasename,
        harnessLabel: label,
      },
      extraEnv,
    );
    if (extraEnv) sayOk(`Refreshed ${mcpJson} with linked methodology bundle env.`);
  }

  return { extraEnv };
}
