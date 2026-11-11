/**
 * [REQ-TIED_PROJECT_SIZE_PROOF_PATH_SEMANTICS] [IMPL-TIED_PROJECT_SIZE_PROOF_PATH_SEMANTICS]
 * Path-derived proof_facet (coarse) and proof_subtype (fine) for project-size snapshot.
 */

export type CoarseTestKind = "unit" | "composition" | "e2e" | "binding";

export type ProofFacet = "unit" | "composition" | "e2e" | "binding_inventory";

export type ProofSubtype =
  | "unit.default"
  | "unit.colocated"
  | "composition.general"
  | "composition.wiring"
  | "composition.integration"
  | "composition.contract"
  | "binding_inventory.table"
  | "e2e.ui"
  | "e2e.platform_constrained";

export type ProofFileClassification = {
  facet: ProofFacet;
  subtype: ProofSubtype;
};

function normalizeRel(relPath: string): string {
  return relPath.replace(/\\/g, "/").toLowerCase();
}

/** Coarse classifier for receipt tier sums (unchanged contract + new composition suffixes). */
export function classifyTestFile(relPath: string): CoarseTestKind {
  const lower = normalizeRel(relPath);
  if (lower.includes("binding-inventory") || lower.includes("binding_inventory")) {
    return "binding";
  }
  if (lower.includes("e2e") || lower.endsWith(".e2e.test.ts") || lower.endsWith(".e2e.test.mjs")) {
    return "e2e";
  }
  if (
    lower.endsWith(".contract.test.ts") ||
    lower.endsWith(".contract.test.mjs") ||
    lower.endsWith(".binding.test.ts") ||
    lower.endsWith(".binding.test.mjs") ||
    lower.endsWith(".integration.test.ts") ||
    lower.endsWith(".integration.test.mjs") ||
    lower.includes("composition") ||
    lower.endsWith(".composition.test.ts") ||
    lower.endsWith(".composition.test.mjs")
  ) {
    return "composition";
  }
  return "unit";
}

/** Fine path-derived labels; header/manifest overrides are L2/L3. */
export function classifyTestFileFine(relPath: string): ProofFileClassification {
  const lower = normalizeRel(relPath);
  if (lower.includes("binding-inventory") || lower.includes("binding_inventory")) {
    return { facet: "binding_inventory", subtype: "binding_inventory.table" };
  }
  if (lower.includes("e2e") || lower.endsWith(".e2e.test.ts") || lower.endsWith(".e2e.test.mjs")) {
    return { facet: "e2e", subtype: "e2e.ui" };
  }
  if (lower.endsWith(".contract.test.ts") || lower.endsWith(".contract.test.mjs")) {
    return { facet: "composition", subtype: "composition.contract" };
  }
  if (lower.endsWith(".binding.test.ts") || lower.endsWith(".binding.test.mjs")) {
    return { facet: "composition", subtype: "composition.wiring" };
  }
  if (lower.endsWith(".integration.test.ts") || lower.endsWith(".integration.test.mjs")) {
    return { facet: "composition", subtype: "composition.integration" };
  }
  if (
    lower.includes("composition") ||
    lower.endsWith(".composition.test.ts") ||
    lower.endsWith(".composition.test.mjs")
  ) {
    return { facet: "composition", subtype: "composition.general" };
  }
  return { facet: "unit", subtype: "unit.default" };
}
