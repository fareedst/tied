/**
 * [IMPL-TIED_CLAUDE_LIVE_DRIVER] [ARCH-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_LIVE_DRIVER]
 * [REQ-TIED_CLAUDE_HARNESS] [REQ-GOAGENT-AGENT-EXECUTOR]
 * SELECT_LIVE_DRIVER — map harness profile to live AgentDriver kind; never harness via --agent-path.
 */
import type { AgentHarnessProfile } from "./harness-select.js";

export type LiveDriverKind = "cursor" | "claude" | "none";

export type LiveDriverSelection = {
  driverKind: LiveDriverKind;
  agentPathOverride: string | null;
  agentPathMisusedAsHarness: boolean;
};

/** Pure factory: harness profile selects driver; agent_path is Cursor executable override only. */
export function selectLiveDriver(
  harnessProfile: AgentHarnessProfile,
  agentPath: string,
): LiveDriverSelection {
  const trimmedPath = agentPath.trim();
  const agentPathMisusedAsHarness =
    trimmedPath === "claude" && harnessProfile !== "claude";

  if (harnessProfile === "claude") {
    return {
      driverKind: "claude",
      agentPathOverride: null,
      agentPathMisusedAsHarness,
    };
  }
  if (harnessProfile === "dry_run") {
    return {
      driverKind: "none",
      agentPathOverride: null,
      agentPathMisusedAsHarness,
    };
  }
  return {
    driverKind: "cursor",
    agentPathOverride: trimmedPath !== "" ? trimmedPath : null,
    agentPathMisusedAsHarness,
  };
}
