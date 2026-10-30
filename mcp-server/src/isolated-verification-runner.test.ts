import assert from "node:assert/strict";
import fs from "node:fs";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";

import {
  isIsolatedVerificationRunnerEnabled,
  resolveIsolatedRunnerEntry,
  runDeclaredQualityCommandsWithRunnerPolicy,
} from "./isolated-verification-runner.js";

describe("ISOLATED_VERIFICATION_RUNNER [IMPL-TIED_ISOLATED_VERIFICATION_RUNNER] [REQ-TIED_ISOLATED_VERIFICATION_RUNNER]", () => {
  let tempRoot = "";

  afterEach(() => {
    if (tempRoot) {
      fs.rmSync(tempRoot, { recursive: true, force: true });
      tempRoot = "";
    }
  });

  it("isIsolatedVerificationRunnerEnabled is false unless config verification.isolated_runner is true", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "tied-isolated-cfg-"));
    const tied = path.join(tempRoot, "tied-project");
    fs.mkdirSync(tied, { recursive: true });
    fs.writeFileSync(
      path.join(tied, "config.yaml"),
      "schema: tied-project-config.v1\nverification:\n  isolated_runner: true\n",
      "utf8",
    );
    assert.equal(isIsolatedVerificationRunnerEnabled(tempRoot), true);
    fs.writeFileSync(
      path.join(tied, "config.yaml"),
      "schema: tied-project-config.v1\nverification:\n  isolated_runner: false\n",
      "utf8",
    );
    assert.equal(isIsolatedVerificationRunnerEnabled(tempRoot), false);
  });

  it("uses isolated_subprocess when config enables isolated runner and dist entry exists", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "tied-isolated-run-"));
    const tied = path.join(tempRoot, "tied-project");
    fs.mkdirSync(tied, { recursive: true });
    fs.writeFileSync(
      path.join(tied, "config.yaml"),
      "schema: tied-project-config.v1\nverification:\n  isolated_runner: true\n",
      "utf8",
    );
    const entry = resolveIsolatedRunnerEntry();
    assert.ok(fs.existsSync(entry), `expected built runner at ${entry}`);

    const artifactDir = await mkdtemp(path.join(os.tmpdir(), "tied-isolated-artifacts-"));
    const { command_results, execution_runner } = await runDeclaredQualityCommandsWithRunnerPolicy(
      {
        commands: [
          {
            id: "noop",
            argv: [process.execPath, "-e", "process.exit(0)"],
            cwd: process.cwd(),
            artifact_dir: artifactDir,
          },
        ],
      },
      { project_root: tempRoot },
    );

    assert.equal(command_results[0]?.result, "passed");
    assert.equal(execution_runner.mode, "isolated_subprocess");
    assert.equal(execution_runner.entry, entry);
  });

  it("falls back to in_process when isolated_runner is not enabled", async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), "tied-inproc-run-"));
    const artifactDir = await mkdtemp(path.join(os.tmpdir(), "tied-inproc-artifacts-"));
    const { execution_runner } = await runDeclaredQualityCommandsWithRunnerPolicy(
      {
        commands: [
          {
            id: "noop",
            argv: [process.execPath, "-e", "process.exit(0)"],
            cwd: process.cwd(),
            artifact_dir: artifactDir,
          },
        ],
      },
      { project_root: tempRoot },
    );
    assert.equal(execution_runner.mode, "in_process");
  });
});
