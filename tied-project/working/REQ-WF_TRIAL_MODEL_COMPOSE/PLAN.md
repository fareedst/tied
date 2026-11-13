# PLAN — [REQ-WF_TRIAL_MODEL_COMPOSE] (refine-plan)

**Status:** Wave 1 close-out complete (`0ad209be`); **Wave 2 Grok 4.6 compose** implemented in-tree, pending LEAP close-out  
**Workflow:** add-feature → **refine-plan** → `@close-out` (Wave 2)  
**Request token:** `REQ-WF_TRIAL_MODEL_COMPOSE`  
**plan_phase:** `post-build` (Wave 2)  
**profile_depth:** `minimal` · **gate_policy:** `advisory`

**Related:** [REQ-WF_TRIAL_MODEL_CATALOG_RESOLVE](../../requirements/REQ-WF_TRIAL_MODEL_CATALOG_RESOLVE.yaml) · [REQ-WF_TRIAL_MODEL_EFFORT](../../requirements/REQ-WF_TRIAL_MODEL_EFFORT.yaml) · [REQ-WF_TRIAL_MODEL_SPEC_CLI](../../requirements/REQ-WF_TRIAL_MODEL_SPEC_CLI.yaml)

**CITDP:** [CITDP-REQ-WF_TRIAL_MODEL_COMPOSE.yaml](./CITDP-REQ-WF_TRIAL_MODEL_COMPOSE.yaml)  
**Test strategy:** [test-strategy.md](./test-strategy.md)  
**Tracker:** [checklist-tracker.yaml](./checklist-tracker.yaml)

---

## 1. Refine (Touchpoint 1 — RESOLVE) — closed (Wave 2 addendum)

| Sponsor term | Resolved concept | Disposition |
| --- | --- | --- |
| **Compose family** | Short `MODEL_REF` (`luna`, `grok46`, `grok47`, `sol`, `composer-2.5`, `cursor-grok-4.6`) | **Locked** — registry `compose:` in specs YAML |
| **Grok 4.6 slug** | Catalog uses `cursor-grok-4.6-{effort}-fast` (not bare `cursor-grok-4.6`) | **Locked** — compose `catalog_base: cursor-grok-4.6` |
| **Grok 4.6 config bucket** | Disposable tag / `MODEL_CONFIG` prefix `grok46-{tier}` (`medium` → `grok46-med`) | **Locked** — mirrors `grok47-*` pattern |
| **Effort (Cursor)** | Single tier source for slug + `MODEL_EFFORT` | **Locked** — 3rd positional; required when family is compose |
| **Alternate refs** | Full catalog slug or tiered id still valid; `EFFORT=-` when tier embedded | **Locked** — unchanged catalog/matrix paths |
| **Claude** | API base id + `MODEL_EFFORT` | **Locked** — unchanged |

**Wave 2 sponsor intent (2026-11-12):** `workflow_trial_range cursor cursor-grok-4.6 low 10 10` must resolve to `MODEL_SLUG=cursor-grok-4.6-low-fast`. Any operator input is acceptable if the final slug matches the committed catalog.

---

## 2. Problem (Wave 1 — unchanged)

`workflow_trial_range cursor gpt-5.6-luna-low-fast medium 1 1` encodes **low** in `MODEL_SLUG` and **medium** in `MODEL_EFFORT`. [cursorSlugMayMismatchEffort](mcp-server/packages/agentstream/src/model-effort.ts) treats that as ambiguous. Operators want:

```bash
workflow_trial_range cursor luna medium 2 2
# → MODEL_SLUG=gpt-5.6-luna-medium-fast, MODEL_CONFIG=luna-med, MODEL_EFFORT=medium
```

## 2b. Problem (Wave 2)

[`docs/workflow-trials.md`](../../../docs/workflow-trials.md) documents `workflow_trial_range cursor cursor-grok-4.6 low …`, but Wave 1 compose families omitted Grok 4.6. Resolver failed with `unknown model ref: cursor-grok-4.6` because only tiered slugs exist in the catalog (e.g. `cursor-grok-4.6-low-fast`).

---

## 3. Compose registry (normative)

[wf-trial-model-specs.yaml](../../../docs/demos/wf-trial-model-specs.yaml) — **schema `wf-trial-model-spec.v2`**.

