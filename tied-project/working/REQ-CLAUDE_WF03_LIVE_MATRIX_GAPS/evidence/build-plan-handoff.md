# Build-plan handoff — REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS

**Date:** 2026-11-04  
**Plan:** [../PLAN.md](../PLAN.md)

## Shipped (code/docs)

| Pillar | Change |
| --- | --- |
| **E** | `assertMcpJsonHarnessContract` uses `pickClientProjectPath` + `resolveTiedLayout` (`expectedClientTiedProjectDir`); smoke/base-path checks aligned |
| **F** | `scripts/lib/wf-trial-claude-preflight.inc.sh`; `WF_TRIAL_STRICT_PREFLIGHT=1` fail-closed in `workflow-trial-agentstream.sh` |
| **G** | Close-out turn hints in `docs/demos/traditional-four-phase-agentstream.yaml` (envelope + `tied_gate_check`) |
| **H** | Confirmed `live-driver-bind` → `spawnCwd: workspace`; regression test in `live-driver-bind.test.ts` |

## TIED

- `ARCH-CLAUDE_WF03_LIVE_MATRIX_GAPS`, `IMPL-CLAUDE_WF03_LIVE_MATRIX_GAPS` + pseudo-code sidecar
- REQ traceability updated; semantic tokens registered

## Tests (local)

```bash
node --test tools/bootstrap/lib/claude-client-validation.test.mjs tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
cd mcp-server/packages/agentstream && npx tsx --test src/live-driver-bind.test.ts
```

## Gates

- `pre_implementation` (`tied_gate_check`): **allowed: true** after tracker `sub-adversarial-inquiry-pass` N/A

## Not done

- **Close-out** / `@close-out` — no commit, no envelope, no `tied_verify` promotion
- **Manual live wf-03** re-run (SC-WF03-MANUAL-PARITY) — operator step
- **Persist CITDP** to `tied-project/citdp/` — close-out step

**Next:** `@close-out` when ready to commit, or manual matrix re-run with `WF_TRIAL_STRICT_PREFLIGHT=1` optional.
