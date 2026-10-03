import { test } from "node:test";
import assert from "node:assert/strict";
import { checkStoreReachable, resolveStoreRoot } from "./store.mjs";
import { TIED_REPO_ROOT } from "../constants.mjs";

test("resolveStoreRoot defaults to engine repo", () => {
  assert.equal(resolveStoreRoot({}), TIED_REPO_ROOT);
});

test("checkStoreReachable passes for TIED repo", () => {
  const result = checkStoreReachable(TIED_REPO_ROOT);
  assert.ok(result.checked > 0);
});

test("checkStoreReachable fails for hollow store", () => {
  assert.throws(
    () => checkStoreReachable("/tmp/nonexistent-tied-store-hollow"),
    /STORE_UNREACHABLE|STORE_METHODOLOGY_LAYOUT_MISSING/,
  );
});
