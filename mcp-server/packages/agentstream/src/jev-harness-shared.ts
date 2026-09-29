/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 * Shared Jev harness dist loader and manifest helpers for agentstream.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import yaml from "js-yaml";

import type { DryRunConfig } from "./dry-run-config.js";
import { findRepoRootFromPath } from "./repo-root.js";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function readRepoTiedYaml(projectRoot: string): Record<string, unknown> | undefined {
  const configPath = path.join(projectRoot, ".tied-yaml.yaml");
  if (!fs.existsSync(configPath)) {
    return undefined;
  }
  try {
    const raw = yaml.load(fs.readFileSync(configPath, "utf8"));
    return isRecord(raw) ? raw : undefined;
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

/** Absolute path to built W5 harness guard module under project root. */
export function harnessDistModulePath(projectRoot: string): string {
  return path.join(
    projectRoot,
    "mcp-server",
    "dist",
    "jev",
    "harness-tool-guard.js",
  );
}

/** True when mcp-server/dist/jev/harness-tool-guard.js exists (sync probe). */
export function isHarnessDistBuilt(projectRoot: string): boolean {
  return fs.existsSync(harnessDistModulePath(projectRoot));
}

/** Stable operator message for missing-dist hard stop (sponsor 2C). */
export function formatHarnessDistMissingMessage(): string {
  return "agentstream: jev harness enabled but mcp-server/dist/jev not built — run: cd mcp-server && npm run build\n";
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
    input: { tool: string; arguments?: string; goal?: string; context?: string },
    harness: { enabled: boolean; hasApiKey: boolean; blockWhenUnavailable: boolean },
    jevConfig?: { apiKey?: string; fetchImpl?: typeof fetch },
  ) => Promise<{ decision: string; reason: string; jev_skipped?: boolean }>;
  adviseContextFilter?: (
    task: string,
    item: string,
    harness: { enabled: boolean; hasApiKey: boolean; blockWhenUnavailable: boolean },
    jevConfig?: { apiKey?: string; fetchImpl?: typeof fetch },
  ) => Promise<{ action: string; reason: string }>;
  resolveHarnessFromEnv: (
    env?: NodeJS.ProcessEnv,
    manifestFlag?: boolean,
  ) => { enabled: boolean; hasApiKey: boolean; blockWhenUnavailable: boolean };
};

export async function loadJevHarnessDistModule(
  projectRoot: string,
): Promise<JevHarnessDistModule | null> {
  const modPath = harnessDistModulePath(projectRoot);
  if (!fs.existsSync(modPath)) {
    return null;
  }
  const ctx = await import(pathToFileURL(modPath).href);
  const ctxFilter = path.join(projectRoot, "mcp-server", "dist", "jev", "context-filter-advisory.js");
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
