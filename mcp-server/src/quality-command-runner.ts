/**
 * [IMPL-QUALITY_EVIDENCE_COMMAND_RUNNER] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
 * Summary: Execute declared quality commands without a shell and retain bounded provenance artifacts.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import type { VerificationCommandResult } from "./quality-evidence.js";

export type QualityCommandDeclaration = {
  id: string;
  argv: string[];
  cwd: string;
  environment?: Record<string, string>;
  timeout_ms?: number;
  max_output_bytes?: number;
  artifact_dir: string;
  threshold?: string;
  tool_version_argv?: string[];
  tool_version_name?: string;
};

export type QualityCommandRunnerInput = {
  commands: QualityCommandDeclaration[];
  default_timeout_ms?: number;
  default_max_output_bytes?: number;
};

type ProcessCapture = {
  exit_code: number;
  stdout: string;
  stderr: string;
  timed_out: boolean;
  output_limited: boolean;
  spawn_error?: string;
};

const DEFAULT_TIMEOUT_MS = 120_000;
const DEFAULT_MAX_OUTPUT_BYTES = 1_000_000;

function validateDeclaration(declaration: QualityCommandDeclaration): void {
  if (!declaration.id.trim() || declaration.argv.length === 0 || declaration.argv.some((part) => !part.trim())) {
    throw new Error("INVALID_DECLARATION: id and non-empty argv are required");
  }
  if (!declaration.cwd.trim() || !declaration.artifact_dir.trim()) {
    throw new Error("INVALID_DECLARATION: cwd and artifact_dir are required");
  }
  if (declaration.timeout_ms !== undefined && declaration.timeout_ms <= 0) {
    throw new Error("INVALID_DECLARATION: timeout_ms must be positive");
  }
  if (declaration.max_output_bytes !== undefined && declaration.max_output_bytes <= 0) {
    throw new Error("INVALID_DECLARATION: max_output_bytes must be positive");
  }
}

function captureProcess(
  argv: string[],
  cwd: string,
  environment: Record<string, string> | undefined,
  timeoutMs: number,
  maxOutputBytes: number,
): Promise<ProcessCapture> {
  return new Promise((resolve) => {
    const child = spawn(argv[0]!, argv.slice(1), {
      cwd,
      env: { ...process.env, ...environment },
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let outputLimited = false;
    let settled = false;
    let timer: NodeJS.Timeout | undefined;

    const append = (target: "stdout" | "stderr", chunk: Buffer | string): void => {
      const text = chunk.toString();
      const currentBytes = Buffer.byteLength(stdout) + Buffer.byteLength(stderr);
      const remaining = maxOutputBytes - currentBytes;
      if (remaining <= 0) {
        outputLimited = true;
        child.kill("SIGTERM");
        return;
      }
      const bounded = Buffer.from(text).subarray(0, remaining).toString();
      if (target === "stdout") stdout += bounded;
      else stderr += bounded;
      if (bounded.length < text.length) {
        outputLimited = true;
        child.kill("SIGTERM");
      }
    };

    const finish = (exitCode: number, spawnError?: string): void => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      resolve({
        exit_code: exitCode,
        stdout,
        stderr,
        timed_out: timedOut,
        output_limited: outputLimited,
        spawn_error: spawnError,
      });
    };

    child.stdout.on("data", (chunk: Buffer | string) => append("stdout", chunk));
    child.stderr.on("data", (chunk: Buffer | string) => append("stderr", chunk));
    child.once("error", (error) => finish(127, error.message));
    child.once("close", (code) => finish(code ?? 1));
    timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, timeoutMs);
  });
}

function artifactStem(id: string): string {
  return id.replace(/[^A-Za-z0-9._-]+/g, "_");
}

/**
 * [IMPL-QUALITY_EVIDENCE_COMMAND_RUNNER] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
 * How: Validate declarations, execute each argv independently, and return bounded results.
 */
export async function runDeclaredQualityCommands(
  input: QualityCommandRunnerInput,
): Promise<VerificationCommandResult[]> {
  // [IMPL-QUALITY_EVIDENCE_COMMAND_RUNNER] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
  // How: Validate every declaration before executing the declared command set.
  for (const declaration of input.commands) validateDeclaration(declaration);

  const timeoutDefault = input.default_timeout_ms ?? DEFAULT_TIMEOUT_MS;
  const outputDefault = input.default_max_output_bytes ?? DEFAULT_MAX_OUTPUT_BYTES;
  if (timeoutDefault <= 0 || outputDefault <= 0) {
    throw new Error("INVALID_DECLARATION: default limits must be positive");
  }

  const results: VerificationCommandResult[] = [];
  for (const declaration of input.commands) {
    // [IMPL-QUALITY_EVIDENCE_COMMAND_RUNNER] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
    // How: Execute one argv without a shell, enforce timeout/output bounds, and retain diagnostics.
    const started = Date.now();
    const maxOutputBytes = declaration.max_output_bytes ?? outputDefault;
    const capture = await captureProcess(
      declaration.argv,
      declaration.cwd,
      declaration.environment,
      declaration.timeout_ms ?? timeoutDefault,
      maxOutputBytes,
    );
    const artifactDirectory = path.resolve(declaration.artifact_dir);
    await mkdir(artifactDirectory, { recursive: true });
    const stem = artifactStem(declaration.id);
    const stdoutPath = path.join(artifactDirectory, `${stem}.stdout.txt`);
    const stderrPath = path.join(artifactDirectory, `${stem}.stderr.txt`);
    await writeFile(stdoutPath, capture.stdout, "utf8");
    await writeFile(stderrPath, capture.stderr, "utf8");

    const diagnostics: string[] = [];
    if (capture.timed_out) diagnostics.push("TIMEOUT");
    if (capture.output_limited) diagnostics.push(`OUTPUT_LIMIT:${maxOutputBytes}`);
    if (capture.spawn_error) diagnostics.push(`SPAWN_FAILED:${capture.spawn_error}`);
    const toolVersions: Record<string, string> = {};
    if (declaration.tool_version_argv) {
      const versionCapture = await captureProcess(
        declaration.tool_version_argv,
        declaration.cwd,
        declaration.environment,
        declaration.timeout_ms ?? timeoutDefault,
        maxOutputBytes,
      );
      const version = versionCapture.stdout.trim().split(/\r?\n/u)[0]?.trim();
      if (versionCapture.exit_code === 0 && version) {
        toolVersions[declaration.tool_version_name ?? declaration.id] = version;
      } else {
        diagnostics.push("TOOL_VERSION_UNAVAILABLE");
      }
    }

    results.push({
      id: declaration.id.trim(),
      command: declaration.argv.map((part) => part.trim()),
      cwd: path.resolve(declaration.cwd),
      exit_code: capture.exit_code,
      result: capture.exit_code === 0 && diagnostics.every((diagnostic) => !diagnostic.startsWith("TIMEOUT") && !diagnostic.startsWith("OUTPUT_LIMIT") && !diagnostic.startsWith("SPAWN_FAILED"))
        ? "passed"
        : "failed",
      duration_ms: Date.now() - started,
      threshold: declaration.threshold,
      artifacts: [stdoutPath, stderrPath],
      diagnostics: diagnostics.length > 0 ? diagnostics : undefined,
      tool_versions: Object.keys(toolVersions).length > 0 ? toolVersions : undefined,
    });
  }
  return results;
}
