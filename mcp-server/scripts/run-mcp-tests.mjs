#!/usr/bin/env node
/**
 * [REQ-TIED_TWO_FOLDER_LAYOUT] [IMPL-TIED_TWO_FOLDER_LAYOUT]
 * How: Run all MCP workspace TypeScript tests via tsx (tests excluded from tsc outDir).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fg from "fast-glob";

const mcpRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(mcpRoot, "..");
const defaultTiedProject = path.join(repoRoot, "tied-project");
const testEnv = {
  ...process.env,
  ...(fs.existsSync(path.join(defaultTiedProject, "requirements.yaml"))
    ? { TIED_BASE_PATH: defaultTiedProject }
    : {}),
};

const tsPatterns = [
  "src/**/*.test.ts",
  "test/**/*.test.ts",
  "packages/*/src/**/*.test.ts",
];

const tsFiles = fg.sync(tsPatterns, { cwd: mcpRoot, absolute: true, onlyFiles: true }).sort();

if (tsFiles.length === 0) {
  console.error("DIAGNOSTIC: run-mcp-tests — no *.test.ts files matched");
  process.exit(1);
}

console.error(`DIAGNOSTIC: run-mcp-tests — tsx --test (${tsFiles.length} files)`);

function run(command, args, label) {
  const result = spawnSync(command, args, {
    cwd: mcpRoot,
    stdio: "inherit",
    env: testEnv,
  });
  if (result.status !== 0) {
    console.error(`DIAGNOSTIC: run-mcp-tests — ${label} failed (exit ${result.status ?? "signal"})`);
    process.exit(result.status ?? 1);
  }
}

const tsxBin = path.join(mcpRoot, "node_modules", ".bin", "tsx");
const tsxCmd = fs.existsSync(tsxBin) ? tsxBin : process.platform === "win32" ? "npx.cmd" : "npx";
const tsxArgs = fs.existsSync(tsxBin) ? ["--test", ...tsFiles] : ["tsx", "--test", ...tsFiles];
run(tsxCmd, tsxArgs, "tsx TypeScript suite");

const cjsFiles = fg.sync("test/**/*.test.cjs", { cwd: mcpRoot, absolute: true, onlyFiles: true }).sort();
if (cjsFiles.length > 0) {
  console.error(`DIAGNOSTIC: run-mcp-tests — node --test (${cjsFiles.length} CJS files)`);
  run("node", ["--test", ...cjsFiles], "node CJS suite");
}

console.error("DIAGNOSTIC: run-mcp-tests — replay-jev-context-pruning");
const replayScript = path.join(mcpRoot, "scripts/replay-jev-context-pruning.ts");
const replayTsxArgs = fs.existsSync(tsxBin)
  ? [replayScript]
  : ["tsx", replayScript];
run(tsxCmd, replayTsxArgs, "jev context pruning replay");
