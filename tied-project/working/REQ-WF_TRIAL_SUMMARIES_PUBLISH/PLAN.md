# PLAN — [REQ-WF_TRIAL_SUMMARIES_PUBLISH]

**Trial context:** TIED methodology **store** repo — facilitator skills, `docs/demos/` WF readout corpus, bootstrap regen scripts.

| Field | Value |
| --- | --- |
| **Request token** | `REQ-WF_TRIAL_SUMMARIES_PUBLISH` |
| **`plan_phase`** | `build-complete` |
| **Workflow** | `@add-feature` → **`@refine-plan` (this pass)** → `@build-plan` → `@close-out` |
| **Linked Cursor plan** | `publish-wf-trial-summaries_skill_bbbf8a92.plan.md` |
| **Tracker** | [checklist-tracker.yaml](./checklist-tracker.yaml) |
| **Test strategy** | [test-strategy.md](./test-strategy.md) |
| **CITDP (draft)** | [CITDP-REQ-WF_TRIAL_SUMMARIES_PUBLISH.draft.yaml](./CITDP-REQ-WF_TRIAL_SUMMARIES_PUBLISH.draft.yaml) |

**Sponsor outcome (locked):** Facilitators invoke **`@publish-wf-trial-summaries`** with **no required remainder**. The skill and CLI **fully refresh** cohort summary artifacts from **existing** `trial-readout-PROMPT-WF-*.md` analyses and catalog readout links—without re-inspecting disposable clients or naming individual trials.

---

## Problem statement

| Surface | Current | Desired |
| --- | --- | --- |
| After `@record-wf-trial` | Readout + often catalog row + README link; **registry**, **comparison-table**, **Latest-run matrix** updated inconsistently | One follow-up skill: **full cohort regen** from readouts on disk |
| Facilitator cognitive load | Manual `node tools/bootstrap/lib/project-size-batch-compare.mjs` + working-folder `build-comparison-matrix.mjs` | Single orchestrator + documented skill procedure |
| CI / drift | No one command to assert summaries match generators | `wf-trial-summaries-publish.mjs --check` fails closed |

**Contrast:** `@record-wf-trial` remains **per-client** inspection and readout authorship. **`@publish-wf-trial-summaries`** is **cohort-wide** index maintenance only.

---

## Locked decisions (refine-plan 2026-11-13)

| ID | Decision |
| --- | --- |
| **D-NO-INPUTS** | Zero positional args; optional flags only (`--dry-run`, `--check`, `--skip-size-batch`, `--skip-registry-matrix`) |
| **D-RECORD-UNCHANGED** | Do not modify `record-wf-trial` procedure in v1 beyond a one-paragraph cross-link in `reference.md` |
| **D-CATALOG-BODY** | **Do not** auto-rewrite **Recorded trials** table rows in v1 — `@record-wf-trial` still adds prose rows; publish **validates** link set vs readout glob and updates **registry row count** header to match catalog |
| **D-REGISTRY-SCHEMA** | Rebuild master table using **current** slim columns: `WF \| Client ID \| Harness \| Model slug \| Exit \| Run time \| Grades \| Latest \| Readout` (see [traditional-workflow-trial-runs-registry.md](../../../docs/demos/traditional-workflow-trial-runs-registry.md)) — not the wider legacy column set in [PLAN-WF-TRIAL-RUNS-REGISTRY](../PLAN-WF-TRIAL-RUNS-REGISTRY/PLAN.md) |
| **D-REGISTRY-SOURCE** | Row inventory = readout links extracted from catalog **Recorded trials**; grades/time/exit from readout scrape + orchestrator evidence paths cited in readout when present |
| **D-ORPHANS** | Readouts on disk **not** linked from catalog → **DIAGNOSTIC** in publish evidence; **excluded** from registry rows (per runs-registry policy) |
| **D-MATRIX** | After registry write, run promoted **`build-wf-trial-comparison-matrix.mjs`** (from working PLAN evidence) to patch **Latest-run comparison matrix** |
| **D-SIZE-TABLE** | Default run `project-size-batch-compare.mjs --store-root $STORE --include-trial-factors` unless `--skip-size-batch` |
| **D-README** | Reconcile workflow readouts links in [docs/demos/README.md](../../../docs/demos/README.md) from catalog + committed readout glob (no new narrative) |
| **D-FORBIDDEN** | `maturity_score`, leaderboard-as-maturity, auto `git commit`, disposable client mutation |

