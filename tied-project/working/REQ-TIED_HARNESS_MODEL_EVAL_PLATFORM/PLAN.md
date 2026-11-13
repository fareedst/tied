# PLAN — [REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM]

**Workflow:** add-feature → **`refine-plan` (this doc)** → `@build-plan` → `@close-out`  
**Request token:** `REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM`  
**plan_phase:** `close-out` (M3+M4 committed this pass)  
**milestone:** M3+M4 shipped; platform milestones M1–M4 complete through close-out  
**profile_depth:** `minimal` · **gate_policy:** `advisory` (build-plan M4: **`integrated`** on replay idempotency + baseline compare blocks; no network)

**Origin:** Sponsor feature spec *Cursor / Claude Harness and Model Evaluation Platform* v1.0 (F-01…F-19, four milestones).  
**Cursor plan:** `.cursor/plans/harness_model_eval_platform_3b2ec5c2.plan.md`

**CITDP:** [CITDP-REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM.yaml](./CITDP-REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM.yaml)  
**Test strategy:** [test-strategy.md](./test-strategy.md)  
**Tracker:** [checklist-tracker.yaml](./checklist-tracker.yaml)

**Related (compose):** [REQ-GOAGENT-AGENT-EXECUTOR](../../requirements/REQ-GOAGENT-AGENT-EXECUTOR.yaml) · [REQ-TIED_CLAUDE_LIVE_DRIVER](../../requirements/REQ-TIED_CLAUDE_LIVE_DRIVER.yaml) · [REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG](../../requirements/REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG.yaml) · [REQ-TIED_HARNESS_PLATFORM_SEAM](../../requirements/REQ-TIED_HARNESS_PLATFORM_SEAM.yaml) · [catalog-traditional-workflow-trial-prompts.md](../../../docs/demos/catalog-traditional-workflow-trial-prompts.md) · **Metering canary:** [REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW](../REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW/PLAN.md) (`wf-meter-01`, [metering-canary-suite-v1.yaml](../../../docs/demos/harness-eval/suites/metering-canary-suite-v1.yaml))

---

## 1. Refine (Touchpoint 1 — RESOLVE) — pass 3 M3/M4 · 2026-11-13

| Sponsor term | Resolved concept | Disposition |
| --- | --- | --- |
| **Billing reconciliation (F-10)** | Operator **billing ledger** YAML import; attach `provider_reported_cost` / `actual_charged_cost` to existing `trial_id` rows; **`report reconcile`** compares against `harness_estimated_cost` | **Locked** — see **D-BILLING-LEDGER**, **D-BILLING-OPTIN** |
| **Provider billing APIs** | **Out of M3 build** — live Cursor/Anthropic usage APIs deferred to LEAP proposal; M3 is file-backed only | **Locked** (sponsor non-goal preserved) |
| **Regression baseline (F-15)** | Committed **baseline manifest** per suite scenario × harness bucket under `docs/demos/harness-eval/baselines/` | **Locked** — see **D-REGRESSION-BASELINE** |
| **Historical replay (F-16)** | **`replay batch`** driven by a path manifest (WF runs registry export or operator list); wraps existing `events import` idempotently | **Locked** — M4 after M3 ships |
| **Milestone order** | **M3 billing** then **M4 regression** (PLAN §8); separate `@build-plan` / `@close-out` per milestone | **Locked** |

**Costly choices (M3/M4):**

1. SQLite **schema v3** for nullable provider/actual cost columns — third operator-visible migration.
2. Baselines live in **committed YAML** beside suites (not facilitator grades) — drift managed via content hash on baseline file.
3. Replay batch may re-touch large disposable trees — operator supplies manifest only; no automatic cloud fetch.

---

## 1b. Refine (Touchpoint 1 — RESOLVE) — pass 4 M4 · 2026-11-13

| Sponsor term | Resolved concept | Disposition |
| --- | --- | --- |
| **Baseline bind key** | Match store `trial` row to expectation via **`wf_id` + `harness`** (from manifest), optional **`model_slug`** filter; explicit **`trial_id`** override when present on expectation row | **Locked** — **D-BASELINE-BIND** |
| **Tolerance model** | Per-metric **`value`** + **`tolerance_pct`** and/or **`tolerance_abs`**; metric omitted or `null` → skip compare; observed `null` vs non-null baseline → fail | **Locked** — **D-BASELINE-TOLERANCE** |
| **Baseline integrity** | Same SHA-256 body pattern as suites (`content_integrity_sha256` over stable JSON sans hash field) | **Locked** (reuse suite integrity helper) |
| **Replay manifest** | Committed schema **`harness-eval-replay-manifest-v1`**; entries = `{ client_root, trial_id?, jsonl_paths?[] }`; missing client dir → **skip** (no throw) | **Locked** — **D-REPLAY-MANIFEST** |
| **Registry compose** | M4 does **not** parse [traditional-workflow-trial-runs-registry.md](../../../docs/demos/traditional-workflow-trial-runs-registry.md); operator maps **Client ID** → `client_root` manually or via ad-hoc script (LEAP) | **Locked** |
| **CLI surface** | `regression baseline validate`, `regression compare --baseline --trial-id`, `replay batch --manifest` | **Locked** |

