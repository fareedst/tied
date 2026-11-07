# Trial readout: PROMPT-WF-05 → Claude Haiku 5.5 (agentstream) → `1794053115-wf-agentstream-wf-05-claude-claudehaiku55`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-07 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-05`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-05](catalog-traditional-workflow-trial-prompts.md#prompt-wf-05) |
| **Model config** | `claude-haiku-5-5` |
| **Model slug** | `claude-haiku-5-5` |
| **Harness** | `claude-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1794053115-wf-agentstream-wf-05-claude-claudehaiku55` |
| **Factory tag** | `wf-agentstream-wf-05-claude-claudehaiku55` |
| **Product REQ** | `REQ-CSV_ROW_MAPPER` |
| **TIED methodology version (session)** | **4.2.0** — source **`install_json`** on session file (`capture_path: mcp_server_info` turn 1); evidence `…/REQ-CSV_ROW_MAPPER/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **claude-haiku-5-5** **PROMPT-WF-05** readout; contrasts complete [Composer @ 1794049382](trial-readout-PROMPT-WF-05-composer25-1794049382-wf-agentstream-wf-05-cursor-composer25.md), incomplete [Composer @ 1794042383](trial-readout-PROMPT-WF-05-composer25-1794042383-wf-agentstream-wf-05-cursor-composer25.md), and **split-signal** [luna-med @ 1794052043](trial-readout-PROMPT-WF-05-luna-med-1794052043-wf-agentstream-wf-05-cursor-lunamed.md). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a library that maps CSV rows to objects using a header row and string columns. The sponsor note mentions empty files once: behavior for zero data rows must be explicit in your written acceptance criteria before implementation. Include tests for header-only and one-data-row files.
```

**Catalog stress:** refine expands edges — empty-file acceptance criteria before implementation. **Proof boundary:** `executable_behavior` + workflow gate receipts + orchestrator process log + facilitator git replay.

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | Session `f7eef8db-…`. Eight written AC in PLAN; `tied-methodology-version.session.v1.json` captured; REQ via MCP. |
| **2** | `refine-plan` | Session `ee4667b1-…`. Locked stack; **pre_implementation** gate reports minimal adversarial open-record gaps (advisory in refine). Empty-input reading documented as **costly choice** — sponsor not confirmed. |
| **3** | `build-plan` | Session `94e1d799-…`. **Blocked** — same four `missing_*` adversarial fields; ARCH/IMPL + pseudo-code created; **no RED/GREEN**; `src/.gitkeep` only. |
| **4** | `close-out` | Session `f22898d2-…`. Envelope validate **0** blocking gaps; **`tied_gate_check` close_out `allowed: false`**; **commit skipped** (honest handoff). |

