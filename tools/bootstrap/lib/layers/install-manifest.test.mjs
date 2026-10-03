import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import {
  INSTALL_MANIFEST_SCHEMA,
  readInstallManifest,
  writeInstallManifest,
} from "./install-manifest.mjs";

describe("install-manifest [REQ-TIED_LAYERED_CLIENT_INSTALL]", () => {
  it("writeInstallManifest round-trips mode and store", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tied-manifest-"));
    const written = writeInstallManifest(tmp, {
      store: "/tmp/store",
      mode: "full",
      layers: ["db"],
      harness: "cursor",
      methodology_bundle: "live",
    });
    assert.equal(written.schema, INSTALL_MANIFEST_SCHEMA);
    assert.equal(written.mode, "full");
    const read = readInstallManifest(tmp);
    assert.equal(read?.mode, "full");
    assert.equal(read?.store, "/tmp/store");
  });
});
