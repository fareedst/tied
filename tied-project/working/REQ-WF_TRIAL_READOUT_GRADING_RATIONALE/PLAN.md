# PLAN — [REQ-WF_TRIAL_READOUT_GRADING_RATIONALE]

**Trial context:** TIED methodology **store** repo (facilitator skills, `docs/demos/` WF readout corpus, bootstrap contract tests).

**`plan_phase`:** `post-build`

**Request token:** `REQ-WF_TRIAL_READOUT_GRADING_RATIONALE`  
**Workflow:** `@add-feature` (deferred — tokens mint at `@build-plan`) → `@refine-plan` → `@build-plan` → `@close-out`

**Sponsor outcome (resolved):** Every **`trial-readout-PROMPT-WF-*.md`** has seven **Rationale** cells that are concise, grade-aware, and low-jargon. **Band** column values are **frozen** during backfill; only rationale prose changes.

---

## Problem statement (locked)

| Surface | Current | Desired |
| --- | --- | --- |
| WF readouts (`docs/demos/trial-readout-PROMPT-WF-*.md`) | ~**72** rationale cells are placeholder `—` (recent agentstream batches); WF-08 **luna-low** / **composer25** cells are multi-sentence jargon essays | One short sentence per row (~12–30 words); sub-**A** states **one** main gap; **A** cites one concrete win |
| `tools/bundled-record-wf-trial-skill/reference.md` | Item 12 requires Session grading table but not rationale rules | Normative **Session grading rationale** subsection + before/after examples |
| Catalog facilitator section | Rubric weights only | **Rationale column** bullet list (same rules; no new weights) |
| Regression guard | None for rationale quality | Bootstrap contract test over **84** PROMPT-WF readouts |

**Reference style:** [trial-readout-PROMPT-WF-01-composer25-1794048393…](docs/demos/trial-readout-PROMPT-WF-01-composer25-1794048393-wf-agentstream-wf-01-cursor-composer25.md).  
**Anti-patterns:** [1794205559](docs/demos/trial-readout-PROMPT-WF-01-composer25-1794205559-wf-agentstream-wf-01-cursor-composer25.md) (`—` placeholders); [WF-08 luna-low @ 1794100604](docs/demos/trial-readout-PROMPT-WF-08-luna-low-1794100604-wf-agentstream-wf-08-cursor-lunalow.md) (verbose).

---

## Scope

