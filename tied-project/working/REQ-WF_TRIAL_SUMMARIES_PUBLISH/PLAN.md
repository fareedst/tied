# PLAN — [REQ-WF_TRIAL_SUMMARIES_PUBLISH]

**Trial context:** TIED methodology **store** repo — facilitator skills, [agent-harness-evaluation](../../../docs/agent-harness-evaluation/) readout corpus, bootstrap regen scripts.

| Field | Value |
| --- | --- |
| **Request token** | `REQ-WF_TRIAL_SUMMARIES_PUBLISH` |
| **`plan_phase`** | `close-out-ready` (wave 2) |
| **Workflow** | wave 1 **build-complete** → **`@refine-plan` (2026-11-18)** → **`@build-plan`** → `@close-out` |
| **Linked Cursor plan** | `wf_publish_registry_and_batch_b8ab24a3.plan.md` (wave 2); wave 1: `publish-wf-trial-summaries_skill_bbbf8a92.plan.md` |
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

### Wave 2 gap (2026-11-18 — incident **1795023644**)

Shipped v1 **refreshes** existing master rows only; **`wf-trial-registry-author.mjs`** from wave 1 PLAN was **not** wired. Catalog grew to **~193** readout links while master table lagged (**1795023644** absent → Latest-run matrix **cursor:grok47-low** WF-03 still **1794616912**). Size batch used discover **`limit: 50`**, dropping older disposable clients from [comparison-table](../../../docs/agent-harness-evaluation/cohort/comparison-table.md) snapshots.

**Wave 2 sponsor outcome:** One publish run inserts **all catalog-linked** missing master rows and snapshots **all** eligible discover targets (no publish-time cap).

---

## Locked decisions (refine-plan 2026-11-13)

| ID | Decision |
| --- | --- |
| **D-NO-INPUTS** | Zero positional args; optional flags only (`--dry-run`, `--check`, `--skip-size-batch`, `--skip-registry-matrix`) |
| **D-RECORD-UNCHANGED** | Do not modify `record-wf-trial` procedure in v1 beyond a one-paragraph cross-link in `reference.md` |
| **D-CATALOG-BODY** | **Do not** auto-rewrite **Recorded trials** table rows in v1 — `@record-wf-trial` still adds prose rows; publish **validates** link set vs readout glob (**header Rows:** see **D-HEADER-ROWS-ACTUAL**, not raw catalog link count) |
| **D-REGISTRY-SCHEMA** | Master table slim columns: `WF \| Client ID \| Harness \| Model slug \| Exit \| Run time \| Grades \| Latest \| Readout` ([registry](../../../docs/agent-harness-evaluation/registries/traditional-workflow-trial-runs-registry.md)) — not the wider legacy set in [PLAN-WF-TRIAL-RUNS-REGISTRY](../PLAN-WF-TRIAL-RUNS-REGISTRY/PLAN.md) |
| **D-REGISTRY-SOURCE** | Row inventory = readout links extracted from catalog **Recorded trials**; grades/time/exit from readout scrape + orchestrator evidence paths cited in readout when present |
| **D-ORPHANS** | Readouts on disk **not** linked from catalog → **DIAGNOSTIC** in publish evidence; **excluded** from registry rows (per runs-registry policy) |
| **D-MATRIX** | After registry write, run promoted **`build-wf-trial-comparison-matrix.mjs`** (from working PLAN evidence) to patch **Latest-run comparison matrix** |
| **D-SIZE-TABLE** | Default run `project-size-batch-compare.mjs --store-root $STORE --include-trial-factors` unless `--skip-size-batch` (wave 2: publish passes **`--limit 0`** — see **D-SIZE-UNLIMITED-PUBLISH**) |
| **D-README** | Reconcile workflow readouts links in [docs/demos/README.md](../../../docs/demos/README.md) from catalog + committed readout glob (no new narrative) |
| **D-FORBIDDEN** | `maturity_score`, leaderboard-as-maturity, auto `git commit`, disposable client mutation |

**profile_depth:** `minimal` · **gate_policy:** `advisory` · **depth_tier:** `minimal`

### Locked decisions (refine-plan 2026-11-18 — wave 2)

