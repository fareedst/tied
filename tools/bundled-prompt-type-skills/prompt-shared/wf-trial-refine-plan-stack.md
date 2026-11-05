# WF trial refine-plan — locked stack

**Tokens:** [REQ-WF_TRIAL_IMPLEMENTATION_STACK](../../../tied-project/requirements/REQ-WF_TRIAL_IMPLEMENTATION_STACK.yaml) · Build: [wf-trial-build-plan-handoff.md](./wf-trial-build-plan-handoff.md)

## Turn 2 (refine-plan) — stack is not negotiable

When **`tied-project/agent-preload-contract.yaml`** and root **`package.json`** were seeded by **`workflow-trial-agentstream`**, the **implementation stack is pre-locked**. Do **not** choose Python, Vitest, or a top-level `tests/` tree in refine-plan.

### Required PLAN section: Locked stack

Copy into **`tied-project/working/{REQ-TOKEN}/PLAN.md`**:

| Field | Value |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Language | TypeScript (ESM) |
| Product paths | `src/**/*.ts` |
| Test paths | `src/**/*.test.ts` (colocated) |
| Verify command | `npm test` |

Source of truth: preload `implementation_contract` + seeded `package.json` scripts.

### What refine-plan still resolves

- Product ambiguity called out in the PROMPT-WF remainder (policies, edge cases, acceptance criteria).
- REQ token naming and module boundaries for **this** product.
- CITDP `depth_tier` / `gate_policy` (typically **minimal** / **advisory** for batch trials).

### Forbidden in refine-plan

- Switching language or test runner.
- Deleting seeded `package.json` / `tsconfig.json` without sponsor waiver documented in handoff.

Write **`evidence/phase-handoff-refine-plan.md`** noting stack copied from preload and next `@build-plan`.
