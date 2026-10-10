# Sponsor authority — W2 implement

| Field | Value |
| --- | --- |
| **Recorded** | 2026-10-10 (refine-plan) |
| **Program** | QMM Loop 3 methodology learning (W0–W6) |
| **Scope** | **W2 implement** — `REQ-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING` (RED, MCP, CITDP-scoped gate-blocking) |
| **Linked plan** | [`docs/tied-qmm-w2-conformance-effectiveness-plan.md`](../../../../docs/tied-qmm-w2-conformance-effectiveness-plan.md) |
| **Orchestrator** | [`../qmm-program-execution-checklist.yaml`](../qmm-program-execution-checklist.yaml) |
| **Supersedes for implement** | Plan-only boundary in [`sponsor-authority-w2-plan-only-20261010.md`](./sponsor-authority-w2-plan-only-20261010.md) remains historical evidence; implement requires this record. |

## Sponsor statement

The sponsor extends **W2 implement** authority:

1. **build-plan** on [`docs/tied-qmm-w2-conformance-effectiveness-plan.md`](../../../../docs/tied-qmm-w2-conformance-effectiveness-plan.md) for **`REQ-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING`**: mint REQ/ARCH/IMPL, integrated CITDP, unit/composition tests, pairing MCP, and **CITDP-scoped** gate-blocking on `verification` / `close_out` only when `methodology_surface_experiment_link` is declared.
2. **Gate-blocking hinge (costly, affirmed):** Fail closed on **conformance_only_trap** for scoped methodology-surface changes; **no global** gate behavior change for unlinked REQs or checklist work without experiment linkage.
3. **Depth:** W2 implement CITDP must use **`depth_tier: integrated`** and **`gate_policy: per_citdp`** — must **not** inherit plan-only `minimal` / advisory from `CITDP-PLAN-TIED-QMM-W2-CONFORMANCE-EFFECTIVENESS`.
4. **Batches:** B1 pairing logic + unit tests → B2 MCP → B3 gate hook + demo (`mle-demo-20261010-001` paired + trap fixture) per child plan §10.

## Boundaries (still forbidden)

- Edits to committed methodology YAML under **`tied-bundle/`** without a separate sponsor methodology change and LEAP path.
- **Global** pairing enforcement without per-CITDP `experiment_id` / `production_system_surface` linkage.
- Treating W2 plan-only `pre_implementation: false` receipt as implement gate success — implement requires **REQ** Tracker + **`CITDP-REQ-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING`** + integrated activation when eligibility applies.

## Pre-approved hinges (W2 implement)

| Hinge | Value |
| --- | --- |
| `w2_implement_depth_tier` | `integrated` |
| `w2_pairing_enforcement` | `gate_blocking_verification_close_out_citdp_scoped` |
| `w2_schema_default` | `extend_methodology_learning_experiment_v1_optional_conformance_evidence_refs` |
| `canonical_promotion` | `leap_plus_sponsor_methodology_change` (unchanged) |

## Agency boundary

This file authorizes **W2 implement intent** in the orchestrator (`w2_scope: implement`). It does **not** replace a fresh per-REQ Tracker copy, persisted implement CITDP, successful implement **`pre_implementation`** gate, or adversarial inquiry when integrated triggers match.

## Request trace

- Sponsor request (2026-10-10): *refine-plan — allow `w2_scope: implement`.*
