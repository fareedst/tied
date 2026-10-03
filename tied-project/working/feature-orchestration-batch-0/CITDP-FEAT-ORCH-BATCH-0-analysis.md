# CITDP-FEAT-ORCH-BATCH-0 analysis

Status: pre-implementation analysis only. Do not copy this artifact into
`tied/citdp/` until Batch 0 implementation is complete.

## Change definition

- Current behavior: the repository has canonical TIED REQ/ARCH/IMPL records,
  but no feature-level manifest contract, lifecycle evaluator, canonical
  reference linker, or representative feature fixture corpus.
- Desired behavior: Batch 0 defines those contracts and validators without
  adding a user-facing CLI, orchestration MCP tools, generated views, or Git
  integration.
- Non-goals: production code, CLI, orchestration MCP, generated renderers,
  branch/worktree operations, constitution and clarification schemas owned by
  later batches.
- Success criteria: the four REQ/ARCH/IMPL chains are consistent; each new
  Active IMPL has token-commented contract-precise pseudo-code; pre-RED
  structural validation passes; fixture scenarios and module boundaries are
  explicit; canonical TIED ownership is preserved.

## Impact and module boundaries

1. `IMPL-FEAT_MANIFEST_VALIDATOR`: pure `feature-manifest.v1` schema,
   identity, normalization, revision, and ownership checks.
2. `IMPL-FEAT_LIFECYCLE_ENGINE`: pure transition matrix evaluation and
   immutable accepted-transition construction.
3. `IMPL-FEAT_REFERENCE_LINKER`: read-only typed resolution against canonical
   REQ/ARCH/IMPL indexes and graph consistency checks.
4. `IMPL-FEAT_FIXTURE_VALIDATORS`: fixture catalog dispatch, expected-outcome
   comparison, scenario coverage, and deterministic diagnostics.

Dependencies are one-way: manifest validation precedes lifecycle and linking;
fixture validation exercises each module independently. No composition binding
or runtime entry point exists in this phase.

## Risk and quality profile decisions

- `baseline-functional`: applicable. Evidence is unit and contract tests for
  accepted manifests, legal transitions, link integrity, and fixture outcomes.
- `data-integrity-migration`: applicable. Manifest references must not copy or
  mutate canonical records; unsupported versions and migration cases must
  reject or normalize deterministically.
- `stateful-reliability`: applicable to lifecycle revision and partial-write
  contract design, but runtime persistence is deferred; tests cover immutable
  proposed results and explicit partial-write rejection.
- `external-input-security`: accepted risk for this Plan gate only. No
  external command, network, or user-facing parser is implemented; later
  implementation must reassess malformed and resource-boundary inputs.
- `performance/scale/cost`, `user-facing/accessibility`, `regulated/privacy`,
  and `AI-enabled`: not applicable to the contract-only, non-UI, non-network
  phase; reassess when orchestration surfaces are introduced.
- TIED consistency is evidence of traceability integrity only, not runtime
  security, performance, usability, or product correctness.

## Strict TDD test strategy

1. Write RED unit tests for each pseudo-code procedure before production
   modules: valid/invalid schema, illegal and blocked transitions, reference
   resolution failures, and fixture expected-outcome mismatches.
2. Validate each module independently with mocks or in-memory canonical index
   doubles, edge cases, failure modes, deterministic diagnostics, and
   round-trip/normalization assertions.
3. Add contract tests for the manifest shape, lifecycle matrix, typed
   reference boundary, and required fixture scenario inventory.
4. Add composition tests only if implementation introduces a binding; none is
   authorized by this Plan gate.
5. No E2E tests are justified: Batch 0 has no UI or external entry point.
6. Run language lint, changed-YAML validation, pseudo-code validation,
   `tied_validate_consistency`, and the project verification gate after
   implementation. Persist the final CITDP record only then.

## Open risks

- Exact persistence and migration mechanics remain constrained by Batch 1
  feature-store design.
- Clarification and constitution gates are intentionally deferred to Batch 2.
- Fixture paths and host-language test names must be finalized during
  implementation without changing the contracts silently; use LEAP if they
  expose a scope change.
