# Close-out handoff — REQ-AGENTSTREAM_CLAUDE_WF_PARITY

**Date:** 2026-11-04  
**Request:** Agentstream Claude WF-03 harness product parity  
**Plan:** [../PLAN.md](../PLAN.md) · **CITDP:** [../../../citdp/CITDP-REQ-AGENTSTREAM_CLAUDE_WF_PARITY.yaml](../../../citdp/CITDP-REQ-AGENTSTREAM_CLAUDE_WF_PARITY.yaml)

## What shipped

**Goal:** Close **harness/orchestrator** gaps so Claude on the four-phase PROMPT-WF-03 batch can reach the same **product class** and **close_out** fingerprint as Cursor gold (`1793760220-wf-agentstream-wf-03`)—not model-capability fixes.

| Pillar | Deliverable |
| --- | --- |
| **A** | `claudeMcpConfigArgs()` — `--strict-mcp-config` / `--mcp-config`; opt-out `AGENTSTREAM_CLAUDE_STRICT_MCP=0` |
| **B** | `{{SKILL_ROOT}}` in batch YAML + expansion in `run-traditional-four-phase-agentstream.sh`; Claude preflight in `workflow-trial-agentstream.sh` (live) |
| **C** | `harness-turn-trace.ts` + `AGENTSTREAM_HARNESS_TRACE=1` hook in `live-executor.ts` |
| **D** | `scripts/dual-harness-wf03-parity-smoke.sh --dry-run-only` |

**TIED:** `REQ-AGENTSTREAM_CLAUDE_WF_PARITY` · `ARCH-AGENTSTREAM_CLAUDE_WF_PARITY` · `IMPL-AGENTSTREAM_CLAUDE_WF_PARITY` (REQ status **Implemented**); pseudo-code sidecar; vocab updates in `tied-project/vocab/agentstream.md`.

## Completion signals

- **Machine close-out:** **pass** — `close_out` `allowed: true`, `blocking: false`; envelope `blocking_gap_count: 0` at `request-evidence-envelope.v1.json` (regenerable; validated at close-out). Gate receipt: `tied-bundle/working/REQ-AGENTSTREAM_CLAUDE_WF_PARITY/gates/close_out-2026-11-04T16-00-56-985Z.json`.
- **Process contract:** **partial** — `verification-evidence-manifest.v1.json` committed; tracker not every slug manually dispositioned; auto-collect used pre-fix CITDP command paths for some rows (gate still allowed).
- **Adherence ledger:** **partial** — reconcile `process_grade` band **B** (88); `thin_ledger` / `legacy_no_adherence_chain` warn at **minimal** depth (expected).
- **Workspace cleanliness (scoped REQ):** **pass** — scoped traceable commit; unrelated REQ WIP left unstaged (see below). Hygiene: [git-hygiene-receipt-2026-11-04.md](./git-hygiene-receipt-2026-11-04.md). Staging map: [traceable-commit-evidence.md](./traceable-commit-evidence.md).

**Upstream feedback capture:** N/A — no MCP receipt / store `fb-*` this wave.

## Commit

**SHA:** `b0c7e854` — `feat(agentstream): Claude WF-03 harness parity`

## CI / local checks

```bash
cd mcp-server/packages/agentstream && npm test
node --test tools/bootstrap/run-traditional-four-phase-agentstream-sh.test.mjs
bash scripts/dual-harness-wf03-parity-smoke.sh --dry-run-only
```

## Manual proof (out of default CI)

Use the same **MODEL_SLUG** as the gold Cursor cell:

```bash
export HARNESS=claude AGENTSTREAM_CLAUDE_LIVE_OK=1
# optional: AGENTSTREAM_HARNESS_TRACE=1
./scripts/workflow-trial-agentstream.sh wf-03
```

**Pass threshold (PLAN §3):** parity fingerprint vs `1793760220-wf-agentstream-wf-03` — product tests green, envelope, `close_out allowed: true`, inventory sponsor turns 3–4 complete.

## Unstaged repo drift (not in `b0c7e854`)

Other waves—do not fold into this REQ without a new CITDP:

- `mcp-server/packages/agentstream/src/claude-driver.ts`, `live-driver-bind.ts`, `harness-dry-run-composition.test.ts`
- `REQ-TIED_RUNTIME_DISK_CONFIG`, `REQ-TIED_GIT_HYGIENE`, prompt-type / JEV checklist copies
- `tools/bootstrap/build-commands-test-all-hygiene.test.mjs` (untracked)

`@clear-workspace` is **not** required for this REQ unless recovering a failed close-out.

## Suggested next steps

1. Push `b0c7e854` when ready (not done in close-out session).
2. Optional: one live Claude wf-03 run + update `trial-workflow-interaction-inventory.v1.json` on disposable client.
3. Optional: separate commit or discard unstaged agentstream driver WIP.
4. Optional: re-run `run-close-out-gates.mjs` after refreshing verification manifest if all manifest rows must show exit 0.

## Traceability

**Depends / extends:** `REQ-TIED_CLAUDE_LIVE_DRIVER`, `REQ-TIED_CLAUDE_HARNESS`, `REQ-GOAGENT-FEATURESPEC-BATCH`.

**Related docs:** [mcp-server/packages/agentstream/README.md](../../../../mcp-server/packages/agentstream/README.md) (MCP argv + dual-harness smoke section).
