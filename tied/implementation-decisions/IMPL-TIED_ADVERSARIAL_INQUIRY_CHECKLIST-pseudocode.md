# [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
# How: integrate inquiry into existing checklist slugs with bounded working artifacts and human-approved scoped strict status.

Contract:
  INPUT: checklist scope, inquiry result, assurance profile, working root, human approval
  PRE: scope is explicit; inquiry result is read-only; artifact root is under the request working directory
  OUTPUT: advisory or strict gate result, deterministic report references, append-only finding references, and provenance
  POST: canonical TIED YAML is unchanged; observed findings remain review-gated; strict blocking is scoped and requires eligibility plus human approval
  FAILURE_MODES: invalid_scope; unsafe_artifact_path; missing_eligibility; missing_human_approval; artifact_write_failure
  DATA: inquiry report; finding ledger; gate result; evidence provenance
  DATA_TRANSITION: append new findings and duplicate links; atomically replace snapshot artifacts only within the working artifact directory
  EFFECTS: IO, State
  TERMINATION: total

## SELECT_ADVERSARIAL_INQUIRY_DEPTH
# [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: distinguish research profile, assurance profile, and gate policy before selecting checklist work.
Contract:
  INPUT: research profile, assurance profiles, changed scope, requested gate policy
  PRE: profiles use canonical names and scope is non-empty
  OUTPUT: depth selection and whether executable assurance is applicable
  POST: baseline-functional is retained; specialized profiles are selected only by trigger; strict policy is never implied by profile selection
  FAILURE_MODES: invalid_profile; missing_scope
  EFFECTS: pure
  TERMINATION: total
procedure SELECT_ADVERSARIAL_INQUIRY_DEPTH(): # [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
1. Resolve research profile independently from assurance profiles.
2. Retain baseline-functional for behavior-changing work.
3. Select specialized assurance profiles only when their trigger applies.
4. Select advisory, strict_candidate, or strict_approved policy explicitly.
5. RETURN depth selection.

## MAP_ADVERSARIAL_OBLIGATIONS
# [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: invoke the existing read-only analyzer for the declared checklist scope and preserve its proof boundaries.
Contract:
  INPUT: canonical graph and fidelity inputs, scope, optional assurance evidence
  PRE: graph and fidelity inputs identify one project; source references are read-only
  OUTPUT: report, verdict, scoped status, and proof-boundary partition
  POST: unresolved evidence cannot become PASS; unrelated obligations are absent from scoped status; canonical input is unchanged
  FAILURE_MODES: graph_failure; unresolved_evidence; mixed_project_scope
  EFFECTS: pure
  TERMINATION: total
procedure MAP_ADVERSARIAL_OBLIGATIONS(): # [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
1. Run the existing graph and fidelity composition.
2. Preserve structural, pseudo-code, semantic, executable, and human proof boundaries.
3. Return the report, verdict, and scope-limited status.

## EVALUATE_ADVERSARIAL_FINDINGS
# [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: append observed findings and deterministic duplicate links without promoting them to canonical intent or LEAP actions.
Contract:
  INPUT: fidelity findings, executable evidence, prior finding ledger, evidence provenance
  PRE: every finding has an obligation identity and proof boundary; provenance is present or unresolved is explicit
  OUTPUT: append-only ledger result and evidence provenance artifact
  POST: duplicate observations link without count inflation; pre-remediation evidence is retained; observed lifecycle remains observed
  FAILURE_MODES: missing_provenance; invalid_finding; artifact_write_failure
  EFFECTS: IO, State
  TERMINATION: total
procedure EVALUATE_ADVERSARIAL_FINDINGS(): # [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
1. Derive deterministic finding identities.
2. Append only findings not already present.
3. Append only new duplicate links.
4. Preserve source revisions and proof boundaries.
5. Return ledger and provenance references.

## ROUTE_UNRESOLVED_CRITICAL_FINDINGS
# [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: permit scoped blocking only after deterministic eligibility and explicit human CITDP approval; otherwise return warn-only.
Contract:
  INPUT: verdict, scope, gate policy, strict eligibility, human approval, pilot evidence, waiver records
  PRE: policy is explicit and scope is non-empty
  OUTPUT: gate result with blocking decision, valid checklist target, diagnostics, and approval reference
  POST: strict blocking requires eligibility and human approval covering the exact scope; observed findings never trigger LEAP; unrelated records remain untouched
  FAILURE_MODES: missing_eligibility; missing_human_approval; scope_mismatch; missing_rollback_criteria
  EFFECTS: pure
  TERMINATION: total
