/**
 * [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION]
 * WIRE_AGENTSTREAM_DAE_GATE_PREFLIGHT — opt-in post-tiedpreflight gate check before first turn.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import yaml from "js-yaml";

import type { DryRunConfig } from "./dry-run-config.js";
import { trackerRequestTokenFromVars } from "./dry-run-config.js";
import { findRepoRootFromPath } from "./repo-root.js";
import { analyze, locateMcpJson } from "./tiedpreflight.js";

export type DaeGateSpawnResult = {
  status: number | null;
  stdout: string;
  stderr: string;
};

export type DaeGateSpawnFn = (input: {
  cliEntry: string;
  projectRoot: string;
  requestToken: string;
  tiedBasePath: string;
}) => DaeGateSpawnResult;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function readRepoTiedYaml(projectRoot: string): Record<string, unknown> | undefined {
  const configPath = path.join(projectRoot, ".tied-yaml.yaml");
  if (!fs.existsSync(configPath)) {
    return undefined;
  }
  try {
    const raw = yaml.load(fs.readFileSync(configPath, "utf8"));
    return isRecord(raw) ? raw : undefined;
  } catch {
    return undefined;
  }
}

function manifestEnablesDaeGate(projectRoot: string): boolean {
  const repo = readRepoTiedYaml(projectRoot);
  const dae = repo && isRecord(repo.dae) ? repo.dae : undefined;
  return dae?.agentstream_gate_check === true;
}

export function daeAgentstreamGateCheckEnabled(workspace: string): boolean {
  if (process.env.AGENTSTREAM_DAE_GATE_CHECK === "1") {
    return true;
  }
  const ws = path.resolve(workspace);
  if (manifestEnablesDaeGate(ws)) {
    return true;
  }
  const root = findRepoRootFromPath(workspace);
  if (root !== "" && path.resolve(root) !== ws) {
    return manifestEnablesDaeGate(root);
  }
  return false;
}

export function resolveBatchRequestToken(cfg: DryRunConfig): string {
  const fromVars = trackerRequestTokenFromVars(cfg.checklistVars);
  if (fromVars !== "") {
    return fromVars;
  }
  const trackerPath = cfg.checklistTrackerYaml.trim();
  if (trackerPath !== "" && fs.existsSync(trackerPath)) {
    try {
      const body = yaml.load(fs.readFileSync(trackerPath, "utf8"));
      if (isRecord(body)) {
        const direct = String(body.request_token ?? "").trim();
        if (direct !== "") {
          return direct;
        }
        const ee = body.execution_evidence;
        if (isRecord(ee)) {
          const req = ee.request;
          if (typeof req === "string" && req.trim() !== "") {
            return req.trim();
          }
        }
      }
    } catch {
      /* fall through */
    }
  }
  return "";
}

export function tiedCliEntryFromAgentstreamModule(moduleUrl: string): string {
  return path.join(
    path.dirname(fileURLToPath(moduleUrl)),
    "../../cli/dist/index.js",
  );
}

export function defaultDaeGateSpawn(input: {
  cliEntry: string;
  projectRoot: string;
  requestToken: string;
  tiedBasePath: string;
}): DaeGateSpawnResult {
  return spawnSync(
    process.execPath,
    [
      input.cliEntry,
      "gate",
      "check",
      "--request-token",
      input.requestToken,
      "--phase",
      "pre_implementation",
      "--project-root",
      input.projectRoot,
      "--json-only",
    ],
    {
      encoding: "utf8",
      env: { ...process.env, TIED_BASE_PATH: input.tiedBasePath },
      maxBuffer: 4 * 1024 * 1024,
    },
  );
}

function resolveProjectRoot(cfg: DryRunConfig, tiedBasePath: string): string {
  if (tiedBasePath.trim() !== "") {
    return path.resolve(tiedBasePath, "..");
  }
  const root = findRepoRootFromPath(cfg.workspace);
  return root !== "" ? root : path.resolve(cfg.workspace);
}

function formatGateCheckReport(
  requestToken: string,
  spawnResult: DaeGateSpawnResult,
): string[] {
  const lines: string[] = [];
  lines.push(
    `DEBUG: dae gate preflight: request_token=${JSON.stringify(requestToken)} exit=${String(spawnResult.status)}\n`,
  );
  const out = spawnResult.stdout.trim();
  if (out !== "") {
    lines.push(`DEBUG: dae gate preflight stdout: ${out.split("\n")[0]}\n`);
  }
  const err = spawnResult.stderr.trim();
  if (err !== "") {
    lines.push(`DIAGNOSTIC: dae gate preflight: ${err}\n`);
  }
  return lines;
}

