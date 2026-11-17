# Trial readout: PROMPT-WF-03 → Claude Haiku 5.5 (high effort) → `1794852636-wf-agentstream-wf-03-claude-claudehaiku55high`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-16 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-03`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-03](catalog-traditional-workflow-trial-prompts.md#prompt-wf-03) |
| **Model config** | `claude-haiku-5-5 (high effort)` |
| **Model slug** | `claude-haiku-5-5` |
| **Model effort** | `high` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794852636-wf-agentstream-wf-03-claude-claudehaiku55high` |
| **Factory tag** | `1794852636-wf-agentstream-wf-03-claude-claudehaiku55high` |
| **Product REQ** | `REQ-PRODUCER_CONSUMER_WIRING` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** |
| **Cohort comparison** | First Haiku **`@high`** WF-03 on **4.2.2** (composition stress **TIED-DEMO-03**). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build two small library modules (producer and consumer) and a separate wiring module that connects them. Prove the connection with an automated test that does not start a graphical UI. Keep business logic out of any CLI entry file; add a minimal CLI only if needed to run tests.
```

---

## What was built

- **Product:** Producer, consumer, wiring modules; facilitator **13/13** binding-focused tests.
- **Git:** **`d5ca686`** — `feat(wiring): add producer and consumer modules`.
- **Stack:** orchestrator wall **796s** (~13 min).

---

## Outcome record

**Implementation outcome:** **Complete** — **13/13**.

**Workflow outcome:** **Complete (machine)** — close_out **allowed**; client handoff labels overall **incomplete** while process/adherence remain **partial** (tracker slugs pending, hash stale).

**Grading outcome:** **Grade mean (registry compact):** 3.67 · A/A-/B+/A/B+/A-/A-.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | Gate allowed; receipt under gitignored bundle mirror |
| **Process contract** | **partial** | Tracker `verification-gate` / `traceable-commit` still pending on disk |
| **Orchestrator** | **pass** | **`exit_code: 0`** |

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | Module split scaffold |
| 2 | `refine-plan` | Wiring boundary locked |
| 3 | `build-plan` | GREEN **13/13** |
| 4 | `close-out` | **`d5ca686`** with partial tracker sync |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Producer/consumer/wiring separation in PLAN. |
| Traceability closure | **A−** | Product commit present; tracker close-out slugs still pending. |
| Test strategy | **B+** | Thirteen tests prove wiring without UI. |
| Algorithm / implementation | **A** | Modules match composition prompt shape. |
| Process adherence | **B+** | Machine close_out pass; partial contract signals. |
| Workflow choreography | **A−** | Thirteen-minute wall; four sessions. |
| Methodology learning readout | **A−** | Fills Haiku high column for composition stress WF-03. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-03-1794852636-wf-agentstream-wf-03-claude-claudehaiku55high/evidence/)