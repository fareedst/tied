/**
 * [IMPL-TIED_JEV_LOCAL_DECISION_PROVIDER] [ARCH-TIED_JEV_LOCAL_DECISION_PROVIDER]
 * [REQ-TIED_JEV_LOCAL_DECISION_PROVIDER] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 */

import path from "node:path";

import { resolveJevApiKey } from "./resolve-jev-api-key.js";
import type { JevClientConfig } from "./client.js";

export type JevDecisionProviderMode = "remote" | "local" | "auto";

export type JevLocalFallback = "remote" | "skip" | "error";

export const DEFAULT_LOCAL_MODEL = "aac6fef/laya-mlx";
export const DEFAULT_LOCAL_EXECUTABLE = "python3";
export const DEFAULT_LOCAL_TIMEOUT_MS = 120_000;
export const DEFAULT_LOCAL_MAX_OUTPUT_CHARS = 524_288;
export const MAX_LOCAL_TIMEOUT_MS = 600_000;

export type LocalProviderConfig = {
  provider: JevDecisionProviderMode;
  localExecutable: string;
  localBridge?: string;
  localModel: string;
  timeoutMs: number;
  maxOutputChars: number;
  localFallback: JevLocalFallback;
  diagnostics: string[];
};

function parseProvider(raw: string | undefined): JevDecisionProviderMode {
  const v = raw?.trim().toLowerCase();
  if (v === "local" || v === "auto" || v === "remote") {
    return v;
  }
  return "remote";
}

function parseFallback(raw: string | undefined): JevLocalFallback {
  const v = raw?.trim().toLowerCase();
  if (v === "remote" || v === "error") {
    return v;
  }
  return "skip";
}

function parsePositiveInt(
  raw: string | undefined,
  fallback: number,
  max?: number,
): number {
  const n = Number.parseInt(raw?.trim() ?? "", 10);
  if (!Number.isFinite(n) || n <= 0) {
    return fallback;
  }
  if (max !== undefined && n > max) {
    return max;
  }
  return n;
}

export function isAbsoluteBridgePath(bridgePath: string): boolean {
  return path.isAbsolute(bridgePath);
}

export function resolveLocalProviderConfig(
  env: NodeJS.ProcessEnv = process.env,
): LocalProviderConfig {
  const diagnostics: string[] = [];
  const rawProvider = env.TIED_JEV_DECISION_PROVIDER;
  let provider = parseProvider(rawProvider);
  if (rawProvider?.trim() && provider !== rawProvider.trim().toLowerCase()) {
    diagnostics.push(
      `DIAGNOSTIC: invalid TIED_JEV_DECISION_PROVIDER=${rawProvider}; using remote`,
    );
    provider = "remote";
  }

  const bridgeRaw = env.TIED_JEV_LOCAL_BRIDGE?.trim();
  let localBridge: string | undefined;
  if (bridgeRaw) {
    if (isAbsoluteBridgePath(bridgeRaw)) {
      localBridge = bridgeRaw;
    } else {
      diagnostics.push(
        "DIAGNOSTIC: TIED_JEV_LOCAL_BRIDGE must be absolute; local backend not configured",
      );
    }
  }

  const localFallback = parseFallback(env.TIED_JEV_LOCAL_FALLBACK);

  return {
    provider,
    localExecutable: env.TIED_JEV_LOCAL_EXECUTABLE?.trim() || DEFAULT_LOCAL_EXECUTABLE,
    localBridge,
    localModel: env.TIED_JEV_LOCAL_MODEL?.trim() || DEFAULT_LOCAL_MODEL,
    timeoutMs: parsePositiveInt(
      env.TIED_JEV_LOCAL_TIMEOUT_MS,
      DEFAULT_LOCAL_TIMEOUT_MS,
      MAX_LOCAL_TIMEOUT_MS,
    ),
    maxOutputChars: parsePositiveInt(
      env.TIED_JEV_LOCAL_MAX_OUTPUT_CHARS,
      DEFAULT_LOCAL_MAX_OUTPUT_CHARS,
    ),
    localFallback,
    diagnostics,
  };
}