**Cross-turn harness notes:** batch `/var/folders/.../traditional-four-phase-batch.h2qd3fPqr9.yaml`; ~6.5 min wall (`2026-11-07T12:05:16Z` → `12:11:48Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| header row | First row supplies object keys | PLAN criteria 3–4; `mapCsvRows` |
| string columns | No coercion — all values strings | PLAN criterion 5 |
| zero data rows / empty files | Zero-length **and** header-only → `[]` (costly choice; sponsor unconfirmed) | PLAN criteria 1–2 |
| header-only test | Criterion 2 + colocated test plan | PLAN § Test strategy |
| one data row test | Criterion 3 | same |
| library API | `mapCsvRows(text: string): Record<string, string>[]` | PLAN; **not implemented** |

---

## What was built

- **Planning / TIED only:** Rich `PLAN.md` (8 AC before implementation); `REQ-CSV_ROW_MAPPER` index **Planned**; ARCH/IMPL indexes + pseudo-code **uncommitted**; CITDP draft with minimal adversarial block.
- **Stack:** `wf-trial-ts-node-test-v1` seeded; `npm install` run; **no** `src/csv-row-mapper.ts` or tests.
- **Gates:** `pre_implementation` **blocked** in build-plan; close-out envelope pass but machine `close_out` **fail**.
- **Git:** bootstrap **`e2a2eac`** only; all trial artifacts **uncommitted** on `main`.
- **Orchestrator:** `MODEL_SLUG=claude-haiku-5-5` `HARNESS=claude` `workflow_trial_agentstream wf-05`.

**Uncommitted (expected):** orchestrator logs, TIED YAML mutations, `node_modules/`, working tree.

---

## Outcome record

**Implementation outcome:** **Not started** — facilitator `npm test` **0** tests (vacuous pass); typecheck **TS18003** (no `.ts` inputs).

**Workflow outcome:** **Incomplete** — inventory marks build-plan **blocked** and close-out **incomplete**; orchestrator manifest **`exit_code: 0`** (four turns finished — **inverted** vs product failure).

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail** | `close_out_gate_allowed: false`; no receipt; commit skipped |
| **Process contract** | **partial** | Four phase handoffs; envelope **0** blocking gaps; no product verification manifest |
| **Adherence ledger** | **not_run** | Minimal depth; adversarial evidence absent — gate blocker |
| **Close-out honesty** | **pass** | Turn 4 handoff explicitly fails signals 1 and 3 |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ | `tied-project/requirements/REQ-CSV_ROW_MAPPER.yaml` (**Planned**, uncommitted) |
| PLAN | `tied-project/working/REQ-CSV_ROW_MAPPER/PLAN.md` |
| CITDP draft | `tied-project/working/REQ-CSV_ROW_MAPPER/CITDP-draft.yaml` |
| Envelope | `…/evidence/request-evidence-envelope.v1.json` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` — four turns; build **blocked** |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-05-1794053115-wf-agentstream-wf-05-claude-claudehaiku55/evidence/build-plan-verification-evidence.md) — `tied_validate_consistency` **`ok: true`**; **no behavioral proof**.

**Proof boundary:** `facilitator_session_reconstruction` — paths, gate diagnostics, orchestrator log excerpts; not full chat transcripts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ + 8 AC in PLAN; methodology capture file |
| 2 | `refine-plan` | Stack locked; adversarial gate gaps documented; no product code |
| 3 | `build-plan` | ARCH/IMPL + pseudo-code; **blocked** at `pre_implementation`; no RED/GREEN |
| 4 | `close-out` | Envelope ok; **`close_out` blocked**; no commit |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794053115-wf-agentstream-wf-05-claude-claudehaiku55/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | ~6.5 min |
| **Stdout log** | `…/evidence/process.stdout.log` |
| **Stderr log** | `…/evidence/process.stderr.log` |

**Friction excerpts (stderr / manifest):**

- `DIAGNOSTIC: harness=claude model=claude-haiku-5-5 … dry_run=0`
- `DIAGNOSTIC: WF trial stack seeded: …/package.json` (and `tsconfig.json`, `src/.gitkeep`)
- `DIAGNOSTIC: materialized WF trial preload contract: …/agent-preload-contract.yaml`
- `--- turn 1/4 (new session) ---` / `session_id=f7eef8db-6ce7-4d53-9a44-2a9c306953fd`
- `--- turn 2/4 …` / `session_id=ee4667b1-e191-44eb-afb0-b7f2d2cd1d0b`
- `--- turn 3/4 …` / `session_id=94e1d799-9ef4-4c23-8357-db571594668e`
- `--- turn 4/4 …` / `session_id=f22898d2-037d-43c4-9283-fbe8d15bdf53`
- `DIAGNOSTIC: wf-trial process log manifest=…` — manifest records **`exit_code: 0`**

