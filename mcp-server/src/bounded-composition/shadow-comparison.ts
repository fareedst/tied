/**
 * [IMPL-TIED_BOUNDED_SHADOW_COMPARISON] [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION]
 * RUN_SHADOW_COMPARISON — opt-in advisory shadow comparison (selection_authority none).
 */

import { prettyCanonicalJson } from "../storage-dump.js";
import fs from "node:fs";
import path from "node:path";

import { workingPathRelativeToProject } from "../working-root.js";
import {
  BOUNDED_ENVELOPE_ARTIFACT_SCHEMAS,
  BOUNDED_PROOF_BOUNDARIES,
} from "./constants.js";
import { stableJsonHash } from "./content-hash.js";
import { redactBoundedSecrets } from "./privacy-redaction.js";
import type { TrajectoryManifestV1 } from "./trajectory-manifest.js";

export type ShadowComparisonErrorCode = "OptInRequired" | "BudgetExhausted" | "RedactionFailure";

export type ShadowComparisonError = {
  code: ShadowComparisonErrorCode;
  detail: string;
};

export type ShadowPilotBudgetContext = {
  bounded_composition_opt_in: boolean;
  cost_spent_units: number;
  cost_ceiling_max_units: number;
};

export type ShadowComparisonOptions = {
  shadow_opt_in: boolean;
  budget: ShadowPilotBudgetContext;
  candidate_run_ids?: string[];
  emit_advisory_recommendation?: boolean;
  now?: string;
};

export type ShadowCandidateRow = {
  anonymized_candidate_id: string;
  source_run_id: string;
  outcome_hash: string;
  exit_code: number;
  provenance_refs: string[];
};

export type ShadowComparisonReportV1 = {
  schema_version: typeof BOUNDED_ENVELOPE_ARTIFACT_SCHEMAS.shadowComparison;
  request_token: string;
  candidate_rows: ShadowCandidateRow[];
  comparison_summary: {
    unique_outcomes: number;
    tie: boolean;
  };
  advisory_recommendation?: {
    label: string;
    note: string;
  };
  selection_authority: "none";
  gate_authority_unchanged: true;
  proof_boundaries: string[];
  content_hash: string;
  generated_at: string;
};

export type RunShadowComparisonResult =
  | { ok: true; report: ShadowComparisonReportV1 }
  | { ok: false; error: ShadowComparisonError };

function fail(code: ShadowComparisonErrorCode, detail: string): RunShadowComparisonResult {
  return { ok: false, error: { code, detail } };
}

function anonymizeCandidateId(manifest: TrajectoryManifestV1): string {
  return stableJsonHash({
    candidate_hash: manifest.candidate_hash,
    run_id: manifest.run_id,
    budget_seed: manifest.budget_seed,
  }).slice(0, 24);
}

function scanBoundedFields(manifest: TrajectoryManifestV1): RunShadowComparisonResult | null {
  const fields: Array<string | null | undefined> = [
    manifest.truncated_summary,
    manifest.adapter_id,
    manifest.harness_id ?? undefined,
  ];
  for (const field of fields) {
    if (typeof field !== "string" || field.trim().length === 0) continue;
    const redacted = redactBoundedSecrets(field);
    if (!redacted.ok) {
      return fail("RedactionFailure", redacted.detail);
    }
    if (redacted.redacted) {
      return fail("RedactionFailure", "canary secret detected in bounded candidate summary fields");
    }
  }
  return null;
}

export function validateShadowComparisonReportShape(candidate: unknown): { ok: boolean; detail?: string } {
  if (typeof candidate !== "object" || candidate === null) {
    return { ok: false, detail: "report must be an object" };
  }
  const record = candidate as Record<string, unknown>;
  if (record.schema_version !== BOUNDED_ENVELOPE_ARTIFACT_SCHEMAS.shadowComparison) {
    return { ok: false, detail: "schema_version must be shadow-comparison.v1" };
  }
  if (record.selection_authority !== "none") {
    return { ok: false, detail: "selection_authority must be none" };
  }
  if (record.gate_authority_unchanged !== true) {
    return { ok: false, detail: "gate_authority_unchanged must be true" };
  }
  return { ok: true };
}

