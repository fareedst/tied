/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-GOAGENT-EXECUTOR] [REQ-TIED_UNIFIED_TOOLCHAIN]
 * TS-native executor dry-run (Go cmd/agentstream runDryRun parity, slice 2a).
 */
import type { DryRunConfig } from "./dry-run-config.js";
import type { Turn } from "./checklist-load-turns.js";
import { chainBetween, sessionForTurn } from "./pipeline-session.js";
import { buildTurnsFromConfig } from "./run-pipeline-prep.js";
import {
  ERR_NOT_FOUND,
  ErrAmbiguous,
  Status,
  analyze,
  RuntimeMCPNotice,
} from "./tiedpreflight.js";
import {
  defaultAgentBinForHarness,
  type AgentHarnessProfile,
} from "./harness-select.js";

export type DryRunStreams = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

export function agentArgv(
  agentPath: string,
  workspace: string,
  model: string,
  resumeId: string,
  parts: string[],
  harness: AgentHarnessProfile = "cursor",
): string[] {
  const bin =
    agentPath.trim() !== "" ? agentPath : defaultAgentBinForHarness(harness);
  const m = model.trim() !== "" ? model : "Auto";
  if (harness === "claude") {
    // Claude Code CLI (2.x): stream-json requires --verbose; no --trust/--force/--workspace.
    const cmd: string[] = [
      bin,
      "--print",
      "--verbose",
      "--output-format",
      "stream-json",
    ];
    if (m !== "" && m !== "Auto") {
      cmd.push("--model", m);
    }
    if (resumeId !== "") {
      cmd.push("--resume", resumeId);
    }
    cmd.push(...parts);
    return cmd;
  }
  const cmd: string[] = [
    bin,
    "--print",
    "--output-format",
    "stream-json",
    "--model",
    m,
    "--trust",
    "--force",
  ];
  if (workspace !== "") {
    cmd.push("--workspace", workspace);
  }
  if (resumeId !== "") {
    cmd.push("--resume", resumeId);
  }
  cmd.push(...parts);
  return cmd;
}

function formatShellArgv(argv: string[]): string {
  return argv.map((a) => JSON.stringify(a)).join(" ");
}

const CHAINED_TURNS_MSG =
  "dry-run: chained turns use --resume with the session_id from the previous turn; each " +
  "--feature-spec-batch-yaml record after a prior turn omits --resume (new session). " +
  "--prompt-file content is prepended on every new session (not a separate turn). " +
  "An initial --session-id only applies to turn 1.\n";

export function renderDryRun(
  cfg: DryRunConfig,
  turns: Turn[],
  chain: boolean[],
  firstTurn: number,
  originalTotal: number,
): { stdout: string; stderr: string } {
  const out: string[] = [];
  const err: string[] = [];
  let displaySession = cfg.sessionId;

  for (let i = 0; i < turns.length; i++) {
    const t = turns[i]!;
    const sess = sessionForTurn(i, cfg.sessionId, chain, displaySession);
    let label = " (new session)";
    if (sess !== "") {
      label = ` (resume ${sess})`;
    }
    let stub = "";
    if (t.stepStub !== "") {
      stub = ` [${t.stepStub}]`;
    }
    err.push(
      `\n--- turn ${firstTurn + i}/${originalTotal}${label}${stub} ---\n`,
    );

    const n = t.parts.length;
    for (let j = 0; j < n; j++) {
      out.push(`--- argv part ${j + 1}/${n} ---\n`);
      out.push(`${t.parts[j]}\n`);
    }
    const argv = agentArgv(
      cfg.agentPath,
      cfg.workspace,
      cfg.model,
      sess,
      t.parts,
      cfg.agentHarness,
    );
    out.push(`command: ${formatShellArgv(argv)}\n`);
    if (i === 0 && turns.length > 1) {
      err.push(CHAINED_TURNS_MSG);
    }
    if (i < chain.length && chain[i]!) {
      displaySession = "<session_id_from_previous_turn>";
    }
  }

  return { stdout: out.join(""), stderr: err.join("") };
}

function printTiedPreflightReport(res: ReturnType<typeof analyze>): string[] {
  const lines: string[] = [];
  lines.push(
    `DEBUG: tied-yaml preflight: mcp.json=${res.mcpJsonPath} TIED_BASE_PATH=${JSON.stringify(res.tiedBasePath)} status=${res.status}\n`,
  );
  for (const e of res.errors) {
    lines.push(`DIAGNOSTIC: tied-yaml preflight error: ${e}\n`);
  }
  for (const w of res.warnings) {
    lines.push(`DIAGNOSTIC: tied-yaml preflight warning: ${w}\n`);
  }
  lines.push(`DIAGNOSTIC: ${res.runtimeNotice}\n`);
  return lines;
}

