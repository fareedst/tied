# [IMPL-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE] [ARCH-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE] [REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE]

Grammar-Version: v2

## WF_ORCHESTRATOR_PROOF_MANIFEST_GATE

- [IMPL-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE] [ARCH-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE] [REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE] Default-on L3 gate; G5 all PROMPT-WF; wave 2 removes REQUIRE env.
procedure GATE_ENABLED:
  Contract:
    INPUT: WF_TRIAL_SKIP_PROOF_MANIFEST, dry_run flag
    OUTPUT: boolean gate_active
    PRE: gate inc sourced
    POST: SKIP emits DIAGNOSTIC and returns false; otherwise true with one-time default-on DIAGNOSTIC
  RETURN false WHEN skip set
  RETURN true otherwise

procedure ORCHESTRATOR_MANIFEST_GATE:
  Contract:
    INPUT: WORKSPACE, WF_NORM, REPO_ROOT, FOUR_PHASE_EXIT, DRY_RUN
    OUTPUT: process exit code
    PRE: gate inc sourced
    POST: four-phase non-zero preserved; gate elevates 0 to 1 when invalid
  IF GATE_ENABLED AND applies(WF-01..12) THEN seed scaffold if absent
  RUN four-phase
  IF NOT dry_run AND GATE_ENABLED THEN run Node min-shape validator
  RETURN max(four_phase, gate) with four-phase precedence

procedure MANIFEST_FILE_PRESENCE:
  Contract:
    INPUT: manifest JSON, workspace root
    OUTPUT: ok, errors[] with FILE_EXISTS and FILE_COVERAGE codes
    PRE: min shape validation passed
    POST: every files[].path exists on disk; when src/**/*.test.ts count > 0, len(files) >= test count
  FOR each files[].path VERIFY fs.existsSync under workspace
  IF test_file_count > 0 AND len(files) < test_file_count THEN FAIL FILE_COVERAGE
