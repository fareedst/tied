# CITDP-FEAT-ORCH-BATCH-1 analysis

Status: pre-implementation analysis only. Do not copy this artifact into
`tied/citdp/` until Batch 1 implementation is complete.

## Change definition

- Current behavior: Batch 0 provides manifest validation, lifecycle evaluation,
  canonical reference linking, and fixture validation, but no durable feature
  package, creation protocol, lifecycle command adapter, or orchestration
  surface.
- Desired behavior: Batch 1 persists feature manifests under
  `tied/features/<feature-directory>/feature.yaml`, allocates deterministic
  identifiers and slugs, supports explicit request-key idempotency, exposes
  specify/refine/plan/tasks/verify/close out, and provides equivalent CLI/MCP
  orchestration while delegating canonical TIED YAML CRUD and validation.
- Exact binary decision: `feature-orchestrator`, a standalone executable; it is
  neither `tied-cli.sh` nor a `tied` subcommand.
- Non-goals: Git branch/worktree creation, Batch 2 clarification and
  constitution schemas/gates, Batch 3 scheduling, Batch 4 generated views, and
  Batch 6 migration.
- Success criteria: each mutation validates revision, publishes atomically,
  reports the next permitted phase, and has deterministic collision and
  partial-write behavior; CLI/MCP bindings preserve one canonical TIED path.

## Impact and module boundaries

1. `IMPL-FEAT_STORE`: feature-local path resolution, manifest read, and
   deterministic publication.
2. `IMPL-FEAT_IDENTIFIER_ALLOCATOR`: pure slug normalization and
   store-backed FEAT number allocation.
3. `IMPL-FEAT_IDEMPOTENT_CREATE`: request-key fingerprinting, locking,
   collision handling, and complete initial publication.
4. `IMPL-FEAT_ATOMIC_MUTATION`: expected-revision compare-and-swap,
   validation, atomic replacement, and next-phase derivation.
5. `IMPL-FEAT_ORCHESTRATION_COMMANDS`: thin lifecycle command adapter over the
   Batch 0 engine and feature store.
6. `IMPL-FEAT_ORCHESTRATION_CLI` and `IMPL-FEAT_ORCHESTRATION_MCP`: separate
   entry surfaces sharing the adapter; canonical REQ/ARCH/IMPL operations are
   delegated to existing TIED YAML tooling.

The dependency direction is store and allocator → creation and mutation →
commands → CLI/MCP bindings. Batch 0 validators remain dependencies, not
duplicates. Module validation precedes composition validation.

## Risk and quality profile decisions

- `baseline-functional`: applicable; unit and contract tests cover all command
  outcomes, path rules, slug rules, and response shapes.
- `data-integrity-migration`: applicable; canonical records remain referenced,
  existing projects require no migration, and unsupported manifest changes
  remain outside this batch.
- `stateful-reliability`: applicable; lock ownership, stale revisions,
  atomic rename failures, retry recovery, and no-partial-write behavior are
  first-class tests.
- `external-input-security`: applicable; request keys, titles, paths, and CLI
  arguments require bounded normalization and traversal rejection.
- `performance/scale/cost`: deferred measurement; allocation scans are
  deterministic and can be optimized later without changing the contract.
- `user-facing/accessibility`, `regulated/privacy`, and `AI-enabled`: not
  applicable to this non-UI orchestration contract; reassess for later UX.
- TIED consistency proves traceability and YAML integrity, not runtime
  concurrency correctness.

## Strict TDD test strategy

1. Write RED unit tests for each IMPL procedure before production modules:
   path safety, serialization, slug/number allocation, request-key retries and
   collisions, stale revisions, atomic failures, command mappings, and next
   phase reporting.
2. Validate modules independently with in-memory stores, lock doubles,
   lifecycle-engine doubles, canonical TIED YAML tool doubles, edge cases, and
   deterministic diagnostics.
3. Add composition tests before CLI/MCP wiring for
   CLI/MCP → command adapter → store/lifecycle bindings and delegation of
   canonical REQ/ARCH/IMPL CRUD and validation.
4. No E2E tests are justified: the CLI and MCP are programmatically
   composition-testable and have no UI-only behavior.
5. Run TypeScript lint/build, changed-YAML validation, pre-RED pseudo-code
   validation now, full pseudo-code validation at verification, and
   `tied_validate_consistency` before implementation completion. Persist the
   final CITDP record only after build-plan implementation.

## Open risks and blockers

- Filesystem locking semantics across platforms must be selected during
  build-plan without weakening deterministic collision behavior.
- The exact request-key metadata location and recovery policy need implementation
  tests; both must remain feature-local and revision-safe.
- Batch 2 gates are not available in this batch, so commands must report their
  absence as integration blockers rather than silently claiming a complete
  lifecycle workflow.
- MCP registration and CLI packaging may expose repository-specific entry-point
  constraints; any scope change requires LEAP before code.
