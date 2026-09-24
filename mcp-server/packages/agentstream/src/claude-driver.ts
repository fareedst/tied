/**
 * [IMPL-TIED_CLAUDE_LIVE_DRIVER] [ARCH-TIED_CLAUDE_LIVE_DRIVER] [REQ-TIED_CLAUDE_LIVE_DRIVER]
 * [REQ-GOAGENT-AGENT-EXECUTOR]
 * CLAUDE_AGENT_DRIVER — launch boundary, stream parse, shared receipt shape.
 */
import { spawn } from "node:child_process";
import readline from "node:readline";

import type { RunResult } from "./executor-run.js";
import {
  claudeEventsToRunText,
  extractClaudeSession,
  parseClaudeStream,
  type ClaudeStreamEvent,
  type ClaudeExitMetadata,
} from "./claude-stream.js";

export type ClaudePinnedContract = {
  cliVersion: string;
  proofBoundary: string;
};

export type ClaudeTurnSpec = {
  requiresSession: boolean;
};

export type ClaudeLaunchResult = {
  stdout: string;
  exitCode: number;
  stderrTail?: string;
};

export type ClaudeLaunchFn = () => Promise<ClaudeLaunchResult> | ClaudeLaunchResult;

export type AgentDriverReceipt = {
  harness: "claude";
  cliVersion: string;
  sessionId: string;
  exitMetadata: ClaudeExitMetadata;
  eventCount: number;
};

export type ClaudeDriverOk = {
  events: ClaudeStreamEvent[];
  sessionId: string;
  exitMetadata: ClaudeExitMetadata;
  receipt: AgentDriverReceipt;
  runResult: RunResult;
};

export type ClaudeDriverError =
  | { error: "LIVE_WITHOUT_FIXTURE_PARITY" }
  | { error: "STREAM_SCHEMA_DRIFT" }
  | { error: "STREAM_PARSE_ERROR" }
  | { error: "SESSION_CHAIN_BREAK" }
  | { error: "SESSION_ID_MISSING" }
  | { error: "MCP_LOAD_FAILURE" };

export function claudeLiveFixtureGatesPassed(): boolean {
  return process.env.AGENTSTREAM_CLAUDE_LIVE_OK === "1";
}

export function buildSharedReceipt(
  events: ClaudeStreamEvent[],
  sessionId: string,
  exitMetadata: ClaudeExitMetadata,
  pinned: ClaudePinnedContract,
): AgentDriverReceipt {
  return {
    harness: "claude",
    cliVersion: pinned.cliVersion,
    sessionId,
    exitMetadata,
    eventCount: events.length,
  };
}

/** [CLAUDE_AGENT_DRIVER] One Claude turn via AgentDriver boundary. */
export async function claudeAgentDriverLaunchAndParse(input: {
  turnSpec: ClaudeTurnSpec;
  launchFn: ClaudeLaunchFn;
  pinnedContract: ClaudePinnedContract;
  fixtureGatesPassed?: boolean;
  launchFnIsTestDouble?: boolean;
}): Promise<ClaudeDriverOk | ClaudeDriverError> {
  const gates =
    input.fixtureGatesPassed ?? claudeLiveFixtureGatesPassed();
  const isTestDouble = input.launchFnIsTestDouble === true;
  if (!gates && !isTestDouble) {
    return { error: "LIVE_WITHOUT_FIXTURE_PARITY" };
  }

  const launched = await input.launchFn();
  const parsed = parseClaudeStream(launched.stdout);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const sessionRaw = extractClaudeSession(parsed.events);
  let sessionId = "";
  if (typeof sessionRaw === "string") {
    sessionId = sessionRaw;
  } else if (input.turnSpec.requiresSession) {
    return { error: "SESSION_CHAIN_BREAK" };
  }

  if (launched.exitCode !== 0 && parsed.exitMetadata.isError) {
    /* still produce receipt for error oracles */
  }

  const text = claudeEventsToRunText(parsed.events);
  const receipt = buildSharedReceipt(
    parsed.events,
    sessionId,
    parsed.exitMetadata,
    input.pinnedContract,
  );
  const runResult: RunResult = {
    sessionId,
    finalText: text.finalText,
    thinkingText: text.thinkingText,
    transcript: text.transcript,
  };
  return {
    events: parsed.events,
    sessionId,
    exitMetadata: parsed.exitMetadata,
    receipt,
    runResult,
  };
}

export const DEFAULT_CLAUDE_PINNED_CONTRACT: ClaudePinnedContract = {
  cliVersion: "2.1.273",
  proofBoundary: "no_live_claude_in_ci",
};

/** Collect raw NDJSON stdout from a Claude CLI subprocess (operator live only). */
export async function collectClaudeStreamFromSpawn(
  argv: string[],
  extraEnv: string[] = [],
): Promise<ClaudeLaunchResult> {
  return new Promise((resolve) => {
    const env = { ...process.env } as Record<string, string | undefined>;
    for (const entry of extraEnv) {
      const eq = entry.indexOf("=");
      if (eq > 0) {
        env[entry.slice(0, eq)] = entry.slice(eq + 1);
      }
    }
    const cmd = spawn(argv[0]!, argv.slice(1), {
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const lines: string[] = [];
    let stderrBuf = "";
    const rl = readline.createInterface({ input: cmd.stdout! });
    rl.on("line", (line) => {
      const trimmed = line.trim();
      if (trimmed !== "") {
        lines.push(trimmed);
      }
    });
    cmd.stderr!.on("data", (chunk: Buffer | string) => {
      stderrBuf += String(chunk);
      if (stderrBuf.length > 2000) {
        stderrBuf = stderrBuf.slice(-2000);
      }
    });
    cmd.on("close", (code) => {
      rl.close();
      resolve({
        stdout: `${lines.join("\n")}\n`,
        exitCode: code ?? 1,
        stderrTail: stderrBuf.trim(),
      });
    });
    cmd.on("error", (err) => {
      resolve({
        stdout: "",
        exitCode: 1,
        stderrTail: String(err),
      });
    });
  });
}
