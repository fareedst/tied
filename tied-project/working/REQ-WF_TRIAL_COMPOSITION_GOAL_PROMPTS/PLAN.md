# PLAN — [REQ-WF_TRIAL_COMPOSITION_GOAL_PROMPTS] (refine-plan)

**Status:** close-out complete (2026-11-10)  
**Workflow:** add-feature → **refine-plan** → `@build-plan` → close-out  
**Request token:** `REQ-WF_TRIAL_COMPOSITION_GOAL_PROMPTS`  
**plan_phase:** `post-build`  
**profile_depth:** `minimal` · **gate_policy:** `advisory`

**Related:** [REQ-WF_TRIAL_COMPOSITION_PROMPTS](../../requirements/REQ-WF_TRIAL_COMPOSITION_PROMPTS.yaml) (parent cohort `0a3f50da`) · [REQ-MODULE_VALIDATION](../../requirements/REQ-MODULE_VALIDATION.yaml) (methodology)

**CITDP:** [CITDP-REQ-WF_TRIAL_COMPOSITION_GOAL_PROMPTS.yaml](./CITDP-REQ-WF_TRIAL_COMPOSITION_GOAL_PROMPTS.yaml)  
**Test strategy:** [test-strategy.md](./test-strategy.md)  
**Tracker:** [checklist-tracker.yaml](./checklist-tracker.yaml)

---

## 1. Refine (Touchpoint 1 — RESOLVE) — closed

| Sponsor term | Resolved concept | Disposition |
| --- | --- | --- |
| Too much architecture in paste | WF-09…12 remainder must not prescribe modules, wiring layers, runners, binding-test wording | **Locked** |
| Goals + complex behavior | Paste states **features and outcomes** that imply composition under TIED (async order, CLI stats, pipeline, dispatch) | **Locked** |
| Layer comparability | Facilitator grades binding from disposable PLAN/tests; paste must not pre-encode layers | **Locked** |
| Language + tests + no UI | Paste may require **TypeScript**, **automated tests**, **no graphical UI** | **Locked** |
| Parent REQ | Same prompt IDs 09–12; LEAP content only — orchestrator unchanged | **Locked** |
| WF-01…08 | Unchanged | **Out of scope** |

**Facilitator-only (unchanged):** Composition evidence rubric ([catalog](../../../docs/demos/catalog-traditional-workflow-trial-prompts.md) § Composition evidence) — unit tests plus at least one non-UI binding/wiring test inferred from PLAN and test files, not from paste compliance.

---

## 2. Problem

Shipped [REQ-WF_TRIAL_COMPOSITION_PROMPTS](../../requirements/REQ-WF_TRIAL_COMPOSITION_PROMPTS.yaml) paste blocks tell agents how to architect (`Split across at least two modules`, `wiring layer`, `fourth module that runs the pipeline`). That collapses the experiment: cross-model comparison of **whether TIED four-phase yields similar layered outcomes**.

Store contract test currently **requires** architectural paste language (`module binding`, per-module unit test mandates). Build-plan must flip to **negative** architectural assertions and **positive** goal assertions.

---

## 3. Paste policy (normative)

### Allowed in paste (09–12 only)

- TypeScript stack hint (same cohort as WF-01…08 disposable stack)
- Observable product behavior and acceptance-shaped goals
- “Include automated tests” / equivalent
- “No graphical UI”

### Forbidden in paste (regex contract — case-insensitive)

| Pattern | Rationale |
| --- | --- |
| `at least two modules` | Module count mandate |
| `separate wiring` | Layer name |
| `wiring layer` | Layer name |
| `module binding` | Methodology jargon in paste |
| `fourth module` | Module count |
| `entry module that wires` | Layer name |
| `registers both handlers` | Wiring recipe |
| `composition test` | Methodology jargon |
| `binding test` | Methodology jargon |
| `wiring together` | Architecture recipe |
| `without spawning a subprocess` | Shell-test recipe (WF-10 legacy) |

**Note:** Incidental use of “module” in product sense is allowed; forbid-list targets **architectural mandates** only.

### Facilitator catalog (not in paste)

- Keep workflow_stress index rows for WF-09…12
- Add one facilitator note: **paste generation** `goal-first` (2026-11-10+) vs prior `architect-in-paste` runs when grading comparability

---

## 4. Facilitator index (unchanged stress labels)

