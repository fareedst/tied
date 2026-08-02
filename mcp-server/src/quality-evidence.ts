/**
 * [IMPL-QUALITY_EVIDENCE_MANIFEST] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
 * Summary: Build a deterministic machine-derived verification evidence manifest while keeping human risk decisions separate.
 */

export type EvidenceResult = "passed" | "failed" | "skipped" | "pending" | "not_applicable";
export type EvidenceApplicability = "applicable" | "not_applicable" | "accepted_risk";

export type VerificationCommandResult = {
  id: string;
  command: string | string[];
  cwd: string;
  exit_code: number;
  result: EvidenceResult;
  duration_ms?: number;
  threshold?: string;
  artifacts?: string[];
  diagnostics?: string[];
  tool_versions?: Record<string, string>;
};

export type QualityEvidenceRow = {
  id: string;
  attribute: string;
  applicability: EvidenceApplicability;
  rationale: string;
  risk?: string;
  evidence_method: string;
  command_or_test?: string;
  threshold?: string;
  result: EvidenceResult;
  owner?: string;
  limitation?: string;
  waiver?: {
    required: boolean;
    reason?: string;
    owner?: string;
    expiry?: string;
  };
};

export type VerificationEvidenceInput = {
  run_id: string;
  commit: string;
  environment: Record<string, string | number | boolean | null>;
  command_results: VerificationCommandResult[];
  quality_rows: QualityEvidenceRow[];
  covered_tokens: string[];
  proof_boundaries: string[];
  decision_references?: string[];
};

export type VerificationEvidenceManifest = {
  schema_version: "verification-evidence-manifest.v1";
  run_id: string;
  commit: string;
  environment: Record<string, string | number | boolean | null>;
  command_results: VerificationCommandResult[];
  quality_rows: QualityEvidenceRow[];
  covered_tokens: string[];
  proof_boundaries: string[];
  human_decisions: {
    stored_separately: true;
    references: string[];
  };
};

function sortedUnique(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function sortedRecord(
  record: Record<string, string | number | boolean | null>,
): Record<string, string | number | boolean | null> {
  return Object.fromEntries(
    Object.entries(record).sort(([left], [right]) => left.localeCompare(right)),
  );
}

function normalizeCommand(command: string | string[]): string | string[] {
  if (Array.isArray(command)) {
    const normalized = command.map((part) => part.trim());
    if (normalized.length === 0 || normalized.some((part) => part.length === 0)) {
      throw new Error("INVALID_COMMAND_RESULT: command argv is empty");
    }
    return normalized;
  }

  const normalized = command.trim();
  if (normalized.length === 0) {
    throw new Error("INVALID_COMMAND_RESULT: command is empty");
  }
  return normalized;
}

function normalizeCommandResult(row: VerificationCommandResult): VerificationCommandResult {
  if (!row.id.trim() || !Number.isInteger(row.exit_code) || !row.cwd.trim()) {
    throw new Error("INVALID_COMMAND_RESULT: id, cwd, and integer exit_code are required");
  }
  if (!["passed", "failed"].includes(row.result)) {
    throw new Error("INVALID_COMMAND_RESULT: executable results must be passed or failed");
  }
  if ((row.exit_code === 0 && row.result !== "passed") || (row.exit_code !== 0 && row.result !== "failed")) {
    throw new Error("INVALID_COMMAND_RESULT: exit_code and result disagree");
  }

  return {
    id: row.id.trim(),
    command: normalizeCommand(row.command),
    cwd: row.cwd.trim(),
    exit_code: row.exit_code,
    result: row.result,
    duration_ms: row.duration_ms,
    threshold: row.threshold?.trim(),
    artifacts: row.artifacts ? sortedUnique(row.artifacts) : undefined,
    diagnostics: row.diagnostics ? sortedUnique(row.diagnostics) : undefined,
    tool_versions: row.tool_versions
      ? Object.fromEntries(
          Object.entries(row.tool_versions).sort(([left], [right]) => left.localeCompare(right)),
        )
      : undefined,
  };
}

function normalizeQualityRow(row: QualityEvidenceRow): QualityEvidenceRow {
  if (
    !row.id.trim() ||
    !row.attribute.trim() ||
    !row.applicability ||
    !row.rationale.trim() ||
    !row.evidence_method.trim() ||
    !row.result
  ) {
    throw new Error("INVALID_QUALITY_ROW: id, attribute, applicability, rationale, evidence_method, and result are required");
  }
  if (row.applicability === "accepted_risk") {
    if (
      !row.owner?.trim() ||
      row.waiver?.required !== true ||
      !row.waiver.reason?.trim() ||
      !row.waiver.owner?.trim() ||
      !row.waiver.expiry?.trim()
    ) {
      throw new Error("INVALID_QUALITY_ROW: accepted_risk requires waiver reason, owner, and expiry");
    }
  }
  return {
    id: row.id.trim(),
    attribute: row.attribute.trim(),
    applicability: row.applicability,
    rationale: row.rationale.trim(),
    risk: row.risk?.trim(),
    evidence_method: row.evidence_method.trim(),
    command_or_test: row.command_or_test?.trim(),
    threshold: row.threshold?.trim(),
    result: row.result,
    owner: row.owner?.trim(),
    limitation: row.limitation?.trim(),
    waiver: row.waiver
      ? {
          required: row.waiver.required,
          reason: row.waiver.reason?.trim(),
          owner: row.waiver.owner?.trim(),
          expiry: row.waiver.expiry?.trim(),
        }
      : undefined,
  };
}

/**
 * [IMPL-QUALITY_EVIDENCE_MANIFEST] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
 * How: Normalize executable results and quality evidence into one reproducible manifest.
 */
export function buildVerificationEvidenceManifest(
  input: VerificationEvidenceInput,
): VerificationEvidenceManifest {
  // [IMPL-QUALITY_EVIDENCE_MANIFEST] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
  // How: Reject missing machine-result identity before constructing evidence.
  const commandResults = input.command_results.map(normalizeCommandResult);
  const qualityRows = input.quality_rows.map(normalizeQualityRow);

  // [IMPL-QUALITY_EVIDENCE_MANIFEST] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
  // How: Normalize rows and sort them by stable identifiers for deterministic output.
  commandResults.sort((left, right) => left.id.localeCompare(right.id));
  qualityRows.sort((left, right) => left.id.localeCompare(right.id));

  return {
    schema_version: "verification-evidence-manifest.v1",
    run_id: input.run_id,
    commit: input.commit,
    environment: sortedRecord(input.environment),
    command_results: commandResults,
    quality_rows: qualityRows,
    covered_tokens: sortedUnique(input.covered_tokens),
    proof_boundaries: sortedUnique(input.proof_boundaries),
    human_decisions: {
      stored_separately: true,
      references: sortedUnique(input.decision_references ?? []),
    },
  };
}
