import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import type { LifecyclePhase } from "./manifest.js";

export type ClarificationBlocking = "informational" | "req_authoring" | "arch_impl_authoring" | "red_tests";
export type ClarificationStatus = "open" | "resolved" | "stale" | "rejected";
export type ClarificationArtifact = "requirements" | "architecture" | "implementations" | "red_tests";
export type Clarification = {
  id: string;
  question: string;
  affected_scope: { phases: LifecyclePhase[]; artifacts: ClarificationArtifact[]; tokens: string[] };
  blocking: ClarificationBlocking;
  owner: string;
  priority: "P0" | "P1" | "P2" | "P3";
  status: ClarificationStatus;
  decision: string | null;
  resolved_at: string | null;
  evidence_references: string[];
  approval_references: string[];
  resolution_revision: number | null;
  delegates?: string[];
};
export type ClarificationSidecar = { schema_version: "clarifications.v1"; feature_id: string; revision: number; clarifications: Clarification[] };
export type ClarificationResult = { ok: true; sidecar: ClarificationSidecar } | { ok: false; error: string; diagnostics: string[] };

const phases = new Set<LifecyclePhase>(["draft", "refining", "specified", "planned", "tasked", "verifying", "closed", "abandoned"]);
const artifacts = new Set<ClarificationArtifact>(["requirements", "architecture", "implementations", "red_tests"]);
const blocking = new Set<ClarificationBlocking>(["informational", "req_authoring", "arch_impl_authoring", "red_tests"]);

// [IMPL-FEAT_CLARIFICATION_STORE] [ARCH-FEAT_CLARIFICATION_BOUNDARY] [REQ-FEAT_CLARIFICATION_RECORDS] — Normalize required fields and reject malformed canonical records before persistence.
export function normalizeClarificationSidecar(raw: unknown): ClarificationResult {
  if (!raw || typeof raw !== "object") return { ok: false, error: "INVALID_SCHEMA", diagnostics: ["Clarification sidecar must be an object"] };
  const candidate = raw as Partial<ClarificationSidecar>;
  if (candidate.schema_version !== "clarifications.v1" || typeof candidate.feature_id !== "string" || !Number.isInteger(candidate.revision) || (candidate.revision as number) < 0 || !Array.isArray(candidate.clarifications)) {
    return { ok: false, error: "INVALID_SCHEMA", diagnostics: ["Invalid clarification sidecar envelope"] };
  }
  const ids = new Set<string>();
  const normalized: Clarification[] = [];
  for (const value of candidate.clarifications) {
    if (!value || typeof value !== "object") return { ok: false, error: "INVALID_RECORD", diagnostics: ["Clarification record must be an object"] };
    const record = value as Clarification;
    if (!record.id || ids.has(record.id) || !record.question?.trim() || !record.owner?.trim() || !blocking.has(record.blocking) || !["P0", "P1", "P2", "P3"].includes(record.priority) || !["open", "resolved", "stale", "rejected"].includes(record.status)) {
      return { ok: false, error: "INVALID_RECORD", diagnostics: [`Invalid clarification record ${record.id ?? "<unknown>"}`] };
    }
    if (Object.prototype.hasOwnProperty.call(record, "marker")) return { ok: false, error: "INVALID_RECORD", diagnostics: ["[NEEDS_CLARIFICATION] is a view marker only"] };
    if (!record.affected_scope || !record.affected_scope.phases.every((phase) => phases.has(phase)) || !record.affected_scope.artifacts.every((item) => artifacts.has(item))) {
      return { ok: false, error: "INVALID_SCOPE", diagnostics: [`Invalid affected scope for ${record.id}`] };
    }
    if (!Array.isArray(record.affected_scope.tokens) || !Array.isArray(record.evidence_references) || !Array.isArray(record.approval_references)) {
      return { ok: false, error: "INVALID_RECORD", diagnostics: [`Invalid references for ${record.id}`] };
    }
    if (record.status === "resolved" && (!record.decision?.trim() || !record.resolved_at || !Number.isInteger(record.resolution_revision) || (record.affected_scope.artifacts.length > 0 && record.evidence_references.length + record.approval_references.length === 0))) {
      return { ok: false, error: "INVALID_RESOLUTION", diagnostics: [`Resolved clarification ${record.id} needs decision, timestamp, revision, and evidence`] };
    }
    ids.add(record.id);
    normalized.push({
      ...record,
      question: record.question.trim(),
      owner: record.owner.trim(),
      affected_scope: { phases: [...record.affected_scope.phases].sort(), artifacts: [...record.affected_scope.artifacts].sort(), tokens: [...record.affected_scope.tokens].sort() },
      evidence_references: [...record.evidence_references].sort(),
      approval_references: [...record.approval_references].sort(),
    });
  }
  normalized.sort((left, right) => left.id.localeCompare(right.id));
  return { ok: true, sidecar: { schema_version: "clarifications.v1", feature_id: candidate.feature_id, revision: candidate.revision as number, clarifications: normalized } };
}

