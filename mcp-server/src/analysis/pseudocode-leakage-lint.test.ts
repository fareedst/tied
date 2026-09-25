import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { lintPseudocodeLeakage } from "./pseudocode-leakage-lint.js";

// [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: W2b leakage corpus tests.

describe("pseudocode leakage lint [REQ-TIED_DAE_INCORPORATION]", () => {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
  const fixtureDir = path.join(
    repoRoot,
    "working/REQ-TIED_DAE_INCORPORATION/fixtures/pseudocode",
  );

  it("flags leaky-sidecar corpus", () => {
    const text = fs.readFileSync(path.join(fixtureDir, "leaky-sidecar.md"), "utf8");
    const report = lintPseudocodeLeakage(text, { gate_mode: true });
    assert.equal(report.ok, false);
    assert.ok(report.diagnostics.some((d) => d.pattern === "function_kw"));
    assert.ok(report.diagnostics.some((d) => d.pattern === "import_kw"));
  });

  it("accepts clean-sidecar corpus", () => {
    const text = fs.readFileSync(path.join(fixtureDir, "clean-sidecar.md"), "utf8");
    const report = lintPseudocodeLeakage(text, { gate_mode: true });
    assert.equal(report.ok, true);
    assert.equal(report.diagnostics.length, 0);
  });
});
