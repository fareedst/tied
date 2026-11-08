/**
 * [REQ-TIED_INSTALL_JSON_REFRESH_SEMVER] [SC-IJRS-MANIFEST]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { readStoreMethodologySemver } from "./store-methodology-version.mjs";

describe("readStoreMethodologySemver [REQ-TIED_INSTALL_JSON_REFRESH_SEMVER]", () => {
  it("reads semver from store VERSION", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "store-ver-"));
    fs.writeFileSync(path.join(tmp, "VERSION"), "5.1.0\n");
    assert.equal(readStoreMethodologySemver(tmp), "5.1.0");
  });

  it("falls back to store AGENTS.md when VERSION missing", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "store-agents-"));
    fs.writeFileSync(
      path.join(tmp, "AGENTS.md"),
      "**TIED Methodology Version**: 3.8.2\n",
      "utf8",
    );
    assert.equal(readStoreMethodologySemver(tmp), "3.8.2");
  });

  it('returns "unknown" when no valid source', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "store-none-"));
    assert.equal(readStoreMethodologySemver(tmp), "unknown");
  });
});