export function runShadowComparison(
  candidates: TrajectoryManifestV1[],
  options: ShadowComparisonOptions,
): RunShadowComparisonResult {
  if (!options.shadow_opt_in || !options.budget.bounded_composition_opt_in) {
    return fail("OptInRequired", "shadow comparison requires explicit opt-in");
  }
  if (options.budget.cost_spent_units >= options.budget.cost_ceiling_max_units) {
    return fail("BudgetExhausted", "pilot budget cost ceiling exhausted");
  }
  if (candidates.length === 0) {
    return fail("OptInRequired", "at least one candidate manifest required");
  }

  const requestToken = candidates[0].request_token;
  for (const manifest of candidates) {
    if (manifest.request_token !== requestToken) {
      return fail("OptInRequired", "candidate request_token mismatch");
    }
    const scan = scanBoundedFields(manifest);
    if (scan) return scan;
  }

  const filter = options.candidate_run_ids?.length
    ? new Set(options.candidate_run_ids)
    : null;
  const selected = filter
    ? candidates.filter((manifest) => filter.has(manifest.run_id))
    : candidates;
  if (selected.length === 0) {
    return fail("OptInRequired", "candidate_run_ids omitted every manifest");
  }

  const candidateRows: ShadowCandidateRow[] = selected
    .map((manifest) => ({
      anonymized_candidate_id: anonymizeCandidateId(manifest),
      source_run_id: manifest.run_id,
      outcome_hash: manifest.outcome_hash,
      exit_code: manifest.exit_code,
      provenance_refs: [...manifest.provenance_refs].sort(),
    }))
    .sort((left, right) => left.anonymized_candidate_id.localeCompare(right.anonymized_candidate_id));

  const uniqueOutcomes = new Set(candidateRows.map((row) => row.outcome_hash)).size;
  const tie = uniqueOutcomes === 1 && candidateRows.length > 1;
  const generatedAt = options.now ?? new Date().toISOString();

  let advisoryRecommendation: ShadowComparisonReportV1["advisory_recommendation"];
  if (options.emit_advisory_recommendation) {
    if (tie) {
      advisoryRecommendation = {
        label: "tie",
        note: "All compared candidates share the same bounded outcome hash; no selection authority granted.",
      };
    } else {
      const best = [...candidateRows].sort((left, right) => {
        if (left.exit_code !== right.exit_code) return left.exit_code - right.exit_code;
        return left.anonymized_candidate_id.localeCompare(right.anonymized_candidate_id);
      })[0];
      advisoryRecommendation = {
        label: "advisory_leader",
        note: `Lower exit_code candidate ${best?.anonymized_candidate_id ?? "unknown"}; advisory only.`,
      };
    }
  }

  const reportBody = {
    schema_version: BOUNDED_ENVELOPE_ARTIFACT_SCHEMAS.shadowComparison,
    request_token: requestToken,
    candidate_rows: candidateRows,
    comparison_summary: {
      unique_outcomes: uniqueOutcomes,
      tie,
    },
    ...(advisoryRecommendation ? { advisory_recommendation: advisoryRecommendation } : {}),
    selection_authority: "none" as const,
    gate_authority_unchanged: true as const,
    proof_boundaries: [BOUNDED_PROOF_BOUNDARIES.defaultOffOptIn],
    generated_at: generatedAt,
  };

  const report: ShadowComparisonReportV1 = {
    ...reportBody,
    content_hash: stableJsonHash({
      candidate_rows: reportBody.candidate_rows,
      comparison_summary: reportBody.comparison_summary,
      advisory_recommendation: reportBody.advisory_recommendation,
    }),
  };

  const shape = validateShadowComparisonReportShape(report);
  if (!shape.ok) {
    return fail("OptInRequired", shape.detail ?? "invalid shadow report shape");
  }

  return { ok: true, report };
}

export function writeShadowComparisonReport(
  projectRoot: string,
  requestToken: string,
  report: ShadowComparisonReportV1,
): string {
  const filename = `bounded-shadow-comparison-${report.content_hash.slice(7, 19)}.v1.json`;
  const relative = workingPathRelativeToProject(projectRoot, requestToken, "evidence", filename);
  const absolute = path.join(projectRoot, relative);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, `${prettyCanonicalJson(report)}\n`, "utf8");
  return relative;
}
