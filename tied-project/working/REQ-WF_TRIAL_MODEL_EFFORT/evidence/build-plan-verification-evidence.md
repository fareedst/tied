# Build-plan verification — REQ-WF_TRIAL_MODEL_EFFORT

**Date:** 2026-11-09

## Phase 1 (complete)

```text
cd mcp-server/packages/agentstream && npx tsc && npm test
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```

## Phase 2 — Cursor CLI argv parity

```text
cd mcp-server/packages/agentstream && npm run build
find src -name '*.test.ts' -print0 | xargs -0 npx tsx --test
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```

**Result:** 124 agentstream unit tests green; 21 bootstrap shell tests green.

**Spot-check**

```bash
# Dry-run should show --approve-mcps and --model …[effort=medium]
workflow_trial_range cursor composer-2.5-fast composer.2.5 medium 1 1 echo_exec --dry-run
```

**Deliverables:** `cursor-agent-argv.ts`, `applyCursorModelForAgent`, frozen oracle `--approve-mcps` delta, LEAP ARCH/REQ/IMPL pseudo-code, vocab + README.
