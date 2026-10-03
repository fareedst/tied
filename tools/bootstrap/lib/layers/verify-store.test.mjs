import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { installTiedLayers } from "../install-layers-core.mjs";
import { runPostInstallVerification } from "./verify-store.mjs";
import { TIED_REPO_ROOT } from "../constants.mjs";

describe("verify-store linked parity [REQ-TIED_LAYERED_CLIENT_INSTALL]", () => {
  it("runPostInstallVerification returns not_applicable_linked after linked install", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tied-verify-linked-"));
    installTiedLayers(tmp, {
      storeRoot: TIED_REPO_ROOT,
      mode: "linked",
      methodologyBundle: "live",
      skipVerify: true,
      env: process.env,
    });
    const result = runPostInstallVerification(tmp, {
      storeRoot: TIED_REPO_ROOT,
      mode: "linked",
      methodologyBundle: "live",
      skipParityGate: true,
    });
    assert.equal(result.parity, "not_applicable_linked");
  });
});
