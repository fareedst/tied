/**
 * [REQ-AGENTSTREAM_OPERATOR_STDERR_ELAPSED] T-OSEL-01..03, T-OSEL-06
 */
import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";

import {
  formatOperatorStderrLine,
  operatorDebug,
  operatorDiagnostic,
  operatorElapsedEnabled,
  operatorStderrUseColor,
} from "./operator-stderr-line.js";

const envSnapshot: Record<string, string | undefined> = {};

function saveEnv(keys: string[]) {
  for (const k of keys) {
    envSnapshot[k] = process.env[k];
  }
}

function restoreEnv(keys: string[]) {
  for (const k of keys) {
    if (envSnapshot[k] === undefined) {
      delete process.env[k];
    } else {
      process.env[k] = envSnapshot[k];
    }
  }
}

describe("operator-stderr-line [REQ-AGENTSTREAM_OPERATOR_STDERR_ELAPSED]", () => {
  const keys = [
    "TIED_OPERATOR_EPOCH_MS",
    "AGENTSTREAM_OPERATOR_ELAPSED",
    "NO_COLOR",
    "TIED_CLI_PLAIN",
  ];

  beforeEach(() => saveEnv(keys));
  afterEach(() => restoreEnv(keys));

  it("T-OSEL-01: offset 0000 and 0001 with fixed epoch", () => {
    process.env.TIED_OPERATOR_EPOCH_MS = "1000000";
    delete process.env.AGENTSTREAM_OPERATOR_ELAPSED;
    const a = formatOperatorStderrLine("DIAGNOSTIC", "harness=x", 1000000);
    assert.equal(a, "0000 DIAGNOSTIC: harness=x\n");
    const b = formatOperatorStderrLine("DIAGNOSTIC", "batch=y", 1001500);
    assert.equal(b, "0001 DIAGNOSTIC: batch=y\n");
  });

  it("T-OSEL-01: idempotent when already prefixed", () => {
    const line = "0042 DIAGNOSTIC: already\n";
    assert.equal(formatOperatorStderrLine("DIAGNOSTIC", line), line);
  });

  it("T-OSEL-02: plain when NO_COLOR", () => {
    process.env.TIED_OPERATOR_EPOCH_MS = "0";
    process.env.NO_COLOR = "1";
    const line = operatorDiagnostic("msg", 5000);
    assert.equal(line, "0005 DIAGNOSTIC: msg\n");
    assert.doesNotMatch(line, /\x1b\[/);
    assert.equal(operatorStderrUseColor(), false);
  });

  it("T-OSEL-06: opt-out preserves legacy shape", () => {
    process.env.AGENTSTREAM_OPERATOR_ELAPSED = "0";
    assert.equal(operatorElapsedEnabled(), false);
    assert.equal(operatorDiagnostic("legacy"), "DIAGNOSTIC: legacy\n");
    assert.equal(operatorDebug("verbose"), "DEBUG: verbose\n");
  });

  it("T-OSEL-03: DEBUG and DIAGNOSTIC patterns", () => {
    process.env.TIED_OPERATOR_EPOCH_MS = "900000";
    const d = operatorDebug("preflight", 902000);
    assert.match(d, /^0002 DEBUG: preflight\n$/);
    const x = operatorDiagnostic("warn", 901000);
    assert.match(x, /^0001 DIAGNOSTIC: warn\n$/);
  });
});