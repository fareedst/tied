# [IMPL-TIED_ISOLATED_VERIFICATION_RUNNER] [ARCH-TIED_ISOLATED_VERIFICATION_RUNNER] [REQ-TIED_ISOLATED_VERIFICATION_RUNNER] [REQ-TIED_INTENT_CONTROL_PLANE] — Wave 5 isolated verification runner (REQ-CTRL-009).

Grammar-Version: v2

## RUN_DECLARED_QUALITY_COMMANDS_WITH_RUNNER_POLICY

procedure RUN_DECLARED_QUALITY_COMMANDS_WITH_RUNNER_POLICY(input):
  Contract:
    INPUT: QualityCommandRunnerInput; optional project_root
    PRE: declarations validated when executing
    OUTPUT: command_results; execution_runner { mode, entry }
    POST: when verification.isolated_runner true and project_root set, mode is isolated_subprocess and child entry executed; else in_process
    FAILURE_MODES: ISOLATED_RUNNER_MISSING; RUNNER_EXIT_*; RUNNER_JSON_PARSE
    EFFECTS: subprocess spawn when isolated; artifact files on disk
    TERMINATION: all commands complete or fail

  # [IMPL-TIED_ISOLATED_VERIFICATION_RUNNER] — How: REQ-CTRL-009 Option B — verification execution isolated from MCP intent process via dedicated local runner child.
  IF NOT isIsolatedVerificationRunnerEnabled(project_root): RETURN in_process via runDeclaredQualityCommands
  RESOLVE isolated-verification-runner.js entry
  SPAWN node child with scrubbed env (PATH, NODE_OPTIONS, TZ, LANG plus per-command env)
  WRITE JSON payload stdin; READ JSON stdout command_results
  RETURN execution_runner.mode = isolated_subprocess

## RUN_ISOLATED_VERIFICATION_RUNNER_MAIN

procedure RUN_ISOLATED_VERIFICATION_RUNNER_MAIN(input):
  Contract:
    INPUT: stdin JSON QualityCommandRunnerInput
    OUTPUT: stdout JSON { ok, command_results | error }
    PRE: argv-only commands only (no shell)
    POST: same bounds as IMPL-QUALITY_EVIDENCE_COMMAND_RUNNER
    FAILURE_MODES: EMPTY_STDIN; INVALID_STDIN_JSON
    EFFECTS: pure delegation to runDeclaredQualityCommands in child
    TERMINATION: total

  # [IMPL-TIED_ISOLATED_VERIFICATION_RUNNER] — How: CLI entry for dedicated local runner; MCP parent never executes declared argv directly when isolated mode on.

## COLLECT_VERIFICATION_EVIDENCE (amend)

procedure COLLECT_VERIFICATION_EVIDENCE(input):
  # [IMPL-TIED_ISOLATED_VERIFICATION_RUNNER] [IMPL-QUALITY_EVIDENCE_COLLECTION] — How: project_root from input or envelope_patch drives runner policy; manifest records execution_runner for provenance.
  project_root := input.project_root OR envelope_patch.project_root
  DELEGATE RUN_DECLARED_QUALITY_COMMANDS_WITH_RUNNER_POLICY
  INCLUDE execution_runner in verification-evidence-manifest.v1
