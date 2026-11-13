# PLAN — [REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW]

**Workflow:** add-feature → **`refine-plan` (this doc)** → `@build-plan` → `@close-out`  
**Request token:** `REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW`  
**plan_phase:** `post-build` (verification pending `@close-out`)  
**profile_depth:** `minimal` · **gate_policy:** `advisory`

**Origin:** Sponsor request for a **controlled four-phase placeholder** (add-feature → refine-plan → build-plan → close-out) to calibrate harness metering during [REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM](./../REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM/PLAN.md) development.

**CITDP:** [CITDP-REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW.yaml](./CITDP-REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW.yaml)  
**Test strategy:** [test-strategy.md](./test-strategy.md)  
**Tracker:** [checklist-tracker.yaml](./checklist-tracker.yaml)

**Related (compose):** [REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM](./../REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM/PLAN.md) · [REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG](../../requirements/REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG.yaml) · [REQ-WF_TRIAL_IMPLEMENTATION_STACK](../../requirements/REQ-WF_TRIAL_IMPLEMENTATION_STACK.yaml) · [REQ-TIED_HARNESS_PLATFORM_SEAM](../../requirements/REQ-TIED_HARNESS_PLATFORM_SEAM.yaml) · [traditional-four-phase batch](../../../docs/demos/traditional-four-phase-agentstream.yaml)

---

## 1. Refine (Touchpoint 1 — RESOLVE) — pass 2 closed 2026-11-12

| Sponsor term | Resolved concept | Disposition |
| --- | --- | --- |
| **Lightweight four-phase** | Same prompt-type skills as [traditional WF catalog](../../../docs/demos/catalog-traditional-workflow-trial-prompts.md); **smaller disposable product** than PROMPT-WF-01 | **Locked** |
| **Placeholder workflow** | **Metering canary** fixture—not a replacement for PROMPT-WF-01…12 | **Locked** |
| **Build depth** | **Minimal GREEN** in build-plan: one pure export + one unit test | **Locked** (sponsor) |
| **Orchestrator** | **`workflow_trial_agentstream wf-meter-01`** with dedicated catalog | **Locked** (sponsor) |
| **Prompt id** | **`PROMPT-WF-METER-01`** in [`catalog-harness-metering-lite-workflow.md`](../../../docs/demos/catalog-harness-metering-lite-workflow.md) | **Locked** — **D-CATALOG-SPLIT** |
| **Harness-eval suite** | [`metering-canary-suite-v1.yaml`](../../../docs/demos/harness-eval/suites/metering-canary-suite-v1.yaml) (draft) | **Locked** — compose with HMEP **D-SUITE-LOCATION** |
| **Grading** | Primary consumer: **harness-eval import**; `@record-wf-trial` optional/advisory for canary cells | **Locked** — **D-PROOF-BOUNDARY-CANARY** |

**Costly choices:**

1. **Separate catalog file** — avoids widening `normalize_wf_id` regex for WF-13+ in the traditional table.
2. **Orchestrator branch** — meter ids use alternate `CATALOG_REL`; gawk section delimiter must not assume only `WF-0[1-9]|1[0-2]` headers in that file.

---

## 2. Problems

| Symptom | Cause |
| --- | --- |
| HMEP development needs repeatable trials with predictable **wall clock** and **product size** | PROMPT-WF-01…12 vary in scope; WF-10 still spans large unit/composition layers |
| Cannot compare harness token parsers without stable workflow shape | Need four-turn manifest with bounded build-plan work |
| Traditional catalog mix metering science with choreography science | No first-class **metering-only** prompt id |

---

## 3. Locked decisions

| ID | Decision |
| --- | --- |
| **D-CATALOG-SPLIT** | Metering catalog: `docs/demos/catalog-harness-metering-lite-workflow.md`; traditional catalog unchanged |
| **D-ORCH-ID** | CLI id `wf-meter-01` normalizes to `WF-METER-01`; disposable tag `wf-agentstream-wf-meter-01-{harness}-{modelBucket}` |
| **D-BATCH-REUSE** | Same [`traditional-four-phase-agentstream.yaml`](../../../docs/demos/traditional-four-phase-agentstream.yaml); only `FEATURE_REMAINDER` source changes |
| **D-STACK** | `implementation_stack_id`: `wf-trial-ts-node-test-v1` when orchestrator stack enabled (same as WF trials) |
| **D-PRODUCT-BUDGET** | Disposable `src/`: ≤ **45** non-comment LOC; ≤ **2** test files; ≤ **2** tests total; no composition binding test |
| **D-WALL-CLOCK-BAND** | Operator **target** (not code-enforced M1): orchestrated run **8–15** minutes on haiku/low-effort cells; document actual in harness-eval import |
| **D-PROOF-BOUNDARY-CANARY** | Canary metrics feed harness-eval only; no merge into facilitator grading prose for HMEP M1 |
| **D-EXTRACT-GAWK** | `extract_feature_remainder` exit header: `^### PROMPT-` (not `^### PROMPT-WF-` only) so `PROMPT-WF-METER-01` sections parse correctly |

