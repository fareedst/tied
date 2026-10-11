# Sponsor authority — QMM follow-on (a) implement

| Field | Value |
| --- | --- |
| **Recorded** | 2026-10-10 |
| **Program** | QMM methodology learning — follow-on **(a)** |
| **Scope** | **Implement** — `REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE` (pre-implementation experiment gate; W2 verification/close_out unchanged) |
| **Linked plan** | [`docs/tied-qmm-followon-a-methodology-surface-experiment-gate-plan.md`](../../../../docs/tied-qmm-followon-a-methodology-surface-experiment-gate-plan.md) |
| **Plan-only CITDP** | [`tied-project/citdp/CITDP-PLAN-TIED-QMM-FOLLOWON-A.yaml`](../../../../tied-project/citdp/CITDP-PLAN-TIED-QMM-FOLLOWON-A.yaml) |
| **Sponsor input** | **default-proceed** on agent-recommended defaults (2026-10-10) |

## Sponsor statement

The sponsor authorizes the **implement pass** for follow-on **(a)** under these **affirmed defaults**:

1. **Trigger surfaces:** `methodology_surface_change_class` applies only to the four W1/W5 enums — `checklist_step`, `prompt_type_workflow`, `gate_policy`, `assurance_profile` — plus explicit `none` / absent (legacy).
2. **Auto-detection:** **Off.** Explicit CITDP class is required to trigger pre-implementation experiment requirements; no silent path or file inference.
3. **In-flight CITDPs:** **Grandfather** — class absent or `none` ⇒ no new pre_implementation block (existing unlinked behavior preserved).
4. **Pilot:** `stdd` repository for dogfood demo only (reversible).
5. **Pre-implementation outcome:** Not required at `pre_implementation` (W2 timing unchanged).
6. **Implement depth:** Fresh implement CITDP with **`depth_tier: integrated`**, **`gate_policy: per_citdp`**, and **`profile_depth: integrated`** — must **not** inherit plan-only `minimal` / advisory without `prior_depth_tier` and fresh activation.

Authorized work includes minting **REQ/ARCH/IMPL-METHODOLOGY-SURFACE-EXPERIMENT-GATE**, IMPL pseudo-code sidecar, RED unit/composition tests, checklist-validator pre_implementation hook, optional read-only gate preview MCP, vocabulary RECORD, and enrollment advisory step 0 update — per the child linked plan.

## Boundaries (still forbidden)

- Global hook for every REQ or path-derived class inference.
- Edits to read-only **`tied-bundle/`** methodology YAML without a separate sponsor methodology change.
- Kaizen Phase 3 transport **(b)** or **shareable_hashed** cohort export **(c)** in this pass.
- Replacing W2 pairing, trap dispositions, or verification/close_out authority.
- Treating plan-only [`pre_implementation-gate-result.json`](./pre_implementation-gate-result.json) as implement gate success or activation evidence.

## Pre-approved hinges (implement)

| Hinge | Value |
| --- | --- |
| `followon_a_trigger_surfaces` | four W1/W5 enums only |
| `followon_a_auto_detect` | `off` |
| `followon_a_in_flight_grandfather` | `class_absent_no_pre_impl_block` |
| `followon_a_pilot_repo` | `stdd` |
| `followon_a_pre_impl_outcome` | `not_required` |

## Agency boundary

This file records **sponsor default-proceed** on costly choices. It does **not** replace a fresh authoritative Tracker under `working/REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE/`, persisted **`CITDP-REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE`**, successful implement **`pre_implementation`** gate with identity-bound activation, RED tests, or **`tied_validate_consistency`**.

**Next operator step:** `/plan-new-feature` or `/build-plan` on the child linked plan.
