# [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
# Summary: Deterministic read-only static analysis pipeline for IMPL essence_pseudocode sidecars.

# [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
# How: Define analysis controls, budgets, and proof boundary separately from Layer B structural validation.
# [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
# How: File-level contract INPUT where for constraint-enforced-v2 inventory floor.
Contract:
  INPUT: target_impl_token: string where length(target_impl_token) > 0; optional inline pseudo-code or path-safe sidecar reference; optional known tokens; analysis pass selection; budget overrides
  PRE: exactly one of inline pseudo-code or essence_pseudocode_path is provided; path resolves under TIED_BASE_PATH when used
  OUTPUT: pseudocode-analysis-report.v1 with parse, symbol, CFG, call graph, abstract, obligation, and traceability sections
  POST: report includes schema_version, grammar_version, analyzer_version, proof_boundary, input_identity, budgets_applied, diagnostics in stable order
  FAILURE_MODES: AmbiguousInput, MissingInput, PathNotUnderTiedBase, InputTooLarge, ParseFatal
  EFFECTS: pure
  TERMINATION: total
  DATA_TRANSITION: none
  CONTROL: strict_paths, gate_mode, and include_structural_compat are caller flags; analysis never mutates TIED YAML

# [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
# How: Resolve and validate input without reading or writing project YAML beyond the requested sidecar body.

Grammar-Version: v2

procedure RESOLVE_ANALYSIS_INPUT(input):
  # [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
  Contract:
    INPUT: inline pseudo-code, optional essence_pseudocode_path, TIED base path
    OUTPUT: normalized source text and input_identity hash
    PRE: caller supplied token label
    POST: path escapes are rejected; oversized input rejected before parsing
    FAILURE_MODES: AmbiguousInput, MissingInput, PathNotUnderTiedBase, InputTooLarge
    EFFECTS: pure
    TERMINATION: total
  IF both inline and path provided: RETURN error AmbiguousInput
  IF neither provided: RETURN error MissingInput
  IF path provided: CALL resolvePseudocodePathUnderTiedBase and readTextFromPseudocodePath
  IF source bytes exceed max_source_bytes: RETURN error InputTooLarge
  COMPUTE input_identity from normalized source bytes
  RETURN source text and input_identity

# [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
# How: Parse grammar v1 into normalized IR with explicit unsupported_syntax spans.
procedure PARSE_TO_IR(source):
  # [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
  Contract:
    INPUT: source text, parse budget
    OUTPUT: program IR with procedures, statements, spans, token refs
    PRE: source text available
    POST: unsupported constructs recorded with spans; parse node count respects max_parse_nodes
    FAILURE_MODES: ParseFatal, TruncatedParse
    EFFECTS: pure
    TERMINATION: total
  PARSE markdown headings, procedure/block leads, contract fields, IF/ELSE, SWITCH/CASE, FOR/WHILE, assignments, CALL/RUN, RETURN/errors
  RECORD unsupported_syntax for constructs outside grammar v1
  IF parse nodes exceed max_parse_nodes: MARK truncated and emit TRUNCATED_PARSE
  RETURN normalized IR

# [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
# How: Resolve declarations, duplicate IDs, read-before-write, and contract completeness at semantic level.
procedure ANALYZE_SYMBOLS(program):
  # [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
  Contract:
    INPUT: program IR, known token registry subset
    OUTPUT: symbol table, contract diagnostics aligned to RESOLVE-001/002 and SHAPE-003..006
    PRE: parse section completed or skipped with fatal=false policy
    POST: unresolved symbols and missing contract fields reported with source spans
    FAILURE_MODES: UnresolvedSymbol
    EFFECTS: pure
    TERMINATION: total
  BUILD declaration map for procedures and locals
  CHECK duplicate procedure IDs and read-before-write uses
  CHECK contract completeness for active procedure blocks
  RETURN symbol section and diagnostics

