# Catalog — harness metering lite workflow (four-phase canary)

| Field | Value |
| --- | --- |
| **Purpose** | **Controlled** four-phase trials for harness-eval metering development: same skills as [traditional WF catalog](catalog-traditional-workflow-trial-prompts.md) with **minimal GREEN** product scope. |
| **Audience** | HMEP operators · harness parser developers |
| **Status** | Draft (refine-plan 2026-11-12; finalize at [REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW](../../tied-project/working/REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW/PLAN.md) build-plan) |
| **Orchestrator** | `workflow_trial_agentstream wf-meter-01` (build-plan) |
| **Suite** | [metering-canary-suite-v1.yaml](harness-eval/suites/metering-canary-suite-v1.yaml) |

---

## Trial protocol (facilitator)

1. From the TIED store: `source scripts/build-commands.sh && workflow_trial_agentstream wf-meter-01` (or `--dry-run` for extract proof).
2. Four turns via [`traditional-four-phase-agentstream.yaml`](traditional-four-phase-agentstream.yaml) (unchanged batch).
3. Optional: `harness-eval events import --wf-client <disposable>` after [HMEP](../../tied-project/working/REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM/PLAN.md) build-plan.
4. **`@record-wf-trial` grading optional** — primary metric path is harness-eval import (**D-PROOF-BOUNDARY-CANARY**).

---

## Controlled budgets (normative)

| Dimension | Budget |
| --- | --- |
| Product LOC in `src/` | ≤ 45 (non-comment) |
| Unit tests | ≤ 2 total |
| Wall clock (orchestrated, target) | 8–15 minutes on low-effort model cells |
| Phases | 4 (`add-feature` … `close-out`) |

---

## Four-phase sponsor protocol

Same as [traditional catalog § Four-phase sponsor protocol](catalog-traditional-workflow-trial-prompts.md#four-phase-sponsor-protocol-normative).

**PLAN header lines (turn 1):**

```markdown
**Trial:** PROMPT-WF-METER-01
**Model config:** <from matrix>
**Model slug:** <exact id>
**Workflow:** add-feature → refine-plan → build-plan → close-out
```

---

## Trial prompts

### PROMPT-WF-METER-01

```text
Build a minimal TypeScript library with one exported function named meteringCanaryLabel that returns the fixed string "harness-meter-canary-v1". Include exactly one unit test that asserts the return value. No CLI, no extra modules, no network I/O.
```