**profile_depth:** `minimal` · **gate_policy:** `advisory` · **depth_tier:** `minimal`

---

## Publish pipeline (normative order)

```text
1. Validate store workspace (skill: tied_config_get_base_path → tied-project/)
2. Glob docs/demos/trial-readout-PROMPT-WF-*.md
3. Parse catalog Recorded trials → extract readout HREFs + client id when present
4. Emit validation report (orphan readouts, catalog links → missing files, row count)
5. Rebuild docs/demos/traditional-workflow-trial-runs-registry.md (master + header Rows/Last updated)
6. build-wf-trial-comparison-matrix.mjs (unless --skip-registry-matrix)
7. project-size-batch-compare.mjs (unless --skip-size-batch)
8. Patch docs/demos/README.md workflow readouts index (link list only)
9. Write FACILITATOR-WF-PUBLISH-{epoch}/evidence/publish-summary.md
```

**Skill surface:** `tools/bundled-publish-wf-trial-summaries-skill/` — procedure mirrors steps 1–9; step 5–8 delegate to `node tools/bootstrap/lib/wf-trial-summaries-publish.mjs`.

---

## Module boundaries

```text
tools/bundled-publish-wf-trial-summaries-skill/     # new STORE_FACILITATOR_SKILLS entry
tools/bootstrap/lib/wf-trial-summaries-publish.mjs   # orchestrator
tools/bootstrap/lib/build-wf-trial-comparison-matrix.mjs  # promote from PLAN-WF-TRIAL-COMPARISON-MATRIX/evidence/
tools/bootstrap/lib/wf-trial-catalog-readout-links.mjs    # new: parse catalog table (pure)
tools/bootstrap/lib/wf-trial-registry-author.mjs            # new: registry markdown author (pure)
tools/bootstrap/lib/read-trial-readout-session-grading.mjs  # existing scrape
tools/bootstrap/lib/project-size-batch-compare.mjs          # existing
tools/bootstrap/lib/store-facilitator-skills.test.mjs       # +1 skill
tools/bootstrap/manifest.json
docs/demos/catalog-traditional-workflow-trial-prompts.md  # protocol step + maintainer line
docs/demos/catalog-tied-size-and-trial-statistics.md      # publish skill bullet
tools/bundled-record-wf-trial-skill/reference.md            # cross-link only
tied-project/vocab/project-operations-mcp.md                # RECORD publish skill row
tied-project/requirements|architecture|implementation-decisions/  # build-plan tokens
```

**LEAP parent:** extend satisfaction on [REQ-TIED_CLIENT_BOOTSTRAP_SKILLS](../../requirements/REQ-TIED_CLIENT_BOOTSTRAP_SKILLS.yaml) (`STORE_FACILITATOR_SKILLS` + tests).

**Related shipped tokens (reuse, do not duplicate):** [REQ-WF_TRIAL_REGISTRY_COMPARISON_MATRIX_CELLS](../../requirements/REQ-WF_TRIAL_REGISTRY_COMPARISON_MATRIX_CELLS.yaml), [REQ-WF_TRIAL_READOUT_GRADING_RATIONALE](../../requirements/REQ-WF_TRIAL_READOUT_GRADING_RATIONALE.yaml), [REQ-TIED_PROJECT_SIZE_LAYERS](../../requirements/REQ-TIED_PROJECT_SIZE_LAYERS.yaml).

---

## Acceptance criteria (`@build-plan`)

