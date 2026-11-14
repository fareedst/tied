# Trial readout: PROMPT-WF-08 → Claude Sonnet 5.5 (Claude agentstream) → `1794069919-wf-agentstream-wf-08-claude-sonnet55`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-07 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-08`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-08](catalog-traditional-workflow-trial-prompts.md#prompt-wf-08) |
| **Model config** | `sonnet-5-5` |
| **Model slug** | `claude-sonnet-5-5` |
| **Harness** | `claude-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1794069919-wf-agentstream-wf-08-claude-sonnet55` |
| **Factory tag** | `wf-agentstream-wf-08-claude-sonnet55` |
| **Product REQ** | `REQ-TINY_STATE_MACHINE` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`** on session file (`capture_path: mcp_server_info` turn 1); evidence `…/REQ-TINY_STATE_MACHINE/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **PROMPT-WF-08** **Claude Sonnet** readout on **4.2.1**; pairs [Haiku @ 1794064806](trial-readout-PROMPT-WF-08-claudehaiku55-1794064806-wf-agentstream-wf-08-claude-claudehaiku55.md) (same REQ, **3** tests, verification gate skipped) and [Composer @ 1794058677](trial-readout-PROMPT-WF-08-composer25-1794058677-wf-agentstream-wf-08-cursor-composer25.md) (**4** tests, REQ **Implemented**). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a tiny explicit state machine with three states and two events. Reject illegal transitions with a documented error. Include tests for at least one legal sequence and one illegal transition.
```

**Catalog stress:** state machine TDD — illegal-transition tests follow refine locks before RED in build-plan. **Proof boundary:** `executable_behavior` + orchestrator process log + facilitator git replay.

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | Session `8483ba49-…`. Locked `idle`/`running`/`done`, `IllegalTransitionError`; batch preload expanded API (`transition`, `StateMachine`, `can()`, frozen `TRANSITIONS`) without sponsor pause; methodology **4.2.1** via `mcp_server_info`. |
| **2** | `refine-plan` | Session `3e047033-…`. Module boundaries, error contract, six illegal pairs + unknown-string policy; ARCH/IMPL deferred to build per tracker. |
| **3** | `build-plan` | Session `e7879a2c-…`. ARCH/IMPL YAML + pseudo-code before RED; RED archived → GREEN **11/11**; verification gate **`allowed: false`** (`malformed_citdp:adversarial_inquiry`); manifest built for test/typecheck. |
| **4** | `close-out` | Session `401eb89a-…`. CITDP persisted to `tied-project/citdp/`; gate **`allowed: true`**; envelope **0** blocking gaps; thin ledger warn; traceable **`9efa0f9`**; `tied_verify` not run. |

**Cross-turn harness notes:** batch `/var/folders/.../traditional-four-phase-batch.yFa6FUBOgt.yaml`; ~4.5 min wall (`2026-11-07T16:45:20Z` → `16:49:48Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| three states | `idle`, `running`, `done` (`done` terminal) | PLAN RESOLVE |
| two events | `start`, `finish` | Locked transition table |
| legal transitions | `idle --start--> running`; `running --finish--> done` | `TRANSITIONS` literal |
| illegal transition | Four enumerated pairs + terminal events; unknown strings | Tests + `IllegalTransitionError` |
| documented error | `IllegalTransitionError` with `code: ILLEGAL_TRANSITION`, `state`, `event` | TSDoc + class |
| “more comprehensive” (batch preload) | Pure `transition()`, `StateMachine.send/can`, frozen table | add-feature PLAN (stays tiny — no extra states) |

---

## What was built

