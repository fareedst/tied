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

  it("operational_health routes B D F before source_static strip", () => {
    const full = routeEdpcWorkflow("operational_health", "toolchain_readonly");
    assert.deepEqual(full.workflows, ["B", "D", "F"]);
    const stripped = routeEdpcWorkflow("operational_health", "source_static");
    assert.deepEqual(stripped.workflows, ["B", "F"]);
  });

  it("billing_processor_health golden order A B D C F", () => {
    const route = routeEdpcWorkflow("billing_processor_health", "source_change");
    assert.deepEqual(route.workflows, ["A", "B", "D", "C", "F"]);
  });

  it("resource_cost routes B D E F", () => {
    const route = routeEdpcWorkflow("resource_cost", "toolchain_readonly");
    assert.deepEqual(route.workflows, ["B", "D", "E", "F"]);
  });
});
