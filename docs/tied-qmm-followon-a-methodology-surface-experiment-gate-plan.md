# TIED QMM follow-on (a): methodology-surface experiment gate

| Field | Value |
| --- | --- |
| **Status** | **Plan-only refined** (2026-10-10, refine pass 2) |
| **Change ID** | `PLAN-TIED-QMM-FOLLOWON-A` |
| **Future REQ** | `REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE` (implement pass only) |
| **Parent program** | [`docs/tied-qmm-methodology-learning-plan.md`](tied-qmm-methodology-learning-plan.md) (closed) |
| **Working entry** | [`tied-project/working/PLAN-TIED-QMM-FOLLOWON-A/PLAN.md`](../tied-project/working/PLAN-TIED-QMM-FOLLOWON-A/PLAN.md) |
| **Documentation CITDP** | [`tied-project/citdp/CITDP-PLAN-TIED-QMM-FOLLOWON-A.yaml`](../tied-project/citdp/CITDP-PLAN-TIED-QMM-FOLLOWON-A.yaml) |
| **Plan-only gate evidence** | [`tied-project/working/PLAN-TIED-QMM-FOLLOWON-A/evidence/pre_implementation-gate-result.json`](../tied-project/working/PLAN-TIED-QMM-FOLLOWON-A/evidence/pre_implementation-gate-result.json) |

**Planning vs implement disclaimer:** This child plan and `CITDP-PLAN-TIED-QMM-FOLLOWON-A` do **not** authorize RED, runtime changes, or product REQ/ARCH/IMPL minting. **Implement** runs under `REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE` with a fresh authoritative Tracker, implement CITDP (`depth_tier: integrated`, `gate_policy: per_citdp`), and identity-bound activation. Plan-only gate receipts are **not** reusable for implement.

## Status and authority

This is the refined child plan for `REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE`.
It is a planning handoff only: no production code, product REQ/ARCH/IMPL
records, semantic-token registry rows, RED tests, or runtime gate behavior are
authorized by this document.

The linked working plan and this child plan are committed rationale. Machine
gates, inquiry artifacts, ledgers, and receipts belong under the local
`tied-bundle/working/` root when implementation is authorized. Committed
Tracker, draft CITDP, PLAN, handoff, and evidence summaries belong under
`tied-project/working/`.

## RESOLVE — canonical vocabulary and sponsor intent

| Sponsor wording | Canonical term | Resolution |
| --- | --- | --- |
| methodology change | **methodology-surface change** | A change to one of the explicitly declared W1/W5 surfaces, not a path-derived inference |
| class of change | `methodology_surface_change_class` | CITDP field with `checklist_step`, `prompt_type_workflow`, `gate_policy`, `assurance_profile`, or `none` |
| experiment before the gate | **methodology learning experiment** | Persisted W1 record with hypothesis and methodology baseline before `pre_implementation` |
| link | `methodology_surface_experiment_link` | CITDP-scoped W2 link containing the experiment identity and matching surface |
| policy gate | **CITDP gate_policy** | Checklist progression policy; distinct from experiment surface `gate_policy` |
| integrated evidence | **identity-bound activation evidence** | Request/project/run/phase/scope/hash-bound inquiry metric plus the four bounded artifacts |
| effectiveness proof | **methodology effectiveness readout** | W2 outcome evidence; never implied by a pre-implementation pass |
| habit at the gate | **pre-implementation experiment gate** | Fail-closed validation before RED; not a global hook |

RESOLVE changes names, not intent authority. The sponsor retains the costly
choices about trigger scope, silent auto-detection, and behavior for in-flight
CITDPs. The implementation agent may proceed on the documented defaults for
reversible choices.

Vocabulary status: the terms above are resolved for planning. RECORD of new
terms in the owning client glossary is deferred to the authorized implement
pass because this refine pass does not mint or mutate product TIED records.
VALIDATE is therefore pending until the final implement artifacts exist.

## Scope, non-goals, and proof boundary

### In scope

- Require an explicit non-`none` `methodology_surface_change_class` to declare
  `methodology_surface_experiment_link` before `pre_implementation`.
- Resolve the linked `experiment_id` in the W1 persisted store.
- Reuse W1 validation for hypothesis, baseline, surface, and record shape.
- Emit stable fail-closed diagnostics for missing link/store/shape/diagnostic
  failures.
- Compose the new pre-implementation validator with the existing checklist
  validator while preserving W2 verification/close_out pairing.
- Provide a bounded stdd demonstration plan using `checklist_step`.

### Explicit non-goals

- No global hook for every REQ or every file path.
- No silent path-based or source-file auto-detection.
- No edits to read-only `tied-bundle/` methodology content.
- No Kaizen Phase 3 transport or feedback bridge.
- No `shareable_hashed` cohort export.
- No SPC, DORA, maturity score, ranking, or W4 report redesign.
- No requirement to collect an outcome at `pre_implementation`.
- No change to W2 trap dispositions, waiver schema, or verification/close_out
  authority.
