import { spawn } from "node:child_process";
import path from "node:path";

export type BoundedAssuranceInput = {
  id: string;
  argv: readonly string[];
  cwd: string;
  projectRoot: string;
  timeoutMs?: number;
  maxOutputBytes?: number;
  redact?: readonly string[];
  seed?: string;
  threshold?: string;
  toolVersion?: string;
};

export type BoundedAssuranceResult = {
  id: string;
  status: "passed" | "failed" | "unresolved";
  exitCode?: number;
  stdout: string;
  stderr: string;
  diagnostics: string[];
  cwd: string;
  argv: string[];
  seed?: string;
  threshold?: string;
  toolVersion?: string;
};

export type FaultPoint = "trigger" | "callee" | "arguments" | "effects" | "ordering" | "failure";

export type ControlledFaultInput = {
  id: string;
  point: FaultPoint;
  expectedOutcome: "failed" | "passed";
  observedOutcome: "failed" | "passed" | "not_applicable";
  limitation?: string;
};

export type ControlledFaultResult = {
  id: string;
  point: FaultPoint;
  status: "detected" | "escaped" | "not_applicable" | "invalid";
  limitation?: string;
};

const DEFAULT_TIMEOUT_MS = 120_000;
const DEFAULT_MAX_OUTPUT_BYTES = 1_000_000;
const SHELL_EXECUTABLES = new Set(["sh", "bash", "zsh", "fish", "cmd", "powershell", "pwsh"]);

function isWithin(root: string, candidate: string): boolean {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function redactOutput(value: string, secrets: readonly string[]): string {
  return secrets.filter(Boolean).reduce(
    (result, secret) => result.split(secret).join("[REDACTED]"),
    value,
  );
}

// [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
// How: execute declared argv with bounded capture and fail closed for shell commands or unsafe scope.
export async function runBoundedAssurance(
  input: BoundedAssuranceInput,
): Promise<BoundedAssuranceResult> {
  const timeoutMs = input.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxOutputBytes = input.maxOutputBytes ?? DEFAULT_MAX_OUTPUT_BYTES;
  const base = {
    id: input.id,
    stdout: "",
    stderr: "",
    diagnostics: [] as string[],
    cwd: path.resolve(input.cwd),
    argv: input.argv.map((part) => part.trim()),
    seed: input.seed,
    threshold: input.threshold,
    toolVersion: input.toolVersion,
  };
  if (!input.id.trim() || input.argv.length === 0 || input.argv.some((part) => !part.trim())) {
    return { ...base, status: "unresolved", diagnostics: ["invalid_declaration"] };
  }
  if (timeoutMs <= 0 || maxOutputBytes <= 0) {
    return { ...base, status: "unresolved", diagnostics: ["invalid_limits"] };
  }
  const executable = path.basename(input.argv[0]!);
  if (SHELL_EXECUTABLES.has(executable) || input.argv.some((part) => part === "-c" || part === "/c")) {
    return { ...base, status: "unresolved", diagnostics: ["unsupported_command"] };
  }
  if (!isWithin(input.projectRoot, input.cwd)) {
    return { ...base, status: "unresolved", diagnostics: ["unsafe_cwd"] };
  }

  return new Promise((resolve) => {
    const child = spawn(input.argv[0]!, input.argv.slice(1), {
      cwd: input.cwd,
      env: process.env,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let outputLimited = false;
    let timedOut = false;
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
    const finish = (exitCode: number | undefined, spawnError?: string): void => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      const diagnostics: string[] = [];
      if (timedOut) diagnostics.push("timeout");
      if (outputLimited) diagnostics.push("output_limit");
      if (spawnError) diagnostics.push("spawn_error");
      resolve({
        ...base,
        status: exitCode === 0 && diagnostics.length === 0 ? "passed" : "failed",
        exitCode,
        stdout: redactOutput(stdout, input.redact ?? []),
        stderr: redactOutput(stderr, input.redact ?? []),
        diagnostics,
      });
    };
    child.stdout.on("data", (chunk: Buffer | string) => append("stdout", chunk));
    child.stderr.on("data", (chunk: Buffer | string) => append("stderr", chunk));
    child.once("error", (error) => finish(undefined, error.message));
    child.once("close", (code) => finish(code ?? 1));
    timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, timeoutMs);
  });
}

// [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
// How: evaluate controlled trigger, callee, argument, effect, ordering, and failure faults with explicit N/A limits.
export function evaluateControlledFault(input: ControlledFaultInput): ControlledFaultResult {
  if (!input.id.trim()) return { id: input.id, point: input.point, status: "invalid" };
  if (input.observedOutcome === "not_applicable") {
    return input.limitation?.trim()
      ? { id: input.id, point: input.point, status: "not_applicable", limitation: input.limitation.trim() }
      : { id: input.id, point: input.point, status: "invalid" };
  }
  return {
    id: input.id,
    point: input.point,
    status: input.observedOutcome === input.expectedOutcome ? "detected" : "escaped",
  };
}