```yaml
compose:
  luna: { catalog_base: gpt-5.6-luna, model_config_prefix: luna, speed_suffix: fast }
  grok47: { catalog_base: grok-4.7, model_config_prefix: grok47, speed_suffix: fast }
  grok46:
    catalog_base: cursor-grok-4.6
    model_config_prefix: grok46
    speed_suffix: fast
  cursor-grok-4.6:   # alias family key — same rules as grok46
    catalog_base: cursor-grok-4.6
    model_config_prefix: grok46
    speed_suffix: fast
  sol: { catalog_base: gpt-5.6-sol, model_config_prefix: sol, speed_suffix: fast }
  composer-2.5:
    catalog_base: composer-2.5
    model_config_prefix: composer-2.5
    speed_suffix: fast
    effort_in_slug: false
```

**Allowed effort tiers:** `low`, `medium`, `high`, `xhigh`, `max`.

---

## 4. `model_config` abbreviation (locked)

| Effort | `luna` / `sol` | `grok47` | `grok46` |
| --- | --- | --- | --- |
| `low` | `luna-low` | `grok47-low` | `grok46-low` |
| `medium` | `luna-med` | `grok47-med` | `grok46-med` |
| `high` | `luna-high` | `grok47-high` | `grok46-high` |
| `xhigh` | `luna-xhigh` | `grok47-xhigh` | `grok46-xhigh` |
| `max` | `luna-max` | `grok47-max` | `grok46-max` |

Slug tier token in catalog remains full effort name (`cursor-grok-4.6-medium-fast`, not `med`).

---

## 5. Resolution algorithm

Unchanged from Wave 1 (alias → compose → matrix → catalog → fail). Compose step uses same `composeCursorCatalogSlug` with catalog gate.

**Wave 2 examples:**

```bash
workflow_trial_range cursor cursor-grok-4.6 low 10 10
# MODEL_SLUG=cursor-grok-4.6-low-fast, MODEL_CONFIG=grok46-low, MODEL_EFFORT=low

workflow_trial_range cursor grok46 medium 1 1
# MODEL_SLUG=cursor-grok-4.6-medium-fast, MODEL_CONFIG=grok46-med

workflow_trial_range cursor cursor-grok-4.6-low-fast - 1 1
# catalog path; MODEL_CONFIG from catalog row (cursor-grok-4.6)
```

---

## 6. Locked decisions (Wave 1 + Wave 2)

| ID | Decision |
| --- | --- |
| **D-COMPOSE-SINGLE-TIER** | For compose families, slug tier and `MODEL_EFFORT` use the same operator effort string |
| **D-COMPOSE-CATALOG-GATE** | Composed slug must exist in committed catalog |
| **D-COMPOSE-GROK46-BASE** | Grok 4.6 compose uses `cursor-grok-4.6` catalog base (matches `agent models`) |
| **D-COMPOSE-GROK46-ALIAS** | Family keys `grok46` and `cursor-grok-4.6` are equivalent for compose |
| **D-COMPOSE-OUT-GROK45** | Grok 4.5 compose deferred unless sponsor requests (`cursor-grok-4.5-*` slugs differ) |

---

## 7. Modules (Wave 2 — status)

| Module | Path | Wave 2 |
| --- | --- | --- |
| Compose registry | `docs/demos/wf-trial-model-specs.yaml` | **done** |
| Compose logic | `tools/bootstrap/lib/wf-trial-model-compose.mjs` | unchanged |
| Resolver | `tools/bootstrap/lib/wf-trial-model-spec.mjs` | unchanged |
| Shell usage | `scripts/build-commands.sh` | **done** (usage lists grok46) |
| Tests | compose, spec, shell `SC-COMPOSE-GROK46` | **done** |
| REQ criterion | `tied-project/requirements/REQ-WF_TRIAL_MODEL_COMPOSE.yaml` | **done** (`SC-COMPOSE-GROK46`) |
| Vocab / trial catalog docs | `agentstream.md`, `catalog-traditional-workflow-trial-prompts.md` | **done** |

---

## 8. Close-out order (Wave 2)

1. Re-run verification manifest (three test files)  
2. LEAP: update working CITDP desired_behavior + persist `tied-project/citdp/CITDP-REQ-WF_TRIAL_MODEL_COMPOSE.yaml` at close-out  
3. IMPL pseudo-code — append Wave 2 compose families if token comments missing ([PROC-IMPL_PSEUDOCODE_TOKENS])  
4. `tied_validate_consistency`  
5. Scoped commit + optional `@close-out` receipt  

**Not required:** new compose module; catalog regen (slugs already present).

---

## 9. Out of scope

- `cursor-grok-4.5` compose family  
- Matrix row `grok46-med` (compose-only; no matrix parity requirement unlike `grok47-med`)  
- Claude harness changes  

---

## Do next

**`@close-out`** — Wave 2 LEAP + verification + scoped commit ([evidence/session-handoff.md](./evidence/session-handoff.md))
