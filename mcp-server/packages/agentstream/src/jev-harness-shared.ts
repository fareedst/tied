/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 * Shared Jev harness dist loader and manifest helpers for agentstream.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import yaml from "js-yaml";

import type { DryRunConfig } from "./dry-run-config.js";
import { findRepoRootFromPath } from "./repo-root.js";
import { resolveTiedRuntimeConfigFromWorkspace } from "./tied-runtime-config.js";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

const PROJECT_CONFIG_SCHEMA_V1 = "tied-project-config.v1";

function resolveProjectConfigFile(projectRoot: string): string | undefined {
  const root = path.resolve(projectRoot);
  for (const dirName of ["tied-project", "tied"] as const) {
    const candidate = path.join(root, dirName, "config.yaml");
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  const legacyRoot = path.join(root, ".tied-yaml.yaml");
  if (fs.existsSync(legacyRoot)) {
    return legacyRoot;
  }
  return undefined;
}

function flatProjectConfigView(record: Record<string, unknown>): Record<string, unknown> {
  if (record.schema !== PROJECT_CONFIG_SCHEMA_V1) {
    return record;
  }
  const yamlSection = isRecord(record.yaml) ? record.yaml : {};
  const flat: Record<string, unknown> = { ...record };
  if (yamlSection.scalar_style !== undefined) {
    flat.scalar_style = yamlSection.scalar_style;
  }
  if (yamlSection.client_formatter !== undefined) {
    flat.client_formatter = yamlSection.client_formatter;
  }
  delete flat.schema;
  delete flat.yaml;
  return flat;
}

/** Mirror mcp-server tied-project-config.readRepoTiedYaml (no cross-package import). */
export function readRepoTiedYaml(projectRoot: string): Record<string, unknown> | undefined {
  const configPath = resolveProjectConfigFile(projectRoot);
  if (!configPath) {
    return undefined;
  }
  try {
    const raw = yaml.load(fs.readFileSync(configPath, "utf8"));
    if (!isRecord(raw)) {
      return undefined;
    }
    return flatProjectConfigView(raw);
  } catch {
    return undefined;
  }
}

export function manifestEnablesJevHarness(projectRoot: string): boolean {
  const repo = readRepoTiedYaml(projectRoot);
  const jev = repo && isRecord(repo.jev) ? repo.jev : undefined;
  return jev?.agentstream_harness === true;
}

export function resolveProjectRootForJev(cfg: DryRunConfig): string {
  const root = findRepoRootFromPath(cfg.workspace);
  return root !== "" ? root : path.resolve(cfg.workspace);
}

export function taskSummaryFromCfg(cfg: DryRunConfig): string {
  if (cfg.argvWords.length > 0) {
    return cfg.argvWords.join(" ").slice(0, 500);
  }
  return "agentstream session";
}

/** Absolute path to built W5 harness guard module under TIED store root. */
export function harnessDistModulePath(storeRoot: string): string {
  return path.join(
    storeRoot,
    "mcp-server",
    "dist",
    "jev",
    "harness-tool-guard.js",
  );
}

function storeRootHasHarnessDist(storeRoot: string): boolean {
  return fs.existsSync(harnessDistModulePath(storeRoot));
}

/** Walk parents from agentstream module (src or dist) until harness dist exists. */
export function packageAnchorStoreRootFromModuleUrl(
  moduleUrl: string | URL = import.meta.url,
): string {
  const filePath = typeof moduleUrl === "string" ? moduleUrl : fileURLToPath(moduleUrl);
  let dir = path.dirname(filePath);
  for (let depth = 0; depth < 10; depth += 1) {
    if (storeRootHasHarnessDist(dir)) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  return "";
}

/**
 * Resolve TIED store root for harness dist probe/load (linked client vs monolithic).
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] RESOLVE_JEV_HARNESS_DIST_STORE_ROOT
 */
export function resolveJevHarnessDistStoreRoot(
  cfg: DryRunConfig,
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  const clientRoot = resolveProjectRootForJev(cfg);
  if (storeRootHasHarnessDist(clientRoot)) {
    return clientRoot;
  }

  const fromDisk = resolveTiedRuntimeConfigFromWorkspace(clientRoot, { requireDistExists: false });
  if (fromDisk && storeRootHasHarnessDist(fromDisk.storeRoot)) {
    return fromDisk.storeRoot;
  }

  const skipAnchor =
    env.AGENTSTREAM_JEV_HARNESS_DIST_SKIP_PACKAGE_ANCHOR === "1" ||
    env.AGENTSTREAM_JEV_HARNESS_DIST_SKIP_PACKAGE_ANCHOR === "true";
  if (!skipAnchor) {
    const fromAnchor = packageAnchorStoreRootFromModuleUrl(import.meta.url);
    if (fromAnchor !== "") {
      return fromAnchor;
    }
  }

  return null;
}

/** True when harness dist exists at resolved store root (sync probe). */
export function isHarnessDistBuilt(
  cfg: DryRunConfig,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return resolveJevHarnessDistStoreRoot(cfg, env) !== null;
}

/** Stable operator message for missing-dist hard stop (sponsor 2C). */
export function formatHarnessDistMissingMessage(): string {
  return (
    "agentstream: jev harness enabled but mcp-server/dist/jev not built — " +
    "run: ./build-workspace.sh from the TIED store that owns this CLI " +
    "(linked clients: ensure .cursor/mcp.json tied-yaml args/env point at that store, then ./tied-install.sh --refresh)\n"
  );
}

/**
 * Live-executor belt: when harness is enabled and gate is null, return abort stderr.
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] How: REQUIRE_JEV_LIVE_GATE_WHEN_HARNESS_ENABLED
 */
export function jevHarnessMissingDistAbortMessage(
  harnessEnabled: boolean,
  gateIsNull: boolean,
): string | null {
  if (!harnessEnabled || !gateIsNull) {
    return null;
  }
  return formatHarnessDistMissingMessage();
}

export type JevHarnessDistModule = {
  evaluateHarnessToolCall: (
    input: { tool: string; arguments?: string; goal?: string; context?: string; workspace?: string },
    harness: {
      enabled: boolean;
      hasApiKey: boolean;
      decisionBackendReady: boolean;
      blockWhenUnavailable: boolean;
    },
    jevConfig?: { apiKey?: string; fetchImpl?: typeof fetch },
  ) => Promise<{ decision: string; reason: string; jev_skipped?: boolean }>;
  adviseContextFilter?: (
    task: string,
    item: string,
    harness: {
      enabled: boolean;
      hasApiKey: boolean;
      decisionBackendReady: boolean;
      blockWhenUnavailable: boolean;
    },
    jevConfig?: { apiKey?: string; fetchImpl?: typeof fetch },
  ) => Promise<{ action: string; reason: string }>;
  resolveHarnessFromEnv: (
    env?: NodeJS.ProcessEnv,
    manifestFlag?: boolean,
  ) => {
    enabled: boolean;
    hasApiKey: boolean;
    decisionBackendReady: boolean;
    blockWhenUnavailable: boolean;
  };
};

export async function loadJevHarnessDistModule(
  cfg: DryRunConfig,
  env: NodeJS.ProcessEnv = process.env,
): Promise<JevHarnessDistModule | null> {
  const storeRoot = resolveJevHarnessDistStoreRoot(cfg, env);
  if (!storeRoot) {
    return null;
  }
  const modPath = harnessDistModulePath(storeRoot);
  if (!fs.existsSync(modPath)) {
    return null;
  }
  const ctx = await import(pathToFileURL(modPath).href);
  const ctxFilter = path.join(storeRoot, "mcp-server", "dist", "jev", "context-filter-advisory.js");
  let adviseContextFilter = ctx.adviseContextFilter;
  if (fs.existsSync(ctxFilter)) {
    const cf = await import(pathToFileURL(ctxFilter).href);
    adviseContextFilter = cf.adviseContextFilter;
  }
  return {
    evaluateHarnessToolCall: ctx.evaluateHarnessToolCall,
    adviseContextFilter,
    resolveHarnessFromEnv: ctx.resolveHarnessFromEnv,
  };
}
