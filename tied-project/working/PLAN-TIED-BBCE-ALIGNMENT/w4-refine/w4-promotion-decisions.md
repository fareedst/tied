# W4 promotion menu — sponsor decisions (NON-CANONICAL working copy)

**Change ID:** `PLAN-TIED-BBCE-ALIGNMENT`  
**Program recommendation (2026-09-27):** **Adopt (revise)** — optional BBCE advisory bundle at verification; no CI hard fail; no vertical-slice folder mandate.  
**Build-plan W4 (2026-09-27):** Checklist merge, working CITDP attach, ARCH snippet, and docs refresh **executed**. Never edit `tied/methodology/`.

## Sponsor approval (2026-09-27)

| Decision | Choice |
| --- | --- |
| Items 1–7 overall | **Approved** — adopt as written for STDD / this repo |
| When to run BBCE verification bundle | **Rule B:** default **on** when new `[REQ-*]` or any `[ARCH-*]` detail change; default **off** for existing-REQ bug fixes with no ARCH changes (override manually if needed) |
| Glossary provisional banner | **Removed** — approved for this repo |
| CITDP `bbce_alignment` attach | **Copied now** → `tied/citdp/CITDP-PLAN-TIED-BBCE-ALIGNMENT.yaml` |
| ARCH slice-ownership help | **Template + guide** → snippet + `tied/docs/arch-bbce-slice-ownership-guide.md` |
| Slice map policy (STDD) | **Required** when touching agentstream / mcp-server analysis paths |
| Strict / blocking enforcement (item 8) | **Defer** — add backlog item to draft strict REQ later (still not blocking now) |
| Git | **Hold push** until sponsor ready (traceable-commit records approval on disk) |

**Authority re-confirmed:** BBCE outputs remain human-reviewed evidence; TIED tokens, tests, and verification-gate still prove behavior.

| # | Candidate | Refine disposition | Rationale (W1–W3 pilot) | Canonical target (build-plan W4) |
|---|-----------|-------------------|---------------------------|--------------------------------|
| 1 | Glossary promotion (`tied/vocab/behavior-bounded-change-engineering.md`) | **Adopt (revise)** | W0–W4 terms exercised | **Done** — provisional banner removed; sponsor-approved status (2026-09-27) |
| 2 | Checklist `sub-bbce-advisory-verification-pass` | **Adopt (revise)** | B/C dry-run + 0.60 locality baseline; false-positive policy reviewed | Merge `proposed-bbce-advisory-pass.md` + `.yaml` into `tied/docs/agent-req-implementation-checklist.md` + `.yaml` (TDD for gate semantics only) |
| 3 | Tracker flag `bbce_advisory_enforced` | **Adopt (revise)** | STDD **rule B:** default **true** for new REQ or ARCH touch; **false** for IMPL-only bug fixes | Document on checklist YAML; no blocking gate |
| 4 | CITDP `risk_analysis.bbce_alignment` attach | **Adopt (revise)** | W2/W3 working refs proven | **Done** — `tied/citdp/CITDP-PLAN-TIED-BBCE-ALIGNMENT.yaml` (sponsor 2026-09-27) |
| 5 | ARCH template (owning slice / shared mechanism) | **Adopt (revise)** | Optional ARCH detail sections; not normative law | Snippet + **`tied/docs/arch-bbce-slice-ownership-guide.md`** — **no REQ** unless sponsor escalates |
| 6 | Slice map methodology default | **Adopt (revise)** | STDD pilot map calibrated | **STDD:** update `agentstream-slice-map.yaml` when agentstream/analysis paths change; other clients **opt-in** per `tied/analysis/README.md` |
| 7 | JSONL / plumb operator path | **Adopt (revise)** | W2 spike + W3 BC events | Document optional paths in `docs/plumb-audit-gate.md` + README; **no** CI mandate |
| 8 | Strict / blocking enforcement | **Defer (backlog REQ)** | Advisory policy + falsification dispositions | Sponsor backlog: draft strict REQ in a future change; no CI hard fail until then |
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

**Deferred:** Strict enforcement REQ (backlog); blocking CI on locality.

**Next sponsor action:** Push when ready. Escalate to strict-candidate only with explicit REQ + gate policy change. Program commits `21ff5d4`, close-out `2f14d65`, sponsor approval traceable-commit (2026-09-27).
