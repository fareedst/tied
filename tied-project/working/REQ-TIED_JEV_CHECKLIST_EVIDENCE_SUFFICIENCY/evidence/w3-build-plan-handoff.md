# W3 build-plan handoff — REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY

**Date:** 2026-09-29  
**Wave:** W3 (labeled fixtures + replay benchmark + evidence report)

## TIED base path

`tied_config_get_base_path` → `/Users/fareed/Documents/dev/chatgpt/stdd/tied`

## Delivered (W3)

| Deliverable | Path |
| --- | --- |
| Labeled fixture corpus (24 rows) | `mcp-server/test/fixtures/checklist-evidence-sufficiency/labeled-corpus.v1.jsonl` |
| Benchmark runner module | `mcp-server/src/jev/checklist-evidence-sufficiency-benchmark.ts` |
| Replay CLI | `mcp-server/scripts/replay-jev-checklist-evidence-sufficiency.ts` |
| Contract tests | `mcp-server/src/jev/checklist-evidence-sufficiency-benchmark.test.ts` |
| Evidence report (mocked) | `working/REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY/evidence/checklist-evidence-sufficiency-benchmark.v1.json` |

**Fixture labels:** 8 substantive, 9 superficial, 6 borderline, 1 canary-secret row (`jv_live_CANARY_SECRET_DO_NOT_COMMIT` — redaction probe, excluded from agreement numerator).

**Benchmark arms:** `deterministic_only`, `jev_on`, `jev_off`, `shadow_compare` on shared `fixture_hash`.

## Benchmark summary (mocked Jev)

| Metric | Value |
| --- | --- |
| `fixture_count` | 24 |
| Clear substantive+superficial (agreement set) | 17 |
| `jev_on_agreement_rate` | **100%** (17/17) |
| `substantive_pass_recall` | 1 |
| `superficial_reject_precision` | 1 |
| `authority_invariant_ok` | true |
| `mode` | mocked |

Borderline rows (6) are labeled for calibration documentation; agreement target applies to clear substantive vs superficial on `jev_on` only.

## Satisfaction criteria (W3 scope)

| Criterion | Status |
| --- | --- |
| **SC-FIXTURES** (≥20 labeled snippets + canary) | **met** — 24 rows |
| **SC-BENCH-ARMS** (deterministic_only, jev_on, jev_off; shadow_compare shipped) | **met** |
| **SC-AGREEMENT** (≥85% clear substantive vs superficial on `jev_on`) | **met** — 100% mocked |
| **SC-AUTHORITY** (no arm emits gate `allowed: true` from pre-gate) | **met** — `authority_gate_allowed_emitted: false` all rows |

**Deferred:** SC-OPT-IN-BLOCK MCP composition (W4), live `--live` calibration run (operator optional), vocab RECORD (W5).

## Tests / lint

| Command | Result |
| --- | --- |
| `bun test src/jev/checklist-evidence-sufficiency-benchmark.test.ts` | **5 pass** |
| `bun test src/jev/checklist-evidence-sufficiency.test.ts` | **22 pass** |
| `bun run build` (mcp-server) | **ok** |
| `bun run scripts/replay-jev-checklist-evidence-sufficiency.ts` | **ok** — report written |

## Tracker

`working/REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY/agent-req-implementation-checklist.yaml` — W3 notes on `unit-test-red` / `unit-test-green` evidence_refs and state_history.

## Vocab RECORD

**Deferred to W5** — PRELOAD applied (decision-copilot, quality-assurance, fidelity-research); terms RESOLVED in-session only.

## Gates

| Phase | Status |
| --- | --- |
| `pre_implementation` | not re-run (W1 baseline) |
| `verification` | **deferred** (W5) |
| `close_out` | **deferred** (W5) |

## Close-out status

**Deferred** — no envelope validate / `sub-close-out-evidence-sync`.

## Completion signals (honest)

| Signal | Status |
| --- | --- |
| Machine close-out | **deferred** |
| Process contract | **partial** — W3 benchmark + unit scope; verification/close_out pending |
| Adherence ledger | **deferred** |

## W4 next steps

- Hook `runChecklistEvidenceSufficiencyPreGate` inside `tied_checklist_gate_validate` when opt-in enabled
- Standalone MCP tool `tied_jev_checklist_evidence_sufficiency`
- Composition tests (pre-gate reject vs gate receipt; authority invariant under MCP path)
- Optional: wire replay into CI `npm test` like context-pruning replay

## Disagreement appendix

Not required — mocked `jev_on` agreement 100% on clear substantive vs superficial. Live `--live` runs may diverge on borderline rows; re-run with `JEV_API_KEY` and compare to this mocked baseline.
