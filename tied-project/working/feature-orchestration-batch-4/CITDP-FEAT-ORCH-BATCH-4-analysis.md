# CITDP-FEAT-ORCH-BATCH-4 analysis

## Change definition

Current behavior: Batches 0–3 provide a canonical feature manifest, lifecycle,
clarification and constitution projections, canonical REQ/ARCH/IMPL links, and
a deterministic task graph/execution projection. Human-readable feature
documents are not yet generated or freshness-checked.

Desired behavior: A feature directory can contain deterministic generated
views (`spec.md`, `plan.md`, `tasks.md`, `quickstart.md`, `data-model.md`, and
applicable `contracts/` views) rendered from one normalized, reference-only
source projection. Each view is clearly marked as generated, records source
revision/hash metadata, preserves token/evidence links and proof-boundary
labels, and can be checked for staleness.

Unchanged behavior:

- Canonical REQ/ARCH/IMPL YAML remains the source of intent.
- Feature manifests remain reference-oriented and are not populated with
  copied canonical record bodies.
- Batch 2 clarification/constitution semantics and Batch 3 task scheduling
  semantics are consumed as projections only.
- Existing `tied-yaml` MCP and `tied-cli.sh` remain the TIED YAML interfaces.
- No Git branches, worktrees, migration, onboarding, research promotion, or
  runtime correctness claim is added.

## Resolved sponsor terms and naming bridges

| Sponsor wording | Canonical term | Planned token/block |
|---|---|---|
| rendered docs / feature docs | generated view | `REQ-FEAT_VIEW_GENERATION` |
| renderer input | view source projection | `IMPL-FEAT_VIEW_PROJECTION` / `BUILD_VIEW_SOURCE_PROJECTION` |
| renderer | generated view renderer | `IMPL-FEAT_VIEW_RENDERER` / `RENDER_GENERATED_VIEW` |
| fresh source metadata | source revision metadata | `source_revision` |
| diff-only regeneration | semantic comparison | `SEMANTIC_COMPARE_VIEW` |
| freshness check | stale-view detection | `IMPL-FEAT_VIEW_STALE_DETECTION` / `DETECT_STALE_VIEW` |
| stale handling | stale-view policy | `fail` / `warn` |
| what the output proves | proof-boundary label | `proof_boundaries[]` |

Vocabulary RECORD completed in
`tied/vocab/feature-orchestration.md`; VALIDATE remains a pre-commit
touchpoint and is intentionally recorded as not applicable to this
no-commit planning handoff.

## Scope and source projection contract

The source projection is assembled from:

1. the canonical feature manifest;
2. Batch 2 clarification and constitution projections;
3. the Batch 3 task graph and execution-evidence projections;
4. canonical REQ/ARCH/IMPL references and their source revision/hash metadata;
5. evidence links and proof-boundary labels.

It contains references, summaries, projections, links, labels, and source
metadata only. It must reject unresolved references and conflicting revisions,
normalize unordered collections by canonical identity, preserve declared
semantic order, and never inline complete canonical record bodies.

## Renderer and stale policy decisions

- Supported view outputs are `spec.md`, `plan.md`, `tasks.md`,
  `quickstart.md`, `data-model.md`, and applicable `contracts/` views.
- Every output starts with a generated-file banner that says it is a view and
  not a source of truth.
- Every output contains stable `source_revision` entries, token links,
  evidence links, proof-boundary labels, and the limitations of the view's
  evidence.
- Fixed section ordering and canonical sorting provide byte-stable rendering.
- Semantic comparison ignores only permitted formatting differences; changes
  to semantic sections, source metadata, links, or proof-boundary labels are
  meaningful differences.
- `fail` is the default policy for CI and verification. `warn` is available
  only when explicitly requested for local inspection.
- A stale output is never current intent, runtime correctness proof, or
  quality/security evidence, even when its Markdown is structurally valid.
- This phase does not decide Git integration, durable view stores, or a
  replacement for the TIED YAML interfaces.

