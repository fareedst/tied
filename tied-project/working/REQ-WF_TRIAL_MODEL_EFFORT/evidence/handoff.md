# Handoff — REQ-WF_TRIAL_MODEL_EFFORT

**handoff_kind:** prompt-skill-disk  
**request_token:** REQ-WF_TRIAL_MODEL_EFFORT  
**date:** 2026-11-09  
**plan_phase:** close-out-ready  
**traceable_commit:** `ccafc9ba`  
**plan:** [../PLAN.md](../PLAN.md)

---

## What shipped

1. **Shell matrix API** — `workflow_trial_range` gains a **4th positional effort** (`low|medium|high|xhigh|max` or `-`). Breaking change: insert `-` before former `end`.

   ```bash
   workflow_trial_range cursor composer-2.5-fast composer.2.5 medium 8 1
   ```

2. **Propagation** — `MODEL_EFFORT` → disposable tag suffix, orchestrator manifest `model_effort`, four-phase batch, `tied agentstream --model-effort`.

3. **Claude harness** — `agentArgv` adds `--effort`; live turns set `CLAUDE_CODE_EFFORT_LEVEL`.

4. **Cursor harness** — `--model` bracket `effort=` when effort set; default `--approve-mcps`; `--add-dir` for linked `TIED_STORE_ROOT`; optional performance flags via env.

---

## Operator quick reference

| Env / flag | Purpose |
| --- | --- |
| `MODEL_EFFORT` | Canonical level from `workflow_trial_range` or export |
| `--model-effort` | agentstream CLI (overrides env when set) |
| `AGENTSTREAM_CURSOR_MODEL_BRACKET_EFFORT=0` | Plain `--model` slug (phase-1 style) |
| `AGENTSTREAM_CURSOR_MODEL_OVERRIDES` | e.g. `context=1m,fast=false` merged into bracket |
| `AGENTSTREAM_CURSOR_KEEP_MCPS=1` | Omit `--approve-mcps` |
| `AGENTSTREAM_CURSOR_AUTO_REVIEW=1` | Add `--auto-review` |
| `AGENTSTREAM_CURSOR_STREAM_PARTIAL=1` | Add `--stream-partial-output` |

Vocabulary: [tied-project/vocab/agentstream.md](../../../vocab/agentstream.md) (model effort).

---

## Verification

```bash
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
cd mcp-server/packages/agentstream && npm run build \
  && find src -name '*.test.ts' -print0 | xargs -0 npx tsx --test
```

Dry-run spot-check:

```bash
source scripts/build-commands.sh
workflow_trial_range cursor composer-2.5-fast composer.2.5 medium 1 1 echo_exec --dry-run
# Expect --approve-mcps and --model …[effort=medium] on rendered command
```

---

## Completion signals

| Signal | Result | Evidence |
| --- | --- | --- |
| Machine close_out | pass | [closeout-run-close-out-gates-final.json](./closeout-run-close-out-gates-final.json) — `merged_decision.allowed=true`, `blocking_gap_count=0` |
| Process contract | pass | `--sync-dispositions --reconcile`; grade **B** / `thin_ledger` advisory |
| Adherence ledger | partial | minimal depth; no integrated inquiry chain |

**Upstream feedback:** N/A

---

## TIED tokens

- [REQ-WF_TRIAL_MODEL_EFFORT](../../../requirements/REQ-WF_TRIAL_MODEL_EFFORT.yaml)
- [ARCH-WF_TRIAL_MODEL_EFFORT](../../../architecture-decisions/ARCH-WF_TRIAL_MODEL_EFFORT.yaml)
- [IMPL-WF_TRIAL_MODEL_EFFORT](../../../implementation-decisions/IMPL-WF_TRIAL_MODEL_EFFORT-pseudocode.md)
- [CITDP-REQ-WF_TRIAL_MODEL_EFFORT.yaml](../../../citdp/CITDP-REQ-WF_TRIAL_MODEL_EFFORT.yaml)

---

## Key code touchpoints

| Area | Path |
| --- | --- |
| Range helper | `scripts/build-commands.sh` (`workflow_trial_range`) |
| Effort validate | `scripts/lib/wf-trial-model-effort.inc.sh` |
| Cursor argv | `mcp-server/packages/agentstream/src/cursor-agent-argv.ts` |
| Bracket model | `mcp-server/packages/agentstream/src/model-effort.ts` |
| Executor | `mcp-server/packages/agentstream/src/executor-dry-run.ts` |

---

## Optional follow-ups

- [ ] `how workflow-trial-range` in `scripts/_build_commands_cli_guide.inc.sh`
- [ ] Live matrix cell with `MODEL_EFFORT=medium`
- [ ] `git push` for `ccafc9ba` when ready

**Excluded from commit `ccafc9ba`:** `REQ-TIED_AGENT_LOADER_REFRESH` drift, `FACILITATOR-WF-*` trees, untracked WF-08 readout markdown.

---

## Related evidence

| File | Role |
| --- | --- |
| [session-handoff.md](./session-handoff.md) | Plan execution checklist |
| [close-out-handoff.md](./close-out-handoff.md) | Close-out summary |
| [build-plan-verification-evidence.md](./build-plan-verification-evidence.md) | Test commands |
| [traceable-commit-evidence.md](./traceable-commit-evidence.md) | Staging scope |
| [verification-evidence-manifest.v1.json](./verification-evidence-manifest.v1.json) | Machine manifest |
