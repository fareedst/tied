# REVIEW.md — path-scoped review guidance (example)

**Schema:** `path-scoped-REVIEW.v1` · **Copy to:** `<module-root>/REVIEW.md` and edit.

---

## Scope

- **Paths:** `src/example-module/**` (adjust)
- **Owners:** `@team-or-role` (optional)

## Focus

- Public API stability for `ExampleService`
- Input validation on external-facing handlers
- No silent behavior change to persisted formats

## Executable checks

```bash
# From repository root — adjust to your package layout
npm run lint:example-module
npm test -- src/example-module
```

See [pre-handoff verification charter](../../tied-bundle/docs/pre-handoff-verification-charter.md) for global handoff checks (adjust relative path when copied).

## Convergence

- Cap review rounds per [review convergence policy](../../tied-bundle/docs/review-convergence-policy.md)
- Re-review **diffs only** after the first pass

## Risk tier

- **`depth_tier`:** default `minimal`; escalate to sponsor for schema migrations (**costly choice**)

## Non-goals

- Do not add MCP gate authority or change TIED REQ/ARCH/IMPL from this file alone

## Proof boundary

This file guides human/agent attention only. It does **not** satisfy **`tied_checklist_gate_validate`**, **`tied_verify`**, or PR merge policy.