- **Product:** `src/state-machine.ts`, `src/state-machine.test.ts` — facilitator **`npm test` 11/11**; typecheck pass.
- **TIED:** `REQ-TINY_STATE_MACHINE` + `ARCH-TINY_STATE_MACHINE` + `IMPL-TINY_STATE_MACHINE` + token-commented pseudo-code; `tied-project/citdp/CITDP-REQ-TINY_STATE_MACHINE.yaml`; REQ index **`Planned`**.
- **Stack:** `wf-trial-ts-node-test-v1`; RED/GREEN archives under `evidence/quality-manifest/`; `verification-evidence-manifest.v1.json` present.
- **Git:** bootstrap **`e4d39a4`** + product/close-out **`9efa0f9`**.
- **Orchestrator:** `MODEL_SLUG=claude-sonnet-5-5` `HARNESS=claude` `workflow_trial_agentstream wf-08`.

---

## Outcome record

**Implementation outcome:** **Delivered** — facilitator `npm test` **11/11**; typecheck pass; illegal semantics match locked contract.

**Workflow outcome:** **Complete** — sponsor_turns four **complete**; `close_out_gate_receipt` linked; orchestrator manifest **`exit_code: 0`** aligned with delivery.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | Gate receipt `allowed: true`; envelope **0** blocking gaps |
| **Process contract** | **partial** | Verification gate failed at build then repaired at close-out; tracker sparse / `--sync-dispositions` skipped per handoff |
| **Adherence ledger** | **not_run** | `legacy_no_adherence_chain`; process grade **D**; waived at minimal advisory depth |
| **Close-out honesty** | **pass** | Handoff documents verification failure, ledger thin, REQ index drift |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ / ARCH / IMPL | `tied-project/requirements/`, `architecture-decisions/`, `implementation-decisions/` |
| PLAN | `tied-project/working/REQ-TINY_STATE_MACHINE/PLAN.md` |
| CITDP | `tied-project/citdp/CITDP-REQ-TINY_STATE_MACHINE.yaml` |
| Envelope | `…/evidence/request-evidence-envelope.v1.json` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` — sponsor_turns **complete** |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-08-1794069919-wf-agentstream-wf-08-claude-sonnet55/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: false`** (missing `REQ-WF_TRIAL_IMPLEMENTATION_STACK` index ref only).

**Proof boundary:** `facilitator_session_reconstruction` — paths, gate diagnostics, orchestrator log excerpts; not full chat transcripts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ + transition table + expanded API scope; session semver **4.2.1** |
| 2 | `refine-plan` | Locked error contract, test strategy, module paths |
| 3 | `build-plan` | ARCH/IMPL → RED → GREEN **11**; verification gate block on CITDP shape |
| 4 | `close-out` | CITDP fix + gate pass; traceable **`9efa0f9`** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794069919-wf-agentstream-wf-08-claude-sonnet55/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | ~4.5 min |
| **Stdout log** | `…/evidence/process.stdout.log` |
| **Stderr log** | `…/evidence/process.stderr.log` |

**Friction excerpts (stderr / manifest):**

- `DIAGNOSTIC: tied_methodology_version=4.2.1 source=orchestrator_resolver (secondary; session evidence file canonical)`
- `DIAGNOSTIC: WF trial stack seeded: …/package.json` (and `tsconfig.json`, `src/.gitkeep`)
- `DIAGNOSTIC: materialized WF trial preload contract: …/agent-preload-contract.yaml`
- `DIAGNOSTIC: harness=claude model=claude-sonnet-5-5 … dry_run=0`
- `--- turn 1/4 (new session) ---` / `session_id=8483ba49-e5f6-4375-91d2-ce11d0864e9a`
- `--- turn 2/4 …` / `session_id=3e047033-223c-4c01-b3a1-ed6eae09c755`
- `--- turn 3/4 …` / `session_id=e7879a2c-5645-4e00-ad8b-b97c7f95b55a`
- `--- turn 4/4 …` / `session_id=401eb89a-8c47-4ebc-a9fd-23846cc74e17`
- `DIAGNOSTIC: wf-trial process log manifest=…` — **`exit_code: 0`**

