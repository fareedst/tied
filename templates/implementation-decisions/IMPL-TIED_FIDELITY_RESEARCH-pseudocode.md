# [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
# Implements one-project, one-IMPL/module-boundary read-only fidelity analysis and evidence capture.

## Summary contract
INPUT: project manifest, change identity, IMPL/module scope, declared analysis adapters
PRE: project root exists; TIED base path is absolute and equals the analyzed project tied/ directory; methodology and generated paths are excluded
OUTPUT: candidate finding, structural evidence, fidelity report, optional composition report, and promoted case report
POST: audited project source, tests, project YAML, methodology YAML, and approved specifications are unchanged; research records retain provenance and proof boundaries
FAILURE_MODES: WrongTiedBasePath, InvalidManifest, MissingArtifact, ValidatorFailure, AmbiguousSpecificationState, DuplicateObservation
DATA: research ledger, snapshots, evidence items, candidate findings, case reports
DATA_TRANSITION: append observations and evidence revisions; never overwrite the pre-remediation observation
EFFECTS: IO, State
TERMINATION: total

procedure PROJECT_MANIFEST(project_root, configuration):
# [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
# Resolves one project boundary and prevents cross-project TIED access.
Contract:
INPUT: project root, manifest configuration
PRE: project root is readable and manifest configuration is bounded
OUTPUT: normalized project manifest | error InvalidManifest | error WrongTiedBasePath
POST: normalized manifest contains an absolute project root, absolute TIED base path, version, language/test classifiers, and ignore rules
FAILURE_MODES: InvalidManifest, WrongTiedBasePath
EFFECTS: IO
TERMINATION: total
  resolve absolute project root
  resolve absolute TIED base path
  IF TIED base path is not project_root/tied: RETURN error WrongTiedBasePath
  load bounded versions, language classifiers, test classifiers, and ignore rules
  IF required manifest field is invalid: RETURN error InvalidManifest
  RETURN normalized project manifest

procedure APPEND_CANDIDATE_FINDING(manifest, observation, evidence):
# [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
# Appends an observation without treating it as a confirmed product defect.
Contract:
INPUT: normalized manifest, observation, evidence references, lifecycle metadata
PRE: manifest passed PROJECT_MANIFEST; observation has discovery source, category, severity, confidence, visibility, and stable identity
OUTPUT: appended candidate finding | linked duplicate | error DuplicateObservation
POST: ledger contains the original observation or a duplicate link; no existing observation is overwritten
FAILURE_MODES: DuplicateObservation
DATA: append-only finding ledger
DATA_TRANSITION: add one observation or one duplicate link; preserve prior revisions
EFFECTS: IO, State
TERMINATION: total
  compute stable identity from project, revision, scope, category, and evidence locations
  search ledger for the stable identity
  IF matching observation exists: append duplicate link; RETURN linked duplicate
  append observation with lifecycle state observed
  RETURN appended candidate finding

procedure SNAPSHOT_CHANGE(manifest, change):
# [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
# Captures immutable evidence and preserves the audited project read-only boundary.
Contract:
INPUT: normalized manifest, change identity, prior revision, current revision
PRE: revisions are addressable; analysis roots and exclusions are explicit
OUTPUT: immutable artifact snapshot | error MissingArtifact
POST: snapshot records revisions, paths, hashes, commands, and TIED base path; source project remains unchanged
FAILURE_MODES: MissingArtifact
EFFECTS: IO
TERMINATION: total
  resolve prior and current revisions
  collect bounded TIED, pseudo-code, test, code, binding, CITDP, and documentation artifacts
  exclude methodology, templates, examples, fixtures, and generated output
  hash each retained artifact
  IF required artifact is unavailable: RETURN error MissingArtifact
  RETURN immutable artifact snapshot

procedure ANALYZE_SPECIFICATION_STATE(prior, current, change_definition):
# [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
# Establishes approved prior/current behavior before classifying evidence as a defect.
Contract:
INPUT: prior specification snapshot, current specification snapshot, CITDP change definition
PRE: snapshots identify revisions and approved status where available
OUTPUT: specification state classification and current/desired behavior record
POST: classification distinguishes SpecificationChange, ImplementationLag, MissingSpecification, PartialApplication, or Unresolved
FAILURE_MODES: AmbiguousSpecificationState
EFFECTS: pure
TERMINATION: total
  compare approved REQ, ARCH, and IMPL behavior across revisions
  IF approved desired behavior changed after prior implementation: RETURN SpecificationChange
  IF current approved behavior exists but evidence still satisfies only prior behavior: RETURN ImplementationLag
  IF no approved current behavior represents the observation: RETURN MissingSpecification
  IF evidence applies current behavior only partially: RETURN PartialApplication
  IF approval or evidence state cannot be established: RETURN Unresolved

procedure RUN_STRUCTURAL_ANALYSIS(snapshot, manifest, tokens):
# [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
# Runs structural validators while explicitly limiting their proof claim.
Contract:
INPUT: immutable artifact snapshot, normalized manifest, in-scope tokens
PRE: snapshot is immutable and validator commands are declared
OUTPUT: structural evidence items with proof boundary
POST: each result records command, exit code, tool version, scope, and artifact-consistency claim only
EFFECTS: IO
TERMINATION: total
  run tied_validate_consistency
  run pseudocode_validate for each in-scope IMPL
  run traceability gap and dependency-cycle checks
  run binding inventory and test adequacy checks when applicable
  record each result as structural evidence with proof boundary not runtime correctness
  RETURN structural evidence items

