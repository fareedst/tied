# CITDP-FEAT-ORCH-BATCH-3 analysis

Status: pre-implementation planning and pre-RED pseudo-code preparation. Do
not copy this artifact into `tied/citdp/` until the later build-plan
implementation is complete.

## Refine outcomes

- Sponsor **task graph** resolves to canonical dependency-aware executable
  data, not `tasks.md` prose.
- **Task derivation** is a pure projection from canonical REQ acceptance
  criteria, ARCH boundaries, IMPL blocks/contracts, testability
  classifications, clarification/constitution readiness, and selected quality
  profiles.
- **Readiness projection** is structured evidence and reasons. It never
  infers permission from task wording or list order.
- **Agentstream task adapter** is additive. Existing ordered **feature-spec
  batch** behavior remains supported through its existing loader and executor.
- Batch 3 defines the source projection contract consumed by Batch 4; it does
  not generate or persist `tasks.md`.

## Change definition

- Current behavior: Batches 0–2 provide canonical feature manifests,
  lifecycle/store/command surfaces, clarification gates, constitution
  compliance, and existing ordered `agentstream` feature-spec batch execution.
  No canonical task graph, scheduler, recovery state, or task-group adapter
  exists.
- Desired behavior: derive stable task entries, validate a deterministic
  dependency graph, explain readiness, constrain parallel groups, preserve
  execution evidence across retries/resumes, and adapt safe schedules to
  `agentstream`.
- Canonical ownership: REQ/ARCH/IMPL remain canonical; the task graph stores
  references and source revisions; execution state stores task identity and
  append-only evidence. Generated Markdown remains a Batch 4 consumer.
- Non-goals: production code/tests in this plan gate; `tasks.md` generation;
  constitution or clarification redesign; research/feedback promotion;
  migration/onboarding; Git branches/worktrees; replacement of `tied-cli.sh`,
  TIED YAML CRUD, lifecycle engine, quality evidence, or legacy feature-spec
  batch behavior.

## Exact TIED tokens

Requirements:

- `REQ-FEAT_TASK_DERIVATION`
- `REQ-FEAT_TASK_GRAPH_SCHEDULING`
- `REQ-FEAT_TASK_EXECUTION_RECOVERY`
- `REQ-FEAT_AGENTSTREAM_ADAPTER`

Architecture:

- `ARCH-FEAT_TASK_DERIVATION_BOUNDARY`
- `ARCH-FEAT_TASK_GRAPH_SCHEDULER`
- `ARCH-FEAT_TASK_EXECUTION_STATE`
- `ARCH-FEAT_AGENTSTREAM_ADAPTER`

Implementation:

- `IMPL-FEAT_TASK_DERIVATION`
- `IMPL-FEAT_TASK_GRAPH_SCHEDULER`
- `IMPL-FEAT_TASK_EXECUTION_STATE`
- `IMPL-FEAT_AGENTSTREAM_ADAPTER`

Related contracts:

- `REQ-FEAT_MANIFEST_SCHEMA`
- `REQ-FEAT_LIFECYCLE`
- `REQ-FEAT_CLARIFICATION_GATES`
- `REQ-FEAT_CONSTITUTION_COMPLIANCE`
- `REQ-GOAGENT-FEATURESPEC-BATCH`
- `REQ-GOAGENT-AGENT-EXECUTOR`
- `REQ-MODULE_VALIDATION`
- `REQ-QUALITY_ASSURANCE_EVIDENCE`

## Task schema and scheduler boundary

The canonical task entry shape is:

```yaml
task_id: TASK-<stable-derived-id>
source_tokens: [REQ-*, ARCH-*, IMPL-*]
depends_on: [TASK-*]
deliverables:
  - id: ...
    kind: module | test | composition | e2e | validation
    path_or_contract: ...
test_level: unit | integration | composition | e2e
parallel_group: PG-<stable-id> | null
status: pending | ready | running | passed | failed | cancelled | timed_out | stale
evidence:
  required: [...]
  history: [...]
source_revision: <stable source revision/hash>
```

`task_id` derives from canonical source identity plus task role, never from
position or prose. `depends_on` is explicit and validated. A graph is ready
only when canonical references resolve, clarification and constitution
projections pass, dependencies are satisfied, and required module-validation
evidence exists. A parallel group is rejected for dependency overlap, shared
mutable deliverables, or missing module-validation evidence.

