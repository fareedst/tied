# Facilitator verification — 1795017442-wf-agentstream-wf-01-claude-claudehaiku55low

**Client root:** `/Users/fareed/Documents/dev/test/1795017442-wf-agentstream-wf-01-claude-claudehaiku55low`  
**Product REQ:** `REQ-SEMVER_COMPARATOR`  
**Captured:** 2026-11-18 (`@record-wf-trial`)

## Commands

```bash
export TIED_BASE_PATH="{client}/tied-project"
export TIED_CLIENT_BUNDLE_PATH="{client}/tied-bundle"
export TIED_STORE_ROOT="/Users/fareed/Documents/dev/chatgpt/stdd"
cd /Users/fareed/Documents/dev/test/1795017442-wf-agentstream-wf-01-claude-claudehaiku55low
git log -1 --format='%H %s'
npm test
.cursor/skills/tied-yaml/scripts/tied-cli.sh tied_validate_consistency  # from store checkout
```

## Git HEAD

- **`6cd75983483871ac7dd0739a85cf38ace9bc2a1a`** — `feat(semver): add satisfies comparator module` (bootstrap **`ba45364`**)

## Result

- **22/22** tests pass (`src/semver-satisfies.test.ts`)

## Orchestrator manifest

- Path: `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json`
- **exit_code:** 0
- **Wall:** **~293s** (`15:57:23` → `16:02:16` UTC)

## Gate receipts

- `verification-2026-11-18T16-00-16-722Z.json` — `allowed: true`
- `close_out-2026-11-18T16-01-18-794Z.json` — `allowed: true`

## TIED validate

- `tied_validate_consistency` on client scope: **`ok: false`** (inherited store missing-ref noise); archived `tied-validate-consistency.json` (CLI stdout may include `DIAGNOSTIC:` lines).

## Store cross-links

- [REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION](../../../../working/REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION/PLAN.md) — post-ship regression class
- Prior fail cohort: [1794981051 readout](../../../../docs/agent-harness-evaluation/readouts/trial-readout-PROMPT-WF-01-claudehaiku55low-1794981051-wf-agentstream-wf-01-claude-claudehaiku55low.md)