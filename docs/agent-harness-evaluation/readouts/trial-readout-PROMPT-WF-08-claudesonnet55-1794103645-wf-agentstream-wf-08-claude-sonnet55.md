# Trial readout: PROMPT-WF-08 → Claude Sonnet 5.5 (Claude agentstream) → `1794103645-wf-agentstream-wf-08-claude-sonnet55`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-08 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-08`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-08](catalog-traditional-workflow-trial-prompts.md#prompt-wf-08) |
| **Model config** | `sonnet55` |
| **Model slug** | `claude-sonnet-5-5` |
| **Harness** | `claude-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1794103645-wf-agentstream-wf-08-claude-sonnet55` |
| **Factory tag** | `wf-agentstream-wf-08-claude-sonnet55` |
| **Product REQ** | `REQ-JOB_STATE_MACHINE` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`** on session file (`capture_path: mcp_server_info` turn 1); evidence `…/REQ-JOB_STATE_MACHINE/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | Second **PROMPT-WF-08** **Claude Sonnet** readout on **4.2.1** batch; template peer [Sonnet @ 1794069919](trial-readout-PROMPT-WF-08-claudesonnet55-1794069919-wf-agentstream-wf-08-claude-sonnet55.md) (`REQ-TINY_STATE_MACHINE`, **11** tests, REQ **Planned**). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a tiny explicit state machine with three states and two events. Reject illegal transitions with a documented error. Include tests for at least one legal sequence and one illegal transition.
```

**Catalog stress:** state machine TDD — illegal-event tests after IMPL plan in build-plan. **Proof boundary:** executable_behavior + orchestrator process log + facilitator git replay.

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | Session `cc46caa8-…` | `idle`/`running`/`done`; `TransitionError`; helpers `run(events)`. |
| **2** | `refine-plan` | Session `fec57fd3-…` | Single-module boundary; illegal table exhaustive. |
| **3** | `build-plan` | Session `a8bea4dd-…` | ARCH/IMPL → RED → GREEN **5/5**. |
| **4** | `close-out` | Session `da4154e2-…` | CITDP via MCP; REQ **Implemented**; scripted REQ detail edit noted; **`bec9000`**. |

**Cross-turn harness notes:** sequential batch after prior WF cells; wall ~4.8 min (`2026-11-08T02:07:26Z` → `02:12:16Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| three states / two events | `idle`, `running`, `done`; `start`, `finish` | PLAN |
| illegal transition | Documented `TransitionError` | tests + TSDoc |
| comprehensive preload | `run(events)` fold helper | PLAN RESOLVE |

---

## What was built

- **Product:** `src/job-state-machine.ts` + tests — facilitator **`npm test` 5/5** (meets catalog minimum; below peer **11**).
- **TIED:** REQ/ARCH/IMPL + CITDP; REQ index **Implemented**.
- **Stack:** `wf-trial-ts-node-test-v1`.
- **Git:** bootstrap **`f7a611b`** + product **`bec9000`**.
- **Orchestrator:** `workflow_trial_agentstream wf-08`; **`exit_code: 0`**. 

---

## Outcome record

**Implementation outcome:** **Delivered** — facilitator `npm test` **5/5**; typecheck pass.

**Workflow outcome:** **Complete** — four sponsor turns executed; orchestrator manifest **`exit_code: 0`** aligned with delivery.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **pass** | `allowed: true`; receipt `close_out-2026-11-08T02-11-16-035Z.json` |
| **Process contract** | **partial** | No verification manifest; tracker mostly template; direct REQ YAML edit at close-out |
| **Adherence ledger** | **partial** | Reconcile **B**; thin ledger warn |
| **Close-out honesty** | **pass** | Documents MCP vs script deviation on REQ detail |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-JOB_STATE_MACHINE/PLAN.md` |
| CITDP | `tied-project/citdp/CITDP-REQ-JOB_STATE_MACHINE.yaml` |
| Envelope | `…/evidence/request-evidence-envelope.v1.json` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-08-1794103645-wf-agentstream-wf-08-claude-sonnet55/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`**.

