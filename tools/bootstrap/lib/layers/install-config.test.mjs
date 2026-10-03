/**
 * [REQ-TIED_TWO_FOLDER_LAYOUT] install config v2 tests.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import {
  INSTALL_CONFIG_SCHEMA_V2,
  readInstallConfig,
  writeInstallConfig,
  installConfigPath,
} from "./install-config.mjs";
import { BUNDLE_DIR_NAME, PROJECT_DIR_NAME } from "../layout.mjs";

describe("install-config [REQ-TIED_TWO_FOLDER_LAYOUT]", () => {
  it("writeInstallConfig round-trips at tied-bundle/install.json", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tfl-install-cfg-"));
    fs.mkdirSync(path.join(tmp, PROJECT_DIR_NAME), { recursive: true });
    const written = writeInstallConfig(tmp, {
      store: "/tmp/store",
      mode: "linked",
      layers: ["db", "mcp"],
      harness: "cursor",
      methodology_bundle: "live",
    });
    assert.equal(written.schema, INSTALL_CONFIG_SCHEMA_V2);
    assert.equal(written.mode, "linked");
    assert.ok(fs.existsSync(installConfigPath(tmp)));
    const read = readInstallConfig(tmp);
    assert.equal(read?.mode, "linked");
    assert.equal(read?.store, "/tmp/store");
    assert.match(read?.bundle_path ?? "", new RegExp(`${BUNDLE_DIR_NAME}$`));
  });

  it("reads legacy tied/.tied-install.json as normalized v2", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tfl-install-legacy-"));
    fs.mkdirSync(path.join(tmp, "tied"), { recursive: true });
    fs.writeFileSync(
      path.join(tmp, "tied", ".tied-install.json"),
      `${JSON.stringify({
        schema: "tied-install.v1",
        store: "/store",
        mode: "full",
        harness: "both",
        layers: ["db"],
        methodology_bundle: "live",
        timestamp: "2026-01-01T00:00:00.000Z",
      })}\n`,
    );
    const read = readInstallConfig(tmp);
    assert.equal(read?.mode, "full");
    assert.equal(read?.store, "/store");
  });
});
