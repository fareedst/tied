# TIED Improvement Roadmap

**Status:** Batches 0–6 implemented and validated — Git integration remains deferred
**Refined:** 2026-08-13 (`refine-plan` on this document)
**Scope:** All recommendations from the TIED comparison with GitHub Spec Kit's
[Specification-Driven Development](https://raw.githubusercontent.com/github/spec-kit/refs/heads/main/spec-driven.md)
model
**Decision:** Implement every accepted recommendation through separately governed
batches. The batches below define the order, dependency gates, parallel work, and
proof required before promotion.

**Roadmap owner:** Planning artifact for the TIED methodology repository (`stdd`).
It does not create feature REQ/ARCH/IMPL tokens, mutate project YAML, or authorize
branch/worktree actions. Each implementation batch is a separate TIED change request
and must create or update its own traceability stack before code or tests are written.

**Vocabulary:** Provisional terms are recorded in [`tied/vocab/feature-orchestration.md`](../../tied/vocab/feature-orchestration.md).
Batch 0 confirms naming bridges and registers semantic tokens.

**This refinement:** Documentation and vocabulary only. CITDP persistence for this
refinement is intentionally skipped per [`tied/docs/citdp-policy.md`](../../tied/docs/citdp-policy.md)
(non-behavior-changing docs). Behavior-changing batches persist CITDP after implementation.

---

## 0. Refined scope and operating contract

### In scope

- A **feature orchestration** layer that references, but does not replace, the
  canonical REQ/ARCH/IMPL graph.
- Greenfield specification-first workflows and brownfield migration/retrofit
  workflows, with explicit separation between them.
- Structured **feature lifecycle** state, **clarification record** and **project
  constitution** gates, dependency-aware **task graph** execution, **generated
  views**, research records, and reviewed feedback promotion.
- **Feature orchestration CLI** and MCP tools that delegate YAML CRUD, consistency
  validation, quality evidence, LEAP proposal review, and existing `agentstream`
  behavior to validated surfaces already in the repository.

### Out of scope

- Copying full REQ/ARCH/IMPL content into a feature package.
- Replacing `tied-cli.sh`, the TIED YAML MCP, `agentstream`, the checklist, strict
  TDD, composition evidence, LEAP, or quality proof with a second implementation.
- Silent Git branch/worktree creation, automatic canonical YAML promotion, or
  automatic acceptance of residual risk.
- Treating generated Markdown, structural validation, or a green dry-run as proof
  of runtime correctness.

### Tool boundaries (resolved)

| Surface | Role | Do not confuse with |
|---------|------|---------------------|
| `tied-cli.sh` / TIED YAML MCP | Project REQ/ARCH/IMPL CRUD, validation, verify | Feature lifecycle orchestration |
| `agentstream` | Turn pipeline, **feature-spec batch**, checklist render, dry-run | Feature manifest storage |
| Future **feature orchestration CLI** (`tied init`, `tied feature …`) | Product UX for manifests, lifecycle, views | `tied-cli.sh` |
| **Feature manifest** (`tied/features/…/feature.yaml`) | Orchestration index + lifecycle | Fidelity **project manifest** ([`fidelity-research.md`](../../tied/vocab/fidelity-research.md)) |

### Contract for every batch

Each batch must have: a change definition; affected and new semantic tokens;
module boundaries; dependency and migration rules; risk/profile decisions;
token-commented IMPL pseudo-code; a test strategy; RED → GREEN →
composition → justified E2E ordering; validation evidence; and a close-out
decision. If implementation evidence differs from the plan, apply LEAP in the
order IMPL → ARCH → REQ before continuing.

**MCP-first:** Mutate project YAML only via `tied-cli.sh` or the TIED YAML MCP
after `tied_config_get_base_path` confirms the active `tied/` tree. IMPL
pseudo-code sidecars remain the plain-text exception.

**Verification-gated mode:** Where enabled, requirement and IMPL `status` change
only through `tied_verify` after tests — never by hand ([PROC-TIED_VERIFICATION_GATED]).

---

## 0.1 Refine outcomes (Touchpoint 1)

### Resolved vocabulary bridges

| Sponsor / Spec Kit term | Canonical TIED term | Notes |
|-------------------------|---------------------|-------|
| Feature package | **feature manifest** + generated views | Manifest references tokens; generated Markdown views are committed and stale-checked by CI |
| specify → plan → tasks | **feature lifecycle** phases | Maps to checklist phases, not a replacement stack |
| NEEDS_CLARIFICATION | **clarification record** (canonical) + view marker | Structured record blocks phases |
| Constitution | **project constitution** | Project-owned `tied/constitution.yaml`; not `AGENTS.md` |
| tasks.md | **task graph** (canonical) + **generated view** | Scheduler reads graph, not Markdown |
| `initial-specs.yaml` | Legacy **feature-spec batch** input | Migrate in Batch 6; see README example `prompts/initial-specs.yaml` |
| `tied feature` commands | **feature orchestration CLI** | Separate orchestration binary; not `tied-cli.sh` |

Full glossary: [`tied/vocab/feature-orchestration.md`](../../tied/vocab/feature-orchestration.md).

### Resolved sponsor decisions

The following decisions are accepted for Batch 0 schema work:

1. **Feature ID format:** Use `FEAT-{NNN}` with zero-padded numbering and a slug
   suffix in directory names, such as `FEAT-003-chat-system`.
2. **Constitution storage:** Reserve `tied/constitution.yaml` as the canonical
   project-owned path; Batch 2 owns its schema and analyzer.
3. **Generated view commit policy:** Commit generated Markdown in feature
   directories; CI enforces stale-view detection using source revisions or hashes.
4. **Branch/worktree integration:** Defer branch/worktree support until after
   Batch 1; no Batch 0 or initial Batch 1 implementation may create Git state.
5. **Orchestration CLI:** Deliver a separate feature orchestration binary rather
   than a `tied` subcommand or an overload of `tied-cli.sh`; select the exact
   binary name at Batch 1 start.
6. **Clarification storage:** Store clarification records in a feature-local
   `clarifications.yaml` sidecar; Batch 2 owns its schema and gates.

Non-blocking and deferred: exact MCP tool surface naming remains open for
Batch 1–2, and the exact separate binary name is selected at Batch 1 start.

---

## 0.2 Plan metadata (Touchpoint 2)

| Item | Value |
|------|-------|
| Checklist spine | [PROC-AGENT_REQ_CHECKLIST] — [`agent-req-implementation-checklist.md`](../../tied/docs/agent-req-implementation-checklist.md) |
| Per-batch Tracker | Copy [`agent-req-implementation-checklist.yaml`](../../tied/docs/agent-req-implementation-checklist.yaml) to a working folder at batch start (header instructions) |
| CITDP policy | [`citdp-policy.md`](../../tied/docs/citdp-policy.md) — persist after each behavior-changing batch |
| CITDP template | [`citdp-record-template.yaml`](../../tied/docs/citdp-record-template.yaml) |
| YAML mutation index | [`tied-yaml-agent-index.md`](../../tied/docs/tied-yaml-agent-index.md) |
| Roadmap refinement CITDP | **Skipped** (docs-only per policy) |

### CITDP vs narrative items

| Artifact | Type | When |
|----------|------|------|
| This roadmap | Narrative plan | Planning reference; not a CITDP substitute |
| `CITDP-FEAT-ORCH-BATCH-{N}` | CITDP record | After Batch N implementation ([`citdp-policy.md`](../../tied/docs/citdp-policy.md) default) |
| `leap-proposals/` entries | LEAP proposal queue | Out-of-scope recommendations during any batch |
| Batch REQ/ARCH/IMPL stack | TIED traceability | Before RED tests for that batch |

Suggested CITDP change-request IDs: `CITDP-FEAT-ORCH-BATCH-0` … `CITDP-FEAT-ORCH-BATCH-6`.

---

## 1. Purpose and outcome

TIED already provides a stronger traceability and evidence system than the
Spec Kit document describes:

```text
domain vocabulary
  -> REQ
  -> ARCH
  -> IMPL pseudo-code
  -> tests
  -> production code
  -> validation and close-out
```

The main gap is usability and feature-level orchestration. TIED records are
distributed across several indexes and checklist steps, while Spec Kit presents
one feature as a navigable package with a simple specify → plan → tasks flow.

This roadmap adds that product layer without replacing TIED's canonical
REQ/ARCH/IMPL graph, strict TDD, composition evidence, LEAP, CITDP, or quality
validation.

---

## 2. Guiding decisions

1. **TIED remains canonical.** REQ, ARCH, IMPL, semantic tokens, tests, and
   evidence remain authoritative. **Generated views** must never become a
   competing source of truth.
2. **Generated output must not be confused with proof.** A generated plan or
   test is not evidence that runtime behavior is correct. Runtime tests,
   quality evidence, and human decisions retain their existing boundaries.
3. **Human review remains explicit.** Clarification resolution, constitutional
   exceptions, alternate approaches, feedback promotion, and risk acceptance
   require reviewable decisions.
4. **Greenfield and brownfield paths remain separate.** New features use
   specification-first authoring; existing systems continue to use TIED's
   evidence-first retrofit and fidelity-research paths.
5. **Advanced controls remain available.** The simplified workflow must call
   the same validated MCP, CLI, checklist, and agentstream operations rather
   than creating an unvalidated parallel path.
6. **Language and framework neutrality is preserved.** **Project constitutions**
   may impose language-specific rules, but the core TIED methodology remains
   language-agnostic.

---

## 3. Current capabilities to reuse

Implementation should extend, not duplicate, these existing components:

- `tied/requirements.yaml`,
  `tied/architecture-decisions.yaml`, and
  `tied/implementation-decisions.yaml` are the canonical traceability graph.
- IMPL pseudo-code sidecars and
  `tied/docs/pseudocode-writing-and-validation.md` already provide contracts,
  symbol checks, dependency checks, and LEAP alignment.
- `tied/docs/agent-req-implementation-checklist.md` already defines the
  governed implementation sequence.
- `tools/agentstream` already supports **feature-spec batch**, checklist turns,
  resume, dry-run, and controlled loop-backs ([REQ-GOAGENT-FEATURESPEC-BATCH]).
- The TIED YAML MCP already provides structured CRUD, traceability queries,
  validation, token rename, backlog, cycles, and analysis
  ([`tied-yaml-agent-index.md`](../../tied/docs/tied-yaml-agent-index.md)).
- CITDP, LEAP proposals, feedback storage, fidelity research, quality profiles,
  binding inventories, and evidence manifests already provide building
  blocks for later lifecycle features.

---

## 4. Batch overview

| Batch | Priority | Depends on | Anticipated token family | CITDP after impl | build-plan entry |
|-------|----------|------------|--------------------------|------------------|------------------|
| 0 Foundation | P0 | — | `REQ-FEAT_*`, `ARCH-FEAT_*`, `IMPL-FEAT_*` | `CITDP-FEAT-ORCH-BATCH-0` | **Next** — `plan-new-feature` + `build-plan` |
| 1 Package + lifecycle | P0 | 0 | extends `FEAT_*` | `CITDP-FEAT-ORCH-BATCH-1` | After Batch 0 promotion |
| 2 Clarifications + constitution | P0 | 0 | `REQ-FEAT_CLARIFICATION_*`, `REQ-FEAT_CONSTITUTION_*` | `CITDP-FEAT-ORCH-BATCH-2` | After Batch 0 promotion |
| 3 Task graph + agentstream | P0 | 0, 1, 2 | `REQ-FEAT_TASK_*` | `CITDP-FEAT-ORCH-BATCH-3` | After 1+2 integrated |
| 4 Generated views | P1 | 0, 1 (+3 for tasks) | `REQ-FEAT_VIEW_*` | `CITDP-FEAT-ORCH-BATCH-4` | Partial after 1 |
| 5 Research + feedback | P1 | 0, 1 | links existing feedback/LEAP tokens | `CITDP-FEAT-ORCH-BATCH-5` | After feature links |
| 6 Onboarding | P1 | 1–4 | extends orchestration CLI | `CITDP-FEAT-ORCH-BATCH-6` | After user path stable |

Exact token names are registered in Batch 0 via `tied_token_create_with_detail`
(not pre-created by this roadmap).

---

## 5. Recommended implementation batches

### Batch 0 — Foundation and contracts

**Priority:** P0
**Purpose:** Define the shared data model and boundaries before adding user
workflows.

**Logical modules**

1. **Manifest schema** — parse, validate, defaults, version policy.
2. **Lifecycle engine** — transition matrix, guards, revision checks, atomic writes.
3. **Reference linker** — resolve `canonical_tokens` to project YAML indexes.
4. **Fixture corpus** — greenfield, brownfield, migration, and failure scenarios.

**Work required**

- Define a **feature manifest** schema (`schema_version: feature-manifest.v1`).
- Define the **feature lifecycle** state machine, legal transitions, command
  preconditions, blocked-state derivation, and human approval points.
- Define artifact ownership, revision identity, persistence boundaries, and
  migration rules.
- Define stable **feature identifiers** and slugs.
- Define relationships between a feature manifest and canonical REQ/ARCH/IMPL
  tokens.
- Define versioning and backward-compatibility rules for new tools.
- Add representative greenfield, brownfield, ambiguous, multi-module,
  multi-approach, stale-view, partial-write, and migration fixtures.
- Create REQ/ARCH/IMPL records for the implementation work before production
  changes, following the normal TIED checklist (`plan-new-feature` → Tracker).

**Proposed feature manifest shape**

```yaml
schema_version: feature-manifest.v1
feature_id: FEAT-003
slug: chat-system
title: Real-time chat system
mode: greenfield | brownfield
status: specified
revision: 1
created_at: ISO-8601
updated_at: ISO-8601
canonical_tokens:
  requirements: []
  architecture: []
  implementations: []
artifacts: []
open_questions: []
dependencies: []
tasks: []
history: []
```

The manifest references canonical records and generated artifacts; it must not
copy their full content. Batch 0 must define required fields, allowed status
transitions, immutable versus mutable fields, revision behavior, duplicate-ID
handling, and whether timestamps participate in deterministic comparisons.

The feature lifecycle is persisted as:

```text
draft -> refining -> specified -> planned -> tasked -> verifying -> closed
```

`abandoned` is a terminal state. Blocking questions, failed dependencies, and
failed verification are derived blockers (or explicit transition guards), not
an unbounded second state machine. Every transition records the actor, reason,
input revision, output revision, and evidence/approval references. Commands must
reject illegal transitions without partial writes.

**Expected output**

- A stable schema and migration strategy.
- A lifecycle transition matrix and ownership model.
- Validator fixtures proving that feature records can link to existing TIED data
  without weakening current consistency checks.
- A clear boundary between feature orchestration and the existing
  `tied-yaml` CRUD client.
- A compatibility contract for reading older manifests and rejecting unsupported
  schema versions deterministically.
- Glossary confirmation in [`feature-orchestration.md`](../../tied/vocab/feature-orchestration.md).

**Exit criteria**

- Schema review completed.
- Lifecycle and migration review completed.
- Backward-compatibility and round-trip tests pass.
- Invalid references, duplicate IDs, illegal transitions, incomplete lifecycle
  states, unsupported versions, and partial writes are rejected deterministically.
- Greenfield and brownfield fixtures preserve canonical record ownership.
- `lint_yaml` on changed YAML; `tied_validate_consistency` passes.
- `tied_verify` updates status when verification-gated mode is enabled.

**Risks**

| Risk | Mitigation |
|------|------------|
| Duplicate source of truth | Manifest stores references only; validators reject embedded canonical bodies |
| Schema churn | `schema_version` gate + explicit migration notes |
| Vocab drift | RECORD in `feature-orchestration.md` before token registration |

### Batch 1 — Feature package and lifecycle commands

**Priority:** P0
**Depends on:** Batch 0
**Can run in parallel with:** Batch 2 after manifest and lifecycle contracts are
stable. End-to-end lifecycle enforcement waits for Batch 2 gates.

**Logical modules**

1. **Feature store** — `tied/features/<feature-id>/` persistence, locking, idempotent create.
2. **Orchestration commands** — specify, refine, plan, tasks, verify, close out.
3. **Orchestration MCP** — parallel tool surface; delegates YAML to TIED YAML MCP.
4. **Deferred Git integration** — branch/worktree support is outside the initial
   Batch 1 delivery and requires a later, separately governed change.

**Work required**

- Add feature-level storage: `tied/features/<feature-id>/feature.yaml`.
- Implement feature creation with deterministic numbering and slug generation.
- Make creation idempotent for the same explicit request key; define collision/locking
  for concurrent creators.
- Do not create branches or worktrees in the initial Batch 1 delivery; preserve
  the existing repository state until a later Git-integration change is approved.
- Link the feature to its REQ, ARCH, and IMPL records as they are created.
- Add lifecycle operations equivalent to: specify, refine, plan, tasks, verify,
  close out.
- Expose operations through the **feature orchestration CLI** and MCP tools.
  Do not overload `tied-cli.sh` (TIED YAML MCP client).
- Require every mutating command to validate manifest revision, write atomically,
  and return the next permitted lifecycle phase.

**Expected behavior/output**

```text
tied feature new "Real-time chat system"
  -> FEAT-003
  -> tied/features/FEAT-003-chat-system/feature.yaml
  -> open clarification list
  -> linked REQ placeholder
```

Later commands should show the entire feature state and identify the next
permitted checklist phase.

**Exit criteria**

- Feature creation is deterministic and idempotent.
- Existing TIED projects can use the feature workflow without migrating all
  existing records.
- Branch/worktree actions are auditable and never occur silently.
- A feature can be resumed from its persisted lifecycle state.
- Illegal transitions, stale revisions, duplicate creation requests, and partial
  writes are covered by failing-then-passing tests.
- Composition tests cover CLI/MCP → store → lifecycle engine bindings.

### Batch 2 — Clarifications and constitution

**Priority:** P0
**Depends on:** Batch 0
**Can run in parallel with:** Batch 1 after the shared manifest contract is
stable. Batch 1 lifecycle commands may not claim a transition blocked by these
gates until Batch 2 validation is integrated.

#### 2A. Structured clarification management

**Work required**

- Add structured **clarification records** with:
  `id`, `question`, `affected_scope`, `blocking`, `owner`, `priority`,
  `status`, `decision`, `resolved_at`, and evidence/approval references.
- Support `[NEEDS_CLARIFICATION]` in human-readable views while keeping the
  structured record canonical.
- Add gates that distinguish:
  - informational uncertainty;
  - uncertainty blocking REQ authoring;
  - uncertainty blocking ARCH/IMPL authoring;
  - uncertainty blocking RED tests.
- Define resolution ownership, stale-resolution behavior after a scope revision,
  and the rule that unresolved blocking questions prevent the affected phase.

**Expected behavior/output**

- Agents must expose uncertainty instead of silently selecting plausible
  defaults.
- `tied feature status` reports unresolved blocking questions and the phase
  they block.
- Resolutions become durable decision evidence linked to affected records.

#### 2B. Project constitution

**Work required**

- Add a versioned **project constitution**, canonical path
  `tied/constitution.yaml` (confirm in §0.1).
- Support articles, scope, enforcement level, exceptions, approver, rationale,
  and amendment history.
- Add a constitution compliance analyzer for REQ, ARCH, IMPL, task plans, and
  CITDP records.
- Define whether constitution data is project-owned structured data or a
  feature-local reference, and route writes through the owning validated tool.
- Define rule precedence, deterministic diagnostics, exception expiry, and
  amendment compatibility.

**Expected behavior/output**

- Projects can enforce principles such as simplicity, library-first design,
  CLI accessibility, integration-first testing, security, or deployment
  constraints.
- Every exception has an owner, rationale, and review status.
- Constitution failures are reported before implementation, not discovered
  only during review.

**Exit criteria for Batch 2**

- Blocking clarification tests cover missing, resolved, and non-blocking
  questions.
- Constitution tests cover pass, fail, and explicitly approved exception
  cases.
- Constitution rules do not bypass existing TIED consistency or quality gates.
- An unresolved blocking question, failed constitution rule, or expired
  exception cannot be hidden by a generated view or overridden by the CLI.

### Batch 3 — Task graph and agentstream execution

**Priority:** P0
**Depends on:** Batches 0, 1, and 2 for the complete readiness contract. The
task schema may be prototyped after Batch 0, but task derivation and scheduling
cannot be promoted before clarification and constitution gates are available.
**Can run in parallel with:** Batch 4 after the task schema and source projection
contract are stable.

**Logical modules**

1. **Task derivation** — from REQ acceptance criteria, ARCH boundaries, IMPL blocks.
2. **Graph scheduler** — readiness, cycles, parallel groups, retry/resume.
3. **Agentstream adapter** — extends existing batch execution without breaking
   **feature-spec batch** compatibility ([REQ-GOAGENT-FEATURESPEC-BATCH]).

**Work required**

- Derive **task graph** entries from REQ acceptance criteria, ARCH boundaries,
  IMPL blocks, contracts, testability classifications, and quality profiles.
- Add task fields for:
  `task_id`, `source_tokens`, `depends_on`, `deliverables`, `test_level`,
  `parallel_group`, `status`, and `evidence`.
- Detect cycles and unsafe parallelization.
- Define failure, retry, cancellation, timeout, stale-input, and resume
  semantics; do not infer readiness from task text.
- Extend `tools/agentstream` to execute independent task groups while
  preserving:
  - pseudo-code before RED;
  - RED before GREEN;
  - module validation before composition;
  - composition before justified E2E;
  - validation before close-out.
- Define the stable task-graph source projection consumed by Batch 4; human-readable
  `tasks.md` remains a Batch 4 **generated view** and is not implemented here.

**Expected behavior/output**

- TIED can explain why a task is ready, blocked, or parallelizable.
- Independent modules can be worked on concurrently without allowing a
  dependent integration task to start early.
- Task completion links directly to tests and validation evidence.

**Exit criteria**

- Deterministic task derivation tests pass.
- Dependency cycles and invalid source references are rejected.
- Dry-run output is stable and matches live scheduling decisions.
- Existing ordered **feature-spec batch** inputs remain supported.
- A failed task cannot unlock dependents; retries and resumed runs preserve task
  identity and evidence history.
- Parallel execution is limited to independent modules whose readiness and
  module-validation evidence are complete.

**Batch 3 implementation evidence (2026-08-13):** The MCP feature-orchestration
modules now provide deterministic task derivation, cycle/readiness projection,
safe-group rejection, append-only execution recovery, and an additive
agentstream adapter. TypeScript build and full MCP tests pass (238/238), the
focused Batch 3 tests pass (8/8), and the existing Go agentstream suite passes.
The four Batch 3 REQ records are verification-gated to Implemented and the four
IMPL records to Active. Generated views, durable production task persistence,
and Go CLI wiring remain explicitly deferred.

### Batch 4 — Human-readable generated views

**Priority:** P1
**Depends on:** Batch 0 and the feature manifest from Batch 1. Core
specification/plan views may proceed once their source projections are stable;
task and execution views additionally depend on Batch 3.
**Can run in parallel with:** Batch 5 after the relevant source projection
contracts are stable.

**Work required**

- Build renderers for **generated views**:
  - `spec.md`: goal, behavior, boundaries, acceptance criteria, open questions;
  - `plan.md`: architecture, implementation decisions, alternatives, constitution;
  - `tasks.md`: dependency-aware executable work;
  - `quickstart.md`: setup and validation scenarios;
  - `data-model.md`: relevant data structures;
  - `contracts/`: API, event, CLI, or module contracts.
- Mark generated files clearly (banner + source revision).
- Add deterministic rendering and semantic comparison tests.
- Add stale-view detection based on source record hashes or revision IDs.
- Define commit vs disposable policy (sponsor decision §0.1).
- Preserve token links, evidence links, and proof-boundary labels in every view.

**Expected behavior/output**

- Reviewers can understand a feature from one directory.
- Agents can consume compact feature views without rereading the entire
  repository.
- Stale generated documents are reported rather than mistaken for current
  intent.

**Exit criteria**

- Regenerating unchanged records produces no diff.
- Source-of-truth changes identify exactly which views are stale.
- Rendered views preserve links to REQ/ARCH/IMPL tokens and evidence.
- Stale views fail or warn deterministically per explicit policy.

### Batch 5 — Research and operational feedback

**Priority:** P1
**Depends on:** Batch 0; feature links from Batch 1
**Can run in parallel with:** Batch 4 after feature-link and evidence contracts
are stable. Research and feedback remain independently deployable from the
feature lifecycle.

#### 5A. Research records

**Work required**

- Add research records for library comparisons, benchmarks, security findings,
  organizational constraints, and experiments.
- Store source, date, method, conclusion, uncertainty, and affected decisions.
- Link research records to ARCH and IMPL alternatives.
- Keep research records outside audited project YAML when using the read-only
  fidelity-research profile; preserve artifact snapshots and evidence provenance
  ([REQ-TIED_FIDELITY_RESEARCH]).
- Require a freshness policy and an explicit distinction between candidate
  findings, confirmed case reports, and accepted uncertainty.

**Expected output**

- Architecture decisions identify the evidence behind technology choices.
- Research freshness and unresolved uncertainty are visible during refinement.

#### 5B. Operational feedback promotion

**Work required**

- Extend existing feedback and LEAP proposal workflows
  ([REQ-FEEDBACK_TO_TIED], [REQ-LEAP_PROPOSAL_QUEUE], [PROC-LEAP]) with:
  source type, affected feature, severity, evidence links, duplicate grouping,
  proposed REQ, and promotion status.
- Add import adapters for incidents, metrics, test failures, and user reports.
- Require review before promotion into canonical project YAML.
- Keep feedback entries distinct from LEAP proposals; promotion is an explicit
  human-reviewed transition, not an automatic write.

**Expected behavior/output**

```text
incident or metric
  -> feedback record
  -> reviewed LEAP proposal
  -> updated REQ / ARCH / IMPL
  -> regression evidence
```

TIED will support a controlled production-reality feedback loop without
automatically polluting canonical intent.

### Batch 6 — Low-friction onboarding and adoption

**Priority:** P1
**Depends on:** Batches 1–4
**Can run in parallel with:** Batch 5. Batch 6 is an adoption layer only and
must not introduce a second implementation of lifecycle, YAML, scheduling, or
validation behavior.

**Work required**

- Add safe top-level orchestration commands:

  ```text
  tied init
  tied feature new "Add count-lines CLI"
  tied feature build
  ```

- Provide sensible local defaults for the MCP binary, TIED base path,
  project constitution, and feature directory.
- Preserve the existing explicit MCP and manual/offline workflows
  ([`using-tied-without-mcp.md`](../../tied/docs/using-tied-without-mcp.md)).
- Add a concise quickstart for new users and a full advanced reference.
- Add readiness diagnostics that explain the exact missing prerequisite.
- Add migration guidance from legacy `prompts/initial-specs.yaml` (or equivalent
  **feature-spec batch** files) and ordered `agentstream` batches into feature
  manifests.
- Define a dry-run migration preview, conflict report, rollback/backup behavior,
  and explicit confirmation before any persisted migration.

**Expected behavior/output**

- A new user can create and begin one governed feature without first learning
  every internal TIED file and MCP operation.
- Advanced users retain direct access to all existing validators and tools.
- Errors identify corrective commands rather than requiring repository
  archaeology.

**Exit criteria**

- A fresh project can reach a persisted, reviewable feature specification with
  one documented setup path.
- Existing projects can adopt feature packages incrementally.
- Offline use remains supported when Node/MCP is unavailable.
- Readiness diagnostics identify the exact unmet prerequisite and corrective
  command without silently changing project configuration.

---

## 6. Cross-cutting validation requirements

Every batch must follow the normal TIED development cycle
([PROC-TIED_DEV_CYCLE], [PROC-AGENT_REQ_CHECKLIST]):

1. Create or update the relevant REQ/ARCH/IMPL records (MCP-first).
2. Write and validate IMPL pseudo-code before implementation tests
   ([PROC-PSEUDOCODE_VALIDATION]).
3. Use RED → GREEN → REFACTOR for unit behavior.
4. Add composition tests before composition code
   ([REQ-MODULE_VALIDATION], binding inventory).
5. Add E2E only for justified UI/platform boundaries.
6. Validate YAML through the TIED YAML tooling (`lint_yaml`, [PROC-YAML_EDIT_LOOP]).
7. Run `tied_validate_consistency`.
8. Test both greenfield and brownfield paths.
9. Test migration, stale data, invalid references, and partial failure.
10. Preserve diagnostic output and evidence provenance.

New feature-level validators should distinguish these proof boundaries:

| Boundary | Examples | Not proof of |
|----------|----------|--------------|
| Specification completeness | schema, lifecycle, required fields | runtime correctness |
| Traceability integrity | token refs, `tied_validate_consistency` | quality/security evidence |
| Task readiness | graph edges, module evidence | specification completeness |
| Constitution compliance | project rules, exceptions | runtime correctness |
| Runtime correctness | unit, composition, justified E2E tests | structural validation alone |
| Quality/security evidence | assurance profiles, evidence manifest | product intent completeness |
| Human approval | waivers, LEAP promotion, branch opt-in | any automated gate |

Passing one boundary must never be reported as proof of another.

### Batch promotion gates

No batch is complete until all of these gates pass:

1. **Specification gate:** required fields, lifecycle transitions, invariants,
   and non-goals are validated from a versioned schema.
2. **Traceability gate:** feature references resolve to canonical REQ/ARCH/IMPL
   records; generated artifacts never become replacement intent.
3. **Module gate:** each logical module has independent unit/contract,
   edge-case, and failure-path validation before integration
   ([REQ-MODULE_VALIDATION]).
4. **Composition gate:** every binding inventory row has a UI-free composition
   test, or an explicit platform-constrained E2E justification.
5. **Execution gate:** task readiness, cycle detection, parallel groups, retry,
   resume, and failure behavior agree in dry-run and live execution.
6. **Quality gate:** applicable assurance profiles, evidence provenance, proof
   boundaries, residual-risk owners, and expiry are recorded
   ([REQ-QUALITY_ASSURANCE_EVIDENCE], [PROC-QUALITY_ASSURANCE]).
7. **Migration gate:** migration preview, conflict handling, rollback/backup,
   and old-client compatibility are tested before persisted migration.
8. **Close-out gate:** language lint, YAML tooling, token audit,
   `tied_validate_consistency`, documentation sync, and required human
   approvals pass. Status changes use `tied_verify` when verification-gated
   mode is enabled.

### Test strategy outline

- **Schema and lifecycle modules:** unit tests for parsing, defaults,
  deterministic IDs, legal transitions, revision conflicts, atomic writes, and
  idempotent replay.
- **Clarification and constitution modules:** unit and contract tests for
  blocking/non-blocking questions, rule precedence, failed checks, approved
  exceptions, expiry, and revision invalidation.
- **Task graph and scheduler:** unit tests for derivation, cycle detection,
  readiness, unsafe parallelism, retry/cancel/timeout semantics, and stable
  dry-run output; integration tests for `agentstream` delegation and resume.
- **Renderers:** deterministic semantic comparison, stale-view detection,
  token/evidence link preservation, and unchanged-input no-diff tests.
- **Research and feedback:** read-only safety, duplicate grouping, provenance,
  explicit review, LEAP proposal separation, and regression-link tests.
- **Migration and onboarding:** fixture-based greenfield/brownfield migration,
  conflict/rollback, offline diagnostics, and incremental adoption tests.
- **E2E:** only where a named platform boundary requires UI invocation; CLI,
  MCP, event, and entry-point bindings remain composition-testable.

### Dependency and release gates

The normative dependency graph is:

```text
Batch 0 ──┬── Batch 1 ──┬── Batch 3 ──┬── Batch 4 tasks ──┐
          │             │             └───────────────────┼── Batch 6
          ├── Batch 2 ──┘                                 │
          ├── Batch 4 core ───────────────────────────────┤
          └── Batch 5 ────────────────────────────────────┘
```

Batch 1 and Batch 2 may develop independently after Batch 0, but neither may
claim a complete lifecycle workflow until both pass. Batch 3 consumes the
clarification, constitution, manifest, and canonical-token projections. Batch 4
may start with stable manifest projections, but task views wait for Batch 3.
Batch 5 may run independently after feature links are stable. Batch 6 is blocked
until the user-facing path, migration path, and readiness diagnostics all pass.

Each batch is released behind a versioned contract and migration note. A failed
batch does not unlock dependents; it returns to its owning module or specification
gate with evidence and a recorded residual risk.

### Cross-batch risks and mitigations

- **Duplicate source of truth:** keep manifests as references and generated
  views revisioned; reject copied canonical content.
- **Lifecycle bypass:** enforce transitions in one orchestration module and test
  every command through the same state machine.
- **Concurrent IDs or writes:** use explicit request keys, revision checks, and
  atomic persistence; make collision behavior deterministic.
- **Unsafe parallelism:** derive readiness from graph edges and module evidence,
  never from task ordering or prose.
- **Stale generated views:** include source revision/hash and fail or warn by
  policy before review or execution.
- **Migration loss:** require dry-run, conflict report, backup/rollback, and
  explicit confirmation; preserve existing ordered `agentstream` behavior.
- **Canonical pollution:** keep fidelity findings and LEAP proposals outside
  project YAML until reviewed and promoted through existing tools.
- **Proof confusion:** label specification, structural, runtime, quality, and
  human-approval boundaries separately in status output.
- **Scope expansion:** new schema concepts and tokens are resolved and recorded
  in Batch 0; later batches cannot silently invent incompatible names.
- **Wrong TIED_BASE_PATH:** call `tied_config_get_base_path` at batch start;
  align `.cursor/mcp.json` before MCP writes (CITDP RISK-010 pattern).

---

## 7. Recommended parallel workstreams

After Batch 0:

- **Workstream A — Data and validators:** feature manifest, clarification,
  constitution, task graph, research, feedback schemas.
- **Workstream B — MCP and CLI:** read/write/query tools, orchestration
  commands, diagnostics, migration commands.
- **Workstream C — Agent execution:** agentstream task scheduling, readiness
  gates, resume, dry-run, and evidence capture.
- **Workstream D — Presentation:** Markdown renderers, quickstart, contracts,
  task views, stale-view detection.
- **Workstream E — Verification:** fixtures, integration tests, migration tests,
  parity tests, and documentation.

Workstream E owns the promotion evidence for every increment. Workstreams B–D
may proceed in parallel only after the relevant Batch 0 contracts are stable,
and each workstream must publish its input contract, output artifacts, blocking
dependencies, and proof boundary before another workstream consumes it.

---

## 8. Traceability and close-out requirements

The roadmap is constrained by existing methodology records rather than new
roadmap-only tokens:

- **Core structure and setup:** [REQ-TIED_SETUP], [ARCH-TIED_STRUCTURE],
  [IMPL-TIED_FILES].
- **Independent validation and composition:** [REQ-MODULE_VALIDATION],
  [ARCH-MODULE_VALIDATION], [IMPL-MODULE_VALIDATION],
  [PROC-TEST_STRATEGY], [PROC-AGENT_REQ_CHECKLIST].
- **Execution and existing batch compatibility:**
  [REQ-GOAGENT-PIPELINE-CHAIN], [REQ-GOAGENT-FEATURESPEC-BATCH], and the
  corresponding `agentstream` implementation decisions.
- **Feedback and reviewed LEAP promotion:** [REQ-FEEDBACK_TO_TIED],
  [REQ-LEAP_PROPOSAL_QUEUE], [PROC-LEAP].
- **Brownfield research:** [REQ-TIED_FIDELITY_RESEARCH] and its read-only
  research boundary.
- **Quality and evidence:** [REQ-QUALITY_ASSURANCE_EVIDENCE],
  [ARCH-QUALITY_ASSURANCE_PROFILES], [IMPL-QUALITY_EVIDENCE_MANIFEST],
  [PROC-QUALITY_ASSURANCE], [PROC-QUALITY_EVIDENCE_PROVENANCE].
- **Workflow distribution:** [REQ-PROMPT_TYPE_GLOBAL_SKILLS] and the
  versioned Prompt Composer skill bundle.

Before implementation of Batch 0, run `plan-new-feature` for the foundation work,
create feature-specific REQ/ARCH/IMPL records, and register tokens through the
TIED YAML MCP or `tied-cli`. Before each later batch, update the affected stack
through LEAP when the contract changes. Persist `tied/citdp/CITDP-FEAT-ORCH-BATCH-{N}.yaml`
after each behavior-changing batch (risks, test strategy, evidence provenance,
divergences, residual-risk decisions).

---

## 9. Definition of success

The roadmap is complete when a developer can:

1. Initialize TIED with a safe, concise command.
2. Create or import a feature without losing brownfield behavior.
3. See unresolved questions instead of receiving silent guesses.
4. Review a feature's specification, architecture, implementation plan, tasks,
   contracts, and quickstart in one place.
5. Run tasks sequentially or safely in parallel.
6. Trace every task and test back to canonical TIED records.
7. See constitution, quality, and risk failures before implementation.
8. Feed reviewed operational evidence back into future requirements.
9. Resume work from persisted feature state.
10. Finish with the existing TIED guarantees: passing tests, aligned
    pseudo-code, validated tokens, synchronized records, and
    `tied_validate_consistency` success.
11. Observe deterministic lifecycle transitions, revision-safe writes, and
    explicit human approval for exceptions, promotion, and branch/worktree
    actions.
12. Distinguish every proof boundary in status output so specification
    completeness, traceability, task readiness, runtime correctness, quality
    evidence, and accepted residual risk are never conflated.
13. Migrate an existing project in preview mode, report conflicts, and preserve
    the existing ordered workflow and project-owned TIED YAML.

---

## 10. Build-plan execution readiness

| Gate | Status |
|------|--------|
| Refine (vocab RESOLVE/RECORD) | **Complete** — [`feature-orchestration.md`](../../tied/vocab/feature-orchestration.md) |
| Plan (CITDP analysis for roadmap) | **Complete** — batch table, test strategy, risks in this document |
| Roadmap document | **Ready** — this revision |
| Batch 0 REQ/ARCH/IMPL stack | **Complete** — four chains registered and verification-gated |
| Batch 0 IMPL pseudo-code + validation | **Complete** — four sidecars passed pre-RED validation |
| Batch 0 implementation + tests | **Complete** — 209 tests passed; deferred scope remains excluded |
| Batch 0 promotion gates | **Complete** — YAML lint, index validation, consistency, and verification checks pass |
| Sponsor decisions (§0.1) | **Complete** — six decisions recorded; Git integration is explicitly deferred |
| Batch 1 feature store and lifecycle commands | **Complete** — deterministic store, revision-safe mutation, six command mappings, standalone `feature-orchestrator`, and MCP composition tests pass |
| Batch 1 validation gates | **Complete** — 220 full-suite tests pass, TypeScript build/lints pass, YAML indexes and TIED consistency pass |
| Batch 2 clarification and constitution modules | **Complete** — canonical clarification sidecars, phase-specific blockers, stale-resolution handling, versioned project constitution, deterministic compliance diagnostics, and lifecycle readiness projection implemented |
| Batch 2 validation gates | **Complete** — 12 focused Batch 2 tests and 230 full-suite tests pass, TypeScript build passes, `tied_verify` updates 4 REQ/7 IMPL records, and `tied_validate_consistency` returns `ok: true` |
| Batch 3 task graph and agentstream adapter | **Complete** — deterministic derivation, dependency scheduling, execution recovery, and additive agentstream compatibility implemented |
| Batch 3 validation gates | **Complete** — 8 focused tests, 38 feature-orchestration tests, and 238 full-suite tests pass; Go compatibility, TypeScript build/lint, pseudo-code validation, YAML validation, and TIED consistency pass |
| Batch 4 generated view projection/rendering/staleness | **Complete** — reference-only projection, six deterministic Markdown view families, source revision metadata, semantic comparison, explicit fail/warn stale policy, CLI/MCP composition implemented |
| Batch 4 validation gates | **Complete** — 11 focused Batch 4/composition tests and 244 full-suite tests pass; TypeScript build/lint, pseudo-code validation, YAML lint/index validation, verification, and `tied_validate_consistency` pass |
| Batch 5 research records and operational feedback | **Complete** — external typed research records, deterministic freshness, read-only dataset emission, operational source adapters, duplicate grouping, and reviewed non-canonical LEAP proposal promotion implemented |
| Batch 5 validation gates | **Complete** — 9 focused Batch 5 unit/composition tests and 253 full-suite tests pass; TypeScript build/lint, pseudo-code validation, YAML lint/index validation, `tied_verify`, and `tied_validate_consistency` pass |

**Batch 6 low-friction onboarding and adoption:** **Complete** — thin `tied`
onboarding delegates, source-reported local defaults, deterministic readiness
diagnostics, explicit offline fallback, and review-first legacy migration
preview/apply are implemented. Focused Batch 6 tests pass (9/9), the full MCP
suite passes (262/262), TypeScript build/lint, Go agentstream compatibility,
pseudo-code validation, YAML index validation, `tied_verify`, and
`tied_validate_consistency` pass. The implementation preserves project-owned
TIED YAML, existing ordered feature-spec behavior, and all explicit advanced
paths; it does not add lifecycle/scheduler/view/research/feedback redesign,
canonical promotion, or Git mutation.

Batch 6 evidence and the per-request tracker are recorded at
`tied/citdp/CITDP-FEAT-ORCH-BATCH-6.yaml` and
`working/feature-orchestration-batch-6/REQ-FEAT-ORCH-BATCH-6_tracker.yaml`.

**Remaining risks:** distributed filesystem stress testing, stronger
cross-platform lock hardening, and Git integration remain deferred follow-up work.

---

## 11. Refinement changelog (2026-08-13)

- Added §0.1 Refine outcomes, §0.2 Plan metadata, §10 Build-plan readiness.
- Added tool-boundary table (`tied-cli` vs orchestration CLI vs `agentstream`).
- Added batch overview table with CITDP IDs and anticipated token families.
- Added logical **modules** per P0 batch; proof-boundary table in §6.
- Linked MCP-first, verification-gated, and YAML index references throughout.
- Recorded vocabulary in [`tied/vocab/feature-orchestration.md`](../../tied/vocab/feature-orchestration.md);
  updated [`routing.md`](../../tied/vocab/routing.md).
- Clarified `initial-specs.yaml` example path and fidelity **project manifest** distinction.
- Recorded the six sponsor decisions; deferred Git integration beyond the initial
  Batch 1 delivery and selected a separate orchestration binary.
- Implemented Batch 0 manifest, lifecycle, canonical-link, and fixture-validator
  modules with 209 passing tests and persisted `CITDP-FEAT-ORCH-BATCH-0.yaml`.
- Roadmap refinement created no project REQ/ARCH/IMPL YAML; Batch 0 later added
  its separately governed project traceability stack.
