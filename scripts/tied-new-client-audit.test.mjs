/**
 * [IMPL-TIED_NEW_CLIENT_ONBOARDING] [REQ-TIED_NEW_CLIENT_ADHERENCE]
 * Unit tests for new-client onboarding audit wrapper.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  buildOnboardingAuditReport,
  PROOF_BOUNDARY,
  resolveClientRoot,
  runTiedNewClientAudit,
  SCHEMA_VERSION,
  writeOnboardingAuditReport,
} from "./lib/tied-new-client-audit.mjs";

function mkMinimalClientRoot(tmp) {
  fs.mkdirSync(path.join(tmp, "tied"), { recursive: true });
  fs.mkdirSync(path.join(tmp, "templates"), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, "templates", "impl-essence-pseudocode-template.md"),
    "Grammar-Version: v2\n\nPROC PLACEHOLDER()\n  PRE: true\n  POST: true\n  EFFECTS: none\n",
    "utf8",
  );
  return tmp;
}

describe("tied new client audit [REQ-TIED_NEW_CLIENT_ADHERENCE]", () => {
  it("resolveClientRoot rejects missing tied/", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "nc-audit-"));
    assert.throws(() => resolveClientRoot(tmp), /CLIENT_ROOT_INVALID.*tied/);
  });

  it("buildOnboardingAuditReport ok false when grammar audit fails", () => {
    const report = buildOnboardingAuditReport({
      clientRoot: "/tmp/client",
      grammarAudit: { ok: false, schema_version: "grammar-v2-default-audit.v1" },
      withConsistency: false,
      generatedAt: "2026-09-13T22:30:00.000Z",
    });
    assert.equal(report.ok, false);
    assert.equal(report.schema_version, SCHEMA_VERSION);
    assert.equal(report.proof_boundary, PROOF_BOUNDARY);
    assert.equal(report.consistency.skipped, true);
  });

  it("buildOnboardingAuditReport requires consistency ok when withConsistency", () => {
    const fail = buildOnboardingAuditReport({
      clientRoot: "/tmp/client",
      grammarAudit: { ok: true },
      withConsistency: true,
      consistencyResult: { ok: false },
    });
    assert.equal(fail.ok, false);

    const pass = buildOnboardingAuditReport({
      clientRoot: "/tmp/client",
      grammarAudit: { ok: true },
      withConsistency: true,
      consistencyResult: { ok: true },
    });
    assert.equal(pass.ok, true);
  });

  it("runTiedNewClientAudit writes report and returns ok from mocked grammar audit", () => {
    const tmp = mkMinimalClientRoot(fs.mkdtempSync(path.join(os.tmpdir(), "nc-audit-")));
    const reportPath = path.join(tmp, "working", "onboarding-audit.json");
    const result = runTiedNewClientAudit({
      clientRoot: tmp,
      reportPath,
      runGrammarAudit: () => ({
        ok: true,
        schema_version: "grammar-v2-default-audit.v1",
        gate_stage: "G4",
      }),
    });
    assert.equal(result.ok, true);
    assert.ok(fs.existsSync(reportPath));
    const written = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    assert.equal(written.schema_version, SCHEMA_VERSION);
    assert.equal(written.grammar_audit.ok, true);
  });

  it("writeOnboardingAuditReport creates parent directories", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "nc-audit-"));
    const deep = path.join(tmp, "a", "b", "report.json");
    writeOnboardingAuditReport(deep, {
      schema_version: SCHEMA_VERSION,
      ok: true,
    });
    assert.ok(fs.existsSync(deep));
  });
});
