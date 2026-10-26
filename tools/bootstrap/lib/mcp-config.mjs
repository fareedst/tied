/**
 * [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP] [IMPL-MCP_USAGE_METRICS]
 * How: INITIALIZE_TIED_MCP_CONFIG — create .cursor/mcp.json only when absent; refresh merges tied-yaml + tied-yaml-optin.
 */
import fs from "node:fs";
import path from "node:path";
import { jsonSafeAbsolute } from "./paths.mjs";
import { sayOk } from "./console.mjs";
import { resolveTiedLayout } from "./layout.mjs";

function projectTiedBasePath(projectRoot) {
  const tiedDir = resolveTiedLayout(projectRoot).tiedDir;
  fs.mkdirSync(tiedDir, { recursive: true });
  return tiedDir;
}

/**
 * [IMPL-TIED_FILES] [IMPL-MCP_USAGE_METRICS] [REQ-TIED_SETUP] [REQ-MCP_USAGE_METRICS]
 * Disposable clients under dev/test/{id} or unix-seconds dir names ignore inherited TIED_MCP_METRICS_CLIENT.
 * @param {string} projectRoot
 * @param {NodeJS.ProcessEnv} [env]
 */
export function resolveBootstrapMetricsClient(projectRoot, env = process.env) {
  const basename = path.basename(projectRoot);
  const normalized = path.normalize(projectRoot).split(path.sep).join("/");
  const underDevTest = normalized.includes(`/dev/test/${basename}`);
  const unixSecondsDir = /^\d{10}(-[a-zA-Z0-9]+)*$/.test(basename);
  if (underDevTest || unixSecondsDir) {
    return basename;
  }
  const override = env.TIED_MCP_METRICS_CLIENT?.trim();
  if (override) {
    return override;
  }
  return basename;
}

/**
 * @param {object} params
 * @param {string} params.tiedMcpIndexJs
 * @param {string} params.tiedBasePath
 * @param {boolean} [params.collectMetrics]
 * @param {string} [params.metricsClient]
 * @param {string} [params.projectBasename]
 * @param {string} [params.harnessLabel]
 * @param {"core"|"optin"} params.toolProfile
 * @param {Record<string, string>} [params.extraEnv]
 */
export function buildTiedMcpServerEntry({
  tiedMcpIndexJs,
  tiedBasePath,
  collectMetrics,
  metricsClient,
  projectBasename,
  harnessLabel,
  toolProfile,
  extraEnv,
}) {
  /** @type {Record<string, string>} */
  const env = {
    TIED_BASE_PATH: jsonSafeAbsolute(tiedBasePath),
    TIED_MCP_TOOL_PROFILE: toolProfile,
    ...(extraEnv ?? {}),
  };
  if (harnessLabel) {
    env.TIED_MCP_HARNESS = harnessLabel;
  }
  if (collectMetrics) {
    env.TIED_MCP_COLLECT_METRICS = "1";
    env.TIED_MCP_METRICS_CLIENT = metricsClient || projectBasename || "tied-client";
  }
  return {
    type: "stdio",
    disabled: false,
    command: "node",
    args: [jsonSafeAbsolute(tiedMcpIndexJs)],
    env,
  };
}

/**
 * @param {object} cfg
 * @returns {boolean}
 */
export function tiedMcpServersUpToDate(cfg) {
  const servers = cfg?.mcpServers;
  if (!servers?.["tied-yaml"] || !servers?.["tied-yaml-optin"]) {
    return false;
  }
  if (servers["tied-yaml"].env?.TIED_MCP_TOOL_PROFILE !== "core") {
    return false;
  }
  if (servers["tied-yaml-optin"].env?.TIED_MCP_TOOL_PROFILE !== "optin") {
    return false;
  }
  return true;
}

/**
 * Merge or create both tied-yaml (core) and tied-yaml-optin entries; preserve foreign mcpServers keys.
 * @param {object} params
 * @param {string} params.mcpJsonPath
 * @param {string} params.tiedMcpIndexJs
 * @param {string} params.tiedBasePath
 * @param {boolean} [params.collectMetrics]
 * @param {string} [params.metricsClient]
 * @param {string} [params.projectBasename]
 * @param {string} [params.harnessLabel]
 * @param {Record<string, string>} [params.extraEnv]
 */
