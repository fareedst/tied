# Batch 6 CITDP analysis — onboarding and adoption

Status: pre-implementation analysis; post-implementation `tied/citdp/CITDP-FEAT-ORCH-BATCH-6.yaml` is deferred by policy.

## Change definition

Batch 6 adds a thin onboarding layer for `tied init`, `tied feature new "..."`,
and `tied feature build`. The entry points delegate to the validated
`feature-orchestrator`, lifecycle, manifest store, readiness, generated-view,
task-graph, and agentstream adapter boundaries. It also adds explicit local
default discovery, actionable readiness diagnostics, and a review-first
migration path from legacy feature-spec batches and ordered agentstream inputs.

The change does not add lifecycle, scheduler, generated-view, research,
feedback, Git, canonical promotion, or YAML-MCP behavior. It does not replace
`tied-cli.sh`, the TIED YAML MCP, or `agentstream`.

## Impact and boundaries

Affected boundaries:

- Top-level command dispatch and help/quickstart documentation.
- Local capability and path discovery for `TIED_MCP_BIN`, `TIED_BASE_PATH`,
  `tied/constitution.yaml`, and `tied/features/`.
- Readiness projection formatting and corrective-command reporting.
- Legacy feature-spec and ordered agentstream input adapters.
- Migration-owned feature manifest backup, atomic publication, and rollback.

Protected boundaries:

- Project-owned `tied/` REQ/ARCH/IMPL YAML remains unchanged by migration.
- Existing ordered feature-spec batch behavior remains available.
- Existing tied-cli/TIED YAML MCP and manual/offline workflow remains explicit.
- No branch or worktree creation and no silent configuration writes.

## Risks and mitigations

1. Duplicate lifecycle semantics — delegate every operation to existing modules;
   composition tests assert the adapter call graph.
2. Unsafe default discovery — report source and ambiguity; never persist inferred
   configuration.
3. Misleading readiness claims — preserve proof-boundary labels and distinguish
   readiness from consistency, quality, and runtime proof.
4. Ordering loss during migration — retain source order and emit deterministic
   order evidence and conflict records.
5. Partial migration writes — require explicit confirmation, snapshot
   migration-owned destinations, publish atomically, and verify rollback.
6. Legacy source ownership confusion — preview is read-only and canonical
   REQ/ARCH/IMPL promotion is excluded.
7. Offline regression — capability detection selects tied-cli or
   `tied/docs/using-tied-without-mcp.md` and names direct advanced tools.

## Test strategy for build-plan

- Unit RED tests first for command classification, default precedence,
  capability fallback, diagnostic normalization, preview normalization,
  deterministic conflicts, and backup/rollback state transitions.
- Composition RED tests before command wiring for dispatch-to-delegate seams,
  readiness report assembly, and preview/confirmed-apply boundaries.
- Fixture coverage for greenfield, existing project, missing Node/MCP,
  duplicate legacy records, ordering ambiguity, stale preview, clean apply,
  publish failure, and rollback failure.
- No E2E-only behavior is currently justified; CLI invocation remains
  composition-testable.
- Final implementation gate: TypeScript build/lint, YAML validation,
  pseudo-code validation, `tied_verify` where enabled, and
  `tied_validate_consistency`.

## Planned build sequence

1. Implement and independently validate default/capability modules.
2. Implement and independently validate readiness diagnostic projection.
3. Implement migration preview/conflict and backup/rollback modules.
4. Add thin onboarding command composition and documentation.
5. Run full validation and persist the post-implementation CITDP record.
