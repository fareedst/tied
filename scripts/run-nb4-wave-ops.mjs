#!/usr/bin/env node
/**
 * NB-4-D/F: external client scan + G3 apply per wave-4 client.
 * [REQ-PSEUDOCODE_FLEET_NB4_TRANCHE_FINAL]
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
  "1787691672",
  "1787626480",
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

execSync("python3 scripts/run-nb4-partition-append.py", { cwd: STDD, stdio: "inherit" });

for (const clientId of CLIENT_IDS) {
  const waveId = `W-ext-${clientId}-1`;
  console.log(`\n=== NB-4-D/F ${clientId} ${waveId} ===`);
  runTs("run-fleet-external-client-scan.ts", ["--client-id", clientId, "--wave-id", waveId]);
  runTs("run-fleet-external-client-apply.ts", ["--wave-id", waveId]);
  runTs("run-fleet-external-client-apply.ts", ["--wave-id", waveId, "--apply"]);
}

console.log("TRACE: NB-4 wave ops complete");