- No UI and therefore no E2E implementation.

Proof boundary: a passing pre-implementation gate proves only that declared
Loop 3 discipline has a persisted experiment with a hypothesis and baseline.
It does not prove that the methodology change is effective. W2 pairing and
`tied_verify` remain the effectiveness and status authority.

## Current and desired behavior

Current behavior permits a CITDP-scoped W2 link to be absent and lets the
pairing validator return early at `pre_implementation`; unlinked
methodology-surface work can therefore reach RED without a W1 experiment.

Desired behavior:

1. Read the CITDP-declared class. Absent or `none` preserves legacy behavior.
2. For a non-`none` class, require the W2 link.
3. Require `experiment_id`, resolve it in the W1 store, and apply W1 shape
   validation.
4. Require non-empty hypothesis and methodology baseline diagnostics before
   `pre_implementation` is allowed.
5. Keep outcomes and conformance/effectiveness pairing at verification and
   close_out exactly as W2 defines them.

## Blast radius and module boundaries

| Module | Boundary | Independent validation |
| --- | --- | --- |
| Classifier | Pure CITDP input → closed class/none | Table tests, absent/none/unknown values, no path inference |
| W1 store adapter | `experiment_id` → persisted record or diagnostic | Mock store tests, missing ID, duplicate/invalid record, read error |
| Pre-implementation validator | Class + link + record → blocking diagnostics | Contract tests for hypothesis/baseline, waiver, and diagnostic order |
| Checklist composition seam | `validateChecklistGate` invokes pre-impl validator only in the right phase | UI-free composition tests with mocks and call-order assertions |
| W2 pairing seam | Existing verification/close_out extraction and trap logic | Regression tests for unlinked REQ, paired link, trap, and waiver |

The binding inventory must record trigger, callee, arguments, ordering, effect,
and failure behavior. Each module must pass unit, contract, edge-case, and
error-handling validation before composition code is changed.

## Costly and reversible choices

| Decision | Default | Classification and authority |
| --- | --- | --- |
| Trigger surfaces | Four W1/W5 surfaces only | Reversible for the first implementation; sponsor-owned if broadened |
| Auto-detection | Off; explicit class required | Costly if enabled because false positives block work |
| In-flight CITDPs | Class absent is grandfathered | Costly if retroactively blocked; sponsor-owned |
| Pilot | `stdd` only | Reversible |
| Pre-implementation outcome | Not required | Reversible and preserves W2 proof boundary |
| Surface enum evolution | Reuse existing W1 enum | Reversible until a breaking schema choice is proposed |

The implement pass must record sponsor authority for the three costly hinges:
trigger surfaces, auto-detection, and in-flight behavior. Do not substitute a
placeholder waiver or infer sponsor approval from this plan.

## CITDP readiness and quality matrix

The plan-only record is `depth_tier: minimal`, `profile_depth: integrated`, and
`gate_policy: advisory`; it has no activation evidence and cannot authorize RED.
The implement target is independently declared as `depth_tier: integrated`,
`profile_depth: integrated`, and `gate_policy: per_citdp`.

Expected implement CITDP risk/quality matrix:

| Profile / attribute | Applicability | Evidence expectation |
| --- | --- | --- |
| `baseline-functional` | Applicable | Unit TDD, composition binding tests, traceability and proof boundary |
| `data-integrity-migration` | Applicable | Persisted-store lookup, malformed record, replay/idempotent read behavior |
| `stateful-reliability` | Applicable | Missing/stale experiment and deterministic diagnostic behavior |
| `external-input-security` | Review applicability | Malformed CITDP/link/store values; include if the boundary is externally writable |
| performance/scale/cost | Not applicable by default | Record rationale; no scores or benchmark claim |
| user-facing/accessibility | Not applicable | No UI |
| regulated/privacy | Not applicable by default | Reassess only if experiment data crosses the declared boundary |
| AI-enabled | Not applicable to gate runtime | Reassess if implementation changes prompt/tool authorization surfaces |

Every applicable row needs scenario, command/test, threshold, owner,
limitation, provenance, and proof boundary. `tied_validate_consistency` proves
TIED integrity only; it is not product correctness or security evidence.

## Adversarial inquiry and identity-bound evidence

Integrated implementation activates `sub-adversarial-inquiry-pass` at:

- structural/design phase;
- `pre_implementation` before RED;
- verification (and the close-out evidence sync required by the workflow).

Invoke `tied_adversarial_inquiry_run` with explicit request scope and advisory
policy when available. Persist only these artifacts under the local working
root, in phase-specific directories:

