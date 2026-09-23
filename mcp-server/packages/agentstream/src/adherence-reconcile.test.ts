import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { runAdherenceReconcileCli } from "./adherence-reconcile-cli.js";
import { goAgentstreamModuleDirFromModule } from "./paths.js";

// [IMPL-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
describe("adherence reconcile TS vs Go oracle", () => {
  const moduleDir = goAgentstreamModuleDirFromModule(import.meta.url);
  const repoRoot = path.resolve(moduleDir, "../..");

  function runGo(args: string[], cwd: string): { exitCode: number; stdout: string; stderr: string } {
    try {
      const stdout = execFileSync(
        "go",
        ["run", "-C", moduleDir, "./cmd/adherence-reconcile", ...args],
        { encoding: "utf8", cwd, stdio: ["ignore", "pipe", "pipe"] },
      );
      return { exitCode: 0, stdout, stderr: "" };
    } catch (err) {
      const e = err as { status?: number; stdout?: string; stderr?: string };
      return {
        exitCode: e.status ?? 1,
        stdout: e.stdout ?? "",
        stderr: e.stderr ?? "",
      };
    }
  }

  function writeTracker(dir: string, body: Record<string, unknown>): string {
    const p = path.join(dir, "tracker.yaml");
    fs.writeFileSync(
      p,
      `request_token: ${String(body.request_token ?? "REQ-TEST")}\nschema_version: checklist-tracker.v1\nsteps: []\n`,
    );
    return p;
  }

  function writeLedger(dir: string, rows: Record<string, unknown>[]): string {
    const p = path.join(dir, "events.jsonl");
    fs.writeFileSync(
      p,
      rows.map((r) => JSON.stringify(r)).join("\n") + (rows.length ? "\n" : ""),
    );
    return p;
  }

  it("legacy_no_adherence_chain matches Go", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "recon-ts-"));
    const trackerPath = writeTracker(dir, { request_token: "REQ-TEST" });
    const args = ["--ledger", path.join(dir, "missing.jsonl"), "--tracker", trackerPath, "--workspace", dir];
    const go = runGo(args, dir);
    const ts = runAdherenceReconcileCli(args);
    assert.equal(ts.exitCode, go.exitCode);
    assert.deepEqual(JSON.parse(ts.stdout), JSON.parse(go.stdout));
  });

  it("rendered_without_acknowledgment matches Go", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "recon-ts-"));
    const ledgerPath = writeLedger(dir, [
      {
        schema_version: "agent-adherence-event.v1",
        event_class: "instruction_rendered",
        correlation: {
          request_token: "REQ-CLI",
          turn_index: 1,
          step_slug: "alpha",
          instruction_hash: "sha256:one",
          instruction_nonce: "nonce-a",
        },
      },
    ]);
    const trackerPath = writeTracker(dir, { request_token: "REQ-CLI" });
    const args = ["--ledger", ledgerPath, "--tracker", trackerPath, "--workspace", dir];
    const go = runGo(args, dir);
    const ts = runAdherenceReconcileCli(args);
    assert.equal(ts.exitCode, go.exitCode);
    const goReport = JSON.parse(go.stdout) as { findings: Array<{ code: string }> };
    const tsReport = JSON.parse(ts.stdout) as { findings: Array<{ code: string }> };
    assert.ok(
      tsReport.findings.some((f) => f.code === "rendered_without_acknowledgment"),
    );
    assert.deepEqual(
      tsReport.findings.map((f) => f.code).sort(),
      goReport.findings.map((f) => f.code).sort(),
    );
  });

  it("tied agentstream impl=ts adherence-reconcile does not forward to Go", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "recon-cli-"));
    const trackerPath = writeTracker(dir, { request_token: "REQ-TEST" });
    const cliEntry = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../cli/dist/index.js",
    );
    assert.ok(fs.existsSync(cliEntry), "build @tied/cli first");
    const run = spawnSync(
      process.execPath,
      [
        cliEntry,
        "agentstream",
        "adherence-reconcile",
        "--ledger",
        path.join(dir, "missing.jsonl"),
        "--tracker",
        trackerPath,
        "--workspace",
        dir,
      ],
      {
        encoding: "utf8",
        cwd: repoRoot,
        env: { ...process.env, TIED_AGENTSTREAM_IMPL: "ts" },
      },
    );
    assert.doesNotMatch(String(run.stderr), /forwarding to Go agentstream/);
    assert.equal(run.status, 0);
  });
});