| ID | Decision |
| --- | --- |
| **D-SIZE-UNLIMITED-PUBLISH** | `wf-trial-summaries-publish.mjs` spawns size batch with **`--limit 0`** (unless `--skip-size-batch`) |
| **D-DISCOVER-LIMIT-ZERO** | `discoverClients`: `limit <= 0` → no `slice` cap; direct CLI default stays **50** |
| **D-REGISTRY-SYNC** | `syncMasterRowsFromCatalogLinks` before refresh — fulfills original **D-REGISTRY-SOURCE** (catalog href inventory → master rows) |
| **D-HEADER-ROWS-ACTUAL** | Header **Rows** = parsed master row count after sync |
| **D-SYNC-DIAGNOSTICS** | Missing/unscrapable catalog readout → `publish-summary.md` diagnostics; matrix `--check` still gates CI |
| **D-REGISTRY-INSERT-ONLY** | Sync **inserts** master rows for catalog hrefs not yet present; **never deletes** rows when catalog links are removed (history preserved; **Latest** still max `clientId` per harness+slug+WF cell) |

Evidence: [evidence/refine-plan-pass2.md](./evidence/refine-plan-pass2.md) · [evidence/refine-plan-pass3.md](./evidence/refine-plan-pass3.md).

---

## Publish pipeline (normative order)

```text
1. Validate store workspace (skill: tied_config_get_base_path → tied-project/)
2. Glob docs/agent-harness-evaluation/readouts/trial-readout-PROMPT-WF-*.md
3. Parse catalog Recorded trials → extract readout HREFs (see wf-trial-catalog-readout-links.mjs)
4. Emit validation report (orphan readouts, catalog links → missing files, sync diagnostics)
5. Rebuild [traditional-workflow-trial-runs-registry.md](../../../docs/agent-harness-evaluation/registries/traditional-workflow-trial-runs-registry.md): **sync** missing catalog hrefs → master rows → **refresh** grades/exit/time → recompute **Latest** → header Rows/Last updated
6. build-wf-trial-comparison-matrix.mjs (unless --skip-registry-matrix)
7. project-size-batch-compare.mjs **--limit 0** (unless --skip-size-batch)
8. Patch docs/demos/README.md workflow readouts index (link list only)
9. Write FACILITATOR-WF-PUBLISH-{epoch}/evidence/publish-summary.md
```

**Skill surface:** `tools/bundled-publish-wf-trial-summaries-skill/` — procedure mirrors steps 1–9; steps 5–7 delegate to `node tools/bootstrap/lib/wf-trial-summaries-publish.mjs` (step 8 **D-README** still deferred in orchestrator v1).

---

## Registry author contract (wave 2 — build-plan)

Module: [`wf-trial-registry-author.mjs`](../../../tools/bootstrap/lib/wf-trial-registry-author.mjs) (new).

| Step | Behavior |
| --- | --- |
| Index existing | Parse master section lines with [`parseMasterRow`](../../../tools/bootstrap/lib/wf-trial-registry-refresh.mjs); `Set` of readout basenames |
| For each catalog href | Skip if basename already in master |
| Load fields | [`loadReadoutRegistryFields(storeRoot, href)`](../../../tools/bootstrap/lib/wf-trial-readout-registry-fields.mjs) |
| Row shape | `wf` from scrape or `PROMPT-WF-NN` from catalog row; `clientId` from filename epoch; harness/modelSlug/exit/runTime/grades from scrape |
| Format | Reuse `formatMasterRow` (export from `wf-trial-registry-refresh.mjs` if needed) |
| Insert location | Append new rows inside **Master runs table** section (preserve preamble + matrix section structure) |
| Post | Existing `refreshRegistryFromReadouts` → `recomputeLatestForCell` → `patchRegistryHeader` |

**Failure:** missing readout file on disk → record in `syncSkipped[]` returned to orchestrator for publish-summary (no throw unless zero rows writable).

**Matrix spot (SC-WF-PSP-06):** add to `SPOT_CHECKS` in [`build-wf-trial-comparison-matrix.mjs`](../../../tools/bootstrap/lib/build-wf-trial-comparison-matrix.mjs):

