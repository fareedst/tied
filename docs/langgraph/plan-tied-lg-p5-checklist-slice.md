# PLAN-TIED-LG-P5-CHECKLIST — Checklist slice orchestration

| Field | Value |
| --- | --- |
| **Program** | [PLAN-TIED-LANGGRAPH-ORCHESTRATION](../../tied-project/working/PLAN-TIED-LANGGRAPH-ORCHESTRATION/PLAN.md) |
| **Wave** | P5 |
| **Working folder** | [tied-project/working/PLAN-TIED-LG-P5-CHECKLIST/](../../tied-project/working/PLAN-TIED-LG-P5-CHECKLIST/PLAN.md) |
| **Depends on** | P4 verification subgraph complete (`58c1fa9b`) |
| **Phased spec** | [tied-langgraph-orchestration-plan.md](./tied-langgraph-orchestration-plan.md) § Phase 5 |

## Goal

Bind the LangGraph **project graph** to **real checklist slugs** for one contiguous segment of `[PROC-AGENT_REQ_CHECKLIST]`, dispatching the existing P3 TDD and P4 verification subgraphs per slug. Progress is authorized only when tracker evidence refs and optional gate receipts align with the run ledger.

## Refined scope and authority

**Pilot-local** under `tools/langgraph-pilot/`. No new stdd `REQ-*`/`ARCH-*`/`IMPL-*` unless sponsor later mints LangGraph tokens. Fresh **implement** `pre_implementation` gate required before RED; plan-only receipts from this `add-feature` pass are not reused for implement claims.

## Default slug segment (first slice)

Contiguous `[PROC-TIED_DEV_CYCLE]` hooks already exercised in agentstream and P3/P4 pilot tests:

| Order | Slug | Subgraph / behavior |
| --- | --- | --- |
| 1 | `unit-test-red` | TDD subgraph RED + `ValidRedEvidence` |
| 2 | `unit-test-green` | TDD subgraph GREEN gate |
| 3 | `composition-integration` | Verification subgraph + acceptance route (mocked MCP default) |

Sponsor may narrow or extend the segment in `@refine-plan` before `@build-plan`; dual-write with agentstream on the same tracker path remains **forbidden** (separate working copy for A/B).

## In scope

1. **`tied_langgraph/checklist_segment.py`** — load master checklist YAML + per-wave tracker; resolve segment slugs; validate segment is contiguous in checklist order.
2. **`tied_langgraph/tracker_writer.py`** — single-writer module for tracker disposition updates (evidence_refs shape per checklist template); no parallel agentstream + LangGraph writers on one file.
3. **Extend `tied_langgraph/graphs/project.py`** — replace ping-only path with slug iterator: dispatch `task_tdd` or `verification` builders; persist slug completion to run ledger.
4. **CLI / operator entry** — `--checklist-yaml`, `--tracker`, `--segment` (slug list or named preset `tdd-unit-slice`) mirroring agentstream `-c` / tracker preview conventions.
5. **Envelope cross-link** — on slug completion, optional `request_evidence_envelope_patch` for `checklist_gate_receipt` when MCP available (mocked in CI).
6. **Tests** — unit tests for segment loader and tracker writer (mocked paths); composition test driving the three-slug segment with mocked MCP and hermetic TDD fixture.
7. **README** — operator runbook: run directory layout under `tied-bundle/working/{REQ}/langgraph/`; dual-write warning.

## Out of scope

- P6 multi-task `Send` / worktree scheduling.
- Live fixture `tied_validate_consistency` on charter client in default CI (optional sponsor smoke).
- Mutating methodology checklist YAML in `tied-bundle/`.
- Replacing agentstream as default executor.

## Implementation sequence

RED-first `@build-plan` order:

1. Segment loader + ordering tests (failing) → `checklist_segment.py`.
2. Tracker writer contract tests → `tracker_writer.py`.
3. Project graph slug dispatch tests (mocked subgraphs) → `project.py`.
4. End-to-end composition: three-slug segment with hermetic mini-repo.
5. README + program checklist P5 status on close-out.

## Acceptance and exit criteria

- Project graph completes the default segment; tracker YAML shows the three slugs **completed** with typed `evidence_refs`.
- Run ledger under `langgraph/{run_id}/` references slug observations and verification decisions.
- Default CI: mocked MCP only; pytest green including new P5 tests.
- Optional local smoke: segment run against disposable tracker copy under working folder evidence.

## References

- [plan-tied-lg-p4-acceptance-gate.md](./plan-tied-lg-p4-acceptance-gate.md)
- [agent-req-implementation-checklist.yaml](../../tied-bundle/docs/agent-req-implementation-checklist.yaml)
- [langgraph-evidence-driven-software-engineering.md](../tools/langgraph-evidence-driven-software-engineering.md)
