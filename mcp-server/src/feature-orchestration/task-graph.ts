import crypto from "node:crypto";

export type TaskStatus = "pending" | "ready" | "running" | "passed" | "failed" | "cancelled" | "timed_out" | "stale";
export type TestLevel = "unit" | "integration" | "composition" | "e2e";
export type DeliverableKind = "module" | "test" | "composition" | "e2e" | "validation";

export interface TaskDeliverable {
  id: string;
  kind: DeliverableKind;
  path_or_contract: string;
  mutable?: boolean;
}

export interface EvidenceRequirement {
  id: string;
  profile: string;
  description: string;
  required: boolean;
}

export interface EvidenceRecord {
  attempt: number;
  outcome: TaskStatus;
  provenance: string;
  ordering_key: string;
  recorded_at: string;
}

export interface TaskEntry {
  task_id: string;
  source_tokens: string[];
  depends_on: string[];
  deliverables: TaskDeliverable[];
  test_level: TestLevel;
  parallel_group: string | null;
  status: TaskStatus;
  evidence: { required: EvidenceRequirement[]; history: EvidenceRecord[] };
  source_revision: string;
}

export interface TaskGraphProjection {
  schema_version: "task-graph.v1";
  source_revision: string;
  tasks: TaskEntry[];
}

export type DerivationError =
  | "INVALID_SOURCE_REFERENCE"
  | "BLOCKED_READINESS"
  | "INVALID_CONTRACT"
  | "IDENTITY_COLLISION";

export interface DerivationSource {
  source_revision: string;
  requirements?: Array<{ token: string; acceptance_criteria?: Array<{ id?: string; text: string; deliverables?: TaskDeliverable[]; depends_on?: string[] }> }>;
  architectures?: Array<{ token: string; boundaries?: Array<{ id?: string; contract?: string; mutable_deliverables?: string[] }> }>;
  implementations?: Array<{ token: string; blocks?: Array<{ name: string; test_level?: TestLevel; contract?: string; depends_on?: string[] }> }>;
  clarification_ready?: boolean;
  constitution_compliant?: boolean;
  quality_profiles?: string[];
}

