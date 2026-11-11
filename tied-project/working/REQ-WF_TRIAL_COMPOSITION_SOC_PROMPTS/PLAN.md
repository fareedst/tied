# PLAN — [REQ-WF_TRIAL_COMPOSITION_SOC_PROMPTS] (refine-plan)

**Status:** build-plan complete (2026-11-11)  
**Workflow:** add-feature → refine-plan → **build-plan** → `@close-out`  
**Request token:** `REQ-WF_TRIAL_COMPOSITION_SOC_PROMPTS`  
**plan_phase:** `post-build`  
**profile_depth:** `minimal` · **gate_policy:** `advisory`

**Related:** [REQ-WF_TRIAL_COMPOSITION_GOAL_PROMPTS](../../requirements/REQ-WF_TRIAL_COMPOSITION_GOAL_PROMPTS.yaml) (parent paste policy) · [REQ-WF_TRIAL_COMPOSITION_PROMPTS](../../requirements/REQ-WF_TRIAL_COMPOSITION_PROMPTS.yaml) (composition cohort) · [REQ-MODULE_VALIDATION](../../requirements/REQ-MODULE_VALIDATION.yaml) (methodology)

**CITDP:** [CITDP-REQ-WF_TRIAL_COMPOSITION_SOC_PROMPTS.yaml](./CITDP-REQ-WF_TRIAL_COMPOSITION_SOC_PROMPTS.yaml)  
**Test strategy:** [test-strategy.md](./test-strategy.md)  
**Tracker:** [checklist-tracker.yaml](./checklist-tracker.yaml)

---

## 1. Refine (Touchpoint 1 — RESOLVE) — closed

| Sponsor term | Resolved concept | Disposition |
| --- | --- | --- |
| Separation of concerns | Paste names **distinct resources** (filesystem vs stdin; text vs JSON rules; command families) so ARCH may split argv/adapters/core without paste module counts | **Locked** |
| WF-09 | Unchanged paste | **Out of scope** |
| WF-10–12 only | Replace goal-first paste blocks; add `goal-first-soc` facilitator label for 10–12 | **Locked** |
| WF-10 shape | Mutually exclusive `--file` vs explicit stdin mode; asymmetric I/O contracts | **Locked** (sponsor pick) |
| Forbidden paste jargon | Same forbid-list as GOAL_PROMPTS PLAN §3 | **Locked** |
| Facilitator rubric | Composition evidence sub-check unchanged | **Locked** |
| New REQ token | `REQ-WF_TRIAL_COMPOSITION_SOC_PROMPTS`; LEAP parent GOAL_PROMPTS | **Locked** |

**Evidence:** WF-09 Claude batch showed monolith + unit-only under weak goal-first wording ([FACILITATOR-WF-09-COMPOSITION-GRADING](../FACILITATOR-WF-09-COMPOSITION-GRADING/PLAN.md)).

---

## 2. Problem

[REQ-WF_TRIAL_COMPOSITION_GOAL_PROMPTS](../../requirements/REQ-WF_TRIAL_COMPOSITION_GOAL_PROMPTS.yaml) removed architectural mandates from paste but WF-10–12 remainders still allow a **single god module** (same as WF-09). Facilitator composition grading is unchanged; the **experiment** needs stronger **behavioral** seams without reintroducing forbid-list phrases.

---

## 3. Paste policy (inherits GOAL + delta)

### Unchanged

- Forbid-list (PLAN §3 in [GOAL_PROMPTS PLAN](../REQ-WF_TRIAL_COMPOSITION_GOAL_PROMPTS/PLAN.md))
- Allowed: TypeScript, automated tests, no graphical UI
- WF-09 paste verbatim

### New facilitator note (catalog § Paste policy)

- **WF-10–12** paste generation: `goal-first-soc` (2026-11-11+) vs prior `goal-first` (2026-11-10) vs `architect-in-paste`
- WF-09 remains `goal-first` only

### Expected agent architecture (not in paste — for build-plan / facilitators)

| ID | Likely units | Binding under test |
| --- | --- | --- |
| WF-10 | argv / file reader / stdin reader / csv+stats | Mode pick → correct reader → summarize |
| WF-11 | argv / text source / JSON ignore loader / pipeline | Text + rules → aggregate |
| WF-12 | argv / stdin payload / two handler families / dispatch | Command name → family → behavior |

Monolith still **allowed by paste**; cohort question is whether SoC wording **increases** binding tests vs first goal-first runs.

---

## 4. Facilitator index (unchanged)

| ID | workflow_stress | maps_to | LLM differentiator (facilitator) |
| --- | --- | --- | --- |
| PROMPT-WF-09 | ordered parallel map | TIED-DEMO-10 | Order under async finish |
| PROMPT-WF-10 | thin CLI wiring | TIED-DEMO-13 | Argv→core in PLAN/tests |
| PROMPT-WF-11 | pipeline runner | TIED-DEMO-08 | Multi-stage + rules file binding |
| PROMPT-WF-12 | handler registry | TIED-DEMO-12 | Cross-family dispatch |

