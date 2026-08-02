import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { validateBindingInventory } from "./binding-inventory.js";

describe("binding inventory validation [IMPL-QUALITY_BINDING_INVENTORY] [REQ-MODULE_VALIDATION]", () => {
  it("accepts a composition-testable binding with the complete contract", () => {
    // [IMPL-QUALITY_BINDING_INVENTORY] [ARCH-QUALITY_ASSURANCE_PROFILES] [ARCH-MODULE_VALIDATION]
    // [REQ-QUALITY_ASSURANCE_EVIDENCE] [REQ-MODULE_VALIDATION]
    const report = validateBindingInventory([
      {
        id: "CLI->pipeline.Build",
        trigger: "main after parse",
        callee: "pipeline.Build",
        arguments: "argv paths and checklist path",
        effect: "turns assembled",
        ordering: "parse before build",
        failure_behavior: "invalid YAML returns an exit error",
        composition_test: "pipeline/composition_coverage_test.go",
        e2e_only: false,
      },
    ]);

    assert.equal(report.ok, true);
    assert.equal(report.diagnostics.length, 0);
  });

  it("rejects missing composition evidence and vague E2E claims", () => {
    const report = validateBindingInventory([
      {
        id: "entry->handler",
        trigger: "message received",
        callee: "handler",
        arguments: "message",
        effect: "state updated",
        ordering: "receive before update",
        failure_behavior: "invalid message rejected",
        e2e_only: false,
      },
      {
        id: "ui->window",
        trigger: "button click",
        callee: "window",
        arguments: "none",
        effect: "window opens",
        ordering: "click before open",
        failure_behavior: "platform error shown",
        e2e_only: true,
        e2e_only_reason: "complex UI flow",
      },
    ]);

    assert.equal(report.ok, false);
    assert.ok(report.diagnostics.some((diagnostic) => diagnostic.code === "MISSING_COMPOSITION_TEST"));
    assert.ok(report.diagnostics.some((diagnostic) => diagnostic.code === "UNJUSTIFIED_E2E_ONLY"));
  });

  it("rejects duplicate binding identifiers", () => {
    const row = {
      id: "duplicate",
      trigger: "event",
      callee: "handler",
      arguments: "payload",
      effect: "state change",
      ordering: "event before handler",
      failure_behavior: "error returned",
      composition_test: "binding.test.ts",
    };

    const report = validateBindingInventory([row, row]);

    assert.equal(report.ok, false);
    assert.ok(report.diagnostics.some((diagnostic) => diagnostic.code === "DUPLICATE_BINDING_ID"));
  });

  it("reports missing binding fields and accepts a named platform constraint", () => {
    // [IMPL-QUALITY_BINDING_INVENTORY] [ARCH-QUALITY_ASSURANCE_PROFILES] [ARCH-MODULE_VALIDATION]
    // [REQ-QUALITY_ASSURANCE_EVIDENCE] [REQ-MODULE_VALIDATION]
    // How: Check required binding-row fields and permit E2E only for a named platform constraint.
    const incomplete = validateBindingInventory([
      {
        id: "missing-effect",
        trigger: "event",
        callee: "handler",
        arguments: "payload",
        effect: "",
        ordering: "event before handler",
        failure_behavior: "error returned",
        composition_test: "binding.test.ts",
      },
    ]);
    const platformOnly = validateBindingInventory([
      {
        id: "ui->native-window",
        trigger: "button click",
        callee: "native window",
        arguments: "window options",
        effect: "window opens",
        ordering: "click before open",
        failure_behavior: "platform error shown",
        e2e_only: true,
        e2e_only_reason: "native OS window-server boundary",
      },
    ]);

    assert.equal(incomplete.ok, false);
    assert.ok(incomplete.diagnostics.some((diagnostic) => diagnostic.code === "MISSING_BINDING_FIELD"));
    assert.equal(platformOnly.ok, true);
  });
});
