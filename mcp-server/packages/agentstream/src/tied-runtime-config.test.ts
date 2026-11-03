import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  deriveStoreRootFromMcpDist,
  pathsSameResolved,
  resolveTiedRuntimeConfigFromWorkspace,
} from "./tied-runtime-config.js";
import {
  listSharedParityFixtureCases,
  materializeTiedRuntimeFixture,
} from "../../../../tools/bootstrap/lib/tied-runtime-fixture-loader.mjs";

// [REQ-TIED_RUNTIME_DISK_CONFIG] SC-RDC-CONSUMERS

describe("tied-runtime-config [SC-RDC-CONSUMERS]", () => {
  it("derives store root from mcp dist path", () => {
    const store = path.join(os.tmpdir(), "as-store-derive");
    const dist = path.join(store, "mcp-server", "dist", "index.js");
    assert.equal(deriveStoreRootFromMcpDist(dist), path.resolve(store));
  });

  for (const spec of listSharedParityFixtureCases()) {
    it(`catalog fixture ${spec.id} resolves from mcp.json`, () => {
      const materialized = materializeTiedRuntimeFixture(spec);
      for (const [key, value] of Object.entries(materialized.processEnv)) {
        process.env[key] = value;
      }
      try {
        const cfg = resolveTiedRuntimeConfigFromWorkspace(materialized.workspaceRoot);
        assert.ok(cfg);
        assert.ok(pathsSameResolved(cfg!.storeRoot, materialized.storeRoot));
        assert.ok(
          pathsSameResolved(
            cfg!.clientProjectPath ?? "",
            path.join(materialized.workspaceRoot, "tied-project"),
          ),
        );
      } finally {
        for (const key of Object.keys(materialized.processEnv)) {
          delete process.env[key];
        }
        materialized.cleanup();
      }
    });
  }

  it("returns null when no mcp.json or store yaml", () => {
    const clientRoot = fs.mkdtempSync(path.join(os.tmpdir(), "as-rt-empty-"));
    assert.equal(resolveTiedRuntimeConfigFromWorkspace(clientRoot), null);
  });
});
