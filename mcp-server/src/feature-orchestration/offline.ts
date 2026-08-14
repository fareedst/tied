export type CapabilityProbe = {
  feature_orchestrator: boolean;
  tied_cli?: boolean;
  node: boolean;
  mcp: boolean;
};
export type OnboardingPath = {
  kind: "feature-orchestrator" | "tied-cli" | "manual";
  command: string;
  references: string[];
  mutated_configuration: false;
};

// [IMPL-FEAT_OFFLINE_FALLBACK] [ARCH-FEAT_OFFLINE_COMPATIBILITY] [REQ-FEAT_OFFLINE_WORKFLOW_PRESERVATION] — preserve explicit tooling when onboarding prerequisites are unavailable.
export function selectOfflinePath(capabilityProbe: CapabilityProbe, projectRoot: string): OnboardingPath {
  if (capabilityProbe.feature_orchestrator && capabilityProbe.node) {
    return {
      kind: "feature-orchestrator",
      command: "feature-orchestrator --help",
      references: ["tied-cli.sh", "TIED YAML MCP", "agentstream", "tied/docs/using-tied-without-mcp.md"],
      mutated_configuration: false,
    };
  }
  if (capabilityProbe.tied_cli === true && capabilityProbe.node && capabilityProbe.mcp) {
    return {
      kind: "tied-cli",
      command: `TIED_BASE_PATH="${projectRoot}/tied" .cursor/skills/tied-yaml/scripts/tied-cli.sh tied_validate_consistency '{}'`,
      references: ["TIED YAML MCP", "agentstream", "tied/docs/using-tied-without-mcp.md"],
      mutated_configuration: false,
    };
  }
  return {
    kind: "manual",
    command: "see tied/docs/using-tied-without-mcp.md",
    references: ["tied-cli.sh", "TIED YAML MCP", "agentstream"],
    mutated_configuration: false,
  };
}
