/**
 * [IMPL-ASYNC_BINDING_VALIDATOR] [IMPL-QUALITY_BINDING_INVENTORY] [ARCH-ASYNC_COMPOSITION_BINDING]
 * [ARCH-QUALITY_ASSURANCE_PROFILES] [ARCH-MODULE_VALIDATION]
 * [REQ-ASYNC_COMPOSITION_INVENTORY] [REQ-QUALITY_ASSURANCE_EVIDENCE] [REQ-MODULE_VALIDATION]
 * Summary: Validate composition bindings and their UI-free proof references including async seam columns.
 */

export type BindingInventoryRow = {
  id: string;
  trigger: string;
  callee: string;
  arguments: string;
  effect: string;
  ordering: string;
  failure_behavior: string;
  /** W5 optional: fire-and-forget, request-response, streaming, or declared delivery category */
  async_semantics?: string;
  /** W5 optional: who cancels and binding behavior after cancellation */
  cancellation?: string;
  /** W5 optional: deduplication or idempotency evidence when retry/at-least-once declared */
  idempotency_evidence?: string;
  composition_test?: string;
  e2e_only?: boolean;
  e2e_only_reason?: string;
};

export type BindingInventoryDiagnostic = {
  code:
    | "DUPLICATE_BINDING_ID"
    | "MISSING_BINDING_FIELD"
    | "MISSING_COMPOSITION_TEST"
    | "UNJUSTIFIED_E2E_ONLY"
    | "ASYNC_SEMANTICS_REQUIRED_FOR_EVENT_MESSAGE"
    | "ASYNC_SEMANTICS_REQUIRES_ORDERING_FAILURE"
    | "IDEMPOTENCY_EVIDENCE_REQUIRED";
  message: string;
  row: number;
};

export type BindingInventoryReport = {
  schema_version: "binding-inventory-validator.v1";
  ok: boolean;
  proof_boundary: string;
  diagnostics: BindingInventoryDiagnostic[];
};

const PLATFORM_CONSTRAINT = /\b(?:native|OS|window-server|visual|browser|file dialog|filesystem)\b/i;
const EVENT_MESSAGE_TRIGGER = /\b(?:event|message)\b/i;
const RETRY_OR_AT_LEAST_ONCE =
  /\b(?:retry|retries|at-least-once|at_least_once|at least once)\b/i;
const IDEMPOTENCY_MARKERS =
  /\b(?:idempoten|dedup|deduplic|duplicate protection|request_id|message_id)\b/i;

function requiredFieldsMissing(row: BindingInventoryRow): string[] {
  const fields: Array<keyof BindingInventoryRow> = [
    "id",
    "trigger",
    "callee",
    "arguments",
    "effect",
    "ordering",
    "failure_behavior",
  ];
  return fields.filter((field) => {
    const value = row[field];
    return typeof value !== "string" || value.trim().length === 0;
  });
}

