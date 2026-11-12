/**
 * [IMPL-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] [REQ-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT]
 * SC-WF-SPT-01..03 — emitTurnOperatorLine and executeLiveRun exit de-dup.
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { parseDryRunConfig } from "./dry-run-config.js";
import {
  emitTurnOperatorLine,
  executeLiveRun,
  isTurnOperatorLine,
  liveExitStdoutIsOperatorMirrorOnly,
} from "./live-executor.js";
import { liveTestdataDirFromModule } from "./paths.js";

function assertNoOperatorLinesInStderr(stderr: string): void {
  for (const raw of stderr.split("\n")) {
    const line = raw.trimEnd();
    if (line === "") {
      continue;
    }
    assert.doesNotMatch(
      line,
      /^--- turn /,
      "operator turn banner must not appear in exit stderrAcc",
    );
    assert.doesNotMatch(
      line,
      /^session_id=/,
      "operator session_id must not appear in exit stderrAcc",
    );
  }
}

describe("emitTurnOperatorLine [REQ-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT]", () => {
  it("liveExitStdoutIsOperatorMirrorOnly detects duplicate exit write case [SC-WF-SPT-03]", () => {
    const operatorOnly = "\n--- turn 1/4 (new session) ---\n";
    assert.equal(liveExitStdoutIsOperatorMirrorOnly(operatorOnly), true);
    assert.equal(
      liveExitStdoutIsOperatorMirrorOnly(`${operatorOnly}agent chunk\n`),
      false,
    );
    assert.equal(liveExitStdoutIsOperatorMirrorOnly(""), true);
  });

  it("isTurnOperatorLine matches banner and session_id only [SC-WF-SPT-01]", () => {
    assert.equal(isTurnOperatorLine("--- turn 1/4 (new session) ---\n"), true);
    assert.equal(isTurnOperatorLine("session_id=abc\n"), true);
    assert.equal(isTurnOperatorLine("DIAGNOSTIC: x\n"), false);
    assert.equal(isTurnOperatorLine("agentstream: error\n"), false);
  });

  it("mirrors to stdoutAcc and writes fds 1 and 2 before return [SC-WF-SPT-01 SC-WF-SPT-02]", () => {
    const banner = "\n--- turn 2/4 (resume sid) [stub] ---\n";
    const streams = { stdoutAcc: "", stderrAcc: "preflight\n" };
    const stderrBefore = streams.stderrAcc;
    const order: Array<{ fd: number; text: string }> = [];
    const writeSync = (fd: number, buf: string | Uint8Array) => {
      order.push({ fd, text: String(buf) });
      return String(buf).length;
    };
    const emit = emitTurnOperatorLine(banner, streams, writeSync as typeof fs.writeSync);
    assert.equal(emit.ok, true);
    assert.equal(streams.stdoutAcc, banner);
    assert.equal(streams.stderrAcc, stderrBefore);
    assert.deepEqual(
      order.map((e) => e.fd),
      [1, 2],
    );
    assert.equal(order[0]!.text, banner);
    assert.equal(order[1]!.text, banner);
  });

  it("session_id line uses same dual-stream contract [SC-WF-SPT-01]", () => {
    const line = "session_id=test-session\n";
    const streams = { stdoutAcc: "", stderrAcc: "" };
    const writeSync = (fd: number, buf: string | Uint8Array) => String(buf).length;
    const emit = emitTurnOperatorLine(line, streams, writeSync as typeof fs.writeSync);
    assert.equal(emit.ok, true);
    assert.match(streams.stdoutAcc, /^session_id=test-session/);
  });
});

describe("executeLiveRun operator stderr de-dup [REQ-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT]", () => {
  const liveDir = liveTestdataDirFromModule(import.meta.url);

  it("returns operator lines on stdout only, not exit stderr [SC-WF-SPT-03]", async () => {
    try {
      execFileSync("ruby", ["--version"], { encoding: "utf8" });
    } catch {
      return;
    }
    const fixture = fs.readFileSync(path.join(liveDir, "fake_agent.rb"), "utf8");
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "as-spt-"));
    const fakeAgent = path.join(dir, "fake_agent.rb");
    fs.writeFileSync(fakeAgent, fixture, { mode: 0o755 });
    const checklist = path.join(liveDir, "control-checklist.yaml");
    const ws = fs.mkdtempSync(path.join(os.tmpdir(), "as-spt-ws-"));
    const cfg = parseDryRunConfig(ws, [
      "--workspace",
      ws,
      "--lead-checklist-yaml",
      checklist,
      "--lead-checklist-skip-sub",
      "--agent-path",
      fakeAgent,
      "--skip-tied-mcp-preflight",
    ]);
    const prevHarness = process.env.AGENTSTREAM_JEV_HARNESS;
    process.env.AGENTSTREAM_JEV_HARNESS = "0";
    let result;
    try {
      result = await executeLiveRun(cfg);
    } finally {
      if (prevHarness === undefined) {
        delete process.env.AGENTSTREAM_JEV_HARNESS;
      } else {
        process.env.AGENTSTREAM_JEV_HARNESS = prevHarness;
      }
    }
    assert.equal(result.exitCode, 0, result.stderr);
    assert.match(result.stdout, /--- turn /);
    assert.match(result.stdout, /session_id=/);
    assertNoOperatorLinesInStderr(result.stderr);
  });
});
