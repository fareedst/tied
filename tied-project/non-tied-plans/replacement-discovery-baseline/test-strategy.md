# Test strategy — replacement-discovery-baseline

**Slug:** `replacement-discovery-baseline`  
**Wave 2 token:** `DOC-TIED-RDB-ANALYSIS`  
**Mode:** Doc / analysis artifact verification—no product RED tests on this track.

**Program gate:** PLAN states **replacement phases 8–11 deferred**; runbook header links § Phase scope gate.

---

## QA checklist (wave 1 import — done)

- [x] Runbook at `docs/methodologies/replacement-discovery-baseline-runbook.md`
- [x] PLAN ↔ runbook mutual links; analysis-only scope in PLAN + runbook header
- [x] v1.0 body intact (12 sections, 12 execution phases in file)

---

## QA checklist (wave 2 analysis)

- [ ] `tied-project/working/DOC-TIED-RDB-ANALYSIS/replacement-discovery/00-*.md` contains explicit **8–11 deferred** statement
- [ ] No committed files `10-replacement-opportunities.md` … `13-decision-log-and-readiness-review.md` (unless empty stubs with **deferred** banner)
- [ ] Every **CON-*** with `status: required` has EV-* or GAP-* (no orphan requirements from code alone)
- [ ] Registry YAML validates under project `lint_yaml` when touched
- [ ] Phase reports `evidence/phase-{0..7}-report.md` exist before claiming gate complete
- [ ] Analysis completion gates **G-0** through **G-7** and **G-9** evidenced in `evidence/analysis-exit-review.md`
- [ ] No project `requirements.yaml` / detail writes unless sponsor switched to `@add-feature`

---

## Manual scenario — analysis exit

**Steps:** Reviewer reads only `replacement-discovery/00-*`, `09-*`, and `registry/gaps.yaml`.

**Expected:** Can explain what TIED does for sponsors and operators today; can list top gaps; **cannot** infer an authorized successor design from committed artifacts.

**RED tests:** None on non-TIED track.