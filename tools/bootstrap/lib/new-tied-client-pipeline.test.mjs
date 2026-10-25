import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { TIED_REPO_ROOT } from "./constants.mjs";
import {
  resolveSourceRoot,
  validateDisposableTag,
  disposableClientBasename,
  createDisposableClientDir,
} from "./new-tied-client-pipeline.mjs";

test("resolveSourceRoot ignores stale TIED_REPO_ROOT when bootstrap entry is missing", () => {
  const stale = "C:\\nonexistent-stale-tied-repo-for-test";
  const resolved = resolveSourceRoot({ TIED_REPO_ROOT: stale }, TIED_REPO_ROOT);
  assert.equal(resolved, TIED_REPO_ROOT);
});

test("resolveSourceRoot honors TIED_REPO_ROOT when bootstrap entry exists", () => {
  const resolved = resolveSourceRoot({ TIED_REPO_ROOT: TIED_REPO_ROOT }, TIED_REPO_ROOT);
  assert.equal(resolved, TIED_REPO_ROOT);
});

test("disposableClientBasename uses epoch only or epoch-tag [REQ-TIED_SETUP] [IMPL-TIED_FILES]", () => {
  const fixedMs = 1700000000123;
  assert.equal(disposableClientBasename(fixedMs), "1700000000");
  assert.equal(disposableClientBasename(fixedMs, "gf-001"), "1700000000-gf-001");
});

test("validateDisposableTag rejects unsafe values [REQ-TIED_SETUP] [IMPL-TIED_FILES]", () => {
  assert.doesNotThrow(() => validateDisposableTag("gf-001"));
  assert.throws(() => validateDisposableTag(""), /tag/i);
  assert.throws(() => validateDisposableTag("../x"), /tag/i);
  assert.throws(() => validateDisposableTag("bad_"), /tag/i);
});

test("createDisposableClientDir applies optional tag to basename [REQ-TIED_SETUP] [IMPL-TIED_FILES]", () => {
  const fixedMs = 1700000000123;
  const { clientDir, clientId, timestamp } = createDisposableClientDir("/tmp/test-root", fixedMs, "gf-001");
  assert.equal(timestamp, "1700000000");
  assert.equal(clientId, "1700000000-gf-001");
  assert.equal(clientDir, path.join("/tmp/test-root", "1700000000-gf-001"));
});
