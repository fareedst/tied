# Debug handoff — WF-01 @ 1794974815 (interleaved RETURN trap)

**workspace:** `/Users/fareed/Documents/dev/test/1794974815-wf-agentstream-wf-01-claude-claudehaiku55low`  
**orchestrator exit:** `1` (manifest `wf-trial-orchestrator-run.v1.json`)  
**harness:** claude · **model:** claude-haiku-5-5 · **effort:** low

---

## DEBUG — what worked

| Signal | Meaning |
|--------|---------|
| `interleaved phase 1/4` … `4/4` | **Resume chain fixed** — dual-stream `session_id` parse (REQ-WF_TRIAL_INTERLEAVED_RESUME_CAPTURE). |
| `four-phase batch complete (reconcile after turn 1)` | All four subprocess invokes finished exit 0 inside `wf_trial_four_phase_run_interleaved`. |
| `slim tracker reconcile: valid slim shape (no replace)` | REQ-WF_TRIAL_SLIM_TRACKER_INTER_TURN reconcile path OK for `REQ-SEMVER_COMPARATOR_SATISFIES`. |

Prior incident **1794973656** (`missing session_id after turn 1`) is **not** reproduced on this cell.

---

## DEBUG — primary failure (new)

```text
scripts/run-traditional-four-phase-agentstream.sh: line 373: stdout_file: unbound variable
```

**Interpretation:** `run-traditional-four-phase-agentstream.sh` runs with `set -euo pipefail`. After interleaved batch success, a **RETURN trap** in `wf_trial_four_phase_run_interleaved` runs:

```48:48:scripts/lib/wf-trial-interleaved-four-phase.inc.sh
  trap 'rm -f -- "${stdout_file}" "${stderr_file}"' RETURN
```

On function **RETURN**, bash can run the trap after `local stdout_file` / `stderr_file` are torn down. With **`set -u`**, expanding unset `stdout_file` in the trap aborts the shell (often reported on the **next** line in the caller — here `source wf-trial-envelope-depth-check.inc.sh` ≈ line 373).

**Not** an agentstream / Claude / session_id regression.

---

## DEBUG — downstream (may be latent)

User paste truncates before phase-handoff / proof-manifest lines. With orchestrator `exit_code: 1` from the trap, post-four-phase gates may still run; verify `process.stderr.log` tail for:

- `ERROR: WF trial phase handoff gate: missing … phase-handoff-refine-plan.md` (only if turns 2–4 did not write handoffs — **unlikely** if live agent completed all phases)
- `ERROR: WF trial proof manifest gate: files[0].path not found` (agent scaffold; separate from interleave)

---

## Fix (build-plan / hotfix scope)

| Option | Action |
|--------|--------|
| A (preferred) | Remove RETURN trap; `rm -f` temp files at normal function exit paths (and before each `return`). |
| B | Trap body uses non-local globals set once (`_wf_interleaved_stdout_file=…`) so RETURN expansion stays bound under `set -u`. |
| C | `trap - RETURN` immediately before `return 0` after explicit `rm`. |

Add regression: invoke `wf_trial_four_phase_run_interleaved` under `set -u` in `workflow-trial-agentstream-sh.test.mjs` (stub, mirrors production `run-traditional-four-phase-agentstream.sh`).

---

## Verification after fix

```bash
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs --test-name-pattern "interleaved"
HARNESS=claude workflow_trial_agentstream wf-01   # live smoke
```

Expect: no `stdout_file: unbound variable`; orchestrator `exit_code: 0` if gates satisfied.

---

## Handoff

- **Owner REQ:** REQ-WF_TRIAL_INTERLEAVED_RESUME_CAPTURE (trap hygiene)  
- **Related:** REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT (`set -u` in four-phase wrapper)  
- **Fix shipped:** RETURN trap removed; explicit `_wf_trial_interleaved_rm_capture_files` + test `SC-WF-IRC-04` (`set -u`)  
- **Verified:** [verification-live-wf-01-1794975372.md](./verification-live-wf-01-1794975372.md) — `1794975372-wf-agentstream-wf-01-claude-claudehaiku55low`, orchestrator `exit_code: 0`, ~274s.
- **Close-out:** `close_out` gate allowed (minimal, advisory).