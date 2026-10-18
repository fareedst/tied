/**
 * [IMPL-TIED_CONTEXT_ADAPTIVE_CONTRACTS] [ARCH-TIED_CONTEXT_ADAPTIVE_ENGINEERING]
 * [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING]
 */

import {
  PRACTICE_CONTRACT_SCHEMA,
  PRACTICE_LIBRARY_SCHEMA,
  type DimensionLevel,
  DIMENSION_LEVELS,
} from "./constants.js";

export type ValidationDiagnostic = {
  code: string;
  message: string;
  path: string;
};

export type PracticeContractV1 = {
  schema_version: typeof PRACTICE_CONTRACT_SCHEMA;
  id: string;
  name: string;
  applicability?: Partial<Record<string, DimensionLevel[]>>;
  hard_constraint?: boolean;
  prerequisites?: string[];
  compatible_with?: string[];
  incompatible_with?: string[];
  tied_binding?: { proc?: string; tool?: string };
  proof_boundary?: string;
};

export type PracticeLibraryV1 = {
  schema_version: typeof PRACTICE_LIBRARY_SCHEMA;
  contracts: PracticeContractV1[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function levelList(value: unknown, path: string, diagnostics: ValidationDiagnostic[]): boolean {
  if (!Array.isArray(value)) {
    diagnostics.push({ code: "INVALID_APPLICABILITY", message: "applicability values must be arrays", path });
    return false;
  }
  for (const item of value) {
    if (typeof item !== "string" || !DIMENSION_LEVELS.includes(item as DimensionLevel)) {
      diagnostics.push({ code: "INVALID_ENUM", message: "invalid dimension level in applicability", path });
      return false;
    }
  }
  return true;
}

/** [IMPL-TIED_CONTEXT_ADAPTIVE_CONTRACTS] VALIDATE_PRACTICE_CONTRACT_V1 */
export function validatePracticeContractV1(input: unknown): {
  ok: boolean;
  contract?: PracticeContractV1;
  diagnostics: ValidationDiagnostic[];
} {
  const diagnostics: ValidationDiagnostic[] = [];
  if (!isRecord(input)) {
    return {
      ok: false,
      diagnostics: [{ code: "INVALID_ROOT", message: "contract must be an object", path: "$" }],
    };
  }
  if (input.schema_version !== PRACTICE_CONTRACT_SCHEMA) {
    diagnostics.push({
      code: "WRONG_SCHEMA",
      message: `schema_version must be ${PRACTICE_CONTRACT_SCHEMA}`,
      path: "schema_version",
    });
  }
  if (typeof input.id !== "string" || !input.id.trim()) {
    diagnostics.push({ code: "MISSING_FIELD", message: "id required", path: "id" });
  }
  if (isRecord(input.applicability)) {
    for (const [key, levels] of Object.entries(input.applicability)) {
      levelList(levels, `applicability.${key}`, diagnostics);
    }
  }
  if (diagnostics.length > 0) {
    return { ok: false, diagnostics };
  }
  return {
    ok: true,
    contract: input as PracticeContractV1,
    diagnostics: [],
  };
}

/** [IMPL-TIED_CONTEXT_ADAPTIVE_CONTRACTS] LOAD_PRACTICE_LIBRARY_V1 */
export function loadPracticeLibraryV1(documents: unknown[]): {
  ok: boolean;
  library?: PracticeLibraryV1;
  diagnostics: ValidationDiagnostic[];
} {
  const diagnostics: ValidationDiagnostic[] = [];
  const contracts: PracticeContractV1[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < documents.length; i += 1) {
    const result = validatePracticeContractV1(documents[i]);
    if (!result.ok || !result.contract) {
      diagnostics.push(...result.diagnostics.map((d) => ({ ...d, path: `[${i}].${d.path}` })));
      continue;
    }
    if (seen.has(result.contract.id)) {
      diagnostics.push({ code: "DUPLICATE_ID", message: "duplicate practice id", path: `[${i}].id` });
      continue;
    }
    seen.add(result.contract.id);
    contracts.push(result.contract);
  }

  if (diagnostics.length > 0) {
    return { ok: false, diagnostics };
  }

  contracts.sort((a, b) => a.id.localeCompare(b.id));

  for (const contract of contracts) {
    for (const prereq of contract.prerequisites ?? []) {
      if (!seen.has(prereq)) {
        diagnostics.push({
          code: "MISSING_PREREQUISITE",
          message: `missing prerequisite ${prereq}`,
          path: `${contract.id}.prerequisites`,
        });
      }
    }
    for (const otherId of contract.incompatible_with ?? []) {
      const other = contracts.find((c) => c.id === otherId);
      if (other && (other.compatible_with ?? []).includes(contract.id)) {
        diagnostics.push({
          code: "CONTRADICTORY_COMPAT",
          message: `incompatible_with contradicts compatible_with for ${contract.id}`,
          path: contract.id,
        });
      }
    }
  }

  const graph = new Map<string, string[]>();
  for (const c of contracts) {
    graph.set(c.id, c.compatible_with ?? []);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function dfs(id: string): boolean {
    if (visiting.has(id)) return false;
    if (visited.has(id)) return true;
    visiting.add(id);
    for (const next of graph.get(id) ?? []) {
      if (!dfs(next)) return false;
    }
    visiting.delete(id);
    visited.add(id);
    return true;
  }
  for (const c of contracts) {
    if (!dfs(c.id)) {
      diagnostics.push({ code: "COMPAT_CYCLE", message: "compatibility graph cycle", path: c.id });
      break;
    }
  }

  if (diagnostics.length > 0) {
    return { ok: false, diagnostics };
  }

  return {
    ok: true,
    library: { schema_version: PRACTICE_LIBRARY_SCHEMA, contracts },
    diagnostics: [],
  };
}
