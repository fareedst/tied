# PLAN — Agent harness evaluation docs corpus

**Trial context:** TIED methodology **store** repo — relocate facilitator **workflow trial + HMEP** benchmarking markdown from `docs/demos/` and cohort summary from `tied-project/non-tied-plans/.../evidence/`.

| Field | Value |
| --- | --- |
| **Request token** | `REQ-AGENT_HARNESS_EVALUATION_DOCS` (mint at `@build-plan`) |
| **working_slug** | `REQ-AGENT_HARNESS_EVALUATION_DOCS` |
| **`plan_phase`** | `post-build` |
| **Workflow** | `@add-feature` → **`@refine-plan` (this pass)** → `@build-plan` → `@close-out` |
| **Linked Cursor plan** | `agent_harness_eval_docs_92ce93ce.plan.md` |
| **Tracker** | [checklist-tracker.yaml](./checklist-tracker.yaml) |
| **Test strategy** | [test-strategy.md](./test-strategy.md) |
| **CITDP (draft)** | [CITDP-REQ-AGENT_HARNESS_EVALUATION_DOCS.draft.yaml](./CITDP-REQ-AGENT_HARNESS_EVALUATION_DOCS.draft.yaml) |

**Vocabulary PRELOAD:** [`harness-platform-taxonomy.md`](../../vocab/harness-platform-taxonomy.md) (routing row **2c**). Corpus prose uses **vendor agent harness**, **harness profile**, **model configuration**, **workflow trial orchestrator** — not informal “drivers.”

**Sponsor outcome (locked):** Facilitators and sponsors find WF trial readouts, registries, size cohort summary, and HMEP fixtures under **`docs/agent-harness-evaluation/`**; generic exercise catalogs stay in **`docs/demos/`**. Bootstrap skills (`@record-wf-trial`, `@publish-wf-trial-summaries`) and regen CLIs resolve paths via one module.

---

## Problem statement

| Surface | Current | Desired |
| --- | --- | --- |
| Audience mix | `docs/demos/` bundles TIED exercise pickers with ~150+ WF readouts | Split: demos = adopters; agent-harness-evaluation = facilitators |
| Cohort summary | [`comparison-table.md`](../../non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md) under non-tied evidence | Human summary beside catalogs in `docs/` |
| Vocab AHE links | [`harness-platform-taxonomy.md`](../../vocab/harness-platform-taxonomy.md) updated in slice 4; [`agentstream.md`](../../vocab/agentstream.md) still cited `docs/demos/` config YAML → **`validate_vocab`** fail | RECORD all owning glossaries that embed WF config paths (slice **4b**) |
| Tooling | ~20 bootstrap + 9 harness-eval files hardcode `docs/demos/` | `agent-harness-eval-docs-paths.mjs` |

---

## Locked decisions (refine-plan 2026-11-14)

| ID | Decision |
| --- | --- |
| **D-ROOT** | Committed root `docs/agent-harness-evaluation/` (sponsor “evaluation” umbrella; README disambiguates vs vendor harness) |
| **D-LAYOUT** | Subdirs: `catalogs/`, `registries/`, `config/`, `cohort/` (+ `cohort/evidence/` for manifest + receipts), `analysis/`, `readouts/`, `harness-eval/` |
| **D-COHORT-OUT** | `project-size-batch-compare.mjs` default out → `cohort/evidence/`; **`comparison-table.md`** written to `cohort/` parent (adjust render/batch compare if needed) |
| **D-RECEIPTS-COMOVE** | Co-move `manifest.v1.json` + `receipts/*.json` with cohort (discoverable package); update non-tied plan pointer |
| **D-READOUTS-FLAT** | All `trial-readout-*.md` (WF + GF + CUSTOM) under `readouts/` — glob remains basename-based |
| **D-DEMOS-KEEP** | Keep `catalog-compact-*`, `catalog-tied-compact-tools`, `catalog-greenfield-plan-new-feature-prompts` in `docs/demos/` |
| **D-STUBS** | One-paragraph stub files at former `docs/demos/catalog-traditional-workflow-trial-prompts.md`, `traditional-workflow-trial-runs-registry.md`, `catalog-tied-size-and-trial-statistics.md` (redirect only) |
| **D-CHANGELOG** | Do **not** rewrite historical CHANGELOG bullets; fix active tools/skills/vocab only |
| **D-HPS-COMPOSE** | Same commit as mv: RECORD taxonomy, harness-metering-canary, optional routing/domain-references corpus pointer; extend vocab contract for catalog link targets |
| **D-HMEP-BOUNDARY** | Move `harness-eval/` samples only; do not merge `@record-wf-trial` grading into HMEP import |
| **D-FORBIDDEN** | Leaderboard framing, maturity_score, disposable client mutation, auto `git commit` |

