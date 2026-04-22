/**
 * CITDP writer tests. [IMPL]
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import yaml from "js-yaml";
import { clearBasePathCache } from "./yaml-loader.js";
import { writeCitdpRecord } from "./citdp-writer.js";

beforeEach(() => {
  clearBasePathCache();
});

describe("writeCitdpRecord", () => {
  it("rejects path segments in filename", () => {
    const r = writeCitdpRecord({
      filename: "../evil/CITDP-X.yaml",
      record: { a: 1 },
    });
    assert.strictEqual(r.ok, false);
  });

  it("writes tied/citdp/CITDP-*.yaml with safe top-level key", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-citdp-"));
    try {
      process.env.TIED_BASE_PATH = dir;
      clearBasePathCache();
      const w = writeCitdpRecord({
        filename: "CITDP-REQ-UNIT_TEST.yaml",
        record: { change_definition: { current_behavior: "x" } },
      });
      assert.strictEqual(w.ok, true);
      const p = (w as { ok: true; path: string }).path;
      assert.ok(fs.existsSync(p));
      const data = yaml.load(fs.readFileSync(p, "utf8")) as Record<string, unknown>;
      assert.ok(data["CITDP-REQ-UNIT_TEST"]);
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(dir, { recursive: true });
    }
  });
});