**Cross-check:** Harness finished all four sessions despite **no product delivery** — contrast [luna-med @ 1794052043](trial-readout-PROMPT-WF-05-luna-med-1794052043-wf-agentstream-wf-05-cursor-lunamed.md) (`exit_code: 1` with green tests).

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | **`e2a2eac`** bootstrap only — **pass** “no early src” heuristic |
| Inventory vs git | Accurate blocked build + incomplete close-out; nothing committed beyond bootstrap |
| RED evidence | **Absent** — build-plan blocked before RED |
| Uncertainty | Uncommitted ARCH/IMPL on disk could predate a future commit — **heuristic** only |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` in inventory + PLAN |
| Product paths | **None** — `src/.gitkeep` only |
| Facilitator `npm test` | **0** tests (vacuous) |
| `npm run typecheck` | **fail** (no inputs) |
| Deviation | Stack seeded; implementation never started |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A−** | Eight explicit AC including header-only / one-row cases before code; empty-input costly choice surfaced but unconfirmed |
| Traceability closure | **B−** | ARCH/IMPL + validated pseudo-code on disk; REQ **Planned**; all uncommitted |
| Test strategy | **F** | No RED/GREEN; design-only |
| Algorithm / implementation | **N/A** | No product modules |
| Process adherence | **B** | Envelope zero gaps; gate blockers documented; close-out did not over-claim |
| Workflow choreography | **C+** | Four harness turns + honest inventory; **orchestrator 0** masks implementation failure |
| Methodology learning readout | **B+** | First Claude WF-05 cell documents **inverted split** (harness success vs agent incomplete) and minimal-depth adversarial gate stall |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. The **`workflow-trial-agentstream`** path documents **operator reproducibility**, not that agentstream beats manual IDE skills.

---

## Cross-model notes (PROMPT-WF-05)

Compared with [Composer complete @ 1794049382](trial-readout-PROMPT-WF-05-composer25-1794049382-wf-agentstream-wf-05-cursor-composer25.md): peer delivers **6** green tests and traceable commit; this cell stops at adversarial **pre_implementation** gate with **no** `src/*.ts`.

Compared with [Composer incomplete @ 1794042383](trial-readout-PROMPT-WF-05-composer25-1794042383-wf-agentstream-wf-05-cursor-composer25.md): peer aborts at turn 2 (`exit_code: 1`); this cell runs **four turns** with **`exit_code: 0`** but also **no product code**.

Compared with [luna-med @ 1794052043](trial-readout-PROMPT-WF-05-luna-med-1794052043-wf-agentstream-wf-05-cursor-lunamed.md): peer **`exit_code: 1`** with **delivered** mapper; this cell **`exit_code: 0`** without delivery — opposite harness/agent split.

Compared with [Claude Haiku WF-04 @ 1793853737](trial-readout-PROMPT-WF-04-claudehaiku55-1793853737-wf-agentstream-wf-04-claude-claudehaiku55.md): same model family overcame similar adversarial gate friction in build-plan on WF-04; WF-05 cell **did not** apply that waiver pattern.

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Adds the **2026-11-07 Claude Haiku 5.5 / `claude-agentstream-four-phase`** row for **PROMPT-WF-05**, showing **deep pre-implementation planning** and **four-turn harness completion** while **minimal-depth adversarial gates** block RED/GREEN — complements Cursor cells that either ship code or abort early.

---

## TIED version / dogfood

Session evidence cites **TIED 4.2.0** (turn-1 capture file with `install_json` source label). Records **wf-trial-ts-node-test-v1** seeding + process log on a Claude WF-05 cell; **not** an effectiveness claim for TIED 4.2.0 or Claude Haiku 5.5.

---

## Facilitator follow-ups

- Re-run build-plan after sponsor waiver or `tied_adversarial_inquiry_run` on disposable client (or manual IDE continuation).
- Pair with a second **claude-haiku-5-5** WF-05 cell after gate-policy clarification for repeatability.
- Compare orchestrator **`exit_code: 0`** vs agent incomplete outcome when scoring matrix **harness fidelity** rules.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [WF trial orchestrator process log REQ](../../tied-project/requirements/REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG.yaml)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-05-1794053115-wf-agentstream-wf-05-claude-claudehaiku55/PLAN.md)
