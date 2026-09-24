/**
 * [IMPL-TIED_CLAUDE_LIVE_DRIVER] [ARCH-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_LIVE_DRIVER]
 * [REQ-GOAGENT-AGENT-EXECUTOR]
 * BIND_LIVE_EXECUTOR_CLAUDE — composition binding for live executor agent turns.
 */
import {
  claudeAgentDriverLaunchAndParse,
  collectClaudeStreamFromSpawn,
  DEFAULT_CLAUDE_PINNED_CONTRACT,
  type ClaudeLaunchFn,
} from "./claude-driver.js";
import type { AgentHarnessProfile } from "./harness-select.js";
import { runAgent, type RunResult } from "./executor-run.js";
import { selectLiveDriver } from "./live-driver-select.js";

export type LiveAgentTurnOutcome = {
  result: RunResult;
  exitCode: number;
  driverError?: string;
  stderrTail?: string;
};

export type LiveDriverBinding = {
  driverKind: "cursor" | "claude" | "none";
  runTurn: (
    argv: string[],
    extraEnv: string[],
  ) => Promise<LiveAgentTurnOutcome>;
};

export type BindLiveExecutorInput = {
  harnessProfile: AgentHarnessProfile;
  agentPath: string;
  claudeLaunchFn?: ClaudeLaunchFn;
  claudeLaunchFnIsTestDouble?: boolean;
};

/** [BIND_LIVE_EXECUTOR_CLAUDE] Bind harness profile to Cursor or Claude live driver. */
export function bindLiveExecutorDriver(
  input: BindLiveExecutorInput,
): LiveDriverBinding {
  const selection = selectLiveDriver(input.harnessProfile, input.agentPath);

  if (selection.driverKind === "none") {
    return {
      driverKind: "none",
      runTurn: async () => ({
        result: {
          sessionId: "",
          finalText: "",
          thinkingText: "",
          transcript: "",
        },
        exitCode: 1,
      }),
    };
  }

  if (selection.driverKind === "claude") {
    return {
      driverKind: "claude",
      runTurn: async (argv, extraEnv) => {
        const launchFn: ClaudeLaunchFn =
          input.claudeLaunchFn ??
          (() => collectClaudeStreamFromSpawn(argv, extraEnv));
        let lastStderrTail = "";
        const wrappedLaunch: ClaudeLaunchFn = async () => {
          const launched = await launchFn();
          lastStderrTail = launched.stderrTail ?? "";
          return launched;
        };
        const out = await claudeAgentDriverLaunchAndParse({
          turnSpec: { requiresSession: true },
          launchFn: wrappedLaunch,
          pinnedContract: DEFAULT_CLAUDE_PINNED_CONTRACT,
          launchFnIsTestDouble: input.claudeLaunchFnIsTestDouble === true,
        });
        if ("error" in out) {
          return {
            result: {
              sessionId: "",
              finalText: "",
              thinkingText: "",
              transcript: "",
            },
            exitCode: 1,
            driverError: out.error,
            stderrTail: lastStderrTail,
          };
        }
        const exitCode = out.exitMetadata.isError ? out.exitMetadata.exitCode : 0;
        return { result: out.runResult, exitCode };
      },
    };
  }

  const agentPathOverride = selection.agentPathOverride ?? "";
  return {
    driverKind: "cursor",
    runTurn: async (argv, extraEnv) => {
      const effectiveArgv =
        agentPathOverride !== "" ? [agentPathOverride, ...argv.slice(1)] : argv;
      const { result, exitCode } = await runAgent(effectiveArgv, extraEnv);
      return { result, exitCode };
    },
  };
}
