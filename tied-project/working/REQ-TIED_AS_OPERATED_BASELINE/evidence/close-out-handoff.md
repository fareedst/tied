# Close-out handoff — REQ-TIED_AS_OPERATED_BASELINE

| Field | Value |
| --- | --- |
| **handoff_kind** | close_out |
| **date** | 2026-11-18 |
| **request_token** | `REQ-TIED_AS_OPERATED_BASELINE` |
| **prompt_type** | `@close-out` → **`@handoff`** |
| **plan_phase** | `close-out-complete` |

## Completion signals

| Signal | Status | Notes |
| --- | --- | --- |
| Machine verification | **pass** | `tied_gate_check` `phase: verification` `allowed: true` |
| Machine close_out | **pass** | `tied_gate_check` `phase: close_out` `allowed: true` |
| Process contract | **complete** | Tests green; `tied_verify` with `checklist_gate.evidence.projectRoot` |
| REQ / IMPL status | **Implemented / Active** | `tied_verify` close_out phase |
| CITDP | **complete** | `tied-project/citdp/CITDP-REQ-TIED_AS_OPERATED_BASELINE.yaml` |

## Commit

**Feature commit SHA:** `e4ca6ce9` — `feat(tied): enroll REQ-TIED_AS_OPERATED_BASELINE checklist facet and close out.`

**Handoff / workspace commit:** recorded in this close-out replay (see `evidence/traceable-commit-evidence.md`).

**Prior base:** `3777a4b4` (manifest `commit` field at verify time; refresh manifest commit on replay if needed)

## Evidence (committed vs local)

| Artifact | Path | In git |
| --- | --- | --- |
| Verification manifest | [verification-evidence-manifest.v1.json](./verification-evidence-manifest.v1.json) | yes |
| RDB Snapshot-A receipt | [rdb-snapshot-composition-integration-receipt.v1.json](./rdb-snapshot-composition-integration-receipt.v1.json) | yes |
| RDB Snapshot-B receipt | [rdb-snapshot-pre-verification-gate-receipt.v1.json](./rdb-snapshot-pre-verification-gate-receipt.v1.json) | yes |
| Gate receipts | verification-gate-receipt / close-out-gate-receipt | local (gitignore `verification-*.json` patterns) |
| Request envelope | request-evidence-envelope.v1.json | local (regenerable) |
| Quality run artifacts | `evidence/quality-manifest/*.stdout.txt` | local |
| Dogfood snapshot | [../replacement-discovery](../replacement-discovery) (symlink) | yes (symlink) |

## Snapshot posture (costly choice C1)

Tracker **`as_operated_baseline.mode: active`** with working tree symlinked to [DOC-TIED-RDB-ANALYSIS](../../DOC-TIED-RDB-ANALYSIS/replacement-discovery) — **not** switched to `follow_up_only` for verify-only.

## Tests and commands

```bash
npm test --prefix mcp-server
# Pattern-scoped (manifest id aob-as-operated-pattern):
npm test --prefix mcp-server -- --test-name-pattern as_operated_baseline
```

## Do next

- None for this REQ.
- Optional: separate sponsor action to promote generic runbook body beyond `[PROC-TIED_AS_OPERATED_BASELINE]` cross-links.
- Optional: `refine-jev-adjunct` if Jev enabled on plan skills.

## Session spine

- [session-handoff.md](./session-handoff.md) — full PLAN steps and environment
- [build-plan-handoff.md](./build-plan-handoff.md)
- [phase-handoff-refine-plan.md](./phase-handoff-refine-plan.md)