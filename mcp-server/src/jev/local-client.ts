/**
 * [IMPL-TIED_JEV_LOCAL_DECISION_PROVIDER] [ARCH-TIED_JEV_LOCAL_DECISION_PROVIDER]
 * [REQ-TIED_JEV_LOCAL_DECISION_PROVIDER]
 */

import { spawn } from "node:child_process";

import type { LocalProviderConfig } from "./decision-provider.js";
import type {
  JevAnswer,
  JevDecideResponse,
  JevDecideResult,
  JevQuestions,
  JevState,
} from "./types.js";

export const LOCAL_BRIDGE_REQUEST_SCHEMA = "jev-local-bridge-request.v1" as const;
export const LOCAL_BRIDGE_RESPONSE_SCHEMA = "jev-local-bridge-response.v1" as const;

export type LocalBridgeRequest = {
  schema: typeof LOCAL_BRIDGE_REQUEST_SCHEMA;
  model: string;
  state: JevState;
  questions: JevQuestions;
};

export type LocalBridgeSuccess = {
  schema: typeof LOCAL_BRIDGE_RESPONSE_SCHEMA;
  ok: true;
  response: JevDecideResponse;
};

export type LocalBridgeFailure = {
  schema: typeof LOCAL_BRIDGE_RESPONSE_SCHEMA;
  ok: false;
  error_code: string;
  error_message?: string;
};

export type LocalBridgeResponse = LocalBridgeSuccess | LocalBridgeFailure;

export type LocalProcessRunResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
  timedOut: boolean;
};

export type LocalProcessRunner = (input: {
  executable: string;
  bridgePath: string;
  stdin: string;
  timeoutMs: number;
  maxOutputChars: number;
}) => Promise<LocalProcessRunResult>;

export function defaultLocalProcessRunner(input: {
  executable: string;
  bridgePath: string;
  stdin: string;
  timeoutMs: number;
  maxOutputChars: number;
}): Promise<LocalProcessRunResult> {
  return new Promise((resolve) => {
    const child = spawn(input.executable, [input.bridgePath], {
      shell: false,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, input.timeoutMs);

    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
      if (stdout.length > input.maxOutputChars) {
        stdout = stdout.slice(0, input.maxOutputChars);
        child.kill("SIGKILL");
      }
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
      if (stderr.length > 4096) {
        stderr = stderr.slice(0, 4096);
      }
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({
        exitCode: 1,
        stdout,
        stderr: err.message,
        timedOut: false,
      });
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        exitCode: code ?? 1,
        stdout,
        stderr,
        timedOut,
      });
    });

    child.stdin?.write(input.stdin, "utf8");
    child.stdin?.end();
  });
}

function probabilityInUnit(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 1;
}

export function validateJevAnswers(answers: Record<string, unknown>): string | null {
  for (const [key, raw] of Object.entries(answers)) {
    if (!raw || typeof raw !== "object") {
      return `invalid_answer:${key}`;
    }
    const a = raw as Record<string, unknown>;
    const t = a.type;
    if (t === "noul") {
      if (!probabilityInUnit(a.noul)) {
        return `invalid_noul:${key}`;
      }
      continue;
    }
    if (t === "choice") {
      if (typeof a.choice !== "string") {
        return `invalid_choice:${key}`;
      }
      if (!probabilityInUnit(a.confidence)) {
        return `invalid_confidence:${key}`;
      }
      const probs = a.probabilities;
      if (!probs || typeof probs !== "object") {
        return `invalid_probabilities:${key}`;
      }
      for (const p of Object.values(probs as Record<string, unknown>)) {
        if (!probabilityInUnit(p)) {
          return `invalid_probability:${key}`;
        }
      }
      continue;
    }
    if (t === "score") {
      if (!probabilityInUnit(a.score)) {
        return `invalid_score:${key}`;
      }
      if (!probabilityInUnit(a.confidence)) {
        return `invalid_confidence:${key}`;
      }
      continue;
    }
    return `unsupported_question_type:${key}`;
  }
  return null;
}

export function normalizeLocalBridgeResponse(
  parsed: LocalBridgeResponse,
): JevDecideResult {
  if (parsed.schema !== LOCAL_BRIDGE_RESPONSE_SCHEMA) {
    return {
      ok: false,
      skipped: true,
      reason: "malformed_local_response",
    };
  }
  if (!parsed.ok) {
    const code = parsed.error_code ?? "local_bridge_failed";
    if (code === "unsupported_question_type") {
      return { ok: false, skipped: true, reason: "unsupported_question_type" };
    }
    return { ok: false, skipped: true, reason: "local_bridge_failed" };
  }
  const err = validateJevAnswers(parsed.response.answers as Record<string, unknown>);
  if (err) {
    if (err.startsWith("unsupported_question_type")) {
      return { ok: false, skipped: true, reason: "unsupported_question_type" };
    }
    return { ok: false, skipped: true, reason: "malformed_local_response" };
  }
  return { ok: true, response: parsed.response };
}

export async function invokeLocalDecisionBridge(input: {
  config: LocalProviderConfig;
  state: JevState;
  questions: JevQuestions;
  runner?: LocalProcessRunner;
}): Promise<JevDecideResult> {
  const bridgePath = input.config.localBridge;
  if (!bridgePath) {
    return { ok: false, skipped: true, reason: "provider_misconfigured" };
  }

  const payload: LocalBridgeRequest = {
    schema: LOCAL_BRIDGE_REQUEST_SCHEMA,
    model: input.config.localModel,
    state: input.state,
    questions: input.questions,
  };

  const run = input.runner ?? defaultLocalProcessRunner;
  const proc = await run({
    executable: input.config.localExecutable,
    bridgePath,
    stdin: `${JSON.stringify(payload)}\n`,
    timeoutMs: input.config.timeoutMs,
    maxOutputChars: input.config.maxOutputChars,
  });

  if (proc.timedOut) {
    return { ok: false, skipped: true, reason: "local_timeout" };
  }
  if (proc.exitCode !== 0) {
    return { ok: false, skipped: true, reason: "local_bridge_failed" };
  }

  const trimmed = proc.stdout.trim();
  if (!trimmed) {
    return { ok: false, skipped: true, reason: "malformed_local_response" };
  }

  let parsed: LocalBridgeResponse;
  try {
    parsed = JSON.parse(trimmed) as LocalBridgeResponse;
  } catch {
    return { ok: false, skipped: true, reason: "malformed_local_response" };
  }

  return normalizeLocalBridgeResponse(parsed);
}