// [IMPL-FEAT_CLARIFICATION_GATE] [ARCH-FEAT_CLARIFICATION_BOUNDARY] [REQ-FEAT_CLARIFICATION_GATES] — Require authorized ownership and durable evidence for resolution.
export function resolveClarification(record: Clarification, actor: string, revision: number, decision: string, evidence_references: string[], approval_references: string[]): { ok: true; record: Clarification } | { ok: false; error: "UNAUTHORIZED_RESOLUTION" | "MISSING_RESOLUTION_EVIDENCE" } {
  if (actor !== record.owner && !(record.delegates ?? []).includes(actor)) return { ok: false, error: "UNAUTHORIZED_RESOLUTION" };
  if (!decision.trim() || (record.affected_scope.artifacts.length > 0 && evidence_references.length + approval_references.length === 0)) return { ok: false, error: "MISSING_RESOLUTION_EVIDENCE" };
  return { ok: true, record: { ...record, status: "resolved", decision: decision.trim(), resolved_at: new Date().toISOString(), resolution_revision: revision, evidence_references: [...evidence_references].sort(), approval_references: [...approval_references].sort() } };
}

// [IMPL-FEAT_CLARIFICATION_GATE] [ARCH-FEAT_CLARIFICATION_BOUNDARY] [REQ-FEAT_CLARIFICATION_GATES] — Classify informational and phase-blocking uncertainty without mutation.
export function evaluateClarificationGate(featureRevision: number, sidecar: ClarificationSidecar, phase: LifecyclePhase, requestedArtifacts: ClarificationArtifact[]): { ready: boolean; blockers: Clarification[]; diagnostics: string[] } {
  if (!phases.has(phase) || requestedArtifacts.some((item) => !artifacts.has(item))) throw new Error("INVALID_SCOPE");
  const requested = new Set(requestedArtifacts);
  const blockers = sidecar.clarifications.flatMap((record) => {
    const relevant = record.affected_scope.phases.includes(phase) && record.affected_scope.artifacts.some((item) => requested.has(item));
    const stale = record.status === "resolved" && (record.resolution_revision ?? 0) < featureRevision && relevant;
    const effective = stale ? { ...record, status: "stale" as const } : record;
    return relevant && effective.blocking !== "informational" && (effective.status === "open" || effective.status === "stale") ? [effective] : [];
  }).sort((left, right) => `${left.affected_scope.phases[0]}:${left.id}:${left.blocking}`.localeCompare(`${right.affected_scope.phases[0]}:${right.id}:${right.blocking}`));
  return { ready: blockers.length === 0, blockers, diagnostics: blockers.map((record) => `Clarification ${record.id} blocks ${phase} (${record.blocking})`) };
}

export class ClarificationStore {
  readonly root: string;
  constructor(root: string) { this.root = path.resolve(root); fs.mkdirSync(this.root, { recursive: true }); }
  private resolve(directory: string): string {
    const resolved = path.resolve(this.root, directory);
    if (path.isAbsolute(directory) || !resolved.startsWith(`${this.root}${path.sep}`)) throw new Error("INVALID_PATH");
    return resolved;
  }
  read(directory: string): ClarificationSidecar {
    const parsed = yaml.load(fs.readFileSync(path.join(this.resolve(directory), "clarifications.yaml"), "utf8"));
    const result = normalizeClarificationSidecar(parsed);
    if (!result.ok) throw new Error("READ_FAILED");
    const expectedFeatureId = directory.split(path.sep).at(-1)?.split("-").slice(0, 2).join("-");
    if (expectedFeatureId && result.sidecar.feature_id !== expectedFeatureId) throw new Error("READ_FAILED");
    return result.sidecar;
  }
  // [IMPL-FEAT_CLARIFICATION_STORE] [ARCH-FEAT_CLARIFICATION_BOUNDARY] [REQ-FEAT_CLARIFICATION_RECORDS] — Publish a validated sidecar atomically and revision-safely.
  publish(directory: string, candidate: ClarificationSidecar, expectedRevision: number): ClarificationSidecar {
    const target = this.resolve(directory);
    const currentPath = path.join(target, "clarifications.yaml");
    const current = fs.existsSync(currentPath) ? this.read(directory) : { revision: 0 };
    if (current.revision !== expectedRevision) throw new Error("STALE_REVISION");
    const result = normalizeClarificationSidecar({ ...candidate, revision: expectedRevision + 1 });
    if (!result.ok) throw new Error(result.error);
    fs.mkdirSync(target, { recursive: true });
    const temporary = `${currentPath}.${process.pid}.tmp`;
    fs.writeFileSync(temporary, yaml.dump(result.sidecar, { sortKeys: true, lineWidth: -1 }), "utf8");
    fs.renameSync(temporary, currentPath);
    return result.sidecar;
  }
}
