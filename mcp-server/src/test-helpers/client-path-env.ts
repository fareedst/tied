/**
 * Isolate TIED client path env for unit tests run inside a marker_only repo cwd.
 * [REQ-TIED_PROJECT_IDENTITY_MARKER_ROUTING] [REQ-TIED_CLIENT_PATH_ENV_MIGRATION]
 * [REQ-TIED_CLI_MCP_JSON_BASE_PATH] [REQ-TIED_MCP_TEST_MCP_JSON_ISOLATION]
 * Tests apply paths only via install-shaped mcp.json fixtures — never on the live store checkout.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  ENV_CLIENT_BUNDLE_PATH,
  ENV_CLIENT_PROJECT_PATH,
  LEGACY_ENV_CLIENT_BUNDLE_PATH,
  LEGACY_ENV_CLIENT_PROJECT_PATH,
} from "../tied-path-env.js";

export const CLIENT_PATH_ENV_KEYS = [
  ENV_CLIENT_PROJECT_PATH,
  ENV_CLIENT_BUNDLE_PATH,
  LEGACY_ENV_CLIENT_PROJECT_PATH,
  LEGACY_ENV_CLIENT_BUNDLE_PATH,
  "TIED_PATH_AUTHORITY",
] as const;

export function snapshotClientPathEnv(): Record<string, string | undefined> {
  const saved: Record<string, string | undefined> = {};
  for (const k of CLIENT_PATH_ENV_KEYS) saved[k] = process.env[k];
  return saved;
}

export function restoreClientPathEnv(saved: Record<string, string | undefined>): void {
  for (const k of CLIENT_PATH_ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
}

const MCP_JSON_WRITE_ALLOW_ENV = "TIED_MCP_TEST_ALLOW_MCP_JSON_WRITE";

/**
 * Fail closed before writing test mcp.json onto a developer store tree.
 * [IMPL-TIED_MCP_TEST_MCP_JSON_ISOLATION]
 */
export function assertSafeMcpJsonWriteTarget(projectRoot: string): void {
  if (process.env[MCP_JSON_WRITE_ALLOW_ENV] === "1") {
    return;
  }
  const resolved = path.resolve(projectRoot);
  const tmpRoot = path.resolve(os.tmpdir());
  if (resolved === tmpRoot || resolved.startsWith(`${tmpRoot}${path.sep}`)) {
    return;
  }
  const storeMarker = path.join(resolved, ".tied", "store.yaml");
  if (fs.existsSync(storeMarker)) {
    throw new Error(
      `TEST_FIXTURE: refusing to write .cursor/mcp.json on store checkout ${resolved}; use mkdtemp tied-project or set ${MCP_JSON_WRITE_ALLOW_ENV}=1`,
    );
  }
}

/** Minimal index so env TIED_BASE_PATH wins over marker_only cwd discovery. */
export function writeMinimalProjectCorpus(tiedDir: string): void {
  fs.mkdirSync(tiedDir, { recursive: true });
  const req = path.join(tiedDir, "requirements.yaml");
  if (!fs.existsSync(req)) fs.writeFileSync(req, "{}\n", "utf8");
}

/**
 * Write tied-install-shaped .cursor/mcp.json under projectRoot (Cursor harness file).
 */
export function writeInstallMcpJson(projectRoot: string, tiedDir: string, bundleDir?: string): void {
  assertSafeMcpJsonWriteTarget(projectRoot);
  const absTied = path.resolve(tiedDir);
  const env: Record<string, string> = { [ENV_CLIENT_PROJECT_PATH]: absTied };
  if (bundleDir) {
    env[ENV_CLIENT_BUNDLE_PATH] = path.resolve(bundleDir);
  }
  const mcpDir = path.join(projectRoot, ".cursor");
  fs.mkdirSync(mcpDir, { recursive: true });
  fs.writeFileSync(
    path.join(mcpDir, "mcp.json"),
    `${JSON.stringify({ mcpServers: { "tied-yaml": { env } } }, null, 2)}\n`,
    "utf8",
  );
}

/** Apply corpus path env from install mcp.json (mirrors IDE injection, not shell override). */
export function applyInstallPathEnvFromMcpJson(projectRoot: string): void {
  const mcpPath = path.join(projectRoot, ".cursor", "mcp.json");
  if (!fs.existsSync(mcpPath)) {
    throw new Error(`TEST_FIXTURE: missing ${mcpPath}`);
  }
  const cfg = JSON.parse(fs.readFileSync(mcpPath, "utf8")) as {
    mcpServers?: { "tied-yaml"?: { env?: Record<string, string> } };
  };
  const env = cfg.mcpServers?.["tied-yaml"]?.env;
  if (!env || typeof env !== "object") {
    throw new Error(`TEST_FIXTURE: tied-yaml env missing in ${mcpPath}`);
  }
  for (const k of CLIENT_PATH_ENV_KEYS) {
    delete process.env[k];
  }
  delete process.env.TIED_BASE_PATH;
  delete process.env.TIED_METHODOLOGY_BUNDLE_PATH;
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === "string" && value.trim()) {
      process.env[key] = value.trim();
    }
  }
  const projectPath = process.env[ENV_CLIENT_PROJECT_PATH] ?? process.env[LEGACY_ENV_CLIENT_PROJECT_PATH];
  if (projectPath) {
    process.env.TIED_BASE_PATH = projectPath;
  }
}

/** Legacy TIED_BASE_PATH only — clears IDE-injected canonical path overrides. */
export function useLegacyProjectPathOnly(tiedDir: string): void {
  const projectRoot = path.dirname(path.resolve(tiedDir));
  writeInstallMcpJson(projectRoot, tiedDir);
  applyInstallPathEnvFromMcpJson(projectRoot);
}

/** Point writable corpus at tiedDir with mcp.json fixture + env applied from that file. */
export function bindWritableProjectCorpus(tiedDir: string): void {
  writeMinimalProjectCorpus(tiedDir);
  const resolved = path.resolve(tiedDir);
  const projectRoot =
    path.basename(resolved) === "tied-project" ? path.dirname(resolved) : resolved;
  writeInstallMcpJson(projectRoot, resolved);
  applyInstallPathEnvFromMcpJson(projectRoot);
}
