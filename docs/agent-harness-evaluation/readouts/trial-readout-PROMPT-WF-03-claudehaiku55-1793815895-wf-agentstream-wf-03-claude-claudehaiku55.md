# Trial readout: PROMPT-WF-03 → Claude Haiku 5.5 (agentstream) → `1793815895-wf-agentstream-wf-03-claude-claudehaiku55`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-04 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → **`close-out` not completed** (facilitator inspection) |
| **Trial prompt** | [PROMPT-WF-03](catalog-traditional-workflow-trial-prompts.md#prompt-wf-03) |
| **Model config** | `claude-haiku-5-5` |
| **Model slug** | `claude-haiku-5-5` |
| **Harness** | `claude` agentstream four-phase batch ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1793815895-wf-agentstream-wf-03-claude-claudehaiku55` |
| **Factory tag** | `wf-agentstream-wf-03-claude-claudehaiku55` |
| **Product REQ** | `REQ-PRODUCER_CONSUMER_WIRING` |
| **Cohort comparison** | Second **PROMPT-WF-03** readout; peer [Composer agentstream @ 1793605811](trial-readout-PROMPT-WF-03-composer25-1793605811-wf-agentstream-wf-03.md) |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build two small library modules (producer and consumer) and a separate wiring module that connects them. Prove the connection with an automated test that does not start a graphical UI. Keep business logic out of any CLI entry file; add a minimal CLI only if needed to run tests.
```

**Catalog stress:** composition seam — wiring test before CLI/UI glue. **Proof boundary:** `executable_behavior` on facilitator re-run of `npm test`; workflow completion **not** claimed.

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| producer module | **PRODUCER_MODULE** — `createProducer()` with `subscribe` / `emit` | IMPL-PRODUCER_MODULE pseudo-code; `src/producer.js` |
| consumer module | **CONSUMER_MODULE** — `createConsumer()` with `receive` / `values` | IMPL-CONSUMER_MODULE; `src/consumer.js` |
| wiring module | **WIRING_MODULE** — `connect(producer, consumer)` | `src/wiring.js` |
| automated test | **COMPOSITION_TEST** + unit cases — `node --test`, 13 cases | `test/wiring.test.js`; `test-strategy.md` |
| CLI entry | **None** — `npm test` only | PLAN locked default |
| delivery | Push-style synchronous `subscribe` → `receive` | PLAN + ARCH |

No client `tied-project/vocab/` file; glossary lives in CITDP draft and PLAN.

---

## What was built

- **Library:** ESM modules `src/producer.js`, `src/consumer.js`, `src/wiring.js` with token comments on wiring seam.
- **Tests:** **`test/wiring.test.js`** — 13 passing cases (unit + composition + structural import rules); facilitator **`npm test`** 13/13.
- **TIED stack (on disk, mostly uncommitted):** `REQ-PRODUCER_CONSUMER_WIRING` **Planned**; `ARCH-PRODUCER_CONSUMER_WIRING`; IMPL producer/consumer/wiring + pseudo-code sidecars; working PLAN with refine + build handoff sections; CITDP draft; full checklist tracker copy.
- **Git:** Only bootstrap commit **`2c4cfb5`** (`TIED 4.0.0`). Feature artifacts **not committed**.
- **Bootstrap validation:** `tied-claude-client-validation.v1.json` **`ok: true`** at client creation (canonical MCP JSON / `TIED_CLIENT_PROJECT_PATH`).

**Scope honesty:** Matches PROMPT-WF-03 composition stress with broader test battery than the Composer WF-03 gold readout (13 vs 1 test) — reflects agent test-strategy choices, not a quality ranking.

---

## Outcome record

**Implementation outcome:** **Partial.** Executable behavior passes locally; **no traceable feature commit** and **no close-out gate receipt**.

**Workflow outcome:** **Incomplete** at turn 4 — treat as **build-plan reached on working tree**, not a finished four-phase trial.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail / not run** | No `tied-bundle/working/REQ-PRODUCER_CONSUMER_WIRING/gates/close_out-*.json`; no project gate mirror |
| **Process contract** | **partial** | Rich PLAN + CITDP draft + tracker template; envelope present with **`depth_tier: integrated`** mismatch vs CITDP **minimal** and **error** gaps (evidence-chain-profile) |
| **Adherence ledger** | **missing** | Tracker `execution_evidence.completed` empty; no gate ledger JSONL |
| **Close-out honesty** | **gap** | REQ **Planned** despite green tests; no three-signal close-out handoff on client |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ / ARCH / IMPL | `tied-project/requirements/`, `architecture-decisions/`, `implementation-decisions/` (untracked except index stubs) |
| PLAN | `tied-project/working/REQ-PRODUCER_CONSUMER_WIRING/PLAN.md` |
| Envelope | `.../evidence/request-evidence-envelope.v1.json` (partial; blocking-style gaps at integrated profile) |
| **Interaction inventory** | `.../evidence/trial-workflow-interaction-inventory.v1.json` — **stale** (`phase: add-feature` only; no four-turn `sponsor_turns`) |

**Inventory gap:** Harness field reads `cursor-agentstream-four-phase` while client tag is **Claude** — likely turn-1 template drift; facilitator corrected harness in metadata table above.

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-03-1793815895-wf-agentstream-wf-03-claude-claudehaiku55/evidence/build-plan-verification-evidence.md)

