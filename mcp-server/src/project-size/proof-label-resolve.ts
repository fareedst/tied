/**
 * [REQ-TIED_PROJECT_SIZE_PROOF_FACET_INFERENCE] [REQ-TIED_PROJECT_SIZE_PROOF_PATH_SEMANTICS]
 * [REQ-WF_TRIAL_PROOF_MANIFEST_LITE]
 */

import { classifyTestFileFine, type ProofFacet, type ProofSubtype } from "./proof-test-classify.js";
import { parseProofHeadersFromSource } from "./proof-label-parse.js";
import type { ProofFacetManifestFileRow, ProofFacetManifestV1 } from "./wf-proof-manifest-types.js";

export const VALID_PROOF_SUBTYPES: readonly ProofSubtype[] = [
  "unit.default",
  "unit.colocated",
  "composition.general",
  "composition.wiring",
  "composition.integration",
  "composition.contract",
  "binding_inventory.table",
  "e2e.ui",
  "e2e.platform_constrained",
] as const;

const VALID_SUBTYPES = new Set<ProofSubtype>(VALID_PROOF_SUBTYPES);

export function isProofSubtype(s: string): s is ProofSubtype {
  return VALID_SUBTYPES.has(s as ProofSubtype);
}

export function facetForProofSubtype(subtype: ProofSubtype): ProofFacet {
  if (subtype.startsWith("unit.")) return "unit";
  if (subtype.startsWith("composition.")) return "composition";
  if (subtype.startsWith("binding_inventory.")) return "binding_inventory";
  if (subtype.startsWith("e2e.")) return "e2e";
  return "unit";
}

function defaultSubtypeForProofKind(
  kind: "unit" | "composition" | "binding-inventory" | "e2e",
  relPath: string,
): ProofSubtype {
  const pathDerived = classifyTestFileFine(relPath).subtype;
  if (kind === "unit") return "unit.default";
  if (kind === "binding-inventory") return "binding_inventory.table";
  if (kind === "e2e") return pathDerived.startsWith("e2e.") ? pathDerived : "e2e.ui";
  if (kind === "composition") {
    return pathDerived.startsWith("composition.") ? pathDerived : "composition.general";
  }
  return pathDerived;
}

function normalizeRel(relPath: string): string {
  return relPath.replace(/\\/g, "/").replace(/^\.\//, "");
}

export function manifestFileOverrides(manifest?: ProofFacetManifestV1): Map<string, ProofFacetManifestFileRow> {
  const map = new Map<string, ProofFacetManifestFileRow>();
  if (!manifest?.files) return map;
  for (const row of manifest.files) {
    map.set(normalizeRel(row.path), row);
  }
  return map;
}

/** Override order (L3): manifest > PROOF_LABEL > PROOF_KIND > path. */
export function resolveProofSubtypeWithManifest(
  relPath: string,
  source: string,
  manifest?: ProofFacetManifestV1,
): ProofSubtype {
  const rel = normalizeRel(relPath);
  const overrides = manifestFileOverrides(manifest);
  const row = overrides.get(rel);
  if (row && isProofSubtype(row.proof_subtype)) {
    return row.proof_subtype;
  }
  return resolveProofSubtypeForFile(relPath, source);
}

/** L2 path/header only (no manifest). */
export function resolveProofSubtypeForFile(relPath: string, source: string): ProofSubtype {
  const headers = parseProofHeadersFromSource(source);
  if (headers.proof_label && isProofSubtype(headers.proof_label)) {
    return headers.proof_label;
  }
  if (headers.proof_kind) {
    return defaultSubtypeForProofKind(headers.proof_kind, relPath);
  }
  return classifyTestFileFine(relPath).subtype;
}
