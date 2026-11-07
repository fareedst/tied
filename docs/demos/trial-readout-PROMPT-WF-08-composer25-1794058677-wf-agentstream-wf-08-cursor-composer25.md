# Trial readout: PROMPT-WF-08 → Composer 2.5 (Cursor agentstream) → `1794058677-wf-agentstream-wf-08-cursor-composer25`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-07 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-08`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-08](catalog-traditional-workflow-trial-prompts.md#prompt-wf-08) |
| **Model config** | `composer-2.5` |
| **Model slug** | `composer-2.5-fast` |
| **Harness** | `cursor-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1794058677-wf-agentstream-wf-08-cursor-composer25` |
| **Factory tag** | `wf-agentstream-wf-08-cursor-composer25` |
| **Product REQ** | `REQ-EXPLICIT_STATE_MACHINE` |
| **TIED methodology version (session)** | **4.2.0** — source **`install_json`** on session file (`capture_path: tied_cli_server_info` turn 1); evidence `…/REQ-EXPLICIT_STATE_MACHINE/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **PROMPT-WF-08** readout; **state machine TDD** stress — transition table and illegal-event tests locked in refine before RED in build-plan (catalog [STATE-05-ish](catalog-traditional-workflow-trial-prompts.md#facilitator-index-maps-trial-prompt--stress--grading)). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a tiny explicit state machine with three states and two events. Reject illegal transitions with a documented error. Include tests for at least one legal sequence and one illegal transition.
```

**Catalog stress:** state machine TDD — illegal-transition tests follow IMPL/plan locks in build-plan. **Proof boundary:** `executable_behavior` + orchestrator process log + facilitator git replay.

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | Session `17585a07-…`. Draft state/event names and transition table in PLAN; methodology **4.2.0** via `tied_cli_server_info`; plan mode — no product code. |
| **2** | `refine-plan` | Session `53c322f5-…`. Locked AC-LEGAL-1 / AC-ILLEGAL-1 / AC-TERMINAL-1 and D1–D5; stack table per `wf-trial-refine-plan-stack.md`; advisory `pre_implementation` **`allowed: false`** (expected at minimal depth). |
| **3** | `build-plan` | Session `5df746ad-…`. RED archived (`stateMachine-red.stdout.txt`) → GREEN **4/4**; `verification-evidence-manifest.v1.json`; adversarial **not_applicable**. |
| **4** | `close-out` | Session `b5ab3000-…`. Envelope **0** blocking gaps; gate receipt persisted; reconcile **thin_ledger** warn; traceable **`b329340`**; post-close `eabaf71` docs pin (disposable client). |

