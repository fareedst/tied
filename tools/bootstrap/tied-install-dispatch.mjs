#!/usr/bin/env node
/**
 * [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_LAYERED_CLIENT_INSTALL]
 * How: RUN_TIED_INSTALL_ENTRYPOINT — single Node target for install shell shims (.sh / .cmd / .ps1).
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, "../..");

/**
 * @param {string} repoRoot
 * @param {(p: string) => boolean} fsExists
 */
export function resolveInstallTarget(repoRoot, fsExists = fs.existsSync.bind(fs)) {
  const cliDist = path.join(repoRoot, "mcp-server", "packages", "cli", "dist", "index.js");
  const layers = path.join(repoRoot, "tools", "bootstrap", "install-layers.mjs");
  if (fsExists(cliDist)) {
    return { script: cliDist, argvPrefix: ["install"] };
  }
  return { script: layers, argvPrefix: [] };
}

/**
 * @param {string[]} argv
 * @param {{
 *   spawn?: typeof spawnSync,
 *   nodeExec?: string,
 *   fsExists?: (p: string) => boolean,
 *   repoRoot?: string,
 * }} [options]
 */
export function runTiedInstallEntrypoint(argv, options = {}) {
  const {
    spawn = spawnSync,
    nodeExec = process.execPath,
    fsExists = fs.existsSync.bind(fs),
    repoRoot = REPO_ROOT,
  } = options;
  const { script, argvPrefix } = resolveInstallTarget(repoRoot, fsExists);
  console.error(`DIAGNOSTIC: tied-install dispatch -> ${script}`);
  const result = spawn(nodeExec, [script, ...argvPrefix, ...argv], {
    stdio: "inherit",
  });
  if (result.error) {
    console.error(`DIAGNOSTIC: CHILD_SPAWN_FAILED ${result.error.message}`);
    return 1;
  }
  return result.status ?? 1;
}

function isMainModule() {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }
  return import.meta.url === pathToFileURL(path.resolve(entry)).href;
}

if (isMainModule()) {
  const code = runTiedInstallEntrypoint(process.argv.slice(2));
  process.exit(code);
}
