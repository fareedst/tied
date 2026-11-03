/**
 * [REQ-TIED_RUNTIME_DISK_CONFIG] [IMPL-TIED_RUNTIME_DISK_CONFIG]
 * Shared fixture catalog for bootstrap + agentstream resolver tests (SC-RDC-FIXTURE-PARITY).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { jsonSafeAbsolute } from "./paths.mjs";
import { ENV_CLIENT_BUNDLE_PATH, ENV_CLIENT_PROJECT_PATH } from "./tied-path-env.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @returns {string} */
export function resolveTiedRuntimeFixtureCatalogRoot() {
  return path.resolve(__dirname, "../fixtures/tied-runtime");
}

/** @returns {string} */
export function resolveStoreRepoRootFromLoader() {
  return path.resolve(__dirname, "../../..");
}

/**
 * @typedef {object} TiedRuntimeFixtureManifestCase
 * @property {string} id
 * @property {string[]} runtimes
 * @property {"monolithic" | "linked"} layout
 * @property {boolean} [mcpStoreRootEnv]
 * @property {boolean} [includeBundle]
 * @property {Record<string, string>} [shellEnv]
 */

/**
 * @returns {{ schema_version: string; cases: TiedRuntimeFixtureManifestCase[] }}
 */
export function loadTiedRuntimeFixtureManifest() {
  const manifestPath = path.join(resolveTiedRuntimeFixtureCatalogRoot(), "manifest.json");
  const raw = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (raw.schema_version !== "tied-runtime-fixture-manifest.v1") {
    throw new Error(`unsupported fixture manifest schema: ${raw.schema_version}`);
  }
  return raw;
}

/**
 * @param {string} caseId
 * @returns {TiedRuntimeFixtureManifestCase}
 */
export function getTiedRuntimeFixtureCase(caseId) {
  const manifest = loadTiedRuntimeFixtureManifest();
  const found = manifest.cases.find((c) => c.id === caseId);
  if (!found) {
    throw new Error(`unknown tied-runtime fixture case: ${caseId}`);
  }
  return found;
}

/**
 * @param {string} tiedDir
 */
function seedTiedProject(tiedDir) {
  fs.mkdirSync(tiedDir, { recursive: true });
  fs.writeFileSync(path.join(tiedDir, "requirements.yaml"), "requirements: {}\n");
}

/**
 * @param {string} storeRoot
 * @returns {string}
 */
function writeFakeMcpDist(storeRoot) {
  const indexJs = path.join(storeRoot, "mcp-server", "dist", "index.js");
  fs.mkdirSync(path.dirname(indexJs), { recursive: true });
  fs.writeFileSync(indexJs, "// fixture\n");
  return indexJs;
}

/**
 * @param {Record<string, string>} shellEnv
 * @param {{ wrongMcpBin: string; wrongStore: string }} tokens
 * @returns {Record<string, string>}
 */
function resolveShellEnvPlaceholders(shellEnv, tokens) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const [key, value] of Object.entries(shellEnv)) {
    if (value === "__WRONG_MCP_BIN__") {
      out[key] = tokens.wrongMcpBin;
    } else if (value === "__WRONG_STORE__") {
      out[key] = tokens.wrongStore;
    } else {
      out[key] = value;
    }
  }
  return out;
}

/**
 * @param {TiedRuntimeFixtureManifestCase} spec
 * @returns {{ workspaceRoot: string; storeRoot: string; processEnv: Record<string, string>; cleanup: () => void }}
 */
