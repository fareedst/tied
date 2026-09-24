/**
 * [IMPL-TIED_CLAUDE_BOOTSTRAP_OPS] [ARCH-TIED_CLAUDE_BOOTSTRAP_OPS]
 * [REQ-TIED_CLAUDE_BOOTSTRAP_OPS] [REQ-TIED_CLAUDE_HARNESS] [REQ-TIED_SETUP]
 * How: RUN_CLAUDE_CLIENT_VALIDATION — ordered checks, fail-fast, JSON receipt.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { assertMcpPrerequisite } from "./mcp-config.mjs";
import { assertWindowsBootstrapClaude } from "./assert-windows-bootstrap-claude.mjs";
import { jsonSafeAbsolute } from "./paths.mjs";
import { skillsRerootEnabledFromEnv, SKILLS_REROOT_ENV } from "./skills-reroot.mjs";
import { runTiedValidateConsistency } from "../../../scripts/lib/tied-new-client-audit.mjs";

export const SCHEMA_VERSION = "tied-claude-client-validation.v1";
export const PROOF_BOUNDARY =
  "automated Claude bootstrap + stdio MCP smoke; not interactive Claude IDE OAuth or adherence hooks";
export const DEFAULT_REPORT_REL = path.join("working", "tied-claude-client-validation.v1.json");

export const CHECK_ORDER = [
  "mcp_dist_prerequisite",
  "claude_bootstrap_asserts",
  "mcp_json_harness_contract",
  "tied_cli_base_path_smoke",
  "claude_code_interactive_smoke",
  "tied_validate_consistency",
  "agentstream_dry_run",
  "agentstream_live_claude",
];

/** Opt-in: `claude -p` MCP + slash-skill smoke (requires Claude Code CLI + Anthropic auth on PATH). */
export const CLAUDE_CODE_INTERACTIVE_SMOKE_ENV = "TIED_CLAUDE_CODE_INTERACTIVE_SMOKE";

export const TRACEABILITY = [
  "REQ-TIED_CLAUDE_BOOTSTRAP_OPS",
  "REQ-TIED_CLAUDE_HARNESS",
  "REQ-TIED_SETUP",
];

/**
 * @param {string} sourceRoot
 */
export function resolveAgentstreamEntry(sourceRoot) {
  return path.join(sourceRoot, "mcp-server", "packages", "agentstream", "dist", "index.js");
}

/**
 * @param {string} clientDir
 * @param {boolean} skillsRerootEnabled
 */
export function resolveClientTiedCliPath(clientDir, skillsRerootEnabled) {
  const skillsRoot = skillsRerootEnabled
    ? path.join(clientDir, "skills")
    : path.join(clientDir, ".claude", "skills");
  return path.join(skillsRoot, "tied-yaml", "scripts", "tied-cli.sh");
}

/**
 * @param {string} clientDir
 */
export function loadClientMcpEnv(clientDir) {
  const mcpPath = path.join(clientDir, ".mcp.json");
  const raw = fs.readFileSync(mcpPath, "utf8");
  const cfg = JSON.parse(raw);
  const entry = cfg?.mcpServers?.["tied-yaml"];
  if (!entry?.env || typeof entry.env !== "object") {
    throw new Error("MCP_JSON_ENV_MISSING: tied-yaml env block required");
  }
  return { ...entry.env };
}

/**
 * @param {string} clientDir
 * @param {{ expectedHarness?: string }} [options]
 */
