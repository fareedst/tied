# Session handoff — REQ-TIED_PROJECT_SIZE_LAYERS

**handoff_kind:** session  
**request_token:** REQ-TIED_PROJECT_SIZE_LAYERS  
**date:** 2026-11-09  
**plan_phase:** closed (close-out 2026-11-09, commit `f9e2e23a`)  
**prompt_type:** refine-plan (after add-feature via Cursor plan)  
**traceable_commit:** (pending — no implementation commit this session)

---

## Plan spine

| Field | Value |
| --- | --- |
| **PLAN** | [../PLAN.md](../PLAN.md) |
| **plan_phase** | `pre-implementation` |
| **profile_depth** | `minimal` |
| **gate_policy** | `advisory` |
| **Cursor plan** | `tied_size_layers_metrics_2065fc7d` |
| **Workflow** | add-feature (design) → refine-plan → **build-plan** → close-out |

**Program intent:** Three-layer TIED project size — **atoms**, **operational intent**, **proof facets** — MCP-first `tied_project_size_snapshot`; human metrics in **YAML**; cohort append **JSONL**; WF trial science hook via `record-wf-trial`. Operational intent metrics **co-update** with pseudo-code hash.

---

## Authoritative refs

| Artifact | Path |
| --- | --- |
| Tracker | [../checklist-tracker.yaml](../checklist-tracker.yaml) |
| CITDP (draft) | [../CITDP-REQ-TIED_PROJECT_SIZE_LAYERS.draft.yaml](../CITDP-REQ-TIED_PROJECT_SIZE_LAYERS.draft.yaml) |
| Test strategy | [../test-strategy.md](../test-strategy.md) |
| Adversarial N/A | [sub-adversarial-inquiry-pass-na.md](./sub-adversarial-inquiry-pass-na.md) |
| REQ detail | `tied-project/requirements/REQ-TIED_PROJECT_SIZE_LAYERS.yaml` |
| Vocab RECORD | `tied-project/vocab/tied-methodology.md` (size layer rows) |

**pre_implementation gate:** `ok: true` (2026-11-09, tracker + CITDP adversarial block).

---

## Plan execution steps

**Last updated:** 2026-11-09 · **prompt_type:** refine-plan · **PLAN:** ../PLAN.md

### Required

- [x] impl-pseudocode-slices — Sidecars for IMPL-TIED_PROJECT_SIZE_SNAPSHOT, RECORD_WF_TRIAL, COHORT_JSONL
- [x] docs-registry — `project-size-metrics.registry.yaml` + `catalog-tied-size-and-trial-statistics.md`
- [x] mcp-project-size — RED/GREEN `mcp-server/src/project-size/` + `tied_project_size_snapshot`
- [x] record-wf-trial-wire — Reference + contract test; cohort append helper `appendWfTrialCohortRun`
- [x] dogfood-snapshot — [project-size-snapshot-store-dogfood.v1.json](./project-size-snapshot-store-dogfood.v1.json)
- [x] consistency-close — `tied_verify` + close-out gates + commit `f9e2e23a`

### Optional

- [ ] registry-columns — Extend `traditional-workflow-trial-runs-registry.md` after schema stable
- [ ] semantic-tokens-rows — Explicit `semantic-tokens.yaml` rows if validation flags gaps
- [ ] cohort-backfill — ~102 historical WF rows (D-C4 out of v1 scope)

### Recommendations

- Reconfirm `tied_config_get_base_path` = `{store}/tied-project/` before MCP YAML writes in build-plan.
- No leaderboard / maturity score language in catalog or readouts.

### Changelog (this REQ)

- 2026-11-09 add-feature (Cursor): problem, three layers, MCP-first, storage policy YAML vs JSONL.
- 2026-11-09 refine-plan: working folder, TIED enrollment, D-C1…D-C4, gate pass, vocab RECORD.

---

## Environment

