# Trial readout: PROMPT-WF-10 → Claude Haiku 5.5 (low effort) → `1794408633-wf-agentstream-wf-10-claude-claudehaiku55low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-11 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-10`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-10](catalog-traditional-workflow-trial-prompts.md#prompt-wf-10) (`goal-first-soc`) |
| **Model config** | `claude-haiku-5-5` (`low` effort) |
| **Model slug** | `claude-haiku-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794408633-wf-agentstream-wf-10-claude-claudehaiku55low` |
| **Factory tag** | `1794408633-wf-agentstream-wf-10-claude-claudehaiku55low` |
| **Product REQ** | `REQ-CSV_SUMMARY_CLI` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — evidence `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | Re-run after **phase-handoff resolver** wave 2; peer [Haiku low @ 1794371036](trial-readout-PROMPT-WF-10-claudehaiku55low-1794371036-wf-agentstream-wf-10-claude-claudehaiku55low.md) had **16** tests — this cell **23/23** with **binding** manifest row on disk. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a TypeScript CLI that summarizes CSV text with row count and column count. The user must choose exactly one input: a --file <path> option or an explicit stdin mode (document the flag or convention you use). Using both or neither is an error with a documented message. File mode must read via the filesystem; stdin mode must read until EOF without a path. Include automated tests. No graphical UI.
```

**Catalog stress:** thin CLI argv wiring (**TIED-DEMO-13**) — goal-first-soc paste.

---

## RESOLVE (subject)

| Term | Resolution |
| --- | --- |
| Input | `--file` XOR `--stdin` (locked refine-plan) |
| Header / rows | **D-ROWS** — header excluded from row count **accepted but sponsor-unconfirmed** per close-out handoff |
| Stack | `wf-trial-ts-node-test-v1` |

---

## What was built

- **Product:** `src/csv-summary.ts`, `src/cli.ts`, `src/args.ts`, `src/cli.binding.test.ts`; facilitator **`npm test` 23/23**.
- **TIED:** PLAN + handoffs 1–4; slim tracker still lists legacy slugs **`red-tests`** / **`implement-code`**; **`execution_evidence.completed` empty**; no persisted CITDP YAML.
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **~301s** (5.0 min).
- **Git:** bootstrap pin **`f1f07df`** — product tree **untracked**.
- **Project size layers:** unit tests **23** ([facilitator snapshot](../../tied-project/working/FACILITATOR-WF-10-1794408633-wf-agentstream-wf-10-claude-claudehaiku55low/evidence/project-size-snapshot.v1.json)).
- **Proof manifest:** **3** `files[]` rows + **1** `bindings[]`; `cli.binding.test.ts` **exists** on disk.

---

## Outcome record

**Implementation outcome:** **Pass (local)** — CSV CLI + argv layer + binding test green at facilitator replay.

**Workflow outcome:** **Incomplete** — close-out blocked (CITDP adversarial fields + tracker **`invalid_slug`**).

**Grading outcome:** Session bands describe this cell only. **Grade mean (registry):** ~3.1 · mixed A/C bands.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail** | `missing_file` CITDP; verification `allowed: false` (`invalid_slug`, adversarial fields) |
| **Process contract** | **partial** | RED/GREEN archived; proof manifest validator ok; tracker sync not run |
| **Adherence ledger** | **not_run** | Client lacks `mcp-server/dist` |
| **Orchestrator** | **pass shell** | **`exit_code: 0`**; phase handoff gate default-on without resolve ERROR |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-CSV_SUMMARY_CLI/PLAN.md` |
| **Interaction inventory** | `tied-project/working/REQ-CSV_SUMMARY_CLI/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Proof manifest** | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-10-1794408633-wf-agentstream-wf-10-claude-claudehaiku55low/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | PLAN + slim tracker; session **4.2.2** |
| 2 | `refine-plan` | Locked contract; pre_implementation gate **`invalid_slug`** on template slugs |
| 3 | `build-plan` | **23/23** GREEN; binding test; verification receipt **`allowed: false`** |
| 4 | `close-out` | **Incomplete** — CITDP persist rejected; no commit |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `…/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **301s** (~5.0 min) |

**Friction excerpts (stderr):** default-on proof + phase handoff gates; slim tracker copy-if-absent; **no** `could not resolve product REQ`; MODEL_EFFORT=**low**.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Commits | Bootstrap only — build-plan did not reach `traceable-commit` |
| Template slugs | Slim tracker still exposes **`red-tests`** / **`implement-code`** (registry rejects) |
| vs 1794371036 | Peer low cell had **16** tests and similar close-out blockers — this run adds binding coverage |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **23/23** |
| Product under `src/` | **Present** |

---

## Proof labels (manifest vs path)

| Path | On disk | Manifest |
| --- | --- | --- |
| `src/csv-summary.test.ts` | yes | unit |
| `src/args.test.ts` | yes | unit |
| `src/cli.binding.test.ts` | yes | composition.wiring |

Size receipt rollup reports **0** composition tests (validator **1.1.0** path policy); manifest + facilitator agree binding file exists.

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A−** | Mutex argv and CSV rules locked in PLAN; **D-ROWS** still flagged for sponsor. |
| Traceability closure | **C+** | Handoffs and tests align to PLAN; CITDP not persisted and REQ index not updated turn 1. |
| Test strategy | **A** | RED archived then **23/23** GREEN including `cli.binding.test.ts`. |
| Algorithm / implementation | **A** | Facilitator replay confirms CSV parse and CLI wiring behavior. |
| Process adherence | **D+** | Tracker template slugs break gates; `completed` never synced to registry slugs. |
| Workflow choreography | **B** | Four turns complete; close-out lists store template defect honestly. |
| Methodology learning readout | **B** | Post-resolver run shows orchestrator **0** with gates on and real tests on disk. |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; highlights **slim tracker slug drift** vs `checklist-validator` as a store follow-up distinct from product REQ quality.

---

## Cross-model notes (PROMPT-WF-10)

Contrast [Haiku low @ 1794371036](trial-readout-PROMPT-WF-10-claudehaiku55low-1794371036-wf-agentstream-wf-10-claude-claudehaiku55low.md) (**16** tests) and [Haiku medium @ 1794407806](trial-readout-PROMPT-WF-10-claudehaiku55medium-1794407806-wf-agentstream-wf-10-claude-claudehaiku55medium.md) (**21** tests, registry slugs in `completed`). **No ranking.**

---

## Cohort comparisons vs peer WF readouts

Same **4.2.2** bootstrap and default-on orchestrator gates; **low** effort delivered **more** automated tests than the prior low readout while sharing the **CITDP adversarial open-record** close-out blocker with the post-fix medium cell.

---

## TIED version / dogfood

Session **4.2.2** on turn 1 — not an effectiveness claim for low effort or resolver wave 2.

---

## Facilitator follow-ups

- Store: align **`wf-trial-minimal-checklist-tracker.yaml`** with registry slugs (`unit-test-red` / `unit-test-green`) — agent handoff already documents mismatch.
- Sponsor: confirm **D-ROWS** header semantics.
- Re-run `@record-wf-trial --force` after close-out repair if desired.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Facilitator evidence](../../tied-project/working/FACILITATOR-WF-10-1794408633-wf-agentstream-wf-10-claude-claudehaiku55low/evidence/build-plan-verification-evidence.md)
- [Peer low @ 1794371036](trial-readout-PROMPT-WF-10-claudehaiku55low-1794371036-wf-agentstream-wf-10-claude-claudehaiku55low.md)
