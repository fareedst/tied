#!/usr/bin/env node
/**
 * [REQ-TIED_META_HUB_REPRESENTATION] CLI wrapper — reconcile working CITDP drafts.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const mcpDist = path.join(repoRoot, "mcp-server/dist/index.js");

const dryRun = !process.argv.includes("--apply");
const reportIdx = process.argv.indexOf("--report");
const reportPath =
  reportIdx >= 0 && process.argv[reportIdx + 1]
    ? process.argv[reportIdx + 1]
    : "tied-project/working/REQ-TIED_META_HUB_REPRESENTATION/evidence/reports/citdp-reconcile-ledger.v1.yaml";

const args = {
  dry_run: dryRun,
  project_root: repoRoot,
  report_path: reportPath,
};

const payload = JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: { name: "tied_citdp_reconcile_run", arguments: args },
});

const env = {
  ...process.env,
  TIED_BASE_PATH: path.join(repoRoot, "tied-project"),
  TIED_CLIENT_PROJECT_PATH: path.join(repoRoot, "tied-project"),
};

const run = spawnSync("node", [mcpDist], {
  input: `${JSON.stringify({ jsonrpc: "2.0", id: 0, method: "initialize", params: {} })}\n${payload}\n`,
  env,
  encoding: "utf8",
  cwd: repoRoot,
});

if (run.status !== 0) {
  console.error(run.stderr || run.stdout);
  process.exit(run.status ?? 1);
}
console.log(run.stdout);
