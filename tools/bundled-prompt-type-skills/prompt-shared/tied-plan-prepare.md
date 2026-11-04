# Plan (prepare only — no RED)

[REQ-PROMPT_TYPE_SKILL_EXECUTION_MODE] [IMPL-PROMPT_TYPE_GLOBAL_SKILLS]

For **`add-feature`**, **`refine-plan`**, **`non-tied-plan`**, and **`non-tied-refine`** ([prompt-execution-mode.md](prompt-execution-mode.md) **plan** mode). **`use-skill`** runs this prepare step then continues to [tied-plan-citdp-build.md](tied-plan-citdp-build.md) in the same invocation. Execute leaves (`build-plan`, `non-tied-build`) use [tied-plan-citdp-build.md](tied-plan-citdp-build.md) for RED tests.

## Plan (when the request is refined)

1. **CITDP + LEAP + TIED:** Read `tied-bundle/docs/client-development-index.md` first.
2. Copy a per-task **Tracker** from `tied-bundle/docs/agent-req-implementation-checklist.yaml` (see its header).
3. Read task-relevant IMPL pseudo-code in scope from impact discovery.
4. Perform CITDP **analysis** (`change-definition`, impact, **`risk-assessment`**, **`test-strategy`**). Persist `tied-project/citdp/CITDP-*.yaml` **after** implementation (see **Change records** / `citdp-policy.md`).
   When the change touches `prompt_type_workflow`, follow [methodology-surface-enrollment-advisory.md](methodology-surface-enrollment-advisory.md).
   During impact discovery, select and record `profile_depth` and `gate_policy`. At **`risk-assessment`**, apply the eligibility table (`docs/integrated-activation-checklist-enforcement-plan.md` §7). Optional advisory `pre_implementation` gate — do not treat RED block as plan failure.
5. **Design** tests and security mitigations in `test-strategy.md` or checklist evidence — **do not author RED test files** in plan mode.
6. Capture out-of-scope items in `leap-proposals/` or the task working folder.

**Gate:** End with plan-mode handoff; invoke `@refine-plan` or `@build-plan` next. Do not start code or RED tests.
