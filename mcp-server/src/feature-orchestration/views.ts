import crypto from "node:crypto";
import { validateManifest, type FeatureManifest } from "./manifest.js";

export type ViewKind =
  | "spec.md"
  | "plan.md"
  | "tasks.md"
  | "quickstart.md"
  | "data-model.md"
  | `contracts/${string}.md`;

export type CanonicalRecordRef = {
  token: string;
  source_kind: "REQ" | "ARCH" | "IMPL";
  revision?: string;
  hash?: string;
  summary?: string;
  links?: string[];
};

export type SourceRevision = {
  identity: string;
  revision_or_hash: string;
  source_kind: string;
};

export type ViewSourceInput = {
  feature_manifest: unknown;
  clarification_projection?: Record<string, unknown>;
  constitution_projection?: Record<string, unknown>;
  task_graph_projection?: Record<string, unknown>;
  canonical_record_refs: CanonicalRecordRef[];
  evidence_links?: string[];
  proof_boundaries: string[];
};

export type ViewSourceProjection = {
  schema_version: "view-source.v1";
  feature: Pick<FeatureManifest, "feature_id" | "slug" | "title" | "mode" | "status" | "revision">;
  clarification_projection: Record<string, unknown>;
  constitution_projection: Record<string, unknown>;
  task_graph_projection: Record<string, unknown>;
  canonical_references: Array<Omit<CanonicalRecordRef, "links"> & { links: string[] }>;
  evidence_links: string[];
  proof_boundaries: string[];
  source_revision: SourceRevision[];
};

export type ProjectionResult =
  | { ok: true; projection: ViewSourceProjection }
  | { ok: false; error: "InvalidReference" | "ConflictingRevision"; diagnostics: string[] };

type RenderResult =
  | { ok: true; markdown: string; view_kind: ViewKind }
  | { ok: false; error: "UnsupportedViewKind" | "MissingProjectionField" };

const tokenPattern = /^(REQ|ARCH|IMPL)-[A-Z0-9_]+$/;
const supportedKinds = (kind: string): kind is ViewKind =>
  /^(spec|plan|tasks|quickstart|data-model)\.md$/.test(kind) || /^contracts\/[^/]+\.md$/.test(kind);

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function hash(value: unknown): string {
  return `sha256:${crypto.createHash("sha256").update(stable(value)).digest("hex")}`;
}

function strings(value: unknown): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? [...new Set(value)].sort() : [];
}

function contribution(identity: string, source_kind: string, revision: unknown, value: unknown): SourceRevision {
  return { identity, source_kind, revision_or_hash: typeof revision === "string" && revision.trim() ? revision : hash(value) };
}

// [IMPL-FEAT_VIEW_PROJECTION] [ARCH-FEAT_VIEW_PROJECTION] [REQ-FEAT_VIEW_GENERATION] — Normalize canonical feature references and Batch 2/3 projections into one reference-only renderer input.
export function buildViewSourceProjection(inputs: ViewSourceInput): ProjectionResult {
  const manifestResult = validateManifest(inputs.feature_manifest);
  if (!manifestResult.ok) return { ok: false, error: "InvalidReference", diagnostics: ["feature_manifest"] };
  const manifest = manifestResult.manifest;
  const required = [
    ...manifest.canonical_tokens.requirements,
    ...manifest.canonical_tokens.architecture,
    ...manifest.canonical_tokens.implementations,
  ];
  const references = new Map<string, Omit<CanonicalRecordRef, "links"> & { links: string[] }>();
  for (const reference of inputs.canonical_record_refs) {
    if (!tokenPattern.test(reference.token) || !reference.summary?.trim() && !reference.revision && !reference.hash) {
      return { ok: false, error: "InvalidReference", diagnostics: [reference.token] };
    }
    const existing = references.get(reference.token);
    if (existing && (existing.revision ?? existing.hash ?? hash(existing)) !== (reference.revision ?? reference.hash ?? hash(reference))) {
      return { ok: false, error: "ConflictingRevision", diagnostics: [reference.token] };
    }
    references.set(reference.token, {
      token: reference.token,
      source_kind: reference.source_kind,
      ...(reference.revision ? { revision: reference.revision } : {}),
      ...(reference.hash ? { hash: reference.hash } : {}),
      ...(reference.summary ? { summary: reference.summary.trim() } : {}),
      links: strings(reference.links),
    });
  }
  const unresolved = required.filter((token) => !references.has(token)).sort();
  if (unresolved.length) return { ok: false, error: "InvalidReference", diagnostics: unresolved };

  const clarification = inputs.clarification_projection ?? {};
  const constitution = inputs.constitution_projection ?? {};
  const taskGraph = inputs.task_graph_projection ?? {};
  const source_revision = [
    contribution("feature-manifest", "manifest", `revision:${manifest.revision}`, manifest),
    contribution("clarification-projection", "clarification", clarification.source_revision, clarification),
    contribution("constitution-projection", "constitution", constitution.source_revision, constitution),
    contribution("task-graph-projection", "task-graph", taskGraph.source_revision, taskGraph),
    ...[...references.values()].sort((left, right) => left.token.localeCompare(right.token)).map((reference) =>
      contribution(reference.token, reference.source_kind, reference.revision ?? reference.hash, reference.summary ?? reference.token)),
  ].sort((left, right) => left.identity.localeCompare(right.identity));

  return {
    ok: true,
    projection: {
      schema_version: "view-source.v1",
      feature: {
        feature_id: manifest.feature_id,
        slug: manifest.slug,
        title: manifest.title,
        mode: manifest.mode,
        status: manifest.status,
        revision: manifest.revision,
      },
      clarification_projection: clarification,
      constitution_projection: constitution,
      task_graph_projection: taskGraph,
      canonical_references: [...references.values()].sort((left, right) => left.token.localeCompare(right.token)),
      evidence_links: strings(inputs.evidence_links),
      proof_boundaries: strings(inputs.proof_boundaries),
      source_revision,
    },
  };
}

