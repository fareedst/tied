# Trial readout: PROMPT-WF-10 → Claude Haiku 5.5 (low effort) → `1794371036-wf-agentstream-wf-10-claude-claudehaiku55low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-11 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-10`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-10](catalog-traditional-workflow-trial-prompts.md#prompt-wf-10) (`goal-first-soc`) |
| **Model config** | `claude-haiku-5-5` (`low` effort) |
| **Model slug** | `claude-haiku-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794371036-wf-agentstream-wf-10-claude-claudehaiku55low` |
| **Factory tag** | `1794371036-wf-agentstream-wf-10-claude-claudehaiku55low` |
| **Product REQ** | `REQ-CSV_SUMMARY_CLI` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — evidence `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **PROMPT-WF-10** Claude Haiku **`low`** cell on **4.2.2** with **default-on proof manifest gate**; agent-authored **`proof-facet-manifest.v1.json`** (2 `files[]` rows). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a TypeScript CLI that summarizes CSV text with row count and column count. The user must choose exactly one input: a --file <path> option or an explicit stdin mode (document the flag or convention you use). Using both or neither is an error with a documented message. File mode must read via the filesystem; stdin mode must read until EOF without a path. Include automated tests. No graphical UI.
```

**Catalog stress:** thin CLI argv wiring (**TIED-DEMO-13**) — goal-first-soc paste. **Proof boundary:** executable behavior + orchestrator log + facilitator replay.

---

## What was built

- **Product:** TypeScript CSV summary CLI — `src/csv-summary.ts`, `src/cli.ts`; facilitator **`npm test` 16/16** pass.
- **TIED:** `REQ-CSV_SUMMARY_CLI` + ARCH/IMPL indexes and detail; CITDP persisted at close-out attempt; **uncommitted** product + YAML.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **~392s** (6.5 min).
- **Git:** bootstrap pin **`a4ed724`** — product tree **untracked**.
- **Project size layers:** unit tests **16**; composition **0** on path receipt; `operational_intent_hash` `cfef5510…` ([facilitator snapshot](../../tied-project/working/FACILITATOR-WF-10-1794371036-wf-agentstream-wf-10-claude-claudehaiku55low/evidence/project-size-snapshot.v1.json)).
- **Proof manifest:** `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` — 2 `files[]`, 1 `bindings[]`; build-plan reports advisory validate **ok**.

---

## Outcome record

**Implementation outcome:** **Partial** — sixteen passing tests at facilitator replay; delivery on disk only.

**Workflow outcome:** **Incomplete** — close-out blocked (Tracker `invalid_slug`, pending `sub-adversarial-inquiry-pass`); no traceable commit.

**Grading outcome:** Session bands describe this cell only. **Grade mean (registry):** 3.29 · A/B−/B+/B/C+/B/B.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail** | `tied_gate_check` `allowed: false` — `invalid_slug:build-plan`, pending adversarial pass |
| **Process contract** | **partial** | RED/GREEN archived; **proof manifest present**; verification gate / `tied_verify` not run |
| **Orchestrator** | **pass** | **`exit_code: 0`** after default-on manifest gate; stderr shows scaffold + gate DIAGNOSTIC |
| **Composition stress** | **manifest claim** | Agent labels `src/cli.test.ts` as `composition.integration`; size receipt still **0** composition (path rollup **1.1.0**) |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-CSV_SUMMARY_CLI/PLAN.md` |
| **Interaction inventory** | `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Proof manifest** | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-10-1794371036-wf-agentstream-wf-10-claude-claudehaiku55low/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold; session semver **4.2.2** |
| 2 | `refine-plan` | `--file` xor `--stdin`; exit code contract |
| 3 | `build-plan` | **16** green tests; **proof manifest** completed; RED/GREEN archived |
| 4 | `close-out` | **Incomplete** — Tracker slug / adversarial disposition blockers |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `…/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **392s** (~6.5 min) |

**Friction excerpts (stderr):** `DIAGNOSTIC: WF trial proof manifest gate: default on`; `proof manifest scaffold seeded`; four `--- turn N/4 ---` boundaries; `HARNESS=claude` `model_effort=low`.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git vs tests | **Green tests with no product commit** — split signal |
| Proof manifest | **Present** — first WF-10 Haiku readout after orchestrator default-on gate (prior pre-gate cell `1794369836` had no manifest) |
| Composition | Manifest declares integration label on `cli.test.ts`; receipt path bucket remains **unit-only** until snapshot **1.2.0** manifest rollup on client |
| Tracker | Template `build-plan` slug in `execution_evidence.completed` blocks machine close-out |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **16** pass |
| Typecheck | **GREEN** per build handoff (`tsc --noEmit`); not re-run at facilitator replay |

---

## Proof labels (manifest vs path)

| File | Manifest `proof_subtype` | Path receipt (facilitator) |
| --- | --- | --- |
| `src/csv-summary.test.ts` | `unit.default` | unit |
| `src/cli.test.ts` | `composition.integration` (+ `subprocess` tag) | unit (path-only **1.1.0**) |

Agent-corrected scaffold binding **CLI→core** from placeholder `cli.binding.test.ts` to `src/cli.test.ts` / `summarizeCsv`.

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Exclusive file vs stdin and documented exit codes locked before RED. |
| Traceability closure | **B−** | ARCH/IMPL and product code remain uncommitted though orchestrator exit 0. |
| Test strategy | **B+** | Sixteen cases with RED/GREEN archives and completed proof manifest under default-on gate. |
| Algorithm / implementation | **B** | RFC 4180 scanner and argv wiring pass sponsor tests in facilitator replay. |
| Process adherence | **C+** | Close-out blocked on Tracker slug hygiene despite strong build-plan handoff. |
| Workflow choreography | **B** | Four Claude turns complete in ~6.5 minutes with manifest gate satisfied. |
| Methodology learning readout | **B** | Delivers classified test inventory where pre-gate WF-10 cells omitted manifest entirely. |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries.

---

## Cross-model notes (PROMPT-WF-10)

Pairs with [Sonnet low @ 1794366012](trial-readout-PROMPT-WF-10-claudesonnet55low-1794366012-wf-agentstream-wf-10-claude-claudesonnet55low.md) on **4.2.2** — Haiku delivers **more tests** and **manifest** where Sonnet low stopped at eight tests without L3 file. No ranking.

---

## Cohort comparisons vs peer WF readouts

Post–wave-2 orchestrator policy cell: manifest gate DIAGNOSTIC in stderr; exit 0 requires valid `files[]`. Haiku **low** on goal-first-soc **TIED-DEMO-13**.

---

## TIED version / dogfood

Session evidence cites **TIED 4.2.2** on disposable bootstrap — not an effectiveness claim for Claude or effort tiers.

---

## Facilitator follow-ups

- Re-run `tied_project_size_snapshot` on store MCP **1.2.0** to reflect manifest overrides in `label_case_counts`.
- Fix Tracker step slugs before close-out pilots on disposable templates.
- Optional: compare Haiku vs Sonnet **low** on manifest `composition.integration` vs path receipts.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-10-1794371036-wf-agentstream-wf-10-claude-claudehaiku55low/PLAN.md)
- [REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE wave 2](../../tied-project/working/REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE/PLAN.md)
