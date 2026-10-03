# Operator attestation — Claude-first factory + validation smoke

**Date:** 2026-09-24  
**Sponsor attestation:** Disposable client factory and validation smoke completed successfully on operator machine.

## Commands reported successful

1. **`test-new-claude-tied-client`** (bash via `scripts/build-commands.sh` or equivalent) — disposable client under `$HOME/Documents/dev/test/<timestamp-dir>`.
2. **`node scripts/run-tied-claude-client-validation.mjs --client-root "$HOME/Documents/dev/test/<timestamp-dir>" --with-claude-code-interactive-smoke`**

## Scope boundary

Bootstrap + MCP validation smoke above; **live agentstream one-turn** recorded separately: [`operator-live-claude-agentstream-2026-09-24.md`](./operator-live-claude-agentstream-2026-09-24.md) (`AGENTSTREAM_CLAUDE_LIVE_OK=1`, exit 0). Full multi-turn lead checklist live remains optional.

## Related evidence

- MCP approval: [`interactive-claude-mcp-approved-stdout.txt`](./interactive-claude-mcp-approved-stdout.txt)
- Onboarding closure: [`interactive-claude-onboarding-2026-09-24.md`](./interactive-claude-onboarding-2026-09-24.md)
