import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateControlledFault, runBoundedAssurance } from "./assurance.js";

describe("RUN_BOUNDED_COMMAND REQ-TIED_ADVERSARIAL_INQUIRY", () => {
  it("runs argv-only commands with bounded and redacted evidence", async () => {
    const result = await runBoundedAssurance({
      id: "redaction-control",
      argv: [process.execPath, "-e", "process.stdout.write('secret-value')"],
      cwd: process.cwd(),
      projectRoot: process.cwd(),
      timeoutMs: 1_000,
      maxOutputBytes: 100,
      redact: ["secret-value"],
      seed: "seed-1",
      toolVersion: "node-test",
    });

    assert.equal(result.status, "passed");
    assert.equal(result.stdout, "[REDACTED]");
    assert.deepEqual(result.diagnostics, []);
    assert.equal(result.seed, "seed-1");
  });

  it("fails closed for shell commands and output overflow", async () => {
    const shell = await runBoundedAssurance({
      id: "unsafe-shell",
      argv: ["sh", "-c", "true"],
      cwd: process.cwd(),
      projectRoot: process.cwd(),
    });
    const overflow = await runBoundedAssurance({
      id: "overflow",
      argv: [process.execPath, "-e", "process.stdout.write('123456789')"],
      cwd: process.cwd(),
      projectRoot: process.cwd(),
      maxOutputBytes: 3,
    });

    assert.equal(shell.status, "unresolved");
    assert.ok(shell.diagnostics.includes("unsupported_command"));
    assert.equal(overflow.status, "failed");
    assert.ok(overflow.diagnostics.includes("output_limit"));
  });
});

describe("CONTROLLED_COMPOSITION_FAULT REQ-TIED_ADVERSARIAL_INQUIRY", () => {
  it("detects a known-bad fault and requires a limitation for N/A", () => {
    const detected = evaluateControlledFault({
      id: "wrong-arguments",
      point: "arguments",
      expectedOutcome: "failed",
      observedOutcome: "failed",
    });
    const notApplicable = evaluateControlledFault({
      id: "ordering",
      point: "ordering",
      expectedOutcome: "failed",
      observedOutcome: "not_applicable",
      limitation: "The platform owns event ordering outside this adapter.",
    });

    assert.equal(detected.status, "detected");
    assert.equal(notApplicable.status, "not_applicable");
    assert.equal(notApplicable.limitation, "The platform owns event ordering outside this adapter.");
  });
});