procedure ROUTE_UNRESOLVED_CRITICAL_FINDINGS(): # [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
1. If policy is advisory or strict_candidate, return warn-only.
2. If strict_approved, validate every eligibility condition.
3. Validate reviewer, approved scope, thresholds, approval revision, and rollback criteria.
4. If an error finding remains, return blocked with a GOTO target owned by its proof boundary.
5. If no error finding remains, return passed for the declared scope.
6. Never demote or mutate unrelated records.
7. Return the gate result.

## PERSIST_WORKING_ARTIFACTS
# [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: write deterministic snapshots and append-only findings below working/{REQ-TOKEN}/adversarial-inquiry without touching canonical TIED YAML.
Contract:
  INPUT: request token, repository root, optional activation phase, report, gate result, ledger delta, provenance
  PRE: request token is a valid REQ token; resolved artifact directory is inside repository working root and, when phase is present, under working/{REQ-TOKEN}/adversarial-inquiry/phase-{phase}/
  OUTPUT: four artifact references for the authoritative directory (phase directory when phase is present)
  POST: report, gate, and provenance snapshots are deterministic; finding ledger is append-only; sibling phase directories are untouched; optional root projection copies latest snapshots only and never satisfies another phase pairing; canonical TIED bytes are unchanged
  FAILURE_MODES: invalid_scope; unsafe_artifact_path; artifact_write_failure
  EFFECTS: IO
  TERMINATION: total
procedure PERSIST_WORKING_ARTIFACTS(): # [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
1. When activation.phase is present, resolve working/{REQ-TOKEN}/adversarial-inquiry/phase-{phase}/ as the authoritative directory; otherwise resolve working/{REQ-TOKEN}/adversarial-inquiry/.
2. Reject traversal and artifact roots outside the request adversarial-inquiry tree.
3. Atomically write obligation-report.json, gate-result.json, and evidence-provenance.json to the authoritative directory.
4. Append new finding records and duplicate links to finding-ledger.jsonl in the authoritative directory.
5. When phase is present, optionally project-copy the four files to the adversarial-inquiry root as a latest/close-out convenience view only.
6. Return artifact references for the authoritative directory; activation receipts reference only those paths.

## BUILD_MODE_A_FROM_TIED
# [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [IMPL-TIED_FILES] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_SETUP]
# How: emit normalized graph and fidelity JSON for Go and other non-Ruby stacks from TIED tokens, declared paths, and optional declarative build-config; delegate envelope assembly to BUILD_MODE_A_PAYLOAD.
Contract:
  INPUT: project_root, tied_base_path, request_token, block_id, test_paths, production_path, optional build_config, optional Mode A pass-through (run_id, phase, policy, scope)
  PRE: project_root and tied_base_path exist; block_id is explicit; either build_config supplies graph/fidelity or declared paths are repository-relative under project_root
  OUTPUT: graph.json, fidelity.json, provenance.json (optional output_dir); optional Mode A envelope via emit_mode_a
  POST: projectId derives from resolved tied_base_path hash; graph/fidelity match adversarial-inquiry normalized schema; canonical TIED YAML is read-only; Mode B Go adapter is not invoked
  FAILURE_MODES: missing_required_input; invalid_block_id; missing_build_config_and_paths; mode_a_delegate_failure
  EFFECTS: IO (read TIED/build-config; optional write outputs)
  TERMINATION: total
procedure BUILD_MODE_A_FROM_TIED(): # [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [IMPL-TIED_FILES] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
1. Resolve tied_base_path defaulting to project_root/tied.
2. Compute projectId as SHA256(resolved tied_base_path)[0:16].
3. When build_config is present, load declarative graph/fidelity mapping (interim v1) and merge CLI overrides.
4. Otherwise derive minimal graph/fidelity from block_id, request_token, source_revision, and declared test/production paths.
5. Write graph.json, fidelity.json, and provenance.json when output_dir is set.
6. When emit_mode_a is requested, pass assembled records to BUILD_MODE_A_PAYLOAD with scope, run_id, phase, and policy.
7. Return graph, fidelity, and provenance references without mutating canonical TIED YAML.
