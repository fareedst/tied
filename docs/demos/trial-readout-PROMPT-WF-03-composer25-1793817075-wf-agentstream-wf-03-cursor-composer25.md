# Trial readout: PROMPT-WF-03 → Composer 2.5 (Cursor agentstream) → `1793817075-wf-agentstream-wf-03-cursor-composer25`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-04 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-03`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-03](catalog-traditional-workflow-trial-prompts.md#prompt-wf-03) |
| **Model config** | `composer-2.5` |
| **Model slug** | `composer-2.5-fast` |
| **Harness** | `cursor-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1793817075-wf-agentstream-wf-03-cursor-composer25` |
| **Factory tag** | `wf-agentstream-wf-03-cursor-composer25` |
| **Product REQ** | `REQ-MODULE_COMPOSITION` |
| **Cohort comparison** | Third **PROMPT-WF-03** readout with **full four-turn close-out**; peers [Composer @ 1793605811](trial-readout-PROMPT-WF-03-composer25-1793605811-wf-agentstream-wf-03.md), [Claude Haiku @ 1793815895](trial-readout-PROMPT-WF-03-claudehaiku55-1793815895-wf-agentstream-wf-03-claude-claudehaiku55.md) (incomplete turn 4) |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build two small library modules (producer and consumer) and a separate wiring module that connects them. Prove the connection with an automated test that does not start a graphical UI. Keep business logic out of any CLI entry file; add a minimal CLI only if needed to run tests.
```

**Catalog stress:** composition seam — wiring test before CLI/UI glue. **Proof boundary:** `executable_behavior` + workflow gate receipts on subject client.

---

## Agent processing difficulties (per turn)

Important friction observed from orchestrator output and subject-client artifacts (not a transcript-grade log).

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | **Preload fallback:** orchestrator logged `DIAGNOSTIC: preload: using tied-bundle template (no tied-project/agent-preload-contract.yaml in client)` — disposable client has no project preload contract; agent must bootstrap TIED context from bundle defaults. **Cold session:** new `session_id` per turn — no carry-over memory; full add-feature skill + MCP/`tied-cli` scaffold before any product work. **Scope gate:** must resist `src/` and RED tests until later phases (explicit handoff discipline). |
| **2** | `refine-plan` | **Wide artifact fan-out:** single turn updates PLAN, CITDP, test strategy, vocab, IMPL pseudo-code, ARCH/IMPL YAML via `tied-cli`, tracker, and pre_implementation gate — high coordination surface. Agent narrative referenced **applying gold refine-plan artifacts** to the trial client (store-shaped templates), which increases coupling risk if gold paths drift from disposable layout. **Policy navigation:** `sub-adversarial-inquiry-pass` → `not_applicable` at minimal depth (correct but non-obvious disposition). |
| **3** | `build-plan` | **Late module-boundary fix:** during TDD, agent hit “consumer must not import producer” and added **`src/message.ts`** — shared MESSAGE type not named as its own module in refine RESOLVE (reasonable fix, unplanned file). **Process lag at handoff:** build-plan reported tracker step dispositions **not fully synced** and **partial** machine/process close-out signals — close-out explicitly deferred. **RED evidence:** PLAN claims RED→GREEN; archived manifest is **GREEN-only** (same class as peer WF-03 cells). |
| **4** | `close-out` | **Adherence reconcile blocked:** `tied_adherence_reconcile_run` / `--reconcile` **failed** because **`@tied/agentstream` dist was missing** in the trial environment — adherence ledger **not_run** (documented WF trial waiver). **Checklist sync skipped:** `--sync-dispositions` not run; steps such as `three-way-alignment-unit` and `sync-tied-stack` remain **pending** while machine `close_out` still **allowed** (minimal + advisory). **Dual gate mirrors:** duplicate `close_out` receipts under `tied-bundle/working/` vs committed `tied-project/working/.../gates/` — git hygiene choice to exclude regenerable bundle copy. **Two-commit close-out:** feature commit **`6ff7dda`** plus follow-up **`24bb02e`** (evidence SHA) — extra git step vs single batched commit ideal. |

**Cross-turn harness notes:** four isolated agent sessions (`session_id` per turn); batch file under `/var/folders/.../traditional-four-phase-batch.*.yaml`; disposable tag encodes harness + model bucket per [REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG](../../tied-project/working/REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG/PLAN.md).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| producer module | **PRODUCER_MODULE** — `createProducer()` with `subscribe` / `emit`; monotonic **MESSAGE** `id` | [module-composition.md](/Users/fareed/Documents/dev/test/1793817075-wf-agentstream-wf-03-cursor-composer25/tied-project/vocab/module-composition.md) |
| consumer module | **CONSUMER_MODULE** — `createConsumer()` with `receive` / `getReceived()` | PLAN refine table; vocab |
| wiring module | **WIRING_MODULE** — `wireModules(producer, consumer)` | `src/wiring.ts` |
| message shape | **MESSAGE** — shared type module **`src/message.ts`** (added at build to avoid cross-imports) | `src/message.ts`; build-plan narrative |
| automated test | **COMPOSITION_TEST** — `src/wiring.test.ts`; no graphical UI | PLAN; test file |
| CLI entry | **None in v1** — `npm test` only | PLAN locked decision |
| delivery | **DELIVERY_MODE** push — synchronous listener on `emit` | vocab + ARCH |

---

## What was built

- **Library:** TypeScript ESM `src/producer.ts`, `src/consumer.ts`, `src/wiring.ts`, **`src/message.ts`** (shared type seam).
- **Composition proof:** **`src/wiring.test.ts`** — wired emit → `getReceived()`; facilitator **`npm test`** 1/1 pass.
- **TIED stack:** `REQ-MODULE_COMPOSITION` **Implemented** (post-`tied_verify`); ARCH/IMPL + pseudo-code; CITDP draft; checklist tracker.
- **Git:** bootstrap **`a5c96f7`**; feature **`6ff7dda`**; evidence follow-up **`24bb02e`**.
- **Orchestrator:** `MODEL_SLUG=composer-2.5-fast` `MODEL_CONFIG=composer-2.5` `HARNESS=cursor` `workflow_trial_agentstream wf-03`.

**Scope honesty:** Same minimal composition case count as first Composer WF-03 readout (1 test); **`message.ts`** is an extra file versus peer **`1793605811`** layout.

---

## Outcome record

**Implementation outcome:** Successful — **`npm test`** and **`npx tsc -p tsconfig.json`** pass on facilitator re-run.

**Workflow outcome:** **Complete** at turn 4 — machine `close_out` **allowed**, traceable feature commit, envelope **`blocking_gap_count: 0`**.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `close_out-2026-11-04T18-41-04-536Z.json` → `allowed: true`, depth `minimal` |
| **Process contract** | **partial** | Envelope + verification manifest present; tracker **pending** steps; **`--sync-dispositions` not run** (WF trial) |
| **Adherence ledger** | **not_run** | Reconcile skipped — missing agentstream dist; waiver in close-out narrative |
| **Close-out honesty** | **pass (REQ)** | REQ **`Implemented`** after verify — **better** than peer **`1793605811`** Draft lag |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ / ARCH / IMPL | `tied-project/requirements/`, `architecture-decisions/`, `implementation-decisions/` |
| PLAN | `tied-project/working/REQ-MODULE_COMPOSITION/PLAN.md` |
| Envelope | `.../evidence/request-evidence-envelope.v1.json` |
| Gates | `.../gates/` — pre_implementation, verification, close_out (project); bundle mirror + ledger |
| **Interaction inventory** | `.../evidence/trial-workflow-interaction-inventory.v1.json` |

**Inventory excerpt:** `harness`: `cursor-agentstream-four-phase`; four sponsor turns documented; close-out gate path on turn 4.

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-03-1793817075-wf-agentstream-wf-03-cursor-composer25/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`**.

