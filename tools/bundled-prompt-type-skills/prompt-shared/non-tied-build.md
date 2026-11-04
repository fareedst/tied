# Implement (non-TIED sequence — agent mode)

[REQ-PROMPT_TYPE_SKILL_EXECUTION_MODE]

For **`non-tied-build`**. Requires linked plan under `tied-project/non-tied-plans/{slug}/` or in-message plan.

## Implement (when design is composed)

**Shell scripts:** Read [agent-shell-working-directory.md](agent-shell-working-directory.md) and [agent-shell-script-header.template.sh](agent-shell-script-header.template.sh).

1. RECORD vocabulary when terms change.
2. RED tests before code (TDD).
3. Ordinary source/test changes per linked plan.
4. RECORD vocabulary after tests/code.

**Boundary:** No project REQ/ARCH/IMPL YAML, no IMPL sidecars, no `tied_verify` with update — see [non-tied-boundary.md](non-tied-boundary.md).

**Handoff:** `@non-tied-close` when implementation is ready for scoped commit.
