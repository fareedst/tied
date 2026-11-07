# Plan–build sequence guard

[REQ-PROMPT_TYPE_REFINE_BUILD_PHASE_GUARD] [ARCH-PROMPT_TYPE_REFINE_BUILD_PHASE_GUARD] [IMPL-PROMPT_TYPE_REFINE_BUILD_PHASE_GUARD]

**Traceability:** [REQ-TIED_PROMPT_SKILL_DISK_HANDOFF](prompt-skill-disk-handoff.md) · [session-handoff-structure.md](session-handoff-structure.md) · [prompt-execution-mode.md](prompt-execution-mode.md)

Field evidence: client `fb-mw68y52s-ixqm8x` (cite only; disposable client `1794045120`).

---

## plan_phase (D1)

Record in **Plan spine** or header as **`plan_phase`**:

| Value | Meaning |
| --- | --- |
| `pre-implementation` | PLAN/CITDP on disk; **no** product implementation authority until sponsor **`@build-plan`** |
| `post-build` | Implementation done for current scope; refine may sync PLAN only |
| `close-out-ready` | Verification/close-out artifacts pending; build-plan not required unless scope reopens |

Do not rely on informal “Phase:” prose alone when `plan_phase` is set.

---

## Do next matrix (D2–D3)

| plan_phase | refine-plan / add-feature **Do next** |
| --- | --- |
| `pre-implementation` | **MUST** include **`@build-plan`** as the primary required next skill; **MUST NOT** list **only** `@close-out` |
| `post-build` | Optional **`@close-out`**; **MUST NOT** recommend `@build-plan` unless scope reopened |
| `close-out-ready` | **`@close-out`**; same as post-build for build-plan recommendation |

Plan leaves stop in **plan mode** after updating disk; chat lists paths only.

---

## Changelog attribution (D7)

- **`add-feature`**, **`refine-plan`**, **`non-tied-plan`**, **`non-tied-refine`**: append **Changelog** rows only; do **not** mark required step checkboxes `[x]` for implementation work.
- **`build-plan`**, **`close-out`**: may mark required/optional checkboxes and append changelog with `prompt_type: build-plan` or `close-out`.

---

## build-plan preflight (D4–D5)

**Before** [tied-implement.md](tied-implement.md) (step 5 in build-plan SKILL):

1. Read `tied-project/working/{REQ-TOKEN}/evidence/session-handoff.md` (Plan spine + Plan execution steps).
2. If **`plan_phase: pre-implementation`** and any **required** slug is `[x]` without a changelog row whose skill is **`build-plan`** or **`close-out`**, **STOP** and emit:

   `DIAGNOSTIC: PLAN_BUILD_SEQUENCE_VIOLATION` — required steps marked done before sponsor `@build-plan` attribution.

3. **Idempotent re-entry (D5):** If product or test tree for the REQ exists but handoff still says **`pre-implementation`**, do **not** respond with “already implemented / idempotent pass”. Surface **`PLAN_BUILD_SEQUENCE_VIOLATION`** or offer **`tied_feedback_capture_observation`**; fix handoff phase or re-run refine-plan.

Optional bootstrap lint: [plan-build-sequence-handoff.mjs](../../../tools/bootstrap/lib/plan-build-sequence-handoff.mjs) (`lintPlanBuildSequenceHandoff`).

---

## Sponsor threading (D6)

In a **single chat thread**, do not run [tied-implement.md](tied-implement.md) after refine-plan without an explicit sponsor **`@build-plan`** unless the sponsor requests combined execution. Separate agentstream turns per skill remain valid.

---

## Related failures (out of scope)

Incomplete `workflow_trial_agentstream` harness errors (`WritableIterable`, shell `expanded_batch`) are **not** fixed by this guard — see [REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT](../../../tied-project/working/REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT/PLAN.md).
