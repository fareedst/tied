# Test strategy — REQ-WF_TRIAL_COMPOSITION_SOC_PROMPTS

**Phase:** refine-plan (design only).  
**Scope:** Catalog paste 10–12 + contract tests — no orchestrator, no disposable pilots.

## Satisfaction criteria

| ID | Intent | Verification |
| --- | --- | --- |
| **SC-GOAL-NO-ARCH** | Paste 09–12 omit architectural mandates | Contract forbid-list loop |
| **SC-GOAL-TYPESCRIPT** | Stack hint | `/TypeScript/i` in blocks 09–12 |
| **SC-GOAL-NO-UI** | No GUI | `/no graphical UI/i` in blocks 09–12 |
| **SC-CATALOG-09-12** | Twelve headers | Existing catalog test |
| **SC-GOAL-BEHAVIOR-09** | WF-09 concurrency + order | Unchanged |
| **SC-GOAL-BEHAVIOR-10** | WF-10 mutually exclusive I/O | Regex table PLAN §6 |
| **SC-GOAL-BEHAVIOR-11** | WF-11 text + JSON ignore rules | Regex table PLAN §6 |
| **SC-GOAL-BEHAVIOR-12** | WF-12 two command families | Regex table PLAN §6 |

## Forbid-list

Unchanged from [REQ-WF_TRIAL_COMPOSITION_GOAL_PROMPTS test-strategy](../REQ-WF_TRIAL_COMPOSITION_GOAL_PROMPTS/test-strategy.md).

## TDD order (build-plan)

1. TIED REQ/ARCH/IMPL + pseudo-code  
2. `pseudocode_validate`  
3. RED — SC-GOAL-BEHAVIOR-10/11/12 in contract test  
4. GREEN — catalog paste  
5. Parent LEAP + docs  
6. Full contract + shell regression  

## Commands

```bash
node --test tools/bootstrap/lib/wf-trial-composition-prompts-contract.test.mjs
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```

## Out of scope

- Live `workflow_trial_agentstream wf-10`…`wf-12` matrix reruns  
- Changing WF-09 paste  