export function runTiedPreflight(cfg: DryRunConfig): { exitCode: number; stderr: string } {
  if (skipTiedMcpPreflight(cfg)) {
    return { exitCode: 0, stderr: "" };
  }
  try {
    const res = analyze(cfg.workspace, cfg.mcpJsonPath);
    const diag = printTiedPreflightReport(res);
    switch (res.status) {
      case Status.OK:
        return { exitCode: 0, stderr: diag.join("") };
      case Status.Warning:
        return tiedPreflightConfirm(
          cfg,
          true,
          "Warnings above. Proceed without addressing them? [y/N] ",
          diag.join(""),
        );
      case Status.Blocked:
        return tiedPreflightConfirm(
          cfg,
          false,
          "tied-yaml MCP config is missing or unsafe. Continue anyway? [y/N] ",
          diag.join(""),
        );
      default:
        return { exitCode: 0, stderr: diag.join("") };
    }
  } catch (err) {
    return tiedPreflightLocateFailure(cfg, err);
  }
}

function skipTiedMcpPreflight(cfg: DryRunConfig): boolean {
  return cfg.skipTiedMcpPreflight;
}

function tiedPreflightLocateFailure(
  cfg: DryRunConfig,
  err: unknown,
): { exitCode: number; stderr: string } {
  const lines: string[] = [];
  if (err instanceof Error && err.message === ERR_NOT_FOUND) {
    lines.push(
      `DIAGNOSTIC: tied-yaml preflight: no .cursor/mcp.json under workspace ${cfg.workspace}\n`,
    );
    lines.push(
      "DIAGNOSTIC: fix: add tied-yaml under mcpServers in .cursor/mcp.json if you use MCP in Cursor, or pass --mcp-json PATH; copy_files.sh installs .cursor/skills/tied-yaml only (no mcp.json)\n",
    );
    if (cfg.dryRun) {
      lines.push(
        "DEBUG: dry-run: would prompt or exit non-zero (use -y or --skip-tied-mcp-preflight to bypass)\n",
      );
      return { exitCode: 0, stderr: lines.join("") };
    }
    if (cfg.assumeTiedMcpYes) {
      lines.push("DIAGNOSTIC: continuing because -y / --yes was set\n");
      return { exitCode: 0, stderr: lines.join("") };
    }
    lines.push(
      "DIAGNOSTIC: non-interactive session: exiting (use -y, --skip-tied-mcp-preflight, or AGENTSTREAM_SKIP_TIED_MCP_PREFLIGHT=1)\n",
    );
    return { exitCode: 1, stderr: lines.join("") };
  }
  if (err instanceof ErrAmbiguous) {
    lines.push(`DIAGNOSTIC: ${err.message}\n`);
    if (cfg.dryRun) {
      lines.push("DEBUG: dry-run: would exit non-zero (pass --mcp-json PATH)\n");
      return { exitCode: 0, stderr: lines.join("") };
    }
    return { exitCode: 1, stderr: lines.join("") };
  }
  lines.push(`DIAGNOSTIC: tied-yaml preflight: ${String(err)}\n`);
  if (cfg.dryRun) {
    return { exitCode: 0, stderr: lines.join("") };
  }
  return { exitCode: 1, stderr: lines.join("") };
}

function tiedPreflightConfirm(
  cfg: DryRunConfig,
  warningOnly: boolean,
  question: string,
  prefix: string,
): { exitCode: number; stderr: string } {
  const lines = [prefix];
  if (cfg.dryRun) {
    lines.push(
      `DEBUG: dry-run: would prompt: ${question.trim()} (use -y or --skip-tied-mcp-preflight to bypass)\n`,
    );
    return { exitCode: 0, stderr: lines.join("") };
  }
  if (cfg.assumeTiedMcpYes) {
    lines.push("DIAGNOSTIC: continuing because -y / --yes was set\n");
    return { exitCode: 0, stderr: lines.join("") };
  }
  if (warningOnly) {
    return { exitCode: 0, stderr: lines.join("") };
  }
  lines.push(
    "DIAGNOSTIC: non-interactive session: exiting (use -y, --skip-tied-mcp-preflight, or AGENTSTREAM_SKIP_TIED_MCP_PREFLIGHT=1)\n",
  );
  return { exitCode: 1, stderr: lines.join("") };
}

/** Execute TS-native dry-run; throws on config/build errors (caller maps to exit 2). */
export function executeExecutorDryRun(cfg: DryRunConfig): DryRunStreams {
  if (cfg.firstTurn > 1 && cfg.sessionId.trim() === "") {
    throw new Error("agentstream: --first-turn > 1 requires --session-id");
  }

  const { turns, originalTotal } = buildTurnsFromConfig(cfg);
  const chain = chainBetween(turns);
  const pre = runTiedPreflight(cfg);
  if (pre.exitCode !== 0) {
    return { stdout: "", stderr: pre.stderr, exitCode: pre.exitCode };
  }

  const rendered = renderDryRun(cfg, turns, chain, cfg.firstTurn, originalTotal);
  return {
    stdout: rendered.stdout,
    stderr: pre.stderr + rendered.stderr,
    exitCode: 0,
  };
}

export { RuntimeMCPNotice };
