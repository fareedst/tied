/**
 * [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] PLAN-GF-05-SCOPE-CLOSE-OUT-EXT
 * How: close_out runner persists checklist-gate-receipt.v1 by default; --no-persist-gate-receipt opts out.
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const runner = path.join(repoRoot, "tools/bootstrap/templates/run-close-out-gates.mjs");
const requestToken = "PLAN-GF-05-SCOPE-CLOSE-OUT-EXT";
const gatesDir = path.join(repoRoot, "tied-bundle/working", requestToken, "gates");

function listCloseOutReceipts(): string[] {
  if (!fs.existsSync(gatesDir)) return [];
  return fs.readdirSync(gatesDir).filter((name) => name.startsWith("close_out-") && name.endsWith(".json"));
}

function runRunner(extraArgs: string[] = []): void {
  execFileSync(
    process.execPath,
    [
      runner,
      "--project-root",
      repoRoot,
      "--request-token",
      requestToken,
      "--tracker-path",
      "tied-project/working/PLAN-GF-05-GATE-VERIFY-DUAL-TRACK/checklist-tracker.yaml",
      "--citdp-path",
      "tied-project/working/PLAN-GF-05-GATE-VERIFY-DUAL-TRACK/CITDP-PLAN-GF-05-SCOPE-CLOSE-OUT-EXT.yaml",
      "--phase",
      "close_out",
      "--skip-manifest",
      "--run-id",
      "gf05-track-a-contract-test",
      ...extraArgs,
    ],
    { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
}

describe("GF-05 Track A close_out runner persistence [PLAN-GF-05-SCOPE-CLOSE-OUT-EXT]", () => {
  it("run-close-out-gates.mjs writes close_out gate receipt by default [SC-RUNNER-PERSIST]", () => {
    fs.mkdirSync(gatesDir, { recursive: true });
    const before = listCloseOutReceipts().length;
    runRunner();
    const after = listCloseOutReceipts();
    assert.ok(after.length > before, "expected new close_out-*.json under tied-bundle/working gates");
    const newest = after.sort().at(-1)!;
    const receipt = JSON.parse(fs.readFileSync(path.join(gatesDir, newest), "utf8")) as Record<
      string,
      unknown
    >;
    assert.equal(receipt.schema_version, "checklist-gate-receipt.v1");
    assert.equal(receipt.phase, "close_out");
  });

  it("--no-persist-gate-receipt skips new close_out receipt [SC-RUNNER-OPT-OUT]", () => {
    fs.mkdirSync(gatesDir, { recursive: true });
    const before = listCloseOutReceipts().length;
    runRunner(["--no-persist-gate-receipt"]);
    const after = listCloseOutReceipts().length;
    assert.equal(after, before);
  });

  it("runner help documents persist flags [SC-DOC-CLOSE-OUT]", () => {
    const help = execFileSync(process.execPath, [runner, "--help"], { encoding: "utf8" });
    assert.match(help, /--no-persist-gate-receipt/);
    assert.match(help, /close_out.*receipt|persist.*close_out/i);
  });
});