**Cross-check:** Harness **`0`** matches committed product, gate pass, and sponsor_turns **complete**.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | Product commit **`9efa0f9`** after bootstrap **`e4d39a4`** — **pass** TDD ordering heuristic |
| Inventory vs git | Sponsor_turns match committed product + ARCH/IMPL/CITDP |
| RED evidence | `evidence/quality-manifest/state-machine-red.stdout.txt` archived |
| Uncertainty | REQ index **Planned** despite green delivery; `tied_verify` not run |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` in inventory + PLAN |
| Product paths | `src/state-machine.ts`, `src/state-machine.test.ts` |
| Facilitator `npm test` | **11** pass |
| `npm run typecheck` | **pass** |
| Deviation | None on stack |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Three states/two events and illegal semantics locked in refine; batch preload scope expansion documented |
| Traceability closure | **A−** | Full ARCH/IMPL YAML + CITDP in `citdp/` + pseudo-code; REQ **Planned** drift; one missing REQ cross-ref in validate |
| Test strategy | **A** | Pattern B RED archived; **11** cases (legal, four illegal pairs, terminal, unknown strings, `can()`, frozen table) |
| Algorithm / implementation | **A** | Table-driven FSM; `IllegalTransitionError` matches contract |
| Process adherence | **B+** | Machine close_out + envelope **0** gaps; verification gate fail→fix path documented; thin ledger waived |
| Workflow choreography | **A** | Four sessions; harness **`0`**; faster wall clock than Haiku/Composer peers on same prompt |
| Methodology learning readout | **A−** | First WF-08 Sonnet on **4.2.1**; contrasts Haiku minimal stack and Composer **Implemented** index |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. The **`workflow-trial-agentstream`** path documents **operator reproducibility**, not that agentstream beats manual IDE skills.

---

## Cross-model notes (PROMPT-WF-08)

Pairs [Haiku @ 1794064806](trial-readout-PROMPT-WF-08-claudehaiku55-1794064806-wf-agentstream-wf-08-claude-claudehaiku55.md): both **complete** on **4.2.1** with orchestrator **`0`**; Sonnet **`11`** tests + ARCH/IMPL + persisted CITDP vs Haiku **`3`** tests + sidecar-only IMPL; both REQ index **Planned**.

Pairs [Composer @ 1794058677](trial-readout-PROMPT-WF-08-composer25-1794058677-wf-agentstream-wf-08-cursor-composer25.md): Composer **`4`** tests + REQ **Implemented** on **4.2.0**; Sonnet broader test matrix and `citdp/` persist on **4.2.1** without `tied_verify`.

Compared with [WF-07 Sonnet @ 1794068800](trial-readout-PROMPT-WF-07-claudesonnet55-1794068800-wf-agentstream-wf-07-claude-sonnet55.md): same model/harness line; WF-07 **20** tests on config merge; both close-out gate pass with **Planned** REQ index.

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Adds the **2026-11-07 Claude Sonnet 5.5 / `claude-agentstream-four-phase`** **complete** row for **PROMPT-WF-08**, showing **state machine TDD** with stronger traceability than the same-day Haiku cell (ARCH/IMPL + CITDP persist) while sharing REQ index **Planned** drift.

---

## TIED version / dogfood

Session evidence cites **TIED 4.2.1** (turn-1 `install_json` / `mcp_server_info`). Records first WF-08 Sonnet cell on the **4.2.1** bootstrap line; **not** an effectiveness claim for TIED 4.2.1 or Claude Sonnet 5.5.

---

## Facilitator follow-ups

- Matrix: **luna-med** WF-08 for third model on state-machine stress under **4.2.1**.
- Optional: run `tied_verify` on disposable client to align REQ index with green tests.
- Fix `REQ-WF_TRIAL_IMPLEMENTATION_STACK` reference in REQ detail if strict `tied_validate_consistency` required on client.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [WF trial orchestrator process log REQ](../../tied-project/requirements/REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG.yaml)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-08-1794069919-wf-agentstream-wf-08-claude-sonnet55/PLAN.md)