**profile_depth:** `minimal` · **gate_policy:** `advisory` · **depth_tier:** `minimal` · **methodology_surface_change_class:** `prompt_type_workflow` (docs + path module)

---

## Satisfaction criteria (build-plan)

| ID | Criterion | Metric |
| --- | --- | --- |
| **SC-AHE-PATH-01** | `agent-harness-eval-docs-paths.mjs` exports AHE_* constants; layout contract test passes | `node --test` |
| **SC-AHE-MV-01** | WF catalogs, registry, readouts, analysis, config YAML, harness-eval tree present under `docs/agent-harness-evaluation/` | `test -d` + spot readout count |
| **SC-AHE-TOOL-01** | `@publish-wf-trial-summaries` / `wf-trial-summaries-publish.mjs --check` uses new paths (no `docs/demos/trial-readout` in generators) | grep bootstrap + `--check` |
| **SC-AHE-VOCAB-01** | Taxonomy glossary catalog + model YAML links target AHE paths | vocab contract test |
| **SC-AHE-VOCAB-02** | **`agentstream.md`** markdown links for four-phase batch + WF model catalog/spec resolve to `docs/agent-harness-evaluation/config/*.yaml` | `ruby scripts/validate_vocab_index.rb .` (test-all step 7) |
| **SC-AHE-DEMOS-01** | `docs/demos/README.md` links AHE README; no full WF readout table | File audit |
| **SC-AHE-CONSIST-01** | New REQ/ARCH/IMPL + `related_to` HPT, HMEP, WF_TRIAL_SUMMARIES_PUBLISH; `tied_validate_consistency` clean for new tokens | MCP |

---

## Phased slices (`@build-plan` executes)

### Slice 0 — TIED tokens

Mint **`REQ-AGENT_HARNESS_EVALUATION_DOCS`**, **`ARCH-AGENT_HARNESS_EVALUATION_DOCS`**, **`IMPL-AGENT_HARNESS_EVALUATION_DOCS_PATHS`**; IMPL pseudo-code for path module + batch-compare out split.

### Slice 1 — Path module (TDD)

1. RED: `agent-harness-eval-docs-paths.contract.test.mjs` (expected relative paths).
2. GREEN: `agent-harness-eval-docs-paths.mjs`.
3. Wire **one** consumer (`wf-trial-catalog-readout-links.mjs`) to prove import pattern.

### Slice 2 — Corpus `git mv`

Create tree; `git mv` from `docs/demos/` and `docs/workflow-trials.md`; move cohort evidence from `tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/`.
Add **`docs/agent-harness-evaluation/README.md`** (audience, three-layer link to taxonomy).

### Slice 3 — Tooling wire-up

Update remaining bootstrap modules, harness-eval package + contracts, shell help, bundled facilitator skills (store copies + `tools/bundled-*`), `scripts/build-commands.sh` references.
Adjust `project-size-batch-compare.mjs` DEFAULT_OUT + comparison-table parent write.

### Slice 4 — Vocab RECORD + demos slim

Per vocab table in Cursor plan; stubs in `docs/demos/`; GF catalog readout links → `../agent-harness-evaluation/readouts/...`.

### Slice 4b — `agentstream.md` link gap (hotfix + guard)

**Failure (2026-11-14):** `test-all` step 7 **`validate_vocab`** — `tied-project/vocab/agentstream.md` still linked `../../docs/demos/traditional-four-phase-agentstream.yaml` and `../../docs/demos/wf-trial-model-catalog.yaml` after config YAML moved with **`agent-harness-eval-docs-paths.mjs`**. **`harness-platform-taxonomy.md`** was updated in slice 4; **`agentstream.md`** was omitted (**reversible** drift; same root cause as problem row “Taxonomy links”).