export function assertMcpJsonHarnessContract(clientDir, options = {}) {
  const expectedHarness = options.expectedHarness ?? "claude";
  const mcpPath = path.join(clientDir, ".mcp.json");
  let cfg;
  try {
    cfg = JSON.parse(fs.readFileSync(mcpPath, "utf8"));
  } catch (err) {
    return { ok: false, detail: `MCP_JSON_PARSE: ${err.message}` };
  }
  const harness = cfg?.mcpServers?.["tied-yaml"]?.env?.TIED_MCP_HARNESS;
  if (harness !== expectedHarness) {
    return {
      ok: false,
      detail: `TIED_MCP_HARNESS expected ${expectedHarness}, got ${String(harness)}`,
    };
  }
  const configuredBase = cfg?.mcpServers?.["tied-yaml"]?.env?.TIED_BASE_PATH;
  if (!configuredBase) {
    return { ok: false, detail: "TIED_BASE_PATH missing in .mcp.json env" };
  }
  const expectedBase = jsonSafeAbsolute(path.join(clientDir, "tied"));
  const normalizedConfigured = jsonSafeAbsolute(configuredBase);
  if (normalizedConfigured !== expectedBase) {
    return {
      ok: false,
      detail: `TIED_BASE_PATH mismatch: expected ${expectedBase}, got ${normalizedConfigured}`,
    };
  }
  return { ok: true };
}

/**
 * @param {string} tiedCliPath
 * @param {string} clientDir
 * @param {Record<string, string>} mcpEnv
 * @param {typeof spawnSync} spawn
 */
export function runTiedCliBasePathSmoke(tiedCliPath, clientDir, mcpEnv, spawn = spawnSync) {
  if (!fs.existsSync(tiedCliPath)) {
    return { ok: false, detail: `TIED_CLI_MISSING: ${tiedCliPath}` };
  }
  const result = spawn("bash", [tiedCliPath, "tied_config_get_base_path", "{}"], {
    cwd: clientDir,
    encoding: "utf8",
    env: { ...process.env, ...mcpEnv },
    stdio: "pipe",
  });
  if (result.error) {
    return { ok: false, detail: String(result.error.message ?? result.error) };
  }
  if (result.status !== 0) {
    const text = (result.stderr || result.stdout || "").slice(0, 2000);
    return { ok: false, detail: text || `exit ${result.status}` };
  }
  let parsed;
  try {
    parsed = JSON.parse(result.stdout);
  } catch (err) {
    return { ok: false, detail: `TIED_CLI_JSON: ${err.message}; stdout=${result.stdout?.slice(0, 500)}` };
  }
  const expectedBase = jsonSafeAbsolute(path.join(clientDir, "tied"));
  const resolved = parsed?.base_path ? jsonSafeAbsolute(parsed.base_path) : "";
  if (resolved !== expectedBase) {
    return {
      ok: false,
      detail: `base_path mismatch: expected ${expectedBase}, got ${resolved || String(parsed?.base_path)}`,
    };
  }
  return { ok: true };
}

/**
 * Claude Code CLI smoke: strict `.mcp.json` load + tied_config_get_base_path (not IDE OAuth).
 *
 * @param {string} clientDir
 * @param {typeof spawnSync} spawn
 */
export function runClaudeCodeInteractiveSmoke(clientDir, spawn = spawnSync) {
  const mcpPath = path.join(clientDir, ".mcp.json");
  if (!fs.existsSync(mcpPath)) {
    return { ok: false, detail: "MCP_JSON_MISSING" };
  }
  const which = spawn("which", ["claude"], { encoding: "utf8", stdio: "pipe" });
  if (which.status !== 0) {
    return { ok: true, skipped: true, detail: "CLAUDE_CLI_NOT_ON_PATH" };
  }
  const expectedBase = jsonSafeAbsolute(path.join(clientDir, "tied"));
  const mcpConfigArg = jsonSafeAbsolute(mcpPath);
  const prompt =
    "Use the tied-yaml MCP tool tied_config_get_base_path. Reply with only the base_path string.";
  const result = spawn(
    "claude",
    [
      "-p",
      "--permission-mode",
      "bypassPermissions",
      "--strict-mcp-config",
      "--mcp-config",
      mcpConfigArg,
      "--",
      prompt,
    ],
    {
      cwd: clientDir,
      encoding: "utf8",
      env: process.env,
      stdio: "pipe",
      timeout: 120_000,
    },
  );
  if (result.error) {
    return { ok: false, detail: String(result.error.message ?? result.error) };
  }
  if (result.status !== 0) {
    const text = (result.stderr || result.stdout || "").slice(0, 2000);
    return { ok: false, detail: text || `exit ${result.status}` };
  }
  const answer = (result.stdout || "").trim();
  const resolved = jsonSafeAbsolute(answer.split(/\s+/)[0] ?? answer);
  if (resolved !== expectedBase) {
    return {
      ok: false,
      detail: `base_path mismatch: expected ${expectedBase}, got ${answer.slice(0, 500)}`,
    };
  }
  return { ok: true };
}

