# W4 promotion menu — sponsor decisions (NON-CANONICAL working copy)

**Change ID:** `PLAN-TIED-BBCE-ALIGNMENT`  
**Program recommendation (2026-09-27):** **Adopt (revise)** — optional BBCE advisory bundle at verification; no CI hard fail; no vertical-slice folder mandate.  
**Build-plan W4 (2026-09-27):** Checklist merge, working CITDP attach, ARCH snippet, and docs refresh **executed**. Canonical `tied/citdp/` persistence and strict enforcement remain deferred. Never edit `tied/methodology/`.

| # | Candidate | Refine disposition | Rationale (W1–W3 pilot) | Canonical target (build-plan W4) |
|---|-----------|-------------------|---------------------------|--------------------------------|
| 1 | Glossary promotion (`tied/vocab/behavior-bounded-change-engineering.md`) | **Adopt (revise)** | W0–W3 terms exercised; W4 adds `bbce_advisory_enforced` + promotion pointers | Remove partial provisional banner; link W4 sub-procedure; VALIDATE at sponsor commit |
| 2 | Checklist `sub-bbce-advisory-verification-pass` | **Adopt (revise)** | B/C dry-run + 0.60 locality baseline; false-positive policy reviewed | Merge `proposed-bbce-advisory-pass.md` + `.yaml` into `tied/docs/agent-req-implementation-checklist.md` + `.yaml` (TDD for gate semantics only) |
| 3 | Tracker flag `bbce_advisory_enforced` | **Adopt** | Opt-in CALL bundle at verification when sponsor sets flag; default false | Document on checklist YAML optional tracker fields; no blocking gate |
| 4 | CITDP `risk_analysis.bbce_alignment` attach | **Adopt (revise)** | W2/W3 working refs proven | `w4-refine/risk_analysis.bbce_alignment.proposed.yaml` → Phase 1 working CITDP on behavior batches; Phase 2 `tied/citdp/` after sponsor |
| 5 | ARCH template (owning slice / shared mechanism) | **Adopt (revise)** | Optional ARCH detail sections; not normative law | `templates/architecture-decisions/ARCH-BBCE_SLICE_OWNERSHIP_SNIPPET.yaml` (snippet only) — **no REQ** unless sponsor elevates to mandatory methodology |
| 6 | Slice map methodology default | **Adopt (revise)** | STDD pilot map calibrated | Keep `tied/analysis/agentstream-slice-map.yaml` as **reference pilot**; document client **opt-in** (`tied/analysis/{project}-slice-map.yaml`) in `tied/analysis/README.md` |
| 7 | JSONL / plumb operator path | **Adopt (revise)** | W2 spike + W3 BC events | Document optional paths in `docs/plumb-audit-gate.md` + README; **no** CI mandate |
| 8 | Strict / blocking enforcement | **Defer** | Advisory policy + falsification dispositions | Separate REQ + integrated strict-candidate only after sponsor escalation |
| 9 | Machine PLAN close-out envelope | **Defer** | Same class as W0–W3 doc/pilot batches | Program-level close-out after W4 build-plan verification; envelope sync optional waiver |

## Sponsor promotion gate criteria (normative checklist)

**Status (2026-09-27 build-plan W4):** All items below **satisfied** for STDD advisory pilot; sponsor authorized via `/build-plan W4`.

Sponsor authorized **build-plan W4** when **all** items below were satisfied (refine records evidence refs; sponsor signed via build-plan authorization):

1. **W1 calibration anchor:** At least one replay documents `change_locality` near **0.60** baseline (`working/PLAN-TIED-BBCE-ALIGNMENT/change-locality/w2-locality-events.jsonl` or `pilot/w2-locality-run.json`) with explicit **proof_boundary** — metrics do not prove correctness.
2. **W3 false-positive review:** `w3-refine/false-positive-policy.md` reviewed against dry-run (`pilot/w3-boundary-violation-report.json`, `pilot/w3-shared-code-justification.json`); paths.ts scenario accepted as advisory, not auto-block.
3. **Advisory passes exercised:** B/C pilot runner executed (`pilot/run-w3-bc-pilot.mjs` or equivalent) with v1 JSON validating via `bbce-schemas.ts` unit tests.
4. **Falsification dispositions (promotion):** CITDP `risk_analysis.adversarial_inquiry.falsification_questions` for W4 scope answered or explicitly waived with rationale — especially “advisory → CI hard fail without REQ” and “slice map mandate.”
5. **Authority boundary re-read:** Sponsor confirms BBCE remains review-gated evidence; TIED REQ/ARCH/IMPL + composition tests remain authoritative for behavior proof.
6. **No methodology pollution:** Plan excludes edits to `tied/methodology/` and excludes mandatory vertical-slice directory layout.

**Out of scope (W4 default build-plan):** New MCP tool registration, checklist blocking gates, `change_locality` CI hard fail, auto-block LEAP to shared IMPL.

## NON-CANONICAL YAML — checklist hook

See `proposed-bbce-advisory-pass.yaml`.

## NON-CANONICAL YAML — CITDP bbce_alignment section

See `risk_analysis.bbce_alignment.proposed.yaml`.

## ARCH template path proposal

| Option | Path | Owner | W4 refine choice |
|--------|------|-------|------------------|
| A | `templates/architecture-decisions/ARCH-BBCE_SLICE_OWNERSHIP_SNIPPET.yaml` | TIED source templates (copied to clients via methodology refresh for *structure* only) | **Preferred** — optional paste-in sections for project ARCH detail |
| B | `tied/docs/arch-bbce-slice-ownership-guide.md` | Project `tied/docs/` | Fallback if sponsor wants git-tracked guide without template index entry |

Snippet sections (non-normative): `owning_slice_req`, `public_behavioral_boundaries`, `shared_mechanisms_touched`, `anticipated_cross_slice_deps`, `slice_map_ref`.

---

## Exit statement (build-plan W4 — 2026-09-27)

**Recommendation:** **Adopt (revise)** at advisory pilot — optional BBCE bundle via `bbce_advisory_enforced`; no CI hard fail; no vertical-slice folder mandate.

**STDD pilot:** Mechanisms A–D documented and checklist-merge complete; B/C analysis modules regression-green; W1 **0.60** locality baseline and W3 paths.ts dry-run on record with explicit proof boundaries.

**Deferred:** Strict enforcement REQ, canonical `tied/citdp/` copy, machine request-evidence envelope close-out.

**Next sponsor action (optional):** `traceable-commit` when ready to land W0–W4 uncommitted batch; escalate to strict-candidate only with explicit REQ + gate policy change.
