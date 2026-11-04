# [IMPL-WF_TRIAL_FOUR_PHASE_HARDENING] [ARCH-WF_TRIAL_FOUR_PHASE_HARDENING] [REQ-WF_TRIAL_FOUR_PHASE_HARDENING] — Bootstrap preload, orchestrator preflight, and four-phase adjunct hooks.

Grammar-Version: v2

## MATERIALIZE_DISPOSABLE_PRELOAD_CONTRACT

- [IMPL-WF_TRIAL_FOUR_PHASE_HARDENING] [ARCH-WF_TRIAL_FOUR_PHASE_HARDENING] [REQ-WF_TRIAL_FOUR_PHASE_HARDENING] Copy bundle preload template into tied-project when disposable client lacks project contract.
- Contract:
  - INPUT: workspace_root (absolute disposable client path)
  - PRE: workspace_root/tied-bundle/docs/agent-preload-contract-template.yaml is readable
  - OUTPUT: { path: workspace_root/tied-project/agent-preload-contract.yaml } | { skipped: reason }
  - POST: resolve_preload_contract first candidate exists when copy occurred
  - EFFECTS: does not overwrite existing tied-project/agent-preload-contract.yaml
  - FAILURE_MODES: template missing → DIAGNOSTIC skip (orchestrator continues with legacy fallback)

## WF_TRIAL_RECONCILE_PREFLIGHT

- [IMPL-WF_TRIAL_FOUR_PHASE_HARDENING] [ARCH-WF_TRIAL_FOUR_PHASE_HARDENING] [REQ-WF_TRIAL_FOUR_PHASE_HARDENING] Check store MCP dist before live four-phase batch when reconcile may run at close-out.
- Contract:
  - INPUT: store_root (TIED store REPO_ROOT), env WF_TRIAL_SKIP_RECONCILE_PREFLIGHT, env WF_TRIAL_STRICT_RECONCILE
  - PRE: store_root contains tied-install.sh marker
  - OUTPUT: { ok: true } | { ok: false, remediation: string, dist_path: string }
  - POST: ok false prints DIAGNOSTIC to stderr; STRICT=1 → exit 2; else continue
  - EFFECTS: remediation names ./build-workspace.sh from store root

## PHASE_HANDOFF_ARTIFACT

- [IMPL-WF_TRIAL_FOUR_PHASE_HARDENING] [ARCH-WF_TRIAL_FOUR_PHASE_HARDENING] [REQ-WF_TRIAL_FOUR_PHASE_HARDENING] Normative handoff filenames for cold batch sessions.
- Contract:
  - INPUT: skill_slug in { add-feature, refine-plan, build-plan, close-out }, request_token
  - PRE: tied-project/working/{request_token}/ exists
  - OUTPUT: tied-project/working/{request_token}/evidence/phase-handoff-{skill_slug}.md
  - POST: file lists RESOLVE locks, gate receipts paths, next skill name
  - EFFECTS: complements /handoff session-handoff.md (product REQ); both may coexist

## RED_EVIDENCE_ARCHIVE_HINT

- [IMPL-WF_TRIAL_FOUR_PHASE_HARDENING] [ARCH-WF_TRIAL_FOUR_PHASE_HARDENING] [REQ-WF_TRIAL_FOUR_PHASE_HARDENING] build-plan adjunct mandates RED stdout capture when tests exist.
- Contract:
  - INPUT: test_command, manifest_dir under working/{REQ}/evidence/quality-manifest/
  - PRE: build-plan skill active; composition or unit tests planned
  - OUTPUT: *-red.stdout.txt and optional *-red.stderr.txt paths before GREEN archive
  - POST: verification-evidence-manifest may list red_stdout_ref when present
  - EFFECTS: facilitator test-strategy grading can cite failing-run artifact