## Impact analysis

Logical modules for the later build:

1. **View source projection** — pure normalization and revision aggregation.
2. **Generated view renderer** — pure view-kind selection, stable Markdown
   emission, and semantic comparison.
3. **Stale-view detector** — metadata parsing, source comparison, deterministic
   diagnostics, and fail/warn policy.
4. **Composition surface** — later wiring to feature-local commands/MCP/CI;
   no composition code is authorized in this planning phase.

Affected canonical records:

- New REQ: `REQ-FEAT_VIEW_GENERATION`,
  `REQ-FEAT_VIEW_DETERMINISM`, `REQ-FEAT_VIEW_STALENESS`.
- New ARCH: `ARCH-FEAT_VIEW_PROJECTION`,
  `ARCH-FEAT_VIEW_RENDERING`, `ARCH-FEAT_VIEW_STALENESS`.
- New IMPL: `IMPL-FEAT_VIEW_PROJECTION`,
  `IMPL-FEAT_VIEW_RENDERER`, `IMPL-FEAT_VIEW_STALE_DETECTION`.
- Batch 0–3 projection contracts are dependencies, not redesigned here.

## Risk assessment

- **Duplicate source of truth:** mitigated by reference-only source projection,
  generated banner, and prohibition on copying canonical bodies.
- **False freshness:** mitigated by per-source revision/hash metadata and
  deterministic stale diagnostics.
- **Proof-boundary confusion:** mitigated by preserving labels and stating that
  rendering/structural validation does not prove runtime correctness.
- **Nondeterministic diffs:** mitigated by fixed section order, canonical
  collection ordering, semantic comparison, and unchanged-input no-diff tests.
- **Partial or mixed source revisions:** mitigated by rejecting conflicting
  revisions before projection publication.
- **Task-view drift:** mitigated by consuming the Batch 3 task graph projection;
  task scheduling semantics remain out of scope.
- **Overbroad implementation:** mitigated by excluding lifecycle redesign,
  clarification/constitution redesign, scheduler redesign, Git integration,
  migration/onboarding, and research/feedback promotion.

## Test strategy for build-plan

RED tests must be written before production code:

- source projection rejects unresolved references and conflicting revisions;
- source projection preserves token/evidence/proof-boundary links and does not
  copy canonical bodies;
- each supported view kind emits the banner and required source metadata;
- equivalent inputs produce byte-identical output;
- unchanged-input regeneration produces no diff;
- semantic comparison ignores permitted formatting-only changes and detects
  metadata/link/proof-boundary changes;
- stale detection identifies missing, changed, and newly required sources;
- `fail` and explicit `warn` policies produce stable outcomes;
- stale output is marked neither current intent nor runtime proof;
- Batch 3 task and execution projections are consumed without changing their
  scheduling semantics.

Independent module validation is required before later composition. No E2E is
currently justified: projection, rendering, stale detection, CLI, MCP, and CI
bindings are composition-testable without UI invocation.

## Proof boundaries

This analysis and its planned validators establish only:

- specification/view structure;
- traceability-link preservation;
- deterministic rendering/comparison;
- source freshness diagnostics.

They do not establish runtime correctness, security/quality evidence,
constitution compliance by themselves, task readiness by themselves, or human
approval.

## Planning gate and handoff

The per-request tracker is:
`working/feature-orchestration-batch-4/agent-req-implementation-checklist-CITDP-FEAT-ORCH-BATCH-4.yaml`.

The post-implementation CITDP record is intentionally deferred per request;
this file is the pre-TDD analysis artifact only. After the three modules are
implemented and validated, persist
`tied/citdp/CITDP-FEAT-ORCH-BATCH-4.yaml` with actual evidence, divergences,
and residual risk.

Build entry point:

```text
build-plan
linked tracker:
working/feature-orchestration-batch-4/agent-req-implementation-checklist-CITDP-FEAT-ORCH-BATCH-4.yaml
```
