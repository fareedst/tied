# Session handoff — prompt-type naming product story

**Date:** 2026-10-19  
**Scope:** [REQ-PROMPT_TYPE_GLOBAL_SKILLS], [REQ-PROMPT_TYPE_SUBAGENT]  
**Plans:** [PLAN.md](../PLAN.md), [REQ-PROMPT_TYPE_CLOSE_OUT_RENAME/PLAN.md](../../REQ-PROMPT_TYPE_CLOSE_OUT_RENAME/PLAN.md)

## Finished this session

- **`plan-close-out` → `close-out`** — canonical bundle, agents, manifest, docs, tests (see close-out PLAN).
- **`plan-new-feature` → `add-feature`** — greenfield leaf skill + Task wrapper.
- **`plan-refine-build` → `add-refine-build`** — sequence orchestrator (`add-feature` → `refine-plan` → `build-plan`).
- LEAP: REQ/ARCH/IMPL, CITDP sequence, vocab [prompt-composer.md](../../../vocab/prompt-composer.md), methodology mirrors under `tied-bundle/`.
- **Tests:** `mcp-server` prompt-type e2e **23/23** pass.
- **TIED:** `lint_yaml` on changed YAML; **`tied_validate_consistency`** pass.
- **CHANGELOG** [Unreleased]: close-out + add-feature/add-refine-build bullets.

## Not done (deferred)

- **Git push** — commit landed locally; push when sponsor asks.
- **Machine close-out** — no `close_out` gate, envelope, or `tied_verify` for this naming wave.
- Historical **`tied-project/working/**` archives**, **`docs/demos/**`** — intentionally not rewritten.

## Completion signals (this wave)

| Signal | Status |
|--------|--------|
| Machine close-out | **not_run** — tooling/docs rename only; no gate receipts |
| Process contract | **complete** — implementation + tests + TIED consistency + traceable commit |
| Adherence ledger | **not_run** |

## Commit

- **`9d5c9851`** — `feat(prompt-type): rename add-feature, add-refine-build, close-out` (`git log -1` for full SHA)

## Next steps

1. Push when ready (`main` ahead of origin).
2. Optional: update greenfield demo catalog filenames later (`catalog-greenfield-plan-new-feature-prompts.md`) — out of scope for this wave.
3. On **client** repos (not the store root), run `./tied-install.sh --refresh <client>` to refresh linked skill stubs.

## Blockers

None for review/commit. Breaking invoke names: use **`/add-feature`**, **`/add-refine-build`**, **`/close-out`** only.
