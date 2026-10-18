/**
 * [REQ-TIED_LAYERED_CLIENT_INSTALL] refresh manifest behavior.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { refreshInstallFromManifest } from "./install-layers-core.mjs";
import { TIED_REPO_ROOT } from "./constants.mjs";
import { PROJECT_DIR_NAME } from "./layout.mjs";

describe("refreshInstallFromManifest [REQ-TIED_LAYERED_CLIENT_INSTALL]", () => {
  it("throws INSTALL_MANIFEST_MISSING for client dir without manifest", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tied-refresh-no-manifest-"));
    fs.mkdirSync(path.join(tmp, PROJECT_DIR_NAME), { recursive: true });
    assert.throws(
      () =>
        refreshInstallFromManifest(tmp, {
          store: TIED_REPO_ROOT,
          skipVerify: true,
        }),
      (e) => e instanceof Error && e.message === "INSTALL_MANIFEST_MISSING",
    );
  });
});
