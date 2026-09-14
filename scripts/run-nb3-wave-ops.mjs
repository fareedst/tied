#!/usr/bin/env node
/**
 * NB-3-D/F: external client scan + G3 apply per wave-3 client.
 * [REQ-PSEUDOCODE_FLEET_NB3_TRANCHE_TWO]
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STDD = path.resolve(__dirname, "..");
const QUAL = path.join(
  STDD,
  "working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/scripts",
);

const CLIENT_IDS = [
  "1787495576",
  "1787603099",
  "1787416567",
  "1787507684",
  "1787638699",
];

function runTs(script, args = []) {
  const cmd = [
    "node",
    "--experimental-strip-types",
    path.join(QUAL, script),
    ...args,
  ].join(" ");
  execSync(cmd, { cwd: STDD, stdio: "inherit" });
}

execSync("python3 scripts/run-nb3-partition-append.py", { cwd: STDD, stdio: "inherit" });

for (const clientId of CLIENT_IDS) {
  const waveId = `W-ext-${clientId}-1`;
  console.log(`\n=== NB-3-D/F ${clientId} ${waveId} ===`);
  runTs("run-fleet-external-client-scan.ts", ["--client-id", clientId, "--wave-id", waveId]);
  runTs("run-fleet-external-client-apply.ts", ["--wave-id", waveId]);
  runTs("run-fleet-external-client-apply.ts", ["--wave-id", waveId, "--apply"]);
}

console.log("TRACE: NB-3 wave ops complete");
