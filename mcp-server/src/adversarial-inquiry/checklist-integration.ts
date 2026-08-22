import { promises as fs } from "node:fs";
import path from "node:path";

import { runAdversarialInquiry, type AdversarialInquiryInput, type AdversarialInquiryResult } from "./core.js";
import type { FidelityFinding, FidelityVerdict, ReadOnlyReport } from "./types.js";
import type {
  FindingLedger,
  FindingObservation,
  StrictEligibilityResult,
} from "./workflow.js";
import { appendFinding } from "./workflow.js";

export type GatePolicy = "advisory" | "strict-candidate" | "strict-approved";

export type HumanStrictApproval = {
  reviewer: string;
  approvedScope: string[];
  thresholds: Record<string, string | number>;
  waiverOwner: string;
  waiverExpiry: string;
  rollbackCriteria: string;
  approvalRevision: string;
  citdpRecord: string;
};

export type ScopedGateResult = {
  schemaVersion: "adversarial-inquiry-gate.v1";
  policy: GatePolicy;
  scope: string[];
  status: "passed" | "warn" | "blocked";
  blocking: boolean;
  verdict: FidelityVerdict;
  diagnostics: string[];
  proofBoundary: "human_decision";
  approvalRevision?: string;
};

export type ArtifactPaths = {
  directory: string;
  obligationReport: string;
  findingLedger: string;
  gateResult: string;
  evidenceProvenance: string;
};

export type PersistWorkingArtifactsInput = {
  repositoryRoot: string;
  requestToken: string;
  report: ReadOnlyReport;
  ledger: FindingLedger;
  gate: ScopedGateResult;
  provenance: unknown;
  redact?: readonly string[];
};

export type PersistedArtifactReferences = {
  directory: string;
  obligationReport: string;
  findingLedger: string;
  gateResult: string;
  evidenceProvenance: string;
};

export type ChecklistInquiryInput = AdversarialInquiryInput & {
  policy?: GatePolicy;
  humanApproval?: HumanStrictApproval;
  repositoryRoot?: string;
  requestToken?: string;
  provenance?: unknown;
  redact?: readonly string[];
  ledger?: FindingLedger;
};

export type ChecklistInquiryResult = AdversarialInquiryResult & {
  gate?: ScopedGateResult;
  artifacts?: PersistedArtifactReferences;
};

const REQUEST_TOKEN_RE = /^REQ-[A-Z0-9][A-Z0-9_-]*$/u;

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