/** Run optional DAE gate check after static tiedpreflight succeeded. */
export function runDaeGatePreflight(
  cfg: DryRunConfig,
  opts?: {
    spawn?: DaeGateSpawnFn;
    cliEntry?: string;
  },
): { exitCode: number; stderr: string } {
  if (!daeAgentstreamGateCheckEnabled(cfg.workspace)) {
    return { exitCode: 0, stderr: "" };
  }
  if (cfg.skipTiedMcpPreflight) {
    return {
      exitCode: 0,
      stderr:
        "DEBUG: dae gate preflight skipped because tied-yaml MCP preflight is skipped (gate check requires MCP; unset --skip-tied-mcp-preflight / AGENTSTREAM_SKIP_TIED_MCP_PREFLIGHT)\n",
    };
  }

  const requestToken = resolveBatchRequestToken(cfg);
  if (requestToken === "") {
    const msg =
      "DIAGNOSTIC: dae gate preflight: missing batch request_token (set --checklist-var REQUEST=REQ-… or use --checklist-tracker-yaml with request_token)\n";
    if (cfg.dryRun) {
      return {
        exitCode: 0,
        stderr: `${msg}DEBUG: dry-run: would exit 2 (use -y, --skip-tied-mcp-preflight, or AGENTSTREAM_SKIP_TIED_MCP_PREFLIGHT to bypass tied-yaml preflight; disable AGENTSTREAM_DAE_GATE_CHECK / dae.agentstream_gate_check to skip gate check)\n`,
      };
    }
    if (cfg.assumeTiedMcpYes) {
      return {
        exitCode: 0,
        stderr: `${msg}DIAGNOSTIC: continuing because -y / --yes was set\n`,
      };
    }
    return { exitCode: 2, stderr: msg };
  }

  let tiedBasePath = "";
  try {
    const mcpPath = cfg.mcpJsonPath.trim()
      ? cfg.mcpJsonPath
      : locateMcpJson(cfg.workspace, "");
    const pre = analyze(cfg.workspace, mcpPath);
    tiedBasePath = pre.tiedBasePath;
  } catch (err) {
    const msg = `DIAGNOSTIC: dae gate preflight: cannot resolve TIED_BASE_PATH (${String(err)})\n`;
    if (cfg.dryRun) {
      return {
        exitCode: 0,
        stderr: `${msg}DEBUG: dry-run: would exit 2 (use -y, --skip-tied-mcp-preflight, or AGENTSTREAM_SKIP_TIED_MCP_PREFLIGHT)\n`,
      };
    }
    if (cfg.assumeTiedMcpYes) {
      return { exitCode: 0, stderr: `${msg}DIAGNOSTIC: continuing because -y / --yes was set\n` };
    }
    return { exitCode: 2, stderr: msg };
  }

  const projectRoot = resolveProjectRoot(cfg, tiedBasePath);
  const cliEntry =
    opts?.cliEntry ?? tiedCliEntryFromAgentstreamModule(import.meta.url);
  const spawnFn = opts?.spawn ?? defaultDaeGateSpawn;
  const spawnResult = spawnFn({ cliEntry, projectRoot, requestToken, tiedBasePath });
  const report = formatGateCheckReport(requestToken, spawnResult);
  const status = spawnResult.status ?? 2;

  if (status === 0) {
    return { exitCode: 0, stderr: report.join("") };
  }

  if (cfg.dryRun) {
    report.push(
      "DEBUG: dry-run: would exit non-zero for dae gate preflight (gate check still ran when CLI is available)\n",
    );
    if (status === 2) {
      report.push(
        "DEBUG: dry-run: misconfig exit 2 — use -y, --skip-tied-mcp-preflight, or AGENTSTREAM_SKIP_TIED_MCP_PREFLIGHT for tied-yaml preflight bypass; unset AGENTSTREAM_DAE_GATE_CHECK / dae.agentstream_gate_check to skip gate check\n",
      );
    }
    return { exitCode: 0, stderr: report.join("") };
  }

  if (status === 2 && cfg.assumeTiedMcpYes) {
    report.push("DIAGNOSTIC: continuing because -y / --yes was set\n");
    return { exitCode: 0, stderr: report.join("") };
  }

  return { exitCode: status, stderr: report.join("") };
}
