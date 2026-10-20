#!/usr/bin/env node
/**
 * [IMPL-TIED_WORKSPACE_BUILD_ENTRY] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
 * How: printBuildWorkspaceHelp entry for shell shims (cwd-independent).
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { printBuildWorkspaceHelp } from "./lib/build-workspace-help.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Repo root resolved from this file (tools/bootstrap → store root). */
export const REPO_ROOT = path.resolve(__dirname, "../..");

function isMainModule() {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }
  return import.meta.url === pathToFileURL(path.resolve(entry)).href;
}

export function runBuildWorkspaceHelpCli() {
  printBuildWorkspaceHelp();
  return 0;
}

if (isMainModule()) {
  process.exit(runBuildWorkspaceHelpCli());
}
