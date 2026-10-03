# Refine-plan W4 outcomes — PLAN-TIED-BBCE-ALIGNMENT

**Date:** 2026-09-27 · **Wave:** W4 (Mechanism D promotion spec) · **Status:** refine complete — **`pre_implementation` allowed** (integrated/advisory); receipt `working/PLAN-TIED-BBCE-ALIGNMENT/gates/pre_implementation-2026-09-27T15-40-51-340Z.json`

## Summary

Refined Mechanism **D** promotion: sponsor gate checklist, `bbce_advisory_enforced` semantics, merged CITDP attach YAML, residuality-style sub-procedure package, ARCH snippet path, slice-map opt-in decision, JSONL operator paths, program close-out boundaries. **No checklist enforcement implementation** in this refine pass.

## Depth and gate policy (build-plan recommendation)

| Field | Value | Rationale |
| --- | --- | --- |
| **depth_tier (W4 build-plan)** | **`integrated`** | Checklist `.md`/`.yaml` merge + optional ARCH template file + docs touch checklist semantics |
| **gate_policy** | **`advisory`** | Promotion remains review-gated; no CI hard fail on `change_locality` |
| **W4 refine depth** | `integrated` | Adversarial inquiry pre_implementation at integrated advisory |

## Sponsor promotion gate criteria

See `w4-refine/w4-promotion-decisions.md` § Sponsor promotion gate criteria (6 items): 0.60 calibration, false-positive review, B/C exercised, falsification dispositions, authority boundary, no methodology pollution.

## Mechanism D — `bbce_advisory_enforced`

When Tracker **`bbce_advisory_enforced: true`** at verification:

1. Validate declared surface (`bbce-declared-change-surface.v1`).
2. Locality compare (tooling or `PLUMB_AUDIT_LOCALITY=1`, default off).
3. **CALL** `sub-shared-code-change-justification-pass` on triggers.
4. **CALL** `bbce-boundary-violation-report`.

**Blocking:** `false` for W4 default — separate REQ + strict policy required for hard fail.

## Methodology default — slice map

- **STDD:** Keep `tied/analysis/agentstream-slice-map.yaml` as **reference pilot** (maintain with composition-coverage).
- **Clients:** Opt-in `tied/analysis/{name}-slice-map.yaml`; CITDP refs per change; **no** mandatory vertical-slice folders.

## JSONL / plumb promotion path

| Tier | Path | W4 build-plan action |
| --- | --- | --- |
| Pilot | `working/{CHANGE-ID}/change-locality/*.jsonl` | Document as default for experiments |
| Operator (optional) | `plumb-audit/audit-log.jsonl` v2 dual-write | Document in `docs/plumb-audit-gate.md` + `tied/analysis/README.md`; stay **off** by default |

Do **not** promote working JSONL into CI gates in W4.

## Program close-out vs envelope sync

| W4 refine/build exit evidence | Deferred |
| --- | --- |
| Promotion decisions doc merged to checklist (advisory) | Machine PLAN envelope full validate |
| Merged `risk_analysis.bbce_alignment.proposed.yaml` in working folder | Canonical `tied/citdp/` persistence |
| Verification gate receipt at integrated advisory | Strict-candidate blocking enforcement |
| Updated feature plan + excerpt + mechanisms doc | REQ tokens (unless ARCH mandate escalates) |

Overall program recommendation remains **Adopt (revise)**.

## Adversarial inquiry (W4 refine)

- **pre_implementation run_id:** `w4-refine-pre-impl-2026-09-27`
- **Artifacts:** `adversarial-inquiry/phase-pre_implementation-w4/`
- **Build-plan:** Re-run at **verification** after checklist merge TDD.

### Falsification → verification CALLs (promotion)

| Question | Disposition / CALL |
| --- | --- |
| Can locality replace composition tests? | **Disconfirmed** — verification CALL both; locality additive only |
| Does advisory bundle block LEAP to shared IMPL? | **Disconfirmed** — B pass requires waiver path; gate stays allowed |
| Does C conflate traceability gaps? | **Disconfirmed** — separate schemas; compare reports on same diff |
| Promote advisory to CI hard fail without REQ? | **Blocked** — defer strict; separate REQ required |
| Mandate slice folders? | **Blocked** — opt-in map only |

## REQ token recommendation

**No new REQ for default W4 build-plan** — promotion docs, optional ARCH snippet, checklist sub-procedure (advisory). **REQ yes** only if sponsor elevates ARCH snippet to mandatory methodology or enables blocking gates.

## W4 build-plan executable checklist (bullets)

1. Merge `proposed-bbce-advisory-pass.md` + `.yaml` into `tied/docs/agent-req-implementation-checklist.md` + `.yaml` (document `bbce_advisory_enforced`).
2. Update `tied/vocab/behavior-bounded-change-engineering.md` (W4 promotion pointers; RECORD `bbce_advisory_enforced`).
3. Create `templates/architecture-decisions/ARCH-BBCE_SLICE_OWNERSHIP_SNIPPET.yaml` per `arch-template-proposal.md` (optional).
4. Update `docs/plumb-audit-gate.md`, `tied/analysis/README.md` (JSONL operator paths, client opt-in).
5. Update `docs/tied-bbce-alignment-plan.md`, `docs/bbce-and-tied-excerpt.md`, `docs/comparisons/bbce-mechanisms-for-tied-improvement.md`.
6. Copy merged attach pattern into working CITDP; status → post-build `w4_promotion_complete` (not in refine).
7. TDD: tests only if checklist YAML parsing or gate semantics change (minimal composition/contract if any).
8. Run unit tests for existing B/C modules (regression); no new blocking gate code.
9. `tied_validate_consistency` after checklist/vocab edits.
10. Adversarial inquiry **verification** + `tied_checklist_gate_validate` verification receipt.
11. Evidence: `evidence/build-plan-w4-outcomes-2026-09-27.md`.
12. **No git commit** unless sponsor requests.

## Next step

**build-plan W4** when sponsor confirms — `pre_implementation` gate receipt under `working/PLAN-TIED-BBCE-ALIGNMENT/gates/`.
