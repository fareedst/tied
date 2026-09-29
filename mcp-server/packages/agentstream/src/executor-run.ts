/**
 * [IMPL-GOAGENT-EXECUTOR] [ARCH-GOAGENT-EXECUTOR] [REQ-GOAGENT-AGENT-EXECUTOR]
 * Cursor agent subprocess + stream-json parse (Go executor parity, Phase 4a live run).
 */
import { spawn } from "node:child_process";
import readline from "node:readline";

import type { JevLiveToolGate } from "./jev-harness-live-tool-gate.js";
import {
  createToolGateStreamState,
  enqueueToolGateLineCheck,
} from "./jev-harness-live-tool-gate.js";

export type RunAgentOptions = {
  jevToolGate?: JevLiveToolGate | null;
};

export type RunResult = {
  sessionId: string;
  finalText: string;
  thinkingText: string;
  transcript: string;
};

function extractTextFragments(obj: Record<string, unknown>): string[] {
  const frags: string[] = [];
  const typ = String(obj.type ?? "");
  if (typ === "thinking") {
    if (obj.subtype === "delta" && typeof obj.text === "string" && obj.text !== "") {
      frags.push(obj.text);
    }
    return frags;
  }
  if (typ === "assistant") {
    const msg = obj.message as Record<string, unknown> | undefined;
    if (!msg) {
      return frags;
    }
    const parts = msg.content;
    if (!Array.isArray(parts)) {
      return frags;
    }
    for (const p of parts) {
      const pm = p as Record<string, unknown>;
      if (pm.type === "text" && typeof pm.text === "string" && pm.text !== "") {
        frags.push(pm.text);
      }
    }
  }
  return frags;
}

export async function runAgent(
  argv: string[],
  extraEnv: string[] = [],
  options: RunAgentOptions = {},
): Promise<{ result: RunResult; exitCode: number; error?: Error; gateStderr?: string }> {
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

    let captured = "";
    let finalText = "";
    let thinkingText = "";
    let transcript = "";
    const errLines: string[] = [];
    const gateState = createToolGateStreamState();
    const toolGate = options.jevToolGate ?? null;

    const rl = readline.createInterface({ input: cmd.stdout! });
    rl.on("line", (line) => {
      const trimmed = line.trim();
      if (trimmed === "") {
        return;
      }
      let obj: Record<string, unknown>;
      try {
        obj = JSON.parse(trimmed) as Record<string, unknown>;
      } catch (err) {
        errLines.push(`JSON parse error: ${String(err)}\n`);
        return;
      }
      if (toolGate) {
        enqueueToolGateLineCheck(gateState, toolGate, trimmed, () => {
          errLines.push(`agentstream: jev harness blocked tool proposal\n`);
          cmd.kill("SIGTERM");
        });
      }
      if (typeof obj.session_id === "string" && obj.session_id !== "") {
        captured = obj.session_id;
      }
      for (const f of extractTextFragments(obj)) {
        const typ = String(obj.type ?? "");
        if (typ === "thinking") {
          thinkingText += f;
        } else {
          finalText += f;
          transcript += f;
          process.stdout.write(f);
        }
      }
      if (obj.type === "thinking" && obj.subtype === "completed") {
        process.stdout.write("\n");
        transcript += "\n";
      }
    });

    cmd.stderr!.on("data", (chunk: Buffer) => {
      const s = chunk.toString();
      errLines.push(s);
      process.stderr.write(s);
    });

    cmd.on("close", (code) => {
      rl.close();
      void gateState.gateChain.then(() => {
        let exitCode = code ?? 1;
        if (gateState.gateBlocked) {
          exitCode = 1;
        }
        const result: RunResult = {
          sessionId: captured,
          finalText,
          thinkingText,
          transcript,
        };
        const gateStderr = gateState.gateStderrLines.join("");
        if (exitCode !== 0) {
          errLines.push(`agent exited with status ${exitCode}\n`);
          resolve({
            result,
            exitCode,
            error: new Error(`agent exit ${exitCode}`),
            gateStderr,
          });
          return;
        }
        resolve({ result, exitCode: 0, gateStderr });
      });
    });

    cmd.on("error", (err) => {
      resolve({ result: emptyResult(), exitCode: 1, error: err });
    });
  });
}

function emptyResult(): RunResult {
  return {
    sessionId: "",
    finalText: "",
    thinkingText: "",
    transcript: "",
  };
}

export { agentArgv } from "./executor-dry-run.js";