```js
{ wf: "03", key: "cursor:grok47-low", wallMins: "11m", gradesIncludes: "3.59 ·", readoutIncludes: "1795023644" }
```

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
docs/agent-harness-evaluation/catalogs/catalog-traditional-workflow-trial-prompts.md
docs/agent-harness-evaluation/catalogs/catalog-tied-size-and-trial-statistics.md
docs/agent-harness-evaluation/registries/traditional-workflow-trial-runs-registry.md
docs/agent-harness-evaluation/cohort/comparison-table.md
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
| **SC-WF-PSP-04** | Fixture catalog links → **sync inserts** missing master rows | `wf-trial-registry-author.test.mjs` + fixtures |
| **SC-WF-PSP-05** | Readout scrape → `meanCompactGrades` parity | unit test on existing parser + registry row |
| **SC-WF-PSP-06** | Promoted matrix builder `--check` passes | `wf-trial-comparison-matrix.test.mjs` + builder `--check` (add WF-03 **1795023644** spot) |
| **SC-WF-PSP-07** | Publish size batch uses unlimited discover | `project-size-discover-clients.test.mjs` + orchestrator spawn args test |
| **SC-WF-PSP-08** | Store regen includes **1795023644** master row + matrix cell `cursor:grok47-low` WF-03 | post-regen grep / matrix spot after full publish |

Wave 1 criteria remain; wave 2 **must** satisfy **SC-WF-PSP-04**, **07**, **08** (previously deferred/absent).

---

## Wave 2 implementation phases (`@build-plan`)

1. **RED** — SC-WF-PSP-04/07/08 failing tests; extend matrix `SPOT_CHECKS` for WF-03 `cursor:grok47-low`.
2. **`project-size-discover-clients.mjs`** — `limit <= 0` unlimited; document in batch compare usage.
3. **`wf-trial-registry-author.mjs`** — `syncMasterRowsFromCatalogLinks`; wire into `refreshTraditionalWorkflowTrialRunsRegistry`.
4. **`wf-trial-summaries-publish.mjs`** — pass `--limit 0`; emit sync diagnostics in `publish-summary.md`.
5. **Skill reference** — unlimited size batch + registry sync behavior.
6. **IMPL pseudo-code LEAP** — `SYNC_MASTER_ROWS_FROM_CATALOG` before refresh.
7. **GREEN** — full publish + `--check`; sponsor commit cohort docs.
8. **LEAP (build-plan)** — extend `REQ-WF_TRIAL_SUMMARIES_PUBLISH` satisfaction_criteria for **SC-WF-PSP-04/07/08**; update IMPL pseudo-code; `tied_validate_consistency`.

---

## Implementation phases (`@build-plan`) — wave 1 (complete)

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
| Registry rewrite drops historical rows | 2 | **D-REGISTRY-INSERT-ONLY**; golden fixture proves append-only sync |
| Catalog href unreadable on disk | 1 | **D-SYNC-DIAGNOSTICS**; row omitted until `@record-wf-trial` commits readout |
| Full discover slow / large snapshot set | 1 | Publish uses `--limit 0`; sponsor may `--skip-size-batch` locally |
| Size batch fails (no discover parent) | 1 | `--skip-size-batch` + evidence notes **N/A** |
| Accidental catalog table rewrite | 2 | v1 **D-CATALOG-BODY** — code must not patch Recorded trials markdown body |
| Wrong `TIED_BASE_PATH` | 3 | Skill workspace gate (same as record-wf-trial) |

---

## Do next

Optional **`@close-out`** when sponsor wants REQ status + CITDP persist + scoped commit (wave 2 code + regen docs).

---

## Session handoff

**Last:** 2026-11-18 · **`@refine-plan`** wave 2 · **plan_phase:** `pre-implementation`  
**Log:** [evidence/session-handoff.md](./evidence/session-handoff.md) · [refine-plan-pass2](./evidence/refine-plan-pass2.md) · [refine-plan-pass3](./evidence/refine-plan-pass3.md)

---

## Changelog (this plan)

| Date | prompt_type | Summary |
| --- | --- | --- |
| 2026-11-13 | add-feature | Initial Cursor plan — cohort publish skill |
| 2026-11-13 | refine-plan | Locked no-input full refresh; slim registry schema; catalog body out of scope v1; pipeline order; SC-WF-PSP-* |
| 2026-11-13 | build-plan | Skill bundle, orchestrator, tests, TIED stack, docs; `--check` green |
| 2026-11-13 | handoff | Persisted session-handoff.md; close-out + full publish deferred to sponsor |
| 2026-11-18 | refine-plan | Wave 2: registry catalog sync + unlimited publish size batch; incident 1795023644; `@build-plan` next |
| 2026-11-18 | refine-plan | Pass 3: AHE paths; D-REGISTRY-INSERT-ONLY; registry author contract; matrix spot constants; REQ LEAP note |
| 2026-11-18 | build-plan | Wave 2: registry author, limit 0 discover, tests green, full publish 278 snapshots |
