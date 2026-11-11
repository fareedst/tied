# Trial readout: PROMPT-WF-10 → Claude Sonnet 5.5 (low effort) → `1794359532-wf-agentstream-wf-10-claude-claudesonnet55low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-11 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-10`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-10](catalog-traditional-workflow-trial-prompts.md#prompt-wf-10) (`goal-first-soc`) |
| **Model config** | `sonnet-5-5` (`low` effort) |
| **Model slug** | `claude-sonnet-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794359532-wf-agentstream-wf-10-claude-claudesonnet55low` |
| **Factory tag** | `1794359532-wf-agentstream-wf-10-claude-claudesonnet55low` |
| **Product REQ** | `REQ-CSV_SUMMARY_CLI` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`** (`tied-methodology-version.session.v1.json` turn add-feature) |
| **Cohort comparison** | First **PROMPT-WF-10** Claude Sonnet **`low`** cell on **4.2.1**; composition stress **TIED-DEMO-13** — **`composition_tests: 0`** on size receipt. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a TypeScript CLI that summarizes CSV text with row count and column count. The user must choose exactly one input: a --file <path> option or an explicit stdin mode (document the flag or convention you use). Using both or neither is an error with a documented message. File mode must read via the filesystem; stdin mode must read until EOF without a path. Include automated tests. No graphical UI.
```

**Catalog stress:** thin CLI argv wiring (**TIED-DEMO-13**) — goal-first-soc paste. **Proof boundary:** executable behavior + orchestrator log + facilitator replay.

---

## What was built

- **Product:** TypeScript CSV summary CLI — modules `csv.ts`, `args.ts`, `cli.ts`, `main.ts`; facilitator **`npm test` 21/21** pass.
- **TIED:** `REQ-CSV_SUMMARY_CLI` working tree; ARCH **1** / IMPL **3** on size receipt; **24** applied pseudo-code lines.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **~3 min** (178s).
- **Git:** bootstrap-only pin **`4a0b77e`** — product and TIED YAML **uncommitted**.
- **Project size layers:** unit tests **21**; composition **0**; `operational_intent_hash` `36cff920…` ([MCP snapshot](../../tied-project/working/FACILITATOR-WF-10-1794359532-wf-agentstream-wf-10-claude-claudesonnet55low/evidence/project-size-snapshot.v1.json)).

---

## Outcome record

**Implementation outcome:** **Partial** — 21 passing tests at facilitator replay; delivery on disk only.

**Workflow outcome:** **Incomplete** — close-out blocked (missing CITDP); no traceable product commit.

**Grading outcome:** Session bands describe this cell only — not methodology effectiveness or a model leaderboard. **Grade mean (registry):** 2.90 · A/B−/B/B+/C+/B/B−.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail** | Gate blocked — no `CITDP-REQ-CSV_SUMMARY_CLI.yaml` |
| **Process contract** | **partial** | Build handoff complete; close-out handoff documents block |
| **Orchestrator** | **pass** | **`exit_code: 0`**; four turns; inventory notes close-out incomplete |
| **Composition stress** | **gap** | **`composition_tests: 0`** — `cli.test.ts` uses injected IO only |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-CSV_SUMMARY_CLI/PLAN.md` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-10-1794359532-wf-agentstream-wf-10-claude-claudesonnet55low/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session semver **4.2.1** |
| 2 | `refine-plan` | `--file` xor `--stdin` contract locked |
| 3 | `build-plan` | **21** green unit/integration tests |
| 4 | `close-out` | **Incomplete** — CITDP missing |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794359532-wf-agentstream-wf-10-claude-claudesonnet55low/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **178s** (~3 min) |

**Friction excerpts:** `HARNESS=claude` `model_effort=low`; four `--- turn N/4 ---` boundaries; **`DIAGNOSTIC: wf-trial process log manifest=…`**.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git vs tests | **Green tests with no product commit** — split signal |
| Module split | `csv` / `args` / `cli` / `main` present as refined |
| Composition | Size receipt **0** composition tests — binding rubric not satisfied on disk taxonomy |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **21** pass |
| Typecheck | Present on client; not re-run at facilitator replay |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | File vs stdin exclusivity and error messages locked in refine PLAN. |
| Traceability closure | **B−** | R+A+I YAML and product code remain uncommitted after orchestrator exit 0. |
| Test strategy | **B** | Twenty-one green tests including `cli.test.ts` injected IO; composition facet still zero. |
| Algorithm / implementation | **B+** | RFC 4180 parser and argv wiring match sponsor I/O contract in tests. |
| Process adherence | **C+** | Close-out turn blocked on missing CITDP despite green tests. |
| Workflow choreography | **B** | Four Claude turns complete with orchestrator exit 0 in under three minutes. |
| Methodology learning readout | **B−** | First WF-10 Sonnet low cell shows delivery-without-close-out pattern again. |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries.

---

## Cross-model notes (PROMPT-WF-10)

Pairs with [Sonnet medium @ 1794360125](trial-readout-PROMPT-WF-10-claudesonnet55medium-1794360125-wf-agentstream-wf-10-claude-claudesonnet55medium.md) on the same goal-first-soc paste. No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Opens **PROMPT-WF-10** Claude agentstream recording on **4.2.1**. Contrast with **PROMPT-WF-09** Sonnet matrix for close-out vs split-signal dispositions at the same effort tiers.

---

## TIED version / dogfood

Session evidence cites **TIED 4.2.1** on disposable bootstrap line — not an effectiveness claim for Claude or effort tiers.

---

## Facilitator follow-ups

- Record additional harnesses (Cursor `luna` / `composer-2.5`) on **PROMPT-WF-10** for cross-toolset argv-wiring stress.
- Optional: CITDP-first close-out pilot to reduce split signals on composition prompts.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-10-1794359532-wf-agentstream-wf-10-claude-claudesonnet55low/PLAN.md)
