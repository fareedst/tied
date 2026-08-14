# Feature orchestration (canonical)

**Scope:** Feature-level orchestration layer in `docs/tied-improvement-roadmap.md`: manifests, lifecycle, clarifications, project constitution, task graphs, generated views, and the feature orchestration CLI/MCP surface. **Vocabulary only** — behavior is specified in project `REQ-FEAT_*` / `ARCH-FEAT_*` / `IMPL-FEAT_*` records (batches 0–6).

**Status:** Batches 0–6 implemented (2026-08-13 close-out). Naming bridges below align with staged TIED tokens and `mcp-server/src/feature-orchestration/`; amend through LEAP when behavior changes.

**See also:** [`routing.md`](routing.md) · [`agentstream.md`](agentstream.md) · [`fidelity-research.md`](fidelity-research.md) · [`feedback-to-tied.md`](feedback-to-tied.md) · [`leap-proposal-queue.md`](leap-proposal-queue.md) · [`../../docs/tied-improvement-roadmap.md`](../../docs/tied-improvement-roadmap.md)

---

## Preferred terms vs synonyms

| Preferred | Avoid | Notes |
|-----------|-------|-------|
| **feature manifest** | feature package yaml, feature.yaml (alone) | Orchestration index at `tied/features/FEAT-003-chat-system/feature.yaml`; references canonical REQ/ARCH/IMPL tokens |
| **feature identifier** | feature id, FEAT slug | Stable zero-padded ID such as `FEAT-003`; distinct from semantic tokens |
| **feature lifecycle** | feature status machine | Persisted phases: `draft` → `refining` → `specified` → `planned` → `tasked` → `verifying` → `closed`; terminal `abandoned` |
| **clarification record** | open question, NEEDS_CLARIFICATION (alone) | Structured record in feature-local `clarifications.yaml`; `[NEEDS_CLARIFICATION]` is a view marker only |
| **project constitution** | constitution, project rules | Versioned project-owned principles at `tied/constitution.yaml` (preferred path); not methodology `AGENTS.md` |
| **task graph** | task list, tasks.md (alone) | Dependency-aware executable work derived from canonical records; `tasks.md` is a generated view |
| **generated view** | spec.md, plan.md (as source) | Human-readable Markdown render committed in the feature directory and stale-checked by CI; never competing source of truth |
| **feature orchestration CLI** | tied feature, tied init | Separate product binary named **`feature-orchestrator`** for lifecycle commands; **not** `tied-cli.sh` (YAML MCP client) |
| **feature-spec batch** | initial-specs, batch yaml | Existing `agentstream` / `--feature-spec-batch-yaml` input; migration source, not replacement manifest |

---

## Naming bridge — distinct concepts

| Concept | Canonical path or value | Distinct from |
|---------|-------------------------|---------------|
| Feature manifest | `tied/features/FEAT-003-chat-system/feature.yaml` | Fidelity **project manifest** (`project-manifest` in fidelity-research) |
| Feature orchestration CLI | `feature-orchestrator` | `.cursor/skills/tied-yaml/scripts/tied-cli.sh` |
| Legacy spec list | `prompts/initial-specs.yaml` (example) | Feature manifest; migrate via Batch 6 preview |
| Generated `tasks.md` | Committed feature directory view, stale-checked by CI | Task graph canonical data in manifest or linked store |
| Branch/worktree integration | Deferred beyond initial Batch 1 delivery | Existing repository state; no silent Git mutation |

## Batch 0 contract terms

| Preferred term | Exact identifier or block | Meaning |
|----------------|--------------------------|---------|
| **manifest schema contract** | `feature-manifest.v1` / `MANIFEST_SCHEMA_CONTRACT` | Versioned required and optional fields for a feature manifest; it stores references rather than copied canonical record bodies |
| **lifecycle transition matrix** | `LIFECYCLE_TRANSITION_MATRIX` | Finite legal transitions, preconditions, blocked-state derivation, and approval points for the feature lifecycle |
| **canonical reference linker** | `CANONICAL_REFERENCE_LINKER` | Resolves and validates references to existing REQ/ARCH/IMPL tokens without becoming a second source of truth |
| **fixture corpus** | `FIXTURE_CORPUS` | Representative valid and invalid manifest inputs used to validate schema, lifecycle, reference, migration, and partial-write behavior |
| **deterministic validator** | `VALIDATE_FIXTURE_CORPUS` | Validator behavior whose diagnostics, rejection categories, and normalized output are stable for the same input |

Batch 0 uses the `REQ-FEAT_*`, `ARCH-FEAT_*`, and `IMPL-FEAT_*` families for
these contracts. Later batches own clarification, constitution, task graph, and
generated-view terms.

