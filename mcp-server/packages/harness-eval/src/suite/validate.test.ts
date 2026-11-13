import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { computeSuiteIntegritySha256, validateSuiteIntegrity } from "./integrity.js";
import { runCli } from "../cli/main.js";

describe("suite validate SC-HMEP-M1-05", () => {
  it("fails when integrity hash tampered", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hmep-suite-"));
    const doc = {
      schema_version: "harness-eval-suite-v1",
      suite_id: "test-suite",
      suite_revision: "1",
      content_integrity_sha256: "deadbeef",
      scenarios: [],
    };
    const p = path.join(tmp, "suite.yaml");
    fs.writeFileSync(p, `schema_version: harness-eval-suite-v1\nsuite_id: test-suite\nsuite_revision: "1"\ncontent_integrity_sha256: deadbeef\nscenarios: []\n`);
    assert.equal(runCli(["suite", "validate", p]), 1);
    const okHash = computeSuiteIntegritySha256(doc as Record<string, unknown>);
    doc.content_integrity_sha256 = okHash;
    fs.writeFileSync(
      p,
      `schema_version: harness-eval-suite-v1\nsuite_id: test-suite\nsuite_revision: "1"\ncontent_integrity_sha256: ${okHash}\nscenarios: []\n`,
    );
    assert.equal(validateSuiteIntegrity(doc as Record<string, unknown>).ok, true);
    assert.equal(runCli(["suite", "validate", p]), 0);
  });
});
