# Build-plan W1 outcomes — PLAN-TIED-BBCE-ALIGNMENT

**Date:** 2026-09-27 · **Wave:** W1 Mechanism A pilot metrics · **depth_tier:** integrated · **gate_policy:** advisory

## Delivered

- Analysis module `mcp-server/src/analysis/change-locality-pilot.ts` + unit tests.
- Working pilot tree `working/PLAN-TIED-BBCE-ALIGNMENT/pilot/` (slice map, declared surfaces, `locality-run.json`, runner, DoD, limitations, test strategy).
- Longitudinal spike line `working/PLAN-TIED-BBCE-ALIGNMENT/change-locality/pilot-metrics.jsonl`.
- CITDP + feature plan + mechanisms adoption snapshot + excerpt updates.

## Pilot locality summary

| Scenario | Git range | Total changed | In declared | change_locality |
| --- | --- | ---: | ---: | ---: |
| replay-claude-live-driver-commit | `d5ea688^..d5ea688` | 15 | 9 | **0.60** |
| replay-phase3b-strangler-range | `fbe65e1..d5ea688` | 65 | 39 | **0.60** |

Full machine output: `pilot/locality-run.json`.

## Open item decisions

1. **Slice encoding:** Working-folder map for pilots; promote repo `tied/analysis/` slice map in W2 with CITDP declared-surface refs.
2. **JSONL home:** W1 writes `working/.../change-locality/`; W2 dual-write optional plumb-audit v2 summary ref (not v1 overload).

## W2 build-plan entry criteria (recommended)

- Sponsor selects W2 build-plan for Mechanism A checklist field + plumb schema v2 spike.
- Calibrate declared-surface templates using W1 `0.6` baseline (tests + README drift policy).
- Optional MCP tool wrapping `runChangeLocalityPilotFromGitRange` after API review.
- REQ/ARCH tokens only if gate behavior changes (explicit LEAP scope).

## Proof boundary

Diff-scope discipline only — not behavioral correctness.
