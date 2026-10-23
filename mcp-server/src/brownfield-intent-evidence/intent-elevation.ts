/**
 * [IMPL-TIED_BROWNFIELD_VALIDATION] [ARCH-TIED_BROWNFIELD_EVIDENCE_MODEL]
 * [REQ-TIED_BROWNFIELD_INTENT_ELEVATION]
 * Summary: Normalize and validate brownfield intent-elevation matrices (Markdown/YAML parity, report-only).
 */

import { stableJsonForHash } from "../storage-dump.js";
import { createHash } from "node:crypto";

import yaml from "js-yaml";

export const ARTIFACT_SCHEMA_VERSION = "intent-elevation.v1";
export const VALIDATOR_SCHEMA_VERSION = "brownfield-intent-evidence-validator.v1";
export const RECEIPT_SCHEMA_VERSION = "brownfield-intent-evidence-receipt.v1";
export const VALIDATOR_VERSION = "1.0.0";
export const VALIDATOR_PROOF_BOUNDARY =
  "Structural matrix validation only; does not prove runtime behavior or promote rows to project YAML.";

const DISPOSITIONS = new Set(["observed", "approved", "unresolved", "rejected"]);
const CONFIDENCE = new Set(["high", "medium", "low"]);
const SOURCE_TYPES = new Set([
  "code",
  "impl_sidecar",
  "test",
  "help",
  "arch",
  "req",
  "code_graph",
]);
const TIED_REF = /^(REQ|ARCH|IMPL)-[A-Z0-9_-]+$/;

export type IntentElevationRow = {
  row_id: string;
  claim: string;
  source_type: string;
  location: string;
  disposition: string;
  confidence: string;
  proof_boundary: string;
  promotion_target?: string;
};

export type NormalizedIntentElevation = {
  schema_version: typeof ARTIFACT_SCHEMA_VERSION;
  baseline_revision: string;
  scope_tokens: string[];
  rows: IntentElevationRow[];
};

export type IntentElevationDiagnostic = {
  code:
    | "INVALID_YAML"
    | "INVALID_MARKDOWN"
    | "WRONG_SCHEMA_VERSION"
    | "MISSING_FIELD"
    | "INVALID_ENUM"
    | "BASELINE_MISMATCH"
    | "ILLEGAL_PROMOTION_TARGET"
    | "EMPTY_MATRIX"
    | "PARSE_ERROR";
  message: string;
  row_id?: string;
  path?: string;
};

export type IntentElevationValidationReport = {
  schema_version: typeof VALIDATOR_SCHEMA_VERSION;
  ok: boolean;
  blocking: boolean;
  mode: BrownfieldValidationMode;
  proof_boundary: string;
  baseline_revision: string;
  matrix_normalize_hash: string;
  diagnostics: IntentElevationDiagnostic[];
  normalized?: NormalizedIntentElevation;
};

export type BrownfieldValidationMode = "report_only" | "pilot" | "strict";

export type BrownfieldIntentEvidenceValidateInput = {
  markdown_text?: string;
  yaml_text?: string;
  matrix_path?: string;
  baseline_revision?: string;
  scope_tokens?: string[];
  mode?: BrownfieldValidationMode;
  scoped_analysis_evidence_id?: string;
  claims_review_evidence_id?: string;
};

export type BrownfieldIntentEvidenceReceipt = Omit<
  IntentElevationValidationReport,
  "schema_version"
