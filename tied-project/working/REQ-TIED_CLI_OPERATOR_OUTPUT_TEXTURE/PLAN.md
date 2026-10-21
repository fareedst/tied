# PLAN — styled `how()` and CLI operator output texture

**Canonical linked plan:** `/Users/fareed/.cursor/plans/styled_how()_cli_output_1962d2f0.plan.md` (Cursor plans; keep working copy in sync on refine)

**Primary REQ:** `[REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE]` · **Related:** `[REQ-TIED_UNIFIED_TOOLCHAIN]`  
**Depth:** `minimal` · **gate_policy:** `advisory`

This file mirrors the refined plan body. For the full document including frontmatter todos, open the linked Cursor plan above.

---

## Summary

- Umbrella **CLI operator output texture**: ANSI when enabled, plain disable via env/flags, **stderr-first help** for chainable stdout.
- First adopter: `how()` in [`scripts/build-commands.sh`](../../../scripts/build-commands.sh).
- Tests: [`tools/bootstrap/build-commands-how.test.mjs`](../../../tools/bootstrap/build-commands-how.test.mjs).
- **Breaking:** help moves stdout → stderr by default; use `how --stdout` or `TIED_CLI_HELP_STDOUT=1` to restore.

See linked plan for: Refine tables, CITDP analysis, flag-peel reference, test matrix, implement order, and gates.
