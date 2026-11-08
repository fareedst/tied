# Phase 7 — Evaluation and convergence

| Field | Value |
| --- | --- |
| **Program** | PLAN-TIED-LANGGRAPH-ORCHESTRATION |
| **Wave** | P7 |
| **Status** | **Readout complete** (`@build-plan` 2026-11-07) |
| **Sponsor disposition** | **Pending** — see [sponsor-disposition-p7-pending.md](../PLAN-TIED-LG-P7-CONVERGENCE/evidence/sponsor-disposition-p7-pending.md) |
| **Agent recommendation** | **Compose** (pilot as research; agentstream default) |
| **Metrics machine record** | [p7-paired-readout-metrics.v1.json](./p7-paired-readout-metrics.v1.json) |

## Executive summary

The LangGraph **pilot** completed P0–P6 with **61** passing pytest tests (1 skipped), machine close-out **allowed=true** and **0** envelope blocking gaps on waves P2–P6. **agentstream** remains the production default. This readout compared pilot gate/evidence behavior to a **documented agentstream four-phase analogue** (PROMPT-WF-07); it did **not** run a symmetric `REQ-BOUNDED_WORKER_POOL` implement on charter client `1791767366` via agentstream (scope parity gap documented below).

**Findings:** The pilot demonstrates checklist-driven graphs, MCP adapter contracts, acceptance gating, and parallel merge regression in a testable Python package. Agentstream continues to deliver full IDE/skill choreography with mature envelope close-out on disposable clients. Neither arm shows a decisive advantage on **operator wall time** for comparable scope because timing was not observed on a single paired fixture REQ.

**Recommendation:** **Compose** — maintain `tools/langgraph-pilot/` for research and shared MCP contract alignment; do not replace agentstream as default without a separate ARCH program.

## Scope parity (A/B honesty)

| Arm | What was measured |
| --- | --- |
| LangGraph | Program waves P2–P6 in `tools/langgraph-pilot/` (hermetic CI; charter client optional smoke not required for exit) |
| Agentstream | WF trial readouts (WF-05, WF-06, WF-07) on disposable clients; WF-07 detailed metrics |
| **Gap** | No agentstream run recorded for `REQ-BOUNDED_WORKER_POOL` on `/Users/fareed/Documents/dev/test/1791767366` |

## LangGraph arm

| Wave | Exit commit | Close-out `blocking_gap_count` |
| --- | --- | --- |
| P2 | `1bbd9245` | 0 |
| P3 | `ebda93d5` | 0 |
| P4 | `58c1fa9b` | 0 |
| P5 | `a997b6d6` | 0 |
| P6 | `f0cea237` | 0 |

**Verification:** `cd tools/langgraph-pilot && .venv/bin/pytest -q` → **61 passed**, 1 skipped (2026-11-07).

**Staleness:** Covered by unit/composition tests (`test_staleness_policy.py`, envelope composition, P6 merge `staleness_route`); live invalidate counts **not_observed**.

**Gate rework:** P3 and P4 required multiple `pre_implementation` attempts before implement (5 and 6 receipts respectively); P2 first attempt allowed. Suggests CITDP/tracker iteration cost during integrated waves.

## Agentstream arm

Primary analogue: [trial-readout-PROMPT-WF-07](../../../docs/demos/trial-readout-PROMPT-WF-07-composer25-1794057839-wf-agentstream-wf-07-cursor-composer25.md)

| Signal | WF-07 |
| --- | --- |
| Four-phase turns | 4 |
| `pre_implementation` at refine (turn 2) | pass |
| Close-out blocking gaps | 0 |
| Orchestrator wall time | ~12 min |
| Product REQ | `REQ-CONFIG_DEFAULTS_OVERRIDE` (not charter REQ) |

Supporting corpus: WF-05, WF-06 readouts in [docs/demos/](../../../docs/demos/).

## Paired metrics summary

Full JSON: [p7-paired-readout-metrics.v1.json](./p7-paired-readout-metrics.v1.json)

| Metric | LangGraph (pilot) | Agentstream (baseline) |
| --- | --- | --- |
| First-pass gate accept | Mixed (P2 yes; P3/P4 no on first pre_impl) | WF-07 refine pass on turn 2 |
| Stale-evidence incidence | Tests only; runs not_observed | not_quantified |
| Rework loops | 3–6 pre_impl attempts (P2–P4) | 4 turns; RED 5/6 → GREEN |
| Envelope gap count @ close-out | 0 (P2–P6) | 0 (WF-07) |
| Operator wall minutes | not_observed | ~12 (WF-07 orchestrator) |

## Gap audit

| Topic | Pilot | Agentstream |
| --- | --- | --- |
| Default executor | Opt-in pilot | Default |
| Python/Node boundary | Python pilot + MCP | TypeScript agentstream + MCP |
| Full checklist graph | Phase 8+ backlog | Bundled checklist + skills |
| `TIED_BASE_PATH` preflight | P1+ nodes | agentstream / IDE MCP config |
| LLM in graph | Deterministic nodes default | Model turns per skill |

Phase 4 separation-of-duties preserved in pilot; no evidence of gates weakened to force green demos.

## Disposition

| Option | Assessment |
| --- | --- |
| **Extend** | Premature without charter fixture paired run and sponsor funding signal |
| **Compose** | **Recommended** — pilot valuable; agentstream stays default |
| **Stop** | Not warranted; sunk cost low; tests green; research utility remains |

**Sponsor action required:** Sign **Extend**, **Compose**, or **Stop** in disposition artifact.

## LEAP / methodology

No automatic methodology promotion. If sponsor chooses **Stop** and absorbs rules into MCP/agentstream, file advisory LEAP proposals; do not edit `tied-bundle/` from this wave.

## Verification receipts (P7 readout)

| Phase | Receipt |
| --- | --- |
| `pre_implementation` | `tied-bundle/working/PLAN-TIED-LG-P7-CONVERGENCE/gates/pre_implementation-2026-11-07T19-16-04-743Z.json` |
| `verification` | `tied-bundle/working/PLAN-TIED-LG-P7-CONVERGENCE/gates/verification-2026-11-07T19-17-32-647Z.json` |
