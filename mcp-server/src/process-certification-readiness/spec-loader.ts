/**
 * [IMPL-TIED_PROCESS_CERTIFICATION_SPEC] [ARCH-TIED_PROCESS_CERTIFICATION_READINESS]
 * [REQ-TIED_PROCESS_CERTIFICATION_READINESS]
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import {
  CONFORMANCE_CATALOG_SCHEMA,
  EDSE_CLAUSE_IDS,
  EDSE_PROCESS_SPEC_SCHEMA,
  FORBIDDEN_ROLLUP_KEYS,
  ISO_12207_MAPPING_SCHEMA,
  ISO_330XX_CAPABILITY_MODEL_SCHEMA,
} from "./constants.js";
import type {
  ConformanceCatalogV1,
  EdseProcessSpecV1,
  Iso12207MappingV1,
  Iso330xxCapabilityModelV1,
  ValidationDiagnostic,
} from "./types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sha256Clauses(clauses: unknown): string {
  return crypto.createHash("sha256").update(JSON.stringify(clauses)).digest("hex");
}

function findForbiddenRollupKeys(value: unknown, prefix = ""): ValidationDiagnostic[] {
  const diagnostics: ValidationDiagnostic[] = [];
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      diagnostics.push(...findForbiddenRollupKeys(value[i], `${prefix}[${i}]`));
    }
    return diagnostics;
  }
  if (!isRecord(value)) return diagnostics;
  for (const [key, child] of Object.entries(value)) {
    const p = prefix ? `${prefix}.${key}` : key;
    if ((FORBIDDEN_ROLLUP_KEYS as readonly string[]).includes(key)) {
      diagnostics.push({
        code: "FORBIDDEN_ROLLUP_FIELD",
        message: `Aggregate score field forbidden: ${key}`,
        path: p,
      });
    }
    diagnostics.push(...findForbiddenRollupKeys(child, p));
  }
  return diagnostics;
}

/** LOAD_PROCESS_CERTIFICATION_BUNDLE_V1 */
export function validateEdseProcessSpecV1(input: unknown): {
  ok: boolean;
  spec?: EdseProcessSpecV1;
  diagnostics: ValidationDiagnostic[];
} {
  const diagnostics: ValidationDiagnostic[] = [];
  if (!isRecord(input)) {
    return { ok: false, diagnostics: [{ code: "INVALID_ROOT", message: "spec must be object", path: "$" }] };
  }
  if (input.schema_version !== EDSE_PROCESS_SPEC_SCHEMA) {
    diagnostics.push({
      code: "WRONG_SCHEMA",
      message: `schema_version must be ${EDSE_PROCESS_SPEC_SCHEMA}`,
      path: "schema_version",
    });
  }
  if (!Array.isArray(input.clauses)) {
    diagnostics.push({ code: "MISSING_CLAUSES", message: "clauses array required", path: "clauses" });
    return { ok: false, diagnostics };
  }
  const seen = new Set<string>();
  for (const clause of input.clauses) {
    if (!isRecord(clause) || typeof clause.id !== "string") {
      diagnostics.push({ code: "INVALID_CLAUSE", message: "clause id required", path: "clauses" });
      continue;
    }
    if (seen.has(clause.id)) {
      diagnostics.push({ code: "DUPLICATE_CLAUSE", message: `duplicate ${clause.id}`, path: `clauses.${clause.id}` });
    }
    seen.add(clause.id);
  }
  for (const required of EDSE_CLAUSE_IDS) {
    if (!seen.has(required)) {
      diagnostics.push({ code: "MISSING_CLAUSE", message: `missing ${required}`, path: "clauses" });
    }
  }
  const computed = sha256Clauses(input.clauses);
  if (typeof input.content_hash === "string" && input.content_hash !== computed) {
    diagnostics.push({ code: "HASH_MISMATCH", message: "content_hash does not match clauses", path: "content_hash" });
  }
  diagnostics.push(...findForbiddenRollupKeys(input));
  const ok = diagnostics.length === 0;
  if (!ok) return { ok: false, diagnostics };
  return {
    ok: true,
    spec: input as unknown as EdseProcessSpecV1,
    diagnostics: [],
  };
}

export function validateIso12207MappingV1(input: unknown): {
  ok: boolean;
  mapping?: Iso12207MappingV1;
  diagnostics: ValidationDiagnostic[];
} {
  const diagnostics: ValidationDiagnostic[] = [];
  if (!isRecord(input)) {
    return { ok: false, diagnostics: [{ code: "INVALID_ROOT", message: "mapping must be object", path: "$" }] };
  }
  if (input.schema_version !== ISO_12207_MAPPING_SCHEMA) {
    diagnostics.push({ code: "WRONG_SCHEMA", message: "wrong schema_version", path: "schema_version" });
  }
  if (input.reference_mapping_only !== true) {
    diagnostics.push({
      code: "REFERENCE_BOUNDARY",
      message: "reference_mapping_only must be true",
      path: "reference_mapping_only",
    });
  }
  const ok = diagnostics.length === 0;
  return ok
    ? { ok: true, mapping: input as unknown as Iso12207MappingV1, diagnostics: [] }
    : { ok: false, diagnostics };
}