function isNonEmpty(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function declaresRetryOrAtLeastOnce(row: BindingInventoryRow): boolean {
  const haystack = [row.failure_behavior, row.async_semantics, row.ordering]
    .filter(isNonEmpty)
    .join(" ");
  return RETRY_OR_AT_LEAST_ONCE.test(haystack);
}

function hasIdempotencyEvidence(row: BindingInventoryRow): boolean {
  if (isNonEmpty(row.idempotency_evidence)) {
    return true;
  }
  const haystack = [row.failure_behavior, row.cancellation, row.composition_test]
    .filter(isNonEmpty)
    .join(" ");
  return IDEMPOTENCY_MARKERS.test(haystack);
}

function validateAsyncSeamRules(
  row: BindingInventoryRow,
  rowNumber: number,
): BindingInventoryDiagnostic[] {
  const diagnostics: BindingInventoryDiagnostic[] = [];
  const asyncSemantics = row.async_semantics?.trim() ?? "";

  if (asyncSemantics.length > 0) {
    if (!isNonEmpty(row.ordering) || !isNonEmpty(row.failure_behavior)) {
      diagnostics.push({
        code: "ASYNC_SEMANTICS_REQUIRES_ORDERING_FAILURE",
        message: `Binding ${row.id} declares async_semantics but ordering and failure_behavior must be non-empty.`,
        row: rowNumber,
      });
    }
  }

  if (EVENT_MESSAGE_TRIGGER.test(row.trigger) && asyncSemantics.length === 0) {
    diagnostics.push({
      code: "ASYNC_SEMANTICS_REQUIRED_FOR_EVENT_MESSAGE",
      message: `Binding ${row.id} uses an event or message trigger and must declare async_semantics.`,
      row: rowNumber,
    });
  }

  if (declaresRetryOrAtLeastOnce(row) && !hasIdempotencyEvidence(row)) {
    diagnostics.push({
      code: "IDEMPOTENCY_EVIDENCE_REQUIRED",
      message: `Binding ${row.id} declares retry or at-least-once delivery and must include idempotency/deduplication evidence.`,
      row: rowNumber,
    });
  }

  return diagnostics;
}

/**
 * [IMPL-ASYNC_BINDING_VALIDATOR] [IMPL-QUALITY_BINDING_INVENTORY] [ARCH-ASYNC_COMPOSITION_BINDING]
 * [ARCH-QUALITY_ASSURANCE_PROFILES] [ARCH-MODULE_VALIDATION]
 * [REQ-ASYNC_COMPOSITION_INVENTORY] [REQ-QUALITY_ASSURANCE_EVIDENCE] [REQ-MODULE_VALIDATION]
 * How: Check row shape, async seam columns, and required composition proof fields before accepting a binding.
 */
export function validateBindingInventory(
  rows: BindingInventoryRow[],
): BindingInventoryReport {
  // [IMPL-ASYNC_BINDING_VALIDATOR] [IMPL-QUALITY_BINDING_INVENTORY] [ARCH-ASYNC_COMPOSITION_BINDING]
  // [REQ-ASYNC_COMPOSITION_INVENTORY] [REQ-QUALITY_ASSURANCE_EVIDENCE] [REQ-MODULE_VALIDATION]
  // How: Check row shape, async seam columns, and required composition proof fields before accepting a binding.
  const diagnostics: BindingInventoryDiagnostic[] = [];
  const seen = new Set<string>();

  rows.forEach((row, index) => {
    const rowNumber = index + 1;
    if (seen.has(row.id)) {
      diagnostics.push({
        code: "DUPLICATE_BINDING_ID",
        message: `Binding ID ${row.id} is duplicated.`,
        row: rowNumber,
      });
    }
    seen.add(row.id);

    const missing = requiredFieldsMissing(row);
    if (missing.length > 0) {
      diagnostics.push({
        code: "MISSING_BINDING_FIELD",
        message: `Binding ${row.id || rowNumber} is missing: ${missing.join(", ")}.`,
        row: rowNumber,
      });
    }

    diagnostics.push(...validateAsyncSeamRules(row, rowNumber));

    if (row.e2e_only === true) {
      if (!row.e2e_only_reason || !PLATFORM_CONSTRAINT.test(row.e2e_only_reason)) {
        diagnostics.push({
          code: "UNJUSTIFIED_E2E_ONLY",
          message: `Binding ${row.id} needs a named platform constraint for e2e_only.`,
          row: rowNumber,
        });
      }
    } else if (!row.composition_test || row.composition_test.trim().length === 0) {
      diagnostics.push({
        code: "MISSING_COMPOSITION_TEST",
        message: `Binding ${row.id} has no UI-free composition test locus.`,
        row: rowNumber,
      });
    }
  });

  return {
    schema_version: "binding-inventory-validator.v1",
    ok: diagnostics.length === 0,
    proof_boundary:
      "Binding inventory completeness, async seam column presence, and E2E justification only; this proves binding exercised in test design—not runtime ordering, delivery guarantees, cancellation propagation, or race-freedom.",
    diagnostics,
  };
}

/** [IMPL-ASYNC_BINDING_VALIDATOR] [REQ-ASYNC_COMPOSITION_INVENTORY] — documented CONTROLLED_COMPOSITION_FAULT patterns for UI-free tests. */
export const CONTROLLED_COMPOSITION_FAULT_PATTERNS = {
  ordering_fault: {
    description: "Trigger before listener registered",
    expected_outcome: "Handler not invoked; composition test fails closed",
    inventory_columns: ["ordering", "async_semantics", "composition_test"],
  },
  timeout_fault: {
    description: "Slow callee exceeds IMPL TIMEOUT",
    expected_outcome: "Named failure mode; no partial success POST",
    inventory_columns: ["failure_behavior", "async_semantics", "composition_test"],
  },
  duplicate_delivery_fault: {
    description: "Message delivered twice",
    expected_outcome: "Idempotency POST asserts single DATA transition",
    inventory_columns: ["idempotency_evidence", "async_semantics", "composition_test"],
  },
} as const;
