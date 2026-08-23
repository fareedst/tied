import { createHash } from "node:crypto";

export type GatePhase = "pre_implementation" | "verification" | "close_out";
export type AdversarialDepth = "minimal" | "integrated" | "strict_candidate";
export type StepDisposition = "pending" | "completed" | "not_applicable" | "waived";

export type ValidationResult = {
  ok: boolean;
  diagnostics: string[];
};

export type ActivationExpectedIdentity = {
  request_token: string;
  project_id: string;
  run_id: string;
  phase: GatePhase;
  scope: string[];
  scope_hash: string;
};

export type ActivationPairingResult = ValidationResult & {
  artifact_hashes?: Record<string, string>;
};

const ARTIFACT_NAMES = [
  "obligation-report.json",
  "finding-ledger.jsonl",
  "gate-result.json",
  "evidence-provenance.json",
] as const;
const DISPOSITIONS = new Set<StepDisposition>([
  "pending",
  "completed",
  "not_applicable",
  "waived",
]);
const PHASES = new Set<GatePhase>([
  "pre_implementation",
  "verification",
  "close_out",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmpty(value: unknown): boolean {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

function listWithValues(value: unknown): boolean {
  return Array.isArray(value) && value.some((item) => nonEmpty(item));
}

function getString(record: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    if (typeof record[key] === "string" && record[key].trim()) return record[key] as string;
  }
  return undefined;
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, stableValue(item)]),
    );
  }
  return value;
}

export function stableHash(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(stableValue(value)), "utf8")
    .digest("hex");
}

function trackerSteps(tracker: unknown): Record<string, unknown>[] {
  if (!isRecord(tracker)) return [];
  if (Array.isArray(tracker.steps)) {
    return tracker.steps.filter(isRecord);
  }
  if (isRecord(tracker.steps)) {
    return Object.entries(tracker.steps).map(([slug, value]) => ({
      ...(isRecord(value) ? value : {}),
      slug,
    }));
  }
  return [];
}

function disposition(step: Record<string, unknown>): string | undefined {
  const tracking = isRecord(step.tracking) ? step.tracking : undefined;
  return getString(step, "disposition", "status")
    ?? (tracking ? getString(tracking, "disposition", "status") : undefined);
}

function hasStepEvidence(step: Record<string, unknown>): boolean {
  return listWithValues(step.evidence)
    || listWithValues(step.evidence_refs)
    || nonEmpty(step.evidence_reference)
    || (isRecord(step.tracking) && (
      listWithValues(step.tracking.evidence)
      || listWithValues(step.tracking.evidence_refs)
      || nonEmpty(step.tracking.evidence_reference)
    ));
}

