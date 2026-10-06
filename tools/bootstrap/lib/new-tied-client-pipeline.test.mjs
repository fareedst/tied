import { test } from "node:test";
import assert from "node:assert/strict";
import { TIED_REPO_ROOT } from "./constants.mjs";
import { resolveSourceRoot } from "./new-tied-client-pipeline.mjs";

test("resolveSourceRoot ignores stale TIED_REPO_ROOT when bootstrap entry is missing", () => {
  const stale = "C:\\nonexistent-stale-tied-repo-for-test";
  const resolved = resolveSourceRoot({ TIED_REPO_ROOT: stale }, TIED_REPO_ROOT);
  assert.equal(resolved, TIED_REPO_ROOT);
});

test("resolveSourceRoot honors TIED_REPO_ROOT when bootstrap entry exists", () => {
  const resolved = resolveSourceRoot({ TIED_REPO_ROOT: TIED_REPO_ROOT }, TIED_REPO_ROOT);
  assert.equal(resolved, TIED_REPO_ROOT);
});