| Step | Status | Owner |
| --- | --- | --- |
| RECORD paths + relative links in **`agentstream.md`** (four-phase batch, model spec, model catalog) | **done** (`@debug` 2026-11-14) | vocab Touchpoint 3 |
| **`validate_vocab_index.rb .`** exit 0 | **done** | close-out gate |
| **`vocab-agentstream-ahe-config-links.contract.test.mjs`** — no `docs/demos/` links for moved config YAML; AHE prose + resolvable markdown links | **done** (`@build-plan` T-AHE-VOCAB-02) | T-AHE-VOCAB-02 |
| Active doc: **`docs/cursor-and-claude-model-catalog.md`** compare link → AHE catalog (optional slice 5c; not gated by validate_vocab) | **pending** | facilitator |

**Non-goals:** CITDP archives, closed working PLANs, historical CHANGELOG (`D-CHANGELOG`).

### Slice 5 — Link sweep + regen

`rg` active paths; fix skills/README; update non-tied PLAN.
Run `wf-trial-summaries-publish.mjs` (dry-run then full if sponsor wants).

### Slice 6 — Close-out

`node --test` on touched modules; `tied_validate_consistency`; vocab VALIDATE; facilitator commit when sponsor asks.

---

## Module boundaries

```text
docs/agent-harness-evaluation/              # new corpus (committed)
docs/demos/                                 # slim index + stubs + exercise catalogs
tools/bootstrap/lib/agent-harness-eval-docs-paths.mjs
tools/bootstrap/lib/agent-harness-eval-docs-paths.contract.test.mjs
tools/bootstrap/lib/vocab-agentstream-ahe-config-links.contract.test.mjs
tools/bootstrap/lib/*.mjs                   # wf-trial + project-size consumers
mcp-server/packages/harness-eval/             # catalog paths
tools/bundled-record-wf-trial-skill/
tools/bundled-publish-wf-trial-summaries-skill/
tied-project/vocab/harness-platform-taxonomy.md
tied-project/vocab/agentstream.md
tied-project/requirements|architecture|implementation-decisions/
tied-project/non-tied-plans/project-size-batch-discover-compare/PLAN.md
```

**Related tokens (reuse):** [REQ-TIED_HARNESS_PLATFORM_TAXONOMY](../../requirements/REQ-TIED_HARNESS_PLATFORM_TAXONOMY.yaml), [REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM](../../requirements/REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM.yaml), [REQ-WF_TRIAL_SUMMARIES_PUBLISH](../../requirements/REQ-WF_TRIAL_SUMMARIES_PUBLISH.yaml).

**LEAP note:** Moving docs does not reopen HPT implementation status; RECORD glossary path fixes only.

---

## refine-plan delta (2026-11-14)

- Materialized linked plan from `@add-feature` + taxonomy RECORD pass.
- Locked **D-RECEIPTS-COMOVE** and **D-STUBS** (costly choice: large `rg` surface mitigated by stubs + path module).
- Sequenced TDD path module **before** mass `git mv` to reduce broken intermediate state.

## refine-plan delta (2026-11-14 — `@debug` vocab hotfix)

- **RESOLVE:** Sponsor “change above” = **`validate_vocab`** regression from incomplete slice 4 — **`agentstream.md`** owns WF trial config path prose; must stay aligned with **`AHE_*`** module and **`validate_vocab_index.rb`** link resolution.
- **RECORD:** Hotfix landed on disk; **`SC-AHE-VOCAB-02`** added; slice **4b** documents gap vs **`SC-AHE-VOCAB-01`** (taxonomy-only contract was insufficient).
- **Risk:** **reversible** — prose-only; **costly** if repeated without contract — add **T-AHE-VOCAB-02** at build-plan or fold into close-out evidence.
- **`plan_phase`:** remains **`post-build`** (corpus mv complete; close-out blocked on sponsor commit, not on this vocab row).

## Do next

1. **`@close-out`** on `REQ-AGENT_HARNESS_EVALUATION_DOCS` with evidence: `validate_vocab`, `vocab-agentstream-ahe-config-links.contract.test.mjs`, existing AHE tests; commit **`agentstream.md`** + new test + working PLAN updates.
2. Optional slice **5c:** **`docs/cursor-and-claude-model-catalog.md`** compare link (not validate_vocab-gated).