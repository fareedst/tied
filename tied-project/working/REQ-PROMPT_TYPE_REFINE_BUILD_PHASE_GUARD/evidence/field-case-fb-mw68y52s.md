# Field case — fb-mw68y52s-ixqm8x (acceptance design)

**Client:** `/Users/fareed/Documents/dev/test/1794045120`  
**REQ:** `REQ-SEMVER_COMPARATOR`  
**Feedback:** `fb-mw68y52s-ixqm8x` (client `tied-project/feedback.yaml` only)

## Replay steps (sponsor-observed)

1. **add-feature** — plan scaffold.
2. **build-plan** (agent, same thread) — product + tests green **before** sponsor refine-plan.
3. **refine-plan** (sponsor) — disk synced to post-build; Do next optional `@close-out`.
4. **build-plan** (sponsor) — agent: idempotent re-run, no violation signal.

## Expected behavior after [REQ-PROMPT_TYPE_REFINE_BUILD_PHASE_GUARD]

| Step | Expected agent behavior |
| --- | --- |
| 2 (premature build) | If handoff `plan_phase: pre-implementation`, step 2 should not mark required slugs `[x]` without `build-plan` changelog; build-plan preflight at step 2 would be normal — **violation is step 2 running in plan thread without sponsor `@build-plan`** (D6 sponsor education) |
| 3 | refine-plan sets `plan_phase: post-build`; Do next must not be `@build-plan` alone |
| 4 | With `plan_phase: post-build`, idempotent verify is allowed; with stale `pre-implementation` + product tree, D5 **PLAN_BUILD_SEQUENCE_VIOLATION** |

## Build-plan verification

Manual checklist for T-VIOLATION-01 after guard doc ships: reviewer confirms D4–D5 text covers rows in table above.
