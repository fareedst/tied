import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { checkStoreReachable, readStoreRootFromProjectMcp, resolveStoreRoot } from "./store.mjs";
import { TIED_REPO_ROOT } from "../constants.mjs";

test("resolveStoreRoot defaults to engine repo", () => {
  assert.equal(resolveStoreRoot({}), TIED_REPO_ROOT);
});

test("resolveStoreRoot reads TIED_STORE_ROOT from project mcp.json when CLI store omitted", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tied-store-mcp-"));
  const externalStore = path.join(tmp, "external-store");
  fs.mkdirSync(path.join(tmp, ".cursor"), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, ".cursor", "mcp.json"),
    JSON.stringify({
      mcpServers: {
        "tied-yaml": { env: { TIED_STORE_ROOT: externalStore.replace(/\\/g, "/") } },
      },
    }),
    "utf8",
  );
  assert.equal(readStoreRootFromProjectMcp(tmp), path.resolve(externalStore));
  assert.equal(resolveStoreRoot({ projectRoot: tmp }), path.resolve(externalStore));
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
