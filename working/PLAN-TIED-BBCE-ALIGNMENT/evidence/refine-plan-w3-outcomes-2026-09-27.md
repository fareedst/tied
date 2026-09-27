# Refine-plan W3 outcomes — PLAN-TIED-BBCE-ALIGNMENT

**Date:** 2026-09-27 · **Wave:** W3 (Mechanisms B + C) · **Status:** refine complete — **pre_implementation allowed** (integrated/advisory); receipt `working/PLAN-TIED-BBCE-ALIGNMENT/gates/pre_implementation-2026-09-27T15-23-08-701Z.json`

## Summary

Refined Mechanisms **B** (shared-code change justification) and **C** (boundary violation detection) to build-plan-ready specs: checklist sub-procedure, analysis module boundaries, JSONL/event schema proposals, false-positive policy, pilot dry-run criteria, and W4 handoff. **No B/C production code** in this refine pass.

## Depth and gate policy

| Field | Value |
| --- | --- |
| **depth_tier** | `integrated` (W3 build-plan) |
| **gate_policy** | `advisory` (default); escalate to strict-candidate only after W3 dry-run + sponsor |
| **prior_depth_tier** | `integrated` (W1–W2) |

## Mechanism B — build-plan spec

- **Checklist:** `sub-shared-code-change-justification-pass` (advisory in W3 pilot; optional strict hook deferred).
- **Triggers:** (1) diff path matches `shared_mechanism_globs` in slice map; (2) path outside declared surface allowance; (3) path outside IMPL `code_locations` for tokens touched in diff (when plumb preview supplies tokens).
- **Output:** Working-folder record `bbce-shared-code-justification.v1` — consumers, blast radius, local alternative, `waiver_ref`, `review_status`.
- **CITDP attach:** `risk_analysis.bbce_alignment.shared_code_justification_ref` (and optional JSONL ref).
- **Module:** `mcp-server/src/analysis/bbce-shared-code-justification.ts` (+ tests); no default MCP tool in W3 unless sponsor adds REQ.

## Mechanism C — build-plan spec

- **Decision:** Standalone **`bbce-boundary-violation-report`** in `mcp-server/src/analysis/` (not a new `tied_scoped_analysis_run` mode in W3 — scoped analysis may wrap later).
- **Inputs:** Repo slice map `tied/analysis/*.yaml`, git diff paths, optional import heuristics (phase 2).
- **Output:** `bbce-boundary-violation.v1` report — crossings distinct from traceability_gap_report.
- **Slice map authority:** Project repo map `tied/analysis/agentstream-slice-map.yaml` = **STDD pilot default**; methodology-wide default **deferred** (W4 promotion).
- **False-positive policy:** `working/PLAN-TIED-BBCE-ALIGNMENT/w3-refine/false-positive-policy.md`.

## JSONL / evidence

| Schema | Recommendation |
| --- | --- |
| `bbce-locality-event.v1` | Keep for locality loop (W2); optional cross-link via `scenario_id` |
| `bbce-shared-code-justification.v1` | **New** event/record schema (example only in refine) |
| `bbce-boundary-violation.v1` | **New** report schema (example only in refine) |

## Pilot dry-run (W3 build-plan)

- Same agentstream slice map as W2.
- Add replay scenario (or historical diff) that touches `shared_mechanism_globs` — **`paths.ts`** anchor.
- Acceptance: B produces justification record; C produces crossing list; neither blocks LEAP; advisory logs only.

## Adversarial inquiry (W3 refine)

- **pre_implementation run_id:** `w3-refine-pre-impl-2026-09-27`
- **Artifacts:** `working/PLAN-TIED-BBCE-ALIGNMENT/adversarial-inquiry/phase-pre_implementation/`
- **Build-plan:** Re-run at **verification** with implementation scope (B/C modules).

### Falsification questions (B/C)

1. Does shared-code justification auto-block LEAP updates to shared IMPL without waiver?
2. Does boundary violation detection conflate cross-slice edits with traceability gaps?
3. Would strict enforcement on `paths.ts` churn block legitimate cross-binding fixes?

## REQ token recommendation

**No new REQ for W3 build-plan default path** — checklist sub-procedure docs + analysis modules + working-folder evidence only (mirrors W2). Add **`REQ-*` only if** sponsor registers a new MCP tool surface or changes checklist gate blocking behavior (then LEAP ARCH/IMPL).

## W4 handoff (what W3 must produce)

1. B/C unit tests + dry-run JSON/JSONL under `working/PLAN-TIED-BBCE-ALIGNMENT/pilot/`.
2. False-positive policy validated against dry-run output.
3. Proposed checklist sub-procedure text for Mechanism **D** promotion hook.
4. Updated `bbce-schemas.ts` validators for new v1 schemas.
5. Verification-phase adversarial inquiry + gate receipt at integrated/advisory.

## Next step

**build-plan W3** when sponsor confirms — `pre_implementation` gate receipt under `working/PLAN-TIED-BBCE-ALIGNMENT/gates/`.
