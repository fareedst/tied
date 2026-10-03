#!/usr/bin/env node
/**
 * [REQ-REQUEST_EVIDENCE_ENVELOPE] Envelope replay wrapper.
 * Default: rebuild + validate envelope only (fast). Pass --full for unified gate replay.
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const TEMPLATE = path.join(REPO, "tools/bootstrap/templates/run-close-out-gates.mjs");
const REQ = "REQ-REQUEST_EVIDENCE_ENVELOPE";

const baseArgs = [
  TEMPLATE,
  "--project-root",
  REPO,
  "--request-token",
  REQ,
  "--tracker-path",
  `working/${REQ}/agent-req-implementation-checklist.yaml`,
  "--citdp-path",
  `working/${REQ}/CITDP-REQ-REQUEST_EVIDENCE_ENVELOPE.yaml`,
  "--phase",
  "close_out",
  "--run-id",
  "ree-envelope-refresh-20260911",
  "--envelope-blocking",
];

if (process.argv.includes("--full")) {
  baseArgs.push("--sync-dispositions", "--reconcile");
} else {
  baseArgs.push("--rebuild-envelope-only", "--skip-manifest");
}

const result = execFileSync(process.execPath, baseArgs, {
  cwd: REPO,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});
process.stdout.write(result);
