import assert from "node:assert/strict";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const INSTALL_LAYERS = path.join(REPO_ROOT, "tools/bootstrap/install-layers.mjs");

describe("install-layers help [REQ-TIED_LAYERED_CLIENT_INSTALL]", () => {
  it("empty argv prints help and exits 0 without install manifest", () => {
    const result = spawnSync(process.execPath, [INSTALL_LAYERS], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      env: { ...process.env, NO_COLOR: "1" },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /TIED client install/);
    assert.match(result.stdout, /build-workspace/);
  });

  it("--help alone prints help and exits 0", () => {
    const result = spawnSync(process.execPath, [INSTALL_LAYERS, "--help"], {
      encoding: "utf8",
      env: { ...process.env, NO_COLOR: "1" },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Examples/);
  });
});
