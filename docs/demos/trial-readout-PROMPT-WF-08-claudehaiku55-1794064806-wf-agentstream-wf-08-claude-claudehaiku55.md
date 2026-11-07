# Trial readout: PROMPT-WF-08 → Claude Haiku 5.5 (Claude agentstream) → `1794064806-wf-agentstream-wf-08-claude-claudehaiku55`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-07 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-08`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-08](catalog-traditional-workflow-trial-prompts.md#prompt-wf-08) |
| **Model config** | `claude-haiku-5-5` |
| **Model slug** | `claude-haiku-5-5` |
| **Harness** | `claude-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1794064806-wf-agentstream-wf-08-claude-claudehaiku55` |
| **Factory tag** | `wf-agentstream-wf-08-claude-claudehaiku55` |
| **Product REQ** | `REQ-TINY_STATE_MACHINE` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`** on session file (`capture_path: mcp_server_info` turn 1); evidence `…/REQ-TINY_STATE_MACHINE/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **PROMPT-WF-08** **Claude Haiku** readout on **4.2.1**; pairs complete [Composer @ 1794058677](trial-readout-PROMPT-WF-08-composer25-1794058677-wf-agentstream-wf-08-cursor-composer25.md) (same stress, **4** tests + ARCH/IMPL + REQ **Implemented**). |

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
| **1** | `add-feature` | Session `537db2ee-…`. Transition table sketched in PLAN § Refine resolutions; methodology **4.2.1** via `mcp_server_info`; add-feature defers product code per skill Goal. |
| **2** | `refine-plan` | Session `44c404b1-…`. Locked `Idle`/`Active`/`Done`, `start`/`finish`, `IllegalTransitionError`; advisory `pre_implementation` not run (preload guidance). |
| **3** | `build-plan` | Session `d1a3856b-…`. RED archived → GREEN **3/3**; IMPL sidecar only (no TIED IMPL index); **verification gate not run**; `node_modules` created. |
| **4** | `close-out` | Session `e2a9ed25-…`. Envelope backfill for `not_applicable`; CITDP adversarial block repaired; gate **`allowed: true`**; traceable **`bdc820c`**; thin adherence ledger documented with waivers. |

