/**
 * [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
 * Summary: Spawn Go adherence-reconcile binary and parse read-only ReconcileReport JSON from stdout.
 */

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

export type ReconcileFinding = {
  code: string;
  detail?: Record<string, unknown>;
};

export type ReconcileReport = {
  request_token?: string;
  findings: ReconcileFinding[];
  ledger_rows: number;
  read_only: true;
};

export type ReconcileRunInput = {
  ledger_path: string;
  tracker_path: string;
  gates_dir: string;
  workspace: string;
  citdp_path?: string;
  requirements_index?: string;
  implementation_index?: string;
  repo_root?: string;
};

type ProcessCapture = {
  exit_code: number;
  stdout: string;
  stderr: string;
  spawn_error?: string;
};

function findRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, "AGENTS.md")) && fs.existsSync(path.join(dir, "tools", "agentstream"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error("repo root not found");
    }
    dir = parent;
  }
}

export function resolveAdherenceReconcileArgv(repoRoot?: string): { argv: string[]; cwd: string } {
  const root = repoRoot ?? findRepoRoot(process.cwd());
  const dedicated = process.env.ADHERENCE_RECONCILE_BIN?.trim();
  if (dedicated && fs.existsSync(dedicated)) {
    return { argv: [dedicated], cwd: root };
  }
  const agentstreamBin = process.env.AGENTSTREAM_BIN?.trim();
  if (agentstreamBin && fs.existsSync(agentstreamBin)) {
    // Plan allows AGENTSTREAM_BIN when it points at the reconcile binary build.
    const sibling = path.join(path.dirname(agentstreamBin), "adherence-reconcile");
    if (fs.existsSync(sibling)) {
      return { argv: [sibling], cwd: root };
    }
  }
  const built = path.join(root, "tools/agentstream/adherence-reconcile");
  if (fs.existsSync(built)) {
    return { argv: [built], cwd: root };
  }
  return {
    argv: ["go", "run", "./cmd/adherence-reconcile"],
    cwd: path.join(root, "tools/agentstream"),
  };
}

function captureProcess(argv: string[], cwd: string, args: string[]): Promise<ProcessCapture> {
  return new Promise((resolve) => {
    const child = spawn(argv[0]!, [...argv.slice(1), ...args], {
      cwd,
      env: process.env,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
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
      resolve({ exit_code: 127, stdout, stderr, spawn_error: error.message });
    });
    child.once("close", (code) => {
      resolve({ exit_code: code ?? 1, stdout, stderr });
    });
  });
}

export async function runAdherenceReconcile(input: ReconcileRunInput): Promise<{
  ok: boolean;
  report?: ReconcileReport;
  error?: string;
  diagnostics?: string[];
}> {
  const workspace = input.workspace.trim() || process.cwd();
  const { argv, cwd } = resolveAdherenceReconcileArgv(input.repo_root);
  const args = [
    "--ledger", input.ledger_path,
    "--tracker", input.tracker_path,
    "--gates-dir", input.gates_dir,
    "--workspace", workspace,
  ];
  if (input.citdp_path?.trim()) args.push("--citdp", input.citdp_path);
  if (input.requirements_index?.trim()) args.push("--requirements-index", input.requirements_index);
  if (input.implementation_index?.trim()) args.push("--implementation-index", input.implementation_index);

  const capture = await captureProcess(argv, cwd, args);
  const diagnostics: string[] = [];
  if (capture.spawn_error) {
    return { ok: false, error: capture.spawn_error, diagnostics: ["spawn_error"] };
  }
  if (capture.exit_code !== 0) {
    diagnostics.push(`exit_code:${capture.exit_code}`);
    if (capture.stderr.trim()) diagnostics.push(capture.stderr.trim());
    return { ok: false, error: "reconcile_cli_failed", diagnostics };
  }

  let report: ReconcileReport;
  try {
    report = JSON.parse(capture.stdout) as ReconcileReport;
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      diagnostics: ["stdout_parse_failure"],
    };
  }
  if (report.read_only !== true) {
    return { ok: false, error: "read_only_contract_violation", diagnostics: ["read_only_not_true"] };
  }
  return { ok: true, report };
}
