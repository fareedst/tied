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
  resolveInstallProfile,
  runTiedNewClientAudit,
  SCHEMA_VERSION,
  writeOnboardingAuditReport,
} from "./lib/tied-new-client-audit.mjs";
import { writeInstallConfig } from "../tools/bootstrap/lib/layers/install-config.mjs";
import { writeGitignoreBlock } from "../tools/bootstrap/lib/layers/gitignore-block.mjs";
import { runTwoFolderLayoutAudit } from "./lib/tied-two-folder-audit.mjs";
import { execFileSync } from "node:child_process";

function mkMinimalClientRoot(tmp) {
  fs.mkdirSync(path.join(tmp, "tied-project"), { recursive: true });
  fs.writeFileSync(path.join(tmp, "tied-project", "requirements.yaml"), "requirements: []\n");
  fs.mkdirSync(path.join(tmp, "tied-bundle", "templates"), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, "tied-bundle", "templates", "impl-essence-pseudocode-template.md"),
    "Grammar-Version: v2\n\nPROC PLACEHOLDER()\n  PRE: true\n  POST: true\n  EFFECTS: none\n",
    "utf8",
  );
  writeGitignoreBlock(tmp);
  execFileSync("git", ["init"], { cwd: tmp, stdio: "pipe" });
  execFileSync("git", ["add", "-A"], { cwd: tmp, stdio: "pipe" });
  return tmp;
}

describe("tied new client audit [REQ-TIED_NEW_CLIENT_ADHERENCE]", () => {
  it("resolveClientRoot rejects missing tied-project/", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "nc-audit-"));
    assert.throws(() => resolveClientRoot(tmp), /CLIENT_ROOT_INVALID.*project TIED dir/);
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
      runTwoFolderLayout: () => ({ ok: true, checks: [] }),
    });
    assert.equal(result.ok, true);
    assert.ok(fs.existsSync(reportPath));
    const written = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    assert.equal(written.schema_version, SCHEMA_VERSION);
    assert.equal(written.grammar_audit.ok, true);
  });

  it("resolveInstallProfile reads manifest mode [REQ-TIED_LAYERED_CLIENT_INSTALL]", () => {
    const tmp = mkMinimalClientRoot(fs.mkdtempSync(path.join(os.tmpdir(), "nc-audit-")));
    assert.equal(resolveInstallProfile(tmp), "legacy");
    writeInstallConfig(tmp, {
      schema: "tied-install.v2",
      store: "/x",
      mode: "full",
      layers: ["db"],
      harness: "cursor",
    });
    assert.equal(resolveInstallProfile(tmp), "full");
    writeInstallConfig(tmp, {
      schema: "tied-install.v2",
      store: "/x",
      mode: "linked",
      layers: ["db"],
      harness: "cursor",
    });
    assert.equal(resolveInstallProfile(tmp), "linked");
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

  it("SC-TFL-NO-ROOT-WORKING warn-only when both working roots exist [REQ-TIED_FACTORY_ONBOARDING_WORKING_PATH]", () => {
    const tmp = mkMinimalClientRoot(fs.mkdtempSync(path.join(os.tmpdir(), "nc-tfl-warn-")));
    fs.mkdirSync(path.join(tmp, "tied-project", "working"), { recursive: true });
    fs.mkdirSync(path.join(tmp, "working"), { recursive: true });
    const layout = runTwoFolderLayoutAudit(tmp);
    const warn = layout.checks.find((c) => c.id === "SC-TFL-NO-ROOT-WORKING");
    assert.ok(warn);
    assert.equal(warn.ok, true);
    assert.match(warn.detail ?? "", /hygiene warning/);
  });

  it("SC-TFL-NO-ROOT-WORKING skipped on undivided layout", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "nc-tfl-und-"));
    fs.mkdirSync(path.join(tmp, "working"), { recursive: true });
    fs.mkdirSync(path.join(tmp, "tied-bundle", "templates"), { recursive: true });
    fs.writeFileSync(
      path.join(tmp, "tied-bundle", "templates", "impl-essence-pseudocode-template.md"),
      "Grammar-Version: v2\n\nPROC PLACEHOLDER()\n  PRE: true\n  POST: true\n  EFFECTS: none\n",
    );
    const layout = runTwoFolderLayoutAudit(tmp);
    const warn = layout.checks.find((c) => c.id === "SC-TFL-NO-ROOT-WORKING");
    assert.equal(warn, undefined);
  });
});