export function assessLocalBackendReady(config: LocalProviderConfig): {
  ready: boolean;
  reason?: string;
} {
  if (!config.localBridge) {
    return { ready: false, reason: "provider_misconfigured" };
  }
  if (!isAbsoluteBridgePath(config.localBridge)) {
    return { ready: false, reason: "provider_misconfigured" };
  }
  if (!config.localExecutable.trim()) {
    return { ready: false, reason: "provider_misconfigured" };
  }
  return { ready: true };
}

export function assessRemoteBackendReady(
  env: NodeJS.ProcessEnv = process.env,
  overrides: JevClientConfig = {},
): boolean {
  const apiKey =
    "apiKey" in overrides ? overrides.apiKey : resolveJevApiKey(env);
  return (apiKey?.trim() ?? "").length > 0;
}

export function assessDecisionBackendReady(
  env: NodeJS.ProcessEnv = process.env,
  overrides: JevClientConfig = {},
): boolean {
  const lp = resolveLocalProviderConfig(env);
  const localReady = assessLocalBackendReady(lp).ready;
  const remoteReady = assessRemoteBackendReady(env, overrides);
  if (lp.provider === "remote") {
    return remoteReady;
  }
  if (lp.provider === "local") {
    return localReady;
  }
  return localReady || remoteReady;
}

export function redactBridgePathForTrace(bridgePath: string | undefined): string | undefined {
  if (!bridgePath) {
    return undefined;
  }
  return path.basename(bridgePath);
}

export function buildProviderTraceMeta(
  env: NodeJS.ProcessEnv = process.env,
  extras?: {
    fallback_applied?: JevLocalFallback | "none";
    effective_backend?: string;
  },
): Record<string, unknown> {
  const lp = resolveLocalProviderConfig(env);
  return {
    decision_provider: lp.provider,
    local_fallback_policy: lp.localFallback,
    local_bridge_path_redacted: redactBridgePathForTrace(lp.localBridge),
    ...(extras?.fallback_applied !== undefined
      ? { fallback_applied: extras.fallback_applied }
      : {}),
    ...(extras?.effective_backend ? { effective_backend: extras.effective_backend } : {}),
    ...(lp.provider === "auto" && lp.localFallback === "remote"
      ? { remote_egress_possible: true }
      : {}),
  };
}

export function formatDecisionBackendPreflightLines(
  env: NodeJS.ProcessEnv = process.env,
): string[] {
  const lp = resolveLocalProviderConfig(env);
  const lines: string[] = [
    `DEBUG: jev decision provider=${lp.provider} local_fallback=${lp.localFallback}\n`,
  ];
  const local = assessLocalBackendReady(lp);
  const remoteReady = assessRemoteBackendReady(env);
  lines.push(
    `DEBUG: jev decision backend: remote_ready=${remoteReady} local_ready=${local.ready}\n`,
  );
  if (lp.provider === "auto" && lp.localFallback === "remote") {
    lines.push(
      "DIAGNOSTIC: jev auto mode may egress to remote Jev when local fails (TIED_JEV_LOCAL_FALLBACK=remote)\n",
    );
  }
  if (lp.provider === "local" && !local.ready) {
    lines.push(
      "DIAGNOSTIC: jev local provider misconfigured — blocking harness tools fail-closed\n",
    );
  }
  if (lp.provider === "remote" && !remoteReady) {
    lines.push(
      "DIAGNOSTIC: jev harness: JEV_API_KEY missing — blocking tools (bash/Shell) will fail-closed per jev_unavailable_policy\n",
    );
  }
  for (const d of lp.diagnostics) {
    lines.push(`${d}\n`);
  }
  return lines;
}