| In | Out |
| --- | --- |
| `tools/bundled-record-wf-trial-skill/` (reference + SKILL Grade step) | `trial-readout-PROMPT-GF-*`, CUSTOM readouts |
| `docs/demos/catalog-traditional-workflow-trial-prompts.md` (#facilitator-grading-readout) | Changing letter **bands** or registry disposition labels |
| `tools/bootstrap/lib/trial-readout-grading-rationale-contract.test.mjs` | Mandatory max-word linter in CI (spot-check only) |
| Rationale backfill for all **84** `trial-readout-PROMPT-WF-*.md` | Re-running disposable client verification |
| TIED tokens `REQ/ARCH/IMPL-WF_TRIAL_READOUT_GRADING_RATIONALE` + IMPL pseudo-code | Optional helper script (store-only; not AC) |
| `tied-project/vocab/project-operations-mcp.md` RECORD (grading rationale term) | Machine registry band parity test (AC-5 manual close-out) |

---

## Locked decisions (refine-plan 2026-11-09)

| ID | Decision | Rationale |
| --- | --- | --- |
| **D-FROZEN-BANDS** | Backfill edits **Rationale** column only; **Band** column and [traditional-workflow-trial-runs-registry.md](docs/demos/traditional-workflow-trial-runs-registry.md) compact grades unchanged | Sponsor freeze; avoids cohort drift |
| **D-BAND-NORMALIZE** | Parser strips `**`, maps Unicode `−` and ASCII `-`; **sub-A** = any normalized band other than exact `A` (includes **A−**, **B+**, **B−**, **C+**, …) | Existing readouts use plus/minus variants |
| **D-SUB-A-FLOOR** | Sub-A rationales: length ≥ **15** chars after trim, not equal to `—` / `–` / `-`, not punctuation-only | Catches placeholders; allows short plain sentences |
| **D-A-ROW** | **A** rows: non-empty rationale required; contract does **not** require “why not A+” prose | Grade-aware rule is facilitator-facing docs |
| **D-JARGON** | Normative docs ban `maturity_score`, leaderboard language, unexplained **R+A+I** in rationale cells; prefer plain phrases | Aligns with catalog **Forbidden** list |
| **D-EVIDENCE-ONLY** | Each rationale sentence must be justifiable from **same file** sections (Outcome record, What was built, completion signals, orchestrator log) | Mitigate retroactive intent drift |
| **D-CONTRACT-LOCATION** | Contract test in `tools/bootstrap/lib/` (mirror [REQ-TRIAL_METHODOLOGY_VERSION_READOUT]) | Store bootstrap pattern; no new `mcp-server/contracts/` schema v1 unless build-plan expands |
| **D-ADD-FEATURE-DEFER** | TIED YAML + semantic tokens created at **`@build-plan`** (same pattern as TMV REQ) | Linked Cursor plan assumed add-feature incomplete |
| **D-COUNT** | Corpus size **84** files (`trial-readout-PROMPT-WF-*.md`) | Measured 2026-11-09 |

---

## Module boundaries

```text
tools/bundled-record-wf-trial-skill/reference.md   # readout contract item 12 + rationale subsection
tools/bundled-record-wf-trial-skill/SKILL.md       # Grade step cross-link
docs/demos/catalog-traditional-workflow-trial-prompts.md
docs/demos/trial-readout-PROMPT-WF-*.md            # backfill (rationale only)
tools/bootstrap/lib/trial-readout-grading-rationale-contract.test.mjs
tools/bootstrap/lib/read-trial-readout-session-grading.mjs  # shared parser (IMPL)
tied-project/requirements|architecture|implementation-decisions/  # build-plan
tied-project/vocab/project-operations-mcp.md         # RECORD
```

---

## Acceptance criteria (build-plan maps to tests)

| ID | Criterion | Verification |
| --- | --- | --- |
| **SC-GR-01** | Reference includes **Session grading rationale** rules + A and A− examples | `T-GR-REF-01` in contract test |
| **SC-GR-02** | SKILL **Grade** step references rationale subsection | `T-GR-SKILL-01` |
| **SC-GR-03** | Catalog facilitator grading adds rationale bullet list | `T-GR-CAT-01` |
| **SC-GR-04** | All PROMPT-WF readouts: 7 rows, no empty/`—` rationale; sub-A meets floor | `T-GR-READOUTS-01` (glob + parser) |
| **SC-GR-05** | Bands unchanged vs facilitator intent (registry compact string spot-check) | Manual: 3 registry rows + WF-08 pair in close-out evidence |

Maps sponsor AC-1..AC-5 from linked Cursor plan.

---

## Implementation phases (`@build-plan`)

1. **RED** — Author `trial-readout-grading-rationale-contract.test.mjs` (fails on current corpus).
2. **TIED stack** — `tied_token_create_with_detail` for REQ/ARCH/IMPL; IMPL pseudo-code + sidecar with `[PROC-IMPL_PSEUDOCODE_TOKENS]` comments; `lint_yaml`; `tied_validate_consistency`.
3. **Normative docs** — reference, SKILL, catalog (small diffs).
4. **Parser module** — extract `## Session grading` table (7 data rows); export for test + optional future lint.
5. **Backfill** — Per file: draft rationales from on-readout evidence; shorten WF-08 exemplars; **do not** touch Band column.
6. **GREEN** — `node --test tools/bootstrap/lib/trial-readout-grading-rationale-contract.test.mjs`.
7. **Close-out** — `tied_validate_consistency`; spot-check readouts (1794048393, 1794205559 after, WF-08 luna-low + composer25).

---

## Dependencies

| Token | Relationship |
| --- | --- |
| [REQ-TRIAL_METHODOLOGY_VERSION_READOUT](tied-project/requirements/REQ-TRIAL_METHODOLOGY_VERSION_READOUT.yaml) | Prior facilitator readout contract pattern |
| `@record-wf-trial` skill bundle | Primary normative surface |
| [catalog-traditional-workflow-trial-prompts.md](docs/demos/catalog-traditional-workflow-trial-prompts.md) | Rubric source |

---

## Risk / depth

| Field | Value |
| --- | --- |
| `depth_tier` | minimal |
| `gate_policy` | advisory |
| `profile_depth` | minimal |
| `diff_scoped_crap` | false (large markdown backfill; facilitator docs only) |

| Risk | Mitigation |
| --- | --- |
| Retroactive rationale misstates facilitator intent | D-EVIDENCE-ONLY; no new factual claims |
| 84-file commit noise | Single thematic commit; SC-GR-04 prevents regression |
| Long rationale passes until backfill | RED test fails until corpus updated |

---

## Costly choices (sponsor accepted in linked plan)

- **Full WF corpus backfill in one build** — large diff; alternative phased by model batch rejected for regression completeness.
- **No automated registry ↔ Band lock** — AC-5 manual; machine test would require parsing registry compact grades.

---

## Authoritative paths

- **PLAN:** `tied-project/working/REQ-WF_TRIAL_READOUT_GRADING_RATIONALE/PLAN.md`
- **CITDP (draft):** `tied-project/working/REQ-WF_TRIAL_READOUT_GRADING_RATIONALE/CITDP-REQ-WF_TRIAL_READOUT_GRADING_RATIONALE.draft.yaml`
- **Tracker:** `tied-project/working/REQ-WF_TRIAL_READOUT_GRADING_RATIONALE/checklist-tracker.yaml`
- **Test strategy:** `tied-project/working/REQ-WF_TRIAL_READOUT_GRADING_RATIONALE/test-strategy.md`
- **Handoff:** `tied-project/working/REQ-WF_TRIAL_READOUT_GRADING_RATIONALE/evidence/session-handoff.md`