function isWithin(root: string, candidate: string): boolean {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return relative === ""
    || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function validateApproval(
  approval: HumanStrictApproval | undefined,
  scope: readonly string[],
): string[] {
  if (!approval) return ["missing_human_approval"];
  const diagnostics: string[] = [];
  if (!approval.reviewer.trim()) diagnostics.push("missing_reviewer");
  if (!approval.approvalRevision.trim()) diagnostics.push("missing_approval_revision");
  if (!approval.citdpRecord.trim()) diagnostics.push("missing_citdp_record");
  if (!approval.rollbackCriteria.trim()) diagnostics.push("missing_rollback_criteria");
  if (!approval.waiverOwner.trim() || !approval.waiverExpiry.trim()) {
    diagnostics.push("missing_waiver_owner_or_expiry");
  }
  const expected = sortedUnique(scope);
  const approved = sortedUnique(approval.approvedScope);
  if (expected.length === 0
    || approved.length !== expected.length
    || expected.some((id, index) => approved[index] !== id)) {
    diagnostics.push("scope_mismatch");
  }
  if (Object.keys(approval.thresholds).length === 0) diagnostics.push("missing_thresholds");
  return diagnostics;
}

// [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: distinguish research profile, assurance profile, and gate policy before selecting checklist work.
export function evaluateScopedGate(input: {
  policy: GatePolicy;
  scope: readonly string[];
  verdict: FidelityVerdict;
  eligibility: StrictEligibilityResult;
  humanApproval?: HumanStrictApproval;
}): ScopedGateResult {
  const scope = sortedUnique(input.scope);
  const diagnostics = input.scope.length === 0 ? ["missing_scope"] : [];
  if (input.policy === "advisory") {
    return {
      schemaVersion: "adversarial-inquiry-gate.v1",
      policy: input.policy,
      scope,
      status: "warn",
      blocking: false,
      verdict: input.verdict,
      diagnostics,
      proofBoundary: "human_decision",
    };
  }
  if (input.policy === "strict-candidate") {
    return {
      schemaVersion: "adversarial-inquiry-gate.v1",
      policy: input.policy,
      scope,
      status: "warn",
      blocking: false,
      verdict: input.verdict,
      diagnostics: [...diagnostics, "strict_candidate_requires_human_approval"],
      proofBoundary: "human_decision",
    };
  }

  // [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: permit scoped blocking only after deterministic eligibility and explicit human CITDP approval; otherwise return warn-only.
  const approvalDiagnostics = validateApproval(input.humanApproval, scope);
  const eligibilityDiagnostics = input.eligibility.eligible
    ? []
    : input.eligibility.diagnostics.map((item) => item.code);
  const allDiagnostics = [...diagnostics, ...eligibilityDiagnostics, ...approvalDiagnostics];
  const canBlock = scope.length > 0
    && input.eligibility.eligible
    && approvalDiagnostics.length === 0;
  return {
    schemaVersion: "adversarial-inquiry-gate.v1",
    policy: input.policy,
    scope,
    status: canBlock ? (input.verdict === "PASS" ? "passed" : "blocked") : "warn",
    blocking: canBlock && input.verdict !== "PASS",
    verdict: input.verdict,
    diagnostics: sortedUnique(allDiagnostics),
    proofBoundary: "human_decision",
    approvalRevision: canBlock ? input.humanApproval?.approvalRevision : undefined,
  };
}

// [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: write deterministic snapshots and append-only findings below working/{REQ-TOKEN}/adversarial-inquiry without touching canonical TIED YAML.
export function resolveArtifactPaths(input: {
  repositoryRoot: string;
  requestToken: string;
  artifactRoot?: string;
}): ArtifactPaths {
  const requestToken = input.requestToken.trim();
  if (!REQUEST_TOKEN_RE.test(requestToken)) {
    throw new Error(`INVALID_SCOPE: invalid request token ${input.requestToken}`);
  }
  const repositoryRoot = path.resolve(input.repositoryRoot);
  const expected = path.join(repositoryRoot, "working", requestToken, "adversarial-inquiry");
  const directory = path.resolve(input.artifactRoot ?? expected);
  const workingRoot = path.join(repositoryRoot, "working");
  if (!isWithin(workingRoot, directory) || directory !== expected && input.artifactRoot === undefined) {
    throw new Error(`UNSAFE_ARTIFACT_PATH: ${directory}`);
  }
  return {
    directory,
    obligationReport: path.join(directory, "obligation-report.json"),
    findingLedger: path.join(directory, "finding-ledger.jsonl"),
    gateResult: path.join(directory, "gate-result.json"),
    evidenceProvenance: path.join(directory, "evidence-provenance.json"),
  };
}

function redactValue(value: unknown, secrets: readonly string[]): unknown {
  if (typeof value === "string") {
    return secrets.filter(Boolean).reduce(
      (result, secret) => result.split(secret).join("[REDACTED]"),
      value,
    );
  }
  if (Array.isArray(value)) return value.map((item) => redactValue(item, secrets));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, redactValue(item, secrets)]),
    );
  }
  return value;
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, stableValue(item)]),
    );
  }
  return value;
}

function stableJson(value: unknown): string {
  return `${JSON.stringify(stableValue(value), null, 2)}\n`;
}

async function atomicWrite(filePath: string, value: unknown): Promise<void> {
  const temporary = `${filePath}.tmp-${process.pid}`;
  await fs.writeFile(temporary, stableJson(value), { encoding: "utf8", mode: 0o600 });
  await fs.rename(temporary, filePath);
}

type LedgerLine =
  | { schemaVersion: "adversarial-inquiry-finding.v1"; kind: "finding"; finding: FindingLedger["findings"][number] }
  | { schemaVersion: "adversarial-inquiry-finding.v1"; kind: "duplicate_link"; link: [string, string] };

