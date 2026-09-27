# W5 refine-plan — Refine outcomes (Touchpoint 1 — RECORD)

**Change ID:** `PLAN-TIED-RESIDUALITY-ANALYSIS`  
**Batch:** W5 promotion planning — refine/plan only (no canonical `tied/docs/*` mutation)  
**Date:** 2026-09-27  
**depth_tier / profile_depth:** `minimal`  
**gate_policy:** `advisory`

## W4 entry (met)

- 27 W4 tests green (14 unit + 13 composition/holdout); module suite 82 pass.
- Handoff: `evidence/w4-exit-handoff.md`, `evidence/w4-build-plan-summary.md`.
- Verification receipt: `gates/verification-2026-09-27T06-08-27-103Z.json`.

## Pilot DoD §7 summary

See `pilot/pilot-dod-checklist.md`. **11/12** items met or met-with-caveats; item **12** recorded here.

| Score band | Count | Examples |
|------------|-------|----------|
| Met | 9 | baseline, boundary, 25 stressors, worksheets, ledger, matrix, holdouts, limitations |
| Partial | 2 | Item 8 (P1 defer); Item 10 (S-T13, V-H01, close-out defer) |
| Met (this batch) | 1 | Item 12 recommendation |

## Written recommendation (default for build-plan W5)

**Stance: Adopt (revise)** — not reject, not indefinite defer.

**Adopt:** Optional **risk-triggered** residuality discovery pass as a **feeds-TIED** adjunct (dual-loop authority preserved). Pilot on recovery + idempotency REQs showed **actionable gap-list and LEAP rows** that component-first authoring under-specified (duplicate delivery, store IO surfacing, lock TTL, harmful duplicate evidence).

**Revise (scope of canonical promotion):**

- Promote **checklist hook** and **CITDP attach-as-evidence** pattern first; keep pass **optional** and **non-blocking** at default depth.
- Keep **worksheet + markdown ledger** as primary human artifacts; treat **stressor-residue.v1** as optional interchange (4 pilot YAML records — insufficient alone to mandate MCP lint).
- Document **partial proofs** (S-T13 scheduler binding, V-H01 semantics) in promotion copy; do not over-claim runtime resilience.
- Refresh **comparison doc** visibility (gitignore) or relocate stable excerpt into tracked docs during build-plan W5 if sponsor wants git-auditable provenance.

**Defer:**

- **Dedicated residuality tooling REQ/ARCH/IMPL** (validators, MCP) until a second pilot or explicit sponsor tooling CITDP — markdown + attach refs suffice for v1.
- **Stable schema lint** for `stressor-residue.v1` until field use exceeds optional records (recommend **≥10** machine records or sponsor mandate).
- **P1 LEAP batch 2** (7 rows) — separate behavior-changing CITDP, not W5 process promotion.
- **Machine PLAN close-out envelope** — follow existing waiver until build-plan W5 promotion commit batch.

**Reject (explicit):**

- Competing REQ authority from worksheets/matrices.
- Antifragility as TIED doctrine.
- Auto-promotion of unreviewed residues.

## Deliverables produced (refine-plan W5)

1. `pilot/pilot-dod-checklist.md` — §7 scored checklist.
2. `w5-promotion/w5-promotion-decisions.md` — promotion menu with adopt/defer/reject per candidate.
3. `w5-promotion/proposed-sub-residuality-analysis-pass.md` + `.yaml` — NON-CANONICAL checklist scaffold near `impact-discovery`.
4. `w5-promotion/risk_analysis.residuality_analysis.proposed.yaml` — NON-CANONICAL CITDP snippet with pilot counts.
5. `w5-promotion/stressor-residue-v1-field-use.md` — schema stability recommendation.
6. `CITDP-W5-PROMOTION.yaml` — W5 planning CITDP (working folder).
7. Tracker `w5_refine_batch` + `gate-tracker-pre-implementation-w5.yaml` + pre_implementation receipt `gates/pre_implementation-2026-09-27T06-13-03-814Z.json` (`allowed: true`).
8. This file + `w5-refine-risk-assessment.md` + `sub-adversarial-inquiry-pass-w5-refine.md`.
9. Feature plan §7/§10 status updates (planning artifact).
10. Linked Cursor plan: `w5-refine-*` todos complete; `w5-build-plan-promotion` pending.

## Vocabulary RECORD/VALIDATE

- **RESOLVE:** Promotion terms aligned with `tied/vocab/residuality.md` (provisional).
- **RECORD:** W5 promotion menu and hook slugs in `w5-promotion/` only — no canonical checklist YAML edit in refine.
- **PRELOAD:** `residuality.md`, `quality-assurance.md`, `fidelity-research.md`.
- **VALIDATE:** Deferred to traceable-commit on build-plan W5 canonical copies.

## Open sponsor decisions (for build-plan W5)

| ID | Question | Refine default |
|----|----------|----------------|
| SD-W5-RECOMMENDATION | Accept **Adopt (revise)** vs defer entire methodology | **Adopt (revise)** |
| SD-W5-CHECKLIST | Merge `sub-residuality-analysis-pass` into checklist md/yaml | **Adopt** optional sub near `impact-discovery` |
| SD-W5-CITDP-POLICY | Copy proposed snippet into `tied/docs/citdp-policy.md` vs working attach-only | **Revise:** attach-only in W5 build first; policy merge follow-up |
| SD-W5-SCHEMA-LINT | Add lint/validate for `stressor-residue.v1` | **Defer** |
| SD-W5-TOOLING-REQ | Open REQ-ARCH-IMPL for MCP/CLI validators | **Defer** |
| SD-W5-P1-LEAP | Run W3 batch 2 before or after process promotion | **Defer** (separate CITDP) |
| SD-W5-COMPARISON-GIT | Remove `docs/comparisons/` from `.gitignore` or copy excerpt | **Sponsor choice** |
| SD-W5-CLOSE-OUT | Run machine envelope close-out for PLAN-* in W5 build | **Optional** (waiver exists) |

## Recommended next step

**build-plan W5** (`w5-build-plan-promotion`) — sponsor confirms SD-W5-* table; copy approved proposals from `w5-promotion/` into canonical paths (`tied/docs/*`, checklist, vocab promotion); run integrated depth only if tooling REQ opened; verification + `tied_validate_consistency` on any project YAML touched.