**Proof boundary:** `facilitator_session_reconstruction` — disk + git + local test re-run; not full agentstream transcripts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold, PLAN, tracker, CITDP draft, inventory seed |
| 2 | `refine-plan` | ARCH + three IMPL tokens, pseudo-code sidecars, test-strategy (13 cases); advisory pre_implementation gate diagnostics documented in PLAN |
| 3 | `build-plan` | `src/` + `test/` + `package.json` on disk; **13/13 green**; indexes updated on disk — **uncommitted** |
| 4 | `close-out` | **Not observed** — no CHANGELOG, manifest, verify update, or feature commit |

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | Single commit **`2c4cfb5`** bootstrap only — **cannot** verify per-turn SHAs |
| Working tree vs turns | Product files **untracked** — consistent with agentstream deferring git until close-out, but close-out **did not run** |
| Phase boundary (choreography) | **Uncertain pass** — no committed `src/` before a hypothetical close-out commit because **nothing committed after bootstrap** |
| RED evidence | test-strategy lists RED-first; facilitator has **GREEN-only** local run — RED not archived |
| Uncertainty | Inventory does not list four turns; audit is **heuristic** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A−** | Defaults and RESOLVE locked in PLAN before code; JS/`node:test` choices explicit |
| Traceability closure | **B** | R+A+I on disk with pseudo-code; token comments in wiring; **Planned** REQ + uncommitted tree |
| Test strategy | **A−** | 13 cases cover seam, unsubscribe edge, import structure; no RED artifact |
| Algorithm / implementation | **A** | Thin modules, explicit `connect`, TypeErrors on bad inputs |
| Process adherence | **C+** | No gate receipts, empty tracker dispositions, envelope/profile mismatch |
| Workflow choreography | **D+** | Turn 4 missing; inventory stale; no completion-signals table on client; bootstrap validation **pass** is a positive harness signal |
| Methodology learning readout | **N/A** | Not requested |

**Feedback ingest:** N/A (no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. This cell documents **Claude haiku 5.5** on the **post-validation** orchestrator path; it does **not** show parity with the Composer WF-03 **close_out** fingerprint until turn 4 is re-run or completed manually.

---

## Cross-model notes (PROMPT-WF-03)

Compared with [Composer agentstream WF-03 @ 1793605811](trial-readout-PROMPT-WF-03-composer25-1793605811-wf-agentstream-wf-03.md):

- **Harness family:** Same four-phase batch; this cell uses **`HARNESS=claude`** and **`claude-haiku-5-5`** vs Cursor **`composer-2.5-fast`**.
- **Bootstrap:** Claude validation **`ok: false`** class on pre-fix trials (see store [REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS](../../tied-project/working/REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS/PLAN.md)); **this client validates `ok: true`** at bootstrap.
- **Product depth:** More tests shipped on disk (13 vs 1) but **weaker workflow closure** (Composer cell reached **`close_out` allowed** + feature commit **`b2335c2`**).
- **Shared drift class:** REQ YAML not promoted to **Implemented** when tests are green — here exacerbated by **missing close-out entirely**.

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Second published **PROMPT-WF-03** readout. Confirms that **green `npm test` alone** does not equal workflow trial success without turn 4 artifacts. Pilot matrix row still needs Luna/IDE cells before cross-harness composition claims ([catalog](catalog-traditional-workflow-trial-prompts.md#recommended-trial-sequences)).

---

## TIED 4.0.0 dogfood

Subject bootstrapped at **TIED 4.0.0** (`2c4cfb5`). Documents Claude agentstream on a **composition seam** prompt after store validation fixes; **not** an effectiveness claim for TIED 4.0.0 or for Claude Haiku 5.5.

---

## Facilitator follow-ups

- Re-run **`close-out`** on the subject client (or re-orchestrate turn 4 only) to obtain gate receipt + traceable commit; refresh inventory with four `sponsor_turns`.
- Optional: archive RED stdout for case 8 (primary connection test).
- Matrix: compare post-close-out fingerprint to **WF03_CURSOR_GOLD** (`1793760220-wf-agentstream-wf-03`) when sponsor runs manual parity smoke.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Composer WF-03 agentstream readout (peer)](trial-readout-PROMPT-WF-03-composer25-1793605811-wf-agentstream-wf-03.md)
- [Claude wf-03 gaps REQ (store)](../../tied-project/working/REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS/PLAN.md)
- [WF trial disposable tag PLAN](../../tied-project/working/REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG/PLAN.md)
