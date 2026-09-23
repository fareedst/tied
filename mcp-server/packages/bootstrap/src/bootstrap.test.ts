import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import {
  copyFilesMjsFromBootstrapModule,
  newTiedClientMjsFromBootstrapModule,
  repoRootFromBootstrapModule,
} from "./paths.js";

// [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
describe("@tied/bootstrap paths [REQ-TIED_UNIFIED_TOOLCHAIN]", () => {
  it("resolves legacy copy-files and new-tied-client engines under tools/bootstrap", () => {
    const root = repoRootFromBootstrapModule(import.meta.url);
    assert.ok(fs.existsSync(path.join(root, "copy_files.sh")));
    const copyFiles = copyFilesMjsFromBootstrapModule(import.meta.url);
    const newClient = newTiedClientMjsFromBootstrapModule(import.meta.url);
    assert.ok(fs.existsSync(copyFiles), `expected ${copyFiles}`);
    assert.ok(fs.existsSync(newClient), `expected ${newClient}`);
  });
});