# [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
# How: Build per-procedure CFG with merge points, back-edges, and exceptional edges.
procedure BUILD_CFG(program):
  # [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
  Contract:
    INPUT: program IR, cfg budget
    OUTPUT: per-procedure CFG nodes and edges with reachability metadata
    PRE: symbols pass available when selected
    POST: cfg block count respects max_cfg_blocks_per_procedure or marks truncated
    FAILURE_MODES: TruncatedCfg
    EFFECTS: pure
    TERMINATION: total
  FOR each procedure: CREATE entry, branch merge, loop back-edges, exit nodes
  COMPUTE reachable blocks
  RETURN cfg section

# [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
# How: Construct pseudo-code call graph distinct from TIED dependency graph (GRAPH-001 program graph).
procedure BUILD_CALL_GRAPH(program):
  # [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
  Contract:
    INPUT: program IR, call graph budget
    OUTPUT: local CALL edges, RUN edges, unresolved targets
    PRE: cfg pass available when selected
    POST: edge count respects max_call_graph_edges or marks truncated with unresolved remainder
    FAILURE_MODES: UnresolvedCall, UnresolvedRun, TruncatedCallGraph
    EFFECTS: pure
    TERMINATION: total
  COLLECT CALL edges to defined procedures and built-ins
  COLLECT RUN edges to external IMPL references without treating them as local definitions
  REPORT unresolved call and run targets
  RETURN call_graph section

# [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
# How: Run bounded def-use, nullability, effect/failure propagation, and termination dependence analysis.
procedure RUN_ABSTRACT_ANALYSIS(program, cfg, call_graph):
  # [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
  Contract:
    INPUT: IR, CFG, call graph, fixed-point and path budgets
    OUTPUT: abstract facts, unknowns, contradictory path diagnostics
    PRE: graph sections available when selected
    POST: fixed-point iterations respect max_fixed_point_iterations; path conditions respect max_path_conditions
    FAILURE_MODES: ContradictoryPath, TerminationUnknown, EffectMismatch, FailurePropagationGap
    EFFECTS: pure
    TERMINATION: may_diverge
  RUN bounded def-use and nullability propagation
  EMIT DEREF_OBLIGATION and NULL_CHECK_OBLIGATION instead of proving non-null
  TRACK effect and failure propagation gaps
  IF contradictory path conditions: EMIT CONTRADICTORY_PATH (warning unless strict_paths)
  IF iteration budget exceeded: RECORD unknowns for affected facts
  RETURN abstract section

# [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
# How: Extract decision tables, path characterization obligations, and block-to-token traceability projections.
procedure EMIT_OBLIGATIONS(program, abstract):
  # [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
  Contract:
    INPUT: IR, abstract facts, target token
    OUTPUT: obligations section and traceability block→token edges
    PRE: abstract pass completed or skipped under policy
    POST: obligations characterize semantic paths without claiming test coverage or runtime proof
    FAILURE_MODES: none fatal
    EFFECTS: pure
    TERMINATION: total
  EXTRACT decision tables from branch constructs
  PROJECT block-level REQ/ARCH/IMPL token edges only (no file-level TIED walker)
  RETURN obligations and traceability sections

# [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
# How: Orchestrate passes, apply budgets, optionally attach structural compat summary, and emit stable report.
procedure ANALYZE_ESSENCE_PSEUDOCODE(input):
  # [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
  Contract:
    INPUT: resolved source, token, pass list, budgets, flags
    OUTPUT: pseudocode-analysis-report.v1
    PRE: RESOLVE_ANALYSIS_INPUT succeeded
    POST: diagnostics sorted stably; truncated and unknown disclosures accurate; gate_mode_applied true when gate_mode requested; ok false when gate_mode and any error diagnostic or truncated; no TIED mutation
    FAILURE_MODES: inherited from sub-procedures
    EFFECTS: pure
    TERMINATION: total
  CALL RESOLVE_ANALYSIS_INPUT
  FOR each selected pass in order: parse, symbols, cfg, call_graph, abstract, obligations, traceability
  IF include_structural_compat: CALL validateEssencePseudocode read-only for optional section
  IF gate_mode: SET gate_mode_applied; FAIL ok on error-severity diagnostics or truncated
  ASSEMBLE report with proof_boundary and analyzer_version
  SORT diagnostics and cap at max_report_diagnostics
  RETURN report
