# PLAN — [REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM]

**Workflow:** add-feature → **`refine-plan` (this doc)** → `@build-plan` → `@close-out`  
**Request token:** `REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM`  
**plan_phase:** `post-build` (M2 slice)  
**milestone:** M2 GREEN — close-out pending  
**profile_depth:** `minimal` · **gate_policy:** `advisory` (build-plan M2: **`integrated`** on pricing + verifier blocks)

**Origin:** Sponsor feature spec *Cursor / Claude Harness and Model Evaluation Platform* v1.0 (F-01…F-19, four milestones).  
**Cursor plan:** `.cursor/plans/harness_model_eval_platform_3b2ec5c2.plan.md`

**CITDP:** [CITDP-REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM.yaml](./CITDP-REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM.yaml)  
**Test strategy:** [test-strategy.md](./test-strategy.md)  
**Tracker:** [checklist-tracker.yaml](./checklist-tracker.yaml)

**Related (compose):** [REQ-GOAGENT-AGENT-EXECUTOR](../../requirements/REQ-GOAGENT-AGENT-EXECUTOR.yaml) · [REQ-TIED_CLAUDE_LIVE_DRIVER](../../requirements/REQ-TIED_CLAUDE_LIVE_DRIVER.yaml) · [REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG](../../requirements/REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG.yaml) · [REQ-TIED_HARNESS_PLATFORM_SEAM](../../requirements/REQ-TIED_HARNESS_PLATFORM_SEAM.yaml) · [catalog-traditional-workflow-trial-prompts.md](../../../docs/demos/catalog-traditional-workflow-trial-prompts.md) · **Metering canary:** [REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW](../REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW/PLAN.md) (`wf-meter-01`, [metering-canary-suite-v1.yaml](../../../docs/demos/harness-eval/suites/metering-canary-suite-v1.yaml))

---

## 1. Refine (Touchpoint 1 — RESOLVE) — pass 2 closed 2026-11-12

| Sponsor term | Resolved concept | Disposition |
| --- | --- | --- |
| **Compose vs replace WF trials** | New **`@tied/harness-eval`** package; **`workflow_trial_agentstream`** unchanged in M1 | **Locked** (sponsor) |
| **Package home** | `mcp-server/packages/harness-eval` | **Locked** |
| **Suite YAML location** | Committed under **`docs/demos/harness-eval/suites/`** (cohort science alongside WF catalog); runtime store separate | **Locked** — see **D-SUITE-LOCATION** |
| **Eval store root** | **`HARNESS_EVAL_STORE`** default `$TIED_STORE_ROOT/tied-bundle/reports/harness-eval/` | **Locked** — see **D-STORE-ROOT** |
| **Parser ownership** | Duplicate defensive parsers in harness-eval M1; no agentstream coupling | **Locked** — see **D-PARSER-DUP** |
| **WF import without JSONL** | Manifest-only import allowed: wall clock + config fingerprint; token fields **`null`**, not zero | **Locked** — see **D-WF-MANIFEST-ONLY** |
| **SQLite schema** | `schema_version` table + migration stub; M1 tables frozen at **v1** | **Locked** — costly choice acknowledged |
| **M1 CLI name** | Binary **`harness-eval`**; `scripts/build-commands.sh` helper optional in M1 close-out | **Locked** |

**Costly choices (no waiver required for build-plan start):**

1. SQLite v1 schema — post-M1 migration is operator-visible.
2. Parser duplication — LEAP proposal if extracting `stream-json-common` later.
3. Suite defs in `docs/demos/` — methodology-adjacent content versioned with WF trials.

---

## 2. Problems

| Symptom | Cause |
| --- | --- |
| Cursor vs Claude comparisons mix facilitator **grades**, **size layers**, and anecdotal exit codes | No canonical token/cost/timing model with provenance |
| Stream-json usage absent in reporting | [`executor-run.ts`](../../../mcp-server/packages/agentstream/src/executor-run.ts) parses session/text only |
| WF trials produce rich disposable evidence but no cross-harness query | Orchestrator manifest + optional trace JSONL not normalized |
| Missing metrics reported as zero in ad-hoc scripts | No `null` vs zero discipline in a shared store |

