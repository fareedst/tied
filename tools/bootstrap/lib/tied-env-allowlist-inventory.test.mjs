/**
 * [REQ-TIED_ENVIRONMENT_VARIABLE_POLICY] SC-EVPOL-INVENTORY
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  UndocumentedEnvReadError,
  collectEnvReadsFromSources,
  defaultAllowlistPath,
  extractEnvKeysFromSource,
  loadEnvAllowlist,
  runEnvAllowlistInventory,
} from "./tied-env-allowlist-inventory.mjs";
import { TIED_REPO_ROOT } from "./constants.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = path.join(__dirname, "../fixtures/tied-env-allowlist");

describe("tied-env-allowlist-inventory [REQ-TIED_ENVIRONMENT_VARIABLE_POLICY]", () => {
  it("extractEnvKeysFromSource finds dot and bracket reads", () => {
    const keys = extractEnvKeysFromSource(
      "const a = process.env.TIED_BASE_PATH; const b = process.env['JEV_API_KEY'];",
    );
    assert.deepEqual(keys.sort(), ["JEV_API_KEY", "TIED_BASE_PATH"]);
  });

  it("pass fixture: allowlisted read only (SC-EVPOL-INVENTORY stub)", () => {
    const allowlistPath = path.join(FIXTURE_ROOT, "inventory-pass/allowlist-stub.yaml");
    const doc = loadEnvAllowlist(allowlistPath);
    const reads = collectEnvReadsFromSources(FIXTURE_ROOT, doc);
    assert.ok(reads.has("TIED_ENVELOPE_HOOKS"));
    runEnvAllowlistInventory({ storeRoot: FIXTURE_ROOT, allowlistPath });
  });

  it("fail fixture: undocumented env read throws UndocumentedEnvReadError", () => {
    const allowlistPath = path.join(FIXTURE_ROOT, "inventory-fail/allowlist-stub.yaml");
    assert.throws(
      () => runEnvAllowlistInventory({ storeRoot: FIXTURE_ROOT, allowlistPath }),
      (err) => {
        assert.ok(err instanceof UndocumentedEnvReadError);
        assert.ok(err.message.includes("TIED_NEW_UNDOCUMENTED"));
        return true;
      },
    );
  });

  it("SC-EVPOL-INVENTORY: production scan matches committed allowlist", () => {
    const allowlistPath = defaultAllowlistPath();
    assert.ok(fs.existsSync(allowlistPath));
    const result = runEnvAllowlistInventory({ storeRoot: TIED_REPO_ROOT, allowlistPath });
    assert.equal(result.ok, true);
    assert.ok(result.keysScanned >= 1);
  });
});
