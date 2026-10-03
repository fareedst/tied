import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildTiedInstallArgv,
  installOptionsFromEnv,
  parseInstallPassthroughFlags,
} from "./install-options.mjs";

describe("install-options [REQ-TIED_LAYERED_CLIENT_INSTALL]", () => {
  it("installOptionsFromEnv reads TIED_INSTALL_* mirrors", () => {
    const opts = installOptionsFromEnv({
      TIED_INSTALL_MODE: "full",
      TIED_INSTALL_LAYERS: "db,mcp",
      TIED_INSTALL_HARNESS: "both",
      TIED_METHODOLOGY_BUNDLE: "pinned",
      TIED_INSTALL_DOCTOR_AFTER: "1",
    });
    assert.equal(opts.mode, "full");
    assert.deepEqual(opts.layers, ["db", "mcp"]);
    assert.equal(opts.harness, "both");
    assert.equal(opts.methodologyBundle, "pinned");
    assert.equal(opts.doctorAfter, true);
  });

  it("parseInstallPassthroughFlags merges CLI over env", () => {
    const { options, remainingArgv } = parseInstallPassthroughFlags(
      ["--install-mode", "linked", "--doctor-after", "--disposable"],
      { TIED_INSTALL_MODE: "full" },
    );
    assert.equal(options.mode, "linked");
    assert.equal(options.doctorAfter, true);
    assert.deepEqual(remainingArgv, ["--disposable"]);
  });

  it("buildTiedInstallArgv defaults linked harness from profile", () => {
    const argv = buildTiedInstallArgv("/store", "cursor", {});
    assert.deepEqual(argv, ["--mode", "linked", "--harness", "both", "--store", "/store"]);
    const claude = buildTiedInstallArgv("/store", "claude", { mode: "full", doctorAfter: true });
    assert.ok(claude.includes("--mode"));
    assert.ok(claude.includes("full"));
    assert.ok(claude.includes("--doctor"));
  });
});
