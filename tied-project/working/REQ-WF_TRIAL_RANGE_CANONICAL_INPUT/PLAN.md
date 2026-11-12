# PLAN — [REQ-WF_TRIAL_RANGE_CANONICAL_INPUT]

**Workflow:** add-feature → **`refine-plan` (this doc)** → `@build-plan` → `@close-out`  
**Request token:** `REQ-WF_TRIAL_RANGE_CANONICAL_INPUT`  
**plan_phase:** `pre-implementation`  
**profile_depth:** `minimal` · **gate_policy:** `advisory`

**Related:** [REQ-WF_TRIAL_MODEL_COMPOSE](../../requirements/REQ-WF_TRIAL_MODEL_COMPOSE.yaml) · [REQ-WF_TRIAL_MODEL_CATALOG_RESOLVE](../../requirements/REQ-WF_TRIAL_MODEL_CATALOG_RESOLVE.yaml) · [REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG](../../requirements/REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG.yaml) · [docs/cursor-and-claude-model-catalog.md](../../../docs/cursor-and-claude-model-catalog.md)

**CITDP:** [CITDP-REQ-WF_TRIAL_RANGE_CANONICAL_INPUT.yaml](./CITDP-REQ-WF_TRIAL_RANGE_CANONICAL_INPUT.yaml)  
**Test strategy:** [test-strategy.md](./test-strategy.md)  
**Tracker:** [checklist-tracker.yaml](./checklist-tracker.yaml)  
**Cursor plan:** `.cursor/plans/wf_trial_range_input_60c8dc29.plan.md`

---

## 1. Refine (Touchpoint 1 — RESOLVE) — closed 2026-11-12

| Sponsor term | Resolved concept | Disposition |
| --- | --- | --- |
| **Canonical input** | `HARNESS` + `MODEL_REF` + `EFFORT` each entered once for compose paths | **Locked** |
| **Catalog allowlist** | Every resolved `MODEL_SLUG` ∈ committed [`wf-trial-model-catalog.yaml`](../../../docs/demos/wf-trial-model-catalog.yaml) (same universe as [cursor-and-claude-model-catalog.md](../../../docs/cursor-and-claude-model-catalog.md)) | **Locked** |
| **grok-4.7 operator ref** | Dotted compose family key `grok-4.7` (parity with `grok47`) | **Locked** |
| **Dirname dedup** | Rule **D-TAG-SINGLE-TIER**: no `MODEL_EFFORT` suffix when tier already in `MODEL_CONFIG` | **Locked** |
| **Legacy dirs** | Existing `*medmedium` clients unchanged on disk | **Locked** — forward-only |
| **Grok 4.5 compose** | Out of scope | **Deferred** |

**Costly choice:** LEAP updates [SC-TAG-EFFORT](tied-project/requirements/REQ-WF_TRIAL_MODEL_EFFORT.yaml) / [SC-WF-TAG-EFFORT-SUFFIX](tied-project/requirements/REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG.yaml) to describe tiered-config exception (composer-2.5 unchanged).

---

## 2. Problems

| Symptom | Cause |
| --- | --- |
| `workflow_trial_range cursor grok-4.7 low …` → `unknown model ref` | Compose map has `grok47` only ([`wf-trial-model-specs.yaml`](../../../docs/demos/wf-trial-model-specs.yaml)) |
| `…-cursor-grok46medmedium` | [`normalize_wf_trial_model_suffix`](../../../scripts/lib/wf-trial-disposable-tag.inc.sh) appends full `MODEL_EFFORT` after tiered `MODEL_CONFIG` |

---

## 3. Locked input scheme

Positional: `workflow_trial_range HARNESS MODEL_REF EFFORT END START [MONIT]` (unchanged).

| Path | `MODEL_REF` | `EFFORT` |
| --- | --- | --- |
| **Compose (preferred)** | Family / catalog base: `luna`, `grok46`, `grok47`, **`grok-4.7`**, `cursor-grok-4.6`, `sol`, `composer-2.5` | Required tier |
| **Tier-embedded** | Matrix id (`luna-low`, `grok47-med`) or full catalog slug | **`-`** only |

**Fail closed:** tiered id + conflicting effort; composed slug ∉ catalog.

