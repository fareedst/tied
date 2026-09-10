/**
 * [IMPL-REQUEST_EVIDENCE_ENVELOPE_BATCH] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE]
 * How: Collect pre-generated or legacy-inferred envelopes across batch rows and emit envelope-gap-report.v1.yaml with per-kind denominators and no score fields.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import yaml from "js-yaml";

import { buildRequestEvidenceEnvelope } from "./build.js";
import type { ArtifactKind, ArtifactStatus, RequestEvidenceEnvelope } from "./types.js";
import { validateRequestEvidenceEnvelope } from "./validate.js";

export const BATCH_INPUT_SCHEMA = "envelope-batch-inputs.v1" as const;
export const GAP_REPORT_SCHEMA = "envelope-gap-report.v1" as const;
export const BATCH_GENERATOR = "request_evidence_envelope_batch_collect" as const;
export const BATCH_GENERATOR_VERSION = "1.0.0";

export type EnvelopeRequireMode = "legacy_infer" | "require_envelope";
export type PrivacyTier = "shareable_hashed" | "operator_local";

const FORBIDDEN_SCORE_KEYS = new Set(["maturity", "score", "maturity_score", "universal_score", "ranking", "client_rank"]);
const DEFAULT_REQUIRE_MODE: EnvelopeRequireMode = "legacy_infer";

export type BatchInputRow = {
  project_root: string;
  request_token: string;
  client_alias?: string;
  envelope_require_mode?: EnvelopeRequireMode;
  envelope_artifact?: string;
  tied_base_path?: string;
};

export type BatchInputManifest = {
  schema_version: typeof BATCH_INPUT_SCHEMA;
  privacy_tier?: PrivacyTier;
  include_absolute_paths?: boolean;
  rows: BatchInputRow[];
};

export type KindCoverageCounts = {
  present: number;
  waived: number;
  not_applicable: number;
  missing: number;
};

export type EnvelopeGapReportRow = {
  client_alias: string;
  request_token: string;
  status: "included" | "excluded";
  envelope_require_mode: EnvelopeRequireMode;
  envelope_source: "envelope_file" | "legacy_inferred" | "missing";
  envelope_artifact?: string;
  envelope_revision?: number;
  gap_codes: string[];
  artifact_coverage: {
    by_kind: Record<string, KindCoverageCounts>;
    denominator_kinds: number;
  };
  exclusion_reason?: string;
};

export type EnvelopeGapReport = {
  schema_version: typeof GAP_REPORT_SCHEMA;
  generated_at: string;
  generator: typeof BATCH_GENERATOR;
  generator_version: string;
  privacy_tier: PrivacyTier;
  include_absolute_paths: boolean;
  rows: EnvelopeGapReportRow[];
  excluded_rows: Array<{ client_alias: string; request_token: string; reason: string }>;
  validation_errors: string[];
};

export type CollectEnvelopeGapReportInput = {
  manifestPath?: string;
  corpusPath?: string;
  rows?: BatchInputRow[];
  yamlOut: string;
  projectRoot?: string;
  defaultTiedBasePath: string;
  privacyTier?: PrivacyTier;
  includeAbsolutePaths?: boolean;
  now?: Date | string;
};

export type CollectEnvelopeGapReportResult =
  | { ok: true; report: EnvelopeGapReport; yaml_path: string; report_hash: string }
  | { ok: false; error: string; validation_errors: string[]; exit_code: 1 | 2 };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function containsForbiddenScoreKey(value: unknown): boolean {
  if (!isRecord(value) && !Array.isArray(value)) return false;
  if (Array.isArray(value)) return value.some(containsForbiddenScoreKey);
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_SCORE_KEYS.has(key)) return true;
    if (containsForbiddenScoreKey(nested)) return true;
  }
  return false;
}

function generatedAt(now?: Date | string): string {
  if (typeof now === "string" && now.trim()) return now;
  if (now instanceof Date) return now.toISOString();
  return new Date().toISOString();
}

function defaultEnvelopeArtifact(requestToken: string): string {
  return `working/${requestToken}/evidence/request-evidence-envelope.v1.json`;
}

function resolveRequireMode(value: unknown): EnvelopeRequireMode {
  if (value === "require_envelope" || value === "legacy_infer") return value;
  return DEFAULT_REQUIRE_MODE;
}

function artifactRef(artifactPath: string, includeAbsolute: boolean, projectRoot: string): string {
  if (includeAbsolute) return path.resolve(projectRoot, artifactPath);
  return artifactPath.split(path.sep).join("/");
}

function emptyCoverage(): KindCoverageCounts {
  return { present: 0, waived: 0, not_applicable: 0, missing: 0 };
}

function incrementCoverage(counts: KindCoverageCounts, status: ArtifactStatus): void {
  switch (status) {
    case "present":
    case "stale_projection":
      counts.present += 1;
      break;
    case "not_applicable":
      counts.not_applicable += 1;
      break;
    case "expected_missing":
      counts.missing += 1;
      break;
    default:
      counts.missing += 1;
  }
}

export function computeArtifactCoverage(envelope: RequestEvidenceEnvelope): Record<string, KindCoverageCounts> {
  const byKind: Record<string, KindCoverageCounts> = {};
  for (const artifact of envelope.artifacts) {
    if (artifact.kind === "not_applicable_receipt") {
      const slotKind = artifact.phase ?? "unspecified";
      const bucket = byKind[slotKind] ?? emptyCoverage();
      bucket.waived += 1;
      byKind[slotKind] = bucket;
      continue;
    }
    const bucket = byKind[artifact.kind] ?? emptyCoverage();
    incrementCoverage(bucket, artifact.status);
    byKind[artifact.kind] = bucket;
  }
  for (const gap of envelope.gaps) {
    if (gap.code !== "expected_artifact_missing" || !gap.artifact_kind) continue;
    const bucket = byKind[gap.artifact_kind] ?? emptyCoverage();
    bucket.missing += 1;
    byKind[gap.artifact_kind] = bucket;
  }
  return byKind;
}

export function extractGapCodes(envelope: RequestEvidenceEnvelope, extra: string[] = []): string[] {
  const codes = new Set<string>(extra);
  for (const gap of envelope.gaps) codes.add(gap.code);
  return [...codes].sort((left, right) => left.localeCompare(right));
}

function sortReportRows(rows: EnvelopeGapReportRow[]): EnvelopeGapReportRow[] {
  return [...rows].sort(
    (left, right) =>
      left.client_alias.localeCompare(right.client_alias) || left.request_token.localeCompare(right.request_token),
  );
}

export function loadBatchInputManifest(manifestPath: string): BatchInputManifest {
  if (!existsSync(manifestPath)) {
    throw new Error("InvalidManifest: batch input manifest is not a readable file");
  }
  let parsed: unknown;
  try {
    parsed = yaml.load(readFileSync(manifestPath, "utf8"));
  } catch (error) {
    throw new Error(`InvalidManifest: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!isRecord(parsed)) throw new Error("InvalidManifest: document must be a mapping");
  if (parsed.schema_version !== BATCH_INPUT_SCHEMA) {
    throw new Error(`InvalidManifest: schema_version must be ${BATCH_INPUT_SCHEMA}`);
  }
  if (!Array.isArray(parsed.rows)) throw new Error("InvalidManifest: rows must be an array");
  const rows: BatchInputRow[] = parsed.rows.map((row, index) => {
    if (!isRecord(row)) throw new Error(`InvalidManifest: rows[${index}] must be a mapping`);
    if (typeof row.project_root !== "string" || row.project_root.trim() === "") {
      throw new Error(`InvalidManifest: rows[${index}].project_root is required`);
    }
    if (typeof row.request_token !== "string" || !row.request_token.startsWith("REQ-")) {
      throw new Error(`InvalidManifest: rows[${index}].request_token must start with REQ-`);
    }
    return {
      project_root: row.project_root,
      request_token: row.request_token,
      client_alias: typeof row.client_alias === "string" ? row.client_alias : undefined,
      envelope_require_mode: resolveRequireMode(row.envelope_require_mode),
      envelope_artifact: typeof row.envelope_artifact === "string" ? row.envelope_artifact : undefined,
      tied_base_path: typeof row.tied_base_path === "string" ? row.tied_base_path : undefined,
    };
  });
  return {
    schema_version: BATCH_INPUT_SCHEMA,
    privacy_tier: parsed.privacy_tier === "operator_local" ? "operator_local" : "shareable_hashed",
    include_absolute_paths: parsed.include_absolute_paths === true,
    rows,
  };
}

export function loadRowsFromEvaluationCorpus(corpusPath: string, projectRoot: string): BatchInputRow[] {
  if (!existsSync(corpusPath)) {
    throw new Error("InvalidCorpus: evaluation corpus is not a readable file");
  }
  let parsed: unknown;
  try {
    parsed = yaml.load(readFileSync(corpusPath, "utf8"));
  } catch (error) {
    throw new Error(`InvalidCorpus: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!isRecord(parsed) || !Array.isArray(parsed.projects)) {
    throw new Error("InvalidCorpus: projects must be an array");
  }
  const rows: BatchInputRow[] = [];
  for (const [index, project] of parsed.projects.entries()) {
    if (!isRecord(project)) continue;
    const requestToken = typeof project.request_token === "string" ? project.request_token : undefined;
    if (!requestToken?.startsWith("REQ-")) continue;
    const notes = typeof project.notes === "string" ? project.notes : "";
    const clientAlias = typeof project.client_alias === "string" ? project.client_alias : `row-${index}`;
    const requireMode =
      project.envelope_require_mode === "require_envelope" || project.envelope_require_mode === "legacy_infer"
        ? (project.envelope_require_mode as EnvelopeRequireMode)
        : notes.includes("/dev/test/") || clientAlias.match(/^\d+$/)
          ? DEFAULT_REQUIRE_MODE
          : DEFAULT_REQUIRE_MODE;
    const rowProjectRoot =
      typeof project.project_root === "string" && project.project_root.trim()
        ? project.project_root
        : projectRoot;
    rows.push({
      project_root: rowProjectRoot,
      request_token: requestToken,
      client_alias: clientAlias,
      envelope_require_mode: requireMode,
      envelope_artifact:
        typeof project.envelope_artifact === "string"
          ? project.envelope_artifact
          : defaultEnvelopeArtifact(requestToken),
      tied_base_path:
        typeof project.tied_base_path === "string"
          ? project.tied_base_path
          : path.join(path.resolve(rowProjectRoot), "tied"),
    });
  }
  return rows;
}

async function resolveEnvelopeForRow(
  row: BatchInputRow,
  defaultTiedBasePath: string,
  generatedAtIso: string,
): Promise<
  | { ok: true; envelope: RequestEvidenceEnvelope; source: "envelope_file" | "legacy_inferred"; envelopePath: string }
  | { ok: false; reason: string; gapCodes: string[] }
> {
  const projectRoot = path.resolve(row.project_root);
  const tiedBasePath = row.tied_base_path ?? path.join(projectRoot, "tied");
  const envelopeRel = row.envelope_artifact ?? defaultEnvelopeArtifact(row.request_token);
  const envelopeAbs = path.isAbsolute(envelopeRel) ? envelopeRel : path.join(projectRoot, envelopeRel);
  const requireMode = row.envelope_require_mode ?? DEFAULT_REQUIRE_MODE;

  if (existsSync(envelopeAbs)) {
    const validation = await validateRequestEvidenceEnvelope({
      envelope_path: envelopeRel,
      project_root: projectRoot,
    });
    if (!validation.ok || !validation.envelope) {
      return {
        ok: false,
        reason: "envelope_schema_invalid",
        gapCodes: ["envelope_schema_invalid"],
      };
    }
    return { ok: true, envelope: validation.envelope, source: "envelope_file", envelopePath: envelopeRel };
  }

  if (requireMode === "require_envelope") {
    return { ok: false, reason: "envelope_missing", gapCodes: ["envelope_missing"] };
  }

  const build = await buildRequestEvidenceEnvelope({
    request_token: row.request_token,
    project_root: projectRoot,
    tied_base_path: tiedBasePath,
    confirmed_tied_base_path: row.tied_base_path ? tiedBasePath : defaultTiedBasePath,
    generated_at: generatedAtIso,
  });
  if (!build.ok) {
    return {
      ok: false,
      reason: build.error,
      gapCodes: ["envelope_missing", "legacy_inferred"],
    };
  }
  return {
    ok: true,
    envelope: build.envelope,
    source: "legacy_inferred",
    envelopePath: build.envelope_path ?? envelopeRel,
  };
}

export async function collectEnvelopeGapReport(
  input: CollectEnvelopeGapReportInput,
): Promise<CollectEnvelopeGapReportResult> {
  let manifestRows: BatchInputRow[] = [];
  let privacyTier: PrivacyTier = input.privacyTier ?? "shareable_hashed";
  let includeAbsolutePaths = input.includeAbsolutePaths ?? false;

  try {
    if (input.rows && input.rows.length > 0) {
      manifestRows = input.rows;
    } else if (input.manifestPath) {
      const manifest = loadBatchInputManifest(input.manifestPath);
      manifestRows = manifest.rows;
      privacyTier = input.privacyTier ?? manifest.privacy_tier ?? "shareable_hashed";
      includeAbsolutePaths = input.includeAbsolutePaths ?? manifest.include_absolute_paths ?? false;
    } else if (input.corpusPath) {
      const projectRoot = input.projectRoot ?? process.cwd();
      manifestRows = loadRowsFromEvaluationCorpus(input.corpusPath, projectRoot);
    } else {
      return { ok: false, error: "MissingInput", validation_errors: ["manifestPath, corpusPath, or rows required"], exit_code: 2 };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: "InvalidInput", validation_errors: [message], exit_code: 2 };
  }

  if (manifestRows.length === 0) {
    return { ok: false, error: "EmptyInput", validation_errors: ["no batch rows resolved"], exit_code: 2 };
  }

  const generatedAtIso = generatedAt(input.now);
  const includedRows: EnvelopeGapReportRow[] = [];
  const excludedRows: EnvelopeGapReportRow[] = [];
  const validationErrors: string[] = [];

  for (const row of manifestRows) {
    const clientAlias = row.client_alias ?? row.request_token;
    const requireMode = row.envelope_require_mode ?? DEFAULT_REQUIRE_MODE;
    const projectRoot = path.resolve(row.project_root);
    const resolved = await resolveEnvelopeForRow(row, input.defaultTiedBasePath, generatedAtIso);

    if (!resolved.ok) {
      if (requireMode === "require_envelope" && resolved.reason === "envelope_missing") {
        excludedRows.push({
          client_alias: clientAlias,
          request_token: row.request_token,
          status: "excluded",
          envelope_require_mode: requireMode,
          envelope_source: "missing",
          gap_codes: resolved.gapCodes,
          artifact_coverage: { by_kind: {}, denominator_kinds: 0 },
          exclusion_reason: "envelope_missing",
        });
        continue;
      }
      validationErrors.push(`${clientAlias}/${row.request_token}: ${resolved.reason}`);
      includedRows.push({
        client_alias: clientAlias,
        request_token: row.request_token,
        status: "included",
        envelope_require_mode: requireMode,
        envelope_source: "missing",
        gap_codes: resolved.gapCodes,
        artifact_coverage: { by_kind: {}, denominator_kinds: 0 },
      });
      continue;
    }

    const extraGapCodes = resolved.source === "legacy_inferred" ? ["legacy_inferred"] : [];
    const gapCodes = extractGapCodes(resolved.envelope, extraGapCodes);
    const byKind = computeArtifactCoverage(resolved.envelope);
    includedRows.push({
      client_alias: clientAlias,
      request_token: row.request_token,
      status: "included",
      envelope_require_mode: requireMode,
      envelope_source: resolved.source,
      envelope_artifact: artifactRef(resolved.envelopePath, includeAbsolutePaths, projectRoot),
      envelope_revision: resolved.envelope.envelope_meta.revision,
      gap_codes: gapCodes,
      artifact_coverage: {
        by_kind: byKind,
        denominator_kinds: Object.keys(byKind).length,
      },
    });
  }

  const report: EnvelopeGapReport = {
    schema_version: GAP_REPORT_SCHEMA,
    generated_at: generatedAtIso,
    generator: BATCH_GENERATOR,
    generator_version: BATCH_GENERATOR_VERSION,
    privacy_tier: privacyTier,
    include_absolute_paths: includeAbsolutePaths,
    rows: sortReportRows(includedRows),
    excluded_rows: excludedRows.map((row) => ({
      client_alias: row.client_alias,
      request_token: row.request_token,
      reason: row.exclusion_reason ?? "excluded",
    })),
    validation_errors: validationErrors,
  };

  if (containsForbiddenScoreKey(report)) {
    return {
      ok: false,
      error: "ForbiddenScoreField",
      validation_errors: ["report must not contain maturity, score, or ranking fields"],
      exit_code: 1,
    };
  }

  const yamlBody = yaml.dump(report, { lineWidth: 120, noRefs: true, sortKeys: false });
  const yamlPath = path.resolve(input.yamlOut);
  mkdirSync(path.dirname(yamlPath), { recursive: true });
  writeFileSync(yamlPath, yamlBody, "utf8");
  const reportHash = createHash("sha256").update(yamlBody).digest("hex").slice(0, 16);
  console.debug("DEBUG: [IMPL-REQUEST_EVIDENCE_ENVELOPE_BATCH] wrote envelope gap report", {
    row_count: report.rows.length,
    excluded_count: report.excluded_rows.length,
    yaml_path: yamlPath,
    report_hash: reportHash,
  });
  return { ok: true, report, yaml_path: yamlPath, report_hash: reportHash };
}
