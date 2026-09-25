/**
 * [IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY] [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, it } from "node:test";

import {
  applyMethodologyReadonlyBootstrapFlag,
  findStagedMethodologyPaths,
  installClientHookTemplate,
  isStagedMethodologyPath,
} from "./methodology-client-boundary.mjs";

function tempClient() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "tied-mcb-"));
}

describe("methodology client boundary Phase A [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY]", () => {
  it("isStagedMethodologyPath matches tied/methodology prefix only", () => {
    assert.equal(isStagedMethodologyPath("tied/methodology/requirements/REQ-X.yaml"), true);
    assert.equal(isStagedMethodologyPath("./tied/methodology/foo.yaml"), true);
    assert.equal(isStagedMethodologyPath("tied/requirements/REQ-X.yaml"), false);
    assert.equal(isStagedMethodologyPath("vendor/tied/methodology/x.yaml"), false);
  });

  it("findStagedMethodologyPaths returns blocked staged paths", () => {
    const blocked = findStagedMethodologyPaths([
      "tied/requirements/REQ-A.yaml",
      "tied/methodology/requirements/REQ-TIED_SETUP.yaml",
    ]);
    assert.deepEqual(blocked, ["tied/methodology/requirements/REQ-TIED_SETUP.yaml"]);
  });

  it("applyMethodologyReadonlyBootstrapFlag is opt-in and no-ops when flag false", () => {
    const root = tempClient();
    const meth = path.join(root, "tied", "methodology");
    fs.mkdirSync(meth, { recursive: true });
    const file = path.join(meth, "probe.txt");
    fs.writeFileSync(file, "x", "utf8");
    const before = fs.statSync(file).mode & 0o777;
    const result = applyMethodologyReadonlyBootstrapFlag(root, { methodologyReadonly: false, platform: "linux" });
    assert.equal(result.applied, false);
    assert.equal(fs.statSync(file).mode & 0o777, before);
  });

  it("applyMethodologyReadonlyBootstrapFlag chmods tree on Unix when flag true", () => {
    const root = tempClient();
    const meth = path.join(root, "tied", "methodology");
    fs.mkdirSync(path.join(meth, "nested"), { recursive: true });
    const file = path.join(meth, "nested", "probe.txt");
    fs.writeFileSync(file, "x", "utf8");
    const result = applyMethodologyReadonlyBootstrapFlag(root, { methodologyReadonly: true, platform: "linux" });
    assert.equal(result.applied, true);
    assert.equal(fs.statSync(file).mode & 0o222, 0);
    assert.equal(fs.statSync(meth).mode & 0o222, 0);
  });

  it("installClientHookTemplate rejects staged tied/methodology paths via shell hook", () => {
    const root = tempClient();
    installClientHookTemplate(root, { installHook: true });
    const hook = path.join(root, ".githooks", "pre-commit");
    assert.ok(fs.existsSync(hook));

    const repo = path.join(root, "git-fixture");
    fs.mkdirSync(path.join(repo, "tied", "methodology"), { recursive: true });
    fs.copyFileSync(hook, path.join(repo, ".githooks-pre-commit-test.sh"));
    fs.chmodSync(path.join(repo, ".githooks-pre-commit-test.sh"), 0o755);
    execFileSync("git", ["init"], { cwd: repo });
    const bad = path.join(repo, "tied", "methodology", "mutated.yaml");
    fs.writeFileSync(bad, "x", "utf8");
    execFileSync("git", ["add", bad], { cwd: repo });
    assert.throws(
      () => execFileSync("bash", [path.join(repo, ".githooks-pre-commit-test.sh")], { cwd: repo, stdio: "pipe" }),
      (err) => err.status === 1,
    );

    const good = path.join(repo, "tied", "requirements.yaml");
    fs.writeFileSync(good, "{}\n", "utf8");
    execFileSync("git", ["reset"], { cwd: repo });
    execFileSync("git", ["add", good], { cwd: repo });
    execFileSync("bash", [path.join(repo, ".githooks-pre-commit-test.sh")], { cwd: repo, stdio: "pipe" });
  });
});
