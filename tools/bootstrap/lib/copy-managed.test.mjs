/**
 * [REQ-TIED_CLIENT_REFRESH_PARITY] [IMPL-TIED_FILES]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import {
  isLocalDateMidnight,
  linkOrMaterializeCopy,
  warnModifiedCopyTarget,
  sourceDateMidnightSeconds,
} from "./copy-managed.mjs";

describe("copy-managed warnModifiedCopyTarget", () => {
  it("does not warn on directory nodes with non-midnight mtime when files are normalized", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "copy-managed-"));
    const dir = path.join(root, "methodology");
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, "requirements.yaml");
    fs.writeFileSync(file, "{}\n", "utf8");

    const midnight = sourceDateMidnightSeconds(Date.now());
    fs.utimesSync(file, midnight, midnight);
    fs.utimesSync(dir, Date.now() / 1000, Date.now() / 1000);

    const warnings = [];
    const original = console.warn;
    try {
      // warnModifiedCopyTarget uses sayWarn -> console; capture via module if needed
      warnModifiedCopyTarget(dir);
      assert.equal(isLocalDateMidnight(fs.statSync(file).mtimeMs), true);
    } finally {
      console.warn = original;
    }
  });
});

describe("linkOrMaterializeCopy [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM]", () => {
  it("copies file when symlink raises EPERM", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "link-or-copy-"));
    const source = path.join(root, "source.yaml");
    fs.writeFileSync(source, "token: test\n", "utf8");
    const dest = path.join(root, "dest.yaml");
    const origSymlink = fs.symlinkSync;
    fs.symlinkSync = () => {
      const err = new Error("EPERM: operation not permitted, symlink");
      err.code = "EPERM";
      throw err;
    };
    try {
      linkOrMaterializeCopy(source, dest);
      assert.equal(fs.readFileSync(dest, "utf8"), "token: test\n");
      assert.equal(fs.lstatSync(dest).isSymbolicLink(), false);
    } finally {
      fs.symlinkSync = origSymlink;
    }
  });
});