**Proof boundary:** `facilitator_session_reconstruction` — paths, gate diagnostics, orchestrator log excerpts; not full chat transcripts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | Three states / two events locked |
| 2 | `refine-plan` | Module + error contract |
| 3 | `build-plan` | RED → GREEN **5** |
| 4 | `close-out` | Gate pass; REQ **Implemented**; **`bec9000`** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794103645-wf-agentstream-wf-08-claude-sonnet55/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | ~4.8 min (`2026-11-08T02:07:26Z` → `02:12:16Z`) |
| **Stdout log** | `…/evidence/process.stdout.log` |
| **Stderr log** | `…/evidence/process.stderr.log` |

**Friction excerpts (stderr / manifest):**

- `DIAGNOSTIC: tied_methodology_version=4.2.1 source=orchestrator_resolver (secondary; session evidence file canonical)`
- `DIAGNOSTIC: harness=claude model=claude-sonnet-5-5` … `dry_run=0`
- `--- turn 1/4 (new session) ---` through `--- turn 4/4 ---` with per-turn `session_id=` lines
- `DIAGNOSTIC: wf-trial process log manifest=…` — **`exit_code: 0`**

**Cross-check:** Harness **`0`** vs close-out gate and git pin **`bec9000` — `feat(job-state): explicit job state machine`**.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | Product commit **`bec9000` — `feat(job-state): explicit job state machine`** relative to bootstrap — facilitator replay |
| Inventory vs git | See interaction inventory `turns` / `sponsor_turns` |
| RED evidence | `evidence/quality-manifest/` archives when present |
| Uncertainty | Tracker/template slugs and REQ index promotion vary by cell — see completion signals |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` in inventory + PLAN |
| Product paths | `src/**/*.ts` colocated tests |
| Facilitator `npm test` | **5** pass |
| `npm run typecheck` | **pass** |
| Deviation | None on stack |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | A− | Meets sponsor minimum; expanded helpers within preload scope |
| Traceability closure | A− | REQ **Implemented** vs peer **Planned**; direct file edit deviation |
| Test strategy | B+ | RED/GREEN; **5** tests vs catalog-typical **11** on same prompt |
| Algorithm / implementation | A | Table-driven FSM; `TransitionError` documented |
| Process adherence | B+ | Gate pass; thin tracker; honesty on script edit |
| Workflow choreography | A | Four sessions; harness **`0`**; fast wall vs WF-07 in batch |
| Methodology learning readout | B+ | REQ index improvement vs [1794069919](trial-readout-PROMPT-WF-08-claudesonnet55-1794069919-wf-agentstream-wf-08-claude-sonnet55.md) with smaller test matrix |

**Feedback ingest:** N/A (`--skip-feedback-ingest`; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. The **`workflow-trial-agentstream`** path documents **operator reproducibility**, not that agentstream beats manual IDE skills.

---

## Cross-model notes (PROMPT-WF-08)

Compared with [Sonnet @ 1794069919](trial-readout-PROMPT-WF-08-claudesonnet55-1794069919-wf-agentstream-wf-08-claude-sonnet55.md) (**template peer**): peer **`9efa0f9`**, **11** tests, `IllegalTransitionError`, REQ **Planned**; batch **`bec9000`**, **5** tests, `TransitionError`, REQ **Implemented** — same harness recipe, different REQ token label and traceability depth trade-off.

Compared with [Haiku @ 1794064806](trial-readout-PROMPT-WF-08-claudehaiku55-1794064806-wf-agentstream-wf-08-claude-claudehaiku55.md): Haiku **3** tests + complete; Sonnet batch meets minimum with fewer cases than earlier Sonnet cell.

Compared with [WF-07 Sonnet @ 1794068800](trial-readout-PROMPT-WF-07-claudesonnet55-1794068800-wf-agentstream-wf-07-claude-sonnet55.md): same model/harness; config stress vs state-machine stress in sequential batch.

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Adds **2026-11-08** Sonnet WF-08 with REQ **Implemented** and minimal **5**-test FSM vs **1794069919** broader **11**-test matrix on **4.2.1**.

---

## TIED version / dogfood

Session **4.2.1**. Pairs template readout **1794069919** for cross-batch Sonnet WF-08 comparison — **not** effectiveness claim.

---

## Facilitator follow-ups

- Optional: expand illegal-transition matrix to peer **11**-test depth for apples-to-apples with 1794069919.
- Prefer MCP for REQ detail edits in future close-outs.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [WF trial orchestrator process log REQ](../../tied-project/requirements/REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG.yaml)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-08-1794103645-wf-agentstream-wf-08-claude-sonnet55/PLAN.md)
