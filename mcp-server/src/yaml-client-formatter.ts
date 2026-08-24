/**
 * [IMPL-TIED_YAML_STYLE_RESOLVER] [ARCH-TIED_YAML_STYLE_RESOLUTION] [REQ-TIED_YAML_STYLE_CONFIGURATION]
 * Summary: Fail-closed client_formatter hook runner for presentation-only post-canonical YAML styling.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import yaml from "js-yaml";
import {
  getDefaultTiedBasePath,
  resolveClientFormatter,
  resolveYamlStyle,
  type ClientFormatterDeclaration,
  type ResolvedClientFormatter,
  type ResolvedYamlStyle,
  type StylingStatus,
} from "./yaml-style-config.js";
import { formatYamlMetadata, type YamlFormatMetadata } from "./yaml-canonicalizer.js";

export const DEFAULT_FORMATTER_TIMEOUT_MS = 30_000;
export const DEFAULT_FORMATTER_MAX_OUTPUT_BYTES = 1_000_000;

export type ClientFormatterErrorCode =
  | "PATH_OUT_OF_SCOPE"
  | "METHODOLOGY_PATH_FORBIDDEN"
  | "SPAWN_FAILED"
  | "TIMEOUT"
  | "NONZERO_EXIT"
  | "INVALID_POST_HOOK_YAML"
  | "SEMANTIC_DRIFT"
  | "NON_IDEMPOTENT_OUTPUT"
  | "CONFIG_ERROR";

export class YamlClientFormatterError extends Error {
  readonly code: ClientFormatterErrorCode;

  constructor(code: ClientFormatterErrorCode, message: string) {
    super(message);
    this.name = "YamlClientFormatterError";
    this.code = code;
  }
}

export type ClientFormatterHookSuccess = {
  ok: true;
  styling_status: "configured";
  command: string;
  version?: string;
  semantic_compare_ok: true;
  idempotent: true;
};

export type ClientFormatterHookNotConfigured = {
  ok: true;
  styling_status: "not_configured";
};

export type ClientFormatterHookFailure = {
  ok: false;
  error: string;
  code: ClientFormatterErrorCode;
};

export type ClientFormatterHookResult =
  | ClientFormatterHookSuccess
  | ClientFormatterHookNotConfigured
  | ClientFormatterHookFailure;

export type StylingEvidence = YamlFormatMetadata & {
  styling_status: StylingStatus;
  client_formatter?: {
    command: string;
    version?: string;
  };
};

type SpawnCapture = {
  exit_code: number;
  stdout: string;
  stderr: string;
  timed_out: boolean;
  output_limited: boolean;
  spawn_error?: string;
};

export type ClientFormatterRunnerDeps = {
  tiedBasePath?: string;
  repoRoot?: string;
  scriptsRoot?: string;
  semanticCompareScript?: string;
  timeoutMs?: number;
  maxOutputBytes?: number;
};

function tiedRepoRoot(): string {
  return path.resolve(import.meta.dirname, "../..");
}

function repoRootFromTiedBase(tiedBasePath: string): string {
  return path.dirname(path.resolve(tiedBasePath));
}

function defaultSemanticCompareScript(): string {
  const libraryPath = path.join(tiedRepoRoot(), "scripts", "yaml_semantic_compare.rb");
  return `
load ${JSON.stringify(libraryPath)}
left = YamlLoader.load(ARGV[0])
right = YamlLoader.load(ARGV[1])
result = YamlSemanticCompare.compare(left, right)
unless result.ok
  result.differences.each { |line| warn line }
end
exit(result.ok ? 0 : 1)
`.trim();
}

// [IMPL-TIED_YAML_STYLE_RESOLVER] [ARCH-TIED_YAML_STYLE_RESOLUTION] [REQ-TIED_YAML_STYLE_CONFIGURATION] [REQ-TIED_YAML_CANONICALIZATION]
// How: Allow hook targets only under project-owned tiedBasePath and never under tied/methodology/**.
export function guardProjectTiedPath(absolutePath: string, tiedBasePath: string): string {
  const normalized = path.resolve(absolutePath);
  const tiedRoot = path.resolve(tiedBasePath);
  const methodologyRoot = path.join(tiedRoot, "methodology");
  const tiedPrefix = tiedRoot.endsWith(path.sep) ? tiedRoot : `${tiedRoot}${path.sep}`;
  const methodologyPrefix = methodologyRoot.endsWith(path.sep)
    ? methodologyRoot
    : `${methodologyRoot}${path.sep}`;

  if (normalized !== tiedRoot && !normalized.startsWith(tiedPrefix)) {
    throw new YamlClientFormatterError(
      "PATH_OUT_OF_SCOPE",
      `Path ${normalized} is outside project-owned tied directory ${tiedRoot}.`,
    );
  }
  if (normalized === methodologyRoot || normalized.startsWith(methodologyPrefix)) {
    throw new YamlClientFormatterError(
      "METHODOLOGY_PATH_FORBIDDEN",
      `Path ${normalized} is under read-only tied/methodology/.`,
    );
  }
  return normalized;
}

function buildFormatterArgv(formatter: ClientFormatterDeclaration, absoluteFilePath: string): string[] {
  return [formatter.command, ...formatter.args, absoluteFilePath];
}

function captureProcess(
  argv: string[],
  cwd: string,
  timeoutMs: number,
  maxOutputBytes: number,
): Promise<SpawnCapture> {
  return new Promise((resolve) => {
    const child = spawn(argv[0]!, argv.slice(1), {
      cwd,
      env: process.env,
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

async function runSpawn(
  argv: string[],
  cwd: string,
  timeoutMs: number,
  maxOutputBytes: number,
): Promise<SpawnCapture> {
  return captureProcess(argv, cwd, timeoutMs, maxOutputBytes);
}

function restoreBytes(filePath: string, bytes: string): void {
  fs.writeFileSync(filePath, bytes, "utf8");
}

function parseableYaml(bytes: string): boolean {
  try {
    yaml.load(bytes);
    return true;
  } catch {
    return false;
  }
}

async function compareSemanticYaml(
  preBytes: string,
  postBytes: string,
  scriptsRoot: string,
  semanticCompareScript: string,
  timeoutMs: number,
  maxOutputBytes: number,
): Promise<{ ok: boolean; detail: string }> {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-yaml-semantic-"));
  const leftPath = path.join(tempDir, "left.yaml");
  const rightPath = path.join(tempDir, "right.yaml");
  try {
    fs.writeFileSync(leftPath, preBytes, "utf8");
    fs.writeFileSync(rightPath, postBytes, "utf8");
    const capture = await runSpawn(
      ["ruby", "-e", semanticCompareScript, leftPath, rightPath],
      scriptsRoot,
      timeoutMs,
      maxOutputBytes,
    );
    if (capture.spawn_error) {
      return { ok: false, detail: capture.spawn_error };
    }
    if (capture.timed_out) {
      return { ok: false, detail: "semantic compare timed out" };
    }
    if (capture.exit_code !== 0) {
      const detail = capture.stderr.trim() || capture.stdout.trim() || "semantic compare failed";
      return { ok: false, detail };
    }
    return { ok: true, detail: "" };
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function spawnFailureCode(capture: SpawnCapture): ClientFormatterErrorCode {
  if (capture.spawn_error) return "SPAWN_FAILED";
  if (capture.timed_out || capture.output_limited) return "TIMEOUT";
  return "NONZERO_EXIT";
}

function spawnFailureMessage(capture: SpawnCapture): string {
  if (capture.spawn_error) return capture.spawn_error;
  if (capture.timed_out) return "Formatter hook timed out.";
  if (capture.output_limited) return "Formatter hook output exceeded capture limit.";
  const detail = capture.stderr.trim() || capture.stdout.trim();
  return detail.length > 0 ? detail : `Formatter hook exited with code ${capture.exit_code}.`;
}

// [IMPL-TIED_YAML_STYLE_RESOLVER] [ARCH-TIED_YAML_STYLE_RESOLUTION] [REQ-TIED_YAML_STYLE_CONFIGURATION] [REQ-MODULE_VALIDATION]
// How: Capture pre-hook bytes, spawn declared formatter in-place, validate parse + semantic compare + idempotence.
export async function runClientFormatterHook(
  filePath: string,
  deps: ClientFormatterRunnerDeps = {},
): Promise<ClientFormatterHookResult> {
  const tiedBasePath = deps.tiedBasePath ?? getDefaultTiedBasePath();
  const repoRoot = deps.repoRoot ?? repoRootFromTiedBase(tiedBasePath);
  const scriptsRoot = deps.scriptsRoot ?? tiedRepoRoot();
  const timeoutMs = deps.timeoutMs ?? DEFAULT_FORMATTER_TIMEOUT_MS;
  const maxOutputBytes = deps.maxOutputBytes ?? DEFAULT_FORMATTER_MAX_OUTPUT_BYTES;
  const semanticCompareScript =
    deps.semanticCompareScript ?? defaultSemanticCompareScript();

  let guardedPath: string;
  try {
    guardedPath = guardProjectTiedPath(filePath, tiedBasePath);
  } catch (error) {
    if (error instanceof YamlClientFormatterError) {
      return { ok: false, error: error.message, code: error.code };
    }
    throw error;
  }

  let resolved: ResolvedClientFormatter;
  try {
    resolved = resolveClientFormatter(tiedBasePath);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      code: "CONFIG_ERROR",
    };
  }

  if (resolved.styling_status === "not_configured" || !resolved.formatter) {
    return { ok: true, styling_status: "not_configured" };
  }

  const preBytes = fs.readFileSync(guardedPath, "utf8");
  const argv = buildFormatterArgv(resolved.formatter, guardedPath);
  const firstSpawn = await runSpawn(argv, repoRoot, timeoutMs, maxOutputBytes);
  if (firstSpawn.spawn_error || firstSpawn.exit_code !== 0 || firstSpawn.timed_out || firstSpawn.output_limited) {
    restoreBytes(guardedPath, preBytes);
    return {
      ok: false,
      error: spawnFailureMessage(firstSpawn),
      code: spawnFailureCode(firstSpawn),
    };
  }

  const postBytes = fs.readFileSync(guardedPath, "utf8");
  if (!parseableYaml(postBytes)) {
    restoreBytes(guardedPath, preBytes);
    return {
      ok: false,
      error: "Post-hook YAML does not parse.",
      code: "INVALID_POST_HOOK_YAML",
    };
  }

  const semantic = await compareSemanticYaml(
    preBytes,
    postBytes,
    scriptsRoot,
    semanticCompareScript,
    timeoutMs,
    maxOutputBytes,
  );
  if (!semantic.ok) {
    restoreBytes(guardedPath, preBytes);
    return {
      ok: false,
      error: `Semantic compare failed: ${semantic.detail}`,
      code: "SEMANTIC_DRIFT",
    };
  }

  const secondSpawn = await runSpawn(argv, repoRoot, timeoutMs, maxOutputBytes);
  if (secondSpawn.spawn_error || secondSpawn.exit_code !== 0 || secondSpawn.timed_out || secondSpawn.output_limited) {
    restoreBytes(guardedPath, preBytes);
    return {
      ok: false,
      error: spawnFailureMessage(secondSpawn),
      code: spawnFailureCode(secondSpawn),
    };
  }

  const secondBytes = fs.readFileSync(guardedPath, "utf8");
  if (secondBytes !== postBytes) {
    restoreBytes(guardedPath, preBytes);
    return {
      ok: false,
      error: "Second hook pass changed bytes; formatter is not idempotent.",
      code: "NON_IDEMPOTENT_OUTPUT",
    };
  }

  return {
    ok: true,
    styling_status: "configured",
    command: resolved.formatter.command,
    ...(resolved.formatter.version ? { version: resolved.formatter.version } : {}),
    semantic_compare_ok: true,
    idempotent: true,
  };
}

// [IMPL-TIED_YAML_STYLE_RESOLVER] [ARCH-TIED_YAML_STYLE_RESOLUTION] [REQ-TIED_YAML_STYLE_CONFIGURATION]
// How: Expose styling_status and formatter provenance alongside existing yaml_format metadata.
export function reportStylingEvidence(
  hookResult: ClientFormatterHookResult,
  resolvedStyle: ResolvedYamlStyle = resolveYamlStyle(getDefaultTiedBasePath()),
): StylingEvidence {
  const yamlFormat = formatYamlMetadata(resolvedStyle);
  if (hookResult.ok && hookResult.styling_status === "not_configured") {
    return {
      ...yamlFormat,
      styling_status: "not_configured",
    };
  }
  if (hookResult.ok && hookResult.styling_status === "configured") {
    return {
      ...yamlFormat,
      styling_status: "configured",
      client_formatter: {
        command: hookResult.command,
        ...(hookResult.version ? { version: hookResult.version } : {}),
      },
    };
  }
  return {
    ...yamlFormat,
    styling_status: "not_configured",
  };
}
