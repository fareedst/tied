# PLAN-TIED-QMM-FOLLOWON-A — methodology-surface experiment gate

## Planning status

Refined plan-only handoff, 2026-10-10 (refine pass 2). This folder contains committed process
evidence and planning records. It does not authorize production code, RED
tests, product REQ/ARCH/IMPL YAML, or implementation status.

Primary plan:
`docs/tied-qmm-followon-a-methodology-surface-experiment-gate-plan.md`

Linked outline:
`/Users/fareed/.cursor/plans/methodology_experiment_gate_habit_49a1089a.plan.md`

## RESOLVE and bounded intent

Canonical terms are **methodology-surface change**, `methodology_surface_change_class`,
**methodology learning experiment**, `methodology_surface_experiment_link`,
**CITDP gate_policy**, and **identity-bound activation evidence**. The explicit
class values are `checklist_step`, `prompt_type_workflow`, `gate_policy`,
`assurance_profile`, and `none`.

The change requires a persisted W1 experiment with hypothesis and baseline
before `pre_implementation` only when a CITDP explicitly declares a non-`none`
class. W2 remains authoritative at verification and close_out.

## Non-goals

No global REQ hook, path inference, `tied-bundle/` methodology edits, Kaizen
Phase 3, `shareable_hashed` export, SPC/DORA/scores, pre-implementation
outcome, W2 disposition changes, or E2E.

## Costly-choice register

**Sponsor default-proceed (2026-10-10):** affirmed — four-surface enum set only;
auto-detection off; grandfather class-absent in-flight CITDPs; pilot `stdd`; no
pre-implementation outcome. Authority:
`tied-project/working/PLAN-TIED-QMM-FOLLOWON-A/evidence/sponsor-authority-followon-a-implement-20261010.md`.
Implement still requires fresh REQ Tracker, implement CITDP, pseudo-code, gates,
and activation — this record is not implement completion.

## CITDP and gate readiness

Plan-only posture: `profile_depth: integrated`, `depth_tier: minimal`,
`gate_policy: advisory`, no activation. This refinement has no valid
implementation gate and cannot authorize RED.

Implement posture: `profile_depth: integrated`, `depth_tier: integrated`,
`gate_policy: per_citdp`; persistence and gate behavior require fresh
identity-bound activation. The implement pass must run structural,
`pre_implementation`, verification, and close_out inquiry/gate phases with
phase-specific artifacts under `tied-bundle/working/`.

Expected blocking diagnostics include missing class/link/store record,
invalid W1 shape, incomplete hypothesis/baseline, stale/malformed Tracker or
CITDP, and missing/mismatched activation artifacts. A plan-only receipt,
Jev shadow, or preview is not activation evidence.

## Module and test handoff

Modules are: pure class classifier; W1 store/shape adapter; pre-implementation
validator; checklist composition seam; existing W2 pairing seam. Validate each
independently with mocks, contract cases, edge cases, and error paths before
composition.

Future RED unit tests cover class/link/store/shape/hypothesis/baseline and
unlinked legacy behavior. Future RED composition tests cover phase/call order
and checklist wiring. W2 regression covers verification/close_out pairing,
traps, effectiveness-not-measured, and waiver behavior. No E2E is applicable.

Before RED, the implement pass must author token-commented IMPL pseudo-code,
run pseudo-code Layers A/B/C and `pseudocode_analyze` gate mode, and establish
three-way alignment. LEAP on divergence is IMPL → ARCH → REQ.

## Artifact placement and blockers

- Documentation CITDP: `tied-project/citdp/CITDP-PLAN-TIED-QMM-FOLLOWON-A.yaml`
- Plan-only gate record: `tied-project/working/PLAN-TIED-QMM-FOLLOWON-A/evidence/pre_implementation-gate-result.json`
- Child plan: `docs/tied-qmm-followon-a-methodology-surface-experiment-gate-plan.md`
- Future authoritative Tracker:
  `tied-project/working/REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE/checklist-tracker.yaml`
- Draft CITDP:
  `tied-project/working/REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE/CITDP-REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE.yaml`
- Future canonical CITDP: `tied-project/citdp/CITDP-REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE.yaml`
- Local inquiry/gate evidence: `tied-bundle/working/REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE/`

Sponsor costly hinges are resolved (default-proceed 2026-10-10). Implementation
remains blocked until fresh implement Tracker and CITDP, complete pseudo-code,
valid inquiry evidence, and an allowed
`tied_checklist_gate_validate --phase pre_implementation` result exist.
Vocabulary RECORD/VALIDATE is deferred until implement artifacts exist.

