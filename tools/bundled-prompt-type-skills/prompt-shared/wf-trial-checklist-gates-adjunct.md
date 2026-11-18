# WF trial checklist gates (turns 2–4)

**Tokens:** [REQ-WF_TRIAL_MINIMAL_CHECKLIST_PLAYBOOK](../../../tied-project/requirements/REQ-WF_TRIAL_MINIMAL_CHECKLIST_PLAYBOOK.yaml) · Tracker template: `tied-bundle/templates/wf-trial-minimal-checklist-tracker.yaml`

## Tracker rules

- Use **`tied-project/working/{product_REQ}/checklist-tracker.yaml`** (orchestrator may seed from slim template).
- Turn-1 `evidence/phase-handoff-add-feature.md` must name the **product** REQ: `request_token: REQ-…` **or** table `| REQ token | \`REQ-…\` |` / `| REQ | \`REQ-…\` |` (dirname fallback when folder is already `REQ-*`).
- **`execution_evidence.completed`** must list **checklist step slugs only** — never prompt-type names (`build-plan`, `add-feature`, …).
- **`workflow_trial_disposable: true`** on the tracker enables MCP **disposable gate slug union** — slim template slugs (`red-tests`, `implement-code`, …) are valid at verification/close_out without renaming to methodology `unit-test-*` slugs ([REQ-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT](../../../tied-project/requirements/REQ-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT.yaml)).
- **Disposable template resolution:** MCP resolves `wf-trial-minimal-checklist-tracker.yaml` via client bundle → store → cwd; thin clients need store `TIED_STORE_ROOT` or install copy ([REQ-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS](../../../tied-project/requirements/REQ-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS.yaml)).
- Do **not** mark build-plan complete while **`verification` `allowed: false`**; turn 4 requires persisted **`tied-project/citdp/CITDP-{product}.yaml`** and a verification receipt when claiming verification.
- **Progression gate waiver (minimal disposable):** When the tracker marks **`sub-adversarial-inquiry-pass`** as **`not_applicable`** with **`policy: minimal-depth-no-inquiry`**, `tied_checklist_gate_validate` does **not** require the four adversarial list fields on the CITDP at **pre_implementation**, **verification**, or **close_out** (same rule as `citdp_record_write` open-record). Envelope, traceable commit, and other phase rules still apply — only the fabricated counterexample/falsification lists are waived ([REQ-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER](../../../tied-project/requirements/REQ-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER.yaml)).

## Numbered gate script

1. **Refine end (turn 2):** Advisory `tied_checklist_gate_validate` `phase: pre_implementation` (RED at minimal depth is expected in plan mode). Handoff only — no CITDP persist required yet.

   ```bash
   .cursor/skills/tied-yaml/scripts/tied-cli.sh tied_checklist_gate_validate \
     '{"phase":"pre_implementation","tracker_path":"tied-project/working/{REQ}/checklist-tracker.yaml","citdp":{"record_identity":{"profile_depth":"minimal","gate_policy":"advisory"},"risk_analysis":{"adversarial_inquiry":{"depth_tier":"minimal","gate_policy":"advisory"}}}}'
   ```

2. **Before RED (turn 3 start):** Set **`sub-adversarial-inquiry-pass`** disposition **`not_applicable`** on the tracker (via tied-yaml), not free text in `completed`.

3. **Build end (turn 3):**
   - RED once → archive stdout under `evidence/quality-manifest/*-red.stdout.txt`
   - GREEN → `npm test`
   - `tied_checklist_gate_validate` `phase: verification` with **`receipt_persistence`** → `gates/verification-*.json`
   - `tied_verify` (update statuses when wired)
   - Sync **`execution_evidence.completed`** only with slugs from slim tracker
   - Complete `proof-facet-manifest.v1.json` (one row per `src/**/*.test.ts`; paths must exist on disk)
   - Write `evidence/phase-handoff-build-plan.md` before deferring close-out

4. **Close start (turn 4):**
   - Persist **`tied-project/citdp/CITDP-{product_REQ}.yaml`** (YAML only for `tied_gate_check` — never pass `citdp-draft.md`)
   - When verification receipt exists, run **`sub-close-out-evidence-sync`** before `tied_gate_check` close_out
   - `request_evidence_envelope_build` / backfill / validate per close-out playbook
   - `tied_gate_check` close_out; **`traceable-commit` only when `allowed: true`**

See [wf-trial-build-plan-handoff.md](./wf-trial-build-plan-handoff.md) and [wf-trial-four-phase-close-out-playbook.md](./wf-trial-four-phase-close-out-playbook.md).
