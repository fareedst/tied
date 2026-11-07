# IMPL-PROMPT_TYPE_REFINE_BUILD_PHASE_GUARD — essence pseudocode

<!-- [REQ-PROMPT_TYPE_REFINE_BUILD_PHASE_GUARD] [ARCH-PROMPT_TYPE_REFINE_BUILD_PHASE_GUARD] [IMPL-PROMPT_TYPE_REFINE_BUILD_PHASE_GUARD] -->

```
LINT_PLAN_BUILD_SEQUENCE_HANDOFF(markdown)
  // Implements D1–D2 handoff lint for bootstrap tests
  PRE: markdown is session-handoff body
  phase := EXTRACT plan_phase
  IF phase != pre-implementation THEN RETURN ok
  do_next := EXTRACT ## Do next section
  IF do_next missing THEN RETURN fail missing_do_next_section
  IF do_next lacks @build-plan THEN RETURN fail pre_implementation_requires_build_plan_in_do_next
  POST: ok or coded failure
  EFFECTS: none (pure lint)

BUILD_PLAN_PREFLIGHT(handoff_path, product_tree_exists)
  // Implements D4–D5 prose contract in build-plan SKILL
  PRE: build-plan leaf invoked with linked PLAN
  READ handoff_path
  IF plan_phase pre-implementation AND required [x] without build-plan changelog THEN
    EMIT DIAGNOSTIC: PLAN_BUILD_SEQUENCE_VIOLATION; STOP
  IF plan_phase pre-implementation AND product_tree_exists THEN
    EMIT PLAN_BUILD_SEQUENCE_VIOLATION; STOP (no idempotent pass)
  POST: caller may proceed to tied-implement
```