function linesForProjection(projection: ViewSourceProjection, kind: ViewKind): string[] {
  const { feature, canonical_references: references } = projection;
  const tokens = references.map((reference) => `- [${reference.token}]${reference.summary ? ` — ${reference.summary}` : ""}`);
  const tasks = Array.isArray(projection.task_graph_projection.tasks)
    ? (projection.task_graph_projection.tasks as Array<Record<string, unknown>>)
      .map((task) => `- ${String(task.task_id ?? "unknown")} (${String(task.status ?? "pending")})`)
      .sort()
    : [];
  const boundaries = projection.proof_boundaries.map((item) => `- ${item}`);
  const links = [...projection.evidence_links, ...references.flatMap((reference) => reference.links)].sort().map((link) => `- ${link}`);
  if (kind === "spec.md") return [`## Specification`, `**Feature:** ${feature.title} (\`${feature.feature_id}\`)`, `**Lifecycle:** ${feature.status}`, "", "### Canonical references", ...tokens];
  if (kind === "plan.md") return ["## Plan", `**Feature:** ${feature.feature_id}`, "", "### Architecture and implementation references", ...tokens];
  if (kind === "tasks.md") return ["## Tasks", ...tasks.length ? tasks : ["- No task entries are currently projected."]];
  if (kind === "quickstart.md") return ["## Quickstart", `1. Review \`${feature.feature_id}\` generated views.`, "2. Follow the canonical references above.", "3. Treat this view as non-canonical."];
  if (kind === "data-model.md") return ["## Data model", "The feature manifest stores references and projections; canonical record bodies are not copied.", "", "### Source projections", `- Clarification: ${String(projection.clarification_projection.source_revision ?? "not supplied")}`, `- Constitution: ${String(projection.constitution_projection.source_revision ?? "not supplied")}`, `- Task graph: ${String(projection.task_graph_projection.source_revision ?? "not supplied")}`];
  return ["## Contract view", `**Contract:** ${kind.slice("contracts/".length, -".md".length)}`, "", "### Canonical references", ...tokens];
}

// [IMPL-FEAT_VIEW_RENDERER] [ARCH-FEAT_VIEW_RENDERING] [REQ-FEAT_VIEW_GENERATION] [REQ-FEAT_VIEW_DETERMINISM] — Render deterministic human-readable Markdown views from a normalized source projection and compare their meaning.
export function renderGeneratedView(projection: ViewSourceProjection, view_kind: ViewKind): RenderResult {
  if (!supportedKinds(view_kind)) return { ok: false, error: "UnsupportedViewKind" };
  if (!projection.source_revision.length || !projection.proof_boundaries.length) return { ok: false, error: "MissingProjectionField" };
  const metadata = JSON.stringify(projection.source_revision);
  const evidence = projection.evidence_links.length ? projection.evidence_links.map((item) => `- ${item}`).join("\n") : "- none";
  const boundaries = projection.proof_boundaries.map((item) => `- ${item}`).join("\n");
  const markdown = [
    "<!-- GENERATED FEATURE VIEW: view; not a source of truth; not runtime proof -->",
    `<!-- view_kind: ${view_kind} -->`,
    `<!-- source_revision: ${metadata} -->`,
    `<!-- proof_boundaries: ${JSON.stringify(projection.proof_boundaries)} -->`,
    `# ${projection.feature.title}`,
    "",
    ...linesForProjection(projection, view_kind),
    "",
    "### Evidence links",
    evidence,
    "",
    "### Proof boundaries and limitations",
    boundaries,
    "- Generated structure and links do not prove runtime correctness, quality evidence, or human approval.",
    "",
  ].join("\n");
  return { ok: true, markdown, view_kind };
}

