import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import {
  REPO_ROOT,
  resolveInstallTarget,
  runTiedInstallEntrypoint,
} from "./tied-install-dispatch.mjs";

describe("tied-install-dispatch [REQ-TIED_LAYERED_CLIENT_INSTALL]", () => {
  it("resolveInstallTarget returns CLI dist + install when dist exists", () => {
    const cli = path.join(REPO_ROOT, "mcp-server", "packages", "cli", "dist", "index.js");
    const target = resolveInstallTarget(REPO_ROOT, (p) => p === cli);
    assert.equal(target.script, cli);
    assert.deepEqual(target.argvPrefix, ["install"]);
  });

  it("resolveInstallTarget returns install-layers.mjs when CLI dist absent", () => {
    const layers = path.join(REPO_ROOT, "tools", "bootstrap", "install-layers.mjs");
    const target = resolveInstallTarget(REPO_ROOT, () => false);
    assert.equal(target.script, layers);
    assert.deepEqual(target.argvPrefix, []);
  });

  it("runTiedInstallEntrypoint forwards argv unchanged including spaced path and layers", () => {
    const layers = path.join(REPO_ROOT, "tools", "bootstrap", "install-layers.mjs");
    const spaced = "C:\\Users\\A B\\client";
    const argv = ["--mode", "linked", "--layers", "db,mcp", spaced];
    /** @type {import("node:child_process").SpawnSyncReturns<string>} */
    let captured;
    const spawn = (_node, args, opts) => {
      captured = { args, opts };
      return { status: 0, error: undefined };
    };
    const code = runTiedInstallEntrypoint(argv, {
      spawn,
      fsExists: () => false,
      repoRoot: REPO_ROOT,
    });
    assert.equal(code, 0);
    assert.deepEqual(captured.args, [layers, ...argv]);
    assert.equal(captured.opts.stdio, "inherit");
  });

  it("runTiedInstallEntrypoint returns child status and 1 on spawn error", () => {
    const spawnOk = () => ({ status: 3, error: undefined });
    assert.equal(runTiedInstallEntrypoint([], { spawn: spawnOk, fsExists: () => false }), 3);

    const spawnFail = () => ({ status: null, error: new Error("ENOENT") });
    assert.equal(runTiedInstallEntrypoint([], { spawn: spawnFail, fsExists: () => false }), 1);
  });

});
