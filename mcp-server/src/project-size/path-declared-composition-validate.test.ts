/**
 * [REQ-TIED_PATH_DECLARED_COMPOSITION_MANDATE] [IMPL-TIED_PATH_DECLARED_COMPOSITION_VALIDATE]
 */

import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import type { BindingInventoryRow } from "../analysis/binding-inventory.js";
import { validatePathDeclaredComposition } from "./path-declared-composition-validate.js";

const miniClientRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../test/fixtures/project-size/mini-client",
);

const sampleBinding: BindingInventoryRow = {
  id: "cli->core",
  trigger: "cli main",
  callee: "core.run",
  arguments: "argv",
  effect: "executes",
  ordering: "parse before run",
  failure_behavior: "exit non-zero",
  composition_test: "src/cli.binding.test.ts",
  e2e_only: false,
};

describe("validatePathDeclaredComposition [REQ-TIED_PATH_DECLARED_COMPOSITION_MANDATE] [IMPL-TIED_PATH_DECLARED_COMPOSITION_VALIDATE]", () => {
  it("SC-PDC-01 exempt when composition-integration N/A with waiver", async () => {
    const result = await validatePathDeclaredComposition({
      repo_root: miniClientRoot,
      composition_integration_na: true,
      exempt_reason: "single-module change",
    });
    assert.equal(result.schema_version, "path-declared-composition-validate.v1");
    assert.equal(result.mandate_applies, false);
    assert.equal(result.exempt, true);
    assert.equal(result.satisfied, true);
    assert.equal(result.ok, true);
  });

  it("SC-PDC-02 fails when binding exists but only unit-named composition tests", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "pdc-fail-"));
    await mkdir(path.join(root, "src"), { recursive: true });
    await writeFile(
      path.join(root, "src", "cli.test.ts"),
      `import test from "node:test";\ntest("wires", () => {});\n`,
      "utf8",
    );
    const result = await validatePathDeclaredComposition({
      repo_root: root,
      binding_inventory_rows: [sampleBinding],
      enforcement: "blocking",
    });
    assert.equal(result.mandate_applies, true);
    assert.equal(result.composition_tests, 0);
    assert.equal(result.satisfied, false);
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.some((d) => d.includes("composition_tests")));
  });

  it("SC-PDC-03 passes with path-declared composition suffix", async () => {
    const result = await validatePathDeclaredComposition({
      repo_root: miniClientRoot,
      composition_integration_required: true,
      enforcement: "blocking",
    });
    assert.equal(result.mandate_applies, true);
    assert.ok(result.composition_tests >= 1);
    assert.equal(result.satisfied, true);
    assert.ok(result.composition_files.some((f) => f.path.includes(".binding.test.ts")));
    assert.equal(result.ok, true);
  });

  it("SC-PDC-E1 advisory allows ok=false satisfied path as diagnostic only", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "pdc-adv-"));
    await mkdir(path.join(root, "src"), { recursive: true });
    await writeFile(path.join(root, "src", "cli.test.ts"), `import test from "node:test";\ntest("x", () => {});\n`, "utf8");
    const result = await validatePathDeclaredComposition({
      repo_root: root,
      composition_integration_required: true,
      enforcement: "advisory",
    });
    assert.equal(result.satisfied, false);
    assert.equal(result.ok, true);
    assert.ok(result.diagnostics.length > 0);
  });
});