---

## 3. Locked decisions

| ID | Decision |
| --- | --- |
| **D-SUITE-LOCATION** | Suite/scenario YAML: [`docs/demos/harness-eval/suites/`](../../../docs/demos/harness-eval/suites/); JSON Schema: `mcp-server/contracts/harness-eval/` |
| **D-STORE-ROOT** | Default store `${TIED_STORE_ROOT}/tied-bundle/reports/harness-eval/` — `raw/`, `eval.sqlite`, append-only `imports.jsonl` receipt log |
| **D-PARSER-DUP** | `adapters/cursor`, `adapters/claude` own parsers; may read agentstream fixtures as golden inputs but not import runtime modules |
| **D-WF-MANIFEST-ONLY** | `harness-eval events import --wf-client <path>` reads `wf-trial-orchestrator-run.v1.json` + env from manifest; JSONL optional via repeated `--jsonl` |
| **D-CONFIG-FINGERPRINT** | SHA-256 over stable JSON of harness, harness_version, requested_model, effort, permission_policy, pricing_mode revision id |
| **D-PROOF-BOUNDARY** | Token/cost metrics never merged into `@record-wf-trial` prose in M1; reports cross-link readouts only |

---

## 4. Record hierarchy (normative)

`Suite > Scenario > Trial > PromptStep > Invocation > ModelRequest | ToolExecution`

Observations: **direct** | **harness_summary** | **derived** | **manual** | **estimate**.  
Cost fields (M2+): `harness_estimated_cost`, `normalized_list_price_cost`, `provider_reported_cost`, `actual_charged_cost` — each nullable independently.

---

## 5. Modules (M1 build-plan)

| Module | Path | Spec |
| --- | --- | --- |
| Package root | `mcp-server/packages/harness-eval/` | F-17 |
| Suite loader | `src/suite/` | F-01 |
| Configuration | `src/config/` | F-02 |
| Runner / import | `src/runner/`, `src/cli/import.ts` | F-03, F-16 subset |
| Adapters | `src/adapters/cursor/`, `src/adapters/claude/` | F-04, F-05 |
| Raw store | `src/raw-store/` | F-06 |
| Normalize + SQLite | `src/store/`, `src/normalize/` | F-07 |
| Tokens | `src/tokens/` | F-08 |
| CLI | `src/cli/` | F-17 subset |
| Fixtures | `fixtures/stream-json/` | F-19 |
| Contracts | `mcp-server/contracts/harness-eval/` | F-07 |
| Draft suite | `docs/demos/harness-eval/suites/engineering-suite-v1.yaml` | F-01 |

**Compose bridge — WF disposable client tree:**

| Artifact | Relative path on client |
| --- | --- |
| Orchestrator manifest | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| Optional turn trace | `tied-project/working/*/evidence/harness-turn-trace.jsonl` when `AGENTSTREAM_HARNESS_TRACE=1` |
| Stream-json (operator) | Explicit `--jsonl` (not persisted by agentstream by default) |

`trial_id` default: disposable dirname basename (e.g. `1794525072-wf-agentstream-wf-10-cursor-grok47med`).

---

## 6. Acceptance criteria (Milestone 1)

| ID | Criterion |
| --- | --- |
| SC-HMEP-M1-01 | Cursor fixtures with and without `usage` — normalized output never fabricates token counts |
| SC-HMEP-M1-02 | Claude resume cumulative usage → one trial total without double-count |
| SC-HMEP-M1-03 | Re-import same raw origin id is idempotent (no duplicate usage rows) |
| SC-HMEP-M1-04 | Incomplete token categories flagged; no silent sum when categories overlap |
| SC-HMEP-M1-05 | `harness-eval suite validate` fails on prompt content hash mismatch |
| SC-HMEP-M1-06 | `--wf-client` import round-trips manifest fields + configuration fingerprint |
| SC-HMEP-M1-07 | `harness-eval diagnostics` reports parser fixture coverage by harness label |
| SC-HMEP-M1-08 | JSON export or SQL query aggregates trials across `cursor` and `claude` without source JSONL |