| Key | Value |
| --- | --- |
| **execution_site** | TIED methodology **store** (`/Users/fareed/Documents/dev/chatgpt/stdd`) |
| **TIED_BASE_PATH** | `/Users/fareed/Documents/dev/chatgpt/stdd/tied-project` (MCP env; verified refine session) |
| **workspace_root** | Same store repo |
| **git** | Not inspected this handoff (sponsor paste-only policy) |

---

## Requirements and dependencies

**Primary:** `REQ-TIED_PROJECT_SIZE_LAYERS`

**ARCH / IMPL:**

- `ARCH-TIED_PROJECT_SIZE_SNAPSHOT`
- `IMPL-TIED_PROJECT_SIZE_SNAPSHOT`
- `IMPL-TIED_PROJECT_SIZE_RECORD_WF_TRIAL`
- `IMPL-TIED_PROJECT_SIZE_COHORT_JSONL`

**depends_on:** `REQ-TIED_CORPUS_COMPREHENSION`, `REQ-PSEUDOCODE_STATIC_ANALYSIS`, `REQ-TIED_SETUP`

**related_to:** WF trial stack (`REQ-WF_TRIAL_*`, `record-wf-trial`, orchestrator manifest)

---

## Related and pending prior requests

| id | kind | status | blocks_current | evidence_link |
| --- | --- | --- | --- | --- |
| chat-size-design | design | done | no | This thread `/xlate` + plan catalog sections A–I |
| D-C4-backfill | follow-on | pending | no | PLAN § D-C4 forward-only |
| TODO-11-07-vocab-size | note | pending | no | `TODO.md` vocab-point sizing idea — subsumed by this REQ |

---

## Finished this session

- Cursor **add-feature** plan: atoms / operational intent / proof facets; co-update rule; trial statistics catalog outline; MCP-first delivery.
- Sponsor lock: **YAML** human-maintained metrics; **JSON/JSONL** machine output only.
- **`@refine-plan`:** [PLAN.md](../PLAN.md), CITDP draft, tracker, test-strategy, adversarial N/A evidence.
- TIED MCP enrollment: REQ + ARCH + 3 IMPL tokens (Draft).
- Vocab RECORD in `tied-methodology.md` for three size layers + snapshot paths.
- `pre_implementation` checklist gate **allowed**.

**Not done:** Product code, RED tests, IMPL pseudo-code sidecars, catalog/registry files on disk, `record-wf-trial` edits, commit.

---

## Completion signals (this session)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | pass | `closeout-run-close-out-gates-final.json`, envelope `blocking_gap_count=0` |
| **Process contract** | partial | manifest + build-plan evidence; minimal tracker |
| **Adherence ledger** | partial | thin_ledger / legacy_no_adherence_chain (minimal depth) |

---

## Do next

1. **`@build-plan`** with attached [`tied-project/working/REQ-TIED_PROJECT_SIZE_LAYERS/PLAN.md`](../PLAN.md) and Tracker [`checklist-tracker.yaml`](../checklist-tracker.yaml).
2. Start with IMPL pseudo-code sidecars, then RED tests per [test-strategy.md](../test-strategy.md).
3. After GREEN: optional `@close-out` on same REQ when verification allows.

---

## Constraints

- Evidence-only MCP; **proof_boundary** on every receipt; no REQ status from snapshot alone.
- Do not hand-edit `runs.jsonl` for policy — change `tied-project/config/project-size-metrics.registry.yaml`.
- No WF grading weight or leaderboard changes in v1.
- No mandatory historical WF backfill (D-C4).

---

## Repeatable verification

```bash
# After build-plan (future)
cd mcp-server && npm test -- --test-name-pattern 'project-size'
```

Gate replay (plan mode):

```text
tied_checklist_gate_validate phase=pre_implementation tracker_path=tied-project/working/REQ-TIED_PROJECT_SIZE_LAYERS/checklist-tracker.yaml
```