**Cross-turn harness notes:** batch `/var/folders/.../traditional-four-phase-batch.1sMv5XxVzn.yaml`; ~10.2 min wall (`2026-11-07T13:37:58Z` → `13:48:11Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| three states | `idle` \| `active` \| `done` | PLAN RESOLVE; AC groups |
| two events | `start` \| `complete` | Locked transition table |
| legal transition | Table-listed pairs only; `transition` returns new state | AC-LEGAL-1; T-LEGAL-1 |
| illegal transition | Any other pair; state unchanged | AC-ILLEGAL-1; T-ILLEGAL-1 |
| documented error | `StateTransitionError` with stable `name`, `state`, `event`, message | D4; T-ERROR-1 |
| terminal `done` | Any event from `done` throws | AC-TERMINAL-1; T-TERMINAL-1 |
| “more comprehensive” | No scope expansion beyond single `src/stateMachine/` module | add-feature handoff |

---

## What was built

- **Product:** `src/stateMachine/` (`createStateMachine`, `StateTransitionError`, colocated tests) — **4** passing tests (legal sequence, illegal from idle, error shape, terminal guard).
- **TIED:** `REQ-EXPLICIT_STATE_MACHINE` + `ARCH-EXPLICIT_STATE_MACHINE` + `IMPL-EXPLICIT_STATE_MACHINE`; CITDP **draft** at `working/…/CITDP-REQ-EXPLICIT_STATE_MACHINE.draft.yaml` (not promoted to `tied-project/citdp/`); REQ index **`Implemented`**.
- **Stack:** `wf-trial-ts-node-test-v1`; facilitator `npm test` / typecheck green on replay.
- **Git:** bootstrap **`d3087aa`** + product/close-out **`b329340`**; orchestrator logs uncommitted (expected).
- **Orchestrator:** `MODEL_SLUG=composer-2.5-fast` `HARNESS=cursor` `workflow_trial_agentstream wf-08`.

---

## Outcome record

**Implementation outcome:** **Delivered** — facilitator `npm test` **4/4**; typecheck pass.

**Workflow outcome:** **Complete** — inventory four turns **completed**; `close_out_gate_receipt` linked; orchestrator manifest **`exit_code: 0`** aligned with delivery.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | Gate receipt `allowed: true`; envelope validate **0** blocking gaps |
| **Process contract** | **partial** | CITDP remains **draft** under `working/`; tracker dual-write / thin ledger at minimal advisory |
| **Adherence ledger** | **partial** | Reconcile band C; `thin_ledger` / `legacy_no_adherence_chain` warn (expected disposable WF trial) |
| **Close-out honesty** | **pass** | Partial signals named in `phase-handoff-close-out.md`; not conflated with machine pass |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ | `tied-project/requirements/REQ-EXPLICIT_STATE_MACHINE.yaml` (index **Implemented**) |
| PLAN | `tied-project/working/REQ-EXPLICIT_STATE_MACHINE/PLAN.md` |
| CITDP | `tied-project/working/REQ-EXPLICIT_STATE_MACHINE/CITDP-REQ-EXPLICIT_STATE_MACHINE.draft.yaml` (**draft**) |
| Envelope | `…/evidence/request-evidence-envelope.v1.json` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` — four turns **completed** |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-08-1794058677-wf-agentstream-wf-08-cursor-composer25/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`**.

**Proof boundary:** `facilitator_session_reconstruction` — paths, gate diagnostics, orchestrator log excerpts; not full chat transcripts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ + draft transition table; session semver file |
| 2 | `refine-plan` | Locked states/events/API + test strategy; ARCH/IMPL indexes |
| 3 | `build-plan` | RED → GREEN **4** tests; `src/stateMachine/` |
| 4 | `close-out` | Gate pass + envelope; traceable **`b329340`** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794058677-wf-agentstream-wf-08-cursor-composer25/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | ~10.2 min |
| **Stdout log** | `…/evidence/process.stdout.log` |
| **Stderr log** | `…/evidence/process.stderr.log` |

**Friction excerpts (stderr / manifest):**

- `DIAGNOSTIC: tied_methodology_version=4.2.0 source=orchestrator_resolver (secondary; session evidence file canonical)`
- `DIAGNOSTIC: WF trial stack seeded: …/package.json` (and `tsconfig.json`, `src/.gitkeep`)
- `DIAGNOSTIC: materialized WF trial preload contract: …/agent-preload-contract.yaml`
- `DIAGNOSTIC: harness=cursor model=composer-2.5-fast … dry_run=0`
- `--- turn 1/4 (new session) ---` / `session_id=17585a07-3468-4bef-9805-c48997c148e9`
- `--- turn 2/4 …` / `session_id=53c322f5-749c-4132-b0a0-782b3cd043e8`
- `--- turn 3/4 …` / `session_id=5df746ad-edc1-48ba-8b2e-fc44b5b92b62`
- `--- turn 4/4 …` / `session_id=b5ab3000-3cee-4ca7-9026-7b5c09f69304`
- `DIAGNOSTIC: wf-trial process log manifest=…` — **`exit_code: 0`**

**Cross-check:** Harness **`0`** matches agent delivery and close-out receipts on disk.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | Product commit **`b329340`** after bootstrap **`d3087aa`** — **pass** TDD ordering heuristic |
| Inventory vs git | Four-turn inventory matches committed product + TIED YAML |
| RED evidence | `evidence/quality-manifest/stateMachine-red.stdout.txt` archived |
| Uncertainty | CITDP not in `tied-project/citdp/` — traceability promotion deferred by design at minimal close-out |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` in inventory + PLAN |
| Product paths | `src/stateMachine/**/*.ts` |
| Facilitator `npm test` | **4** pass |
| `npm run typecheck` | **pass** |
| Deviation | None — full stack used |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Three states/two events and transition table locked in refine before RED |
| Traceability closure | **A−** | REQ **Implemented** + ARCH/IMPL committed; CITDP remains **draft** only |
| Test strategy | **A** | Pattern B RED archived; four tests cover legal, illegal, error docs, terminal |
| Algorithm / implementation | **A** | Explicit table-driven FSM; `StateTransitionError` matches locked D4 |
| Process adherence | **A−** | Machine close_out + envelope **0** gaps; thin_ledger partial documented |
| Workflow choreography | **A** | Four sessions; inventory complete; orchestrator **`0`** matches outcome |
| Methodology learning readout | **A** | First WF-08 cell — catalog **state machine TDD** stress satisfied |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. The **`workflow-trial-agentstream`** path documents **operator reproducibility**, not that agentstream beats manual IDE skills.

---

## Cross-model notes (PROMPT-WF-08)

Pairs [Claude Haiku @ 1794064806](trial-readout-PROMPT-WF-08-claudehaiku55-1794064806-wf-agentstream-wf-08-claude-claudehaiku55.md): both **complete** with orchestrator **`0`**; Composer **4** tests + ARCH/IMPL + REQ **Implemented** on **4.2.0**; Haiku **3** tests + REQ **Planned** on **4.2.1**.

Compared with [WF-07 Composer @ 1794057839](trial-readout-PROMPT-WF-07-composer25-1794057839-wf-agentstream-wf-07-cursor-composer25.md) (open-question closure; CITDP in traceable commit): same four-turn complete pattern; WF-08 stresses **explicit transition table + illegal-event tests** rather than null/missing config merge.

Compared with [WF-06 Composer @ 1794056678](trial-readout-PROMPT-WF-06-composer25-1794056678-wf-agentstream-wf-06-cursor-composer25.md) (gate-honesty; REQ index **Planned** drift): this cell keeps REQ **Implemented** aligned with verification; CITDP draft is the main traceability gap.

Compared with [WF-03 Composer @ 1793820250](trial-readout-PROMPT-WF-03-composer25-1793820250-wf-agentstream-wf-03-cursor-composer25.md) (composition seam; reconcile **not_run**): both deliver green tests with orchestrator **`0`**; WF-08 product scope is a single in-memory module without composition wiring.

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Adds the **2026-11-07 Composer 2.5 / `cursor-agentstream-four-phase`** **complete** row for **PROMPT-WF-08**, illustrating **state machine TDD** — illegal transitions tested after refine locks and IMPL pseudo-code, with RED evidence archived before GREEN.

---

## TIED version / dogfood

Session evidence cites **TIED 4.2.0** (turn-1 file with `install_json` source label). Records **wf-trial-ts-node-test-v1**, process log, and session semver capture on the first **WF-08** complete cell; **not** an effectiveness claim for TIED 4.2.0 or Composer 2.5.

---

## Facilitator follow-ups

- Matrix: add **luna-med** / **Claude** WF-08 cells for state-machine pairing under same **4.2.0** bootstrap.
- Optional sponsor pass: `persist-citdp-record` on disposable client to move CITDP draft into `tied-project/citdp/` for stricter traceability closure scoring.
- Pair with **PROMPT-WF-03** composition cohort when comparing wiring-first vs pure module TDD.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [WF trial orchestrator process log REQ](../../tied-project/requirements/REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG.yaml)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-08-1794058677-wf-agentstream-wf-08-cursor-composer25/PLAN.md)
