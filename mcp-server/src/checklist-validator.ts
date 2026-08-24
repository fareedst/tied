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
const PLACEHOLDER_WAIVER_VALUES = new Set(["~"]);
const SUB_ADVERSARIAL_STUB_SLUG = "sub-adversarial-inquiry-pass";
export const MINIMAL_DEPTH_MISSING_WAIVER = "minimal_depth_missing_waiver";

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: minimal depth always governs the sub-adversarial stub slug.
export const MINIMAL_SUB_STUB_SLUGS = [SUB_ADVERSARIAL_STUB_SLUG] as const;

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: derive auto-required Tracker slugs from depth and gate phase.
export const INTEGRATED_REQUIRED_SLUGS: Record<GatePhase, readonly string[]> = {
  pre_implementation: ["risk-assessment", "sub-adversarial-inquiry-pass", "gate-pseudocode-validation"],
  verification: ["risk-assessment", "sub-adversarial-inquiry-pass", "verification-gate"],
  close_out: ["risk-assessment", "sub-adversarial-inquiry-pass", "verification-gate", "traceable-commit"],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmpty(value: unknown): boolean {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: reject placeholder waiver values so close_out cannot bypass pairing with tilde or empty fields.
function waiverFieldPresent(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 && !PLACEHOLDER_WAIVER_VALUES.has(trimmed);
  }
  return false;
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

function adversarialSection(citdp: unknown): Record<string, unknown> | undefined {
  if (!isRecord(citdp)) return undefined;
  if (isRecord(citdp.adversarial_inquiry)) return citdp.adversarial_inquiry;
  const risk = isRecord(citdp.risk_analysis) ? citdp.risk_analysis : undefined;
  if (risk && isRecord(risk.adversarial_inquiry)) return risk.adversarial_inquiry;
  return undefined;
}

function completionCriteria(citdp: unknown): Record<string, unknown> | undefined {
  if (!isRecord(citdp)) return undefined;
  return isRecord(citdp.completion_criteria) ? citdp.completion_criteria : undefined;
}

function identityValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function hasDepthChangeWaiver(section: Record<string, unknown>): boolean {
  for (const key of ["integrated_waiver", "depth_change_waiver"] as const) {
    const waiver = section[key];
    if (!isRecord(waiver)) continue;
    if (
      waiverFieldPresent(waiver.owner)
      && waiverFieldPresent(waiver.expiry)
      && waiverFieldPresent(waiver.rationale)
      && waiverFieldPresent(waiver.approval)
    ) {
      return true;
    }
  }
  return false;
}

function hasCompleteIntegratedWaiver(section: Record<string, unknown>): boolean {
  const waiver = section.integrated_waiver;
  if (!isRecord(waiver)) return false;
  return waiverFieldPresent(waiver.owner)
    && waiverFieldPresent(waiver.expiry)
    && waiverFieldPresent(waiver.rationale)
    && waiverFieldPresent(waiver.approval);
}

function eligibilityTriggersMatched(citdp: unknown): string[] {
  if (!isRecord(citdp)) return [];
  const risk = isRecord(citdp.risk_analysis) ? citdp.risk_analysis : undefined;
  const section = adversarialSection(citdp);
  const raw = section?.eligibility_triggers_matched ?? risk?.eligibility_triggers_matched;
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function hasValidCloseOutInquiryWaiver(section: Record<string, unknown>): boolean {
  const waiver = section.close_out_inquiry_waiver;
  if (!isRecord(waiver)) return false;
  return waiverFieldPresent(waiver.owner)
    && waiverFieldPresent(waiver.expiry)
    && waiverFieldPresent(waiver.rationale)
    && waiverFieldPresent(waiver.approval)
    && waiverFieldPresent(waiver.referenced_verification_run_id);
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: derive auto-required Tracker slugs from depth and gate phase; caller slugs union only.
export function derivePhaseAwareSlugs(
  depth: AdversarialDepth,
  phase: GatePhase,
): readonly string[] {
  if (depth === "minimal") return MINIMAL_SUB_STUB_SLUGS;
  if (depth === "integrated") return INTEGRATED_REQUIRED_SLUGS[phase];
  if (depth === "strict_candidate" && (phase === "verification" || phase === "close_out")) {
    return INTEGRATED_REQUIRED_SLUGS[phase];
  }
  return [];
}

export function requiresIntegratedPairing(depth: AdversarialDepth, phase: GatePhase): boolean {
  if (depth === "integrated") return true;
  if (depth === "strict_candidate" && (phase === "verification" || phase === "close_out")) return true;
  return false;
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: reject silent downgrade from integrated or strict_candidate to minimal without waiver.
export function validateDepthDowngrade(input: {
  citdp: unknown;
  priorDepthTier?: AdversarialDepth | null;
}): ValidationResult {
  const section = adversarialSection(input.citdp);
  const currentDepth = identityValue(section?.depth_tier) as AdversarialDepth | undefined;
  const priorDepth = input.priorDepthTier ?? identityValue(section?.prior_depth_tier) as AdversarialDepth | undefined;
  if (!priorDepth || priorDepth === "minimal") return { ok: true, diagnostics: [] };
  if (priorDepth !== "integrated" && priorDepth !== "strict_candidate") return { ok: true, diagnostics: [] };
  if (currentDepth !== "minimal") return { ok: true, diagnostics: [] };
  if (section && hasDepthChangeWaiver(section)) return { ok: true, diagnostics: [] };
  return { ok: false, diagnostics: ["depth_downgrade_requires_waiver"] };
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: emit warn-only minimal_depth_missing_waiver when §7 eligibility triggers match, depth_tier is minimal, and integrated_waiver is incomplete.
export function validateMinimalWaiver(input: {
  citdp: unknown;
}): ValidationResult {
  const section = adversarialSection(input.citdp);
  if (!section) return { ok: true, diagnostics: [] };
  const depth = identityValue(section.depth_tier);
  if (depth !== "minimal") return { ok: true, diagnostics: [] };
  if (eligibilityTriggersMatched(input.citdp).length === 0) return { ok: true, diagnostics: [] };
  if (hasCompleteIntegratedWaiver(section)) return { ok: true, diagnostics: [] };
  return { ok: false, diagnostics: [MINIMAL_DEPTH_MISSING_WAIVER] };
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: require completion_criteria.activation on gate read at late integrated phases.
export function validateCompletionActivation(input: {
  citdp: unknown;
  phase: GatePhase;
  depth: AdversarialDepth;
}): ValidationResult {
  if (input.phase !== "verification" && input.phase !== "close_out") {
    return { ok: true, diagnostics: [] };
  }
  if (input.depth !== "integrated" && !(input.depth === "strict_candidate")) {
    return { ok: true, diagnostics: [] };
  }
  const criteria = completionCriteria(input.citdp);
  const activation = criteria && isRecord(criteria.activation) ? criteria.activation : undefined;
  if (activation && nonEmpty(activation.run_id)) return { ok: true, diagnostics: [] };
  return { ok: false, diagnostics: ["missing_completion_activation"] };
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: bind each inquiry receipt to exactly one gate phase.
export function validateReceiptPhase(input: {
  receipt: unknown;
  gatePhase: GatePhase;
}): ValidationResult {
  if (!isRecord(input.receipt)) return { ok: true, diagnostics: [] };
  const receiptPhase = identityValue(input.receipt.phase);
  if (!receiptPhase || receiptPhase === input.gatePhase) return { ok: true, diagnostics: [] };
  return { ok: false, diagnostics: ["receipt_identity_mismatch:phase"] };
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

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: at integrated depth a completed parent slug cannot coexist with a pending sub-adversarial-inquiry-pass.
export function validateIntegratedParentChildSlugs(input: {
  tracker: unknown;
  phase: GatePhase;
  depth: AdversarialDepth;
}): ValidationResult {
  if (input.depth !== "integrated" && input.depth !== "strict_candidate") {
    return { ok: true, diagnostics: [] };
  }
  const steps = trackerSteps(input.tracker);
  const bySlug = new Map(
    steps.map((step) => [getString(step, "slug", "id") ?? "unknown", step]),
  );
  const subStep = bySlug.get(SUB_ADVERSARIAL_STUB_SLUG);
  if (!subStep || disposition(subStep) !== "pending") {
    return { ok: true, diagnostics: [] };
  }
  const parentSlugs = derivePhaseAwareSlugs(input.depth, input.phase).filter(
    (slug) => slug !== SUB_ADVERSARIAL_STUB_SLUG,
  );
  for (const slug of parentSlugs) {
    const step = bySlug.get(slug);
    if (step && disposition(step) === "completed") {
      return { ok: false, diagnostics: ["sub_stub_pending_while_parent_completed"] };
    }
  }
  return { ok: true, diagnostics: [] };
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

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: phase directories are authoritative pairing locations; root projection never satisfies pairing.
export function expectedPhaseArtifactPathPrefix(requestToken: string, phase: GatePhase): string {
  return `working/${requestToken}/adversarial-inquiry/phase-${phase}/`;
}

function validateArtifactPath(
  pathValue: unknown,
  expected: ActivationExpectedIdentity,
  label: string,
): string[] {
  if (pathValue === undefined || pathValue === null || pathValue === "") return [];
  if (typeof pathValue !== "string" || !nonEmpty(pathValue)) {
    return [`invalid_artifact_path:${label}`];
  }
  const normalized = pathValue.replace(/\\/g, "/");
  const inquiryPrefix = `working/${expected.request_token}/adversarial-inquiry/`;
  if (!normalized.includes(inquiryPrefix)) {
    return [`artifact_path_out_of_scope:${label}`];
  }
  const suffix = normalized.slice(normalized.indexOf(inquiryPrefix) + inquiryPrefix.length);
  if (suffix.startsWith(`phase-${expected.phase}/`)) return [];
  if (!suffix.startsWith("phase-")) {
    return [`artifact_path_root_projection_rejected:${label}`];
  }
  return [`artifact_path_wrong_phase:${label}`];
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: derive activation.expected from a complete receipt when the caller omits expected; never infer missing receipt fields.
export function deriveExpectedFromReceipt(receipt: unknown): ActivationExpectedIdentity | undefined {
  if (!isRecord(receipt)) return undefined;
  const request_token = identityValue(receipt.request_token);
  const project_id = identityValue(receipt.project_id);
  const run_id = identityValue(receipt.run_id);
  const phaseRaw = identityValue(receipt.phase);
  const scope_hash = identityValue(receipt.scope_hash);
  if (!request_token || !project_id || !run_id || !phaseRaw || !scope_hash) return undefined;
  if (!PHASES.has(phaseRaw as GatePhase)) return undefined;
  const scope = receipt.scope;
  if (!Array.isArray(scope) || !scope.every((item) => typeof item === "string")) return undefined;
  if (stableHash(scope) !== scope_hash) return undefined;
  return {
    request_token,
    project_id,
    run_id,
    phase: phaseRaw as GatePhase,
    scope,
    scope_hash,
  };
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: pair inquiry receipt with four bounded artifacts.
export function validateActivationPairing(input: {
  receipt: unknown;
  artifacts: unknown;
  expected?: ActivationExpectedIdentity;
}): ActivationPairingResult {
  const diagnostics: string[] = [];
  const expected = input.expected ?? deriveExpectedFromReceipt(input.receipt);
  if (!isRecord(input.receipt) || input.receipt.success !== true) {
    diagnostics.push("missing_or_unsuccessful_inquiry_receipt");
  }
  if (isRecord(input.receipt) && input.receipt.tool !== "tied_adversarial_inquiry_run") {
    diagnostics.push("invalid_inquiry_tool");
  }
  if (!expected) diagnostics.push("missing_expected_identity");
  if (expected && isRecord(input.receipt)) {
    diagnostics.push(...compareIdentity(input.receipt, expected, "receipt"));
    if (stableHash(expected.scope) !== expected.scope_hash) {
      diagnostics.push("expected_scope_hash_mismatch");
    }
    const receiptScope = input.receipt.scope;
    if (!Array.isArray(receiptScope) || stableHash(receiptScope) !== expected.scope_hash) {
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
    if (expected) {
      diagnostics.push(...compareIdentity(artifact, expected, `artifact:${name}`));
      diagnostics.push(...validateArtifactPath(artifact.path, expected, name));
    }
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

function extractActivationFromCitdp(citdp: unknown): unknown {
  if (!isRecord(citdp)) return undefined;
  if (citdp.activation !== undefined) return citdp.activation;
  const criteria = completionCriteria(citdp);
  if (criteria && criteria.activation !== undefined) return criteria.activation;
  return undefined;
}

function activationSupplied(activation: unknown): boolean {
  if (activation === undefined || activation === null) return false;
  if (!isRecord(activation)) return true;
  return activation.receipt !== undefined
    || activation.artifacts !== undefined
    || activation.expected !== undefined;
}

function requiresMinimalOpenRecordFields(depth: AdversarialDepth): boolean {
  return depth === "minimal" || depth === "strict_candidate";
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: require prior_depth_tier minimal when upgrading an on-disk minimal record to integrated.
export function validateCitdpDepthUpgrade(input: {
  citdp: unknown;
  existingDepthTier?: AdversarialDepth | null;
}): ValidationResult {
  const section = adversarialSection(input.citdp);
  const currentDepth = identityValue(section?.depth_tier) as AdversarialDepth | undefined;
  const priorDepth = identityValue(section?.prior_depth_tier) as AdversarialDepth | undefined;
  if (currentDepth !== "integrated") return { ok: true, diagnostics: [] };
  if (input.existingDepthTier !== "minimal") return { ok: true, diagnostics: [] };
  if (priorDepth === "minimal") return { ok: true, diagnostics: [] };
  return { ok: false, diagnostics: ["depth_upgrade_requires_prior_depth_tier:minimal"] };
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: validate adversarial section shape for CITDP persistence without progression pairing.
export function validateCitdpOpenRecord(input: {
  citdp: unknown;
  activation?: unknown;
  existingDepthTier?: AdversarialDepth | null;
}): ValidationResult {
  const diagnostics: string[] = [];
  const section = adversarialSection(input.citdp);
  if (!section) {
    diagnostics.push("malformed_citdp:adversarial_inquiry");
    return { ok: false, diagnostics };
  }
  const depth = identityValue(section.depth_tier) as AdversarialDepth | undefined;
  if (!depth || !["minimal", "integrated", "strict_candidate"].includes(depth)) {
    diagnostics.push("missing_or_invalid_depth");
    return { ok: false, diagnostics };
  }
  if (requiresMinimalOpenRecordFields(depth)) {
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
  diagnostics.push(...validateCitdpDepthUpgrade({
    citdp: input.citdp,
    existingDepthTier: input.existingDepthTier,
  }).diagnostics);
  diagnostics.push(...validateDepthDowngrade({ citdp: input.citdp }).diagnostics);

  const activation = input.activation ?? extractActivationFromCitdp(input.citdp);
  if (!activationSupplied(activation)) {
    return { ok: diagnostics.length === 0, diagnostics: [...new Set(diagnostics)] };
  }
  if (!isRecord(activation)) {
    diagnostics.push("malformed_activation");
    return { ok: false, diagnostics: [...new Set(diagnostics)] };
  }
  const hasReceipt = activation.receipt !== undefined;
  const hasArtifacts = activation.artifacts !== undefined;
  const hasExpected = activation.expected !== undefined;
  if (hasReceipt !== hasArtifacts) {
    diagnostics.push("partial_activation:receipt_artifacts_mismatch");
  } else if (hasReceipt && hasArtifacts) {
    const pairing = validateActivationPairing({
      receipt: activation.receipt,
      artifacts: activation.artifacts,
      expected: hasExpected
        ? activation.expected as ActivationExpectedIdentity
        : deriveExpectedFromReceipt(activation.receipt),
    });
    diagnostics.push(...pairing.diagnostics);
  } else if (hasExpected) {
    diagnostics.push("partial_activation:expected_without_receipt");
  }
  return { ok: diagnostics.length === 0, diagnostics: [...new Set(diagnostics)] };
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: enforce depth-specific adversarial obligations before progression.
export function validateAdversarialContract(input: {
  citdp: unknown;
  phase: GatePhase;
  depth?: AdversarialDepth;
  requiresPairing?: boolean;
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
  const depth = input.depth ?? identityValue(section.depth_tier) as AdversarialDepth | undefined;
  if (!depth || !["minimal", "integrated", "strict_candidate"].includes(depth)) {
    diagnostics.push("missing_or_invalid_depth");
    return { ok: false, diagnostics };
  }
  if (depth === "minimal" || (depth === "strict_candidate" && input.phase === "pre_implementation")) {
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
  const pairingRequired = input.requiresPairing ?? requiresIntegratedPairing(depth, input.phase);
  const normalizedActivation = input.activation
    ? {
        ...input.activation,
        expected: input.activation.expected
          ?? deriveExpectedFromReceipt(input.activation.receipt),
      }
    : undefined;
  if (pairingRequired && normalizedActivation) {
    const pairing = validateActivationPairing({
      receipt: normalizedActivation.receipt,
      artifacts: normalizedActivation.artifacts,
      expected: normalizedActivation.expected,
    });
    diagnostics.push(...pairing.diagnostics);
  }
  return { ok: diagnostics.length === 0, diagnostics };
}

const PROVENANCE_IDENTITY_FIELDS = [
  "request_token",
  "phase",
  "run_id",
  "command",
  "tool_version",
] as const;

function readProvenanceEnvelope(provenance: unknown): Record<string, unknown> | undefined {
  if (!isRecord(provenance)) return undefined;
  if (isRecord(provenance.provenance)) return provenance.provenance;
  return provenance;
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: reject sparse Tracker missing phase-aware slug dispositions.
export function validateTrackerSparse(input: {
  tracker: unknown;
  requiredStepSlugs: readonly string[];
  depth: AdversarialDepth;
}): ValidationResult {
  if (input.depth !== "integrated" && input.depth !== "strict_candidate") {
    return { ok: true, diagnostics: [] };
  }
  const steps = trackerSteps(input.tracker);
  const seen = new Set(
    steps.map((step) => getString(step, "slug", "id")).filter(Boolean) as string[],
  );
  const missing = input.requiredStepSlugs.filter((slug) => !seen.has(slug));
  const sparseExecutionEvidence = isRecord(input.tracker)
    && isRecord(input.tracker.execution_evidence)
    && Array.isArray(input.tracker.execution_evidence.completed)
    && missing.length > 0;
  if (missing.length >= 2 || sparseExecutionEvidence) {
    return { ok: false, diagnostics: ["tracker_sparse"] };
  }
  if (missing.length === 1) {
    return { ok: false, diagnostics: [`missing_required_step:${missing[0]}`] };
  }
  return { ok: true, diagnostics: [] };
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: reject synthetic Tracker projections substituted for authoritative file.
export function validateTrackerAuthoritative(input: {
  tracker: unknown;
  trackerSource?: "authoritative_file" | "synthetic_projection";
}): ValidationResult {
  if (input.trackerSource === "synthetic_projection") {
    return { ok: false, diagnostics: ["tracker_not_authoritative"] };
  }
  if (isRecord(input.tracker) && input.tracker._synthetic_projection === true) {
    return { ok: false, diagnostics: ["tracker_not_authoritative"] };
  }
  return { ok: true, diagnostics: [] };
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: require complete evidence provenance identity and command retention.
export function validateProvenanceComplete(provenance: unknown): ValidationResult {
  const envelope = readProvenanceEnvelope(provenance);
  if (!envelope) {
    return { ok: false, diagnostics: ["provenance_incomplete"] };
  }
  const diagnostics: string[] = [];
  for (const field of PROVENANCE_IDENTITY_FIELDS) {
    const camel = field.replace(/_([a-z])/g, (_, ch: string) => ch.toUpperCase());
    const value = envelope[field] ?? envelope[camel];
    if (!nonEmpty(value)) diagnostics.push(`provenance_incomplete:${field}`);
  }
  const schemaVersion = envelope.schemaVersion ?? envelope.schema_version;
  if (!nonEmpty(schemaVersion)) diagnostics.push("provenance_incomplete:schema_version");
  if (diagnostics.length > 0) {
    return { ok: false, diagnostics: ["provenance_incomplete", ...diagnostics] };
  }
  return { ok: true, diagnostics: [] };
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: unresolved or warn findings cannot satisfy gate success.
export function validateFindingDisposition(input: {
  gateResult?: unknown;
  findingLedger?: unknown;
  gatePolicy?: string;
}): ValidationResult {
  const diagnostics: string[] = [];
  if (isRecord(input.gateResult)) {
    const verdict = identityValue(input.gateResult.verdict);
    const status = identityValue(input.gateResult.status);
    if (verdict === "UNRESOLVED") diagnostics.push("finding_unresolved");
    if (status === "warn") diagnostics.push("warn_not_success");
  }
  if (typeof input.findingLedger === "string") {
    for (const line of input.findingLedger.split("\n").filter(Boolean)) {
      try {
        const record = JSON.parse(line) as Record<string, unknown>;
        const finding = isRecord(record.finding) ? record.finding : record;
        if (identityValue(finding.lifecycle) === "observed") {
          diagnostics.push("finding_unresolved");
          break;
        }
      } catch {
        diagnostics.push("finding_unresolved");
        break;
      }
    }
  }
  return { ok: diagnostics.length === 0, diagnostics: [...new Set(diagnostics)] };
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: reject self-reported command success without retained output/manifest.
export function validateCommandEvidence(evidence: unknown): ValidationResult {
  if (!isRecord(evidence)) return { ok: true, diagnostics: [] };
  if (evidence.claimed_success !== true) return { ok: true, diagnostics: [] };
  const hasManifest = nonEmpty(evidence.manifest_ref) || nonEmpty(evidence.manifest_reference);
  const hasOutput = nonEmpty(evidence.stdout_ref)
    || nonEmpty(evidence.stderr_ref)
    || nonEmpty(evidence.output_path);
  const hasExitCode = evidence.exit_code !== undefined && evidence.exit_code !== null;
  if (!hasManifest || !hasOutput || !hasExitCode) {
    return { ok: false, diagnostics: ["command_success_unproven"] };
  }
  return { ok: true, diagnostics: [] };
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: reject stale or hash-mismatched activation evidence.
export function validateEvidenceFreshness(input: {
  declaredHashes?: Record<string, string>;
  computedHashes?: Record<string, string>;
  crossPhaseReuse?: boolean;
}): ValidationResult {
  const diagnostics: string[] = [];
  if (input.crossPhaseReuse) diagnostics.push("evidence_stale");
  const declared = input.declaredHashes ?? {};
  const computed = input.computedHashes ?? {};
  for (const [name, hash] of Object.entries(declared)) {
    if (computed[name] && computed[name] !== hash) diagnostics.push(`artifact_hash_mismatch:${name}`);
  }
  if (diagnostics.some((item) => item.startsWith("artifact_hash_mismatch:"))) {
    diagnostics.push("evidence_stale");
  }
  return { ok: diagnostics.length === 0, diagnostics: [...new Set(diagnostics)] };
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: reject dirty or untracked post-gate tree at close_out.
export function validateCloseOutTree(input: {
  dirtyPaths?: readonly string[];
  untrackedPaths?: readonly string[];
}): ValidationResult {
  if ((input.dirtyPaths?.length ?? 0) > 0 || (input.untrackedPaths?.length ?? 0) > 0) {
    return { ok: false, diagnostics: ["tree_dirty_post_gate"] };
  }
  return { ok: true, diagnostics: [] };
}

function waiverDiagnosticsInvalid(section: Record<string, unknown> | undefined): string[] {
  if (!section) return [];
  for (const key of ["integrated_waiver", "depth_change_waiver", "close_out_inquiry_waiver"] as const) {
    const waiver = section[key];
    if (!isRecord(waiver)) continue;
    for (const field of Object.values(waiver)) {
      if (field === null || field === undefined) continue;
      if (typeof field === "string" && (field.trim() === "" || PLACEHOLDER_WAIVER_VALUES.has(field.trim()))) {
        return ["waiver_invalid"];
      }
    }
  }
  return [];
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: emit stable remediation diagnostics alongside granular codes.
export function normalizeRemediationDiagnostics(diagnostics: readonly string[]): string[] {
  const out = new Set(diagnostics);
  if (diagnostics.some((item) => item.startsWith("missing_required_step:"))
    && diagnostics.filter((item) => item.startsWith("missing_required_step:")).length >= 2) {
    out.add("tracker_sparse");
  }
  if (diagnostics.includes("tracker_sparse")) out.add("tracker_sparse");
  if (diagnostics.includes("integrated_depth_requires_pairing")
    || diagnostics.some((item) => item.startsWith("partial_activation"))) {
    out.add("activation_pairing_incomplete");
  }
  if (diagnostics.includes("pending_required_step:sub-adversarial-inquiry-pass")) {
    out.add("sub_stub_pending");
  }
  if (diagnostics.includes("sub_stub_pending_while_parent_completed")) {
    out.add("parent_child_inconsistent");
  }
  if (diagnostics.some((item) => item.startsWith("artifact_hash_mismatch:")
    || item.startsWith("receipt_identity_mismatch"))) {
    out.add("evidence_stale");
  }
  if (diagnostics.some((item) => item.startsWith("artifact_path_root_projection_rejected:"))) {
    out.add("tracker_not_authoritative");
  }
  if (diagnostics.includes("depth_downgrade_requires_waiver")
    && diagnostics.some((item) => item.includes("~"))) {
    out.add("waiver_invalid");
  }
  return [...out];
}

export type ChecklistGateEvidenceInput = {
  trackerSource?: "authoritative_file" | "synthetic_projection";
  provenance?: unknown;
  gateResult?: unknown;
  findingLedger?: unknown;
  commandEvidence?: unknown;
  declaredArtifactHashes?: Record<string, string>;
  computedArtifactHashes?: Record<string, string>;
  crossPhaseReuse?: boolean;
  dirtyPaths?: readonly string[];
  untrackedPaths?: readonly string[];
};

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
  priorDepthTier?: AdversarialDepth | null;
  now?: Date;
  evidence?: ChecklistGateEvidenceInput;
}): ValidationResult & { allowed: boolean; blocking: boolean; depth?: AdversarialDepth } {
  const section = adversarialSection(input.citdp);
  const depth = identityValue(section?.depth_tier) as AdversarialDepth | undefined;
  const diagnostics: string[] = [];

  if (!depth) {
    const adversarialResult = validateAdversarialContract({ citdp: input.citdp, phase: input.phase });
    diagnostics.push(...adversarialResult.diagnostics);
    return {
      allowed: false,
      ok: false,
      blocking: true,
      depth,
      diagnostics: [...new Set(diagnostics)],
    };
  }

  const autoSlugs = derivePhaseAwareSlugs(depth, input.phase);
  const requiredSlugs = [...new Set([...autoSlugs, ...(input.requiredStepSlugs ?? [])])];
  const normalizedActivation = input.activation
    ? {
        ...input.activation,
        expected: input.activation.expected
          ?? deriveExpectedFromReceipt(input.activation.receipt),
      }
    : undefined;

  const downgradeResult = validateDepthDowngrade({
    citdp: input.citdp,
    priorDepthTier: input.priorDepthTier,
  });
  diagnostics.push(...downgradeResult.diagnostics);

  const completionResult = validateCompletionActivation({
    citdp: input.citdp,
    phase: input.phase,
    depth,
  });
  diagnostics.push(...completionResult.diagnostics);

  const receiptPhaseResult = validateReceiptPhase({
    receipt: normalizedActivation?.receipt,
    gatePhase: input.phase,
  });
  diagnostics.push(...receiptPhaseResult.diagnostics);

  diagnostics.push(...validateTrackerAuthoritative({
    tracker: input.tracker,
    trackerSource: input.evidence?.trackerSource,
  }).diagnostics);

  const sparseResult = validateTrackerSparse({
    tracker: input.tracker,
    requiredStepSlugs: requiredSlugs,
    depth,
  });
  diagnostics.push(...sparseResult.diagnostics);

  const trackerResult = validateTracker({
    tracker: input.tracker,
    phase: input.phase,
    requiredStepSlugs: requiredSlugs,
    now: input.now,
  });
  diagnostics.push(...trackerResult.diagnostics);

  if (input.evidence?.provenance !== undefined) {
    diagnostics.push(...validateProvenanceComplete(input.evidence.provenance).diagnostics);
  }
  if (input.evidence?.gateResult !== undefined || input.evidence?.findingLedger !== undefined) {
    diagnostics.push(...validateFindingDisposition({
      gateResult: input.evidence.gateResult,
      findingLedger: input.evidence.findingLedger,
      gatePolicy: identityValue(section?.gate_policy),
    }).diagnostics);
  }
  if (input.evidence?.commandEvidence !== undefined) {
    diagnostics.push(...validateCommandEvidence(input.evidence.commandEvidence).diagnostics);
  }
  if (input.evidence?.declaredArtifactHashes
    || input.evidence?.computedArtifactHashes
    || input.evidence?.crossPhaseReuse) {
    diagnostics.push(...validateEvidenceFreshness({
      declaredHashes: input.evidence.declaredArtifactHashes,
      computedHashes: input.evidence.computedArtifactHashes,
      crossPhaseReuse: input.evidence.crossPhaseReuse,
    }).diagnostics);
  }
  if (input.phase === "close_out" && (input.evidence?.dirtyPaths || input.evidence?.untrackedPaths)) {
    diagnostics.push(...validateCloseOutTree({
      dirtyPaths: input.evidence.dirtyPaths,
      untrackedPaths: input.evidence.untrackedPaths,
    }).diagnostics);
  }
  diagnostics.push(...waiverDiagnosticsInvalid(section));

  const parentChildResult = validateIntegratedParentChildSlugs({
    tracker: input.tracker,
    phase: input.phase,
    depth,
  });
  diagnostics.push(...parentChildResult.diagnostics);

  const pairingRequired = requiresIntegratedPairing(depth, input.phase);
  const closeOutWaiverApplies = input.phase === "close_out"
    && section !== undefined
    && hasValidCloseOutInquiryWaiver(section);

  if (pairingRequired && !closeOutWaiverApplies && !normalizedActivation) {
    diagnostics.push("integrated_depth_requires_pairing");
  }

  const adversarialResult = validateAdversarialContract({
    citdp: input.citdp,
    phase: input.phase,
    depth,
    requiresPairing: pairingRequired && !closeOutWaiverApplies && Boolean(normalizedActivation),
    activation: normalizedActivation,
  });
  diagnostics.push(...adversarialResult.diagnostics);

  const minimalWaiverResult = validateMinimalWaiver({ citdp: input.citdp });
  const blockingDiagnostics = normalizeRemediationDiagnostics([...new Set(diagnostics)]);
  const advisoryDiagnostics = minimalWaiverResult.diagnostics.filter(
    (code) => code === MINIMAL_DEPTH_MISSING_WAIVER,
  );
  const uniqueDiagnostics = [...new Set([...blockingDiagnostics, ...advisoryDiagnostics])];
  const allowed = blockingDiagnostics.length === 0;
  return { allowed, ok: allowed, blocking: !allowed, depth, diagnostics: uniqueDiagnostics };
}
