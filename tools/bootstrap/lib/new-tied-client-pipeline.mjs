/**
 * [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 * How: RUN_NEW_TIED_CLIENT_PIPELINE and CREATE_DISPOSABLE_TIED_CLIENT — mirror _new_tied_test_client.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { TIED_REPO_ROOT } from "./constants.mjs";
import { sayErr, sayOk, sayWarn } from "./console.mjs";
import { lintClientTiedYaml } from "./lint-client-yaml.mjs";
import { runNewClientOnboardingAudit } from "./new-client-onboarding-audit.mjs";
import { runClaudeClientValidation } from "./claude-client-validation.mjs";
import { tiedBaselineCommitMessage } from "./tied-baseline-commit-message.mjs";
import { skillsRerootEnabledFromEnv } from "./skills-reroot.mjs";
import { bootstrapToolFlagsToArgv } from "./client-tool-use-bootstrap.mjs";
import { buildTiedInstallArgv } from "./install-options.mjs";
import { childProcessSpawnOptions } from "./child-process-win.mjs";

export function resolveSourceRoot(env = process.env, fallback = TIED_REPO_ROOT) {
  const resolvedFallback = path.resolve(fallback);
  const raw = env.TIED_REPO_ROOT;
  if (raw && raw.trim()) {
    const fromEnv = path.resolve(raw.trim());
    const { script: envBootstrap } = bootstrapEntry(fromEnv);
    const envBootstrapExists = fs.existsSync(envBootstrap);
    if (envBootstrapExists) {
      return fromEnv;
    }
    if (fromEnv !== resolvedFallback) {
      sayWarn(
        `TIED_REPO_ROOT points to ${fromEnv} but bootstrap entry is missing (${envBootstrap}); using engine repo ${resolvedFallback}`,
      );
    }
  }
  return resolvedFallback;
}

export function resolveTestRoot(env = process.env) {
  const raw = env.TIED_TEST_ROOT;
  if (raw && raw.trim()) {
    return path.resolve(raw);
  }
  const home = env.USERPROFILE || env.HOME || os.homedir();
  return path.join(home, "Documents", "dev", "test");
}

export function unixSecondsTimestamp(nowMs = Date.now()) {
  return Math.floor(nowMs / 1000).toString();
}

export function createDisposableClientDir(testRoot, nowMs = Date.now()) {
  const timestamp = unixSecondsTimestamp(nowMs);
  const clientDir = path.join(testRoot, timestamp);
  return { clientDir, timestamp };
}

export function prepareClientDirectory(clientDir, { disposable = false } = {}) {
  if (disposable) {
    fs.mkdirSync(clientDir, { recursive: true });
    return;
  }
  fs.mkdirSync(path.dirname(clientDir), { recursive: true });
  if (!fs.existsSync(clientDir)) {
    fs.mkdirSync(clientDir);
  }
}

function bootstrapEntry(sourceRoot) {
  if (process.platform === "win32") {
    return { script: path.join(sourceRoot, "tied-install.cmd"), argv: [] };
  }
  return { script: path.join(sourceRoot, "tied-install.sh"), argv: [] };
}


function runStep(label, fn) {
  const result = fn();
  if (!result.ok) {
    sayErr(`${label} failed (exit ${result.code ?? 1})`);
    if (result.stderr) {
      sayErr(result.stderr.trim());
    }
    return result;
  }
  return result;
}

/** [REQ-TIED_SETUP] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [IMPL-TIED_FILES] — RESOLVE_CURSOR_CLI_NAME */
export const DEFAULT_CURSOR_CLI_NAME = "agent";

/** @param {NodeJS.ProcessEnv} [env] */
export function resolveCursorAgentCli(env = process.env, spawn = spawnSync) {
  const override = env.TIED_CURSOR_AGENT_CMD?.trim();
  if (override) {
    return override;
  }
  const preferred = env.CURSOR_CLI_NAME?.trim() || DEFAULT_CURSOR_CLI_NAME;
  const probe = (cmd) => {
    if (process.platform === "win32") {
      const result = spawn(
        "where.exe",
        [cmd],
        childProcessSpawnOptions({ encoding: "utf8", stdio: "pipe" }),
      );
      return result.status === 0;
    }
    const result = spawn(
      "which",
      [cmd],
      childProcessSpawnOptions({ encoding: "utf8", stdio: "pipe" }),
    );
    return result.status === 0;
  };
  const candidates = [...new Set([preferred, "agent", "cursor"])];
  for (const cmd of candidates) {
    if (probe(cmd)) {
      return cmd;
    }
  }
  return preferred;
}

