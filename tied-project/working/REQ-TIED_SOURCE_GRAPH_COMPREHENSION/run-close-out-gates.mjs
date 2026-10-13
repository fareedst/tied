#!/usr/bin/env node
/** [REQ-TIED_SOURCE_GRAPH_COMPREHENSION] Canonical close-out gate replay wrapper. */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../../..");
const TEMPLATE = path.join(REPO, "tools/bootstrap/templates/run-close-out-gates.mjs");
const REQ = "REQ-TIED_SOURCE_GRAPH_COMPREHENSION";

const args = [
  TEMPLATE,
  "--project-root",
  REPO,
  "--request-token",
  REQ,
  "--tracker-path",
  `tied-project/working/${REQ}/close-out-tracker.yaml`,
  "--citdp-path",
  `tied-project/working/${REQ}/CITDP-REQ-TIED_SOURCE_GRAPH_COMPREHENSION.yaml`,
  "--phase",
  "close_out",
  "--run-id",
  "sgc-closeout-2026-10-13",
  "--envelope-blocking",
  "--sync-dispositions",
  "--reconcile",
];

const out = execFileSync(process.execPath, args, {
  cwd: REPO,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});
process.stdout.write(out);
