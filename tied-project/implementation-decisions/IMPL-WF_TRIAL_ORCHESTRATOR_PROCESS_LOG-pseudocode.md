# [IMPL-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG] [ARCH-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG] [REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG] — Orchestrator stdout/stderr capture and manifest.

Grammar-Version: v2

## WF_TRIAL_PROCESS_LOG_ENABLED

- [IMPL-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG] [ARCH-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG] [REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG] Gate default-on capture unless sponsor opts out.
- Contract:
  - INPUT: env WF_TRIAL_SKIP_PROCESS_LOG
  - PRE: none
  - OUTPUT: boolean enabled
  - POST: WF_TRIAL_SKIP_PROCESS_LOG=1 → disabled; unset or 0 → enabled
  - EFFECTS: when disabled, bind/finalize are no-ops; no evidence dir

## WF_TRIAL_PROCESS_LOG_BIND_WORKSPACE

- [IMPL-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG] [ARCH-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG] [REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG] Create evidence files, prepend bootstrap stderr, attach tee, register EXIT trap.
- Contract:
  - INPUT: workspace, wf_id, repo_root, harness, model_slug, model_config, disposable_tag, dry_run, bootstrap_stderr_prepended
  - PRE: workspace is absolute directory; enabled() true
  - OUTPUT: evidence dir with process.stdout.log, process.stderr.log, manifest stub
  - POST: exec redirects through tee -a; trap calls finalize on EXIT
  - EFFECTS: overwrites prior log files on re-run
  - FAILURE_MODES: mkdir/write failure → orchestrator fail (set -e)

## WF_TRIAL_PROCESS_LOG_FINALIZE

- [IMPL-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG] [ARCH-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG] [REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG] Complete manifest and emit DIAGNOSTIC pointer.
- Contract:
  - INPUT: exit_code
  - PRE: manifest path set by bind
  - OUTPUT: manifest with finished_at, exit_code; DIAGNOSTIC line on stderr
  - POST: idempotent if called twice (trap + explicit)
  - EFFECTS: does not mutate log file contents after tee flush