export function refreshTiedMcpServersJson({
  mcpJsonPath,
  tiedMcpIndexJs,
  tiedBasePath,
  collectMetrics,
  metricsClient,
  projectBasename,
  harnessLabel,
  extraEnv,
}) {
  const baseMetrics = metricsClient || projectBasename;
  const coreEntry = buildTiedMcpServerEntry({
    tiedMcpIndexJs,
    tiedBasePath,
    collectMetrics,
    metricsClient: baseMetrics,
    projectBasename,
    harnessLabel,
    toolProfile: "core",
    extraEnv,
  });
  const optinMetrics =
    collectMetrics && baseMetrics ? `${baseMetrics}-optin` : baseMetrics;
  const optinEntry = buildTiedMcpServerEntry({
    tiedMcpIndexJs,
    tiedBasePath,
    collectMetrics,
    metricsClient: optinMetrics,
    projectBasename,
    harnessLabel,
    toolProfile: "optin",
    extraEnv,
  });

  let cfg;
  if (fs.existsSync(mcpJsonPath)) {
    const raw = fs.readFileSync(mcpJsonPath, "utf8");
    try {
      cfg = JSON.parse(raw);
    } catch (e) {
      throw new Error(`Invalid JSON in ${mcpJsonPath}: ${e.message}`);
    }
    if (typeof cfg !== "object" || cfg === null) cfg = {};
    if (typeof cfg.mcpServers !== "object" || cfg.mcpServers === null) cfg.mcpServers = {};
  } else {
    cfg = { mcpServers: {} };
  }
  cfg.mcpServers["tied-yaml"] = coreEntry;
  cfg.mcpServers["tied-yaml-optin"] = optinEntry;
  fs.mkdirSync(path.dirname(mcpJsonPath), { recursive: true });
  fs.writeFileSync(mcpJsonPath, `${JSON.stringify(cfg, null, 2)}\n`, "utf8");
}

/** @deprecated Use refreshTiedMcpServersJson — kept for callers that refresh a single path shape. */
export function refreshTiedMcpJson(refreshArgs) {
  refreshTiedMcpServersJson(refreshArgs);
}

export function initializeTiedMcpConfig(projectRoot, tiedRepoRoot, env = process.env) {
  const mcpJson = path.join(projectRoot, ".cursor", "mcp.json");
  if (fs.existsSync(mcpJson)) {
    return { initialized: false };
  }
  const mcpServerDist = path.join(tiedRepoRoot, "mcp-server", "dist", "index.js");
  if (!fs.existsSync(mcpServerDist)) {
    throw new Error(
      `Missing built MCP server: ${mcpServerDist}\nBuild it: cd ${path.join(tiedRepoRoot, "mcp-server")} && npm install && npm run build`,
    );
  }
  const collectMetrics = env.TIED_MCP_COLLECT_METRICS === "1";
  const projectBasename = path.basename(projectRoot);
  refreshTiedMcpServersJson({
    mcpJsonPath: mcpJson,
    tiedMcpIndexJs: mcpServerDist,
    tiedBasePath: projectTiedBasePath(projectRoot),
    collectMetrics,
    metricsClient: resolveBootstrapMetricsClient(projectRoot, env),
    projectBasename,
  });
  sayOk(
    `Initialized ${mcpJson} mcpServers.tied-yaml + tied-yaml-optin (TIED_MCP dist + project TIED_BASE_PATH).`,
  );
  return { initialized: true };
}

/**
 * [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS] [REQ-MCP_USAGE_METRICS]
 * How: INITIALIZE_CLAUDE_MCP_CONFIG — repo-root .mcp.json create-if-absent or safe-merge TIED servers.
 */
export function initializeClaudeMcpConfig(projectRoot, tiedRepoRoot, options = {}) {
  const env = options.env ?? process.env;
  const harnessLabel = options.harnessLabel ?? "claude";
  const mcpJson = path.join(projectRoot, ".mcp.json");
  assertMcpPrerequisite(tiedRepoRoot);
  const mcpServerDist = path.join(tiedRepoRoot, "mcp-server", "dist", "index.js");
  const projectBasename = path.basename(projectRoot);
  const refreshArgs = {
    mcpJsonPath: mcpJson,
    tiedMcpIndexJs: mcpServerDist,
    tiedBasePath: projectTiedBasePath(projectRoot),
    collectMetrics: env.TIED_MCP_COLLECT_METRICS === "1",
    metricsClient: resolveBootstrapMetricsClient(projectRoot, env),
    projectBasename,
    harnessLabel,
  };

  if (fs.existsSync(mcpJson)) {
    const raw = fs.readFileSync(mcpJson, "utf8");
    let cfg;
    try {
      cfg = JSON.parse(raw);
    } catch (e) {
      throw new Error(`Invalid JSON in ${mcpJson}: ${e.message}`);
    }
    if (typeof cfg === "object" && cfg !== null && tiedMcpServersUpToDate(cfg)) {
      return { path: mcpJson, action: "noop", initialized: false };
    }
    refreshTiedMcpServersJson(refreshArgs);
    sayOk(`Merged ${mcpJson} mcpServers tied-yaml + tied-yaml-optin (foreign servers preserved).`);
    return { path: mcpJson, action: "merged", initialized: true };
  }

  refreshTiedMcpServersJson(refreshArgs);
  sayOk(
    `Initialized ${mcpJson} mcpServers tied-yaml + tied-yaml-optin (TIED_MCP_HARNESS=${harnessLabel}).`,
  );
  return { path: mcpJson, action: "created", initialized: true };
}

export function assertMcpPrerequisite(tiedRepoRoot) {
  const mcpServerDist = path.join(tiedRepoRoot, "mcp-server", "dist", "index.js");
  if (!fs.existsSync(mcpServerDist)) {
    throw new Error(
      `Missing built MCP server: ${mcpServerDist}\nBuild it: cd ${path.join(tiedRepoRoot, "mcp-server")} && npm install && npm run build`,
    );
  }
}