**Cross-turn harness notes:** batch `/var/folders/.../traditional-four-phase-batch.Ixcw5iMStk.yaml`; ~5.7 min wall (`2026-11-07T15:20:07Z` → `15:25:47Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| three states | `Idle` \| `Active` \| `Done` | PLAN § Refine resolutions |
| two events | `start` \| `finish` | Locked transition table |
| legal transition | `Idle --start--> Active`, `Active --finish--> Done` | PLAN + tests |
| illegal transition | Any other pair; state unchanged | `IllegalTransitionError` |
| documented error | `IllegalTransitionError` with `state`, `event`, message | PLAN; class export |
| terminal `Done` | Any event from `Done` throws | Third test in suite |
| representation | Transition table in `StateMachine` class | IMPL-pseudocode.md |

---

## What was built

- **Product:** `src/state-machine.ts`, `src/state-machine.test.ts` — **3** passing tests (legal sequence, illegal from `Idle`, terminal guard).
- **TIED:** `REQ-TINY_STATE_MACHINE` detail + index (**Planned**); IMPL **sidecar** only; **no** ARCH/IMPL YAML records; CITDP close-out at `working/…/CITDP-close-out.yaml` (not `tied-project/citdp/`).
- **Stack:** `wf-trial-ts-node-test-v1`; RED/GREEN/typecheck archives under `evidence/quality-manifest/`.
- **Git:** bootstrap **`4169518`** + product/close-out **`bdc820c`**.
- **Orchestrator:** `MODEL_SLUG=claude-haiku-5-5` `HARNESS=claude` `workflow_trial_agentstream wf-08`.

---

## Outcome record

**Implementation outcome:** **Delivered** — facilitator `npm test` **3/3**; typecheck pass.

**Workflow outcome:** **Complete** — sponsor_turns four **complete**; `close_out` gate **`allowed: true`**; orchestrator manifest **`exit_code: 0`** aligned with delivery. Inventory `phases.refine-plan` / `phases.build-plan` still **`pending`** (stale vs sponsor_turns — document only).

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | Gate receipt `allowed: true`; envelope validate **0** blocking gaps |
| **Process contract** | **partial** | Verification gate not run; no `verification-evidence-manifest.v1.json`; tracker sparse / dual-write per handoff |
| **Adherence ledger** | **not_run** | `legacy_no_adherence_chain`; process grade **D**; waived at minimal advisory depth |
| **Close-out honesty** | **pass** | Handoff names waivers, skipped verification gate, and thin ledger |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ | `tied-project/requirements/REQ-TINY_STATE_MACHINE.yaml` (index **Planned**) |
| PLAN | `tied-project/working/REQ-TINY_STATE_MACHINE/PLAN.md` |
| CITDP | `…/CITDP-close-out.yaml` + `CITDP-draft.md` (working only) |
| Envelope | `…/evidence/request-evidence-envelope.v1.json` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` — sponsor_turns **complete**; `phases` map stale on turns 2–3 |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-08-1794064806-wf-agentstream-wf-08-claude-claudehaiku55/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`**.

**Proof boundary:** `facilitator_session_reconstruction` — paths, gate diagnostics, orchestrator log excerpts; not full chat transcripts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ + draft transition table; session semver **4.2.1** |
| 2 | `refine-plan` | Locked states/events/API + acceptance criteria |
| 3 | `build-plan` | RED → GREEN **3** tests; `src/state-machine.*` |
| 4 | `close-out` | Gate pass + envelope; traceable **`bdc820c`** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794064806-wf-agentstream-wf-08-claude-claudehaiku55/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | ~5.7 min |
| **Stdout log** | `…/evidence/process.stdout.log` |
| **Stderr log** | `…/evidence/process.stderr.log` |

**Friction excerpts (stderr / manifest):**

- `DIAGNOSTIC: tied_methodology_version=4.2.1 source=orchestrator_resolver (secondary; session evidence file canonical)`
- `DIAGNOSTIC: WF trial stack seeded: …/package.json` (and `tsconfig.json`, `src/.gitkeep`)
- `DIAGNOSTIC: materialized WF trial preload contract: …/agent-preload-contract.yaml`
- `DIAGNOSTIC: harness=claude model=claude-haiku-5-5 … dry_run=0`
- `--- turn 1/4 (new session) ---` / `session_id=537db2ee-6a84-4cbf-97cd-f914296311c7`
- `--- turn 2/4 …` / `session_id=44c404b1-7abd-43d5-8f4d-573b0246a23b`
- `--- turn 3/4 …` / `session_id=d1a3856b-01d4-4881-9993-274ddd67fbc3`
- `--- turn 4/4 …` / `session_id=e2a9ed25-ba0c-45d6-8aec-bcb922cdd283`
- `DIAGNOSTIC: wf-trial process log manifest=…` — **`exit_code: 0`**

**Cross-check:** Harness **`0`** matches committed product, gate pass, and sponsor_turns **complete**.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | Product commit **`bdc820c`** after bootstrap **`4169518`** — **pass** TDD ordering heuristic |
| Inventory vs git | Sponsor_turns match committed product + TIED YAML; `phases` object not updated for refine/build |
| RED evidence | `evidence/quality-manifest/state-machine-red.stdout.txt` archived |
| Uncertainty | CITDP not in `tied-project/citdp/`; REQ index **Planned** despite green delivery |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` in inventory + PLAN |
| Product paths | `src/state-machine.ts`, `src/state-machine.test.ts` |
| Facilitator `npm test` | **3** pass |
| `npm run typecheck` | **pass** |
| Deviation | None on stack; verification gate skipped per build handoff |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Three states/two events and illegal semantics locked in refine before RED |
| Traceability closure | **B** | Green tests + REQ detail; **Planned** index drift; no ARCH/IMPL YAML; CITDP working-only |
| Test strategy | **A−** | Pattern B RED archived; three tests satisfy sponsor minimum plus terminal guard; fewer cases than Composer peer |
| Algorithm / implementation | **A** | Explicit transition table; `IllegalTransitionError` matches locked contract |
| Process adherence | **B+** | Machine close_out + envelope **0** gaps; verification gate and adherence ledger waived honestly |
| Workflow choreography | **A−** | Four sessions; harness **`0`** matches outcome; inventory `phases` stale on turns 2–3 |
| Methodology learning readout | **A−** | First WF-08 Haiku on **4.2.1**; contrasts Composer complete cell and [WF-07 Haiku incomplete](trial-readout-PROMPT-WF-07-claudehaiku55-1794063964-wf-agentstream-wf-07-claude-claudehaiku55.md) |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. The **`workflow-trial-agentstream`** path documents **operator reproducibility**, not that agentstream beats manual IDE skills.

---

## Cross-model notes (PROMPT-WF-08)

Pairs [Composer @ 1794058677](trial-readout-PROMPT-WF-08-composer25-1794058677-wf-agentstream-wf-08-cursor-composer25.md): both **complete** four-turn cells with orchestrator **`0`**; Composer **`4`** tests + ARCH/IMPL + REQ **Implemented** on **4.2.0**; Haiku **`3`** tests + REQ **Planned** + class API on **4.2.1**; both lock illegal transitions before RED.

Compared with [WF-07 Haiku @ 1794063964](trial-readout-PROMPT-WF-07-claudehaiku55-1794063964-wf-agentstream-wf-07-claude-claudehaiku55.md): same harness **`0`** but WF-07 **incomplete** close-out; this cell reaches gate pass and **`bdc820c`**.

Compared with [WF-06 Haiku @ 1794062924](trial-readout-PROMPT-WF-06-claudehaiku55-1794062924-wf-agentstream-wf-06-claude-claudehaiku55.md): WF-06 green tests uncommitted with `close_out` **fail**; WF-08 commits product + TIED scaffold in one traceable step.

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Adds the **2026-11-07 Claude Haiku 5.5 / `claude-agentstream-four-phase`** **complete** row for **PROMPT-WF-08**, illustrating **state machine TDD** with honest minimal-depth waivers (verification gate skipped, thin adherence ledger) while machine close-out and green tests align.

---

## TIED version / dogfood

Session evidence cites **TIED 4.2.1** (turn-1 `install_json` / `mcp_server_info`). Records first WF-08 Haiku cell on the **4.2.1** bootstrap line; **not** an effectiveness claim for TIED 4.2.1 or Claude Haiku 5.5.

---

## Facilitator follow-ups

- Matrix: **luna-med** WF-08 for third model on state-machine stress under **4.2.1**.
- Optional: promote CITDP to `tied-project/citdp/` and persist IMPL YAML on disposable client for stricter traceability scoring.
- Inventory: consider updating `phases` map when sponsor_turns complete (turn-1 add-feature writer may leave refine/build **pending**).

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [WF trial orchestrator process log REQ](../../tied-project/requirements/REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG.yaml)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-08-1794064806-wf-agentstream-wf-08-claude-claudehaiku55/PLAN.md)