async function appendLedger(filePath: string, ledger: FindingLedger): Promise<void> {
  let existing = "";
  try {
    existing = await fs.readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const findingIds = new Set<string>();
  const links = new Set<string>();
  for (const line of existing.split("\n").filter(Boolean)) {
    const parsed = JSON.parse(line) as LedgerLine;
    if (parsed.kind === "finding") findingIds.add(parsed.finding.id);
    else links.add(parsed.link.join("\0"));
  }
  const additions: string[] = [];
  for (const finding of [...ledger.findings].sort((left, right) => left.id.localeCompare(right.id))) {
    if (findingIds.has(finding.id)) continue;
    additions.push(JSON.stringify({
      schemaVersion: "adversarial-inquiry-finding.v1",
      kind: "finding",
      finding: stableValue(finding),
    }));
    findingIds.add(finding.id);
  }
  for (const link of [...ledger.duplicateLinks].sort(([left], [right]) => left.localeCompare(right))) {
    const key = link.join("\0");
    if (links.has(key)) continue;
    additions.push(JSON.stringify({
      schemaVersion: "adversarial-inquiry-finding.v1",
      kind: "duplicate_link",
      link,
    }));
    links.add(key);
  }
  if (additions.length > 0) await fs.appendFile(filePath, `${additions.join("\n")}\n`, "utf8");
}

// [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: write deterministic snapshots and append-only findings below working/{REQ-TOKEN}/adversarial-inquiry without touching canonical TIED YAML.
export async function persistWorkingArtifacts(
  input: PersistWorkingArtifactsInput,
): Promise<PersistedArtifactReferences> {
  const paths = resolveArtifactPaths(input);
  await fs.mkdir(paths.directory, { recursive: true, mode: 0o700 });
  const secrets = input.redact ?? [];
  await atomicWrite(paths.obligationReport, redactValue(input.report, secrets));
  await atomicWrite(paths.gateResult, redactValue(input.gate, secrets));
  await atomicWrite(paths.evidenceProvenance, redactValue({
    schemaVersion: "adversarial-inquiry-provenance.v1",
    provenance: input.provenance,
  }, secrets));
  await appendLedger(paths.findingLedger, input.ledger);
  return paths;
}

function findingObservation(finding: FidelityFinding, scope: readonly string[]): FindingObservation {
  return {
    obligationId: scope[0] ?? finding.id,
    blockRevision: "report",
    dimension: "semantic_fidelity",
    statementId: finding.statementId,
    message: finding.message,
    evidenceRefs: finding.evidenceRefs ?? [],
    proofBoundary: finding.proofBoundary,
  };
}

// [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: invoke the existing read-only analyzer for the declared checklist scope and preserve its proof boundaries.
export async function runChecklistInquiry(input: ChecklistInquiryInput): Promise<ChecklistInquiryResult> {
  const result = runAdversarialInquiry(input);
  if (!result.ok) return result;
  const policy = input.policy ?? "advisory";
  const eligibility = input.eligibility ?? {
    eligible: true,
    diagnostics: [],
    proofBoundary: "human_decision" as const,
  };
  const gate = evaluateScopedGate({
    policy,
    scope: input.scope,
    verdict: result.verdict,
    eligibility,
    humanApproval: input.humanApproval,
  });
  if (!input.repositoryRoot && !input.requestToken) return { ...result, gate };
  if (!input.repositoryRoot || !input.requestToken) {
    throw new Error("INVALID_SCOPE: repositoryRoot and requestToken are both required for artifact persistence");
  }
  const ledger = input.ledger ?? { findings: [], duplicateLinks: [] };
  // [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: append observed findings and deterministic duplicate links without promoting them to canonical intent or LEAP actions.
  for (const finding of result.report.findings) {
    const observation = findingObservation(finding, input.scope);
    appendFinding(ledger, observation);
  }
  const artifacts = await persistWorkingArtifacts({
    repositoryRoot: input.repositoryRoot,
    requestToken: input.requestToken,
    report: result.report,
    ledger,
    gate,
    provenance: input.provenance ?? {
      scope: [...input.scope].sort(),
      proofBoundaries: result.report.proofBoundaries,
    },
    redact: input.redact,
  });
  return { ...result, gate, artifacts };
}