---

## 5. Locked paste remainders (build-plan copies verbatim)

### PROMPT-WF-09 (unchanged)

```text
Build a TypeScript library that maps work over an array with concurrent execution but returns results in the same order as the input, even when individual items finish out of order. Tests must use deterministic delays so completion order differs from input order. Include automated tests. No graphical UI.
```

### PROMPT-WF-10

```text
Build a TypeScript CLI that summarizes CSV text with row count and column count. The user must choose exactly one input: a --file <path> option or an explicit stdin mode (document the flag or convention you use). Using both or neither is an error with a documented message. File mode must read via the filesystem; stdin mode must read until EOF without a path. Include automated tests. No graphical UI.
```

### PROMPT-WF-11

```text
Build a TypeScript library that processes line-oriented text end to end and prints one aggregate: the count of tokens remaining after filtering. The text to process comes from a file path or stdin (document how the caller selects the mode). Token ignore rules come from an optional JSON file path; when that path is omitted, use a documented default ignore list. Empty input must yield a documented count. Include automated tests. No graphical UI.
```

### PROMPT-WF-12

```text
Build a TypeScript command tool that reads a command name from arguments and optional payload text from stdin. Support at least two documented command families with different behavior (for example one family only inspects or validates payload text and another transforms or summarizes it). Unknown command names must fail with a documented error. Include automated tests. No graphical UI.
```

---

## 6. Contract tests (SC — locked regex)

| ID | WF | Assertions on extracted ```text block |
| --- | --- | --- |
| SC-GOAL-BEHAVIOR-10 | 10 | `/exactly one input/i`, `/--file/i`, `/stdin/i`, `/filesystem/i` |
| SC-GOAL-BEHAVIOR-11 | 11 | `/JSON/i`, `/ignore/i`, `/remaining after filtering/i` |
| SC-GOAL-BEHAVIOR-12 | 12 | `/two documented command families/i`, `/unknown command/i` |
| SC-GOAL-BEHAVIOR-09 | 09 | Unchanged |
| SC-GOAL-NO-ARCH | 09–12 | Existing forbid-list loop |

**Command:** `node --test tools/bootstrap/lib/wf-trial-composition-prompts-contract.test.mjs`

---

## 7. Locked decisions

| ID | Decision |
| --- | --- |
| D-SOC-PASTE | Replace only `### PROMPT-WF-10`…`12` fenced blocks + paste policy footnote |
| D-SOC-CONTRACT | Add three `it(...)` blocks for SC-GOAL-BEHAVIOR-10/11/12 |
| D-SOC-TIED | Create REQ/ARCH/IMPL via MCP at build-plan; parent GOAL REQ `related_to` / rationale LEAP |
| D-SOC-VOCAB | RECORD `goal-first-soc` in `tied-project/vocab/agentstream.md` at build-plan |
| D-SOC-ORCH | No orchestrator change |
| D-SOC-REGISTRY | No fabricated trial rows |

**Costly:** Prior WF-10–12 trials (if any) labeled `goal-first`; new runs label `goal-first-soc` — **reversible**.

---

## 8. Modules (build-plan)

| Module | Path |
| --- | --- |
| Catalog paste | `docs/demos/catalog-traditional-workflow-trial-prompts.md` |
| Contract tests | `tools/bootstrap/lib/wf-trial-composition-prompts-contract.test.mjs` |
| TIED stack | `tied-project/requirements*`, `architecture-decisions*`, `implementation-decisions*`, `semantic-tokens.yaml` |
| IMPL pseudo-code | `IMPL-WF_TRIAL_COMPOSITION_SOC_PROMPTS-pseudocode.md` |
| Docs | `CHANGELOG.md`, `tied-project/vocab/agentstream.md` |
| CITDP persist | `tied-project/citdp/CITDP-REQ-WF_TRIAL_COMPOSITION_SOC_PROMPTS.yaml` |

---

## 9. TDD order (@build-plan)

1. TIED REQ/ARCH/IMPL indexes + details + pseudo-code → `pseudocode_validate`
2. RED — extend contract test (3 new tests fail on old paste)
3. GREEN — catalog paste §5 + paste policy note
4. Parent LEAP on GOAL_PROMPTS detail (cross-link SOC REQ)
5. `node --test` contract + `workflow-trial-agentstream-sh.test.mjs`
6. `tied_validate_consistency`

---

## 10. Do next

**`@close-out`** — verification manifest, traceable commit (scoped).

No product code; no disposable pilots in this REQ.

---

## Changelog (this PLAN)

- 2026-11-11 build-plan: REQ/ARCH/IMPL; catalog WF-10..12 goal-first-soc; contract SC-GOAL-BEHAVIOR-10/11/12 (9/9 pass); wf-09 dry-run assertion aligned to goal-first paste; `tied_validate_consistency` ok
- 2026-11-11 refine-plan: RESOLVE closed; locked paste §5; SC regex table; tracker request token set