**M4 costly choices:**

1. Baselines are **harness-metric** only — never WF facilitator grades (**D-PROOF-BOUNDARY**).
2. Replay uses existing **`importWfClient`** — no parallel ingest path (idempotency inherits SC-HMEP-M1-03).
3. Compare CLI exits **1** on first failing expectation when `--strict` default; summary JSON always printed.

**Parallel track:** M3 **`@close-out`** remains recommended before M4 commit but is not a build-plan hard gate for uncommitted M3 work.

---

## 1a. Refine (Touchpoint 1 — RESOLVE) — pass 2 closed 2026-11-12

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
| **D-BILLING-LEDGER** | Billing ledger: `docs/demos/harness-eval/billing/` (schema `harness-eval-billing-ledger-v1`); match key `trial_id`; unmatched lines → structured skip (no row fabrication) |
| **D-BILLING-OPTIN** | `billing import` requires explicit `--ledger`; no default credentials; missing ledger → costs stay `null` |
| **D-REGRESSION-BASELINE** | Baselines: `docs/demos/harness-eval/baselines/`; compare tolerances on tokens, `wall_clock_ms`, nullable costs; **D-PROOF-BOUNDARY** unchanged |
| **D-BASELINE-BIND** | Expectation row keys: `wf_id`, `harness`, optional `model_slug`, optional `trial_id` pin |
| **D-BASELINE-TOLERANCE** | `tolerance_pct` / `tolerance_abs` on numeric metrics; null baseline metric skips field |
| **D-REPLAY-MANIFEST** | Replay manifests: `docs/demos/harness-eval/replay/`; schema `harness-eval-replay-manifest-v1` |

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

## 6c. Acceptance criteria (Milestone 3 — `@build-plan` next)

| ID | Criterion |
| --- | --- |
| SC-HMEP-M3-01 | Billing ledger YAML validates against `harness-eval-billing-ledger-v1`; unknown `trial_id` lines recorded as skips, import exit 0 with summary |
| SC-HMEP-M3-02 | SQLite migrates v2→v3 with nullable `provider_reported_cost`, `actual_charged_cost`; M2 rows preserved |
| SC-HMEP-M3-03 | After `billing import`, trial row costs updated; missing ledger fields remain `null` (not `0`) |
| SC-HMEP-M3-04 | `report reconcile` emits per-trial delta JSON: `harness_estimated_cost` vs `provider_reported_cost` vs `actual_charged_cost` (null-safe) |
| SC-HMEP-M3-05 | Without `--ledger`, no billing mutation; CLI documents opt-in in README |

## 6d. Acceptance criteria (Milestone 4 — after M3 close-out)

| ID | Criterion |
| --- | --- |
| SC-HMEP-M4-01 | Baseline manifest validates; `regression baseline validate` fails on content hash mismatch |
| SC-HMEP-M4-02 | `regression compare` fails when observed metrics exceed baseline tolerances (tokens or wall clock) |
| SC-HMEP-M4-03 | `replay batch --manifest` imports each path idempotently (SC-HMEP-M1-03 holds per path) |
| SC-HMEP-M4-04 | Manifest-only replay preserves null tokens; cohort keys (`wf_id`, `harness`, fingerprint) remain queryable |
| SC-HMEP-M4-05 | Replay manifest YAML validates; missing `client_root` dirs skipped with summary (exit 0) |

### M4 baseline schema (normative sketch)

```yaml
schema_version: harness-eval-baseline-v1
baseline_id: engineering-suite-v1-baseline
suite_ref: docs/demos/harness-eval/suites/engineering-suite-v1.yaml
content_integrity_sha256: <computed at build-plan>
expectations:
  - bind:
      wf_id: WF-10
      harness: cursor
    metrics:
      wall_clock_ms: { value: 600000, tolerance_pct: 20 }
      input_tokens: null  # explicit skip
```

### M4 replay manifest sketch

```yaml
schema_version: harness-eval-replay-manifest-v1
manifest_revision: operator-batch-1
entries:
  - client_root: /abs/path/to/1794525072-wf-agentstream-wf-10-cursor-grok47med
    trial_id: 1794525072-wf-agentstream-wf-10-cursor-grok47med
    jsonl_paths: []  # optional captures
```

**Deferred beyond M4:** live provider billing APIs; web dashboard; `trial run` subprocess tee (optional tail from M1).

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

| Milestone | Features | Goal | Status |
| --- | --- | --- | --- |
| **M2** | F-09, F-11–F-14, F-18 | Verifiers, pricing catalog, comparative reports | **Shipped** `dca69377` |
| **M3** | F-10 | File-backed billing reconciliation + reconcile report | **Shipped** close-out 2026-11-13 |
| **M4** | F-15, F-16 | Regression baselines + batch historical replay | **Shipped** close-out 2026-11-13 |

