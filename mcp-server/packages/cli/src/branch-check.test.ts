import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  branchCheckOptOut,
  resolveExpectedBranch,
  runBranchCheck,
} from "../../../dist/dae/branch-check.js";

// [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: W2a branch hygiene unit tests.

describe("branch hygiene [REQ-TIED_DAE_INCORPORATION]", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "branch-check-"));
    execFileSync("git", ["init"], { cwd: tempDir, stdio: "ignore" });
    execFileSync("git", ["config", "user.email", "test@example.com"], { cwd: tempDir, stdio: "ignore" });
    execFileSync("git", ["config", "user.name", "Test"], { cwd: tempDir, stdio: "ignore" });
    fs.writeFileSync(path.join(tempDir, "README.md"), "x\n");
    execFileSync("git", ["add", "README.md"], { cwd: tempDir, stdio: "ignore" });
    execFileSync("git", ["commit", "-m", "init"], { cwd: tempDir, stdio: "ignore" });
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("returns exit 0 when branch matches CITDP branch", () => {
    execFileSync("git", ["checkout", "-b", "feature/w2"], { cwd: tempDir, stdio: "ignore" });
    const result = runBranchCheck({
      projectRoot: tempDir,
      citdp: { branch: "feature/w2" },
    });
    assert.equal(result.exit_code, 0);
    assert.equal(result.ok, true);
    assert.equal(result.current, "feature/w2");
  });

  it("returns exit 1 on mismatch", () => {
    const result = runBranchCheck({
      projectRoot: tempDir,
      citdp: { branch: "expected-branch" },
    });
    assert.equal(result.exit_code, 1);
    assert.equal(result.ok, false);
  });

  it("skips when .tied-yaml.yaml sets dae.branch_check false", () => {
    fs.writeFileSync(
      path.join(tempDir, ".tied-yaml.yaml"),
      "scalar_style: unwrapped\ndae:\n  branch_check: false\n",
    );
    const result = runBranchCheck({
      projectRoot: tempDir,
      citdp: { branch: "wrong" },
    });
    assert.equal(result.exit_code, 0);
    assert.equal(result.skipped, true);
    assert.equal(branchCheckOptOut(tempDir, { branch: "wrong" }), true);
  });

  it("skips when CITDP branch_check is skip", () => {
    const result = runBranchCheck({
      projectRoot: tempDir,
      citdp: { branch: "wrong", branch_check: "skip" },
    });
    assert.equal(result.exit_code, 0);
    assert.equal(result.skipped, true);
  });

  it("reads expected branch from tracker execution_evidence", () => {
    assert.equal(
      resolveExpectedBranch(undefined, { execution_evidence: { branch: "from-tracker" } }),
      "from-tracker",
    );
  });

  it("returns exit 2 when not a git repo", () => {
    const nonRepo = fs.mkdtempSync(path.join(os.tmpdir(), "not-git-"));
    try {
      const result = runBranchCheck({
        projectRoot: nonRepo,
        citdp: { branch: "main" },
      });
      assert.equal(result.exit_code, 2);
    } finally {
      fs.rmSync(nonRepo, { recursive: true, force: true });
    }
  });
});
