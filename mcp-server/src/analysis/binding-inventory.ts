/**
 * [IMPL-QUALITY_BINDING_INVENTORY] [ARCH-QUALITY_ASSURANCE_PROFILES] [ARCH-MODULE_VALIDATION]
 * [REQ-QUALITY_ASSURANCE_EVIDENCE] [REQ-MODULE_VALIDATION]
 * Summary: Validate composition bindings and their UI-free proof references.
 */

export type BindingInventoryRow = {
  id: string;
  trigger: string;
  callee: string;
  arguments: string;
  effect: string;
  ordering: string;
  failure_behavior: string;
  composition_test?: string;
  e2e_only?: boolean;
  e2e_only_reason?: string;
};

export type BindingInventoryDiagnostic = {
  code:
    | "DUPLICATE_BINDING_ID"
    | "MISSING_BINDING_FIELD"
    | "MISSING_COMPOSITION_TEST"
    | "UNJUSTIFIED_E2E_ONLY";
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

/**
 * [IMPL-QUALITY_BINDING_INVENTORY] [ARCH-QUALITY_ASSURANCE_PROFILES] [ARCH-MODULE_VALIDATION]
 * [REQ-QUALITY_ASSURANCE_EVIDENCE] [REQ-MODULE_VALIDATION]
 * How: Check row shape and required composition proof fields before accepting a binding.
 */
export function validateBindingInventory(
  rows: BindingInventoryRow[],
): BindingInventoryReport {
  // [IMPL-QUALITY_BINDING_INVENTORY] [ARCH-QUALITY_ASSURANCE_PROFILES] [ARCH-MODULE_VALIDATION]
  // [REQ-QUALITY_ASSURANCE_EVIDENCE] [REQ-MODULE_VALIDATION]
  // How: Check row shape and required composition proof fields before accepting a binding.
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
      "Binding inventory completeness and E2E justification only; this does not prove the runtime behavior of the bound units.",
    diagnostics,
  };
}