/**
 * @param {string} clientDir
 * @param {string} sourceRoot
 * @param {typeof spawnSync} spawn
 */
export function runAgentstreamDryRunCheck(clientDir, sourceRoot, spawn = spawnSync) {
  const entry = resolveAgentstreamEntry(sourceRoot);
  if (!fs.existsSync(entry)) {
    return { ok: false, detail: `AGENTSTREAM_DIST_MISSING: ${entry}` };
  }
  const args = [
    entry,
    "-d",
    "-w",
    clientDir,
    "--harness",
    "claude",
    "--skip-tied-mcp-preflight",
    "--",
    "Reply with exactly: validation-ok",
  ];
  const result = spawn(process.execPath, args, {
    cwd: sourceRoot,
    encoding: "utf8",
    env: process.env,
    stdio: "pipe",
  });
  if (result.error) {
    return { ok: false, detail: String(result.error.message ?? result.error) };
  }
  if (result.status !== 0) {
    const text = (result.stderr || result.stdout || "").slice(0, 2000);
    return { ok: false, detail: text || `exit ${result.status}` };
  }
  return { ok: true };
}

/**
 * @param {{
 *   clientRoot: string;
 *   ok: boolean;
 *   checks: object[];
 *   withConsistency?: boolean;
 *   withAgentstreamDryRun?: boolean;
 *   withLiveClaude?: boolean;
 *   withClaudeCodeInteractiveSmoke?: boolean;
 *   skillsRerootEnabled?: boolean;
 *   validationCommand?: string;
 *   generatedAt?: string;
 * }} input
 */
export function buildClaudeClientValidationReport(input) {
  return {
    schema_version: SCHEMA_VERSION,
    generated_at: input.generatedAt ?? new Date().toISOString(),
    client_root: input.clientRoot,
    ok: input.ok === true,
    harness_profile: "claude",
    proof_boundary: PROOF_BOUNDARY,
    with_consistency: input.withConsistency === true,
    with_agentstream_dry_run: input.withAgentstreamDryRun === true,
    with_live_claude: input.withLiveClaude === true,
    with_claude_code_interactive_smoke: input.withClaudeCodeInteractiveSmoke === true,
    skills_reroot_enabled: input.skillsRerootEnabled === true,
    validation_command: input.validationCommand ?? "node scripts/run-tied-claude-client-validation.mjs",
    checks: input.checks,
    traceability: TRACEABILITY,
  };
}

/**
 * @param {string} reportPath
 * @param {object} report
 */
export function writeClaudeClientValidationReport(reportPath, report) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

/**
 * @param {string} clientDir
 * @param {string} sourceRoot
 * @param {{
 *   withConsistency?: boolean;
 *   withAgentstreamDryRun?: boolean;
 *   withLiveClaude?: boolean;
 *   withClaudeCodeInteractiveSmoke?: boolean;
 *   skillsRerootEnabled?: boolean;
 *   reportPath?: string;
 *   validationCommand?: string;
 *   env?: NodeJS.ProcessEnv;
 *   spawn?: typeof spawnSync;
 * }} [options]
 */
