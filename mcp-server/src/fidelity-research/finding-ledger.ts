import crypto from "node:crypto";

export type FindingLifecycle =
  | "observed"
  | "triaged"
  | "confirmed"
  | "dismissed"
  | "deferred"
  | "linked"
  | "remediated"
  | "verified";

export interface EvidenceReference {
  path: string;
  line?: number;
}

export interface CandidateFindingInput {
  project: string;
  revision: string;
  scope: string;
  category: string;
  severity: string;
  confidence: string;
  visibility: string;
  discoverySource: string;
  evidence: readonly EvidenceReference[];
}

export interface CandidateFinding extends CandidateFindingInput {
  id: string;
  lifecycle: FindingLifecycle;
}

export interface FindingLedger {
  findings: CandidateFinding[];
  duplicateLinks: Array<{ findingId: string; duplicateId: string }>;
}

export type AppendFindingResult =
  | { kind: "appended"; finding: CandidateFinding }
  | { kind: "duplicate"; findingId: string; duplicateId: string };

export function createFindingLedger(): FindingLedger {
  return { findings: [], duplicateLinks: [] };
}

// [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
// Appends an observation without treating it as a confirmed product defect.
export function appendCandidateFinding(
  ledger: FindingLedger,
  input: CandidateFindingInput,
): AppendFindingResult {
  const id = stableFindingId(input);
  const existing = ledger.findings.find((finding) => finding.id === id);

  if (existing) {
    const duplicateId = `${id}:${ledger.duplicateLinks.length + 1}`;
    ledger.duplicateLinks.push({ findingId: existing.id, duplicateId });
    return { kind: "duplicate", findingId: existing.id, duplicateId };
  }

  const finding: CandidateFinding = {
    ...input,
    evidence: input.evidence.map((reference) => ({ ...reference })),
    id,
    lifecycle: "observed",
  };
  ledger.findings.push(finding);
  return { kind: "appended", finding };
}

function stableFindingId(input: CandidateFindingInput): string {
  const evidence = input.evidence
    .map((reference) => `${reference.path}:${reference.line ?? ""}`)
    .sort()
    .join("|");
  const identity = [
    input.project,
    input.revision,
    input.scope,
    input.category,
    evidence,
  ].join("\0");
  return crypto.createHash("sha256").update(identity).digest("hex");
}
