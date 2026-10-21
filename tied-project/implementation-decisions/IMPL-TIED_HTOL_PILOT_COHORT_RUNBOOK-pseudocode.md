# [IMPL-TIED_HTOL_PILOT_COHORT_RUNBOOK] [ARCH-TIED_HTOL_PILOT_COHORT_RUNBOOK] [REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK] — Operator cohort runbook, instance template, bootstrap test, charter cross-links.

Grammar-Version: v2

## SLICE_A_AUTHOR_RUNBOOK

- [IMPL-TIED_HTOL_PILOT_COHORT_RUNBOOK] [ARCH-TIED_HTOL_PILOT_COHORT_RUNBOOK] [REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK] Author paste-friendly runbook checklist composing Loop 3 charter without duplicating policy bounds.
- Contract:
  - INPUT: PLAN-HTOL-PILOT-COHORT-RUNBOOK; harness-trace-learning-experiment-charter operator sequence
  - PRE: add-feature REQ/ARCH/IMPL minted; TIED_BASE_PATH verified
  - OUTPUT: tied-bundle/docs/htol-pilot-cohort-runbook.md | { error: missing_required_section }
  - POST: Runbook defers improved/regressed to sponsor costly choice; defaults not_measured/inconclusive
  - EFFECTS: No new MCP gate tools

## SLICE_B_INSTANCE_TEMPLATE

- [IMPL-TIED_HTOL_PILOT_COHORT_RUNBOOK] [ARCH-TIED_HTOL_PILOT_COHORT_RUNBOOK] [REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK] Optional fill-in YAML for experiment_id, cohort_id, window, stop overrides.
- Contract:
  - INPUT: Charter defaults (3–30 cohort, 8-week window, operator_local)
  - PRE: Runbook references template path
  - OUTPUT: tied-bundle/templates/htol-pilot-cohort-runbook-instance.v1.example.yaml
  - POST: denominator_fingerprint htol-v1 and compatibility_key documented

## SLICE_C_CROSS_LINKS

- [IMPL-TIED_HTOL_PILOT_COHORT_RUNBOOK] [ARCH-TIED_HTOL_PILOT_COHORT_RUNBOOK] [REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK] Link runbook from charter operator sequence and HTOL guide Loop 3 section.
- Contract:
  - INPUT: Committed runbook path
  - PRE: No authority-boundary regression vs REQ-TIED_HARNESS_PLATFORM_SEAM
  - OUTPUT: Updated charter and harness-trace-observation-loop.md with resolvable links
  - POST: Charter policy prose unchanged except additive pointers

## SLICE_D_RUNBOOK_DOC_CONTRACT_TEST

- [IMPL-TIED_HTOL_PILOT_COHORT_RUNBOOK] [ARCH-TIED_HTOL_PILOT_COHORT_RUNBOOK] [REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK] Bootstrap test locks required runbook sections, htol-v1 marker, and cross-link presence in charter and loop docs.
- Contract:
  - INPUT: REQUIRED_MARKERS in htol-pilot-cohort-runbook-doc.test.mjs
  - PRE: RED test committed before runbook complete (or same session GREEN after body)
  - OUTPUT: node --test pass | { error: missing_marker }
  - POST: Test describe title references REQ-TIED_HTOL_PILOT_COHORT_RUNBOOK