**Normative examples (post build):**

```bash
workflow_trial_range cursor grok-4.7 low 1 1
# MODEL_SLUG=grok-4.7-low-fast  MODEL_CONFIG=grok47-low  tag …-cursor-grok47low

workflow_trial_range cursor grok46 medium 1 1
# MODEL_SLUG=cursor-grok-4.6-medium-fast  MODEL_CONFIG=grok46-med  tag …-cursor-grok46med
```

---

## 4. Locked decisions

| ID | Decision |
| --- | --- |
| **D-TAG-SINGLE-TIER** | `disposable_model_bucket` from resolver; tag builder does not double-append effort for tiered `MODEL_CONFIG` |
| **D-COMPOSE-DOTTED-GROK47** | Compose key `grok-4.7` shares `grok47` rules (`catalog_base: grok-4.7`) |
| **D-CATALOG-GATE-DOC** | Errors cite catalog YAML + [cursor-and-claude-model-catalog.md](../../../docs/cursor-and-claude-model-catalog.md) refresh steps |
| **D-BUCKET-EXPORT** | `wf_trial_resolve_model_ref` exports `WF_TRIAL_DISPOSABLE_MODEL_BUCKET` for shell tag build |

---

## 5. Modules

| Module | Path |
| --- | --- |
| Compose registry | [`docs/demos/wf-trial-model-specs.yaml`](../../../docs/demos/wf-trial-model-specs.yaml) |
| Resolver + bucket | [`tools/bootstrap/lib/wf-trial-model-spec.mjs`](../../../tools/bootstrap/lib/wf-trial-model-spec.mjs) |
| Shell bridge | [`scripts/lib/wf-trial-model-spec.inc.sh`](../../../scripts/lib/wf-trial-model-spec.inc.sh) |
| Disposable tag | [`scripts/lib/wf-trial-disposable-tag.inc.sh`](../../../scripts/lib/wf-trial-disposable-tag.inc.sh) |
| Tests | [`wf-trial-model-spec.test.mjs`](../../../tools/bootstrap/lib/wf-trial-model-spec.test.mjs), [`wf-trial-model-compose.test.mjs`](../../../tools/bootstrap/lib/wf-trial-model-compose.test.mjs), [`workflow-trial-agentstream-sh.test.mjs`](../../../tools/bootstrap/workflow-trial-agentstream-sh.test.mjs) |
| Docs | [`docs/workflow-trials.md`](../../../docs/workflow-trials.md), [`scripts/build-commands.sh`](../../../scripts/build-commands.sh) usage |

---

## 6. Acceptance criteria

| ID | Criterion |
| --- | --- |
| SC-WRC-01 | `workflow_trial_range cursor grok-4.7 low …` → `grok-4.7-low-fast` ∈ catalog |
| SC-WRC-02 | Compose path tag: `grok46med` not `grok46medmedium` |
| SC-WRC-03 | `grok47-med` + `medium` fails |
| SC-WRC-04 | Compose family × effort matrix test vs catalog |
| SC-WRC-05 | Usage + shell tests document `grok-4.7` |

---

## 7. Build sequence (`@build-plan`)

| Step | Deliverable |
| --- | --- |
| 1 | RED tests SC-WRC-01…05 |
| 2 | Compose `grok-4.7` key; `deriveDisposableModelBucket`; resolver JSON field |
| 3 | Shell export + disposable tag inc.sh |
| 4 | Docs + vocab RECORD |
| 5 | LEAP parent REQ satisfaction rows if needed; CITDP persist; `tied_validate_consistency` |

---

## 8. Out of scope

- Grok 4.5 compose families
- Migrating existing disposable dirname on disk
- New CLI arity or subcommands
- Comparison Summary table (unrelated)

---

## 9. Risk

| Item | Ladder |
| --- | --- |
| Facilitator readouts reference old dirname pattern | **Reversible** |
| Stale catalog vs `agent models` | **Reversible** — sync script |
| SC-TAG-EFFORT wording change | **Costly** — coordinate in same close-out |

---

## Handoff

**Do next:** `@build-plan` with this PLAN and [session-handoff](./evidence/session-handoff.md).
