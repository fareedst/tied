import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import {
  installLayersMjsFromBootstrapModule,
  newTiedClientMjsFromBootstrapModule,
  repoRootFromBootstrapModule,
} from "./paths.js";

// [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
describe("@tied/bootstrap paths [REQ-TIED_UNIFIED_TOOLCHAIN]", () => {
  it("resolves install-layers and new-tied-client engines under tools/bootstrap", () => {
    const root = repoRootFromBootstrapModule(import.meta.url);
    assert.ok(fs.existsSync(path.join(root, "tied-install.sh")));
    const installLayers = installLayersMjsFromBootstrapModule(import.meta.url);
    const newClient = newTiedClientMjsFromBootstrapModule(import.meta.url);
    assert.ok(fs.existsSync(installLayers), `expected ${installLayers}`);
    assert.ok(fs.existsSync(newClient), `expected ${newClient}`);
  });
});
