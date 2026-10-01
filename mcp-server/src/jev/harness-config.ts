/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [IMPL-TIED_JEV_LOCAL_DECISION_PROVIDER]
 * [REQ-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_LOCAL_DECISION_PROVIDER]
 */

import {
  assessDecisionBackendReady,
  resolveLocalProviderConfig,
  type JevDecisionProviderMode,
  type JevLocalFallback,
} from "./decision-provider.js";

export type JevHarnessConfig = {
  enabled: boolean;
  hasApiKey: boolean;
  decisionBackendReady: boolean;
  decisionProvider: JevDecisionProviderMode;
  localFallback: JevLocalFallback;
  blockWhenUnavailable: boolean;
  model?: string;
};

export function resolveJevHarnessConfig(
  env: NodeJS.ProcessEnv = process.env,
  manifestFlag = false,
): JevHarnessConfig {
  const enabled =
    env.AGENTSTREAM_JEV_HARNESS === "1" ||
    env.AGENTSTREAM_JEV_HARNESS === "true" ||
    manifestFlag;
  const apiKey = env.JEV_API_KEY?.trim() ?? "";
  const lp = resolveLocalProviderConfig(env);
  return {
    enabled,
    hasApiKey: apiKey.length > 0,
    decisionBackendReady: assessDecisionBackendReady(env),
    decisionProvider: lp.provider,
    localFallback: lp.localFallback,
    blockWhenUnavailable: true,
    model: env.JEV_MODEL,
  };
}
