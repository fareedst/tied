import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  checklistTestdataDirFromModule,
  liveTestdataDirFromModule,
  repoRootFromModule,
} from "./paths.js";
import {
  normalizeDryRunOutput,
  readOracleFixture,
} from "./fixture-oracle.js";

// [IMPL-TIED_UNIFIED_TOOLCHAIN] [REQ-GOAGENT-CHECKLIST-CONTROL] Phase 4a live run
describe("live executor TS [REQ-TIED_UNIFIED_TOOLCHAIN]", () => {
  const liveDir = liveTestdataDirFromModule(import.meta.url);
  const repoRoot = repoRootFromModule(import.meta.url);
  const entry = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "index.js",
  );

  it("routes control goto via TS live run", () => {
    try {
      execFileSync("ruby", ["--version"], { encoding: "utf8" });
    } catch {
      return;
    }
    const fixture = fs.readFileSync(
      path.join(liveDir, "fake_agent.rb"),
      "utf8",
    );
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "as-live-"));
    const fakeAgent = path.join(dir, "fake_agent.rb");
    fs.writeFileSync(fakeAgent, fixture, { mode: 0o755 });
    const checklist = path.join(liveDir, "control-checklist.yaml");
    const ws = fs.mkdtempSync(path.join(os.tmpdir(), "as-ws-"));

    const baseArgs = [
      "--workspace",
      ws,
      "--lead-checklist-yaml",
      checklist,
      "--lead-checklist-skip-sub",
      "--agent-path",
      fakeAgent,
      "--skip-tied-mcp-preflight",
    ];

    const tsRun = execFileSync(process.execPath, [entry, ...baseArgs], {
      encoding: "utf8",
      cwd: repoRoot,
    });

    for (const want of ["fake agent processed trigger-special", "fake agent processed rerouted-next"]) {
      assert.match(tsRun, new RegExp(want));
    }
    assert.doesNotMatch(tsRun, /fake agent processed normal-next/);
    assert.doesNotMatch(
      tsRun,
      /forwarding to Go agentstream/,
      "live checklist must not forward",
    );
  });

  it("dry-run with --verify-session matches frozen oracle", () => {
    const testdata = checklistTestdataDirFromModule(import.meta.url);
    const checklist = path.join(testdata, "gate-fixture-checklist.yaml");
    const ws = fs.mkdtempSync(path.join(os.tmpdir(), "as-vs-"));
    const baseArgs = [
      "-d",
      "-w",
      ws,
      "-c",
      checklist,
      "--lead-checklist-skip-sub",
      "--skip-tied-mcp-preflight",
      "--verify-session",
    ];
    const oracle = normalizeDryRunOutput(
      readOracleFixture(import.meta.url, "dry-run-verify-session.txt"),
    );
    const tsOut = normalizeDryRunOutput(
      execFileSync(process.execPath, [entry, ...baseArgs], {
        encoding: "utf8",
        cwd: repoRoot,
      }),
    );
    assert.equal(tsOut, oracle);
    assert.match(tsOut, /what was the most recent prompt/);
  });

  function writeCompositionEvidenceFiles(workspace: string): void {
    for (const step of ["step-one", "step-two"]) {
      const p = path.join(workspace, "evidence", `${step}.md`);
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, `composition evidence for ${step}\n`);
    }
  }

  function runTrackerComposition(omitReceipt: boolean): {
    stdout: string;
    stderr: string;
    exitCode: number;
    trackerPath: string;
    checklistPath: string;
  } {
    const checklist = path.join(liveDir, "tracker-checklist.yaml");
    const fakeAgent = path.join(liveDir, "fake_tracker_agent.rb");
    const ws = fs.mkdtempSync(path.join(os.tmpdir(), "as-trk-"));
    const trackerPath = path.join(ws, "tracker.yaml");
    writeCompositionEvidenceFiles(ws);
    const defBefore = fs.readFileSync(checklist, "utf8");
    const baseArgs = [
      "--workspace",
      ws,
      "--lead-checklist-yaml",
      checklist,
      "--checklist-tracker-yaml",
      trackerPath,
      "--lead-checklist-skip-sub",
      "--checklist-var",
      "REQUEST=REQ-TRACKER-COMPOSITION",
      "--agent-path",
      fakeAgent,
      "--skip-tied-mcp-preflight",
    ];
    const env = {
      ...process.env,
      ...(omitReceipt ? { OMIT_TRACKER_RECEIPT: "1" } : {}),
    };
    let stdout = "";
    let stderr = "";
    let exitCode = 0;
    try {
      stdout = execFileSync(process.execPath, [entry, ...baseArgs], {
        encoding: "utf8",
        cwd: repoRoot,
        env,
      });
    } catch (err) {
      const e = err as { status?: number; stdout?: string; stderr?: string };
      exitCode = e.status ?? 1;
      stdout = e.stdout ?? "";
      stderr = e.stderr ?? "";
    }
    const defAfter = fs.readFileSync(checklist, "utf8");
    assert.equal(defBefore, defAfter, "canonical checklist bytes must not change");
    return { stdout, stderr, exitCode, trackerPath, checklistPath: checklist };
  }

  it("tracker mode requires receipt before turn N+1 (TS)", () => {
    try {
      execFileSync("ruby", ["--version"], { encoding: "utf8" });
    } catch {
      return;
    }
    const ts = runTrackerComposition(false);
    assert.equal(ts.exitCode, 0, ts.stderr);
    assert.match(ts.stdout, /fake tracker agent processed step-one/);
    assert.match(ts.stdout, /fake tracker agent processed step-two/);
    assert.ok(fs.existsSync(ts.trackerPath), "tracker yaml must be written");
    assert.doesNotMatch(ts.stderr, /forwarding to Go agentstream/);
  });

  it("tracker mode exits when receipt omitted (TS)", () => {
    try {
      execFileSync("ruby", ["--version"], { encoding: "utf8" });
    } catch {
      return;
    }
    const ts = runTrackerComposition(true);
    assert.notEqual(ts.exitCode, 0);
    assert.doesNotMatch(ts.stdout, /fake tracker agent processed step-two/);
  });
});
