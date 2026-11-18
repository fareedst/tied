# Traceable commit evidence — workspace clear @ close-out handoff

| Field | Value |
| --- | --- |
| **request_token** | `REQ-TIED_AS_OPERATED_BASELINE` (primary close-out record) |
| **date** | 2026-11-18 |
| **VALIDATE** | vocab PASS — scoped handoffs use `as-operated-baseline` terms; no new symbols |

## Gate refs

- `tied_gate_check` `phase: close_out` `allowed: true` (`project_root` set)
- `run-close-out-gates.mjs` envelope `blocking_gap_count: 0`; unified `gate.allowed: false` due to `missing_project_root_for_as_operated_snapshot` in runner checklist path (superseded by explicit `tied_gate_check`)
- Tests: `npm test --prefix mcp-server -- --test-name-pattern as_operated_baseline` — pass

## Completion signals (this commit)

| Signal | Status |
| --- | --- |
| Machine close-out | **pass** — `tied_gate_check` close_out allowed |
| Process contract | **pass** — handoff + manifest on disk; dual-write from prior close-out |
| Adherence ledger | **pass** — reconcile ok (grade B; advisory missing slug evidence files documented in runner) |

## Hygiene

- Receipt: [git-hygiene-receipt-2026-11-18.md](./git-hygiene-receipt-2026-11-18.md)

## Staging map

Primary REQ:

- `tied-project/working/REQ-TIED_AS_OPERATED_BASELINE/evidence/close-out-handoff.md`
- `tied-project/working/REQ-TIED_AS_OPERATED_BASELINE/evidence/session-handoff.md`
- `tied-project/working/REQ-TIED_AS_OPERATED_BASELINE/checklist-tracker.yaml`
- `tied-project/working/REQ-TIED_AS_OPERATED_BASELINE/evidence/verification-evidence-manifest.v1.json`

Repo workspace clear (sponsor-requested; documented drift):

- MCP test fixture envelopes + mini-repo graph indexes
- `tied-bundle/reports/source-graph/source-graph-index.v1.json`
- `tied-project/non-tied-plans/replacement-discovery-baseline/*` (tracked deltas)
- `tied-project/working/REQ-WF_TRIAL_SUMMARIES_PUBLISH/*` (handoff deltas)
- `tied-project/working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/fixture-1787603099/regression-manifest.json`
- `tied-project/working/REQ-TIED_JEV_CONTEXT_LOG_PRUNING/evidence/context-pruning-benchmark.v1.json`
- `tied-project/citdp/CITDP-REQ-{ACTIVATION,NESTED,PRESERVE,UNIT_TEST,UPGRADE,UPGRADE-MISSING}.yaml`

**Excluded unrelated drift:** `.cursor/plans/`

## Upstream feedback capture

**N/A** — no `tied_feedback_*` receipt this pass.