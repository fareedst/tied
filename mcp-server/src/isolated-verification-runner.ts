/**
 * [IMPL-TIED_ISOLATED_VERIFICATION_RUNNER] [ARCH-TIED_ISOLATED_VERIFICATION_RUNNER] [REQ-TIED_ISOLATED_VERIFICATION_RUNNER]
 * Summary: Delegate declared quality commands to a dedicated child Node process (REQ-CTRL-009).
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { VerificationCommandResult } from "./quality-evidence.js";
import {
  runDeclaredQualityCommands,
  type QualityCommandRunnerInput,
} from "./quality-command-runner.js";
import { loadProjectConfig } from "./tied-project-config.js";

export type ExecutionRunnerIdentity = {
  mode: "in_process" | "isolated_subprocess";
  entry: string;
};

const RUNNER_BASENAME = "isolated-verification-runner.js";

export function resolveIsolatedRunnerEntry(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const distEntry = path.join(here, "cli", RUNNER_BASENAME);
  if (fs.existsSync(distEntry)) return distEntry;
  const srcEntry = path.join(here, "..", "dist", "cli", RUNNER_BASENAME);
  if (fs.existsSync(srcEntry)) return srcEntry;
  return distEntry;
}

/**
 * [IMPL-TIED_ISOLATED_VERIFICATION_RUNNER] [ARCH-TIED_ISOLATED_VERIFICATION_RUNNER] [REQ-TIED_ISOLATED_VERIFICATION_RUNNER]
 * How: Opt-in via tied-project/config.yaml verification.isolated_runner; default false preserves in-process runner.
 */
export function isIsolatedVerificationRunnerEnabled(projectRoot: string): boolean {
  const loaded = loadProjectConfig(projectRoot);
  if (!loaded) return false;
  const verification = loaded.record.verification;
  if (verification !== null && typeof verification === "object" && !Array.isArray(verification)) {
    const flag = (verification as Record<string, unknown>).isolated_runner;
    if (flag === true) return true;
  }
  return false;
}

function scrubbedChildEnv(
  declarationEnv: Record<string, string> | undefined,
): Record<string, string> {
  const base: Record<string, string> = {};
  if (process.env.PATH) base.PATH = process.env.PATH;
  if (process.env.NODE_OPTIONS) base.NODE_OPTIONS = process.env.NODE_OPTIONS;
  if (process.env.TZ) base.TZ = process.env.TZ;
  if (process.env.LANG) base.LANG = process.env.LANG;
  return { ...base, ...declarationEnv };
}

type RunnerChildPayload = QualityCommandRunnerInput;

type RunnerChildResponse =
  | { ok: true; command_results: VerificationCommandResult[] }
  | { ok: false; error: string };

function runRunnerChildProcess(
  entry: string,
  payload: RunnerChildPayload,
): Promise<RunnerChildResponse> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [entry], {
      env: scrubbedChildEnv(undefined),
      stdio: ["pipe", "pipe", "pipe"],
      shell: false,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });
    child.once("error", (error) => {
      resolve({ ok: false, error: `SPAWN_FAILED:${error.message}` });
    });
    child.once("close", (code) => {
      if (code !== 0) {
        resolve({
          ok: false,
          error: `RUNNER_EXIT_${code ?? 1}:${stderr.trim() || stdout.trim() || "no output"}`,
        });
        return;
      }
      try {
        const parsed = JSON.parse(stdout) as RunnerChildResponse;
        resolve(parsed);
      } catch {
        resolve({ ok: false, error: `RUNNER_JSON_PARSE:${stdout.slice(0, 200)}` });
      }
    });
    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}

/**
 * [IMPL-TIED_ISOLATED_VERIFICATION_RUNNER] [ARCH-TIED_ISOLATED_VERIFICATION_RUNNER] [REQ-TIED_ISOLATED_VERIFICATION_RUNNER]
 * How: Spawn dedicated runner entry; child reuses runDeclaredQualityCommands with bounded argv-only execution.
 */
export async function runDeclaredQualityCommandsWithRunnerPolicy(
  input: QualityCommandRunnerInput,
  options: { project_root?: string },
): Promise<{ command_results: VerificationCommandResult[]; execution_runner: ExecutionRunnerIdentity }> {
  const entry = resolveIsolatedRunnerEntry();
  const useIsolated =
    options.project_root !== undefined &&
    options.project_root.trim().length > 0 &&
    isIsolatedVerificationRunnerEnabled(options.project_root);

  if (!useIsolated) {
    const command_results = await runDeclaredQualityCommands(input);
    return {
      command_results,
      execution_runner: { mode: "in_process", entry: "quality-command-runner" },
    };
  }

  if (!fs.existsSync(entry)) {
    throw new Error(`ISOLATED_RUNNER_MISSING:${entry}`);
  }

  const response = await runRunnerChildProcess(entry, input);
  if (!response.ok) {
    throw new Error(response.error);
  }
  return {
    command_results: response.command_results,
    execution_runner: { mode: "isolated_subprocess", entry },
  };
}

/** CLI entry: read JSON payload from stdin, execute commands, write JSON to stdout. */
export async function runIsolatedVerificationRunnerMain(): Promise<number> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    process.stdout.write(JSON.stringify({ ok: false, error: "EMPTY_STDIN" }));
    return 1;
  }
  let payload: QualityCommandRunnerInput;
  try {
    payload = JSON.parse(raw) as QualityCommandRunnerInput;
  } catch {
    process.stdout.write(JSON.stringify({ ok: false, error: "INVALID_STDIN_JSON" }));
    return 1;
  }
  try {
    const command_results = await runDeclaredQualityCommands(payload);
    process.stdout.write(JSON.stringify({ ok: true, command_results }));
    return 0;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    process.stdout.write(JSON.stringify({ ok: false, error: msg }));
    return 1;
  }
}
