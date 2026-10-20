#!/usr/bin/env node
/**
 * [REQ-TIED_UNIFIED_TOOLCHAIN] minimal-depth close-out for store CLI help slice.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../../..");
const RUN_ID = "store-cli-help-closeout-20261019";

async function main() {
  execFileSync(
    "node",
    [
      path.join(REPO, "tools/bootstrap/templates/run-close-out-gates.mjs"),
      "--project-root",
      REPO,
      "--request-token",
      "REQ-TIED_UNIFIED_TOOLCHAIN",
      "--tracker-path",
      "tied-project/working/REQ-TIED_UNIFIED_TOOLCHAIN/agent-req-checklist-store-cli-help-closeout.yaml",
      "--citdp-path",
      "tied-project/working/REQ-TIED_UNIFIED_TOOLCHAIN/CITDP-store-cli-help-closeout.yaml",
      "--phase",
      "close_out",
      "--run-id",
      RUN_ID,
      "--envelope-blocking",
      "--sync-dispositions",
      "--reconcile",
    ],
    { cwd: REPO, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );

  const outPath = path.join(__dirname, "evidence/closeout-run-close-out-gates-store-cli-help.stdout.txt");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `run_id=${RUN_ID}\nreplay: node tied-project/working/REQ-TIED_UNIFIED_TOOLCHAIN/run-close-out-gates-store-cli-help.mjs\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
