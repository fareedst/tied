/**
 * [IMPL-EVIDENCE_CHAIN_REPORT] [ARCH-EVIDENCE_CHAIN_REPORT] [REQ-EVIDENCE_CHAIN_REPORT]
 * How: Compose manifest load, artifact validation, cohort partition, count-only aggregation, and deterministic YAML/Markdown emit without generating profiles or traversing client roots.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import yaml from "js-yaml";

import {
  hashScope,
  isForbiddenIntentPath,
  normalizeEvidenceChainProfile,
  type EvidenceChainProfile,
  type MeasurementStatus,
  type ProofBoundary,
} from "./evidence-chain-profile.js";

export const REPORT_INPUT_SCHEMA = "evidence-chain-report-inputs.v1" as const;
export const EVIDENCE_CHAIN_REPORT_SCHEMA = "evidence-chain-statistics-report.v1" as const;
export const EVIDENCE_CHAIN_REPORT_SCHEMA_V2 = "evidence-chain-statistics-report.v2" as const;
export const REPORT_GENERATOR_VERSION = "1.0.0";
export const REPORT_GENERATOR_VERSION_V2 = "2.0.0";

export type ReportVersion = "v1" | "v2";

const FORBIDDEN_SCORE_KEYS = new Set(["maturity", "score", "maturity_score", "universal_score"]);
const MEASUREMENT_STATUSES: MeasurementStatus[] = ["observed", "not_measured", "unknown", "not_applicable"];
const PROOF_BOUNDARIES: ProofBoundary[] = [
  "traceability_structure",
  "pseudo_code_structure",
  "semantic_fidelity",
  "executable_behavior",
  "human_decision",
];
const REQUIRED_DERIVED_PATHS = [
  "evidence_chain.graph",
  "evidence_chain.vocab_resolution",
  "quality.command_results",
  "quality.freshness",
  "change_fidelity",
] as const;

export type ReportMode = "strict" | "partial";

export type NamedStatistic = {
  name: string;
  numerator: number;
  denominator: number | string;
  status: MeasurementStatus;
  source: string;
  method: string;
  proof_boundary: ProofBoundary;
  field_path?: string;
  counted_status?: MeasurementStatus;
  partition?: ProofBoundary;
};

export type ReportInputRow = {
  project_id: string;
  client_alias?: string;
  commit: string;
  profile_depth: EvidenceChainProfile["scope"]["profile_depth"];
  artifact_ref: string;
  profile_hash: string;
  compatibility_key: string;
  generator: EvidenceChainProfile["identity"]["generator"];
  generator_version: string;
  denominator_fingerprint?: string;
};

export type ReportCohort = {
  compatibility_key: string;
  clients: ReportInputRow[];
  statistics: NamedStatistic[];
};

export type ReportSubCohort = {
  denominator_fingerprint: string;
  clients: ReportInputRow[];
  statistics: NamedStatistic[];
};

export type ReportCohortV2 = {
  compatibility_key: string;
  sub_cohorts: ReportSubCohort[];
};

export type ExcludedInput = {
  artifact_ref: string;
  reason: string;
  error: string;
};

export type EvidenceChainStatisticsReportV1 = {
  schema_version: typeof EVIDENCE_CHAIN_REPORT_SCHEMA;
  generated_at: string;
  generator_version: string;
  mode: ReportMode;
  include_absolute_paths: boolean;
  inputs: ReportInputRow[];
  cohorts: ReportCohort[];
  excluded_inputs: ExcludedInput[];
  validation_errors: Array<{ artifact_ref: string; error: string; message: string }>;
  residual_risks: string[];
  statistics: NamedStatistic[];
};

export type EvidenceChainStatisticsReportV2 = {
  schema_version: typeof EVIDENCE_CHAIN_REPORT_SCHEMA_V2;
  generated_at: string;
  generator_version: string;
  mode: ReportMode;
  include_absolute_paths: boolean;
  inputs: Array<ReportInputRow & { denominator_fingerprint: string }>;
  cohorts: ReportCohortV2[];
  excluded_inputs: ExcludedInput[];
  validation_errors: Array<{ artifact_ref: string; error: string; message: string }>;
  residual_risks: string[];
  statistics: NamedStatistic[];
};

export type EvidenceChainStatisticsReport = EvidenceChainStatisticsReportV1 | EvidenceChainStatisticsReportV2;

export type ReportManifestInput = {
  profile_path: string;
  client_alias?: string;
  notes?: string;
};

export type ReportInputManifest = {
  schema_version: typeof REPORT_INPUT_SCHEMA;
  mode: ReportMode;
  include_absolute_paths: boolean;
  inputs: ReportManifestInput[];
};

export type GenerateReportInput = {
  inputsPath: string;
  yamlOut: string;
  markdownOut: string;
  modeOverride?: ReportMode;
  reportVersion?: ReportVersion;
  now?: Date | string;
  cwd?: string;
  projectRoot?: string;
};

export type GenerateReportResult =
  | { ok: true; report: EvidenceChainStatisticsReport; exit_code: 0 }
  | {
      ok: false;
      stage: string;
      error: string;
      excluded_inputs: ExcludedInput[];
      validation_errors: EvidenceChainStatisticsReport["validation_errors"];
      exit_code: 1 | 2;
    };

type AcceptedRecord = {
  profile: EvidenceChainProfile;
  row: ReportInputRow;
  duplicate_key: string;
  residual_risks: string[];
};

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

function compareText(left: string, right: string): number {
  return left.localeCompare(right);
}

function sortInputRows(rows: ReportInputRow[]): ReportInputRow[] {
  return [...rows].sort((left, right) => {
    return (
      compareText(left.project_id, right.project_id) ||
      compareText(left.commit, right.commit) ||
      compareText(left.profile_depth, right.profile_depth) ||
      compareText(left.artifact_ref, right.artifact_ref)
    );
  });
}

function artifactRef(profilePath: string, includeAbsolute: boolean): string {
  return includeAbsolute ? path.resolve(profilePath) : path.basename(profilePath);
}

function parseMode(value: unknown, fallback: ReportMode): ReportMode {
  if (value === "partial" || value === "strict") return value;
  if (value === undefined || value === null || value === "") return fallback;
  throw new Error("InvalidManifest: mode must be strict or partial");
}

function generatedAt(now?: Date | string): string {
  if (typeof now === "string" && now.trim()) return now;
  if (now instanceof Date) return now.toISOString();
  return new Date().toISOString();
}

function hashBytes(contents: string): string {
  return crypto.createHash("sha256").update(contents).digest("hex").slice(0, 16);
}

function derivedStatus(field: { status?: MeasurementStatus } | undefined): MeasurementStatus {
  if (!field) return "unknown";
  if (field.status && MEASUREMENT_STATUSES.includes(field.status)) return field.status;
  return "unknown";
}

function countStatistic(
  name: string,
  numerator: number,
  denominator: number,
  extras: Partial<NamedStatistic> = {},
): NamedStatistic {
  return {
    name,
    numerator,
    denominator,
    status: "observed",
    source: extras.source ?? "accepted_inputs",
    method: extras.method ?? "count",
    proof_boundary: extras.proof_boundary ?? "traceability_structure",
    ...extras,
  };
}

export function loadReportInputManifest(
  manifestPath: string,
  modeOverride?: ReportMode,
): ReportInputManifest {
  // [IMPL-EVIDENCE_CHAIN_REPORT] [ARCH-EVIDENCE_CHAIN_REPORT] [REQ-EVIDENCE_CHAIN_REPORT]
  // How: Parse evidence-chain-report-inputs.v1 and let CLI --mode override the manifest mode.
  if (!fs.existsSync(manifestPath) || !fs.statSync(manifestPath).isFile()) {
    throw new Error("InvalidManifest: report input manifest is not a readable file");
  }
  let parsed: unknown;
  try {
    parsed = yaml.load(fs.readFileSync(manifestPath, "utf8"));
  } catch (error) {
    throw new Error(`InvalidManifest: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!isRecord(parsed)) {
    throw new Error("InvalidManifest: document must be a mapping");
  }
  if (parsed.schema_version !== REPORT_INPUT_SCHEMA) {
    throw new Error("InvalidManifest: schema_version must be evidence-chain-report-inputs.v1");
  }
  if (!Array.isArray(parsed.inputs)) {
    throw new Error("InvalidManifest: inputs must be an array");
  }
  const inputs: ReportManifestInput[] = parsed.inputs.map((row, index) => {
    if (!isRecord(row) || typeof row.profile_path !== "string" || row.profile_path.trim() === "") {
      throw new Error(`InvalidManifest: inputs[${index}].profile_path is required`);
    }
    return {
      profile_path: row.profile_path,
      client_alias: typeof row.client_alias === "string" ? row.client_alias : undefined,
      notes: typeof row.notes === "string" ? row.notes : undefined,
    };
  });
  const mode = modeOverride ?? parseMode(parsed.mode, "strict");
  const includeAbsolute = parsed.include_absolute_paths === true;
  console.debug("DEBUG: [IMPL-EVIDENCE_CHAIN_REPORT] loaded report input manifest", {
    mode,
    include_absolute_paths: includeAbsolute,
    input_count: inputs.length,
    cli_mode_override: Boolean(modeOverride),
  });
  return {
    schema_version: REPORT_INPUT_SCHEMA,
    mode,
    include_absolute_paths: includeAbsolute,
    inputs,
  };
}

export function validateProfileArtifact(profilePath: string):
  | { ok: true; profile: EvidenceChainProfile; bytes: string }
  | { ok: false; error: "MissingArtifact" | "MalformedProfile" | "ForbiddenField"; message: string } {
  // [IMPL-EVIDENCE_CHAIN_REPORT] [ARCH-EVIDENCE_CHAIN_REPORT] [REQ-EVIDENCE_CHAIN_REPORT]
  // How: Read one JSON artifact and reuse NORMALIZE_EVIDENCE_CHAIN_PROFILE without calling the generator.
  if (!fs.existsSync(profilePath) || !fs.statSync(profilePath).isFile()) {
    return { ok: false, error: "MissingArtifact", message: `profile artifact is absent: ${path.basename(profilePath)}` };
  }
  const bytes = fs.readFileSync(profilePath, "utf8");
  let draft: unknown;
  try {
    draft = JSON.parse(bytes);
  } catch (error) {
    return {
      ok: false,
      error: "MalformedProfile",
      message: `JSON parse failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
  if (containsForbiddenScoreKey(draft)) {
    return { ok: false, error: "ForbiddenField", message: "maturity and score fields are forbidden" };
  }
  try {
    const profile = normalizeEvidenceChainProfile(draft);
    if (!profile.identity.project_id.trim() || !profile.identity.commit.trim() || !profile.scope.profile_depth) {
      return { ok: false, error: "MalformedProfile", message: "identity.project_id, identity.commit, and scope.profile_depth are required" };
    }
    return { ok: true, profile, bytes };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("maturity") || message.includes("score")) {
      return { ok: false, error: "ForbiddenField", message };
    }
    return { ok: false, error: "MalformedProfile", message };
  }
}

function resolveScopeHash(profile: EvidenceChainProfile): string {
  if (profile.operational.scope_hash && profile.operational.scope_hash.trim()) {
    return profile.operational.scope_hash;
  }
  return hashScope(profile.scope);
}

export function resolveInputIdentity(
  profile: EvidenceChainProfile,
  input: ReportManifestInput,
  profilePath: string,
  includeAbsolute: boolean,
  acceptedKeys: Set<string>,
  bytes: string,
): { ok: true; record: AcceptedRecord } | { ok: false; error: "DuplicateInput"; message: string } {
  // [IMPL-EVIDENCE_CHAIN_REPORT] [ARCH-EVIDENCE_CHAIN_REPORT] [REQ-EVIDENCE_CHAIN_REPORT]
  // How: Bind hashed project_id as stable identity and keep client_alias off the duplicate key.
  const scopeHash = resolveScopeHash(profile);
  const duplicateKey = [
    profile.identity.project_id,
    profile.identity.commit,
    profile.scope.profile_depth,
    scopeHash,
  ].join("|");
  if (acceptedKeys.has(duplicateKey)) {
    return { ok: false, error: "DuplicateInput", message: "duplicate (project_id, commit, profile_depth, scope_hash)" };
  }
  acceptedKeys.add(duplicateKey);
  const compatibilityKey = `${profile.identity.schema_version}|${profile.scope.profile_depth}`;
  const residual: string[] = [];
  if (Array.isArray(profile.assumptions)) {
    residual.push(...profile.assumptions);
  }
  const extra = (profile as EvidenceChainProfile & { residual_risks?: unknown }).residual_risks;
  if (Array.isArray(extra)) {
    residual.push(...extra.filter((row): row is string => typeof row === "string"));
  }
  return {
    ok: true,
    record: {
      profile,
      duplicate_key: duplicateKey,
      residual_risks: residual,
      row: {
        project_id: profile.identity.project_id,
        client_alias: input.client_alias,
        commit: profile.identity.commit,
        profile_depth: profile.scope.profile_depth,
        artifact_ref: artifactRef(profilePath, includeAbsolute),
        profile_hash: hashBytes(bytes),
        compatibility_key: compatibilityKey,
        generator: profile.identity.generator,
        generator_version: profile.identity.generator_version,
      },
    },
  };
}

export function partitionClientCohorts(accepted: AcceptedRecord[]): Map<string, AcceptedRecord[]> {
  // [IMPL-EVIDENCE_CHAIN_REPORT] [ARCH-EVIDENCE_CHAIN_REPORT] [REQ-EVIDENCE_CHAIN_REPORT]
  // How: Separate incompatible schema_version and profile_depth groups; never merge them.
  const groups = new Map<string, AcceptedRecord[]>();
  for (const record of accepted) {
    const key = record.row.compatibility_key;
    const list = groups.get(key) ?? [];
    list.push(record);
    groups.set(key, list);
  }
  for (const [key, list] of groups) {
    groups.set(
      key,
      [...list].sort((left, right) => {
        return (
          compareText(left.row.project_id, right.row.project_id) ||
          compareText(left.row.commit, right.row.commit) ||
          compareText(left.row.profile_depth, right.row.profile_depth) ||
          compareText(left.row.artifact_ref, right.row.artifact_ref)
        );
      }),
    );
  }
  return groups;
}

function fieldAt(profile: EvidenceChainProfile, fieldPath: (typeof REQUIRED_DERIVED_PATHS)[number]) {
  switch (fieldPath) {
    case "evidence_chain.graph":
      return profile.evidence_chain.graph;
    case "evidence_chain.vocab_resolution":
      return profile.evidence_chain.vocab_resolution;
    case "quality.command_results":
      return profile.quality.command_results;
    case "quality.freshness":
      return profile.quality.freshness;
    case "change_fidelity":
      return profile.change_fidelity;
    default:
      return undefined;
  }
}

export function computeDenominatorFingerprint(profile: EvidenceChainProfile): string {
  // [IMPL-EVIDENCE_CHAIN_REPORT] [ARCH-EVIDENCE_CHAIN_REPORT] [REQ-EVIDENCE_CHAIN_REPORT]
  // How: Stable hash of required derived-path denominators plus structural denominators.
  const lines: string[] = [];
  for (const fieldPath of REQUIRED_DERIVED_PATHS) {
    const field = fieldAt(profile, fieldPath);
    lines.push(`${fieldPath}=${String(field?.denominator ?? "missing")}`);
  }
  const structuralLines = profile.evidence_chain.structural.map(
    (row, index) => `evidence_chain.structural[${index}]=${String(row.denominator)}`,
  );
  lines.push(...structuralLines.sort(compareText));
  const digest = crypto.createHash("sha256").update(lines.join("\n"), "utf8").digest("hex");
  return digest.slice(0, 16);
}

export function partitionSubCohorts(members: AcceptedRecord[]): Map<string, AcceptedRecord[]> {
  // [IMPL-EVIDENCE_CHAIN_REPORT] [ARCH-EVIDENCE_CHAIN_REPORT] [REQ-EVIDENCE_CHAIN_REPORT]
  // How: Split one compatibility_key cohort when denominator fingerprints differ.
  const groups = new Map<string, AcceptedRecord[]>();
  for (const record of members) {
    const fingerprint = computeDenominatorFingerprint(record.profile);
    const list = groups.get(fingerprint) ?? [];
    list.push(record);
    groups.set(fingerprint, list);
  }
  for (const [fingerprint, list] of groups) {
    groups.set(
      fingerprint,
      [...list].sort((left, right) => {
        return (
          compareText(left.row.project_id, right.row.project_id) ||
          compareText(left.row.commit, right.row.commit) ||
          compareText(left.row.profile_depth, right.row.profile_depth) ||
          compareText(left.row.artifact_ref, right.row.artifact_ref)
        );
      }),
    );
  }
  return groups;
}

function aggregateSubCohortStatistics(members: AcceptedRecord[], subCohortCount: number): NamedStatistic[] {
  const stats = aggregateCohortStatistics(members);
  stats.unshift(
    countStatistic("denominator_subcohort_count", subCohortCount, subCohortCount, {
      source: "PARTITION_SUBCOHORTS",
      method: "count",
      proof_boundary: "traceability_structure",
    }),
  );
  return stats;
}

function denominatorMismatchRisks(members: AcceptedRecord[]): string[] {
  const risks: string[] = [];
  const fields = REQUIRED_DERIVED_PATHS.flatMap((fieldPath) =>
    members.map((member) => ({ fieldPath, field: fieldAt(member.profile, fieldPath) })),
  );
  const fieldPaths = [...new Set(fields.map(({ fieldPath }) => fieldPath))];
  for (const fieldPath of fieldPaths) {
    const denominators = new Set(
      members
        .map((member) => fieldAt(member.profile, fieldPath)?.denominator)
        .filter((denominator): denominator is number | string => denominator !== undefined)
        .map((denominator) => String(denominator)),
    );
    if (denominators.size > 1) {
      risks.push(
        `profiles in cohort ${members[0]?.row.compatibility_key ?? "unknown"} use incompatible denominators for ${fieldPath}: ${[
          ...denominators,
        ].sort(compareText).join(", ")}`,
      );
    }
  }
  const structuralDenominators = new Set(
    members.flatMap((member) =>
      member.profile.evidence_chain.structural.map((field) => String(field.denominator)),
    ),
  );
  if (structuralDenominators.size > 1) {
    risks.push(
      `profiles in cohort ${members[0]?.row.compatibility_key ?? "unknown"} use incompatible denominators for evidence_chain.structural: ${[
        ...structuralDenominators,
      ].sort(compareText).join(", ")}`,
    );
  }
  return risks;
}

export function aggregateCohortStatistics(members: AcceptedRecord[]): NamedStatistic[] {
  // [IMPL-EVIDENCE_CHAIN_REPORT] [ARCH-EVIDENCE_CHAIN_REPORT] [REQ-EVIDENCE_CHAIN_REPORT]
  // How: Emit only named count statistics; do not sum or average derived-field value numbers in v1.
  const profileCount = members.length;
  const uniqueProjects = new Set(members.map((member) => member.row.project_id)).size;
  const stats: NamedStatistic[] = [
    countStatistic("cohort_profile_count", profileCount, profileCount, {
      source: "accepted_inputs",
      method: "count",
      proof_boundary: "traceability_structure",
    }),
    countStatistic("unique_project_id_count", uniqueProjects, profileCount, {
      source: "identity.project_id",
      method: "distinct_count",
      proof_boundary: "traceability_structure",
    }),
  ];

  for (const fieldPath of REQUIRED_DERIVED_PATHS) {
    const counts: Record<MeasurementStatus, number> = {
      observed: 0,
      not_measured: 0,
      unknown: 0,
      not_applicable: 0,
    };
    for (const member of members) {
      counts[derivedStatus(fieldAt(member.profile, fieldPath))] += 1;
    }
    for (const status of MEASUREMENT_STATUSES) {
      stats.push(
        countStatistic("measurement_status_count", counts[status], profileCount, {
          source: fieldPath,
          method: "status_count",
          proof_boundary: fieldAt(members[0]?.profile, fieldPath)?.proof_boundary ?? "traceability_structure",
          field_path: fieldPath,
          counted_status: status,
        }),
      );
    }
  }

  const structuralCounts: Record<MeasurementStatus, number> = {
    observed: 0,
    not_measured: 0,
    unknown: 0,
    not_applicable: 0,
  };
  let structuralTotal = 0;
  for (const member of members) {
    for (const row of member.profile.evidence_chain.structural) {
      structuralTotal += 1;
      structuralCounts[derivedStatus(row)] += 1;
    }
  }
  for (const status of MEASUREMENT_STATUSES) {
    stats.push(
      countStatistic("measurement_status_count", structuralCounts[status], structuralTotal || profileCount, {
        source: "evidence_chain.structural",
        method: "status_count",
        proof_boundary: "traceability_structure",
        field_path: "evidence_chain.structural",
        counted_status: status,
      }),
    );
  }

  const partitionCounts: Record<ProofBoundary, number> = {
    traceability_structure: 0,
    pseudo_code_structure: 0,
    semantic_fidelity: 0,
    executable_behavior: 0,
    human_decision: 0,
  };
  let partitionTotal = 0;
  for (const member of members) {
    const partition = member.profile.quality.proof_boundary_partition;
    for (const boundary of PROOF_BOUNDARIES) {
      const count = (partition[boundary] ?? []).length;
      partitionCounts[boundary] += count;
      partitionTotal += count;
    }
  }
  for (const boundary of PROOF_BOUNDARIES) {
    stats.push(
      countStatistic("proof_boundary_partition_count", partitionCounts[boundary], partitionTotal || profileCount, {
        source: "quality.proof_boundary_partition",
        method: "membership_count",
        proof_boundary: "traceability_structure",
        partition: boundary,
      }),
    );
  }

  console.debug("DEBUG: [IMPL-EVIDENCE_CHAIN_REPORT] aggregated client cohort counts", {
    compatibility_key: members[0]?.row.compatibility_key,
    profile_count: profileCount,
    unique_project_id_count: uniqueProjects,
  });
  return stats;
}

function assertNoForbiddenReportKeys(report: EvidenceChainStatisticsReport): void {
  if (containsForbiddenScoreKey(report)) {
    throw new Error("ForbiddenField: report must not contain maturity or score keys");
  }
}

function isV2Report(report: EvidenceChainStatisticsReport): report is EvidenceChainStatisticsReportV2 {
  return report.schema_version === EVIDENCE_CHAIN_REPORT_SCHEMA_V2;
}

export function renderStatisticsReportYaml(report: EvidenceChainStatisticsReport): string {
  // [IMPL-EVIDENCE_CHAIN_REPORT] [ARCH-EVIDENCE_CHAIN_REPORT] [REQ-EVIDENCE_CHAIN_REPORT]
  // How: Write the authoritative evidence-chain-statistics-report.v1 document with stable key order.
  assertNoForbiddenReportKeys(report);
  return yaml.dump(report, { sortKeys: true, lineWidth: -1, noRefs: true });
}

export function renderStatisticsReportMarkdown(report: EvidenceChainStatisticsReport): string {
  // [IMPL-EVIDENCE_CHAIN_REPORT] [ARCH-EVIDENCE_CHAIN_REPORT] [REQ-EVIDENCE_CHAIN_REPORT]
  // How: Project the same YAML values into a deterministic Markdown document with no extra statistics.
  const lines: string[] = [
    "# Evidence chain statistics report",
    "",
    `generated_at: ${report.generated_at}`,
    `mode: ${report.mode}`,
    `include_absolute_paths: ${report.include_absolute_paths}`,
    `generator_version: ${report.generator_version}`,
    `schema_version: ${report.schema_version}`,
    "",
    "## Counts",
    "",
    `- inputs: ${report.inputs.length}`,
    `- cohorts: ${report.cohorts.length}`,
  ];
  for (const stat of report.statistics) {
    lines.push(
      `- ${stat.name}: ${stat.numerator}/${stat.denominator} ${stat.status} source=${stat.source} method=${stat.method} proof_boundary=${stat.proof_boundary}`,
    );
  }
  lines.push("", "## Cohorts", "");
  if (isV2Report(report)) {
    for (const cohort of report.cohorts) {
      lines.push(`### ${cohort.compatibility_key}`, "");
      for (const sub of cohort.sub_cohorts) {
        lines.push(`#### Sub-cohort ${sub.denominator_fingerprint}`, "");
        lines.push("##### Statistics", "");
        for (const stat of sub.statistics) {
          const extras = [
            stat.field_path ? `field_path=${stat.field_path}` : "",
            stat.counted_status ? `counted_status=${stat.counted_status}` : "",
            stat.partition ? `partition=${stat.partition}` : "",
          ]
            .filter(Boolean)
            .join(" ");
          lines.push(
            `- ${stat.name}: ${stat.numerator}/${stat.denominator} ${stat.status} source=${stat.source} method=${stat.method} proof_boundary=${stat.proof_boundary}${extras ? ` ${extras}` : ""}`,
          );
        }
        lines.push("");
      }
    }
  } else {
    for (const cohort of report.cohorts) {
      lines.push(`### ${cohort.compatibility_key}`, "");
      lines.push("#### Statistics", "");
      for (const stat of cohort.statistics) {
        const extras = [
          stat.field_path ? `field_path=${stat.field_path}` : "",
          stat.counted_status ? `counted_status=${stat.counted_status}` : "",
          stat.partition ? `partition=${stat.partition}` : "",
        ]
          .filter(Boolean)
          .join(" ");
        lines.push(
          `- ${stat.name}: ${stat.numerator}/${stat.denominator} ${stat.status} source=${stat.source} method=${stat.method} proof_boundary=${stat.proof_boundary}${extras ? ` ${extras}` : ""}`,
        );
      }
      lines.push("", "#### Proof-boundary summary", "");
      for (const stat of cohort.statistics.filter((row) => row.name === "proof_boundary_partition_count")) {
        lines.push(`- ${stat.partition}: ${stat.numerator}/${stat.denominator} ${stat.status}`);
      }
      lines.push("");
    }
  }
  lines.push("## Excluded inputs", "");
  if (report.excluded_inputs.length === 0) {
    lines.push("- none");
  } else {
    for (const row of report.excluded_inputs) {
      lines.push(`- ${row.artifact_ref}: ${row.error} (${row.reason})`);
    }
  }
  lines.push("", "## Validation errors", "");
  if (report.validation_errors.length === 0) {
    lines.push("- none");
  } else {
    for (const row of report.validation_errors) {
      lines.push(`- ${row.artifact_ref}: ${row.error} (${row.message})`);
    }
  }
  lines.push("", "## Residual risks", "");
  if (report.residual_risks.length === 0) {
    lines.push("- none");
  } else {
    for (const risk of report.residual_risks) {
      lines.push(`- ${risk}`);
    }
  }
  lines.push("", "## Provenance", "");
  for (const row of report.inputs) {
    const fingerprint = "denominator_fingerprint" in row && row.denominator_fingerprint
      ? ` denominator_fingerprint=${row.denominator_fingerprint}`
      : "";
    lines.push(
      `- project_id=${row.project_id} commit=${row.commit} profile_depth=${row.profile_depth} artifact_ref=${row.artifact_ref} profile_hash=${row.profile_hash}${fingerprint}`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

function fail(
  stage: string,
  error: string,
  excluded: ExcludedInput[],
  validationErrors: EvidenceChainStatisticsReport["validation_errors"],
  exitCode: 1 | 2,
): GenerateReportResult {
  console.debug("DEBUG: [IMPL-EVIDENCE_CHAIN_REPORT] generation failed", { stage, error, exit_code: exitCode });
  return {
    ok: false,
    stage,
    error,
    excluded_inputs: excluded,
    validation_errors: validationErrors,
    exit_code: exitCode,
  };
}

export function generateEvidenceChainStatisticsReport(input: GenerateReportInput): GenerateReportResult {
  // [IMPL-EVIDENCE_CHAIN_REPORT] [ARCH-EVIDENCE_CHAIN_REPORT] [REQ-EVIDENCE_CHAIN_REPORT]
  // How: Never call GENERATE_EVIDENCE_CHAIN_PROFILE, RUN_FIRST_SLICE, appendCandidateFinding, promoteConfirmedCase, or walk a client project_root.
  const projectRoot = input.projectRoot ?? process.cwd();
  const yamlOut = path.resolve(input.cwd ?? process.cwd(), input.yamlOut);
  const markdownOut = path.resolve(input.cwd ?? process.cwd(), input.markdownOut);
  if (isForbiddenIntentPath(yamlOut, projectRoot) || isForbiddenIntentPath(markdownOut, projectRoot)) {
    return fail("RENDER_STATISTICS_REPORT_YAML", "ForbiddenOutputPath", [], [], 1);
  }
  for (const outputPath of [yamlOut, markdownOut]) {
    if (fs.existsSync(outputPath) && fs.statSync(outputPath).isFile()) {
      fs.rmSync(outputPath);
    }
  }

  let manifest: ReportInputManifest;
  try {
    manifest = loadReportInputManifest(input.inputsPath, input.modeOverride);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const code = message.startsWith("InvalidManifest") ? "InvalidManifest" : "InvalidManifest";
    return fail("LOAD_REPORT_INPUT_MANIFEST", code, [], [{ artifact_ref: path.basename(input.inputsPath), error: code, message }], 1);
  }

  const cwd = input.cwd ?? path.dirname(path.resolve(input.inputsPath));
  const orderedInputs = manifest.inputs
    .map((row, index) => ({ row, index }))
    .sort((left, right) => compareText(left.row.profile_path, right.row.profile_path) || left.index - right.index);

  const accepted: AcceptedRecord[] = [];
  const acceptedKeys = new Set<string>();
  const excluded: ExcludedInput[] = [];
  const validationErrors: EvidenceChainStatisticsReport["validation_errors"] = [];

  for (const { row } of orderedInputs) {
    const profilePath = path.isAbsolute(row.profile_path) ? row.profile_path : path.resolve(cwd, row.profile_path);
    const validated = validateProfileArtifact(profilePath);
    if (!validated.ok) {
      const ref = artifactRef(profilePath, manifest.include_absolute_paths);
      excluded.push({ artifact_ref: ref, reason: validated.message, error: validated.error });
      validationErrors.push({ artifact_ref: ref, error: validated.error, message: validated.message });
      if (manifest.mode === "strict") {
        return fail("VALIDATE_PROFILE_ARTIFACT", validated.error, excluded, validationErrors, 2);
      }
      continue;
    }
    const identity = resolveInputIdentity(
      validated.profile,
      row,
      profilePath,
      manifest.include_absolute_paths,
      acceptedKeys,
      validated.bytes,
    );
    if (!identity.ok) {
      const ref = artifactRef(profilePath, manifest.include_absolute_paths);
      excluded.push({ artifact_ref: ref, reason: identity.message, error: identity.error });
      validationErrors.push({ artifact_ref: ref, error: identity.error, message: identity.message });
      if (manifest.mode === "strict") {
        return fail("RESOLVE_INPUT_IDENTITY", identity.error, excluded, validationErrors, 2);
      }
      continue;
    }
    accepted.push(identity.record);
  }

  if (accepted.length === 0) {
    return fail(
      "GENERATE_EVIDENCE_CHAIN_REPORT",
      manifest.mode === "partial" ? "EmptyPartialCohort" : (validationErrors[0]?.error ?? "EmptyPartialCohort"),
      excluded,
      validationErrors,
      manifest.mode === "partial" ? 1 : 2,
    );
  }

  const reportVersion = input.reportVersion ?? "v1";
  const groups = partitionClientCohorts(accepted);

  let report: EvidenceChainStatisticsReport;
  if (reportVersion === "v2") {
    const cohortsV2: ReportCohortV2[] = [...groups.entries()]
      .sort(([left], [right]) => compareText(left, right))
      .map(([compatibility_key, members]) => {
        const subGroups = partitionSubCohorts(members);
        const subCohortCount = subGroups.size;
        const sub_cohorts: ReportSubCohort[] = [...subGroups.entries()]
          .sort(([left], [right]) => compareText(left, right))
          .map(([denominator_fingerprint, subMembers]) => ({
            denominator_fingerprint,
            clients: subMembers.map((member) => ({
              ...member.row,
              denominator_fingerprint,
            })),
            statistics: aggregateSubCohortStatistics(subMembers, subCohortCount),
          }));
        return { compatibility_key, sub_cohorts };
      });

    const inputsV2 = sortInputRows(
      accepted.map((member) => {
        const fingerprint = computeDenominatorFingerprint(member.profile);
        return { ...member.row, denominator_fingerprint: fingerprint };
      }),
    ) as EvidenceChainStatisticsReportV2["inputs"];

    const residualRisksV2 = [
      "v2 sub-cohort partition isolates denominator fingerprint mismatches; count-only statistics remain within fingerprint boundaries.",
      ...accepted.flatMap((member) => member.residual_risks),
    ].sort(compareText);

    report = {
      schema_version: EVIDENCE_CHAIN_REPORT_SCHEMA_V2,
      generated_at: generatedAt(input.now),
      generator_version: REPORT_GENERATOR_VERSION_V2,
      mode: manifest.mode,
      include_absolute_paths: manifest.include_absolute_paths,
      inputs: inputsV2,
      cohorts: cohortsV2,
      excluded_inputs: [...excluded].sort((left, right) => compareText(left.artifact_ref, right.artifact_ref)),
      validation_errors: [...validationErrors].sort((left, right) => compareText(left.artifact_ref, right.artifact_ref)),
      residual_risks: residualRisksV2,
      statistics: [
        countStatistic("excluded_input_count", excluded.length, manifest.inputs.length, {
          source: "report_input_manifest",
          method: "count",
          proof_boundary: "traceability_structure",
        }),
        countStatistic("validation_error_count", validationErrors.length, manifest.inputs.length, {
          source: "VALIDATE_PROFILE_ARTIFACT",
          method: "count",
          proof_boundary: "traceability_structure",
        }),
      ],
    };
  } else {
    const cohorts: ReportCohort[] = [...groups.entries()]
      .sort(([left], [right]) => compareText(left, right))
      .map(([compatibility_key, members]) => ({
        compatibility_key,
        clients: members.map((member) => member.row),
        statistics: aggregateCohortStatistics(members),
      }));

    const residualRisks = [
      "v1 count-only aggregation cannot detect semantic denominator-unit drift when two profiles reuse the same field path with different informal units.",
      ...[...groups.values()].flatMap((members) => denominatorMismatchRisks(members)),
      ...accepted.flatMap((member) => member.residual_risks),
    ].sort(compareText);

    report = {
      schema_version: EVIDENCE_CHAIN_REPORT_SCHEMA,
      generated_at: generatedAt(input.now),
      generator_version: REPORT_GENERATOR_VERSION,
      mode: manifest.mode,
      include_absolute_paths: manifest.include_absolute_paths,
      inputs: sortInputRows(accepted.map((member) => member.row)),
      cohorts,
      excluded_inputs: [...excluded].sort((left, right) => compareText(left.artifact_ref, right.artifact_ref)),
      validation_errors: [...validationErrors].sort((left, right) => compareText(left.artifact_ref, right.artifact_ref)),
      residual_risks: residualRisks,
      statistics: [
        countStatistic("excluded_input_count", excluded.length, manifest.inputs.length, {
          source: "report_input_manifest",
          method: "count",
          proof_boundary: "traceability_structure",
        }),
        countStatistic("validation_error_count", validationErrors.length, manifest.inputs.length, {
          source: "VALIDATE_PROFILE_ARTIFACT",
          method: "count",
          proof_boundary: "traceability_structure",
        }),
      ],
    };
  }

  const yamlText = renderStatisticsReportYaml(report);
  const markdownText = renderStatisticsReportMarkdown(report);
  try {
    fs.mkdirSync(path.dirname(yamlOut), { recursive: true });
    fs.mkdirSync(path.dirname(markdownOut), { recursive: true });
    fs.writeFileSync(yamlOut, yamlText, "utf8");
    fs.writeFileSync(markdownOut, markdownText, "utf8");
  } catch {
    for (const outputPath of [yamlOut, markdownOut]) {
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).isFile()) {
        fs.rmSync(outputPath);
      }
    }
    return fail("RENDER_STATISTICS_REPORT_YAML", "OutputWriteFailure", [], [], 1);
  }
  console.debug("DEBUG: [IMPL-EVIDENCE_CHAIN_REPORT] wrote statistics report", {
    yaml_out: path.basename(yamlOut),
    markdown_out: path.basename(markdownOut),
    cohort_count: isV2Report(report) ? report.cohorts.length : report.cohorts.length,
    report_version: report.schema_version,
  });
  return { ok: true, report, exit_code: 0 };
}

export function mapReportErrorToExitCode(result: GenerateReportResult): number {
  if (result.ok) return 0;
  return result.exit_code;
}