**Proof boundary:** `facilitator_session_reconstruction` — paths, SHAs, gate filenames, orchestrator DIAGNOSTIC lines; not full chat transcripts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ/ARCH/IMPL scaffold, CITDP draft, PLAN, tracker, inventory seed; no product code |
| 2 | `refine-plan` | RESOLVE locked; pre_implementation gate; still no `src/` |
| 3 | `build-plan` | Modules + composition test GREEN; verification gate; **`message.ts`** added; partial tracker sync at handoff |
| 4 | `close-out` | Envelope, close_out gate, CHANGELOG, commits **`6ff7dda`** + **`24bb02e`**; reconcile **not_run** |

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | **`a5c96f7`** bootstrap only until **`6ff7dda`** — **no** `src/` before feature commit (**pass** heuristic) |
| Inventory vs git | Turns 1–2 claim no production code; consistent with history |
| RED evidence | GREEN stdout in quality manifest only — RED not independently archived |
| Uncertainty | Per-turn SHAs not in inventory; four new sessions — audit is **heuristic** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Producer/consumer/wiring split and no-CLI default locked before code |
| Traceability closure | **A** | Full R+A+I; **`tied_verify`** promoted REQ **Implemented**; facilitator consistency **ok** |
| Test strategy | **B+** | Single composition happy path; RED claimed in PLAN without failing-run artifact |
| Algorithm / implementation | **A** | Push delivery, monotonic ids; **`message.ts`** resolves import boundary cleanly |
| Process adherence | **B+** | Gates + envelope pass; tracker/sync/reconcile gaps documented honestly |
| Workflow choreography | **A−** | Full four turns + inventory + tagged disposable client; reconcile skip and pending checklist steps |
| Methodology learning readout | **N/A** | Not requested for PROMPT-WF-03 catalog cell |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. The **`HARNESS=cursor`** disposable-tag path documents **operator reproducibility**, not that agentstream beats manual IDE skills.

