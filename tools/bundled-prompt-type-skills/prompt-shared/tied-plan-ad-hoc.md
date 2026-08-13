# Plan (when the request is refined) — ad-hoc

## Plan (when the request is refined)

1. **CITDP + LEAP + TIED:** Read `tied/docs/client-development-index.md` first -- it maps nicknames to paths, scenarios, YAML data, and tooling.
2. Read task-relevant IMPL pseudo-code (`./tied/implementation-decisions/IMPL-*-pseudocode.md` in scope from impact discovery).
3. Perform CITDP **analysis** (`change-definition`, impact, **`risk-assessment`**, **`test-strategy`**). Persist `tied/citdp/CITDP-*.yaml` **after** implementation (see **Change records** / `citdp-policy.md`).
4. Design tests and security mitigations per **Checklist** / **`test-strategy`**. If behavior changes, write RED (failing) tests that lock the **desired** behavior--not silent preservation of the old behavior unless that is the explicit goal.
5. If a change is recommended but out of scope, capture it in `leap-proposals/` (if the project uses it) or a dated note in the task working folder for a future CITDP evaluation.

**Gate:** Do not start code until IMPL pseudo-code (with block token comments) and test strategy are in place.
