/**
 * [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP] [IMPL-MCP_USAGE_METRICS]
 * How: INITIALIZE_TIED_MCP_CONFIG — create .cursor/mcp.json only when absent.
 */
import fs from "node:fs";
import path from "node:path";
import { jsonSafeAbsolute } from "./paths.mjs";
import { sayOk } from "./console.mjs";

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
  const unixSecondsDir = /^\d{10}$/.test(basename);
  if (underDevTest || unixSecondsDir) {
    return basename;
  }
  const override = env.TIED_MCP_METRICS_CLIENT?.trim();
  if (override) {
    return override;
  }
  return basename;
}

export function refreshTiedMcpJson({
  mcpJsonPath,
  tiedMcpIndexJs,
  tiedBasePath,
  collectMetrics,
  metricsClient,
  projectBasename,
  harnessLabel,
}) {
  const env = { TIED_BASE_PATH: jsonSafeAbsolute(tiedBasePath) };
  if (harnessLabel) {
    env.TIED_MCP_HARNESS = harnessLabel;
  }
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
    try {
      cfg = JSON.parse(raw);
    } catch (e) {
      throw new Error(`Invalid JSON in ${mcpJsonPath}: ${e.message}`);
    }
    if (typeof cfg !== "object" || cfg === null) cfg = {};
    if (typeof cfg.mcpServers !== "object" || cfg.mcpServers === null) cfg.mcpServers = {};
    cfg.mcpServers["tied-yaml"] = entry;
  } else {
    cfg = { mcpServers: { "tied-yaml": entry } };
  }
  fs.mkdirSync(path.dirname(mcpJsonPath), { recursive: true });
  fs.writeFileSync(mcpJsonPath, `${JSON.stringify(cfg, null, 2)}\n`, "utf8");
}

export function initializeTiedMcpConfig(projectRoot, tiedRepoRoot, env = process.env) {
  const mcpJson = path.join(projectRoot, ".cursor", "mcp.json");
  if (fs.existsSync(mcpJson)) {
    return { initialized: false };
  }
  const mcpServerDist = path.join(tiedRepoRoot, "mcp-server", "dist", "index.js");
  if (!fs.existsSync(mcpServerDist)) {
    throw new Error(
      `Missing built MCP server: ${mcpServerDist}\nBuild it: cd ${path.join(tiedRepoRoot, "mcp-server")} && npm install && npm run build`
    );
  }
  const collectMetrics = env.TIED_MCP_COLLECT_METRICS === "1";
  const projectBasename = path.basename(projectRoot);
  refreshTiedMcpJson({
    mcpJsonPath: mcpJson,
    tiedMcpIndexJs: mcpServerDist,
    tiedBasePath: path.join(projectRoot, "tied"),
    collectMetrics,
    metricsClient: resolveBootstrapMetricsClient(projectRoot, env),
    projectBasename,
  });
  sayOk(`Initialized ${mcpJson} mcpServers.tied-yaml (TIED_MCP dist + project TIED_BASE_PATH).`);
  return { initialized: true };
}

/**
 * [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS] [REQ-MCP_USAGE_METRICS]
 * How: INITIALIZE_CLAUDE_MCP_CONFIG — repo-root .mcp.json create-if-absent or safe-merge tied-yaml only.
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
    tiedBasePath: path.join(projectRoot, "tied"),
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
    if (typeof cfg === "object" && cfg !== null && cfg.mcpServers?.["tied-yaml"]) {
      return { path: mcpJson, action: "noop", initialized: false };
    }
    refreshTiedMcpJson(refreshArgs);
    sayOk(`Merged ${mcpJson} mcpServers.tied-yaml (safe merge; foreign servers preserved).`);
    return { path: mcpJson, action: "merged", initialized: true };
  }

  refreshTiedMcpJson(refreshArgs);
  sayOk(`Initialized ${mcpJson} mcpServers.tied-yaml (TIED_MCP dist + TIED_MCP_HARNESS=${harnessLabel}).`);
  return { path: mcpJson, action: "created", initialized: true };
}

export function assertMcpPrerequisite(tiedRepoRoot) {
  const mcpServerDist = path.join(tiedRepoRoot, "mcp-server", "dist", "index.js");
  if (!fs.existsSync(mcpServerDist)) {
    throw new Error(
      `Missing built MCP server: ${mcpServerDist}\nBuild it: cd ${path.join(tiedRepoRoot, "mcp-server")} && npm install && npm run build`
    );
  }
}
