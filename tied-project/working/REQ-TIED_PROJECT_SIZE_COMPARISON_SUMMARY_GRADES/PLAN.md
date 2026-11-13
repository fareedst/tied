# PLAN — REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_GRADES

**Token:** `REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_GRADES`  
**Track:** `@add-feature` (intent locked) → **`@refine-plan`** (this pass) → **`@build-plan`** → `@close-out`  
**Parent:** [REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT](../REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT/PLAN.md) (v4 closed)  
**Facilitator:** [project-size-batch-discover-compare](../../non-tied-plans/project-size-batch-discover-compare/PLAN.md)  
**Grading contract:** [REQ-WF_TRIAL_READOUT_GRADING_RATIONALE](../../../requirements/REQ-WF_TRIAL_READOUT_GRADING_RATIONALE.yaml) · [`read-trial-readout-session-grading.mjs`](../../../tools/bootstrap/lib/read-trial-readout-session-grading.mjs)  
**Linked Cursor plan:** `.cursor/plans/comparison_summary_grades_af10172b.plan.md` (intent; not on disk in all clones)  
**plan_phase:** `closed`  
**depth_tier / gate_policy:** `minimal` / `advisory`

---

## Sponsor intent

Add a Summary column **`grades`** immediately **after** **`wall_clock`** in the batch comparison table ([comparison-table.md](../../non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md)).

| Change | Rule |
| --- | --- |
| **Column position** | Last Summary column: `… \| wall_clock \| grades \|` |
| **Cell format** | `{mean} · {Req}/{Tr}/{Ts}/{Al}/{Pr}/{Ch}/{Ml}` band slash string — same contract as [traditional-workflow-trial-runs-registry.md](../../../docs/demos/traditional-workflow-trial-runs-registry.md) **Grades** column via `meanCompactGrades` |
| **Source** | Join only: parse `## Session grading` from store readout markdown under `docs/demos/` |
| **Lookup key** | Full **discover basename** on the deduped summary row (`row.label` from manifest), **not** display `wf-NN-…` label |
| **Readout path** | First match: `docs/demos/trial-readout-PROMPT-WF-*-{discoverBasename}.md` (suffix match on basename) |
| **Missing readout** | Cell `—` (no throw; no silent default bands) |

**Proof boundary:** Grades are **facilitator readout evidence**, not snapshot receipt fields, not REQ satisfaction, not a leaderboard or maturity score. Size receipt JSON and manifest targets remain unchanged.

---

## RESOLVE

| Term | Definition |
| --- | --- |
| **Discover basename** | `target.label` / `row.label` (e.g. `1794525072-wf-agentstream-wf-10-cursor-grok47med`). |
| **Display label** | `trimComparisonDisplayLabel(basename)` — unchanged from COMPACT; grades join does **not** use this key. |
| **Compact slash** | Seven session bands in rubric order, `/`-separated, passed to `meanCompactGrades`. |
| **Dimension keys** | Req, Tr, Ts, Al, Pr, Ch, Ml — legend keys for glossary; bands in cells use letter grades only after the mean. |
| **storeRoot** | TIED store path passed into render (batch CLI already has `--store-root`). |

---

## Refinements (`@build-plan`)

1. **`buildTrialReadoutGradesIndex(storeRoot)`** in [`read-trial-readout-session-grading.mjs`](../../../tools/bootstrap/lib/read-trial-readout-session-grading.mjs) — scan `docs/demos/trial-readout-PROMPT-WF-*.md`; map discover basename → `{ compactSlash, display }` where `display = meanCompactGrades(compactSlash).display`.
2. **`renderGradesCell(label, index)`** in [`project-size-comparison-render.mjs`](../../../tools/bootstrap/lib/project-size-comparison-render.mjs) — index lookup by full `label`; escape pipe chars in cell text.
3. **`renderComparisonMarkdown`** — build index once when `meta.storeRoot` set; append **grades** column to header, definitions, and data rows; optional empty index when `storeRoot` omitted (tests use injected index).
4. **`project-size-batch-compare.mjs`** — pass `storeRoot: opts.storeRoot` into render meta.
5. **Disclaimer** — Intro line qualifies size table + optional grades join; column definitions add **grades** row linking registry dimension order.
6. **Tests** — SC-CGR-01…05 in [`project-size-comparison-render.test.mjs`](../../../tools/bootstrap/lib/project-size-comparison-render.test.mjs); optional unit tests on index builder with fixture readout in temp dir.
7. **Regen** — batch compare with existing flags; update [`catalog-tied-size-and-trial-statistics.md`](../../../docs/demos/catalog-tied-size-and-trial-statistics.md) if Summary column list is duplicated there.
8. **LEAP** — REQ acceptance SC-CGR-*; IMPL pseudo-code; persist CITDP; `tied_validate_consistency`.

---

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| SC-CGR-01 | Summary header ends with `\| wall_clock \| grades \|`. |
| SC-CGR-02 | When index has an entry for `row.label`, cell equals `meanCompactGrades` display for that readout (mean + band slash). |
| SC-CGR-03 | Unknown basename or parse failure → `—` in grades cell. |
| SC-CGR-04 | Deduped row uses **full** basename for lookup (test: same display label, different epochs — winner’s basename drives join). |
| SC-CGR-05 | Glossary defines **grades**; proof boundary / intro does not forbid the column while forbidding leaderboard/maturity framing. |
| SC-CGR-06 | `project-size-comparison-render.test.mjs` green; `tied_validate_consistency` ok after YAML sync. |

---

## Build sequence (`@build-plan`)

| Step | Deliverable |
| --- | --- |
| 1 | RED **SC-CGR-01…05** (+ injected grades index in tests) |
| 2 | GREEN index builder + `renderGradesCell` + render/batch wire |
| 3 | Regen `comparison-table.md` + catalog cross-link if needed |
| 4 | LEAP REQ/IMPL/CITDP; pseudocode validation; consistency validate |
| 5 | Build-plan verification evidence |

---

## Out of scope

- Mutating trial readouts or disposable clients
- Writing grades into snapshot receipts or JSONL cohort exports
- Registry generator automation / `traditional-workflow-trial-runs-registry.md` row edits (unless cross-link only)
- Composite “maturity” or ranking columns
- Verbose / fine-label tables gaining grades

---

## Risk

| Item | Consequence ladder |
| --- | --- |
| Operator treats grades as REQ status | **Reversible** — glossary + proof boundary |
| Readout filename drift vs basename | **Reversible** — `—` cell; manifest basename remains authoritative |
| Dedupe + wrong epoch wins readout | **Reversible** — join follows deduped row’s full basename |
| Perf: full demos scan each render | **Reversible** — index once per `renderComparisonMarkdown` call |

---

## Handoff

**Do next:** `@close-out` when sponsor ready ([build-plan verification](./evidence/build-plan-verification-evidence.md)).

**Disk:** [checklist-tracker.yaml](./checklist-tracker.yaml) · [test-strategy.md](./test-strategy.md) · [CITDP draft](./CITDP-REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_GRADES.draft.yaml)