procedure AUDIT_IMPL_FIDELITY(pseudocode, tests, code, structural_evidence):
# [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
# Produces both pseudo-code-to-evidence reliability analysis and evidence-to-pseudo-code completeness analysis.
Contract:
INPUT: IMPL pseudo-code sidecar, test artifacts, production artifacts, structural evidence
PRE: one IMPL/module boundary is selected; pseudo-code, test, and code loci are independently snapshotted
OUTPUT: block inventory, bidirectional coverage matrices, findings, and block verdicts
POST: every block has an inventory row; unmatched pseudo-code statements are reliability findings; unrepresented evidence is a completeness finding
FAILURE_MODES: MissingArtifact
EFFECTS: pure
TERMINATION: total
  decompose pseudo-code into logical blocks
  map each block to test and production loci
  compare every pseudo-code statement against code and test evidence
  enumerate every meaningful code behavior and test assertion
  map evidence back to pseudo-code statements
  assign PASS, RELIABLE_INCOMPLETE, or UNRELIABLE per block
  RETURN inventory, matrices, findings, and verdicts

procedure ANALYZE_BINDING_EVIDENCE(binding, composition_tests, unit_evidence):
# [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
# Separates binding/composition behavior from isolated unit behavior.
Contract:
INPUT: binding inventory row, composition test evidence, validated unit evidence
PRE: binding row identifies trigger, channel, callee, arguments, effect, ordering, and failure behavior
OUTPUT: composition evidence item and binding finding when evidence is missing or contradictory
POST: binding result states whether UI-free evidence proves the seam; it does not promote unit evidence into composition proof
EFFECTS: pure
TERMINATION: total
  verify trigger fires
  verify correct channel and callee are used
  verify arguments satisfy preconditions
  verify effects and postconditions are observable
  verify ordering and failure behavior
  IF UI-free composition test is absent without named platform constraint: RETURN binding finding
  RETURN composition evidence with proof boundary

procedure PROMOTE_CONFIRMED_CASE(finding, evidence, review, specification_state):
# [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
# Promotes one adjudicated finding to a case report without automatic product specification mutation.
Contract:
INPUT: candidate finding, evidence matrices, reviewer decisions, specification state
PRE: finding is confirmed by review; evidence references and unresolved questions are retained
OUTPUT: case report | unchanged candidate when promotion is not authorized
POST: case report links origin layer, divergent edge, evidence, confidence, reviewer decisions, and proof boundaries; audited project TIED remains unchanged
DATA: append-only research case reports
DATA_TRANSITION: append the case report; audited project TIED data remains unchanged
EFFECTS: IO, State
TERMINATION: total
  require independent reviewer decisions
  record primary origin layer and first divergent edge
  preserve current behavior, desired behavior, unchanged behavior, and non-goals
  append case report to research dataset
  do not write audited project REQ, ARCH, IMPL, tests, or code
  RETURN case report

procedure VERIFY_DETERMINISTIC_RERUN(snapshot, configuration, ledger):
# [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
# Verifies reproducibility and duplicate linking for the same revisioned input.
Contract:
INPUT: immutable snapshot, analysis configuration, prior research ledger
PRE: snapshot hashes, command declarations, and configuration are stable
OUTPUT: deterministic rerun result and duplicate-link report
POST: same inputs produce equivalent evidence and findings; duplicate observations link without increasing defect counts
EFFECTS: IO, State
TERMINATION: total
  rerun the same analysis commands against the same snapshot
  compare normalized evidence, finding identities, and verdicts
  append a duplicate link for equivalent observations
  RETURN deterministic rerun result

procedure RUN_FIRST_SLICE(manifest_input, change, scope, adapters):
# [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
# Orchestrates validated research modules through one read-only composition seam.
Contract:
INPUT: project manifest input, change identity, IMPL/module scope, validated module adapters
PRE: adapters satisfy their module contracts; project manifest input is bounded; audited project writes are disabled
OUTPUT: composed research result | error from the first failed module contract
POST: manifest resolution precedes snapshot; structural, fidelity, binding, promotion, and rerun results retain proof boundaries; audited project remains unchanged
FAILURE_MODES: InvalidManifest, WrongTiedBasePath, MissingArtifact, ValidatorFailure, AmbiguousSpecificationState, DuplicateObservation
EFFECTS: IO, State
TERMINATION: total
  resolve project manifest
  snapshot the selected change
  analyze prior/current specification state
  run structural analysis with the resolved manifest and scope
  audit IMPL fidelity against snapshot evidence
  analyze composition binding evidence
  append a candidate finding to the research ledger
  promote a case only when independent review permits
  verify deterministic rerun and duplicate linking
  RETURN composed research result

procedure RUN_FIDELITY_RESEARCH_PILOT(manifest_input, change, scope, finding, reviewers):
# [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
# Connects concrete first-slice modules for a bounded, read-only pilot and emits research-dataset records.
Contract:
INPUT: bounded project manifest, change identity and artifacts, IMPL/module scope, candidate finding, reviewers
PRE: concrete module adapters satisfy their contracts; audited project writes are disabled
OUTPUT: read-only pilot result with structural, fidelity, binding, finding, promotion, rerun, and research-dataset evidence
POST: concrete modules execute through RUN_FIRST_SLICE ordering; audited project source, tests, and TIED remain unchanged
FAILURE_MODES: InvalidManifest, WrongTiedBasePath, MissingArtifact, ValidatorFailure, AmbiguousSpecificationState, DuplicateObservation
DATA: append-only research ledger containing findings, duplicate links, and case reports
DATA_TRANSITION: append candidate findings and authorized case reports to the research dataset; never mutate audited project data
EFFECTS: IO, State
TERMINATION: total
  construct concrete adapters for each validated first-slice module
  delegate manifest, snapshot, specification, structural, fidelity, binding, finding, promotion, and rerun stages to RUN_FIRST_SLICE
  map successful stages into the pilot result and research dataset
  RETURN read-only pilot result