export function validateIso330xxCapabilityModelV1(input: unknown): {
  ok: boolean;
  model?: Iso330xxCapabilityModelV1;
  diagnostics: ValidationDiagnostic[];
} {
  const diagnostics: ValidationDiagnostic[] = [];
  if (!isRecord(input)) {
    return { ok: false, diagnostics: [{ code: "INVALID_ROOT", message: "model must be object", path: "$" }] };
  }
  if (input.schema_version !== ISO_330XX_CAPABILITY_MODEL_SCHEMA) {
    diagnostics.push({ code: "WRONG_SCHEMA", message: "wrong schema_version", path: "schema_version" });
  }
  diagnostics.push(...findForbiddenRollupKeys(input));
  const ok = diagnostics.length === 0;
  return ok
    ? { ok: true, model: input as unknown as Iso330xxCapabilityModelV1, diagnostics: [] }
    : { ok: false, diagnostics };
}

export function validateConformanceCatalogV1(input: unknown): {
  ok: boolean;
  catalog?: ConformanceCatalogV1;
  diagnostics: ValidationDiagnostic[];
} {
  const diagnostics: ValidationDiagnostic[] = [];
  if (!isRecord(input)) {
    return { ok: false, diagnostics: [{ code: "INVALID_ROOT", message: "catalog must be object", path: "$" }] };
  }
  if (input.schema_version !== CONFORMANCE_CATALOG_SCHEMA) {
    diagnostics.push({ code: "WRONG_SCHEMA", message: "wrong schema_version", path: "schema_version" });
  }
  if (!Array.isArray(input.entries)) {
    diagnostics.push({ code: "MISSING_ENTRIES", message: "entries required", path: "entries" });
    return { ok: false, diagnostics };
  }
  const covered = new Set<string>();
  for (const entry of input.entries) {
    if (isRecord(entry) && typeof entry.clause_id === "string") covered.add(entry.clause_id);
  }
  for (const id of EDSE_CLAUSE_IDS) {
    if (!covered.has(id)) {
      diagnostics.push({ code: "CATALOG_GAP", message: `no catalog entry for ${id}`, path: "entries" });
    }
  }
  const ok = diagnostics.length === 0;
  return ok
    ? { ok: true, catalog: input as unknown as ConformanceCatalogV1, diagnostics: [] }
    : { ok: false, diagnostics };
}

export type ProcessCertificationBundleV1 = {
  spec: EdseProcessSpecV1;
  mapping: Iso12207MappingV1;
  capabilityModel: Iso330xxCapabilityModelV1;
  catalog: ConformanceCatalogV1;
  bundleRoot: string;
};

/** LOAD_PROCESS_CERTIFICATION_BUNDLE_V1 — load four bundle YAML artifacts from disk. */
export function loadProcessCertificationBundleV1(bundleRoot: string): {
  ok: boolean;
  bundle?: ProcessCertificationBundleV1;
  diagnostics: ValidationDiagnostic[];
} {
  const diagnostics: ValidationDiagnostic[] = [];
  const readYaml = (name: string): unknown => {
    const filePath = path.join(bundleRoot, name);
    if (!fs.existsSync(filePath)) {
      diagnostics.push({ code: "MISSING_FILE", message: `missing ${name}`, path: filePath });
      return undefined;
    }
    return yaml.load(fs.readFileSync(filePath, "utf8"));
  };
  const specResult = validateEdseProcessSpecV1(readYaml("edse-process-spec.v1.yaml"));
  const mapResult = validateIso12207MappingV1(readYaml("iso-12207-mapping.v1.yaml"));
  const capResult = validateIso330xxCapabilityModelV1(readYaml("iso-330xx-capability-model.v1.yaml"));
  const catResult = validateConformanceCatalogV1(readYaml("conformance-catalog.v1.yaml"));
  diagnostics.push(
    ...specResult.diagnostics,
    ...mapResult.diagnostics,
    ...capResult.diagnostics,
    ...catResult.diagnostics,
  );
  if (!specResult.ok || !mapResult.ok || !capResult.ok || !catResult.ok) {
    return { ok: false, diagnostics };
  }
  return {
    ok: true,
    bundle: {
      spec: specResult.spec!,
      mapping: mapResult.mapping!,
      capabilityModel: capResult.model!,
      catalog: catResult.catalog!,
      bundleRoot,
    },
    diagnostics: [],
  };
}

export function defaultBundleRoot(): string {
  return path.resolve(import.meta.dirname, "../../../tied-bundle/resources/process-certification");
}
