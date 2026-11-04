# Trial readout: PROMPT-WF-03 → Composer 2.5 (Cursor agentstream) → `1793820250-wf-agentstream-wf-03-cursor-composer25`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-04 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-03`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-03](catalog-traditional-workflow-trial-prompts.md#prompt-wf-03) |
| **Model config** | `composer-2.5` |
| **Model slug** | `composer-2.5-fast` |
| **Harness** | `cursor-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1793820250-wf-agentstream-wf-03-cursor-composer25` |
| **Factory tag** | `wf-agentstream-wf-03-cursor-composer25` |
| **Product REQ** | `REQ-MODULE_COMPOSITION` |
| **Cohort comparison** | Fourth **PROMPT-WF-03** Cursor/Composer agentstream cell with **full four-turn close-out**; first in cohort with **default orchestrator process log** ([REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG](../../tied-project/requirements/REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG.yaml)). Peers: [Composer @ 1793605811](trial-readout-PROMPT-WF-03-composer25-1793605811-wf-agentstream-wf-03.md), [Claude @ 1793815895](trial-readout-PROMPT-WF-03-claudehaiku55-1793815895-wf-agentstream-wf-03-claude-claudehaiku55.md), [Cursor @ 1793817075](trial-readout-PROMPT-WF-03-composer25-1793817075-wf-agentstream-wf-03-cursor-composer25.md). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build two small library modules (producer and consumer) and a separate wiring module that connects them. Prove the connection with an automated test that does not start a graphical UI. Keep business logic out of any CLI entry file; add a minimal CLI only if needed to run tests.
```

**Catalog stress:** composition seam — wiring test before CLI/UI glue. **Proof boundary:** `executable_behavior` + workflow gate receipts on subject client + orchestrator process log on client.

---

## Agent processing difficulties (per turn)

Friction below cites **orchestrator process log** (`process.stderr.log` / agent stdout tee) where available — transcript-grade for shell harness boundaries; agent reasoning remains partial.

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | **Cold session:** `session_id=e354223a-…` (stderr turn banner); full add-feature scaffold before product work. **Bootstrap context:** orchestrator logged `DIAGNOSTIC: materialized preload contract: …/tied-project/agent-preload-contract.yaml` — disposable client received project preload contract ([REQ-WF_TRIAL_FOUR_PHASE_HARDENING](../../tied-project/working/REQ-WF_TRIAL_FOUR_PHASE_HARDENING/PLAN.md)), unlike peer **1793817075** bundle-template fallback. |
| **2** | `refine-plan` | **Gate churn:** seven `pre_implementation-*.json` receipts under `gates/` (multiple advisory gate runs before one allowed receipt stuck in narrative). **Wide TIED fan-out:** ARCH/IMPL, pseudo-code, vocab, tracker, test strategy in one turn (stdout summary). |
| **3** | `build-plan` | **RED captured:** `composition-test-red.stdout.txt` shows `ERR_MODULE_NOT_FOUND` for missing modules — stronger test-strategy evidence than peer cells without RED archive. **Close-out deferred by design** at handoff (stdout). **No `tsconfig.json`:** TypeScript runs via `tsx` + `npm test` only; facilitator `tsc -p tsconfig.json` **N/A** (missing file). |
| **4** | `close-out` | **Adherence reconcile waived:** `tied_adherence_reconcile_run` / `--reconcile` unavailable (no agentstream dist); ledger **not_run** (same class as **1793817075**). **Post-commit evidence drift:** agent noted two evidence files updated with commit SHA **after** `28b52cf` but **not** in that commit — honesty gap vs single-commit ideal. **Orchestrator folder untracked** by close-out gitignore policy. |

**Cross-turn harness notes:** four isolated sessions (`738914f6-…` on turn 4); batch file `/var/folders/.../traditional-four-phase-batch.KijqA1QOwq.yaml`; orchestrator **`exit_code: 0`**, ~13 min wall (`started_at` → `finished_at` in manifest).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| producer module | **PRODUCER_MODULE** — `createProducer()` with `subscribe` / `emit`; **Message** type exported from producer | [module-composition.md](/Users/fareed/Documents/dev/test/1793820250-wf-agentstream-wf-03-cursor-composer25/tied-project/vocab/module-composition.md); `src/producer.ts` |
| consumer module | **CONSUMER_MODULE** — `createConsumer()` with `receive` / `getReceived()` | PLAN; `src/consumer.ts` |
| wiring module | **WIRING_MODULE** — `wireModules(producer, consumer)` | `src/wiring.ts` |
| automated test | **COMPOSITION_TEST** — `src/wiring.test.ts`; no graphical UI | PLAN; test file |
| CLI entry | **None in v1** — `npm test` only | PLAN locked decision |
| delivery | **DELIVERY_MODE** push — synchronous listener on `emit` | vocab + ARCH |

---

## What was built

- **Library:** TypeScript ESM `src/producer.ts`, `src/consumer.ts`, `src/wiring.ts` ( **Message** on producer; **no** separate `message.ts` ).
- **Composition proof:** **`src/wiring.test.ts`** — facilitator **`npm test`** 1/1 pass.
- **TIED stack:** `REQ-MODULE_COMPOSITION` **Implemented** (index); ARCH/IMPL + pseudo-code; CITDP persisted; checklist tracker.
- **Git:** bootstrap **`b645191`**; feature + TIED close-out scope **`28b52cf`** (single traceable commit).
- **Orchestrator:** `MODEL_SLUG=composer-2.5-fast` `MODEL_CONFIG=composer-2.5` `HARNESS=cursor` `workflow_trial_agentstream wf-03`.

---

## Outcome record

**Implementation outcome:** Successful — **`npm test`** pass on facilitator re-run; no standalone `tsconfig.json` (not required for locked harness).

**Workflow outcome:** **Complete** at turn 4 — machine `close_out` **allowed**, traceable feature commit, envelope validate **0** blocking gaps (close-out handoff).

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `close_out-2026-11-04T19-36-04-648Z.json` → `allowed: true`, depth `minimal` |
| **Process contract** | **pass** | Envelope build/backfill/validate; CITDP at `tied-project/citdp/`; phase handoffs for all four turns |
| **Adherence ledger** | **not_run** | Reconcile skipped — no agentstream dist; waiver documented in close-out handoff |
| **Close-out honesty** | **pass (REQ)** | REQ **`Implemented`** in project index; post-commit evidence SHA drift **disclosed** in agent stdout |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ / ARCH / IMPL | `tied-project/requirements/`, `architecture-decisions/`, `implementation-decisions/` |
| PLAN | `tied-project/working/REQ-MODULE_COMPOSITION/PLAN.md` |
| Envelope | `.../evidence/request-evidence-envelope.v1.json` |
| Gates | `.../gates/` — multiple pre_implementation, verification, close_out |
| **Interaction inventory** | `.../evidence/trial-workflow-interaction-inventory.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Inventory excerpt:** `harness`: `cursor-agentstream-four-phase`; four sponsor turns; turn 4 lists `close_out_gate_receipt`.

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-03-1793820250-wf-agentstream-wf-03-cursor-composer25/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`**.

**Proof boundary:** `facilitator_session_reconstruction` — paths, SHAs, gate filenames, orchestrator log excerpts; not full chat transcripts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ/ARCH/IMPL scaffold, CITDP draft, PLAN, tracker, inventory seed; preload contract materialized; no product code |
| 2 | `refine-plan` | RESOLVE locked; pre_implementation gate (multiple receipts); still no `src/` |
| 3 | `build-plan` | RED stdout archived; modules + composition test GREEN; verification gate |
| 4 | `close-out` | Envelope, close_out gate, CHANGELOG, commit **`28b52cf`**; reconcile **not_run** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1793820250-wf-agentstream-wf-03-cursor-composer25/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | `0` |
| **Stdout log** | `…/evidence/process.stdout.log` (agent turn summaries tee’d) |
| **Stderr log** | `…/evidence/process.stderr.log` (orchestrator DEBUG/DIAGNOSTIC, turn boundaries) |

**Friction excerpts (stderr / manifest):**

- Disposable client path + `DEBUG: workflow-trial-agentstream wf=WF-03 … disposable_tag=wf-agentstream-wf-03-cursor-composer25`
- `DIAGNOSTIC: materialized preload contract: …/agent-preload-contract.yaml`
- Turn banners `--- turn N/4 (new session) ---` with distinct `session_id` per turn
- `DIAGNOSTIC: batch=/var/folders/.../traditional-four-phase-batch.KijqA1QOwq.yaml`
- Final `DIAGNOSTIC: wf-trial process log manifest=…/wf-trial-orchestrator-run.v1.json`

**Stdout (build-plan):** explicit RED artifact path `composition-test-red.stdout.txt` and verification gate filename cited in turn 3 summary.

**Cross-check:** Inventory four turns align with stderr turn count; git shows no `src/` before **`28b52cf`**.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | **`b645191`** bootstrap only until **`28b52cf`** — **no** `src/` before feature commit (**pass** heuristic) |
| Inventory vs git | Turns 1–2 claim no production code; consistent with history |
| RED evidence | **Present** — failing module-not-found run archived under quality-manifest |
| Uncertainty | Per-turn SHAs not in inventory; four new sessions — audit is **heuristic** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Producer/consumer/wiring split and no-CLI default locked before code |
| Traceability closure | **A** | Full R+A+I; REQ **Implemented**; facilitator consistency **ok** |
| Test strategy | **A−** | RED stdout archived; single happy-path composition test |
| Algorithm / implementation | **A** | Push delivery; **Message** on producer avoids extra module file |
| Process adherence | **B+** | Gates + envelope pass; adherence reconcile **not_run**; post-commit evidence drift |
| Workflow choreography | **A** | Full four turns + inventory + tagged client + **process log manifest** for facilitator replay |
| Methodology learning readout | **B+** | First WF-03 cell graded with default orchestrator logs; documents preload materialize + gate churn; not a effectiveness claim |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. Process logs improve **operator reproducibility** and facilitator friction analysis; they do not replace subject-client gate receipts or prove agentstream beats manual IDE skills.

---

## Cross-model notes (PROMPT-WF-03)

Compared with [Cursor agentstream @ 1793817075](trial-readout-PROMPT-WF-03-composer25-1793817075-wf-agentstream-wf-03-cursor-composer25.md):

- **Process evidence:** this cell has **default stdout/stderr capture** + manifest; peer readout disclaimed transcript-grade orchestrator logs.
- **Preload:** **materialized** `agent-preload-contract.yaml` vs peer bundle-template DIAGNOSTIC fallback.
- **RED:** archived failing run here vs peer GREEN-only manifest class.
- **Layout:** **no** mid-build **`message.ts`**; **Message** type on producer only.
- **Git:** **one** feature commit vs peer **`6ff7dda`** + evidence follow-up **`24bb02e`**.

Compared with [Composer agentstream @ 1793605811](trial-readout-PROMPT-WF-03-composer25-1793605811-wf-agentstream-wf-03.md):

- Both complete four turns; this cell adds explicit **Cursor** harness tag and **orchestrator process log** artifacts.

Compared with [Claude Haiku @ 1793815895](trial-readout-PROMPT-WF-03-claudehaiku55-1793815895-wf-agentstream-wf-03-claude-claudehaiku55.md):

- **Workflow closure:** this run **finished turn 4**; Claude cell stopped at build-plan on disk.

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Documents the **first PROMPT-WF-03 facilitator readout** that consumes [REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG](../../tied-project/working/REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG/PLAN.md) artifacts end-to-end. Confirms **`@record-wf-trial`** can cite stderr turn boundaries and tee’d agent summaries without copying logs into the store repo.

Pilot matrix intent ([catalog](catalog-traditional-workflow-trial-prompts.md#recommended-trial-sequences)): add Luna/IDE cells for PROMPT-WF-03 before cross-harness composition claims.

---

## TIED 4.0.0 dogfood

Subject client bootstrapped at **TIED 4.0.0** (`b645191`). Documents **Cursor-harness** agentstream four-phase wiring on a **composition seam** prompt with **orchestrator process logging**; **not** an effectiveness claim for TIED 4.0.0 or for Composer 2.5.

---

## Facilitator follow-ups

- Rebuild **`mcp-server/packages/agentstream`** before expecting **`tied_adherence_reconcile_run`** on trial clients.
- Optional: follow-up commit on subject client for evidence SHA lines left unstaged after **`28b52cf`**.
- Cohort: compare **`Methodology learning readout`** bands once Luna cells include process logs.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Prior Cursor WF-03 readout (peer)](trial-readout-PROMPT-WF-03-composer25-1793817075-wf-agentstream-wf-03-cursor-composer25.md)
- [WF trial orchestrator process log PLAN](../../tied-project/working/REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG/PLAN.md)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-03-1793820250-wf-agentstream-wf-03-cursor-composer25/PLAN.md)
