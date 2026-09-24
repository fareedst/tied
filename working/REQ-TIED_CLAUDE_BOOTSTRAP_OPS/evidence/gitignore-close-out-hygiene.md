# gitignore-close-out-hygiene — REQ-TIED_CLAUDE_BOOTSTRAP_OPS

**Date:** 2026-09-24  
**Scope:** Windows CI workflow + `windows_copy_proven_in_ci` flip close-out; residual working-tree noise.

## Inputs reviewed

Read-only: `git status`, `git check-ignore -v` on representative paths.

## Classification

| Path | Class | Action |
| --- | --- | --- |
| `working/REFINE-CLAUDE_HARNESS_FOLLOWON/**` | **ignore** | Added `working/REFINE-*/` under `# Ephemeral working/` (refine-plan scratch; canonical plan in `~/.cursor/plans/`) |
| `working/**/gate-args*.json` | **ignore** | Added convention pattern for one-off MCP gate validate payloads |
| `working/REQ-TIED_CLAUDE_BOOTSTRAP_OPS/evidence/windows-claude-smoke-proof.md` | **track** | Proof artifact; stage at `traceable-commit` when committing B residual |
| `working/REQ-TIED_CLAUDE_BOOTSTRAP_OPS/evidence/request-evidence-envelope.v1.json` (+ manifest, N/A receipt) | **track** | Existing `!` negations `.gitignore:125–127` |
| `docs/comparisons/**` | **track** | Removed repo-wide ignore (2026-09-24); linked from REQ/CITDP and `tied/docs/client-development-index.md` |
| `mcp-server/test/fixtures/**/request-evidence-envelope.v1.json` (modified) | **revert / do not stage** | Regenerated envelope patch noise |
| `tied/citdp/CITDP-REQ-TIED_CLAUDE_*.yaml`, LIVE_DRIVER tracker edits | **track** | LEAP/refine hygiene; stage only when scoped |
| `working/REQ-TIED_CLAUDE_LIVE_DRIVER/gates/pre_implementation-*.json` | **track** (optional) | `!` negation `.gitignore:94` |
| `.cursor/debug-*.log` | **ignore** | Existing `.gitignore:2` |

## Applied (unstaged)

Under `# Ephemeral working/` block in `.gitignore`:

- `working/REFINE-*/`
- `working/**/gate-args*.json`
- `!working/REQ-TIED_CLAUDE_BOOTSTRAP_OPS/gates/{close_out,pre_implementation,verification}-*.json` (mirror LIVE_DRIVER gate trackability)

## Handoff ([PROC-GITIGNORE_CLOSE_OUT])

**Applied unstaged `.gitignore` additions:** `working/REFINE-*/`, `working/**/gate-args*.json`; stage at `traceable-commit`.

**N/A (already covered):** debug logs, Claude harness gate `!` negations, `working/**/gates/` default with REQ-specific exceptions.
