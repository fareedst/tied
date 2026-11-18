# Test strategy — replacement-discovery-baseline

**Slug:** `replacement-discovery-baseline`  
**Mode:** Doc-only QA for wave 1—no product RED tests.

---

## QA checklist (document)

- [x] Runbook exists at `docs/methodologies/replacement-discovery-baseline-runbook.md`.
- [x] Runbook header states **non-normative** status and **does not mint** REQ/ARCH/IMPL/PROC tokens.
- [x] Runbook header links to `tied-project/non-tied-plans/replacement-discovery-baseline/PLAN.md`.
- [x] PLAN.md links back to the runbook (canonical path).
- [x] v1.0 body includes all **12 numbered main sections** from source (Objective through Final delivery contract) plus record conventions and artifact tree.
- [x] All **12 phase headings** (Phase 0 through Phase 11) present in imported body.
- [x] Grep runbook header for forbidden phrases: `status: implemented`, `REQ-TIED_`, `[PROC-REPLACEMENT` (unless explicitly marked future wave).
- [x] Related links resolve: brownfield-intent-elevation, EDPC, EASAR paths from header.
- [x] No duplicate full runbook copy under `non-tied-plans/`.
- [x] PLAN states discriminant **RDB vs EDPC** and phase ↔ EDPC table.

---

## Manual scenario A — reviewer without codebase

**Steps:** Read runbook §1–§2 and header only.

**Expected:** Reviewer understands RDB is evidence for **successor design**, not a rewrite spec; five views and fact/inference/decision labeling are explicit.

---

## Manual scenario B — TIED operator crosswalk

**Steps:** Read PLAN § Positioning and phase ↔ EDPC table; skim [brownfield-intent-elevation.md](../../../tied-bundle/docs/brownfield-intent-elevation.md) Track C table.

**Expected:** Operator can state why **observed behavior** does not automatically become **REQ** in wave 1.

---

## Manual scenario C — build completeness

**Steps:** After `@non-tied-build`, count `### Phase` headings in runbook (expect 12) and verify `Version: 1.0` or equivalent version line.

**Expected:** No accidental truncation of phases 8–11 or anti-patterns section.

**RED tests:** None.