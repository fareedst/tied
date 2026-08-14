import test from "node:test";
import assert from "node:assert/strict";
import {
  buildViewSourceProjection,
  renderGeneratedView,
  semanticCompareView,
  detectStaleView,
  type ViewSourceInput,
} from "./views.js";

const input = (): ViewSourceInput => ({
  feature_manifest: {
    schema_version: "feature-manifest.v1",
    feature_id: "FEAT-004",
    slug: "views",
    title: "Generated views",
    mode: "greenfield",
    status: "planned",
    revision: 3,
    created_at: "2026-08-13T00:00:00Z",
    updated_at: "2026-08-13T00:00:00Z",
    canonical_tokens: {
      requirements: ["REQ-FEAT_VIEW_GENERATION"],
      architecture: ["ARCH-FEAT_VIEW_RENDERING"],
      implementations: ["IMPL-FEAT_VIEW_RENDERER"],
    },
  },
  clarification_projection: { source_revision: "clarifications@2", ready: true, blockers: [] },
  constitution_projection: { source_revision: "constitution@1", compliant: true, diagnostics: [] },
  task_graph_projection: {
    schema_version: "task-graph.v1",
    source_revision: "tasks@7",
    tasks: [{
      task_id: "TASK-1",
      source_tokens: ["IMPL-FEAT_VIEW_RENDERER"],
      depends_on: [],
      deliverables: [{ id: "TASK-1:test", kind: "test", path_or_contract: "views.test.ts" }],
      test_level: "unit",
      parallel_group: null,
      status: "pending",
      evidence: { required: [], history: [] },
      source_revision: "tasks@7",
    }],
  },
  canonical_record_refs: [
    { token: "REQ-FEAT_VIEW_GENERATION", source_kind: "REQ", revision: "req@1", summary: "Generated views" },
    { token: "ARCH-FEAT_VIEW_RENDERING", source_kind: "ARCH", revision: "arch@1", summary: "Stable rendering" },
    { token: "IMPL-FEAT_VIEW_RENDERER", source_kind: "IMPL", revision: "impl@1", summary: "Renderer" },
  ],
  evidence_links: ["test://views", "tied://CITDP-FEAT-ORCH-BATCH-4"],
  proof_boundaries: ["specification-structure", "traceability-links", "not-runtime-correctness"],
});

test("builds a reference-only projection and preserves links and proof boundaries REQ-FEAT_VIEW_GENERATION", () => {
  const result = buildViewSourceProjection(input());
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal("body" in result.projection.canonical_references[0], false);
  assert.deepEqual(result.projection.evidence_links, ["test://views", "tied://CITDP-FEAT-ORCH-BATCH-4"]);
  assert.deepEqual(result.projection.proof_boundaries, ["not-runtime-correctness", "specification-structure", "traceability-links"]);
});

test("rejects unresolved references and conflicting revisions REQ-FEAT_VIEW_GENERATION", () => {
  const unresolved = input();
  unresolved.canonical_record_refs = unresolved.canonical_record_refs.slice(1);
  assert.deepEqual(buildViewSourceProjection(unresolved), { ok: false, error: "InvalidReference", diagnostics: ["REQ-FEAT_VIEW_GENERATION"] });
  const conflict = input();
  conflict.canonical_record_refs.push({ token: "REQ-FEAT_VIEW_GENERATION", source_kind: "REQ", revision: "req@2" });
  assert.deepEqual(buildViewSourceProjection(conflict), { ok: false, error: "ConflictingRevision", diagnostics: ["REQ-FEAT_VIEW_GENERATION"] });
});

test("renders every supported view deterministically with generated metadata REQ-FEAT_VIEW_GENERATION", () => {
  const projection = buildViewSourceProjection(input());
  assert.equal(projection.ok, true);
  if (!projection.ok) return;
  for (const kind of ["spec.md", "plan.md", "tasks.md", "quickstart.md", "data-model.md", "contracts/manifest.md"] as const) {
    const rendered = renderGeneratedView(projection.projection, kind);
    assert.equal(rendered.ok, true);
    if (rendered.ok) {
      assert.match(rendered.markdown, /GENERATED FEATURE VIEW/);
      assert.match(rendered.markdown, /source_revision/);
      assert.match(rendered.markdown, /REQ-FEAT_VIEW_GENERATION/);
      assert.match(rendered.markdown, /not-runtime-correctness/);
    }
  }
});

test("semantic comparison is stable and ignores formatting-only changes REQ-FEAT_VIEW_DETERMINISM", () => {
  const projection = buildViewSourceProjection(input());
  assert.equal(projection.ok, true);
  if (!projection.ok) return;
  const rendered = renderGeneratedView(projection.projection, "spec.md");
  assert.equal(rendered.ok, true);
  if (!rendered.ok) return;
  assert.equal(semanticCompareView(rendered.markdown, rendered.markdown.replace(/\r?\n/g, "\r\n") + "\n").equal, true);
  assert.equal(semanticCompareView(rendered.markdown, rendered.markdown.replace("not-runtime-correctness", "runtime-correctness")).equal, false);
});

test("detects stale sources and applies fail or explicit warn policy REQ-FEAT_VIEW_STALENESS", () => {
  const projection = buildViewSourceProjection(input());
  assert.equal(projection.ok, true);
  if (!projection.ok) return;
  const rendered = renderGeneratedView(projection.projection, "spec.md");
  assert.equal(rendered.ok, true);
  if (!rendered.ok) return;
  const current = [...projection.projection.source_revision, { identity: "new-source", revision_or_hash: "1", source_kind: "REQ" }];
  const failed = detectStaleView(rendered.markdown, current, "fail", "spec.md");
  assert.equal(failed.status, "failed");
  assert.equal(failed.current_intent, false);
  assert.equal(failed.runtime_proof, false);
  const warned = detectStaleView(rendered.markdown, current, "warn", "spec.md");
  assert.equal(warned.status, "warned");
  assert.equal(warned.diagnostics.length, 1);
});
