# CITDP-FEAT-ORCH-BATCH-2 analysis

Status: pre-implementation planning and pre-RED pseudo-code preparation. Do
not copy this artifact into `tied/citdp/` until the later build-plan
implementation is complete.

## Change definition

- Current behavior: Batch 0 owns manifest, lifecycle, canonical-reference, and
  fixture contracts. Batch 1 owns feature-local manifest persistence and the
  `feature-orchestrator` lifecycle command surface. Clarification and
  constitution gates are explicitly deferred, so lifecycle commands cannot
  claim those readiness checks.
- Desired behavior: feature-local `clarifications.yaml` becomes the canonical
  structured uncertainty store; phase-specific clarification gates expose
  blockers and stale resolutions. Project-owned `tied/constitution.yaml`
  becomes a versioned rule store with deterministic compliance diagnostics for
  REQ, ARCH, IMPL, task plans, and CITDP records.
- Canonical ownership: clarification data is feature-local and is mutated by
  the future feature orchestration surface; constitution data is project-owned
  and is mutated by the owning validated TIED/constitution tool boundary. No
  generated view or human marker is authoritative.
- Non-goals: Batch 3 task graph/scheduling and agentstream execution; Batch 4
  generated views and stale CI; Batch 5 research/feedback promotion; Batch 6
  migration/onboarding; Git branches/worktrees; replacement or duplication of
  `tied-cli.sh`, TIED YAML CRUD, the existing lifecycle engine, quality
  evidence, or LEAP proposal mechanisms.

## Contract decisions

### Clarification sidecar

Each feature directory contains `clarifications.yaml` with a versioned
sidecar envelope and unique records:

```yaml
schema_version: clarifications.v1
feature_id: FEAT-003
revision: 1
clarifications:
  - id: CLAR-001
    question: "..."
    affected_scope:
      phases: [refining, specified, planned, verifying]
      artifacts: [requirements, architecture, implementations, red_tests]
      tokens: []
    blocking: informational | req_authoring | arch_impl_authoring | red_tests
    owner: team-or-person
    priority: P0 | P1 | P2 | P3
    status: open | resolved | stale | rejected
    decision: null
    resolved_at: null
    evidence_references: []
    approval_references: []
    resolution_revision: null
```

`blocking` is a single canonical severity/classification, while
`affected_scope` identifies the phases and artifact classes affected. An
informational record never blocks. A record blocks only when it is open or
stale and its classification and scope intersect the requested phase.
`[NEEDS_CLARIFICATION]` is generated only by a renderer/view consumer.

Resolution requires the owner (or an explicitly authorized delegate), a
decision, evidence or approval references when required by scope, a timestamp,
and the feature revision at which it was resolved. A later revision touching
the affected scope marks the resolution stale; it is not silently reused.
Unresolved blocking records return deterministic blockers and prevent the
affected lifecycle phase. This adds readiness projection only; it does not
duplicate `LIFECYCLE_TRANSITION_MATRIX`.

### Constitution

`tied/constitution.yaml` is project-owned and uses:

```yaml
schema_version: project-constitution.v1
constitution_version: 1
project: stdd
articles:
  - id: CONST-001
    title: ...
    rule: ...
    scope: [requirements, architecture, implementation, task_plans, citdp]
    enforcement: required | advisory
    exceptions: [EXC-001]
    rationale: ...
exceptions:
  - id: EXC-001
    article_id: CONST-001
    owner: ...
    rationale: ...
    approver: ...
    review_status: proposed | approved | rejected | expired
    expires_at: ...
amendment_history:
  - version: 1
    amended_at: ...
    amendments: ...
    compatibility: compatible | requires_review | incompatible
```

The constitution is not a feature-local reference and does not replace
`AGENTS.md` or TIED consistency. Precedence is deterministic:
required article > approved, in-scope exception > advisory article; expired,
rejected, or unapproved exceptions do not suppress a failure. Diagnostics are
sorted by artifact path, article id, diagnostic code, and stable location.
Required exceptions include owner, rationale, review status, approver when
approved, and expiry where the article requires it. Amendments must pass
compatibility checks before becoming active and cannot silently invalidate
existing governed artifacts or approved exceptions.

