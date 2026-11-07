# PLAN — [REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT]

**Trial context:** store TIED repo (methodology); not a disposable WF matrix client.

**Phase:** build-plan complete (implementation on disk; close-out deferred). Tests green; no commit in this turn unless sponsor requests.

**Request token:** `REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT`  
**Workflow:** `add-feature` → `refine-plan` → `@build-plan` → `@close-out`

**Trigger:** Facilitator comparison of Composer Cursor WF trials (`1794042383`, `1794044147`) vs complete cells (`1793820250`, `1793851888`, `1794043043`). Deterministic shell bug when `node … agentstream` exits non-zero under `set -euo pipefail`.

---

## Sponsor remainder (resolved)

Harden **`run-traditional-four-phase-agentstream.sh`** so a failed four-phase agentstream run:

1. Propagates the **real** agentstream exit code to `workflow-trial-agentstream.sh` / manifest `exit_code`.
2. Does **not** append misleading `expanded_batch: unbound variable` to `process.stderr.log`.
3. Remains covered by **`run-traditional-four-phase-agentstream-sh.test.mjs`** (extend beyond dry-run-only `T-EXIT-TRAP-01`).

**Out of scope (separate work):** `RetriableError: WritableIterable is closed` and turn-2 `session_id` absence in Cursor live executor — agentstream driver reliability, not this shell patch.

---

## Problem statement (locked)

| Mechanism | Current behavior | Desired behavior |
| --- | --- | --- |
| **`set -e` + failed `"${cmd[@]}"`** | Errexit exits `main` before `local agentstream_exit=$?` | Capture exit code with `set +e` around invocation inside **inc.sh** helper, then wrapper `exit` with that code |
| **EXIT trap + `local expanded_batch`** | Trap body uses `'rm -f "$expanded_batch"'`; after errexit, local is gone → unbound under `set -u` | Bake absolute temp path in trap at registration (inc.sh owns trap registration) |
| **Facilitator logs** | Failed matrix cells show shell error after turn 2 banner | Stderr shows agentstream diagnostics only; manifest `exit_code` matches agentstream |

**Evidence:** process logs on clients `1794042383-wf-agentstream-wf-05-cursor-composer25`, `1794044147-wf-agentstream-wf-01-cursor-composer25`; readouts `docs/demos/trial-readout-PROMPT-WF-*-composer25-179404*.md`.

---

## Scope

| In | Out |
| --- | --- |
| `scripts/run-traditional-four-phase-agentstream.sh` (thin orchestration) | `mcp-server/packages/agentstream` live Cursor driver |
| **`scripts/lib/wf-trial-run-four-phase-agentstream.inc.sh`** (new) | `WF_TRIAL_TEST_*` env hooks on production orchestrator path |
| `tools/bootstrap/run-traditional-four-phase-agentstream-sh.test.mjs` | Changing four-phase batch YAML turn content |
| Optional LEAP note in `record-wf-trial` reference | Full WF matrix rerun as CI gate |

---

## Locked decisions (refine-plan)

| ID | Decision | Rationale |
| --- | --- | --- |
| **D3-TEST** | **inc.sh extract** for agentstream invoke + exit capture; **reject** `WF_TRIAL_TEST_STUB_AGENTSTREAM_EXIT` / `WF_TRIAL_TEST_HARNESS` on production wrapper | Sponsor choice; avoids prod/test env branching in operator path |
| **D3-MODULE** | New `scripts/lib/wf-trial-run-four-phase-agentstream.inc.sh` patterned after `wf-trial-process-log.inc.sh` | Composition test can `source` inc and stub `cmd` without full wrapper / built CLI |
| **D3-API** | `wf_trial_four_phase_prepare_expanded_batch(template, outvar)` — **must not** be called inside `$(…)`; uses internal `_wf_expanded_batch_path` so `printf -v` does not shadow `outvar`; `wf_trial_four_phase_run_agentstream` runs argv with `set +e` and returns exit status | Fixed shadowing bug found in RED |
| **D1-D2** | Wrapper `main` sources inc, calls prepare + build `cmd` as today, then `agentstream_exit=$(wf_trial_four_phase_run_agentstream …)` or equivalent | Single production entrypoint unchanged for operators |
| **D-ENV** | No new first-party env vars ([REQ-TIED_ENVIRONMENT_VARIABLE_POLICY]) | Test-only stub lives inside `run-traditional-four-phase-agentstream-sh.test.mjs` bash heredoc |

---

## Proposed implementation (build-plan executes)

| Step | Change |
| --- | --- |
| D1 | Implement `wf_trial_four_phase_run_agentstream`: `set +e`; `"${cmd[@]}"`; `local ec=$?`; `set -e`; return `ec` |
| D2 | Implement `wf_trial_four_phase_prepare_expanded_batch`: mktemp path + `trap "rm -f -- '${path}'" EXIT` + expand placeholders |
| D3 | Refactor `run-traditional-four-phase-agentstream.sh` to source inc and delegate; remove inline trap/invoke block |
| D4 | **T-AGENTSTREAM-EXIT-01**: `spawnSync('bash',['-c', heredoc])` sources inc, calls prepare (minimal template), sets `cmd=(bash -c 'exit 42')`, runs helper; assert status `42`, stderr lacks `expanded_batch: unbound variable` |
| D5 | `node --test tools/bootstrap/run-traditional-four-phase-agentstream-sh.test.mjs` |

**Architecture / implementation tokens (build-plan):** `ARCH-WF_TRIAL_FOUR_PHASE_SHELL_EXIT`, `IMPL-WF_TRIAL_FOUR_PHASE_SHELL_EXIT`.

---

## Acceptance criteria mapping

| ID | Verification |
| --- | --- |
| SC-SHELL-EXIT-01 | T-AGENTSTREAM-EXIT-01 stub exit `42` → captured exit `42` |
| SC-SHELL-TRAP-01 | Same run: stderr lacks `expanded_batch: unbound variable` |
| SC-SHELL-INC-01 | Wrapper sources inc.sh; dry-run / help unchanged |
| SC-SHELL-TEST-01 | Full composition test file green |

---

## Test strategy

See [test-strategy.md](./test-strategy.md) (locked to inc.sh).

---

## Risk / depth

| Field | Value |
| --- | --- |
| `depth_tier` | minimal |
| `gate_policy` | advisory |
| Consequence ladder | **Reversible** — shell-only |

---

## Handoff

**Next:** `@build-plan` — ARCH/IMPL pseudo-code, RED T-AGENTSTREAM-EXIT-01, implement inc.sh + wrapper refactor, `tied_validate_consistency`.