## Batch 2 terms

| Preferred term | Exact identifier or path | Meaning |
|----------------|--------------------------|---------|
| **clarification gate** | `CLARIFICATION_GATE` | Phase-specific readiness evaluation for informational, REQ-authoring, ARCH/IMPL-authoring, and RED-test uncertainty. |
| **stale resolution** | `STALE_RESOLUTION` | A resolved clarification invalidated by a relevant feature revision or affected-scope change. |
| **constitution article** | `articles[]` | One independently scoped project rule with enforcement, rationale, and optional exceptions. |
| **constitution exception** | `exceptions[]` | An explicit, reviewed, owner-attributed deviation with rationale and expiry where applicable. |
| **constitution diagnostic** | `CONSTITUTION_DIAGNOSTIC` | Deterministic analyzer output identifying rule, artifact, location, severity, and remediation. |
| **constitution compliance** | `CONSTITUTION_COMPLIANCE` | Analyzer result for REQ, ARCH, IMPL, task plans, and CITDP records; it does not replace TIED consistency or quality evidence. |
| **amendment compatibility** | `AMENDMENT_COMPATIBILITY` | Version transition check preventing amendments from silently invalidating governed artifacts or approved exceptions. |

These terms bridge sponsor wording such as “open question,” “constitution
rule,” “waiver,” and “lint” to canonical structured records and deterministic
gates. Batch 3 may consume these projections but does not own their schemas.

## Batch 3 terms

| Preferred term | Exact identifier or path | Meaning |
|----------------|--------------------------|---------|
| **task derivation** | `DERIVE_TASK_GRAPH` | Pure projection from canonical REQ acceptance criteria, ARCH boundaries, IMPL blocks/contracts, testability, readiness, and quality profiles into task graph entries. |
| **task graph** | `task_graph_projection` | Canonical dependency-aware executable data; it is the source for scheduling and later generated views. |
| **task identity** | `task_id` | Stable identifier derived from canonical source identity and task role, never from list position or prose. |
| **readiness projection** | `readiness_projection` | Deterministic ready/blocked result with structured reasons and evidence; it does not infer permission from task text. |
| **unsafe parallelization** | `UNSAFE_GROUP` | Rejection of a proposed parallel group because of dependency overlap, shared mutable deliverables, or missing module-validation evidence. |
| **execution evidence history** | `evidence` | Append-only attempt outcomes and provenance retained across retry and resume for the same task identity. |
| **stale input** | `STALE_INPUT` | Execution or resume rejection caused by a task graph source revision that differs from the recorded execution revision. |
| **agentstream task adapter** | `BUILD_TASK_TURNS` / `EXECUTE_SCHEDULE` | Additive boundary mapping a scheduler projection to existing agentstream Turns and executor behavior without replacing feature-spec batch mode. |

These Batch 3 terms preserve the existing **feature-spec batch** as a
compatibility mode and reserve `tasks.md` for the Batch 4 **generated view**.

## Batch 4 terms

| Preferred term | Exact identifier or path | Meaning |
|----------------|--------------------------|---------|
| **view source projection** | `VIEW_SOURCE_PROJECTION` | Normalized, reference-only input assembled from the feature manifest, Batch 2 projections, Batch 3 task graph, canonical REQ/ARCH/IMPL records, and proof-boundary labels. |
| **generated view renderer** | `RENDER_GENERATED_VIEW` | Deterministic projection-to-Markdown operation that emits committed human-readable views without copying canonical record bodies. |
| **source revision metadata** | `source_revision` | Revision IDs or content hashes recorded in a generated-view banner to identify the exact canonical inputs used. |
| **semantic comparison** | `SEMANTIC_COMPARE_VIEW` | Comparison of normalized generated-view meaning that ignores permitted formatting-only differences while preserving source metadata and links. |
| **stale-view detection** | `DETECT_STALE_VIEW` | Deterministic check that compares recorded source revisions/hashes with current canonical inputs and reports stale output. |
| **stale-view policy** | `fail` / `warn` | Explicit handling mode: CI and verification fail on stale views; local inspection may warn, but stale output is never current intent or runtime proof. |
| **proof-boundary label** | `proof_boundaries[]` | View-preserved label identifying what evidence a projection can and cannot establish, such as specification completeness or runtime correctness. |

These terms bridge sponsor wording such as “rendered docs,” “freshness,”
“diff-only regeneration,” and “proof” to canonical projection, renderer,
metadata, and stale-check contracts. `spec.md`, `plan.md`, `tasks.md`,
`quickstart.md`, `data-model.md`, and `contracts/` remain generated views, not
source records.

---

## Batch 6 terms