Compliance is analyzed before implementation and is a separate proof boundary
from TIED traceability, quality evidence, and runtime correctness.

## Impact and module boundaries

1. `IMPL-FEAT_CLARIFICATION_STORE`: sidecar parsing, normalization, revision
   and ownership metadata; no lifecycle transition logic.
2. `IMPL-FEAT_CLARIFICATION_GATE`: pure phase/artifact blocker projection,
   stale-resolution invalidation, and deterministic diagnostics.
3. `IMPL-FEAT_CLARIFICATION_LIFECYCLE_ADAPTER`: readiness input/output adapter
   consumed by Batch 1 commands; delegates transitions to the existing engine.
4. `IMPL-FEAT_CONSTITUTION_STORE`: project-owned path and versioned
   read/validate/publish boundary.
5. `IMPL-FEAT_CONSTITUTION_VALIDATOR`: schema, article, exception, and
   amendment compatibility validation.
6. `IMPL-FEAT_CONSTITUTION_ANALYZER`: rule evaluation over REQ, ARCH, IMPL,
   task-plan, and CITDP projections without mutating those records.
7. `IMPL-FEAT_CONSTITUTION_DIAGNOSTICS`: stable diagnostic ordering,
   suppression rules, and pre-implementation failure reporting.

Dependency direction is stores/validators → pure evaluators → lifecycle
readiness adapter and analyzer diagnostics. Batch 1's store and lifecycle
engine remain dependencies, not replacements.

## Risk and quality profile

- `baseline-functional`: applicable; schemas, gates, diagnostics, and failure
  responses require deterministic unit and contract coverage.
- `data-integrity-migration`: applicable; feature-local and project-owned
  records must never be conflated, partially written, or treated as views.
- `stateful-reliability`: applicable; revision invalidation and atomic sidecar
  publication need failure-path tests.
- `external-input-security`: applicable; bounded questions, owners, paths,
  article text, exception metadata, and references require validation.
- `performance/scale/cost`: deferred measurement; deterministic scans are the
  initial contract.
- UI/E2E: not applicable; CLI/MCP and lifecycle bindings are composition
  testable without UI invocation.

## Strict TDD test strategy for build-plan

1. RED unit tests for sidecar schemas, canonical marker exclusion, ownership,
   resolution, stale invalidation, each blocking class, and deterministic
   blocker projection.
2. RED unit tests for constitution articles, scope matching, enforcement
   precedence, exception approval/expiry, amendment compatibility, and stable
   diagnostics.
3. Validate modules independently using in-memory stores and doubles for the
   Batch 1 lifecycle engine and existing TIED YAML/quality surfaces.
4. Add composition tests before wiring Batch 1 lifecycle readiness and CLI/MCP
   adapters. Verify unresolved blockers and constitution failures cannot be
   hidden or overridden.
5. No E2E tests are justified: all requested boundaries are programmatically
   testable.
6. Build-plan must run TypeScript lint/build, changed-YAML validation,
   full pseudo-code validation, verification-gate, and
   `tied_validate_consistency`; only then persist the final CITDP record.

## Residual risks and next entry point

- Exact constitution rule expression language must remain bounded and
  deterministic; do not introduce an implicit scripting/evaluation engine.
- The owning validated tool for project constitution writes must be selected
  during build-plan without duplicating TIED YAML CRUD.
- Batch 1 command response compatibility needs composition tests before it can
  report Batch 2 blockers.
- Batch 3 must consume stable clarification and constitution projections, not
  reach into sidecar internals.

Exact next build-plan entry point: invoke `build-plan` for
`CITDP-FEAT-ORCH-BATCH-2` using
`working/feature-orchestration-batch-2/agent-req-implementation-checklist-CITDP-FEAT-ORCH-BATCH-2.yaml`,
beginning at the first RED unit-test step after the persisted, validated IMPL
sidecars.