---

## 4. Controlled budgets (normative for catalog)

| Dimension | Budget | Verification |
| --- | --- | --- |
| Product LOC | ≤ 45 in `src/` (excl. tests) | Facilitator or `project-size` snapshot on disposable client |
| Unit tests | 1 behavior test required; optional 1 edge test | `npm test` in build-plan turn |
| Composition | None | No `*.binding.test.ts` |
| Phases | Exactly four agentstream turns | `wf-trial-orchestrator-run.v1.json` |
| Implementation stack | TS ESM under `src/` | `REQ-WF_TRIAL_IMPLEMENTATION_STACK` |

**PROMPT-WF-METER-01 product remainder (canonical text for catalog):**

```text
Build a minimal TypeScript library with one exported function named meteringCanaryLabel that returns the fixed string "harness-meter-canary-v1". Include exactly one unit test that asserts the return value. No CLI, no extra modules, no network I/O.
```

---

## 5. Modules (M1 build-plan — store repo only)

| Module | Path |
| --- | --- |
| Metering catalog | `docs/demos/catalog-harness-metering-lite-workflow.md` |
| Suite draft | `docs/demos/harness-eval/suites/metering-canary-suite-v1.yaml` |
| Orchestrator | `scripts/workflow-trial-agentstream.sh`, `scripts/lib/wf-trial-agentstream-help.inc.sh` |
| Bootstrap tests | `tools/bootstrap/workflow-trial-agentstream-sh.test.mjs` (+ optional catalog contract test) |
| Vocab | `tied-project/vocab/harness-metering-canary.md` |
| Demos index | `docs/demos/README.md`, `docs/demos/harness-eval/README.md` cross-links |
| HMEP compose | HMEP PLAN § compose pointer (documentation) |

**Not in this REQ:** disposable client product code (created only during a live trial run).

---

## 6. Acceptance criteria

| ID | Criterion |
| --- | --- |
| SC-HEMC-01 | `workflow_trial_agentstream wf-meter-01 --dry-run` exits 0 and prints non-empty product remainder |
| SC-HEMC-02 | Invalid ids (`wf-13`, `wf-meter-99`) still fail; `wf-01`…`wf-12` behavior unchanged |
| SC-HEMC-03 | Catalog documents budgets §4 and four-phase protocol |
| SC-HEMC-04 | `metering-canary-suite-v1.yaml` lists `wf-meter-01` / four prompt_ref steps |
| SC-HEMC-05 | Help text documents `wf-meter-01` |
| SC-HEMC-06 | Live or documented smoke: manifest under `tied-project/working/wf-trial-orchestrator-run/evidence/` with `wf_id` `WF-METER-01` (may be manual evidence in M1) |

**Compose (HMEP):** After HMEP build-plan, `harness-eval events import --wf-client` round-trips canary manifest per SC-HMEP-M1-06 (verified on HMEP tracker, not blocking canary build).

---

## 7. Build sequence (`@build-plan`)

| Step | Deliverable |
| --- | --- |
| 1 | Mint REQ/ARCH/IMPL + semantic tokens; IMPL essence_pseudocode |
| 2 | `pseudocode_validate`; adversarial inquiry **not_applicable** (minimal depth) unless sponsor escalates |
| 3 | RED: `tools/bootstrap/workflow-trial-agentstream-sh.test.mjs` cases SC-HEMC-01/02/05; catalog contract test |
| 4 | GREEN: orchestrator id map + catalog file + gawk delimiter fix |
| 5 | Draft suite YAML + demos README links |
| 6 | Vocab + routing row |
| 7 | CITDP persist `tied-project/citdp/`; `tied_validate_consistency` |
| 8 | Optional: one disposable smoke run; capture manifest path in evidence |

---

## 8. Explicit non-goals (M1)

- New agentstream batch YAML fork (reuse traditional four-phase)
- Changing PROMPT-WF-01…12 bodies or ids
- Merging canary metrics into `@record-wf-trial` templates
- Enforcing wall-clock band in shell (documentation only)

---

## 9. Handoff

**Do next:** `@close-out` when verification gates allow; optional live smoke SC-HEMC-06.

**Dry-run (post build-plan):**

```bash
source scripts/build-commands.sh
workflow_trial_agentstream wf-meter-01 --dry-run
```

**HMEP parallel track:** `@build-plan` [REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM](./../REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM/PLAN.md) — canary smoke optional before HMEP import tests.