## 6b. Acceptance criteria (Milestone 2 — this build-plan)

| ID | Criterion |
| --- | --- |
| SC-HMEP-M2-01 | Committed list-price catalog validates; unknown `model_slug` → `harness_estimated_cost` stays `null` (not `0`) |
| SC-HMEP-M2-02 | SQLite migrates v1→v2 with nullable cost columns; existing M1 rows preserved |
| SC-HMEP-M2-03 | After import with `completeness: complete` tokens, `harness_estimated_cost` derived from catalog revision recorded on trial |
| SC-HMEP-M2-04 | Suite `acceptance_checks` type `token_present` fails when `exit_code === 0` but zero observations |
| SC-HMEP-M2-05 | `harness-eval report cohort` aggregates trials by `wf_id` × `harness` with tokens, wall clock, estimated cost |
| SC-HMEP-M2-06 | `harness-eval verify trial` cross-links suite scenario `wf_id` with store row (no facilitator grade merge) |

**Still M3+:** provider billing APIs, `actual_charged_cost`, regression baselines (F-15–F-16).

---

## 7. Build sequence (`@build-plan` M1 — done)

| Step | Deliverable |
| --- | --- |
| 1 | Mint REQ/ARCH/IMPL + `semantic-tokens.yaml`; IMPL essence_pseudocode sidecar |
| 2 | `pseudocode_validate`; adversarial inquiry pass on adapter/token blocks (**integrated**) |
| 3 | RED: contract tests + SC-HMEP-M1-01…08 in `mcp-server/packages/harness-eval` |
| 4 | GREEN: schema v1 SQLite, raw store, adapters, normalize pipeline |
| 5 | CLI: `suite validate`, `events import`, `diagnostics`; draft `engineering-suite-v1.yaml` |
| 6 | `docs/demos/harness-eval/README.md` operator recipe (WF run → import → query) |
| 7 | Vocab `harness-model-eval.md` + routing row |
| 8 | CITDP persist to `tied-project/citdp/`; `tied_validate_consistency` |

**Thin `trial run` (optional M1 tail):** Subprocess wrapper that persists stream-json to raw store — only after import path GREEN.

---

## 8. Milestones (post-M1)

| Milestone | Features | Goal |
| --- | --- | --- |
| **M2** | F-09, F-11–F-14, F-18 | Verifiers, pricing catalog, comparative reports |
| **M3** | F-10 | Optional billing reconciliation |
| **M4** | F-15, F-16 | Regression baselines, full historical replay |

---

## 9. Explicit non-goals (M1)

- Web dashboard; centralized service; default-on billing credentials
- Replacing `tied agentstream` or WF orchestrator
- Leaderboard blending grades / proof facets with token metrics
- Inferring undisclosed model build IDs

---

## 7b. Build sequence (`@build-plan` M2)

| Step | Deliverable |
| --- | --- |
| 1 | LEAP REQ satisfaction + IMPL pseudo-code blocks for pricing, verify, report, schema v2 |
| 2 | `pseudocode_validate`; integrated inquiry on pricing + verifier blocks |
| 3 | RED: SC-HMEP-M2-01…06 |
| 4 | GREEN: catalog, migrate v2, cost attach on import, verify + report CLI |
| 5 | Contracts `harness-eval-pricing.schema.json`; update README operator recipe |
| 6 | Vocab + CITDP M2 delta; `tied_validate_consistency` |

---

## 10. Handoff

**Do next:** close-out when verification gate passes (M2).

**Operator smoke (post build):**

```bash
# After a WF disposable client run (optional JSONL from captured agent output):
harness-eval events import --wf-client "$CLIENT_ROOT" --trial-id "$(basename "$CLIENT_ROOT")"
harness-eval diagnostics --store "${HARNESS_EVAL_STORE:-$PWD/tied-bundle/reports/harness-eval}"
```
