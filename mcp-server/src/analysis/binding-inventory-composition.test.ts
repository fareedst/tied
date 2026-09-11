import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  CONTROLLED_COMPOSITION_FAULT_PATTERNS,
  validateBindingInventory,
} from "./binding-inventory.js";

describe("binding inventory composition faults [IMPL-ASYNC_BINDING_VALIDATOR] [REQ-ASYNC_COMPOSITION_INVENTORY]", () => {
  it("documents CONTROLLED_COMPOSITION_FAULT patterns with deterministic outcomes", () => {
    // [IMPL-ASYNC_BINDING_VALIDATOR] [ARCH-ASYNC_COMPOSITION_BINDING] [REQ-ASYNC_COMPOSITION_INVENTORY]
    // How: Fault patterns name expected composition outcomes without claiming race-freedom.
    assert.equal(
      CONTROLLED_COMPOSITION_FAULT_PATTERNS.ordering_fault.expected_outcome,
      "Handler not invoked; composition test fails closed",
    );
    assert.equal(
      CONTROLLED_COMPOSITION_FAULT_PATTERNS.timeout_fault.expected_outcome,
      "Named failure mode; no partial success POST",
    );
    assert.equal(
      CONTROLLED_COMPOSITION_FAULT_PATTERNS.duplicate_delivery_fault.expected_outcome,
      "Idempotency POST asserts single DATA transition",
    );
  });

  it("accepts async IPC binding with complete seam columns", () => {
    // [IMPL-ASYNC_BINDING_VALIDATOR] [REQ-ASYNC_COMPOSITION_INVENTORY]
    const report = validateBindingInventory([
      {
        id: "IPC->handler",
        trigger: "message received on channel",
        callee: "routeMessage",
        arguments: "payload bytes",
        effect: "handler invoked once per deduplicated message",
        ordering: "subscribe before publish",
        failure_behavior: "invalid payload nack; timeout retry with dedup key message_id",
        async_semantics: "request-response",
        cancellation: "caller cancel → nack in-flight; POST no state change",
        idempotency_evidence: "message_id dedup in handler POST",
        composition_test: "mcp-server/src/analysis/binding-inventory-composition.test.ts",
      },
    ]);

    assert.equal(report.ok, true);
    assert.match(report.proof_boundary, /race-freedom/i);
  });

  it("ordering_fault inventory row fails when listener-order PRE violated in test design", () => {
    const validRow = validateBindingInventory([
      {
        id: "event->listener",
        trigger: "event emitted",
        callee: "onEvent",
        arguments: "event payload",
        effect: "handler state updated",
        ordering: "listener registered before emit",
        failure_behavior: "unordered emit dropped",
        async_semantics: "fire-and-forget",
        composition_test: "binding-inventory-composition.test.ts#ordering_fault",
      },
    ]);
    const invalidRow = validateBindingInventory([
      {
        id: "event->listener",
        trigger: "event emitted",
        callee: "onEvent",
        arguments: "event payload",
        effect: "handler state updated",
        ordering: "",
        failure_behavior: "unordered emit dropped",
        async_semantics: "fire-and-forget",
        composition_test: "binding-inventory-composition.test.ts#ordering_fault",
      },
    ]);

    assert.equal(validRow.ok, true);
    assert.equal(invalidRow.ok, false);
    assert.ok(
      invalidRow.diagnostics.some(
        (d) =>
          d.code === "ASYNC_SEMANTICS_REQUIRES_ORDERING_FAILURE" ||
          d.code === "MISSING_BINDING_FIELD",
      ),
    );
  });

  it("timeout_fault inventory requires failure_behavior naming timeout outcome", () => {
    const report = validateBindingInventory([
      {
        id: "stream->parser",
        trigger: "subprocess stdout chunk",
        callee: "parseLine",
        arguments: "line buffer",
        effect: "parsed record appended",
        ordering: "subscription active before bytes arrive",
        failure_behavior: "TIMEOUT_EXCEEDED after 30s; cancel stream",
        async_semantics: "streaming",
        cancellation: "parent context cancel closes stream",
        composition_test: "binding-inventory-composition.test.ts#timeout_fault",
      },
    ]);

    assert.equal(report.ok, true);
  });

  it("duplicate_delivery_fault inventory requires idempotency evidence for at-least-once", () => {
    const missing = validateBindingInventory([
      {
        id: "bus->consumer",
        trigger: "message delivered",
        callee: "consume",
        arguments: "delivery envelope",
        effect: "DATA transition once",
        ordering: "handler ready before delivery",
        failure_behavior: "at-least-once delivery with retry",
        async_semantics: "at-least-once",
        composition_test: "binding-inventory-composition.test.ts#duplicate_delivery_fault",
      },
    ]);
    const complete = validateBindingInventory([
      {
        id: "bus->consumer",
        trigger: "message delivered",
        callee: "consume",
        arguments: "delivery envelope",
        effect: "DATA transition once",
        ordering: "handler ready before delivery",
        failure_behavior: "at-least-once delivery with retry",
        async_semantics: "at-least-once",
        idempotency_evidence: "request_id dedup POST single transition",
        composition_test: "binding-inventory-composition.test.ts#duplicate_delivery_fault",
      },
    ]);

    assert.equal(missing.ok, false);
    assert.ok(missing.diagnostics.some((d) => d.code === "IDEMPOTENCY_EVIDENCE_REQUIRED"));
    assert.equal(complete.ok, true);
  });
});