| ID | Criterion | Verification |
| --- | --- | --- |
| **SC-WF-PSP-01** | `STORE_FACILITATOR_SKILLS` lists `publish-wf-trial-summaries`; self-install stub works | `store-facilitator-skills.test.mjs` |
| **SC-WF-PSP-02** | Skill reference states **no required inputs** + full artifact list | `wf-trial-summaries-publish-skill-contract.test.mjs` (new) |
| **SC-WF-PSP-03** | `--check` clean on committed tree after regen | orchestrator integration test + manual first run |
| **SC-WF-PSP-04** | Fixture catalog links → registry rows match golden fragment | unit test on `wf-trial-registry-author.mjs` |
| **SC-WF-PSP-05** | Readout scrape → `meanCompactGrades` parity | unit test on existing parser + registry row |
| **SC-WF-PSP-06** | Promoted matrix builder `--check` passes | existing `wf-trial-comparison-matrix.test.mjs` + builder `--check` |

---

## Implementation phases (`@build-plan`)

1. **TIED stack** — `REQ/ARCH/IMPL-WF_TRIAL_SUMMARIES_PUBLISH` + IMPL pseudo-code sidecar; `semantic-tokens.yaml`; `tied_validate_consistency`.
2. **RED** — SC-WF-PSP-01..06 tests (fail before orchestrator).
3. **Pure libs** — catalog link extractor, registry author (slim schema), wire existing grading scraper for Exit/Run time when present in readout metadata.
4. **Promote** `build-comparison-matrix.mjs` → `tools/bootstrap/lib/build-wf-trial-comparison-matrix.mjs`; thin shim in working evidence folder.
5. **Orchestrator** — `wf-trial-summaries-publish.mjs` implements pipeline §Publish pipeline; `--dry-run` prints steps only.
6. **Skill bundle** — SKILL, reference, examples, README; manifest entry.
7. **Docs + vocab** — catalog protocol step 5b, size catalog, `record-wf-trial` cross-link, `project-operations-mcp.md`.
8. **GREEN + regen** — run orchestrator once on store; commit left to sponsor; `--check` in CI via bootstrap test suite.
9. **CITDP persist** — `tied-project/citdp/CITDP-REQ-WF_TRIAL_SUMMARIES_PUBLISH.yaml`.

---

## Risk / consequence ladder

| Risk | Rung | Mitigation |
| --- | --- | --- |
| Registry rewrite drops historical rows | 2 | Source rows only from catalog links; golden fixture + row count == catalog |
| Size batch fails (no discover parent) | 1 | `--skip-size-batch` + evidence notes **N/A** |
| Accidental catalog table rewrite | 2 | v1 **D-CATALOG-BODY** — code must not patch Recorded trials markdown body |
| Wrong `TIED_BASE_PATH` | 3 | Skill workspace gate (same as record-wf-trial) |

---

## Do next

**`@close-out`** (or sponsor full publish + install stub first — see [evidence/session-handoff.md](./evidence/session-handoff.md)).

Sponsor may run `node tools/bootstrap/lib/wf-trial-summaries-publish.mjs` to align registry matrix with latest readouts — requires discover parent unless `--skip-size-batch`.

---

## Session handoff

**Last:** 2026-11-13 · **`@handoff`** post-build · **plan_phase:** `build-complete`  
**Log:** [evidence/session-handoff.md](./evidence/session-handoff.md)

---

## Changelog (this plan)

| Date | prompt_type | Summary |
| --- | --- | --- |
| 2026-11-13 | add-feature | Initial Cursor plan — cohort publish skill |
| 2026-11-13 | refine-plan | Locked no-input full refresh; slim registry schema; catalog body out of scope v1; pipeline order; SC-WF-PSP-* |
| 2026-11-13 | build-plan | Skill bundle, orchestrator, tests, TIED stack, docs; `--check` green |
| 2026-11-13 | handoff | Persisted session-handoff.md; close-out + full publish deferred to sponsor |
