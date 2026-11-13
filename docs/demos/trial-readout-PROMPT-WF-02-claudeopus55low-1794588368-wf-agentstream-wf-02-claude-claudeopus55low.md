# Trial readout: PROMPT-WF-02 → Claude Opus 5.5 (low effort) → `1794588368-wf-agentstream-wf-02-claude-claudeopus55low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-13 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-02`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-02](catalog-traditional-workflow-trial-prompts.md#prompt-wf-02) |
| **Model config** | `claude-opus-5-5` (`low` effort) |
| **Model slug** | `claude-opus-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794588368-wf-agentstream-wf-02-claude-claudeopus55low` |
| **Factory tag** | `1794588368-wf-agentstream-wf-02-claude-claudeopus55low` |
| **Product REQ** | `REQ-STDIN_DEDUP_CLI` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-STDIN_DEDUP_CLI/evidence/tied-methodology-version.session.v1.json` (turn add-feature) |
| **Cohort comparison** | First **4.2.2** Opus **low** WF-02 cell; ambiguity policy documented before ship. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a CLI that reads lines from stdin and prints a deduplicated stream to stdout. The requirement is intentionally vague about whether duplicate lines should keep first or last occurrence. Document your chosen policy and what you do not guarantee before shipping. Include tests for at least two input orderings.
```

**Catalog stress:** ambiguity deferral (TIED-DEMO-01). **Proof boundary:** human decision documented + executable CLI behavior.

---

## What was built

- **Product:** stdin line-dedup CLI + tests; facilitator **`npm test` 11/11** pass (includes **1** composition wiring case per size receipt).
- **TIED:** `REQ-STDIN_DEDUP_CLI` with CITDP; close_out **allowed**; envelope **0** blocking.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **324s** (~5.4 min).
- **Git:** product pin **`dc03a13`** on client.
- **Project size layers:** unit **6**; **composition_tests: 1** ([facilitator snapshot](../../tied-project/working/FACILITATOR-WF-02-1794588368-wf-agentstream-wf-02-claude-claudeopus55low/evidence/project-size-snapshot.v1.json)).

---

## Outcome record

**Implementation outcome:** **Complete** — eleven passing tests at facilitator replay.

**Workflow outcome:** **Complete (machine)** — `close_out` **allowed**; traceable commit **`dc03a13`**.

**Grading outcome:** **Grade mean (registry compact):** 3.81 · A/A/A−/A/A−/A/B+.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `gates/close_out-2026-11-13.json` **allowed: true** |
| **Process contract** | **partial** | Envelope ok; reconcile **not_run** (waived) |
| **Adherence ledger** | **not_run** | Minimal/advisory |
| **Orchestrator** | **pass** | **`exit_code: 0`** |

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; **4.2.2** session capture |
| 2 | `refine-plan` | **First-seen wins** duplicate policy documented |
| 3 | `build-plan` | CLI + tests green; verification gate |
| 4 | `close-out` | CITDP persist; **`dc03a13`** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Exit code** | **`0`** |
| **Wall time** | **324s** |

**Friction excerpts:** Same **4.2.2** orchestrator diagnostics as WF-01 batch; proof manifest + phase-handoff default on.

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | First-vs-last ambiguity resolved in PLAN before implementation. |
| Traceability closure | **A** | CITDP + traceable commit **`dc03a13`**. |
| Test strategy | **A−** | Multiple input orderings covered; composition facet thin vs full binding inventory. |
| Algorithm / implementation | **A** | CLI honors documented first-seen dedup policy under test. |
| Process adherence | **A−** | close_out allowed; adherence reconcile not_run at sponsor depth. |
| Workflow choreography | **A** | Orchestrator **`exit_code: 0`**; four-turn batch complete. |
| Methodology learning readout | **B+** | First Opus low WF-02 on **4.2.2**; no ranking vs Sonnet **1794101881** split cell. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness.

---

## Cross-model notes (PROMPT-WF-02)

Pairs with [1794101881](trial-readout-PROMPT-WF-02-claudesonnet55-1794101881-wf-agentstream-wf-02-claude-sonnet55.md) (Sonnet split — tests uncommitted). **No ranking.**

---

## Harness-eval utilization (HMEP)

**Import run:** 2026-11-13 — stream-json (four turns). Evidence: [harness-eval-import.md](../../tied-project/working/FACILITATOR-WF-02-1794588368-wf-agentstream-wf-02-claude-claudeopus55low/evidence/harness-eval-import.md).

| Metric | Value |
| --- | --- |
| `wall_clock_ms` | 324000 |
| `input_tokens` | 52 |
| `output_tokens` | 14306 |
| `reasoning_tokens` | 674 |
| `completeness` | complete |
| `harness_estimated_cost` | null (list-price gap for Opus 5.5) |

---

## Related links

- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-02-1794588368-wf-agentstream-wf-02-claude-claudeopus55low/evidence/)
