# Trial readout: PROMPT-WF-02 → Claude Haiku 5.5 (high effort) → `1794846046-wf-agentstream-wf-02-claude-claudehaiku55high`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-16 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-02`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-02](catalog-traditional-workflow-trial-prompts.md#prompt-wf-02) |
| **Model config** | `claude-haiku-5-5 (high effort)` |
| **Model slug** | `claude-haiku-5-5` |
| **Model effort** | `high` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794846046-wf-agentstream-wf-02-claude-claudehaiku55high` |
| **Factory tag** | `1794846046-wf-agentstream-wf-02-claude-claudehaiku55high` |
| **Product REQ** | `REQ-STDIN_LINE_DEDUP_CLI` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** |
| **Cohort comparison** | First Haiku **`@high`** WF-02 on **4.2.2**. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a CLI that reads lines from stdin and prints a deduplicated stream to stdout. The requirement is intentionally vague about whether duplicate lines should keep first or last occurrence. Document your chosen policy and what you do not guarantee before shipping. Include tests for at least two input orderings.
```

---

## What was built

- **Product:** Stdin line-dedup CLI; facilitator **17/17** tests; first-occurrence policy in PLAN.
- **Git:** **`05b413e`** — `feat(dedupe): add stdin line dedup CLI`.
- **Stack:** orchestrator wall **573s** (~10 min).

---

## Outcome record

**Implementation outcome:** **Complete** — **17/17**.

**Workflow outcome:** **Complete (machine)** — close_out **allowed**; orchestrator **`exit_code: 0`**. Adherence ledger **fail** on client (hash stale findings); commit still ran per handoff.

**Grading outcome:** **Grade mean (registry compact):** 3.71 · A/A/B+/A/B/A/A-.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `close_out-2026-11-16T16-28-52-687Z.json` |
| **Process contract** | **pass** | Verification manifest present |
| **Adherence ledger** | **fail** | `evidence_stale` / hash mismatch noted in handoff |

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold |
| 2 | `refine-plan` | Retention policy locked |
| 3 | `build-plan` | GREEN **17/17** |
| 4 | `close-out` | **`05b413e`** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | First-occurrence policy documented pre-ship. |
| Traceability closure | **A** | close_out allowed with product commit. |
| Test strategy | **B+** | Seventeen cases; two orderings plus edge paths. |
| Algorithm / implementation | **A** | Dedup behavior matches declared policy. |
| Process adherence | **B** | Machine pass; adherence ledger not clean. |
| Workflow choreography | **A** | Clean four-turn batch cell. |
| Methodology learning readout | **A−** | Open sponsor note on non-UTF-8 byte matching remains. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-02-1794846046-wf-agentstream-wf-02-claude-claudehaiku55high/evidence/)