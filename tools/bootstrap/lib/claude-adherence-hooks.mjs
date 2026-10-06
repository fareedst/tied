/**
 * [IMPL-TIED_CLAUDE_ADHERENCE_HOOKS] [ARCH-TIED_CLAUDE_ADHERENCE_HOOKS] [REQ-TIED_CLAUDE_ADHERENCE_HOOKS]
 * Safe-merge Claude Code adherence bridge into .claude/settings.json (PostToolUse).
 */
import fs from "node:fs";
import path from "node:path";

import { sayOk } from "./console.mjs";
import { jsonSafeAbsolute } from "./paths.mjs";

export const TIED_ADHERENCE_BRIDGE_HOOK_ID = "tied-adherence-bridge";
export const TIED_ADHERENCE_BRIDGE_SCRIPT = "tied-adherence-bridge.sh";
export const TIED_ADHERENCE_BRIDGE_CMD = "tied-adherence-bridge.cmd";

export function bridgeScriptPath(projectRoot) {
  return path.join(projectRoot, ".claude", "hooks", TIED_ADHERENCE_BRIDGE_SCRIPT);
}

export function bridgeJsPath(tiedRepoRoot) {
  return path.join(tiedRepoRoot, "mcp-server", "dist", "cli", "claude-adherence-bridge.js");
}

/** Claude settings.json hook command — Node directly (avoids Git Bash windows on Windows). */
export function bridgeHookCommand(tiedRepoRoot) {
  const bridgeJs = jsonSafeAbsolute(bridgeJsPath(tiedRepoRoot));
  return `node "${bridgeJs}"`;
}

export function bridgeCmdPath(projectRoot) {
  return path.join(projectRoot, ".claude", "hooks", TIED_ADHERENCE_BRIDGE_CMD);
}

export function writeBridgeCmd(projectRoot, tiedRepoRoot) {
  const hooksDir = path.join(projectRoot, ".claude", "hooks");
  fs.mkdirSync(hooksDir, { recursive: true });
  const scriptPath = bridgeCmdPath(projectRoot);
  const bridgeJs = bridgeJsPath(tiedRepoRoot);
  const body = `@echo off
setlocal
node "${bridgeJs.replace(/"/g, '""')}" %*
exit /b %ERRORLEVEL%
`;
  fs.writeFileSync(scriptPath, body, "utf8");
  return scriptPath;
}

export function writeBridgeShell(projectRoot, tiedRepoRoot) {
  const hooksDir = path.join(projectRoot, ".claude", "hooks");
  fs.mkdirSync(hooksDir, { recursive: true });
  const scriptPath = bridgeScriptPath(projectRoot);
  const bridgeJs = bridgeJsPath(tiedRepoRoot);
  const body = `#!/usr/bin/env bash
# [REQ-TIED_CLAUDE_ADHERENCE_HOOKS] Append-only adherence bridge (fail-silent).
set -euo pipefail
ROOT="\${CLAUDE_PROJECT_DIR:-$(pwd)}"
exec node "${bridgeJs.replace(/"/g, '\\"')}" --project-dir "$ROOT"
`;
  fs.writeFileSync(scriptPath, body, { mode: 0o755 });
  return scriptPath;
}

function tiedHookEntry(tiedRepoRoot) {
  return {
    matcher: "",
    hooks: [
      {
        type: "command",
        command: bridgeHookCommand(tiedRepoRoot),
      },
    ],
  };
}

function isTiedBridgeCommand(cmd, projectRoot, tiedRepoRoot) {
  const text = String(cmd ?? "");
  if (!text) return false;
  if (text.includes("claude-adherence-bridge.js")) return true;
  const scriptPath = bridgeScriptPath(projectRoot);
  return text.includes(TIED_ADHERENCE_BRIDGE_SCRIPT) || text === scriptPath;
}

function usesLegacyShellBridgeCommand(cmd) {
  return String(cmd ?? "").includes(TIED_ADHERENCE_BRIDGE_SCRIPT);
}

function hasTiedBridge(postToolUseList, projectRoot, tiedRepoRoot) {
  if (!Array.isArray(postToolUseList)) return false;
  for (const group of postToolUseList) {
    const handlers = group?.hooks;
    if (!Array.isArray(handlers)) continue;
    for (const handler of handlers) {
      if (isTiedBridgeCommand(handler?.command, projectRoot, tiedRepoRoot)) {
        return true;
      }
    }
  }
  return false;
}

function upgradeLegacyShellBridgeCommands(postToolUseList, tiedRepoRoot) {
  if (!Array.isArray(postToolUseList)) return false;
  let changed = false;
  const nextCommand = bridgeHookCommand(tiedRepoRoot);
  for (const group of postToolUseList) {
    const handlers = group?.hooks;
    if (!Array.isArray(handlers)) continue;
    for (const handler of handlers) {
      if (usesLegacyShellBridgeCommand(handler?.command)) {
        handler.command = nextCommand;
        changed = true;
      }
    }
  }
  return changed;
}

/**
 * @returns {{ path: string, action: "created"|"merged"|"noop", initialized: boolean }}
 */
export function mergeClaudeAdherenceHooks(projectRoot, tiedRepoRoot) {
  const settingsPath = path.join(projectRoot, ".claude", "settings.json");
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  writeBridgeShell(projectRoot, tiedRepoRoot);
  if (process.platform === "win32") {
    writeBridgeCmd(projectRoot, tiedRepoRoot);
  }

  const entry = tiedHookEntry(tiedRepoRoot);

  if (!fs.existsSync(settingsPath)) {
    const cfg = { hooks: { PostToolUse: [entry] } };
    fs.writeFileSync(settingsPath, `${JSON.stringify(cfg, null, 2)}\n`, "utf8");
    sayOk(`Initialized ${settingsPath} PostToolUse ${TIED_ADHERENCE_BRIDGE_HOOK_ID}.`);
    return { path: settingsPath, action: "created", initialized: true };
  }

  const raw = fs.readFileSync(settingsPath, "utf8");
  let cfg;
  try {
    cfg = JSON.parse(raw);
  } catch (e) {
    throw new Error(`Invalid JSON in ${settingsPath}: ${e.message}`);
  }
  if (typeof cfg !== "object" || cfg === null) {
    throw new Error(`Invalid settings object in ${settingsPath}`);
  }

  if (!cfg.hooks || typeof cfg.hooks !== "object") {
    cfg.hooks = {};
  }
  const post = cfg.hooks.PostToolUse;
  if (hasTiedBridge(post, projectRoot, tiedRepoRoot)) {
    if (upgradeLegacyShellBridgeCommands(post, tiedRepoRoot)) {
      cfg.hooks.PostToolUse = post;
      fs.writeFileSync(settingsPath, `${JSON.stringify(cfg, null, 2)}\n`, "utf8");
      sayOk(`Upgraded ${settingsPath} PostToolUse ${TIED_ADHERENCE_BRIDGE_HOOK_ID} to Node hook command.`);
      return { path: settingsPath, action: "merged", initialized: true };
    }
    return { path: settingsPath, action: "noop", initialized: false };
  }

  cfg.hooks.PostToolUse = Array.isArray(post) ? [...post, entry] : [entry];
  fs.writeFileSync(settingsPath, `${JSON.stringify(cfg, null, 2)}\n`, "utf8");
  sayOk(`Merged ${settingsPath} PostToolUse ${TIED_ADHERENCE_BRIDGE_HOOK_ID} (foreign hooks preserved).`);
  return { path: settingsPath, action: "merged", initialized: true };
}