> & {
  schema_version: typeof RECEIPT_SCHEMA_VERSION;
  validator_version: string;
  evidence_refs?: {
    scoped_analysis_evidence_id?: string;
    claims_review_evidence_id?: string;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function splitTableRow(line: string): string[] {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|")) {
    return [];
  }
  const parts = trimmed.split("|").map((cell) => cell.trim());
  if (parts.length > 0 && parts[0] === "") {
    parts.shift();
  }
  if (parts.length > 0 && parts[parts.length - 1] === "") {
    parts.pop();
  }
  return parts;
}

function isSeparatorRow(cells: string[]): boolean {
  return cells.every((cell) => /^:?-{2,}:?$/.test(cell.replace(/\s/g, "")));
}

export function parseMarkdownIntentElevationMatrix(
  markdown: string,
): { ok: true; value: NormalizedIntentElevation } | { ok: false; diagnostics: IntentElevationDiagnostic[] } {
  const diagnostics: IntentElevationDiagnostic[] = [];
  const baselineMatch =
    markdown.match(/\*\*Baseline revision:\*\*\s*`([^`]+)`/i) ??
    markdown.match(/\*\*Baseline revision:\*\*\s*(\S+)/i);
  const scopeMatch = markdown.match(/\*\*Scope tokens:\*\*\s*(.+)/i);

  if (!baselineMatch?.[1]) {
    diagnostics.push({
      code: "MISSING_FIELD",
      message: "Markdown matrix must declare **Baseline revision:**",
      path: "header.baseline_revision",
    });
  }

  const baseline_revision = baselineMatch?.[1]?.trim() ?? "";
  const scopeRaw = scopeMatch?.[1]?.trim() ?? "";
  const scope_tokens = scopeRaw
    .split(/[,;\s]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0 && TIED_REF.test(token));

  const matrixSection = markdown.split(/^##\s+Matrix\s*$/im)[1];
  if (!matrixSection) {
    diagnostics.push({
      code: "INVALID_MARKDOWN",
      message: "Markdown matrix must include a ## Matrix section with a table",
      path: "matrix",
    });
    return { ok: false, diagnostics };
  }

  const lines = matrixSection.split("\n");
  const rows: IntentElevationRow[] = [];
  let header: string[] | null = null;

  for (const line of lines) {
    const cells = splitTableRow(line);
    if (cells.length === 0) {
      continue;
    }
    if (isSeparatorRow(cells)) {
      continue;
    }
    if (!header) {
      header = cells.map((cell) => cell.toLowerCase());
      continue;
    }

    const get = (names: string[]): string => {
      for (const name of names) {
        const index = header?.indexOf(name) ?? -1;
        if (index >= 0 && index < cells.length) {
          return cells[index]?.trim() ?? "";
        }
      }
      return "";
    };

    const row_id = get(["#", "row_id", "id"]) || String(rows.length + 1);
    const claim = get(["claim"]);
    const source_type = get(["source type", "source_type"]);
    const location = get(["location"]);
    const disposition = get(["disposition"]).toLowerCase();
    const confidence = get(["confidence"]).toLowerCase();
    const proof_boundary = get(["proof boundary", "proof_boundary"]);
    const promotion_target = get(["req/arch target", "promotion_target", "req_arch target"]);

    if (
      !claim &&
      !source_type &&
      !location &&
      !disposition &&
      !proof_boundary &&
      !promotion_target
    ) {
      continue;
    }

    rows.push({
      row_id,
      claim,
      source_type: source_type.toLowerCase(),
      location,
      disposition,
      confidence,
      proof_boundary,
      promotion_target: promotion_target || undefined,
    });
  }

  if (rows.length === 0) {
    diagnostics.push({
      code: "EMPTY_MATRIX",
      message: "Matrix table contains no data rows",
      path: "matrix.rows",
    });
  }

  if (diagnostics.length > 0) {
    return { ok: false, diagnostics };
  }

  return {
    ok: true,
    value: {
      schema_version: ARTIFACT_SCHEMA_VERSION,
      baseline_revision,
      scope_tokens,
      rows,
    },
  };
}

function rowFromMapping(raw: Record<string, unknown>, index: number): IntentElevationRow {
  const row_id = nonEmpty(raw.row_id) ? raw.row_id.trim() : String(index + 1);
  const promotion =
    raw.promotion_target ?? raw.req_arch_target ?? raw["REQ/ARCH target"];
  return {
    row_id,
    claim: nonEmpty(raw.claim) ? raw.claim.trim() : "",
    source_type: nonEmpty(raw.source_type) ? raw.source_type.trim().toLowerCase() : "",
    location: nonEmpty(raw.location) ? raw.location.trim() : "",
    disposition: nonEmpty(raw.disposition) ? raw.disposition.trim().toLowerCase() : "",
    confidence: nonEmpty(raw.confidence) ? raw.confidence.trim().toLowerCase() : "",
    proof_boundary: nonEmpty(raw.proof_boundary) ? raw.proof_boundary.trim() : "",
    promotion_target: nonEmpty(promotion) ? String(promotion).trim() : undefined,
  };
}

export function parseYamlIntentElevationDocument(
  yamlText: string,
): { ok: true; value: NormalizedIntentElevation } | { ok: false; diagnostics: IntentElevationDiagnostic[] } {
  const diagnostics: IntentElevationDiagnostic[] = [];
  let parsed: unknown;
  try {
    parsed = yaml.load(yamlText);
  } catch (error) {
    diagnostics.push({
      code: "INVALID_YAML",
      message: error instanceof Error ? error.message : "Invalid YAML",
      path: "$",
    });
    return { ok: false, diagnostics };
  }

  if (!isRecord(parsed)) {
    diagnostics.push({
      code: "INVALID_YAML",
      message: "YAML root must be a mapping",
      path: "$",
    });
    return { ok: false, diagnostics };
  }

  if (parsed.schema_version !== ARTIFACT_SCHEMA_VERSION) {
    diagnostics.push({
      code: "WRONG_SCHEMA_VERSION",
      message: `Expected schema_version ${ARTIFACT_SCHEMA_VERSION}`,
      path: "schema_version",
    });
  }

  if (!nonEmpty(parsed.baseline_revision)) {
    diagnostics.push({
      code: "MISSING_FIELD",
      message: "baseline_revision is required",
      path: "baseline_revision",
    });
  }

  const scopeRaw = parsed.scope_tokens;
  const scope_tokens = Array.isArray(scopeRaw)
    ? scopeRaw.filter((entry): entry is string => nonEmpty(entry)).map((entry) => entry.trim())
    : [];

  const rowsRaw = parsed.rows;
  if (!Array.isArray(rowsRaw) || rowsRaw.length === 0) {
    diagnostics.push({
      code: "EMPTY_MATRIX",
      message: "rows must be a non-empty array",
      path: "rows",
    });
  }

  if (diagnostics.length > 0) {
    return { ok: false, diagnostics };
  }

  const rows = (rowsRaw as unknown[]).map((entry, index) =>
    isRecord(entry) ? rowFromMapping(entry, index) : rowFromMapping({}, index),
  );

  return {
    ok: true,
    value: {
      schema_version: ARTIFACT_SCHEMA_VERSION,
      baseline_revision: String(parsed.baseline_revision).trim(),
      scope_tokens,
      rows,
    },
  };
}

export function computeNormalizeHash(normalized: NormalizedIntentElevation): string {
  const canonical = {
    schema_version: normalized.schema_version,
    baseline_revision: normalized.baseline_revision,
    scope_tokens: [...normalized.scope_tokens].sort(),
    rows: normalized.rows.map((row) => ({
      row_id: row.row_id,
      claim: row.claim,
      source_type: row.source_type,
      location: row.location,
      disposition: row.disposition,
      confidence: row.confidence,
      proof_boundary: row.proof_boundary,
      promotion_target: row.promotion_target ?? "",
    })),
  };
  return createHash("sha256").update(stableJsonForHash(canonical)).digest("hex");
}

export function normalizedModelsEquivalent(
  left: NormalizedIntentElevation,
  right: NormalizedIntentElevation,
): boolean {
  return computeNormalizeHash(left) === computeNormalizeHash(right);
}

function validateRows(
  normalized: NormalizedIntentElevation,
  expectedBaseline?: string,
): IntentElevationDiagnostic[] {
  const diagnostics: IntentElevationDiagnostic[] = [];

  if (expectedBaseline && expectedBaseline.trim() !== normalized.baseline_revision.trim()) {
    diagnostics.push({
      code: "BASELINE_MISMATCH",
      message: `Expected baseline ${expectedBaseline}, matrix declares ${normalized.baseline_revision}`,
      path: "baseline_revision",
    });
  }

  for (const row of normalized.rows) {
    if (!nonEmpty(row.claim)) {
      diagnostics.push({
        code: "MISSING_FIELD",
        message: "claim is required",
        row_id: row.row_id,
        path: `rows.${row.row_id}.claim`,
      });
    }
    if (!DISPOSITIONS.has(row.disposition)) {
      diagnostics.push({
        code: "INVALID_ENUM",
        message: `Invalid disposition '${row.disposition}'`,
        row_id: row.row_id,
        path: `rows.${row.row_id}.disposition`,
      });
    }
    if (row.confidence && !CONFIDENCE.has(row.confidence)) {
      diagnostics.push({
        code: "INVALID_ENUM",
        message: `Invalid confidence '${row.confidence}'`,
        row_id: row.row_id,
        path: `rows.${row.row_id}.confidence`,
      });
    }
    if (row.source_type && !SOURCE_TYPES.has(row.source_type)) {
      diagnostics.push({
        code: "INVALID_ENUM",
        message: `Invalid source_type '${row.source_type}'`,
        row_id: row.row_id,
        path: `rows.${row.row_id}.source_type`,
      });
    }
    if (!nonEmpty(row.proof_boundary)) {
      diagnostics.push({
        code: "MISSING_FIELD",
        message: "proof_boundary is required for every row",
        row_id: row.row_id,
        path: `rows.${row.row_id}.proof_boundary`,
      });
    }
    const hasPromotion = nonEmpty(row.promotion_target);
    if (hasPromotion && row.disposition !== "approved") {
      diagnostics.push({
        code: "ILLEGAL_PROMOTION_TARGET",
        message: "promotion_target is allowed only when disposition is approved",
        row_id: row.row_id,
        path: `rows.${row.row_id}.promotion_target`,
      });
    }
    if (hasPromotion && !TIED_REF.test(row.promotion_target!.split(/[\s:+]/)[0] ?? "")) {
      diagnostics.push({
        code: "ILLEGAL_PROMOTION_TARGET",
        message: "promotion_target must reference a REQ/ARCH/IMPL token",
        row_id: row.row_id,
        path: `rows.${row.row_id}.promotion_target`,
      });
    }
  }

  return diagnostics;
}

export function validateNormalizedIntentElevation(
  normalized: NormalizedIntentElevation,
  options?: {
    expectedBaseline?: string;
    mode?: BrownfieldValidationMode;
  },
): IntentElevationValidationReport {
  const mode = options?.mode ?? "report_only";
  const diagnostics = validateRows(normalized, options?.expectedBaseline);
  const matrix_normalize_hash = computeNormalizeHash(normalized);
  const ok = diagnostics.length === 0;
  const blocking = mode === "strict" && !ok;

  return {
    schema_version: VALIDATOR_SCHEMA_VERSION,
    ok,
    blocking,
    mode,
    proof_boundary: VALIDATOR_PROOF_BOUNDARY,
    baseline_revision: normalized.baseline_revision,
    matrix_normalize_hash,
    diagnostics,
    normalized,
  };
}

export function brownfieldIntentEvidenceValidate(
  input: BrownfieldIntentEvidenceValidateInput,
): BrownfieldIntentEvidenceReceipt {
  const mode = input.mode ?? "report_only";
  const diagnostics: IntentElevationDiagnostic[] = [];

  if (!input.markdown_text && !input.yaml_text) {
    diagnostics.push({
      code: "PARSE_ERROR",
      message: "Provide markdown_text or yaml_text",
      path: "input",
    });
    return {
      schema_version: RECEIPT_SCHEMA_VERSION,
      validator_version: VALIDATOR_VERSION,
      ok: false,
      blocking: mode === "strict",
      mode,
      proof_boundary: VALIDATOR_PROOF_BOUNDARY,
      baseline_revision: input.baseline_revision ?? "",
      matrix_normalize_hash: "",
      diagnostics,
      evidence_refs: {
        scoped_analysis_evidence_id: input.scoped_analysis_evidence_id,
        claims_review_evidence_id: input.claims_review_evidence_id,
      },
    };
  }

  const parsed = input.yaml_text
    ? parseYamlIntentElevationDocument(input.yaml_text)
    : parseMarkdownIntentElevationMatrix(input.markdown_text ?? "");

  if (!parsed.ok) {
    return {
      schema_version: RECEIPT_SCHEMA_VERSION,
      validator_version: VALIDATOR_VERSION,
      ok: false,
      blocking: mode === "strict",
      mode,
      proof_boundary: VALIDATOR_PROOF_BOUNDARY,
      baseline_revision: input.baseline_revision ?? "",
      matrix_normalize_hash: "",
      diagnostics: parsed.diagnostics,
      evidence_refs: {
        scoped_analysis_evidence_id: input.scoped_analysis_evidence_id,
        claims_review_evidence_id: input.claims_review_evidence_id,
      },
    };
  }

  const report = validateNormalizedIntentElevation(parsed.value, {
    expectedBaseline: input.baseline_revision,
    mode,
  });

  return {
    ...report,
    schema_version: RECEIPT_SCHEMA_VERSION,
    validator_version: VALIDATOR_VERSION,
    evidence_refs: {
      scoped_analysis_evidence_id: input.scoped_analysis_evidence_id,
      claims_review_evidence_id: input.claims_review_evidence_id,
    },
  };
}

/** [PROC-BROWNFIELD_INTENT_ELEVATION] Checklist mode branching (documentation contract). */
export function brownfieldChecklistRequiresSubFlow(mode: BrownfieldValidationMode): boolean {
  return mode === "pilot" || mode === "strict";
}

export function brownfieldVerificationBlocking(mode: BrownfieldValidationMode, matrixOk: boolean): boolean {
  if (mode === "strict") {
    return !matrixOk;
  }
  return false;
}
