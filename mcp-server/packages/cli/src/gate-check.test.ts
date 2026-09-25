import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  runGateCheckComposition,
  type GateValidateFn,
} from "../../../dist/dae/gate-check-composition.js";

// [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: W1a composition mocks gate MCP; fixture gate-blocked-minimal → exit 1.

describe("tied gate check composition [REQ-TIED_DAE_INCORPORATION]", () => {
  let tempDir: string;
  let repoRoot: string;
  let origCwd: string;

  beforeEach(() => {
    origCwd = process.cwd();
    repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../");
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "gate-check-test-"));
    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(origCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("returns exit 1 when mocked gate returns allowed:false", async () => {
    const fixtureRoot = repoRoot;
    const tracker = path.join(
      fixtureRoot,
      "working/REQ-TIED_DAE_INCORPORATION/fixtures/trackers/gate-blocked-minimal.yaml",
    );
    const citdp = path.join(
      fixtureRoot,
      "working/REQ-TIED_DAE_INCORPORATION/fixtures/citdp/w1-gate-check-minimal.yaml",
    );
    const mockGate: GateValidateFn = async () => ({
      allowed: false,
      reasons: ["test_strategy_pending"],
    });

    const summary = await runGateCheckComposition({
      requestToken: "REQ-TIED_DAE_INCORPORATION",
      phase: "pre_implementation",
      trackerPath: tracker,
      citdpPath: citdp,
      projectRoot: fixtureRoot,
      callGateValidate: mockGate,
    });

    assert.equal(summary.exit_code, 1);
    assert.equal(summary.allowed, false);
    assert.deepEqual(summary.reasons, ["test_strategy_pending"]);
  });

  it("returns exit 2 when tracker path is missing", async () => {
    const mockGate: GateValidateFn = async () => ({ allowed: true });
    const summary = await runGateCheckComposition({
      requestToken: "REQ-TIED_DAE_INCORPORATION",
      phase: "pre_implementation",
      trackerPath: path.join(tempDir, "missing-tracker.yaml"),
      citdpPath: path.join(tempDir, "missing-citdp.yaml"),
      projectRoot: tempDir,
      callGateValidate: mockGate,
    });
    assert.equal(summary.exit_code, 2);
  });

  it("returns exit 0 when mocked gate allows", async () => {
    const fixtureRoot = repoRoot;
    const tracker = path.join(
      fixtureRoot,
      "working/REQ-TIED_DAE_INCORPORATION/fixtures/trackers/gate-blocked-minimal.yaml",
    );
    const citdp = path.join(
      fixtureRoot,
      "working/REQ-TIED_DAE_INCORPORATION/fixtures/citdp/w1-gate-check-minimal.yaml",
    );
    const mockGate: GateValidateFn = async () => ({ allowed: true });

    const summary = await runGateCheckComposition({
      requestToken: "REQ-TIED_DAE_INCORPORATION",
      phase: "pre_implementation",
      trackerPath: tracker,
      citdpPath: citdp,
      projectRoot: fixtureRoot,
      callGateValidate: mockGate,
    });

    assert.equal(summary.exit_code, 0);
    assert.equal(summary.allowed, true);
  });
});
