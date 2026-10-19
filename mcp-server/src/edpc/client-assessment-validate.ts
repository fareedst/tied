/**
 * [IMPL-TIED_EDPC_CLIENT_ASSESSMENT] [ARCH-TIED_EDPC_CLIENT_ASSESSMENT_MODEL] [REQ-TIED_EDPC_CLIENT_ASSESSMENT]
 */

import type { EdpcPublishManifest } from "./publish-build.js";
import type { EvidenceAccessTier } from "./types.js";

export const DOMAIN_STATUSES = [
  "sampled",
  "investigated",
  "deferred",
  "excluded",
  "consultant_required",
] as const;

export type DomainStatus = (typeof DOMAIN_STATUSES)[number];

export type AssessmentCharter = {
  schema_version?: string;
  evidence_access_tier?: EvidenceAccessTier;
  baseline_revision?: string;
  refresh_gap?: string;
  domains?: Array<{ domain_id?: number; status?: string; rationale?: string }>;
};

export type AssessmentContext = {
  schema_version?: string;
  aggregate_trust_summary?: string;
  aggregate_health_summary?: string;
  evidence_refs?: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// [IMPL-TIED_EDPC_CLIENT_ASSESSMENT] [REQ-TIED_EDPC_CLIENT_ASSESSMENT] — SC-CAM-DOMAINS
export function assertDomainMatrix(charter: AssessmentCharter): string[] {
  const diagnostics: string[] = [];
  const domains = charter.domains;
  if (!Array.isArray(domains) || domains.length !== 20) {
    diagnostics.push("invalid_domain_count");
    return diagnostics;
  }
  const seen = new Set<number>();
  const allowed = new Set<string>(DOMAIN_STATUSES);
  for (const row of domains) {
    const id = row.domain_id;
    if (typeof id !== "number" || id < 1 || id > 20) {
      diagnostics.push(`invalid_domain_id:${id ?? "missing"}`);
      continue;
    }
    if (seen.has(id)) diagnostics.push(`duplicate_domain_id:${id}`);
    seen.add(id);
    const status = row.status?.trim();
    if (!status || !allowed.has(status)) {
      diagnostics.push(`invalid_domain_status:${id}`);
    }
  }
  for (let i = 1; i <= 20; i += 1) {
    if (!seen.has(i)) diagnostics.push(`missing_domain_id:${i}`);
  }
  return diagnostics;
}

// [IMPL-TIED_EDPC_CLIENT_ASSESSMENT] [REQ-TIED_EDPC_CLIENT_ASSESSMENT] — SC-CAM-SOURCE / SC-CAM-FRESHNESS
export function assertPublishManifest(manifest: unknown): string[] {
  const diagnostics: string[] = [];
  if (!isRecord(manifest)) {
    diagnostics.push("missing_publish_manifest");
    return diagnostics;
  }
  if (manifest.schema_version !== "edpc-publish-manifest.v1") {
    diagnostics.push("invalid_publish_manifest_schema");
  }
  return diagnostics;
}

export function assertReceiptFreshness(
  manifest: EdpcPublishManifest,
  receiptExists?: (path: string) => boolean,
  charter?: AssessmentCharter,
): string[] {
  const diagnostics: string[] = [];
  if (!receiptExists) return diagnostics;
  const refs = manifest.receipt_refs ?? {};
  let unresolved = false;
  for (const [key, path] of Object.entries(refs)) {
    if (path == null || path === "") continue;
    if (!receiptExists(path)) {
      unresolved = true;
    }
  }
  if (unresolved && !charter?.refresh_gap?.trim()) {
    diagnostics.push("stale_receipt_refs_without_refresh_gap");
    for (const [key, path] of Object.entries(refs)) {
      if (path == null || path === "") continue;
      if (!receiptExists(path)) {
        diagnostics.push(`unresolved_receipt_ref:${key}`);
      }
    }
  }
  return diagnostics;
}

// [IMPL-TIED_EDPC_CLIENT_ASSESSMENT] [REQ-TIED_EDPC_COMPREHENSION] SC-CAM-TIER pattern
export function assertOverlayTierLegal(
  tier: EvidenceAccessTier | undefined,
  context: AssessmentContext | undefined,
): string[] {
  const diagnostics: string[] = [];
  if (!context) return diagnostics;
  const hasAggregate =
    Boolean(context.aggregate_health_summary?.trim()) ||
    Boolean(context.aggregate_trust_summary?.trim());
  const refs = context.evidence_refs;
  const hasRefs = Array.isArray(refs) && refs.length > 0;
  if (hasAggregate && !hasRefs) {
    diagnostics.push("blanket_trust_health_without_evidence_refs");
  }
  if (tier === "source_static" && hasAggregate && !hasRefs) {
    diagnostics.push("source_static_aggregate_claim_blocked");
  }
  return diagnostics;
}

// [IMPL-TIED_EDPC_CLIENT_ASSESSMENT] [ARCH-TIED_EDPC_CLIENT_ASSESSMENT_MODEL] [REQ-TIED_EDPC_CLIENT_ASSESSMENT]
export function validateEdpcClientAssessment(input: {
  charter: AssessmentCharter;
  assessment_context?: AssessmentContext;
  publish_manifest: EdpcPublishManifest;
  receipt_exists?: (path: string) => boolean;
}): { ok: boolean; diagnostics: string[] } {
  const diagnostics: string[] = [];
  if (input.charter.schema_version !== "edpc-client-assessment-charter.v1") {
    diagnostics.push("invalid_charter_schema");
  }
  diagnostics.push(...assertDomainMatrix(input.charter));
  diagnostics.push(...assertPublishManifest(input.publish_manifest));
  diagnostics.push(
    ...assertReceiptFreshness(input.publish_manifest, input.receipt_exists, input.charter),
  );
  diagnostics.push(
    ...assertOverlayTierLegal(input.charter.evidence_access_tier, input.assessment_context),
  );
  const unique = [...new Set(diagnostics)].sort();
  return { ok: unique.length === 0, diagnostics: unique };
}
