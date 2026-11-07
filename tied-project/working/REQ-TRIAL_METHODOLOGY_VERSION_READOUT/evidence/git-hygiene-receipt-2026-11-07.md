# Git hygiene — plan_close_out (workspace clear)

**Date:** 2026-11-07 · **REQ:** REQ-TRIAL_METHODOLOGY_VERSION_READOUT (batch includes sibling REQs)

## Preview (pre-commit)

MCP `tied_git_hygiene` `context_mode: plan_close_out`, `apply: false`.

## Apply (post-commit workspace clear)

Operator: `source scripts/build-commands.sh && test-all-hygiene` ([REQ-TIED_GIT_HYGIENE] `RUN_STORE_TEST_ALL_HYGIENE`).

Actions:

- `git restore` on frozen regenerable tracked paths (fixture envelopes, source-graph index, envelope-gap report, JEV benchmark, checklist fixture manifest).
- `rm -f` untracked gate-test CITDP litter under `tied-project/citdp/CITDP-REQ-{ACTIVATION,NESTED,PRESERVE,UNIT_TEST,UPGRADE,UPGRADE-MISSING}.yaml` plus `CITDP-REQ-SEMVER_SATISFIES.yaml`.
- `git restore` unrelated `tied-project/non-tied-plans/tied-methodology-release-4-2-0/evidence/*` local drift.

MCP `tied_git_hygiene` `apply: true` was **not** used (`apply_requires_allowed_paths`).

**Result:** clean porcelain relative to batch close-out scope (verify with `git status`).
