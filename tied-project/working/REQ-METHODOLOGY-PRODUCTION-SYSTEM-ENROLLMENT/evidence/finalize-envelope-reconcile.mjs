/**
 * Tighten request-evidence-envelope: profile + manifest on disk, rebuild, strict validate.
 * Usage: node finalize-envelope-reconcile.mjs
 * Optional: run from repo root after gates; does not re-run adversarial inquiry.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const reqDir = path.dirname(here);
const root = path.resolve(reqDir, "../../..");
const REQUEST = "REQ-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT";
const TEMPLATE = path.join(root, "tools/bootstrap/templates/run-close-out-gates.mjs");

const required = [
  path.join(here, "evidence-chain-profile.v1.json"),
  path.join(here, "verification-evidence-manifest.v1.json"),
];
for (const file of required) {
  if (!fs.existsSync(file)) {
    throw new Error(`missing ${path.relative(root, file)} — run profile/manifest steps first`);
  }
}

execFileSync(process.execPath, [path.join(here, "dismiss-advisory-inquiry-findings.mjs")], {
  cwd: root,
  stdio: "inherit",
});

const args = [
  TEMPLATE,
  "--project-root",
  root,
  "--request-token",
  REQUEST,
  "--tracker-path",
  `tied-project/working/${REQUEST}/checklist-tracker.yaml`,
  "--citdp-path",
  `tied-project/citdp/CITDP-${REQUEST}.yaml`,
  "--phase",
  "close_out",
  "--run-id",
  "mpse-closeout-20261010",
  "--rebuild-envelope-only",
  "--envelope-blocking",
  "--fail-on-process-gaps",
  "--sync-dispositions",
  "--reconcile",
];

const out = execFileSync(process.execPath, args, {
  cwd: root,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});
process.stdout.write(out);
