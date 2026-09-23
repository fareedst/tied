import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { LEGACY_GO_REINSTALL_HINT, resolveAgentstreamImpl } from "./dispatch-go.js";

// [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
describe("@tied/agentstream dispatcher [REQ-TIED_UNIFIED_TOOLCHAIN]", () => {
  it("defaults TIED_AGENTSTREAM_IMPL to ts", () => {
    const prev = process.env.TIED_AGENTSTREAM_IMPL;
    delete process.env.TIED_AGENTSTREAM_IMPL;
    try {
      assert.equal(resolveAgentstreamImpl(), "ts");
    } finally {
      if (prev === undefined) {
        delete process.env.TIED_AGENTSTREAM_IMPL;
      } else {
        process.env.TIED_AGENTSTREAM_IMPL = prev;
      }
    }
  });

  it("accepts ts impl token", () => {
    const prev = process.env.TIED_AGENTSTREAM_IMPL;
    process.env.TIED_AGENTSTREAM_IMPL = "ts";
    try {
      assert.equal(resolveAgentstreamImpl(), "ts");
    } finally {
      if (prev === undefined) {
        delete process.env.TIED_AGENTSTREAM_IMPL;
      } else {
        process.env.TIED_AGENTSTREAM_IMPL = prev;
      }
    }
  });

  it("documents legacy go reinstall hint for Phase 4d", () => {
    assert.match(LEGACY_GO_REINSTALL_HINT, /Phase 4d/);
    assert.match(LEGACY_GO_REINSTALL_HINT, /phase4c-deprecation-notice/);
  });

  it("tied agentstream --help exits 0", () => {
    const cliEntry = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../cli/dist/index.js",
    );
    assert.ok(fs.existsSync(cliEntry), `build @tied/cli first: ${cliEntry}`);
    execFileSync(process.execPath, [cliEntry, "agentstream", "--help"], {
      stdio: "pipe",
    });
  });

  it("tied agentstream rejects TIED_AGENTSTREAM_IMPL=go", () => {
    const cliEntry = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../cli/dist/index.js",
    );
    assert.ok(fs.existsSync(cliEntry));
    const run = spawnSync(process.execPath, [cliEntry, "agentstream", "--help"], {
      encoding: "utf8",
      env: { ...process.env, TIED_AGENTSTREAM_IMPL: "go" },
    });
    assert.equal(run.status, 2);
    assert.match(String(run.stderr ?? ""), /Phase 4d/);
  });
});
