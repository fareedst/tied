#!/usr/bin/env node
/** Shim — canonical: tools/bootstrap/lib/build-wf-trial-comparison-matrix.mjs */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const target = path.resolve(
  __dirname,
  "../../../../tools/bootstrap/lib/build-wf-trial-comparison-matrix.mjs",
);
const r = spawnSync(process.execPath, [target, ...process.argv.slice(2)], {
  stdio: "inherit",
});
process.exit(r.status ?? 1);