function hasRationale(step: Record<string, unknown>): boolean {
  return nonEmpty(step.rationale)
    || (isRecord(step.tracking) && nonEmpty(step.tracking.rationale));
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: validate disposition contracts and reject generic skips.
export function validateTracker(input: {
  tracker: unknown;
  phase: GatePhase;
  requiredStepSlugs?: readonly string[];
  now?: Date;
}): ValidationResult {
  const diagnostics: string[] = [];
  if (!PHASES.has(input.phase)) diagnostics.push("invalid_phase");
  const steps = trackerSteps(input.tracker);
  if (steps.length === 0) diagnostics.push("malformed_tracker:steps");

  const required = input.requiredStepSlugs?.length
    ? new Set(input.requiredStepSlugs)
    : undefined;
  const seen = new Set<string>();
  for (const step of steps) {
    const slug = getString(step, "slug", "id") ?? "unknown";
    seen.add(slug);
    if (required && !required.has(slug)) continue;
    const value = disposition(step);
    if (!value || !DISPOSITIONS.has(value as StepDisposition)) {
      diagnostics.push(`invalid_disposition:${slug}`);
      continue;
    }
    if (value === "pending") {
      diagnostics.push(`pending_required_step:${slug}`);
      continue;
    }
    if (value === "completed" && !hasStepEvidence(step)) {
      diagnostics.push(`missing_disposition_evidence:${slug}`);
    }
    if (value === "not_applicable" && (!hasRationale(step) || !nonEmpty(
      step.policy ?? (isRecord(step.tracking) ? step.tracking.policy : undefined),
    ))) {
      diagnostics.push(`missing_not_applicable_policy_or_rationale:${slug}`);
    }
    if (value === "waived") {
      const owner = step.owner ?? (isRecord(step.tracking) ? step.tracking.owner : undefined);
      const expiry = step.expiry ?? (isRecord(step.tracking) ? step.tracking.expiry : undefined);
      const approval = step.approval ?? (isRecord(step.tracking) ? step.tracking.approval : undefined);
      const residualRisk = step.residual_risk ?? (isRecord(step.tracking) ? step.tracking.residual_risk : undefined);
      if (!nonEmpty(owner) || !nonEmpty(expiry) || !nonEmpty(approval) || !nonEmpty(residualRisk)) {
        diagnostics.push(`missing_waiver_contract:${slug}`);
      } else if (Number.isNaN(Date.parse(String(expiry)))
        || Date.parse(String(expiry)) < (input.now ?? new Date()).getTime()) {
        diagnostics.push(`expired_waiver:${slug}`);
      }
    }
  }
  if (required) {
    for (const slug of required) {
      if (!seen.has(slug)) diagnostics.push(`missing_required_step:${slug}`);
    }
  }
  return { ok: diagnostics.length === 0, diagnostics };
}

function adversarialSection(citdp: unknown): Record<string, unknown> | undefined {
  if (!isRecord(citdp)) return undefined;
  if (isRecord(citdp.adversarial_inquiry)) return citdp.adversarial_inquiry;
  const risk = isRecord(citdp.risk_analysis) ? citdp.risk_analysis : undefined;
  if (risk && isRecord(risk.adversarial_inquiry)) return risk.adversarial_inquiry;
  return undefined;
}

function identityValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: enforce depth-specific adversarial obligations before progression.
export function validateAdversarialContract(input: {
  citdp: unknown;
  phase: GatePhase;
  activation?: {
    receipt?: unknown;
    artifacts?: unknown;
    expected?: ActivationExpectedIdentity;
  };
}): ValidationResult {
  const diagnostics: string[] = [];
  if (!PHASES.has(input.phase)) diagnostics.push("invalid_phase");
  const section = adversarialSection(input.citdp);
  if (!section) {
    diagnostics.push("malformed_citdp:adversarial_inquiry");
    return { ok: false, diagnostics };
  }
  const depth = identityValue(section.depth_tier);
  if (!depth || !["minimal", "integrated", "strict_candidate"].includes(depth)) {
    diagnostics.push("missing_or_invalid_depth");
    return { ok: false, diagnostics };
  }
  if (depth === "minimal" || depth === "strict_candidate") {
    const requiredFields = [
      ["counterexamples", "missing_counterexamples"],
      ["falsification_questions", "missing_falsification_questions"],
      ["disconfirming_observations", "missing_disconfirming_observations"],
      ["evidence_references", "missing_adversarial_evidence_references"],
    ] as const;
    for (const [field, code] of requiredFields) {
      if (!listWithValues(section[field])) diagnostics.push(code);
    }
  }
  if (depth === "integrated") {
    const pairing = validateActivationPairing({
      receipt: input.activation?.receipt,
      artifacts: input.activation?.artifacts,
      expected: input.activation?.expected,
    });
    diagnostics.push(...pairing.diagnostics);
  }
  return { ok: diagnostics.length === 0, diagnostics };
}

function compareIdentity(
  actual: Record<string, unknown> | undefined,
  expected: ActivationExpectedIdentity,
  label: string,
): string[] {
  if (!actual) return [`${label}_missing`];
  const diagnostics: string[] = [];
  for (const key of ["request_token", "project_id", "run_id", "phase", "scope_hash"] as const) {
    if (actual[key] !== expected[key]) diagnostics.push(`${label}_identity_mismatch:${key}`);
  }
  return diagnostics;
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: pair inquiry receipt with four bounded artifacts.
export function validateActivationPairing(input: {
  receipt: unknown;
  artifacts: unknown;
  expected?: ActivationExpectedIdentity;
}): ActivationPairingResult {
  const diagnostics: string[] = [];
  if (!isRecord(input.receipt) || input.receipt.success !== true) {
    diagnostics.push("missing_or_unsuccessful_inquiry_receipt");
  }
  if (isRecord(input.receipt) && input.receipt.tool !== "tied_adversarial_inquiry_run") {
    diagnostics.push("invalid_inquiry_tool");
  }
  if (!input.expected) diagnostics.push("missing_expected_identity");
  if (input.expected && isRecord(input.receipt)) {
    diagnostics.push(...compareIdentity(input.receipt, input.expected, "receipt"));
    if (stableHash(input.expected.scope) !== input.expected.scope_hash) {
      diagnostics.push("expected_scope_hash_mismatch");
    }
    const receiptScope = input.receipt.scope;
    if (!Array.isArray(receiptScope) || stableHash(receiptScope) !== input.expected.scope_hash) {
      diagnostics.push("receipt_scope_hash_mismatch");
    }
  }
  if (!isRecord(input.artifacts)) {
    diagnostics.push("missing_activation_artifacts");
    return { ok: false, diagnostics };
  }
  const artifactHashes: Record<string, string> = {};
  for (const name of ARTIFACT_NAMES) {
    const artifact = input.artifacts[name];
    if (!isRecord(artifact)) {
      diagnostics.push(`missing_activation_artifact:${name}`);
      continue;
    }
    if (artifact.valid !== true) diagnostics.push(`invalid_activation_artifact:${name}`);
    if (!nonEmpty(artifact.hash)) diagnostics.push(`missing_artifact_hash:${name}`);
    else artifactHashes[name] = String(artifact.hash);
    if (input.expected) diagnostics.push(...compareIdentity(artifact, input.expected, `artifact:${name}`));
  }
  if (isRecord(input.receipt) && isRecord(input.receipt.artifact_hashes)) {
    for (const name of ARTIFACT_NAMES) {
      if (input.receipt.artifact_hashes[name] !== artifactHashes[name]) {
        diagnostics.push(`artifact_hash_mismatch:${name}`);
      }
    }
  } else {
    diagnostics.push("missing_receipt_artifact_hashes");
  }
  return {
    ok: diagnostics.length === 0,
    diagnostics: [...new Set(diagnostics)],
    ...(Object.keys(artifactHashes).length ? { artifact_hashes: artifactHashes } : {}),
  };
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: select depth before evaluating phase gates and fail closed on invalid evidence.
export function validateChecklistGate(input: {
  tracker: unknown;
  citdp: unknown;
  phase: GatePhase;
  activation?: {
    receipt?: unknown;
    artifacts?: unknown;
    expected?: ActivationExpectedIdentity;
  };
  requiredStepSlugs?: readonly string[];
  now?: Date;
}): ValidationResult & { allowed: boolean; blocking: boolean; depth?: AdversarialDepth } {
  const trackerResult = validateTracker(input);
  const section = adversarialSection(input.citdp);
  const depth = identityValue(section?.depth_tier) as AdversarialDepth | undefined;
  const adversarialResult = validateAdversarialContract(input);
  const diagnostics = [...trackerResult.diagnostics, ...adversarialResult.diagnostics];
  const allowed = trackerResult.ok && adversarialResult.ok;
  return { allowed, ok: allowed, blocking: !allowed, depth, diagnostics: [...new Set(diagnostics)] };
}
