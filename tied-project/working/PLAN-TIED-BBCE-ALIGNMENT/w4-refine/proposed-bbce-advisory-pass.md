# Candidate sub-procedure — sub-bbce-advisory-verification-pass

<!-- Candidate only — not canonical until W4 build-plan promotion gate and checklist TDD merge. -->

**Purpose:** Optional **verification-phase** BBCE advisory bundle when sponsor sets Tracker **`bbce_advisory_enforced: true`**. Runs declared-surface compare, shared-code justification, and boundary violation report as **review-gated evidence** — never replaces verification-gate, composition tests, or REQ satisfaction.

**Placement:** During **`verification-gate`** (after unit/composition green), as nested CALL when flag set; may also run from optional **`sub-shared-code-change-justification-pass`** when triggered mid-cycle (W3 behavior unchanged).

**Mode:** Opt-in only; default skip when `bbce_advisory_enforced` absent or false.

## Preconditions

- **`slice_map_ref`** present (project opt-in map under `tied/analysis/*.yaml`; STDD default `tied/analysis/agentstream-slice-map.yaml`).
- **`declared_change_surface`** on Tracker and/or **`risk_analysis.bbce_alignment.declared_change_surface_ref`** on CITDP.
- Git diff or explicit `changed_paths` for the change under verification.

## Procedure (scaffold)

1. **PRELOAD** `tied/vocab/behavior-bounded-change-engineering.md`, `quality-assurance.md`.
2. **Validate** declared surface (`bbce-declared-change-surface.v1`).
3. **CALL locality compare** — change-locality tooling or `plumb-audit-gate --locality-report` / `PLUMB_AUDIT_LOCALITY=1` (default off). Record `change_locality`, unexpected paths; attach `locality_evidence_ref` or JSONL event (`bbce-locality-event.v1`).
4. **CALL** `sub-shared-code-change-justification-pass` when B triggers fire; write `bbce-shared-code-justification.v1` to working folder; set CITDP `shared_code_justification_ref`.
5. **CALL** boundary report — `bbce-boundary-violation-report` module; write `bbce-boundary-violation.v1`; set CITDP `boundary_violation_report_ref`. Apply `false-positive-policy` suppressions.
6. Attach all outputs under `working/{CHANGE-ID}/` or program pilot tree; set **`proof_boundary`** on each artifact.
7. **Human review** — sponsor or reviewer marks waiver / accepted residual on shared touches; **do not** auto-fail verification-gate or CI from locality score alone.

## Outputs

- Optional JSONL append under documented operator path (see `tied/analysis/README.md`).
- CITDP fields on `risk_analysis.bbce_alignment` (proposed merged attach YAML).

## Never

- Hard-block commits or CI when `bbce_advisory_enforced` is true (blocking requires separate REQ + strict gate policy).
- Treat `change_locality → 1.0` as correctness or REQ satisfaction.
- Conflate boundary violations with traceability gaps.
- Auto-block LEAP to shared IMPL without documented waiver path.

## Falsification → verification CALLs (W4 promotion)

| Falsification question | Verification CALL / evidence |
| --- | --- |
| Can locality replace composition tests? | Run composition suite; locality pass is additive only — record both in verification evidence |
| Does advisory enforcement block LEAP to shared IMPL? | Exercise B pass with `waiver_ref` + manual LEAP note; gate must stay allowed at advisory |
| Does C pass treat traceability gaps as crossings? | Compare `bbce-boundary-violation.v1` vs plumb traceability report on same diff |
| Would strict paths.ts enforcement block legitimate fixes? | Replay paths.ts scenario; document suppressions per false-positive policy |

**Traceability:** `[PROC-AGENT_REQ_CHECKLIST]` extension candidate; Mechanism **D** promotion; `[REQ-TIED_FIDELITY_RESEARCH]` observation boundary.
