/**
 * [REQ-VOCABULARY_ANALYSIS] [IMPL-VOCABULARY_ANALYSIS] tied-records unit tests
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { loadTiedRecordCatalog } from "./tied-records.js";
import { clearBasePathCache } from "../yaml-loader.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

describe("tied-records REQ-VOCABULARY_ANALYSIS", () => {
  let origEnv: string | undefined;

  beforeEach(() => {
    origEnv = process.env.TIED_BASE_PATH;
    process.env.TIED_BASE_PATH = path.join(repoRoot, "tied");
    clearBasePathCache();
  });

  afterEach(() => {
    if (origEnv === undefined) delete process.env.TIED_BASE_PATH;
    else process.env.TIED_BASE_PATH = origEnv;
    clearBasePathCache();
  });

  it("loads merged catalog with REQ-TIED_SETUP from project tied", () => {
    const catalog = loadTiedRecordCatalog();
    const found = catalog.records.find((r) => r.token === "REQ-TIED_SETUP");
    assert.ok(found, "expected REQ-TIED_SETUP in catalog");
    assert.strictEqual(found?.layer, "REQ");
    assert.ok(["project", "merged_override"].includes(found?.ownership ?? ""));
  });

  it("labels methodology-only tokens when present", () => {
    const catalog = loadTiedRecordCatalog();
    const meth = catalog.records.find((r) => r.ownership === "methodology_only");
    if (meth) {
      assert.ok(meth.token.startsWith("REQ-") || meth.token.startsWith("IMPL-"));
    }
  });

  it("includes traceability relationships for requirements", () => {
    const catalog = loadTiedRecordCatalog();
    const req = catalog.records.find((r) => r.token === "REQ-TIED_SETUP");
    assert.ok(req);
    assert.ok(Array.isArray(req?.relationships));
  });
});
