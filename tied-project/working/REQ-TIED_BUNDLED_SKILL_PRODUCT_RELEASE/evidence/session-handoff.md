# Session handoff — REQ-TIED_BUNDLED_SKILL_PRODUCT_RELEASE

**handoff_kind:** plan  
**request_token:** `REQ-TIED_BUNDLED_SKILL_PRODUCT_RELEASE`  
**prompt_type:** `refine-plan`  
**Date:** 2026-11-07  
**Status:** **pre-implementation** — gate **allowed** (receipt in `gates/`); ready for `@build-plan`

## Plan execution steps

### Required

- [ ] **slice-a-docs-catalog** — `tied-bundle/docs/bundled-skill-product-release.md` + `BUNDLED_SKILL_RELEASE_CATALOG` in manifest
- [ ] **slice-b-red-validators** — RED `skill-product-release-validate` + `bundled-skill-product-release` e2e
- [ ] **slice-c-baseline-semver-evals** — `metadata.version` + `evals/` on all cataloged bundled skills
- [ ] **slice-d-ci-run-evals** — diff semver check + optional `.github/workflows/bundled-skill-run-evals.yml`
- [ ] **slice-e-compose-links** — Wave 2 phased table (operator-local); no matrix row
- [ ] **slice-f-consistency-close** — `tied_validate_consistency`, verification gate, vocab RECORD

### Optional

- [ ] **non-tied-close** — charter-only git hygiene from sibling non-tied plan (sponsor choice)

### Recommendations

- Run heavy evals only via `/run-evals`; do not treat stub `latest.json` as Q1 evidence.
- Matrix §2 row remains a **costly** separate REQ.

### Changelog (this REQ)

| Date | prompt_type | Summary |
| --- | --- | --- |
| 2026-11-07 | add-feature | Cursor plan: Wave 3 phases 3–5, all bundled skills |
| 2026-11-07 | refine-plan | PLAN, CITDP, Tracker, test-strategy, TIED stack stubs on disk |

## Do next

**`@build-plan`** on [PLAN.md](../PLAN.md) — `plan_phase: pre-implementation`.

## Paths

| Artifact | Path |
| --- | --- |
| PLAN | [PLAN.md](../PLAN.md) |
| CITDP | [CITDP-REQ-TIED_BUNDLED_SKILL_PRODUCT_RELEASE.yaml](../../../citdp/CITDP-REQ-TIED_BUNDLED_SKILL_PRODUCT_RELEASE.yaml) |
| Tracker | [checklist-tracker.yaml](../checklist-tracker.yaml) |
| Test strategy | [test-strategy.md](../test-strategy.md) |
| Source comparison | [google-agent-skills-vs-tied-agent-management.md](../../../../docs/comparisons/google-agent-skills-vs-tied-agent-management.md) |