export function runNewTiedClientPipeline(options) {
  const harnessProfile = options.harnessProfile ?? "cursor";
  const env = options.env ?? process.env;
  const {
    clientDir,
    sourceRoot,
    skipLint = false,
    skipOnboardingAudit = false,
    skipGit = false,
    forceMcpEnable = false,
    skipClaudeValidation = false,
    spawn = spawnSync,
    nodeExec = process.execPath,
    stdinIsTTY = process.stdin.isTTY,
  } = options;
  const claudeValidation = options.claudeValidation ?? {};
  const skipMcpEnable =
    harnessProfile === "claude" ? true : options.skipMcpEnable === true;

  prepareClientDirectory(clientDir, { disposable: options.disposable === true });

  const { script: copyScript, argv: entryArgv } = bootstrapEntry(sourceRoot);
  if (!fs.existsSync(copyScript)) {
    sayErr(`bootstrap entry not found: ${copyScript}`);
    return { ok: false, code: 1, step: "tied_install" };
  }

  const bootstrapArgv = [
    ...entryArgv,
    ...buildTiedInstallArgv(sourceRoot, harnessProfile, options.installOptions ?? {}),
    ...bootstrapToolFlagsToArgv(options.toolUseProfile ?? {}),
  ];

  let step = runStep("tied_install", () => {
    const result = spawn(
      copyScript,
      bootstrapArgv,
      childProcessSpawnOptions({
        cwd: clientDir,
        shell: process.platform === "win32",
        encoding: "utf8",
        stdio: "pipe",
      }),
    );
    return {
      ok: result.status === 0,
      code: result.status ?? 1,
      stderr: result.stderr,
      step: "tied_install",
    };
  });
  if (!step.ok) {
    return step;
  }

  if (!skipLint) {
    step = lintClientTiedYaml({ clientDir, sourceRoot, nodeExec, spawn });
    if (!step.ok) {
      return step;
    }
  }

  step = runStep("onboarding_audit", () =>
    runNewClientOnboardingAudit({
      clientDir,
      sourceRoot,
      nodeExec,
      spawn,
      skipOnboardingAudit,
      env,
    }),
  );
  if (!step.ok) {
    return step;
  }

  if (harnessProfile === "claude" && !skipClaudeValidation) {
    const validationCommand =
      claudeValidation.validationCommand ??
      `node tools/bootstrap/new-tied-client.mjs --harness claude --client-root ${clientDir}`;
    const runValidation =
      options.runClaudeClientValidationFn ?? runClaudeClientValidation;
    step = runStep("claude_validation", () => {
      const result = runValidation(clientDir, sourceRoot, {
        withConsistency: claudeValidation.withConsistency === true,
        withAgentstreamDryRun: claudeValidation.withAgentstreamDryRun !== false,
        withLiveClaude: claudeValidation.withLiveClaude === true,
        skillsRerootEnabled:
          claudeValidation.skillsRerootEnabled ?? skillsRerootEnabledFromEnv(env),
        validationCommand,
        env,
        spawn,
      });
      return {
        ok: result.ok,
        code: result.ok ? 0 : 1,
        stderr: result.ok ? undefined : `Claude validation failed; see ${result.reportPath}`,
        step: "claude_validation",
      };
    });
    if (!step.ok) {
      return step;
    }
  }

  if (!skipMcpEnable) {
    const cursorAgentCli = options.cursorAgentCli ?? resolveCursorAgentCli(process.env, spawn);
    const mcpEnableLabel = `${cursorAgentCli} mcp enable tied-yaml`;
    if (!stdinIsTTY && !forceMcpEnable) {
      sayWarn(`Skipping ${mcpEnableLabel} (stdin is not a TTY). Use --force-mcp-enable to run anyway.`);
    } else {
      step = runStep(mcpEnableLabel, () => {
        const result = spawn(
          cursorAgentCli,
          ["mcp", "enable", "tied-yaml"],
          childProcessSpawnOptions({
            cwd: clientDir,
            shell: true,
            encoding: "utf8",
            stdio: "pipe",
          }),
        );
        if (result.error && result.error.code === "ENOENT") {
          sayErr(
            `${cursorAgentCli} CLI not found on PATH (override with TIED_CURSOR_AGENT_CMD or CURSOR_CLI_NAME)`,
          );
          return {
            ok: false,
            code: 127,
            stderr: `${cursorAgentCli} not found`,
            step: "mcp_enable",
          };
        }
        return {
          ok: result.status === 0,
          code: result.status ?? 1,
          stderr: result.stderr,
          step: "mcp_enable",
        };
      });
      if (!step.ok) {
        return step;
      }
    }
  }

  if (!skipGit) {
    const baselineMessage = tiedBaselineCommitMessage(sourceRoot);
    const gitSteps = [
      ["git", ["init"]],
      ["git", ["add", "."]],
      ["git", ["commit", "-m", baselineMessage]],
    ];
    for (const [cmd, args] of gitSteps) {
      step = runStep(`${cmd} ${args.join(" ")}`, () => {
        const result = spawn(
          cmd,
          args,
          childProcessSpawnOptions({
            cwd: clientDir,
            encoding: "utf8",
            stdio: "pipe",
          }),
        );
        if (result.error && result.error.code === "ENOENT") {
          sayErr("git not found on PATH");
          return { ok: false, code: 127, stderr: "git not found", step: "git" };
        }
        if (cmd === "git" && args[0] === "commit" && result.status !== 0) {
          sayWarn("git commit failed — configure identity, e.g.:");
          sayWarn('  git config --global user.name "Your Name"');
          sayWarn('  git config --global user.email "you@example.com"');
        }
        return {
          ok: result.status === 0,
          code: result.status ?? 1,
          stderr: result.stderr,
          step: "git",
        };
      });
      if (!step.ok) {
        return step;
      }
    }
  }

  return { ok: true, code: 0, step: "done" };
}

export function runDisposableClient(options) {
  const testRoot = options.testRoot ?? resolveTestRoot(options.env);
  const { clientDir, timestamp } = createDisposableClientDir(testRoot, options.nowMs);
  const result = runNewTiedClientPipeline({
    ...options,
    clientDir,
    disposable: true,
  });
  if (result.ok) {
    sayOk(`Disposable TIED client: ${testRoot}${path.sep}${timestamp}`);
  }
  return { ...result, clientDir, timestamp, testRoot };
}
