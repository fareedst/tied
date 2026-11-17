# Trial readout: PROMPT-WF-08 → Claude Sonnet 5.5 (high effort) → `1794797980-wf-agentstream-wf-08-claude-claudesonnet55high`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-16 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-08`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-08](catalog-traditional-workflow-trial-prompts.md#prompt-wf-08) |
| **Model config** | `claude-sonnet-5-5 (high effort)` |
| **Model slug** | `claude-sonnet-5-5` |
| **Model effort** | `high` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794797980-wf-agentstream-wf-08-claude-claudesonnet55high` |
| **Factory tag** | `1794797980-wf-agentstream-wf-08-claude-claudesonnet55high` |
| **Product REQ** | `REQ-JOB_LIFECYCLE_STATE_MACHINE` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-JOB_LIFECYCLE_STATE_MACHINE/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First Sonnet **`@high`** WF-08 cell; contrasts medium complete @ 1794619211. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a tiny explicit state machine with three states and two events. Reject illegal transitions with a documented error. Include tests for at least one legal sequence and one illegal transition.
```

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| **three states** | `idle`, `running`, `done` (job lifecycle) | PLAN § RESOLVE |
| **two events** | `start`, `finish` | PLAN § RESOLVE |
| **explicit** | Literal `TRANSITIONS` table | PLAN decisions D3–D4 |
| **documented error** | `IllegalTransitionError` with stable name and message | PLAN D6 |
| Product scope | `REQ-JOB_LIFECYCLE_STATE_MACHINE` | REQ + PLAN |

---

## What was built

- **Product:** Job lifecycle state machine (`transition`, `canTransition`, `JobMachine`); facilitator **24/24** green tests; typecheck clean.
- **TIED:** REQ/ARCH/IMPL stack, CITDP persisted; envelope **0** blocking gaps.
- **Git:** **`a00eea9`** — `feat(job-sm): add job lifecycle state machine` (single product commit after bootstrap **`534b76c`**).
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator wall **606s** (~10 min).

---

## Outcome record

**Implementation outcome:** **Complete** — facilitator replay **24/24**; `tied_validate_consistency` **`ok: true`**.

**Workflow outcome:** **Complete (machine)** — close_out **allowed**; orchestrator **`exit_code: 0`**.

**Grading outcome:** **Grade mean (registry compact):** 3.96 · A/A/A/A/A/A-/A.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `close_out-2026-11-16T03-08-30-895Z.json` |
| **Process contract** | **pass** | Four-turn inventory + phase handoffs |
| **Orchestrator** | **pass** | **`exit_code: 0`** |

---

## Workflow inventory

`trial-workflow-interaction-inventory.v1.json` on subject client — PROMPT-WF-08, harness `claude-agentstream-four-phase`, methodology **4.2.2**.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | completed — transition table and error contract resolved in PLAN |
| 2 | `refine-plan` | completed — decisions D1–D10; stale `cli.binding` manifest row slated for removal |
| 3 | `build-plan` | completed — RED archived, GREEN **24/24**; verification **allowed** |
| 4 | `close-out` | completed — close_out **allowed**; traceable **`a00eea9`** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Exit code** | **`0`** |
| **Wall** | **606s** |
| **Sessions** | `c6191437…`, `c7fe38ee…`, `e9073545…`, `a306f9ea…` |

**Friction:** Standard WF stack seed, proof manifest gate, `model_effort=high`, slim checklist path; four fresh Claude sessions per turn.

---

## Phase boundary audit

Bootstrap **`534b76c`** (TIED **4.2.2**) then single product commit **`a00eea9`**. Inventory turn order matches observed git history.

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **24** pass |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Illegal pairs and `IllegalTransitionError` locked before RED. |
| Traceability closure | **A** | close_out allowed with product commit `a00eea9`. |
| Test strategy | **A** | Twenty-four cases including exhaustive 3×2 and prototype-key guards. |
| Algorithm / implementation | **A** | Frozen transition table with `Object.hasOwn` lookup semantics. |
| Process adherence | **A** | Verification and close_out gates allowed; CITDP persisted. |
| Workflow choreography | **A−** | Four turns complete; ten-minute wall versus four-minute medium batch. |
| Methodology learning readout | **A** | Contrasts Sonnet medium minimum (**3/3**) with expanded `@high` coverage. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-08)

Compare [Sonnet medium @ 1794619211](trial-readout-PROMPT-WF-08-claudesonnet55medium-1794619211-wf-agentstream-wf-08-claude-claudesonnet55medium.md) (**3/3** tests). Broader tests here reflect sponsor “comprehensive within scope” and refine-plan depth, not a maturity ranking. **No ranking.**

---

## TIED version / dogfood

Session methodology **4.2.2** captured at add-feature via `tied-methodology-version.session.v1.json` (`install_json`). Facilitator inspection only; not an effectiveness claim.

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-08-1794797980-wf-agentstream-wf-08-claude-claudesonnet55high/evidence/)