Execution semantics:

- failure does not unlock dependents;
- retry appends a new attempt under the same `task_id`;
- cancellation and timeout are terminal for the attempt and block dependents;
- stale input rejects execution/resume when source revision differs;
- resume requires matching source revision or an explicit governed stale-input
  recovery transition;
- evidence history is append-only and deterministically ordered;
- dry-run and live execution consume the same schedule projection.

## Module boundaries and dependency direction

1. `IMPL-FEAT_TASK_DERIVATION`: pure source projection and stable task identity.
2. `IMPL-FEAT_TASK_GRAPH_SCHEDULER`: pure graph validation, cycle detection,
   readiness reasons, and safe parallel groups.
3. `IMPL-FEAT_TASK_EXECUTION_STATE`: explicit attempt state and append-only
   evidence history.
4. `IMPL-FEAT_AGENTSTREAM_ADAPTER`: additive mapping from scheduler output to
   existing `Turn`/executor behavior and dry-run output.

Dependency direction is canonical projections and gates → derivation →
scheduler → execution state → agentstream adapter. Existing feature-spec
loading and executor modules remain dependencies, not replacements.

## Quality and risk profile

- `baseline-functional`: applicable; deterministic derivation, graph,
  readiness, recovery, and adapter contract tests.
- `stateful-reliability`: applicable; retry, cancellation, timeout, stale
  input, resume, and dependent-lock behavior.
- `data-integrity-migration`: applicable; stable identity, source revisions,
  append-only evidence, and no partial graph publication.
- `external-input-security`: applicable; bounded source references, task IDs,
  paths/contracts, and malformed graph input.
- `performance-scale-cost`: deferred measurement; initial contract requires
  deterministic scans and bounded scheduling, not benchmark thresholds.
- `ai-enabled`: applicable to agent/prompt/tool execution; build-plan must
  include prompt-injection, sensitive-data, unsafe-output, authorization,
  sandbox, and abuse-volume evidence where the existing quality profile
  selects it.
- UI/accessibility and regulated/privacy: not applicable to this non-UI
  planning surface unless implementation introduces those boundaries.
- No E2E is currently justified; CLI, adapter, executor, and scheduling
  bindings are composition/integration-testable without UI invocation.

## Strict TDD strategy for build-plan

1. RED unit tests for derivation determinism, source references, task schema,
   stable identity, and source projection.
2. RED unit tests for graph cycles, unknown dependencies, readiness reasons,
   unsafe parallelization, and gate/evidence predicates.
3. RED unit tests for failure, retry, cancellation, timeout, stale-input,
   resume, stable identity, and append-only evidence.
4. Validate each module independently with pure functions, in-memory stores,
   readiness/lifecycle/constitution doubles, and executor doubles.
5. Add composition tests before adapter wiring for scheduler → agentstream
   mapping, dry-run/live parity, legacy feature-spec batch ordering, and
   executor delegation.
6. Do not add E2E unless a named platform boundary makes the behavior
   impossible to exercise at composition level.
7. Build-plan must run TypeScript/Go lint and builds as applicable, changed
   YAML validation, full pseudo-code validation, verification-gate, and
   `tied_validate_consistency`. Persist the final CITDP only after those
   implementation gates pass.

## Promotion gates and residual risks

- Specification, traceability, module, composition, execution, quality, and
  close-out gates from roadmap §6 apply.
- Batch 3 cannot claim scheduling readiness until Batch 2 clarification and
  constitution projections are integrated and available as stable inputs.
- The exact durable location and atomicity policy for task graph/execution
  state must be selected during build-plan without duplicating the Batch 1
  store boundary.
- Agentstream command/config shape must remain additive; any change to legacy
  feature-spec output requires LEAP and compatibility regression tests.
- Quality-profile selection must remain a projection contract; Batch 3 must
  not invent a second quality evidence system.

## Exact build-plan entry point

Invoke `build-plan` for `CITDP-FEAT-ORCH-BATCH-3` using:

`working/feature-orchestration-batch-3/agent-req-implementation-checklist-CITDP-FEAT-ORCH-BATCH-3.yaml`

Begin at the first RED unit-test step after the four IMPL sidecars and
pre-RED pseudo-code validation are confirmed.
