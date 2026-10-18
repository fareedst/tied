# traceable-commit prep — program tranche (commit deferred)

**Date:** 2026-10-18 · **Slug:** traceable-commit · **Commit:** not executed (plan-close-out boundary)

## Vocab VALIDATE ([PROC-VOCABULARY_INDEX] Touchpoint 3)

- [project-operations-mcp.md](../../../vocab/project-operations-mcp.md) — `handoff`, `clear-workspace`, `tied_git_hygiene` terms recorded
- [routing.md](../../../vocab/routing.md) — row 2c links handoff + clear-workspace

## Staging map (all-dirty tranche)

Stage **program core** and **collateral** together per sponsor scope:

1. **Skills + bootstrap:** `tools/bundled-*-skill/`, `tools/bootstrap/**`, `mcp-server/src/e2e/client-bootstrap-skills.test.ts`, `mcp-server/src/e2e/prompt-type-skills.test.ts`
2. **TIED project YAML:** `tied-project/requirements*.yaml`, detail dirs for SESSION_HANDOFF + CLEAR_WORKSPACE, `semantic-tokens.yaml`, `architecture-decisions.yaml`, `implementation-decisions.yaml`, `tied-project/citdp/CITDP-REQ-TIED_*`
3. **Working (committed process evidence):** `tied-project/working/PLAN-HANDOFF-CLEAR-WORKSPACE-SKILLS/**`, `REQ-TIED_SESSION_HANDOFF_SKILL/**`, `REQ-TIED_CLEAR_WORKSPACE_SKILL/**` — **exclude** gitignored regenerable envelopes if `git add` respects ignore (optional `git add -f` only if sponsor wants envelopes in git; default omit)
4. **Vocab:** `tied-project/vocab/project-operations-mcp.md`, `routing.md`
5. **Collateral:** adversarial fixture envelopes, source-graph index JSON, JEV benchmark JSON, envelope-gap report, pre-handoff charter, context-adaptive practice YAML, checklist gate regression manifest — only if intentionally part of this tranche (same commit message documents them)
6. **CHANGELOG:** [CHANGELOG.md](../../../CHANGELOG.md)

## Proposed message

[proposed-commit-message.txt](proposed-commit-message.txt)

## Close-out receipts

- [plan-close-out-handoff.md](plan-close-out-handoff.md)