export type DerivationResult =
  | { ok: true; projection: TaskGraphProjection }
  | { ok: false; error: DerivationError; diagnostics: string[] };

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${stable(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function identity(sourceTokens: string[], role: string): string {
  const digest = crypto.createHash("sha256").update(`${[...sourceTokens].sort().join("|")}|${role}`).digest("hex").slice(0, 12).toUpperCase();
  return `TASK-${digest}`;
}

function profileEvidence(profiles: string[]): EvidenceRequirement[] {
  return [...new Set(profiles)].sort().map((profile) => ({
    id: `quality:${profile}`,
    profile,
    description: `Evidence required by ${profile}`,
    required: true,
  }));
}

function validateSource(source: DerivationSource): string[] {
  const diagnostics: string[] = [];
  if (!source.source_revision.trim()) diagnostics.push("source_revision is required");
  const allTokens = [
    ...(source.requirements ?? []).map((item) => item.token),
    ...(source.architectures ?? []).map((item) => item.token),
    ...(source.implementations ?? []).map((item) => item.token),
  ];
  if (allTokens.some((token) => !/^(REQ|ARCH|IMPL)-[A-Z0-9_]+$/.test(token))) diagnostics.push("source token has invalid shape");
  if (source.clarification_ready === false) diagnostics.push("blocking clarification readiness gate failed");
  if (source.constitution_compliant === false) diagnostics.push("constitution compliance gate failed");
  return diagnostics;
}

// [IMPL-FEAT_TASK_DERIVATION] [ARCH-FEAT_TASK_DERIVATION_BOUNDARY] [REQ-FEAT_TASK_DERIVATION] — How: derive stable task entries from canonical projections without copying record bodies.
export function deriveTaskGraph(source: DerivationSource): DerivationResult {
  const diagnostics = validateSource(source);
  if (diagnostics.length > 0) {
    const error: DerivationError = diagnostics.some((item) => item.includes("gate")) ? "BLOCKED_READINESS" : "INVALID_SOURCE_REFERENCE";
    return { ok: false, error, diagnostics };
  }
  const tasks: TaskEntry[] = [];
  const roles = new Map<string, string>();
  const profiles = source.quality_profiles ?? ["baseline-functional"];
  for (const requirement of source.requirements ?? []) {
    for (const criterion of requirement.acceptance_criteria ?? []) {
      if (!criterion.text.trim()) return { ok: false, error: "INVALID_CONTRACT", diagnostics: ["acceptance criterion text is required"] };
      const sourceTokens = [requirement.token];
      const role = `acceptance:${criterion.id ?? criterion.text}`;
      const task_id = identity(sourceTokens, role);
      if (roles.has(task_id)) return { ok: false, error: "IDENTITY_COLLISION", diagnostics: [`duplicate identity ${task_id}`] };
      roles.set(task_id, role);
      tasks.push({
        task_id, source_tokens: sourceTokens, depends_on: [...(criterion.depends_on ?? [])].sort(),
        deliverables: criterion.deliverables ?? [{ id: `${task_id}:test`, kind: "test", path_or_contract: criterion.text }],
        test_level: "unit", parallel_group: null, status: "pending",
        evidence: { required: profileEvidence(profiles), history: [] }, source_revision: source.source_revision,
      });
    }
  }
  for (const architecture of source.architectures ?? []) {
    for (const boundary of architecture.boundaries ?? []) {
      if (!boundary.contract?.trim()) return { ok: false, error: "INVALID_CONTRACT", diagnostics: [`contract missing for ${architecture.token}`] };
      const sourceTokens = [architecture.token];
      const task_id = identity(sourceTokens, `boundary:${boundary.id ?? boundary.contract}`);
      if (roles.has(task_id)) return { ok: false, error: "IDENTITY_COLLISION", diagnostics: [`duplicate identity ${task_id}`] };
      roles.set(task_id, "boundary");
      tasks.push({
        task_id, source_tokens: sourceTokens, depends_on: [], deliverables: [{
          id: `${task_id}:module`, kind: "module", path_or_contract: boundary.contract,
          mutable: (boundary.mutable_deliverables ?? []).length > 0,
        }], test_level: "integration", parallel_group: null, status: "pending",
        evidence: { required: profileEvidence(profiles), history: [] }, source_revision: source.source_revision,
      });
    }
  }
  for (const implementation of source.implementations ?? []) {
    for (const block of implementation.blocks ?? []) {
      const sourceTokens = [implementation.token];
      const task_id = identity(sourceTokens, `block:${block.name}`);
      if (roles.has(task_id)) return { ok: false, error: "IDENTITY_COLLISION", diagnostics: [`duplicate identity ${task_id}`] };
      roles.set(task_id, "block");
      tasks.push({
        task_id, source_tokens: sourceTokens, depends_on: [...(block.depends_on ?? [])].sort(),
        deliverables: [{ id: `${task_id}:implementation`, kind: "module", path_or_contract: block.contract ?? block.name }],
        test_level: block.test_level ?? "unit", parallel_group: null, status: "pending",
        evidence: { required: profileEvidence(profiles), history: [] }, source_revision: source.source_revision,
      });
    }
  }
  const sorted = tasks.sort((a, b) => a.task_id.localeCompare(b.task_id));
  const ids = new Set(sorted.map((task) => task.task_id));
  if (sorted.some((task) => task.depends_on.some((dependency) => !ids.has(dependency)))) {
    return { ok: false, error: "INVALID_SOURCE_REFERENCE", diagnostics: ["derived dependency does not resolve"] };
  }
  return { ok: true, projection: { schema_version: "task-graph.v1", source_revision: source.source_revision, tasks: sorted } };
}

// [IMPL-FEAT_TASK_GRAPH_SCHEDULER] [ARCH-FEAT_TASK_GRAPH_SCHEDULER] [REQ-FEAT_TASK_GRAPH_SCHEDULING] — How: reject unknown edges and cycles with stable diagnostics.
export function validateTaskGraph(tasks: TaskEntry[]): { ok: true; order: string[] } | { ok: false; error: "UNKNOWN_DEPENDENCY" | "CYCLE_DETECTED" | "DUPLICATE_TASK_ID"; diagnostics: string[] } {
  const ids = new Set<string>();
  for (const task of tasks) if (ids.has(task.task_id)) return { ok: false, error: "DUPLICATE_TASK_ID", diagnostics: [task.task_id] }; else ids.add(task.task_id);
  for (const task of tasks) for (const dependency of task.depends_on) if (!ids.has(dependency)) return { ok: false, error: "UNKNOWN_DEPENDENCY", diagnostics: [`${task.task_id}->${dependency}`] };
  const remaining = new Map(tasks.map((task) => [task.task_id, new Set(task.depends_on)]));
  const order: string[] = [];
  while (remaining.size) {
    const ready = [...remaining.entries()].filter(([, deps]) => deps.size === 0).map(([id]) => id).sort();
    if (!ready.length) return { ok: false, error: "CYCLE_DETECTED", diagnostics: [...remaining.keys()].sort() };
    for (const id of ready) {
      remaining.delete(id); order.push(id);
      for (const deps of remaining.values()) deps.delete(id);
    }
  }
  return { ok: true, order };
}

export interface ReadinessContext {
  source_revision: string;
  completed?: Set<string>;
  module_validated?: Set<string>;
  clarification_ready?: boolean;
  constitution_compliant?: boolean;
}

export interface ReadinessItem { task_id: string; ready: boolean; reasons: string[]; evidence: string[] }
export interface ReadinessProjection { items: ReadinessItem[]; parallel_groups: string[][]; rejected_groups: Array<{ group: string; reasons: string[] }> }

// [IMPL-FEAT_TASK_GRAPH_SCHEDULER] [ARCH-FEAT_TASK_GRAPH_SCHEDULER] [REQ-FEAT_TASK_GRAPH_SCHEDULING] — How: project sorted readiness reasons and reject unsafe groups.
export function projectReadiness(tasks: TaskEntry[], context: ReadinessContext): ReadinessProjection {
  const completed = context.completed ?? new Set<string>();
  const validated = context.module_validated ?? new Set<string>();
  const items: ReadinessItem[] = tasks.slice().sort((a, b) => a.task_id.localeCompare(b.task_id)).map((task) => {
    const reasons: string[] = []; const evidence: string[] = [];
    if (task.source_revision !== context.source_revision) reasons.push("STALE_INPUT");
    if (context.clarification_ready === false) reasons.push("CLARIFICATION_BLOCKED");
    if (context.constitution_compliant === false) reasons.push("CONSTITUTION_BLOCKED");
    for (const dep of task.depends_on) if (!completed.has(dep)) reasons.push(`DEPENDENCY_UNSATISFIED:${dep}`);
    if (task.deliverables.some((item) => item.kind === "composition") && !validated.has(task.task_id)) reasons.push("MODULE_VALIDATION_REQUIRED");
    const ready = reasons.length === 0 && task.status !== "failed" && task.status !== "cancelled" && task.status !== "timed_out" && task.status !== "stale";
    if (ready) evidence.push("all readiness predicates passed");
    return { task_id: task.task_id, ready, reasons: reasons.sort(), evidence };
  });
  const groups = new Map<string, string[]>();
  for (const task of tasks) {
    if (!task.parallel_group) continue;
    const item = items.find((candidate) => candidate.task_id === task.task_id)!;
    if (item.ready) groups.set(task.parallel_group, [...(groups.get(task.parallel_group) ?? []), task.task_id]);
  }
  const parallel_groups: string[][] = []; const rejected_groups: ReadinessProjection["rejected_groups"] = [];
  for (const [group, ids] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const members = tasks.filter((task) => ids.includes(task.task_id));
    const reasons = new Set<string>();
    for (const task of members) {
      if (members.some((other) => other.task_id !== task.task_id && (task.depends_on.includes(other.task_id) || other.depends_on.includes(task.task_id)))) reasons.add("DEPENDENCY_OVERLAP");
      if (task.deliverables.some((d) => d.mutable) && members.some((other) => other.task_id !== task.task_id && other.deliverables.some((d) => d.mutable && d.path_or_contract === task.deliverables.find((x) => x.mutable)?.path_or_contract))) reasons.add("SHARED_MUTABLE_DELIVERABLE");
      if (!validated.has(task.task_id) && task.deliverables.some((d) => d.kind === "composition")) reasons.add("MODULE_VALIDATION_REQUIRED");
    }
    if (reasons.size) rejected_groups.push({ group, reasons: [...reasons].sort() }); else parallel_groups.push(ids.sort());
  }
  return { items, parallel_groups, rejected_groups };
}
