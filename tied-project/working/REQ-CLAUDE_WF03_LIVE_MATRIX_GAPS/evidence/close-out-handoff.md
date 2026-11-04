# Close-out handoff — REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS

**Date:** 2026-11-04  
**Request:** Claude wf-03 live matrix — validation, preflight, and close-out gaps  
**Plan:** [../PLAN.md](../PLAN.md) · **CITDP:** [../../../citdp/CITDP-REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS.yaml](../../../citdp/CITDP-REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS.yaml)

## What shipped

Follow-on to [REQ-AGENTSTREAM_CLAUDE_WF_PARITY](../REQ-AGENTSTREAM_CLAUDE_WF_PARITY/PLAN.md) and [REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG](../REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG/PLAN.md) after live trial client `1793810114-wf-agentstream-wf-03-claude-claudehaiku55` showed false-negative Claude MCP validation and weak close-out operator playbook.

| Pillar | Deliverable |
| --- | --- |
| **E** | `expectedClientTiedProjectDir()` + canonical `TIED_CLIENT_PROJECT_PATH` in `claude-client-validation.mjs` |
| **F** | `wf-trial-claude-preflight.inc.sh`; `WF_TRIAL_STRICT_PREFLIGHT=1` fail-closed in `workflow-trial-agentstream.sh` |
| **G** | Close-out hints in `traditional-four-phase-agentstream.yaml` (`tied_gate_check`, envelope) |
| **H** | `live-driver-bind.test.ts` workspace → `spawnCwd` regression |

**TIED:** REQ **Implemented** · IMPL **Active** ([tied-verify-result.json](./tied-verify-result.json)).

## Completion signals

| Signal | Status |
| --- | --- |
| **Machine close-out** | **pass** — `close_out` `allowed: true`; envelope `blocking_gap_count: 0`. Gate: `tied-bundle/working/REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS/gates/close_out-2026-11-04T17-04-17-869Z.json` (pre-commit reconcile); verify receipt: `close_out-2026-11-04T17-06-15-639Z.json`. |
| **Process contract** | **partial** — [verification-evidence-manifest.v1.json](./verification-evidence-manifest.v1.json); minimal depth; manual wf-03 matrix re-run not in CI. |
| **Adherence ledger** | **partial** — band B at reconcile (thin ledger / minimal depth expected). |

**Upstream feedback capture:** N/A

**Workspace cleanliness:** Scoped commit only; unrelated agentstream driver WIP and other REQ trees left unstaged. Hygiene: [git-hygiene-receipt-2026-11-04.md](./git-hygiene-receipt-2026-11-04.md). Staging: [traceable-commit-evidence.md](./traceable-commit-evidence.md).

## Commit

**SHA:** `a38bbaa5` — `feat(bootstrap): Claude wf-03 live matrix validation and preflight gaps`

## CI / local checks

```bash
node --test tools/bootstrap/lib/claude-client-validation.test.mjs tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
npx tsx --test mcp-server/packages/agentstream/src/live-driver-bind.test.ts
bash scripts/dual-harness-wf03-parity-smoke.sh --dry-run-only
```

## Operator follow-up

- **SC-WF03-MANUAL-PARITY:** Re-run wf-03 Claude matrix cell with `WF_TRIAL_STRICT_PREFLIGHT=1` on a fresh disposable client to confirm live `close_out` fingerprint (not automated in this REQ).
- Sponsor choice: keep `WF_TRIAL_STRICT_PREFLIGHT` opt-in vs always fail-closed (PLAN §8).
