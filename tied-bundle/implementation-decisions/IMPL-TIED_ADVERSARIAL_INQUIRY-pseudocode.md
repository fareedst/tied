# [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]

## Summary contract
- [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: implement a deterministic read-only obligation graph, bidirectional fidelity verdicts, language adapters, review-gated findings, and bounded assurance eligibility.

Contract:
  INPUT: canonical TIED references, pseudo-code blocks, normalized test and production evidence, assurance declarations, scope
  PRE: canonical references identify the audited project; evidence is versioned or explicitly unresolved; commands are argv-only declarations
  OUTPUT: deterministic obligation projection, fidelity findings, assurance results, and scoped gate projection
  POST: no canonical audited-project YAML is mutated; every result carries a proof boundary; unresolved evidence cannot become PASS
  FAILURE_MODES: malformed_identity; duplicate_identity; stale_reference; unresolved_evidence; unsupported_adapter; unsafe_command; ineligible_strict_gate
  DATA: canonical references; normalized evidence; generated obligations; append-only findings; gate results
  EFFECTS: pure core analysis; bounded IO only in adapters and command execution
  TERMINATION: total for core analysis; bounded for command execution

## IDENTITY_RESOLUTION
- [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: derive criterion and block identities from explicit stable fields and normalized semantic content, while keeping revisions and legacy fallback visible.

Contract:
  INPUT: requirement token, explicit criterion identifier, implementation token, block name, block content, source revision, optional rename alias
  PRE: tokens are non-empty; criterion identifier or legacy fallback is available; block content is readable text
  OUTPUT: criterion identity or block identity with revision and derivation
  POST: formatting-only whitespace and line-ending changes do not change identity; semantic content changes revision; aliases preserve identity only when explicit
  FAILURE_MODES: missing_criterion; missing_block_name; duplicate_identity; invalid_alias
  EFFECTS: pure
  TERMINATION: total
procedure IDENTITY_RESOLUTION(): # [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
1. Normalize line endings to LF.
2. Normalize indentation and insignificant surrounding whitespace.
3. Preserve semantic statement order, branch names, failure modes, effects, and data transitions.
4. Build criterion identity from requirement token and explicit criterion identifier.
5. Build block identity from implementation token, normalized block name, and normalized semantic content.
6. Hash only normalized identity inputs; omit source location, display text, and timestamps.
7. Attach source revision and legacy derivation metadata separately.
8. Reject duplicate identities unless an explicit alias migration resolves the collision.
9. RETURN identity.

## BUILD_OBLIGATION_GRAPH
- [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: connect criteria, constraints, blocks, evidence loci, bindings, and adversarial cases without copying canonical bodies or writing canonical YAML.

Contract:
  INPUT: canonical requirement criteria, architecture constraints, implementation blocks, evidence loci, binding rows, adversarial cases
  PRE: each referenced identity has a source revision; source records are read-only
  OUTPUT: obligation graph or deterministic diagnostics
  POST: complete edges are mapped; malformed, duplicate, stale, and unresolved references are explicit; projection ordering is stable
  FAILURE_MODES: malformed_reference; duplicate_edge; stale_revision; unresolved_reference
  DATA: graph nodes and edges; source revisions; proof boundaries
  EFFECTS: pure
  TERMINATION: total
procedure BUILD_OBLIGATION_GRAPH(): # [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
1. Resolve every criterion identity.
2. Resolve every architecture constraint identity.
3. Resolve every implementation block identity.
4. Link criterion to one or more constraints.
5. Link constraints to implementation blocks.
6. Link blocks to test and production evidence loci.
7. Link applicable bindings and adversarial cases.
8. Validate source revisions and report stale edges.
9. Sort nodes and edges by stable identity.
10. RETURN graph and diagnostics.

## PROJECT_READ_ONLY_REPORT
- [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: project the graph and evidence into a report that is explicitly non-canonical and preserves proof boundaries.

Contract:
  INPUT: obligation graph, fidelity findings, executable evidence, human decisions, scope
  PRE: all inputs identify the same project boundary or carry an explicit cross-project limitation
  OUTPUT: generated report with scope, revisions, findings, evidence, limitations, and proof boundaries
  POST: canonical input bytes are unchanged; identical inputs and scope produce identical output
  FAILURE_MODES: mixed_project_scope; missing_proof_boundary; nondeterministic_input
  EFFECTS: pure
  TERMINATION: total
procedure PROJECT_READ_ONLY_REPORT(): # [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
1. Validate project scope.
2. Copy references, not canonical bodies.
3. Partition results by structural, semantic, executable, and human proof boundary.
4. Sort findings, evidence references, and diagnostics by stable identity.
5. Attach non-canonical and read-only labels.
6. RETURN report.

## NORMALIZE_FIDELITY_EVIDENCE
- [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: normalize pseudo-code statements and adapter evidence into comparable statement, behavior, effect, ordering, and failure records.

Contract:
  INPUT: pseudo-code block, test evidence, production behavior evidence
  PRE: evidence records include source location and provenance or are marked unresolved
  OUTPUT: normalized specification statements and evidence observations
  POST: equivalent whitespace and unordered evidence normalize identically; missing provenance remains unresolved
  FAILURE_MODES: malformed_statement; unsupported_evidence; missing_provenance
  EFFECTS: pure
  TERMINATION: total
procedure NORMALIZE_FIDELITY_EVIDENCE(): # [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
1. Parse contract rows, procedure steps, branches, failures, effects, transitions, ordering, and delegations.
2. Normalize names, whitespace, and equivalent evidence ordering.
3. Preserve semantic sequence and source locations.
4. Attach evidence provenance and proof boundary.
5. Mark unsupported constructs rather than guessing.
6. RETURN normalized records.

## CLASSIFY_FIDELITY
- [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: compare specification statements with test and production observations in both directions and refuse locus-only PASS.

Contract:
  INPUT: normalized specification statements, normalized test evidence, normalized production evidence
  PRE: evidence belongs to the same block revision or stale status is explicit
  OUTPUT: Direction A and Direction B findings plus one verdict
  POST: PASS requires reliable and complete agreement in both directions; missing behavior is incomplete; false or contradictory behavior is unreliable; insufficient evidence is unresolved
  FAILURE_MODES: stale_evidence; conflicting_evidence; unresolved_adapter
  EFFECTS: pure
  TERMINATION: total
procedure CLASSIFY_FIDELITY(): # [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
1. Match each specification statement to test and production observations.
2. Emit reliability findings for false, stale, contradictory, or misordered observations.
3. Emit completeness findings for missing statements, effects, failures, transitions, or delegations.
4. Compare evidence back to the specification.
5. Classify unresolved adapter or provenance gaps as UNRESOLVED.
6. RETURN PASS only when both directions are reliable and complete.

## PARSE_MINITEST_ASSERTIONS
- [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: convert the supported Ruby Minitest assertion subset into normalized evidence and fail closed for unsupported constructs.

Contract:
  INPUT: Ruby test source and source revision
  PRE: source is UTF-8 text from the declared test locus
  OUTPUT: normalized assertion evidence or unsupported_adapter diagnostics
  POST: assert, assert_equal, assert_empty, assert_raises, and refute are represented with locations; unsupported constructs never claim coverage
  FAILURE_MODES: invalid_source; unsupported_adapter; ambiguous_assertion
  EFFECTS: pure
  TERMINATION: total
procedure PARSE_MINITEST_ASSERTIONS(): # [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
1. Scan source for supported assertion calls.
2. Extract assertion kind, target, expected value, failure type, and location.
3. Preserve test-case identity and derivation source.
4. Emit unsupported_adapter for other assertion or control constructs that affect proof.
5. RETURN normalized evidence.

## VALIDATE_STRICT_ELIGIBILITY
- [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: permit strict blocking only for a deterministic supported subset with negative controls, explicit proof boundaries, scoped evidence, and owned waivers.

Contract:
  INPUT: gate results, supported subset, negative controls, scope, proof boundaries, pilot metrics, waiver records
  PRE: scope and evidence revisions are known
  OUTPUT: eligible or ineligible gate decision with diagnostics
  POST: eligible requires every criterion; unrelated records are untouched; not_applicable has a named limitation
  FAILURE_MODES: missing_negative_control; unbounded_execution; missing_scope; missing_proof_boundary; missing_waiver_owner; insufficient_pilot
  EFFECTS: pure
  TERMINATION: total

procedure VALIDATE_STRICT_ELIGIBILITY(): # [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
1. Require a negative control for every blocking detector.
2. Require deterministic or bounded execution metadata.
3. Require explicit proof boundaries.
4. Require deterministic impacted scope.
5. Require false-positive handling.
6. Require owner and expiry for every waiver or accepted residual risk.
7. Require representative pilot evidence before promotion.
8. RETURN eligible only when all applicable checks pass.

## RUN_BOUNDED_COMMAND
- [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: execute only declared argv commands with timeout, output, environment, redaction, and fail-closed unsupported-command controls.

Contract:
  INPUT: argv-only command declaration, cwd, timeout, output limit, seed, tool version
  PRE: argv is non-empty and contains no shell string; cwd is within the declared project boundary; limits are positive
  OUTPUT: evidence item with exit code, bounded output artifact, and provenance
  POST: timeout, output overflow, unsupported command, or redaction failure cannot produce a passing evidence claim
  FAILURE_MODES: unsafe_command; timeout; output_limit; unsupported_command; artifact_write_failure
  EFFECTS: IO, Exn
  TERMINATION: total within configured timeout

procedure RUN_BOUNDED_COMMAND(): # [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
1. Validate argv and project-bound cwd.
2. Reject shell interpolation and unsupported command kinds.
3. Start the process with a timeout.
4. Capture output up to the configured limit.
5. Redact configured sensitive values.
6. Record command, version, cwd, seed, threshold, exit code, and artifact reference.
7. RETURN evidence item.

## PROJECT_FINDING_AND_STATUS
- [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: append candidate findings, link deterministic duplicates, and project scoped status without automatic canonical intent mutation.

Contract:
  INPUT: finding observation, obligation identity, evidence references, current lifecycle, gate decision, scope
  PRE: observation has provenance and proof boundary; status scope is explicit
  OUTPUT: append-only finding transition and scoped status projection
  POST: candidate findings remain observed until review; duplicates link without count inflation; unrelated records are unchanged
  FAILURE_MODES: missing_provenance; invalid_transition; duplicate_collision; out_of_scope_status
  DATA: finding ledger; duplicate links; scoped status projection
  DATA_TRANSITION: append observation or duplicate link; never overwrite pre-remediation evidence
  EFFECTS: State
  TERMINATION: total

procedure PROJECT_FINDING_AND_STATUS(): # [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
  DATA_TRANSITION: append observation or duplicate link; never overwrite pre-remediation evidence
1. Derive deterministic finding identity from obligation, revision, dimension, statement, and evidence.
2. Append a new observed finding or link a duplicate.
3. Preserve specification state, origin layer, divergent edge, and proof boundary.
4. Apply a lifecycle transition only when its reviewer decision is present.
5. Project status only for the declared scope and eligible gate.
6. RETURN transition and projection.

## RUN_ADVERSARIAL_INQUIRY
- [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: compose identity, graph, fidelity, adapter, finding, and gate modules in read-only order with explicit stage failures.

Contract:
  INPUT: project manifest, canonical TIED references, pseudo-code, adapter evidence, assurance declarations, scope
  PRE: project boundary is resolved and all canonical inputs are read-only
  OUTPUT: report, findings, evidence, and gate projection
  POST: stage order is deterministic; no stage mutates canonical intent; every output has a proof boundary
  FAILURE_MODES: manifest_failure; graph_failure; fidelity_failure; adapter_failure; assurance_failure; gate_failure
  EFFECTS: pure core plus bounded IO adapters
  TERMINATION: total when adapters honor their bounds

- [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: compose identity, graph, fidelity, adapter, finding, and gate modules in read-only order with explicit stage failures.
procedure RUN_ADVERSARIAL_INQUIRY(): # [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
1. Resolve project boundary and source revisions.
2. Resolve criterion and block identities.
3. Build and validate the obligation graph.
4. Normalize fidelity evidence.
5. Classify Direction A and Direction B fidelity.
6. Run the selected language adapter.
7. Execute only selected bounded assurance commands.
8. Append candidate findings outside canonical TIED YAML.
9. Validate strict eligibility.
10. Project a read-only scoped report.
11. RETURN all stage results and proof boundaries.

## BUILD_PROJECT_INQUIRY_INPUT
- [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: validate an explicit project boundary, load declared read-only inputs, and normalize one supported Ruby Minitest fixture into the existing inquiry core.

Contract:
  INPUT: Mode B project root, optional matching TIED base path, REQ/IMPL tokens, criterion scope, repository-relative test and production paths, optional structured production evidence, gate policy, artifact context
  PRE: mode is project; required fields are not mixed with Mode A fields; project root and TIED base path are absolute and resolve to projectRoot/tied; declared paths are repository-relative regular files contained by the project root; the request token and artifact root are valid for bounded working artifacts
  OUTPUT: ChecklistInquiryInput containing a resolved project manifest, canonical obligation graph, normalized Minitest observations, explicit structured production observations, and scoped provenance
  POST: the normalized input is deterministic for the same file snapshot and request; production source contributes loci only; canonical TIED YAML and process environment remain unchanged; unsupported or insufficient evidence remains unresolved
  FAILURE_MODES: invalid_input; wrong_tied_base_path; unsafe_path; missing_file; invalid_yaml; missing_record; invalid_production_evidence; unsupported_adapter; stale_revision; unresolved_obligation
  EFFECTS: read-only filesystem access under the validated project root; no canonical YAML writes; no environment or global loader/cache mutation
  DATA_TRANSITION: project input -> validated manifest -> loaded canonical records and sidecars -> normalized graph/fidelity input -> checklist inquiry result and bounded artifact references
  TERMINATION: total over finite files and bounded evidence; no shell execution, recursive unbounded discovery, or network access

- [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: reject mixed contracts and path escapes before reading, preserve explicit source revisions, and pass structured diagnostics instead of guessing behavior.
procedure BUILD_PROJECT_INQUIRY_INPUT(): # [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
1. Validate that the Mode B discriminator is `project` and reject Mode A `graph`, `fidelity`, or `scope` fields when present.
2. Resolve the manifest with `{ projectRoot, tiedBasePath, version: "mode-b-fixture", languages: ["ruby"], testClassifiers: ["minitest"], ignoreRules: [] }` before any project read.
3. Resolve each declared repository-relative path, read its real path, and reject absolute paths, traversal, symlink escape, missing files, and non-file targets.
4. Read only the selected REQ, ARCH, and IMPL index/detail records plus the IMPL pseudo-code sidecar from the explicit TIED base path; compute source revisions from bytes.
5. Resolve explicit criterion and block identities, map criteria through architecture constraints to the owning IMPL block, and construct the graph with scoped evidence loci.
6. Parse the declared Ruby Minitest assertion subset; preserve unsupported and ambiguous adapter diagnostics as unresolved evidence.
7. Parse only the declared structured production evidence; attach production source as a locus and never infer runtime behavior from production source text.
8. Return the normalized checklist input with stage diagnostics and provenance, or return a stable structured error without invoking the core or artifact writer.
