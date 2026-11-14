# Trial readout: PROMPT-WF-08 → Claude Opus 5.5 (low effort) → `1794599749-wf-agentstream-wf-08-claude-claudeopus55low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-08`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-08](catalog-traditional-workflow-trial-prompts.md#prompt-wf-08) |
| **Model config** | `claude-opus-5-5` (`low` effort) |
| **Model slug** | `claude-opus-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794599749-wf-agentstream-wf-08-claude-claudeopus55low` |
| **Factory tag** | `1794599749-wf-agentstream-wf-08-claude-claudeopus55low` |
| **Product REQ** | `REQ-TINY_STATE_MACHINE` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-TINY_STATE_MACHINE/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | **4.2.2** Opus **low** WF-08; **split signal** (orchestrator **0**, close_out **blocked**); pairs [Grok @ 1794202372](trial-readout-PROMPT-WF-08-grok47-med-1794202372-wf-agentstream-wf-08-cursor-grok47med.md) (**workflow complete**, **5/5**) without ranking. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a tiny explicit state machine with three states and two events. Reject illegal transitions with a documented error. Include tests for at least one legal sequence and one illegal transition.
```

**Catalog stress:** state machine TDD (illegal-event tests after IMPL plan). **Proof boundary:** legal + illegal transition tests.

---

## What was built

- **Product:** Tiny FSM + tests; facilitator **`npm test` 5/5** pass.
- **TIED:** `REQ-TINY_STATE_MACHINE`; verification and close_out gates **blocked** on tracker/CITDP shape.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **259s** (~4.3 min).
- **Git:** HEAD **`544c7fd`** (bootstrap **4.2.2** only); product **uncommitted** at facilitator replay.

---

## Outcome record

**Implementation outcome:** **Delivered** — five green tests at facilitator replay.

**Workflow outcome:** **Split signal** — orchestrator **`exit_code: 0`**; machine **`close_out` blocked** (`invalid_slug:implement-code`, `invalid_slug:red-tests`, missing adversarial evidence fields).

**Grading outcome:** **Grade mean (registry compact):** 3.25 · A/B+/A−/A/B/C+/B/B.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **blocked** | `close_out-2026-11-13T19-59-36-220Z.json` **allowed: false** |
| **Process contract** | **partial** | Four turns + handoffs; tracker slug drift; adversarial CITDP gaps |
| **Orchestrator** | **pass** | **`exit_code: 0`** (harness success ≠ workflow complete) |

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; **4.2.2** |
| 2 | `refine-plan` | Transition table + error type locked |
| 3 | `build-plan` | FSM + **5** green tests; verification gate **blocked** then partial recovery |
| 4 | `close-out` | close_out **blocked**; no traceable product commit |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Exit code** | **`0`** |
| **Wall time** | **259s** |

**Friction excerpts:** Close-out receipt lists **`invalid_slug`**, **`invalid_slug:implement-code`**, **`invalid_slug:red-tests`**, and missing adversarial evidence references (counterexamples, disconfirming observations, falsification questions).

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Three-state / two-event scope and illegal reject policy clear. |
| Traceability closure | **B+** | R+A+I on disk; no traceable product commit. |
| Test strategy | **A−** | Legal + illegal paths covered (**5** cases). |
| Algorithm / implementation | **A** | FSM behavior matches refine contract under test. |
| Process adherence | **C+** | close_out **blocked**; tracker slugs + adversarial CITDP incomplete. |
| Workflow choreography | **B** | Orchestrator **`exit_code: 0`** but machine close-out **not allowed**. |
| Methodology learning readout | **B** | **Split signal** documents harness vs gate honesty; no ranking vs Grok complete WF-08. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-08)

[Grok WF-08 @ 1794202372](trial-readout-PROMPT-WF-08-grok47-med-1794202372-wf-agentstream-wf-08-cursor-grok47med.md) reached **workflow complete** with **`c46b459`**; [Luna @ 1794231848](trial-readout-PROMPT-WF-08-luna-low-1794231848-wf-agentstream-wf-08-cursor-gpt56lunalow.md) shows similar split pattern. **No ranking.**

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-08-1794599749-wf-agentstream-wf-08-claude-claudeopus55low/evidence/)