```text
tied-bundle/working/REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE/
  adversarial-inquiry/phase-structural/
  adversarial-inquiry/phase-pre_implementation/
  adversarial-inquiry/phase-verification/
    obligation-report.json
    finding-ledger.jsonl
    gate-result.json
    evidence-provenance.json
```

Activation is blocking when missing, malformed, stale, or unjustified. The
metric and all four artifacts must agree on request, project, run, phase,
scope, and artifact hashes. A verification receipt cannot activate
`close_out`; a plan-only or Jev receipt is not activation evidence.

## Tracker, CITDP, and gate contracts

Create a fresh authoritative per-request Tracker at:

`tied-project/working/REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE/checklist-tracker.yaml`

It must be derived from
`tied-bundle/docs/agent-req-implementation-checklist.yaml`, not from a
synthetic completion list. Draft planning CITDP belongs at:

`tied-project/working/REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE/CITDP-REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE.yaml`

The future persisted implementation record belongs at
`tied-project/citdp/` only after implementation authority and the policy's
persist step. The plan-only gate result must be recorded as attempted,
non-activation, and `allowed: false` or blocked because the implement
Tracker/CITDP/activation inputs are not valid.

Required gate commands:

```text
tied_checklist_gate_validate --phase pre_implementation
tied_checklist_gate_validate --phase verification
tied_checklist_gate_validate --phase close_out
tied_verify
tied_validate_consistency
```

The exact CLI/MCP payload must name the authoritative Tracker, current CITDP,
phase, and (for integrated depth) identity-bound activation. Any false gate,
missing input, stale evidence, unresolved finding, or invalid waiver blocks
the next phase. W2 remains the authoritative verification/close_out pairing.

## Pseudo-code and three-way alignment gates

Before RED, the future implement pass must mint the product R/A/I stack via
the TIED YAML MCP/CLI and author the IMPL sidecar:

`tied-project/implementation-decisions/IMPL-METHODOLOGY-SURFACE-EXPERIMENT-GATE-pseudocode.md`

Every active pseudo-code block must include:

```text
[IMPL-METHODOLOGY-SURFACE-EXPERIMENT-GATE]
[ARCH-METHODOLOGY-SURFACE-EXPERIMENT-GATE]
[REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE]
How: ...
```

New or changed active blocks also declare PRE, POST, EFFECTS, and applicable
FAILURE_MODES, DATA_TRANSITION, and TERMINATION. Run pseudo-code Layers A/B/C,
including `pseudocode_analyze` with `gate_mode: true`, before RED. The same
block lead must be present in the test and production code for three-way
alignment. If implementation diverges, apply LEAP in reverse order:
IMPL → ARCH → REQ.

## RED/unit/composition sequence

1. Author the implement CITDP, fresh Tracker, module contracts, and pseudo-code.
2. Run the structural inquiry and allowed integrated
   `pre_implementation` gate.
3. Write RED unit tests for class, link, store, W1 shape, hypothesis/baseline,
   invalid diagnostics, and unlinked legacy behavior.
4. Implement and validate the classifier, store adapter, and validator
   independently with mocks and error fixtures.
5. Write RED composition tests for checklist-validator call order and phase
   selection; then wire the composition seam.
6. Run W2 regression tests for verification/close_out pairing, trap,
   effectiveness-not-measured, and waiver behavior.
7. Run verification, `tied_verify`, evidence envelope/manifest validation,
   vocabulary VALIDATE, and close_out evidence synchronization.

No E2E is planned: no UI boundary exists, and every required binding is
composition-testable without UI invocation.

## Implementation sequence and handoff

Future implementation batches:

1. Sponsor authority and TIED R/A/I + semantic tokens.
2. Complete sidecar and pseudo-code validation.
3. Fresh Tracker/CITDP and integrated structural/pre-implementation gates.
4. RED unit tests → independent module GREEN validation.
5. RED composition tests → checklist wiring.
6. W2 non-regression and dogfood demonstration.
7. Verification/close_out gates, `tied_verify`, consistency, and evidence sync.

Handoff is blocked until the costly choices are resolved, vocabulary is
RECORDed, the implement Tracker/CITDP is valid, pseudo-code gates pass, and
`pre_implementation` returns `allowed: true` with fresh activation evidence.

## Acceptance criteria

- Explicit class enum and `none` legacy behavior are documented.
- Missing link/store/invalid W1 shape/incomplete hypothesis-baseline paths have
  stable diagnostics and blocking semantics.
- Experiment link and persisted record are required before RED only when class
  is non-`none`.
- No silent file-path inference or global REQ hook exists.
- W2 verification/close_out pairing remains authoritative and passes regression.
- Module boundaries and independent validation criteria are recorded.
- RED/unit/composition order, pseudo-code, three-way alignment, and LEAP gates
  are executable.
- Integrated inquiry uses identity-bound phase artifacts and bounded paths.
- Working artifacts follow the two-root placement policy.
- No implementation completion is claimed by this plan.

