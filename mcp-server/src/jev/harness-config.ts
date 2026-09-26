/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 */

export type JevHarnessConfig = {
  enabled: boolean;
  hasApiKey: boolean;
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
  return {
    enabled,
    hasApiKey: apiKey.length > 0,
    blockWhenUnavailable: true,
    model: env.JEV_MODEL,
  };
}
