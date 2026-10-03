# gitignore-close-out-hygiene — REQ-TIED_CLAUDE_LIVE_DRIVER

**Date:** 2026-09-24  
**Slice:** R4 dual REQ close-out (shared with BOOTSTRAP hygiene)

## Classification

| Path | Class | Notes |
| --- | --- | --- |
| `docs/comparisons/**` | **ignore** (intentional) | Local-only; comparison doc edits not staged |
| `working/REFINE-*/` | **ignore** | Ephemeral refine scratch (`.gitignore`) |
| `working/**/gate-args*.json` | **ignore** | One-off gate validate payloads |
| `working/REQ-TIED_CLAUDE_LIVE_DRIVER/gates/*.json` | **track** | Existing `!` negations for gate receipts |
| `mcp-server/test/fixtures/**/request-evidence-envelope.v1.json` | **do not stage** | Regenerated fixture noise |

## Handoff

**N/A for new patterns:** LIVE_DRIVER gate trackability already covered; R4 commit uses plan §7 allowlist only.

Reference: `working/REQ-TIED_CLAUDE_BOOTSTRAP_OPS/evidence/gitignore-close-out-hygiene.md` for shared `working/REFINE-*/` additions.