---

## Cross-model notes (PROMPT-WF-03)

Compared with [Composer agentstream @ 1793605811](trial-readout-PROMPT-WF-03-composer25-1793605811-wf-agentstream-wf-03.md):

- **Same model slug** and REQ token; this cell adds **explicit Cursor harness** in factory tag and completes close-out with **REQ Implemented** (peer had **Draft** lag).
- **Extra source file:** **`message.ts`** mid-build vs peer typing on producer/consumer only.
- **Shared friction class:** adherence reconcile depends on built agentstream dist; RED not archived.

Compared with [Claude Haiku @ 1793815895](trial-readout-PROMPT-WF-03-claudehaiku55-1793815895-wf-agentstream-wf-03-claude-claudehaiku55.md):

- **Workflow closure:** this run **finished turn 4**; Claude cell stopped at build-plan on disk.
- **Test count:** Claude shipped 13 cases uncommitted; this cell **1** committed composition test — prompt scope vs agent choice, not a quality ranking.

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

First **PROMPT-WF-03** readout with **`wf-agentstream-wf-03-cursor-composer25`** disposable tag after [REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG](../../tied-project/working/REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG/PLAN.md). Confirms that **machine close_out can pass** while **adherence reconcile** and **checklist disposition sync** remain optional/waived in WF trials — document both when comparing harness maturity.

Pilot matrix intent ([catalog](catalog-traditional-workflow-trial-prompts.md#recommended-trial-sequences)): add Luna/IDE cells for PROMPT-WF-03 before cross-harness composition claims.

---

## TIED 4.0.0 dogfood

Subject client bootstrapped at **TIED 4.0.0** (`a5c96f7`). Documents **Cursor-harness** agentstream four-phase wiring on a **composition seam** prompt; **not** an effectiveness claim for TIED 4.0.0 or for Composer 2.5.

---

## Facilitator follow-ups

- Rebuild **`mcp-server/packages/agentstream`** before expecting **`tied_adherence_reconcile_run`** on trial clients.
- Optional: run **`--sync-dispositions`** on future cells to close tracker **pending** steps without blocking minimal close_out.
- Optional: archive RED stdout for composition test to strengthen test-strategy evidence.
- Cohort: add **`trial-readout-PROMPT-WF-03-luna-*`** when sponsors run the pilot matrix row.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Composer WF-03 agentstream readout (peer)](trial-readout-PROMPT-WF-03-composer25-1793605811-wf-agentstream-wf-03.md)
- [Claude WF-03 readout (peer)](trial-readout-PROMPT-WF-03-claudehaiku55-1793815895-wf-agentstream-wf-03-claude-claudehaiku55.md)
- [WF trial disposable tag PLAN](../../tied-project/working/REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG/PLAN.md)
