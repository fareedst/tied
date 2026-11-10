# PLAN — [REQ-WF_TRIAL_COMPOSITION_PROMPTS] (refine-plan)

**Status:** build-plan complete (awaiting close-out)  
**Workflow:** add-feature → **refine-plan** → `@build-plan` → close-out  
**Request token:** `REQ-WF_TRIAL_COMPOSITION_PROMPTS`  
**plan_phase:** `post-build`  
**profile_depth:** `minimal` · **gate_policy:** `advisory`

**Related:** [REQ-WF_TRIAL_MODEL_SPEC_CLI](../../requirements/REQ-WF_TRIAL_MODEL_SPEC_CLI.yaml) · [REQ-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP](../../requirements/REQ-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP.yaml) · [REQ-WF_TRIAL_IMPLEMENTATION_STACK](../../requirements/REQ-WF_TRIAL_IMPLEMENTATION_STACK.yaml) · [REQ-MODULE_VALIDATION](../../requirements/REQ-MODULE_VALIDATION.yaml) (methodology)

**CITDP:** [CITDP-REQ-WF_TRIAL_COMPOSITION_PROMPTS.yaml](./CITDP-REQ-WF_TRIAL_COMPOSITION_PROMPTS.yaml)  
**Test strategy:** [test-strategy.md](./test-strategy.md)  
**Tracker:** [checklist-tracker.yaml](./checklist-tracker.yaml)

---

## 1. Refine (Touchpoint 1 — RESOLVE) — closed

| Sponsor term | Resolved concept | Disposition |
| --- | --- | --- |
| 4 more WF prompts | `PROMPT-WF-09` … `PROMPT-WF-12` | **Locked** |
| Like WF-01…08 | Same catalog, four-phase protocol, `wf-trial-ts-node-test-v1` | **Locked** |
| Composition testing | Mandatory **composition test** per prompt (module binding, no UI/E2E) + unit tests | **Locked** |
| WF-01…08 scope | Unit-focused prompts **unchanged** | **Locked** — out of scope to edit 01…08 bodies |
| Orchestrator IDs | `workflow_trial_agentstream wf-09` … `wf-12` | **Locked** — regex `WF-(0[1-9]|1[0-2])` |

**Catalog bridges (facilitator only, not in paste text):** TIED-DEMO-10, TIED-DEMO-13, pipeline/bindings, TIED-DEMO-12.

---

## 2. Problem

[WF trial catalog](../../../docs/demos/catalog-traditional-workflow-trial-prompts.md) lists **PROMPT-WF-01…08**. Only **WF-03** lightly stresses wiring; the matrix has no cohort that **requires** composition tests for facilitator grading. The orchestrator rejects `wf-09`:

```34:36:scripts/workflow-trial-agentstream.sh
  if [[ ! "$raw" =~ ^WF-0[1-8]$ ]]; then
    fail "invalid WF id (expected WF-01 … WF-08): $1"
```

---

## 3. Composition contract (normative for prompts 09–12)

**In every disposable build for WF-09…12:**

1. **Unit tests** for each library module (same stack: TypeScript, `node --test`).
2. **At least one composition test** that exercises the **binding** between named modules (wiring, runner, argv layer, dispatcher) and **does not** use a graphical UI, browser, or manual steps.
3. Composition tests may run in-process (import wiring and call it); they must **not** be the only test that proves the binding (i.e. do not satisfy this with “we called core from unit tests only”).

**Facilitator grading (catalog rubric):** Under **Test strategy (17%)**, sub-check *Composition evidence* — fail signal when PLAN/test files show unit-only coverage of core with no binding test.

**Paste-block rule:** No TIED tokens, MCP names, or “composition test” methodology jargon in sponsor paste text; use plain “wiring” / “binding” language (see §5).

---

## 4. Facilitator index (to add in catalog)

| ID | workflow_stress | maps_to | proof_boundary | Primary LLM differentiator |
| --- | --- | --- | --- | --- |
| PROMPT-WF-09 | ordered parallel map | TIED-DEMO-10 | executable_behavior | Composition before glue; order preserved under async finish |
| PROMPT-WF-10 | thin CLI wiring | TIED-DEMO-13 | executable_behavior | Argv → core tested via wiring layer, not subprocess |
| PROMPT-WF-11 | pipeline runner | TIED-DEMO-08 | executable_behavior | Multi-stage binding in one runner test |
| PROMPT-WF-12 | handler registry | TIED-DEMO-12 | executable_behavior | Cross-module dispatch registration |

