# Test strategy — REQ-WF_TRIAL_COMPOSITION_GOAL_PROMPTS

**Phase:** refine-plan (design only).  
**Scope:** Catalog paste + contract tests + parent LEAP docs — no orchestrator.

## Satisfaction criteria

| ID | Intent | Verification |
| --- | --- | --- |
| **SC-GOAL-NO-ARCH** | Paste 09–12 omit architectural mandates | Contract: each block must **not** match forbid-list regexes (PLAN §3) |
| **SC-GOAL-BEHAVIOR-09** | WF-09 stresses concurrency + order | `/concurrent/i` and order-preservation phrasing |
| **SC-GOAL-TYPESCRIPT** | Stack hint | `/TypeScript/i` in all four blocks |
| **SC-GOAL-NO-UI** | No GUI | `/no graphical UI/i` in all four blocks |
| **SC-CATALOG-09-12** | Catalog shape | Twelve headers; facilitator index rows 09–12 |
| **SC-WF-ID-12** | Orchestrator unchanged | Existing `workflow-trial-agentstream-sh.test.mjs` (regression only) |

## Forbid-list (normative — copy into test)

Applied to extracted ```text blocks for WF-09, 10, 11, 12:

- `at least two modules`
- `separate wiring`
- `wiring layer`
- `module binding`
- `fourth module`
- `entry module that wires`
- `registers both handlers`
- `composition test`
- `binding test`
- `wiring together`
- `without spawning a subprocess`

## TDD order (build-plan)

1. TIED REQ/ARCH/IMPL + pseudo-code  
2. `pseudocode_validate`  
3. RED — replace positive binding-in-paste asserts with SC-GOAL-* in contract test  
4. GREEN — catalog paste §5 verbatim from PLAN  
5. Parent LEAP pseudo-code / REQ rationale  
6. Full contract + shell regression  

## Commands

```bash
node --test tools/bootstrap/lib/wf-trial-composition-prompts-contract.test.mjs
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```

## Out of scope

- Disposable pilot runs  
- Changing WF-01…08 paste  
