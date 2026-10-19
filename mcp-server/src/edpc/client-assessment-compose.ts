/**
 * [IMPL-TIED_EDPC_CLIENT_ASSESSMENT] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_CLIENT_ASSESSMENT]
 */

import { validateEdpcClientAssessment, type AssessmentCharter, type AssessmentContext } from "./client-assessment-validate.js";
import type { ClaimsLedgerRow, EdpcPublishManifest } from "./publish-build.js";

export type CamFinding = {
  finding_id: string;
  claim_id?: string;
  assertion?: string;
  evidence_refs: string[];
  significance?: string;
  action?: string;
  consultant_required?: boolean;
};

export type ClientAssessmentModel = {
  schema_version: "client-assessment-model.v1";
  baseline_revision: string;
  tier: string;
  domains: Array<{ domain_id: number; status: string; rationale?: string }>;
  findings: CamFinding[];
  publish_gaps: string[];
  receipt_refs: Record<string, string | null>;
  coverage_measures?: Record<string, unknown>;
};

export type AssessmentManifest = {
  schema_version: "client-assessment-manifest.v1";
  cam_schema_version: "client-assessment-model.v1";
  baseline_revision: string;
  tier: string;
};

function stableSortFindings(findings: CamFinding[]): CamFinding[] {
  return [...findings].sort((a, b) => a.finding_id.localeCompare(b.finding_id));
}

// [IMPL-TIED_EDPC_CLIENT_ASSESSMENT] [REQ-TIED_EDPC_CLIENT_ASSESSMENT]
export function composeEdpcClientAssessment(input: {
  charter: AssessmentCharter;
  assessment_context?: AssessmentContext;
  publish_manifest: EdpcPublishManifest;
  claims_ledger: ClaimsLedgerRow[];
  receipt_exists?: (path: string) => boolean;
}): {
  ok: boolean;
  diagnostics: string[];
  cam?: ClientAssessmentModel;
  manifest?: AssessmentManifest;
} {
  const validation = validateEdpcClientAssessment({
    charter: input.charter,
    assessment_context: input.assessment_context,
    publish_manifest: input.publish_manifest,
    receipt_exists: input.receipt_exists,
  });
  if (!validation.ok) {
    return { ok: false, diagnostics: validation.diagnostics };
  }

  const baseline =
    input.charter.baseline_revision?.trim() ||
    (input.publish_manifest.receipt_refs?.baseline as string | undefined) ||
    "unknown";

  const findings: CamFinding[] = [];
  for (const row of input.claims_ledger) {
    const id = row.claim_id?.trim();
    if (!id) continue;
    findings.push({
      finding_id: `finding:${id}`,
      claim_id: id,
      assertion: row.text,
      evidence_refs: [id],
      consultant_required: false,
    });
  }

  const domains = (input.charter.domains ?? [])
    .map((d) => ({
      domain_id: d.domain_id as number,
      status: d.status?.trim() ?? "deferred",
      rationale: d.rationale,
    }))
    .sort((a, b) => a.domain_id - b.domain_id);

  for (const domain of domains) {
    if (domain.status === "consultant_required") {
      findings.push({
        finding_id: `finding:domain-${domain.domain_id}-consultant`,
        evidence_refs: [],
        consultant_required: true,
        significance: input.assessment_context?.aggregate_trust_summary,
        action: "consultant_review_required",
      });
    }
  }

  const cam: ClientAssessmentModel = {
    schema_version: "client-assessment-model.v1",
    baseline_revision: baseline,
    tier: input.publish_manifest.tier,
    domains,
    findings: stableSortFindings(findings),
    publish_gaps: [...(input.publish_manifest.gaps ?? [])].sort(),
    receipt_refs: { ...input.publish_manifest.receipt_refs },
    coverage_measures: {
      domain_count: domains.length,
      finding_count: findings.length,
      gap_count: input.publish_manifest.gaps?.length ?? 0,
    },
  };

  const manifest: AssessmentManifest = {
    schema_version: "client-assessment-manifest.v1",
    cam_schema_version: "client-assessment-model.v1",
    baseline_revision: baseline,
    tier: input.publish_manifest.tier,
  };

  return { ok: true, diagnostics: [], cam, manifest };
}
