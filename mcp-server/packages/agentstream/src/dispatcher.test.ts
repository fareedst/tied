import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { resolveAgentstreamImpl } from "./dispatch-go.js";
import { goAgentstreamModuleDirFromModule } from "./paths.js";

// [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
describe("@tied/agentstream dispatcher [REQ-TIED_UNIFIED_TOOLCHAIN]", () => {
  it("defaults TIED_AGENTSTREAM_IMPL to go", () => {
    const prev = process.env.TIED_AGENTSTREAM_IMPL;
    delete process.env.TIED_AGENTSTREAM_IMPL;
    try {
      assert.equal(resolveAgentstreamImpl(), "go");
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

  it("Go module path exists for spawn fallback", () => {
    const dir = goAgentstreamModuleDirFromModule(import.meta.url);
    assert.ok(fs.existsSync(path.join(dir, "go.mod")));
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
});