| ID | workflow_stress | maps_to | proof_boundary | LLM differentiator (facilitator) |
| --- | --- | --- | --- | --- |
| PROMPT-WF-09 | ordered parallel map | TIED-DEMO-10 | executable_behavior | Order under async finish without paste layer hints |
| PROMPT-WF-10 | thin CLI wiring | TIED-DEMO-13 | executable_behavior | Argv→core evidenced in PLAN/tests, not paste |
| PROMPT-WF-11 | pipeline runner | TIED-DEMO-08 | executable_behavior | Multi-stage binding from artifacts |
| PROMPT-WF-12 | handler registry | TIED-DEMO-12 | executable_behavior | Cross-module dispatch from artifacts |

---

## 5. Locked paste remainders (build-plan copies verbatim into catalog)

### PROMPT-WF-09

```text
Build a TypeScript library that maps work over an array with concurrent execution but returns results in the same order as the input, even when individual items finish out of order. Tests must use deterministic delays so completion order differs from input order. Include automated tests. No graphical UI.
```

### PROMPT-WF-10

```text
Build a TypeScript CLI that reads CSV text (from a file path or stdin) and prints summary statistics: row count and column count. Include automated tests. No graphical UI.
```

### PROMPT-WF-11

```text
Build a TypeScript library for line-oriented text processing: tokenize lines, filter tokens, and aggregate counts. It must process sample text end to end and produce the final aggregate. Include automated tests. No graphical UI.
```

### PROMPT-WF-12

```text
Build a TypeScript command dispatcher that routes string commands to handlers and rejects unknown commands with a clear, documented error. Include automated tests. No graphical UI.
```

---

## 6. Locked decisions

| ID | Decision |
| --- | --- |
| D-GOAL-PASTE | Replace only `### PROMPT-WF-09`…`12` fenced blocks; facilitator rubric text updated for goal-first policy |
| D-GOAL-CONTRACT | Extend `wf-trial-composition-prompts-contract.test.mjs` with SC-GOAL-*; remove SC assertions that require binding language **in paste** |
| D-GOAL-LEAP | Update parent REQ/IMPL pseudo-code comments to reference goal-first paste; cross-link this REQ |
| D-GOAL-REGISTRY | Registry header note: paste generation tag optional on new rows; no fabricated runs |
| D-GOAL-ORCH | No change to `normalize_wf_id` / wf-13 reject |

**Costly:** None in store; prior 09–12 trials remain historical (`architect-in-paste` generation).

---

## 7. Modules (build-plan)

| Module | Path |
| --- | --- |
| Catalog | [catalog-traditional-workflow-trial-prompts.md](../../../docs/demos/catalog-traditional-workflow-trial-prompts.md) |
| Contract tests | [wf-trial-composition-prompts-contract.test.mjs](../../../tools/bootstrap/lib/wf-trial-composition-prompts-contract.test.mjs) |
| Parent LEAP | [REQ-WF_TRIAL_COMPOSITION_PROMPTS](../../requirements/REQ-WF_TRIAL_COMPOSITION_PROMPTS.yaml), [IMPL-WF_TRIAL_COMPOSITION_PROMPTS-pseudocode.md](../../implementation-decisions/IMPL-WF_TRIAL_COMPOSITION_PROMPTS-pseudocode.md) |
| TIED (this REQ) | `tied-project/` REQ/ARCH/IMPL |
| Vocab | [agentstream.md](../../vocab/agentstream.md) |
| Runs registry header | [traditional-workflow-trial-runs-registry.md](../../../docs/demos/traditional-workflow-trial-runs-registry.md) (one-line generation note) |

---

## 8. Build-plan order

1. TIED REQ/ARCH/IMPL + pseudo-code (catalog-only scope)  
2. `pseudocode_validate`  
3. RED — update contract test (forbid-list + goal asserts)  
4. Catalog paste + facilitator note + registry header  
5. Parent LEAP + vocab + CHANGELOG  
6. `tied_validate_consistency` · close-out  

---

## 9. Out of scope

- New prompt IDs, orchestrator changes, WF-01…08 bodies  
- Live disposable matrix reruns  
- Changing composition **facilitator** pass criteria (only paste + contract alignment)

---

## Do next

**`@close-out`** — scoped commit (catalog, contract test, TIED, vocab, CHANGELOG, CITDP)