export function runClaudeClientValidation(clientDir, sourceRoot, options = {}) {
  const env = options.env ?? process.env;
  const spawn = options.spawn ?? spawnSync;
  const clientRoot = path.resolve(clientDir);
  const skillsRerootEnabled =
    options.skillsRerootEnabled ?? skillsRerootEnabledFromEnv(env);
  const withConsistency = options.withConsistency === true;
  const withAgentstreamDryRun = options.withAgentstreamDryRun === true;
  const withLiveClaude = options.withLiveClaude === true;
  const withClaudeCodeInteractiveSmoke =
    options.withClaudeCodeInteractiveSmoke === true ||
    env[CLAUDE_CODE_INTERACTIVE_SMOKE_ENV] === "1";
  const reportPath =
    options.reportPath ?? path.join(clientRoot, DEFAULT_REPORT_REL);

  /** @type {object[]} */
  const checks = [];
  let failed = false;

  const record = (id, result, durationMs) => {
    const status = result.skipped ? "skipped" : result.ok ? "pass" : "fail";
    checks.push({
      id,
      status,
      detail: result.detail ?? null,
      duration_ms: durationMs,
    });
    if (status === "fail") {
      failed = true;
    }
  };

  const runTimed = (id, fn) => {
    if (failed) {
      return;
    }
    const start = Date.now();
    const result = fn();
    record(id, result, Date.now() - start);
  };

  runTimed("mcp_dist_prerequisite", () => {
    try {
      assertMcpPrerequisite(sourceRoot);
      return { ok: true };
    } catch (err) {
      return { ok: false, detail: String(err.message ?? err) };
    }
  });

  runTimed("claude_bootstrap_asserts", () => {
    const assertResult = assertWindowsBootstrapClaude(clientRoot, {
      skills_reroot_enabled: skillsRerootEnabled,
    });
    if (!assertResult.ok) {
      return { ok: false, detail: assertResult.message ?? assertResult.code };
    }
    return { ok: true };
  });

  runTimed("mcp_json_harness_contract", () => assertMcpJsonHarnessContract(clientRoot));

  runTimed("tied_cli_base_path_smoke", () => {
    try {
      const mcpEnv = loadClientMcpEnv(clientRoot);
      const tiedCli = resolveClientTiedCliPath(clientRoot, skillsRerootEnabled);
      return runTiedCliBasePathSmoke(tiedCli, clientRoot, mcpEnv, spawn);
    } catch (err) {
      return { ok: false, detail: String(err.message ?? err) };
    }
  });

  if (!failed) {
    if (withClaudeCodeInteractiveSmoke) {
      runTimed("claude_code_interactive_smoke", () =>
        runClaudeCodeInteractiveSmoke(clientRoot, spawn),
      );
    } else {
      record("claude_code_interactive_smoke", { ok: true, skipped: true }, 0);
    }
  }

  if (!failed) {
    if (withConsistency) {
      runTimed("tied_validate_consistency", () => {
        const tiedCli = resolveClientTiedCliPath(clientRoot, skillsRerootEnabled);
        const result = runTiedValidateConsistency(clientRoot, {
          repoRoot: sourceRoot,
          tiedCliPath: tiedCli,
        });
        return result.ok ? { ok: true } : { ok: false, detail: result.detail };
      });
    } else {
      record("tied_validate_consistency", { ok: true, skipped: true }, 0);
    }
  }

  if (!failed) {
    if (withAgentstreamDryRun) {
      runTimed("agentstream_dry_run", () =>
        runAgentstreamDryRunCheck(clientRoot, sourceRoot, spawn),
      );
    } else {
      record("agentstream_dry_run", { ok: true, skipped: true }, 0);
    }
  }

  if (!failed) {
    record("agentstream_live_claude", { ok: true, skipped: true }, 0);
  }

  const executedOk = checks.every((c) => c.status === "pass" || c.status === "skipped");
  const report = buildClaudeClientValidationReport({
    clientRoot,
    ok: executedOk,
    checks,
    withConsistency,
    withAgentstreamDryRun,
    withLiveClaude,
    withClaudeCodeInteractiveSmoke,
    skillsRerootEnabled,
    validationCommand: options.validationCommand,
  });
  writeClaudeClientValidationReport(reportPath, report);

  return { ok: report.ok === true, checks, reportPath, report };
}

export { SKILLS_REROOT_ENV };
