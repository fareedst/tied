/**
 * [IMPL-VOCABULARY_ANALYSIS] [ARCH-VOCABULARY_EXPLORER] [REQ-VOCABULARY_ANALYSIS]
 * Read-only TIED record catalog with methodology-only labeling.
 */

import {
  getDecisionsForRequirement,
  getRequirementsForDecision,
  isMethodologyOnlyIndexToken,
  isTokenInMethodology,
  listTokens,
  loadProjectIndex,
} from "../yaml-loader.js";
import { loadDetail } from "../detail-loader.js";

export type TiedOwnership = "project" | "methodology_only" | "merged_override" | "n/a";

export type TiedRelationship = {
  kind: "parent_requirement" | "child_architecture" | "child_implementation" | "implements_requirement";
  target_token: string;
};

export type TiedRecordEntry = {
  token: string;
  layer: "REQ" | "ARCH" | "IMPL";
  display: string;
  normalized_key: string;
  description: string;
  ownership: TiedOwnership;
  relationships: TiedRelationship[];
};

export type TiedRecordCatalog = {
  records: TiedRecordEntry[];
};

function layerFromToken(token: string): "REQ" | "ARCH" | "IMPL" | null {
  if (token.startsWith("REQ-")) return "REQ";
  if (token.startsWith("ARCH-")) return "ARCH";
  if (token.startsWith("IMPL-")) return "IMPL";
  return null;
}

function resolveOwnership(index: "requirements" | "architecture" | "implementation", token: string): TiedOwnership {
  if (isMethodologyOnlyIndexToken(index, token)) return "methodology_only";
  const inProject = Boolean(
    loadProjectIndex(index)?.[token] &&
      typeof loadProjectIndex(index)?.[token] === "object",
  );
  const inMethodology = isTokenInMethodology(index, token);
  if (inProject && inMethodology) return "merged_override";
  if (inProject) return "project";
  return "n/a";
}

function extractDescription(detail: Record<string, unknown> | null): string {
  if (!detail) return "";
  const desc = detail.description;
  if (typeof desc === "string") return desc;
  return "";
}

/**
 * [IMPL-VOCABULARY_ANALYSIS] [ARCH-VOCABULARY_EXPLORER] [REQ-VOCABULARY_ANALYSIS]
 * How: load merged indexes, descriptions, ownership, and traceability relationships.
 */
export function loadTiedRecordCatalog(): TiedRecordCatalog {
  const records: TiedRecordEntry[] = [];

  const reqTokens = listTokens("requirements").filter((t) => t.startsWith("REQ-"));
  const archTokens = listTokens("architecture").filter((t) => t.startsWith("ARCH-"));
  const implTokens = listTokens("implementation").filter((t) => t.startsWith("IMPL-"));

  for (const token of reqTokens) {
    const detail = loadDetail(token) as Record<string, unknown> | null;
    const relationships: TiedRelationship[] = [];
    const decisions = getDecisionsForRequirement(token);
    for (const arch of Object.keys(decisions.architecture ?? {})) {
      relationships.push({ kind: "child_architecture", target_token: arch });
    }
    for (const impl of Object.keys(decisions.implementation ?? {})) {
      relationships.push({ kind: "child_implementation", target_token: impl });
    }
    records.push({
      token,
      layer: "REQ",
      display: token,
      normalized_key: token.toLowerCase(),
      description: extractDescription(detail),
      ownership: resolveOwnership("requirements", token),
      relationships: relationships.sort((a, b) => a.target_token.localeCompare(b.target_token)),
    });
  }

  for (const token of archTokens) {
    const detail = loadDetail(token) as Record<string, unknown> | null;
    const relationships: TiedRelationship[] = [];
    const reqs = getRequirementsForDecision(token);
    for (const req of reqs.requirementTokens) {
      relationships.push({ kind: "implements_requirement", target_token: req });
    }
    records.push({
      token,
      layer: "ARCH",
      display: token,
      normalized_key: token.toLowerCase(),
      description: extractDescription(detail),
      ownership: resolveOwnership("architecture", token),
      relationships: relationships.sort((a, b) => a.target_token.localeCompare(b.target_token)),
    });
  }

  for (const token of implTokens) {
    const detail = loadDetail(token) as Record<string, unknown> | null;
    const relationships: TiedRelationship[] = [];
    const reqs = getRequirementsForDecision(token);
    for (const req of reqs.requirementTokens) {
      relationships.push({ kind: "implements_requirement", target_token: req });
    }
    records.push({
      token,
      layer: "IMPL",
      display: token,
      normalized_key: token.toLowerCase(),
      description: extractDescription(detail),
      ownership: resolveOwnership("implementation", token),
      relationships: relationships.sort((a, b) => a.target_token.localeCompare(b.target_token)),
    });
  }

  records.sort((a, b) => a.token.localeCompare(b.token));
  return { records };
}

export { layerFromToken };