### M3 modules (build-plan)

| Module | Path | Spec |
| --- | --- | --- |
| Billing ledger loader | `src/billing/ledger.ts` | F-10 |
| Schema v3 migrate | `src/store/schema.ts`, `migrate.ts` | SC-HMEP-M3-02 |
| Billing import CLI | `src/cli/billing-import.ts` | SC-HMEP-M3-01, M3-03 |
| Reconcile report | `src/report/reconcile.ts` | SC-HMEP-M3-04 |
| Contracts | `mcp-server/contracts/harness-eval/harness-eval-billing-ledger.schema.json` | F-10 |
| Sample ledger | `docs/demos/harness-eval/billing/sample-ledger-v1.yaml` | operator doc |

### M4 modules (build-plan after M3)

| Module | Path | Spec |
| --- | --- | --- |
| Baseline loader + integrity | `src/regression/baseline.ts`, reuse `suite/integrity.ts` | F-15, SC-HMEP-M4-01 |
| Compare engine | `src/regression/compare.ts` | SC-HMEP-M4-02 |
| Replay batch | `src/runner/replay.ts`, wire `importWfClient` | F-16, SC-HMEP-M4-03..05 |
| CLI | `src/cli/main.ts` subcommands `regression *`, `replay batch` | F-15, F-16 |
| Contracts | `harness-eval-baseline.schema.json`, `harness-eval-replay-manifest.schema.json` | F-15, F-16 |
| Draft artifacts | `baselines/engineering-suite-v1-baseline.yaml`, `replay/sample-replay-batch-v1.yaml` | operator doc |

---

## 9. Explicit non-goals (M1)

- Web dashboard; centralized service; default-on billing credentials
- Replacing `tied agentstream` or WF orchestrator
- Leaderboard blending grades / proof facets with token metrics
- Inferring undisclosed model build IDs

---

## 7b. Build sequence (`@build-plan` M2 — done)

| Step | Deliverable |
| --- | --- |
| 1 | LEAP REQ satisfaction + IMPL pseudo-code blocks for pricing, verify, report, schema v2 |
| 2 | `pseudocode_validate`; integrated inquiry on pricing + verifier blocks |
| 3 | RED: SC-HMEP-M2-01…06 |
| 4 | GREEN: catalog, migrate v2, cost attach on import, verify + report CLI |
| 5 | Contracts `harness-eval-pricing.schema.json`; update README operator recipe |
| 6 | Vocab + CITDP M2 delta; `tied_validate_consistency` |

---

## 7c. Build sequence (`@build-plan` M3)

| Step | Deliverable |
| --- | --- |
| 1 | LEAP REQ index SC-HMEP-M3-* + IMPL blocks: `IMPORT_BILLING_LEDGER`, `MIGRATE_EVAL_SCHEMA_V3`, `REPORT_BILLING_RECONCILE` |
| 2 | `pseudocode_validate`; integrated inquiry on billing-import + null-cost invariants |
| 3 | RED: SC-HMEP-M3-01…05 |
| 4 | GREEN: ledger loader, migrate v3, `billing import`, `report reconcile` |
| 5 | Contract `harness-eval-billing-ledger.schema.json`; sample ledger + README |
| 6 | Vocab + CITDP M3 delta; persist `citdp/`; `tied_validate_consistency` |

## 7d. Build sequence (`@build-plan` M4)

| Step | Deliverable |
| --- | --- |
| 1 | LEAP REQ **SC-HMEP-M4-01…05** + IMPL: `VALIDATE_REGRESSION_BASELINE`, `COMPARE_TRIAL_TO_BASELINE`, `REPLAY_BATCH_IMPORT`, `VALIDATE_REPLAY_MANIFEST` |
| 2 | `pseudocode_validate`; integrated inquiry on replay idempotency + null-token invariants |
| 3 | RED: SC-HMEP-M4-01…05 + contract tests |
| 4 | GREEN: baseline load/compare, replay batch → `importWfClient` loop |
| 5 | Draft baseline + sample replay manifest; README M4 operator recipe (registry Client ID mapping note) |
| 6 | Vocab + CITDP M4 delta; `tied_validate_consistency` |

---

## 10. Handoff

**Session log (2026-11-13):** [evidence/session-handoff.md](./evidence/session-handoff.md) — M3 built uncommitted; M4 refined; next **`@build-plan` M4**.

**Do next:** sponsor **`@close-out` M3** (scoped) then **`@close-out` M4** or combined HMEP commit. M4 build evidence: [evidence/build-plan-m4-evidence.md](./evidence/build-plan-m4-evidence.md).

**Operator smoke (M2 — still valid):**

```bash
# After a WF disposable client run (optional JSONL from captured agent output):
harness-eval events import --wf-client "$CLIENT_ROOT" --trial-id "$(basename "$CLIENT_ROOT")"
harness-eval diagnostics --store "${HARNESS_EVAL_STORE:-$PWD/tied-bundle/reports/harness-eval}"
```