**Recommended sequence (new row):** Composition pilot — PROMPT-WF-09, WF-10 × `composer-2.5`, `luna medium`, `grok47-med` (one client each).

---

## 5. Locked paste remainders (build-plan copies verbatim into catalog)

### PROMPT-WF-09

```text
Build a TypeScript library that maps over an array of items using concurrent workers but returns results in the same order as the input. Split the work across at least two modules (one that runs workers and one that collects results in order). Use deterministic fake delays in tests so completion order differs from input order. Include unit tests for each module. Include at least one automated test that exercises the module binding (how workers and ordering are wired together) without starting a graphical UI.
```

### PROMPT-WF-10

```text
Build a small CLI that reads CSV text and prints summary statistics (row count and column count). Keep the CSV parsing and stats logic in a library module separate from argument parsing and from the entry module that wires them. Include unit tests for the library and for argument parsing. Include at least one automated test that calls the wiring layer with a fake argv list and checks the printed result shape, without spawning a subprocess or graphical UI.
```

### PROMPT-WF-11

```text
Build a line-oriented text pipeline: tokenize lines, filter tokens, then aggregate counts. Implement tokenizer, filter, and aggregator as separate modules and a fourth module that runs the pipeline end to end. Include unit tests for each stage. Include at least one automated test that feeds text through the runner module and asserts the final aggregate, without graphical UI.
```

### PROMPT-WF-12

```text
Build a command dispatcher that routes string commands to handlers registered from at least two small handler modules. Reject unknown commands with a documented error. Include unit tests per handler module and for dispatch logic. Include at least one automated test that registers both handlers and verifies routing across modules, without graphical UI.
```

---

## 6. Locked decisions

| ID | Decision |
| --- | --- |
| D-COMP-NUMBERING | IDs **WF-09** through **WF-12** only (no renumbering 01–08) |
| D-COMP-CLAUSE | Plain-language binding-test requirement in paste text; facilitator §3 holds normative definition |
| D-COMP-ORCH | Extend `normalize_wf_id` and help to **12**; `wf-13` remains invalid |
| D-COMP-REGISTRY | Update registry **headers** to 01…12; no fabricated readout rows until trials run |
| D-COMP-STACK | Same `wf-trial-ts-node-test-v1`; optional `wf-trial-composition-prompts-contract.test.mjs` for catalog shape |
| D-COMP-OUT | Do not change WF-01…08 prompt bodies or four-phase YAML batch |

**Costly:** None for store repo; trial comparability shifts when facilitators add 09–12 rows to registry (reversible).

---

## 7. Modules (build-plan)

| Module | Path |
| --- | --- |
| Catalog | [catalog-traditional-workflow-trial-prompts.md](../../../docs/demos/catalog-traditional-workflow-trial-prompts.md) |
| Runs registry header | [traditional-workflow-trial-runs-registry.md](../../../docs/demos/traditional-workflow-trial-runs-registry.md) |
| Orchestrator | [workflow-trial-agentstream.sh](../../../scripts/workflow-trial-agentstream.sh), help inc files |
| Tests | [workflow-trial-agentstream-sh.test.mjs](../../../tools/bootstrap/workflow-trial-agentstream-sh.test.mjs); optional catalog contract test |
| TIED | REQ/ARCH/IMPL under `tied-project/` |
| Vocab | [agentstream.md](../../vocab/agentstream.md) |

---

## 8. Build-plan order

1. TIED REQ/ARCH/IMPL + pseudo-code (catalog/orchestrator scope)  
2. `pseudocode_validate`  
3. RED — shell + optional catalog contract tests  
4. Catalog + orchestrator + help + registry headers  
5. vocab / CHANGELOG / demos README one-liner  
6. `tied_validate_consistency` · `@close-out`

---

## 9. Out of scope

- Live disposable matrix runs in build-plan  
- Changing [traditional-four-phase-agentstream.yaml](../../../docs/demos/traditional-four-phase-agentstream.yaml) turn templates  
- E2E or UI tests as substitute for composition tests  

---

## Do next

**`@build-plan`** — [evidence/session-handoff.md](./evidence/session-handoff.md)
