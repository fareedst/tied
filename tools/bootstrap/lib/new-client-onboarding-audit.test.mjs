/**
 * [IMPL-TIED_NEW_CLIENT_ONBOARDING] [REQ-TIED_FACTORY_ONBOARDING_WORKING_PATH]
 * Unit tests for onboarding audit report path resolution.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  defaultOnboardingAuditReportPath,
  runNewClientOnboardingAudit,
} from "./new-client-onboarding-audit.mjs";

function mkTwoFolderClient(tmp) {
  fs.mkdirSync(path.join(tmp, "tied-project", "working"), { recursive: true });
  fs.mkdirSync(path.join(tmp, "tied-bundle"), { recursive: true });
  return tmp;
}

function mkUndividedClient(tmp) {
  fs.mkdirSync(path.join(tmp, "working"), { recursive: true });
  fs.mkdirSync(path.join(tmp, "tied-bundle"), { recursive: true });
  return tmp;
}

describe("new-client onboarding audit paths [REQ-TIED_FACTORY_ONBOARDING_WORKING_PATH]", () => {
  it("defaultOnboardingAuditReportPath uses tied-project/working on two-folder layout", () => {
    const tmp = mkTwoFolderClient(fs.mkdtempSync(path.join(os.tmpdir(), "fow-two-")));
    const rel = defaultOnboardingAuditReportPath(tmp);
    assert.equal(rel, path.join(tmp, "tied-project", "working", "tied-new-client-audit.v1.json"));
  });

  it("defaultOnboardingAuditReportPath uses repo-root working/ on undivided layout", () => {
    const tmp = mkUndividedClient(fs.mkdtempSync(path.join(os.tmpdir(), "fow-und-")));
    const rel = defaultOnboardingAuditReportPath(tmp);
    assert.equal(rel, path.join(tmp, "working", "tied-new-client-audit.v1.json"));
  });

  it("runNewClientOnboardingAudit does not create repo-root working/ on two-folder layout", () => {
    const tmp = mkTwoFolderClient(fs.mkdtempSync(path.join(os.tmpdir(), "fow-mkdir-")));
    const rootWorking = path.join(tmp, "working");
    assert.ok(!fs.existsSync(rootWorking));

    const fakeSpawn = () => ({ status: 0, stderr: "", stdout: "" });
    const result = runNewClientOnboardingAudit({
      clientDir: tmp,
      sourceRoot: process.cwd(),
      spawn: fakeSpawn,
    });

    assert.equal(result.ok, true);
    assert.ok(
      result.reportPath.endsWith(
        path.join("tied-project", "working", "tied-new-client-audit.v1.json"),
      ),
    );
    assert.ok(!fs.existsSync(rootWorking), "must not mkdir spurious repo-root working/");
    assert.ok(fs.existsSync(path.dirname(result.reportPath)));
  });
});
