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

export function resolveSourceRoot(env = process.env, fallback = TIED_REPO_ROOT) {
  const raw = env.TIED_SOURCE_ROOT;
  return path.resolve(raw && raw.trim() ? raw : fallback);
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
    return path.join(sourceRoot, "copy_files.cmd");
  }
  return path.join(sourceRoot, "copy_files.sh");
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

/** @param {NodeJS.ProcessEnv} [env] */
export function resolveCursorAgentCli(env = process.env, spawn = spawnSync) {
  const override = env.TIED_CURSOR_AGENT_CMD?.trim();
  if (override) {
    return override;
  }
  const probe = (cmd) => {
    if (process.platform === "win32") {
      const result = spawn("where.exe", [cmd], { encoding: "utf8", stdio: "pipe" });
      return result.status === 0;
    }
    const result = spawn("which", [cmd], { encoding: "utf8", stdio: "pipe" });
    return result.status === 0;
  };
  if (probe("cursor")) {
    return "cursor";
  }
  if (probe("agent")) {
    return "agent";
  }
  return process.platform === "win32" ? "cursor" : "agent";
}

export function runNewTiedClientPipeline(options) {
  const {
    clientDir,
    sourceRoot,
    skipLint = false,
    skipMcpEnable = false,
    skipGit = false,
    forceMcpEnable = false,
    spawn = spawnSync,
    nodeExec = process.execPath,
    stdinIsTTY = process.stdin.isTTY,
  } = options;

  prepareClientDirectory(clientDir, { disposable: options.disposable === true });

  const copyScript = bootstrapEntry(sourceRoot);
  if (!fs.existsSync(copyScript)) {
    sayErr(`bootstrap entry not found: ${copyScript}`);
    return { ok: false, code: 1, step: "copy_files" };
  }

  let step = runStep("copy_files", () => {
    const result = spawn(copyScript, [], {
      cwd: clientDir,
      shell: process.platform === "win32",
      encoding: "utf8",
      stdio: "pipe",
    });
    return {
      ok: result.status === 0,
      code: result.status ?? 1,
      stderr: result.stderr,
      step: "copy_files",
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

  if (!skipMcpEnable) {
    const cursorAgentCli = options.cursorAgentCli ?? resolveCursorAgentCli(process.env, spawn);
    const mcpEnableLabel = `${cursorAgentCli} mcp enable tied-yaml`;
    if (!stdinIsTTY && !forceMcpEnable) {
      sayWarn(`Skipping ${mcpEnableLabel} (stdin is not a TTY). Use --force-mcp-enable to run anyway.`);
    } else {
      step = runStep(mcpEnableLabel, () => {
        const result = spawn(cursorAgentCli, ["mcp", "enable", "tied-yaml"], {
          cwd: clientDir,
          shell: true,
          encoding: "utf8",
          stdio: "pipe",
        });
        if (result.error && result.error.code === "ENOENT") {
          sayErr(`${cursorAgentCli} CLI not found on PATH (override with TIED_CURSOR_AGENT_CMD)`);
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
    const gitSteps = [
      ["git", ["init"]],
      ["git", ["add", "."]],
      ["git", ["commit", "-m", "TIED"]],
    ];
    for (const [cmd, args] of gitSteps) {
      step = runStep(`${cmd} ${args.join(" ")}`, () => {
        const result = spawn(cmd, args, {
          cwd: clientDir,
          encoding: "utf8",
          stdio: "pipe",
        });
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
