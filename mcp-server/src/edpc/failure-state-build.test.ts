import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { buildEdpcFailureState } from "./failure-state-build.js";

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), "../../test/fixtures/edpc/ofsm");

// [IMPL-TIED_EDPC_FAILURE_OPS] [REQ-TIED_EDPC_COMPREHENSION]
describe("EDPC failure state build [REQ-TIED_EDPC_COMPREHENSION]", () => {
  it("merges operational_failure_state receipt ref and stable-sorts bundle JSON", () => {
    const charter = JSON.parse(readFileSync(join(fixtureDir, "charter-minimal.json"), "utf8"));
    const bundle = JSON.parse(readFileSync(join(fixtureDir, "bundle-valid.json"), "utf8"));
    const result = buildEdpcFailureState({
      charter,
      access_matrix: { evidence_access_tier: "toolchain_readonly", production_touch: "none" },
      ofsm_bundle: bundle,
      scm_shell: {
        schema_version: "scm-snapshot-shell.v1",
        receipt_refs: { inventory: "receipts/inventory.v1.json" },
      },
    });
    assert.ok(result.merged_shell?.receipt_refs?.operational_failure_state?.includes("operational-failure-state"));
    assert.ok(result.normalized_bundle);
    const keys = Object.keys(result.normalized_bundle!);
    assert.deepEqual(keys, [...keys].sort());
  });
});