export function materializeTiedRuntimeFixture(spec) {
  const wrongMcpBin = path.join(os.tmpdir(), "tied-fixture-wrong", "index.js");
  const wrongStore = path.join(os.tmpdir(), "tied-fixture-wrong-store");

  if (spec.layout === "monolithic") {
    const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tied-rt-mono-"));
    const storeRoot = workspaceRoot;
    const tiedDir = path.join(workspaceRoot, "tied-project");
    seedTiedProject(tiedDir);
    const dist = writeFakeMcpDist(storeRoot);
    const mcpDir = path.join(workspaceRoot, ".cursor");
    fs.mkdirSync(mcpDir, { recursive: true });
    /** @type {Record<string, string>} */
    const env = { [ENV_CLIENT_PROJECT_PATH]: jsonSafeAbsolute(tiedDir) };
    if (spec.mcpStoreRootEnv !== false) {
      env.TIED_STORE_ROOT = jsonSafeAbsolute(storeRoot);
    }
    fs.writeFileSync(
      path.join(mcpDir, "mcp.json"),
      `${JSON.stringify(
        {
          mcpServers: {
            "tied-yaml": {
              command: "node",
              args: [dist],
              env,
            },
          },
        },
        null,
        2,
      )}\n`,
    );
    const processEnv = resolveShellEnvPlaceholders(spec.shellEnv ?? {}, { wrongMcpBin, wrongStore });
    return {
      workspaceRoot,
      storeRoot,
      processEnv,
      cleanup: () => {
        fs.rmSync(workspaceRoot, { recursive: true, force: true });
      },
    };
  }

  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tied-rt-client-"));
  const storeRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tied-rt-store-"));
  const tiedDir = path.join(workspaceRoot, "tied-project");
  seedTiedProject(tiedDir);
  const dist = writeFakeMcpDist(storeRoot);
  if (spec.includeBundle) {
    fs.mkdirSync(path.join(storeRoot, "tied-bundle"), { recursive: true });
  }
  const mcpDir = path.join(workspaceRoot, ".cursor");
  fs.mkdirSync(mcpDir, { recursive: true });
  /** @type {Record<string, string>} */
  const env = { [ENV_CLIENT_PROJECT_PATH]: jsonSafeAbsolute(tiedDir) };
  if (spec.mcpStoreRootEnv !== false) {
    env.TIED_STORE_ROOT = jsonSafeAbsolute(storeRoot);
  }
  if (spec.includeBundle) {
    env[ENV_CLIENT_BUNDLE_PATH] = jsonSafeAbsolute(path.join(storeRoot, "tied-bundle"));
  }
  fs.writeFileSync(
    path.join(mcpDir, "mcp.json"),
    `${JSON.stringify(
      {
        mcpServers: {
          "tied-yaml": {
            command: "node",
            args: [dist],
            env,
          },
        },
      },
      null,
      2,
    )}\n`,
  );
  const processEnv = resolveShellEnvPlaceholders(spec.shellEnv ?? {}, { wrongMcpBin, wrongStore });
  return {
    workspaceRoot,
    storeRoot,
    processEnv,
    cleanup: () => {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
      fs.rmSync(storeRoot, { recursive: true, force: true });
    },
  };
}

/**
 * @param {string} caseId
 */
export function materializeTiedRuntimeFixtureById(caseId) {
  return materializeTiedRuntimeFixture(getTiedRuntimeFixtureCase(caseId));
}

/**
 * @param {import("./tied-runtime-config.mjs").resolveTiedRuntimeConfig extends (...args: any) => infer R ? R : never} cfg
 */
export function normalizeResolveSnapshot(cfg) {
  if (!cfg) {
    return null;
  }
  const norm = (p) => (p ? jsonSafeAbsolute(String(p)) : undefined);
  /** @type {Record<string, string>} */
  const out = {};
  for (const [key, raw] of [
    ["clientBundlePath", cfg.clientBundlePath],
    ["clientProjectPath", cfg.clientProjectPath],
    ["mcpDistPath", cfg.mcpDistPath],
    ["projectRoot", cfg.projectRoot],
    ["storeRoot", cfg.storeRoot],
  ]) {
    const value = norm(raw);
    if (value !== undefined) {
      out[key] = value;
    }
  }
  return out;
}

/**
 * @returns {TiedRuntimeFixtureManifestCase[]}
 */
export function listSharedParityFixtureCases() {
  const manifest = loadTiedRuntimeFixtureManifest();
  return manifest.cases.filter(
    (c) => c.runtimes.includes("bootstrap") && c.runtimes.includes("agentstream"),
  );
}
