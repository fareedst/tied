/**
 * [IMPL-TIED_CLAUDE_ADHERENCE_HOOKS] [ARCH-TIED_CLAUDE_ADHERENCE_HOOKS] [REQ-TIED_CLAUDE_ADHERENCE_HOOKS]
 * Safe-merge Claude Code adherence bridge into .claude/settings.json (PostToolUse).
 */
import fs from "node:fs";
import path from "node:path";

import { sayOk } from "./console.mjs";

export const TIED_ADHERENCE_BRIDGE_HOOK_ID = "tied-adherence-bridge";
export const TIED_ADHERENCE_BRIDGE_SCRIPT = "tied-adherence-bridge.sh";

export function bridgeScriptPath(projectRoot) {
  return path.join(projectRoot, ".claude", "hooks", TIED_ADHERENCE_BRIDGE_SCRIPT);
}

export function bridgeJsPath(tiedRepoRoot) {
  return path.join(tiedRepoRoot, "mcp-server", "dist", "cli", "claude-adherence-bridge.js");
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

function tiedHookEntry(projectRoot) {
  const scriptPath = bridgeScriptPath(projectRoot);
  return {
    matcher: "",
    hooks: [
      {
        type: "command",
        command: scriptPath,
      },
    ],
  };
}

function hasTiedBridge(postToolUseList, projectRoot) {
  if (!Array.isArray(postToolUseList)) return false;
  const scriptPath = bridgeScriptPath(projectRoot);
  for (const group of postToolUseList) {
    const handlers = group?.hooks;
    if (!Array.isArray(handlers)) continue;
    for (const handler of handlers) {
      const cmd = String(handler?.command ?? "");
      if (cmd.includes(TIED_ADHERENCE_BRIDGE_SCRIPT) || cmd === scriptPath) {
        return true;
      }
    }
  }
  return false;
}

/**
 * @returns {{ path: string, action: "created"|"merged"|"noop", initialized: boolean }}
 */
export function mergeClaudeAdherenceHooks(projectRoot, tiedRepoRoot) {
  const settingsPath = path.join(projectRoot, ".claude", "settings.json");
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  writeBridgeShell(projectRoot, tiedRepoRoot);

  const entry = tiedHookEntry(projectRoot);

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
  if (hasTiedBridge(post, projectRoot)) {
    return { path: settingsPath, action: "noop", initialized: false };
  }

  cfg.hooks.PostToolUse = Array.isArray(post) ? [...post, entry] : [entry];
  fs.writeFileSync(settingsPath, `${JSON.stringify(cfg, null, 2)}\n`, "utf8");
  sayOk(`Merged ${settingsPath} PostToolUse ${TIED_ADHERENCE_BRIDGE_HOOK_ID} (foreign hooks preserved).`);
  return { path: settingsPath, action: "merged", initialized: true };
}