function metadata(view: string): { kind: string; source: SourceRevision[]; proof: string[] } | null {
  const banner = view.match(/^<!-- GENERATED FEATURE VIEW: view; not a source of truth; not runtime proof -->$/m);
  const kind = view.match(/^<!-- view_kind: (.+) -->$/m)?.[1];
  const sourceText = view.match(/^<!-- source_revision: (.+) -->$/m)?.[1];
  const proofText = view.match(/^<!-- proof_boundaries: (.+) -->$/m)?.[1];
  if (!banner || !kind || !sourceText || !proofText) return null;
  try {
    const source = JSON.parse(sourceText) as SourceRevision[];
    const proof = JSON.parse(proofText) as string[];
    if (!Array.isArray(source) || !source.every((item) => item.identity && item.revision_or_hash) || !Array.isArray(proof)) return null;
    return { kind, source, proof };
  } catch {
    return null;
  }
}

function semanticForm(view: string): string | null {
  const parsed = metadata(view);
  if (!parsed) return null;
  return view.replace(/\r\n/g, "\n").split("\n").map((line) => line.trimEnd()).filter((line, index, all) => !(line === "" && all[index - 1] === "")).join("\n").trim();
}

export function semanticCompareView(left_view: string, right_view: string): { equal: boolean; differences: string[] } {
  const left = metadata(left_view);
  const right = metadata(right_view);
  if (!left || !right) return { equal: false, differences: ["InvalidGeneratedView"] };
  const leftForm = semanticForm(left_view);
  const rightForm = semanticForm(right_view);
  if (leftForm === rightForm) return { equal: true, differences: [] };
  const differences: string[] = [];
  if (left.kind !== right.kind) differences.push("view_kind");
  if (stable(left.source) !== stable(right.source)) differences.push("source_revision");
  if (stable(left.proof) !== stable(right.proof)) differences.push("proof_boundaries");
  if (leftForm !== rightForm && differences.length === 0) differences.push("semantic_sections");
  return { equal: false, differences };
}

export type StalePolicy = "fail" | "warn";
export type FreshnessResult = {
  status: "current" | "failed" | "warned";
  stale: boolean;
  current_intent: boolean;
  runtime_proof: boolean;
  diagnostics: string[];
  proof_boundaries: string[];
};

// [IMPL-FEAT_VIEW_STALE_DETECTION] [ARCH-FEAT_VIEW_STALENESS] [REQ-FEAT_VIEW_STALENESS] — Detect generated views whose recorded canonical inputs no longer match and apply explicit freshness policy.
export function detectStaleView(
  generated_view: string,
  current_source_revision: SourceRevision[],
  stale_view_policy: StalePolicy,
  view_path = "generated-view",
): FreshnessResult {
  if (stale_view_policy !== "fail" && stale_view_policy !== "warn") throw new Error("UnsupportedPolicy");
  const recorded = metadata(generated_view);
  if (!recorded) throw new Error("InvalidGeneratedMetadata");
  const current = new Map(current_source_revision.map((item) => [item.identity, item]));
  const saved = new Map(recorded.source.map((item) => [item.identity, item]));
  const diagnostics: string[] = [];
  for (const item of recorded.source) {
    const latest = current.get(item.identity);
    if (!latest) diagnostics.push(`${view_path}:${item.identity}:missing`);
    else if (latest.revision_or_hash !== item.revision_or_hash) diagnostics.push(`${view_path}:${item.identity}:changed`);
  }
  for (const item of current_source_revision) if (!saved.has(item.identity)) diagnostics.push(`${view_path}:${item.identity}:new`);
  diagnostics.sort();
  if (!diagnostics.length) return { status: "current", stale: false, current_intent: true, runtime_proof: false, diagnostics: [], proof_boundaries: recorded.proof };
  return {
    status: stale_view_policy === "fail" ? "failed" : "warned",
    stale: true,
    current_intent: false,
    runtime_proof: false,
    diagnostics,
    proof_boundaries: recorded.proof,
  };
}