| Preferred term | Exact identifier or path | Meaning |
|----------------|--------------------------|---------|
| **onboarding command** | `tied init`, `tied feature new`, `tied feature build` | Safe top-level adoption entry point that delegates to the feature orchestration binary and existing validated modules. |
| **local default resolution** | `TIED_MCP_BIN`, `TIED_BASE_PATH`, `tied/constitution.yaml`, `tied/features/` | Deterministic discovery of usable local paths and binaries without silently persisting configuration changes. |
| **readiness diagnostic** | `READINESS_DIAGNOSTIC` | Stable unmet-prerequisite report naming the exact missing input and corrective command. |
| **offline fallback** | `tied-cli` / `using-tied-without-mcp.md` | Explicit manual or tied-cli workflow preserved when Node or the TIED YAML MCP binary is unavailable. |
| **migration preview** | `MIGRATION_PREVIEW` | Non-mutating normalized report for legacy feature-spec batch and ordered agentstream inputs before migration. |
| **migration conflict report** | `MIGRATION_CONFLICT_REPORT` | Deterministic list of source collisions, unsupported records, ownership conflicts, and ordering ambiguities. |
| **migration backup** | `MIGRATION_BACKUP` | Recoverable snapshot created before an explicitly confirmed persisted migration. |
| **explicit migration confirmation** | `--confirm-migration` | Required operator acknowledgement before migration writes; dry-run is the default. |

These terms bridge sponsor wording such as “one-command setup,” “smart
defaults,” “migration,” and “rollback” to bounded adoption behavior. Onboarding
does not replace `tied-cli`, the TIED YAML MCP, or `agentstream`; migration
preserves project-owned TIED YAML and existing ordered behavior.

---

## Registered token families

Project tokens are registered under predictable families in `semantic-tokens.yaml`:

| Family | Example | Owning batch |
|--------|---------|--------------|
| `REQ-FEAT_*` | `REQ-FEAT_MANIFEST_SCHEMA` | Batch 0–1 |
| `ARCH-FEAT_*` | `ARCH-FEAT_LIFECYCLE_STATE_MACHINE` | Batch 0–1 |
| `IMPL-FEAT_*` | `IMPL-FEAT_MANIFEST_VALIDATOR` | Batch 0–1 |
| `REQ-FEAT_CLARIFICATION_*` | `REQ-FEAT_CLARIFICATION_GATES` | Batch 2 |
| `REQ-FEAT_CONSTITUTION_*` | `REQ-FEAT_CONSTITUTION_SCHEMA` | Batch 2 |
| `REQ-FEAT_TASK_*` | `REQ-FEAT_TASK_GRAPH_SCHEDULING` | Batch 3 |
| `REQ-FEAT_VIEW_*` | `REQ-FEAT_VIEW_GENERATION` | Batch 4 |
| `REQ-FEAT_ONBOARDING_*` / migration / offline | `REQ-FEAT_ONBOARDING_COMMANDS` | Batch 6 |

---

## Alphabetical index

| Term | Section |
|------|---------|
| explicit migration confirmation | Batch 6 terms |
| amendment compatibility | Batch 2 terms |
| clarification gate | Batch 2 terms |
| clarification record | Preferred terms vs synonyms |
| constitution article | Batch 2 terms |
| constitution compliance | Batch 2 terms |
| constitution diagnostic | Batch 2 terms |
| constitution exception | Batch 2 terms |
| feature identifier | Preferred terms vs synonyms |
| feature lifecycle | Preferred terms vs synonyms |
| feature manifest | Preferred terms vs synonyms |
| feature orchestration CLI | Preferred terms vs synonyms |
| feature-spec batch | Preferred terms vs synonyms |
| generated view | Preferred terms vs synonyms |
| project constitution | Preferred terms vs synonyms |
| readiness projection | Batch 3 terms |
| stale resolution | Batch 2 terms |
| stale input | Batch 3 terms |
| task derivation | Batch 3 terms |
| task graph | Preferred terms vs synonyms |
| task identity | Batch 3 terms |
| execution evidence history | Batch 3 terms |
| unsafe parallelization | Batch 3 terms |
| generated view renderer | Batch 4 terms |
| local default resolution | Batch 6 terms |
| migration backup | Batch 6 terms |
| migration conflict report | Batch 6 terms |
| migration preview | Batch 6 terms |
| offline fallback | Batch 6 terms |
| onboarding command | Batch 6 terms |
| proof-boundary label | Batch 4 terms |
| readiness diagnostic | Batch 6 terms |
| registered token families | Registered token families |
| semantic comparison | Batch 4 terms |
| source revision metadata | Batch 4 terms |
| stale-view detection | Batch 4 terms |
| stale-view policy | Batch 4 terms |
| view source projection | Batch 4 terms |
