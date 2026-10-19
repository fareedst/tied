import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { routeEdpcWorkflow } from "./workflow-route.js";

// [IMPL-TIED_EDPC_ORCHESTRATION] [REQ-TIED_EDPC_COMPREHENSION]
describe("EDPC workflow route [REQ-TIED_EDPC_COMPREHENSION]", () => {
  it("module_comprehension golden route", () => {
    const route = routeEdpcWorkflow("module_comprehension", "toolchain_readonly");
    assert.deepEqual(route.workflows, ["B", "C", "F"]);
    assert.equal(route.defaulted, false);
  });

  it("replacement_safety includes D and E until source_static strip", () => {
    const full = routeEdpcWorkflow("replacement_safety", "source_change");
    assert.deepEqual(full.workflows, ["B", "C", "E", "D", "F"]);
    const stripped = routeEdpcWorkflow("replacement_safety", "source_static");
    assert.deepEqual(stripped.workflows, ["B", "C", "F"]);
  });

  it("unknown question class defaults to B C F", () => {
    const route = routeEdpcWorkflow("mystery", "toolchain_readonly");
    assert.deepEqual(route.workflows, ["B", "C", "F"]);
    assert.equal(route.defaulted, true);
  });

  it("deterministic for identical inputs", () => {
    const a = routeEdpcWorkflow("module_comprehension", "toolchain_readonly");
    const b = routeEdpcWorkflow("module_comprehension", "toolchain_readonly");
    assert.deepEqual(a, b);
  });
});
