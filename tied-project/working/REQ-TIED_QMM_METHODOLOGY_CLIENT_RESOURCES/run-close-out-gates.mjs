#!/usr/bin/env node
/**
 * [REQ-TIED_QMM_METHODOLOGY_CLIENT_RESOURCES] Close-out gate replay wrapper.
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../../..");
const TEMPLATE = path.join(REPO, "tools/bootstrap/templates/run-close-out-gates.mjs");
const REQ = "REQ-TIED_QMM_METHODOLOGY_CLIENT_RESOURCES";

const args = [
  TEMPLATE,
  "--project-root",
  REPO,
  "--request-token",
  REQ,
  "--tracker-path",
  `tied-project/working/${REQ}/agent-req-implementation-checklist.yaml`,
  "--citdp-path",
  `tied-project/citdp/CITDP-${REQ}.yaml`,
  "--phase",
  "close_out",
  "--run-id",
  "qmm-closeout-20261010",
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
