# [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW] — Bounded optional typed-flow pass composing after abstract analysis; Tier-2 types are evidence on behavioral pseudocode.

## Typed-flow controls and report boundary

- [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW] How: Define opt-in typed_flow flag, proof boundary extension, and namespaced report section without bumping pseudocode-analysis-report.v1 schema_version.
- Contract:
  - INPUT: analyzeEssencePseudocode input with optional typed_flow boolean (default false)
  - PRE: parse pass completed successfully; abstract pass available when typed_flow true
  - OUTPUT: pseudocode-analysis-report.v1 with optional sections.typed_flow
  - POST: when typed_flow false, report byte-identical to pre-typed-flow analyzer for same input and flags; when typed_flow true, sections.typed_flow includes diagnostics, unknowns, and proof_boundary extension
  - FAILURE_MODES: ParseFatal, BudgetExceeded
  - EFFECTS: pure
  - TERMINATION: total
  - DATA_TRANSITION: none
  - CONTROL: gate_mode applies to legacy diagnostics always; typed diagnostics promote to error only when typed_gate_errors true on annotated procedures (Phase 3 sub-phase 3a–3c)

procedure TYPED_FLOW_CONTROLS:
  # [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW] How: Skip typed pass entirely unless caller sets typed_flow true.
  Contract:
    INPUT: typed_flow flag, program IR, cfg section, abstract section
    OUTPUT: run_typed boolean
    PRE: parse succeeded
    POST: run_typed false when typed_flow false or absent
    EFFECTS: pure
    TERMINATION: total
  IF typed_flow is false or absent: RETURN run_typed false
  RETURN run_typed true

## Contract value parsing and F1b mixed rows (D13: no shared regex edits)

procedure PARSE_CONTRACT_TYPED_VALUES(program):
  # [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW] How: Extend parser to retain contract field values and extract optional Tier-2 TypeTag after keyword-colon without changing CONTRACT_FIELD_PATTERN in pseudocode-shared.ts.
  Contract:
    INPUT: contract scan rows matching INPUT/OUTPUT/DATA keyword-colon form
    OUTPUT: contract.values map field→raw value text; contract.type_tags map field→TypeTag when value matches nested name:type pattern
    PRE: procedure block scan active
    POST: mixed typed and prose rows both retained; scan does not terminate early on first typed row (F1b)
    FAILURE_MODES: TypedSyntaxUnsupported
    EFFECTS: pure
    TERMINATION: total
  FOR each contract row with form KEYWORD: remainder:
    STORE contract.values[field] = remainder
    IF remainder matches nested pattern name: type_clause: EXTRACT TypeTag
    ELSE: LEAVE type_tags absent for field
  RETURN contract maps

## CALL argument capture (gap resolution)

procedure PARSE_CALL_ARGUMENTS(statement):
  # [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW] How: Extend IrCall with args string list and optional argExprs when expression parser succeeds.
  Contract:
    INPUT: CALL line text CALLEE( arg_list )
    OUTPUT: IrCall with callee, args[], optional argExprs[]
    PRE: callee token parsed
    POST: raw args preserved even when expression parse fails; argExprs populated only for typed subset
    FAILURE_MODES: CallSyntaxUnsupported
    EFFECTS: pure
    TERMINATION: total
  PARSE callee identifier from CALL_RE extension
  SPLIT arg_list on commas respecting parentheses
  STORE args as raw strings
  FOR each arg: ATTEMPT parseExpression; ON success APPEND to argExprs
  RETURN IrCall

## Expression parser (closed subset)

procedure PARSE_EXPRESSION(text):
  # [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW] How: Parse literals, refs, field/index access, binary operators, and simple comparisons for assignments and IF guards.
  Contract:
    INPUT: expression text, expression budget
    OUTPUT: Expr AST or opaque marker
    PRE: text non-empty when typed checking requested
    POST: unsupported constructs return TYPED_UNSUPPORTED_SYNTAX unknown rather than crashing parse pass
    FAILURE_MODES: TypedSyntaxUnsupported, BudgetExceeded
    EFFECTS: pure
    TERMINATION: total
  PARSE literal int/string/bool/null
  PARSE identifier ref and .field / [index] chains
  PARSE binary + - * and comparisons with left-associative precedence
  ON opaque prose or RUN reference: RETURN opaque with cause TYPED_OPAQUE_EXPR
  RETURN Expr

## Typed IR and lattice

procedure BUILD_TYPE_ENV(program):
  # [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW] How: Seed type environment from contract.type_tags and DATA shape tags; unknown elsewhere.
  Contract:
    INPUT: program IR with contract.type_tags
    OUTPUT: initial TypeEnv mapping names→TypeFact
    PRE: symbols pass completed when available
    POST: prose-only contract rows yield unknown facts not errors
    EFFECTS: pure
    TERMINATION: total
  FOR each typed contract field: BIND name to TypeFact from TypeTag
  FOR untyped fields: BIND unknown with cause missing_annotation
  RETURN TypeEnv

procedure JOIN_TYPE_FACTS(left, right):
  # [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW] How: Merge facts at CFG join; incompatible types become bottom or JOIN_INCOMPATIBLE diagnostic.
  Contract:
    INPUT: TypeFact from each predecessor edge
    OUTPUT: joined TypeFact
    PRE: both facts defined or unknown
    POST: identical tags merge; nullable lattice applied; incompatible scalars emit JOIN_INCOMPATIBLE warning
    FAILURE_MODES: JoinIncompatible
    EFFECTS: pure
    TERMINATION: total
  IF either fact is unknown: RETURN unknown preserving causes
  IF tags equal: RETURN tag
  IF nullable lattice allows merge: RETURN merged nullable tag
  ELSE: EMIT JOIN_INCOMPATIBLE; RETURN bottom

## CFG transfer and join (D14 budget semantics)

procedure RUN_TYPED_FLOW_ANALYSIS(program, cfg, abstract):
  # [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW] How: Iterate transfer over CFG blocks until stable on loop back-edges or max_cfg_join_iterations; distinct from global max_fixed_point_iterations statement counter in abstract pass.
  Contract:
    INPUT: program IR, cfg section, abstract section, typed budgets
    OUTPUT: typed_flow section with diagnostics and unknowns
    PRE: TYPED_FLOW_CONTROLS returned run_typed true
    POST: zero budget_exceeded unknowns on pilot fixtures 1-17 at DEFAULT_BUDGETS; loop back-edges widen to unknown when iteration cap hit
    FAILURE_MODES: BudgetExceeded
    EFFECTS: pure
    TERMINATION: may_diverge
    DATA_TRANSITION: TypeEnv updated per block transfer
  INITIALIZE env from BUILD_TYPE_ENV
  FOR each cfg block in topological order with join points:
    AT join: env = JOIN_TYPE_FACTS for each predecessor
    TRANSFER assignments: CHECK TYPE_MISMATCH when rhs type incompatible
    TRANSFER IF guards: narrow nullable when structured guard present (F3 positive control)
    TRANSFER CALL: MATCH argExprs to callee contract INPUT slots (F6 positive control)
    ON opaque RHS or RUN: RECORD unknown with cause TYPED_OPAQUE_EXPR
  UNTIL stable on all join points OR iterations exceed max_cfg_join_iterations
  IF iteration cap exceeded: RECORD unknown cause budget_exceeded for affected loops only
  RETURN typed_flow section

## Diagnostic taxonomy (pilot warnings)

procedure EMIT_TYPED_DIAGNOSTICS(findings):
  # [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW] How: Emit TYPE_MISMATCH, NULL_FLOW, SHAPE_MISMATCH, CALL_TYPE_MISMATCH, JOIN_INCOMPATIBLE, TYPED_OPAQUE_EXPR, TYPED_UNSUPPORTED_SYNTAX as warnings during pilot.
  Contract:
    INPUT: finding list with spans
    OUTPUT: diagnostics[] sorted stably
    PRE: typed_flow pass completed or partial with unknowns
    POST: severity warning by default; PROMOTE_TYPED_DIAGNOSTIC_SEVERITY may raise gating codes to error on annotated procedures when typed_gate_errors true; never mutates TIED YAML
    DATA_TRANSITION: none
    EFFECTS: pure
    TERMINATION: total
  MAP each finding to diagnostic code and message with line span
  SORT diagnostics by line, code, message
  RETURN diagnostics

## Report section and orchestration

procedure COMPOSE_TYPED_FLOW_SECTION(typed_result):
  # [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW] How: Attach namespaced sections.typed_flow to pseudocode-analysis-report.v1 without schema_version change.
  Contract:
    INPUT: typed_result diagnostics, unknowns, proof_boundary extension text
    OUTPUT: sections.typed_flow object
    PRE: typed_flow pass ran
    POST: section includes typed_diagnostics, typed_unknowns, proof_boundary extension; deterministic JSON serialization
    EFFECTS: pure
    TERMINATION: total
  ASSEMBLE sections.typed_flow with diagnostics, unknowns, budgets_applied subset
  EXTEND proof_boundary text with typed-flow claim limits
  RETURN section

procedure ANALYZE_ESSENCE_PSEUDOCODE_TYPED(input):
  # [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW] How: After existing ANALYZE_ESSENCE_PSEUDOCODE abstract pass, optionally invoke RUN_TYPED_FLOW_ANALYSIS and merge sections.typed_flow.
  Contract:
    INPUT: standard analyze input plus typed_flow flag
    OUTPUT: pseudocode-analysis-report.v1
    PRE: inherited ANALYZE_ESSENCE_PSEUDOCODE preconditions
    POST: when typed_flow false, identical to legacy orchestrator; when true, sections.typed_flow present; gate_mode fails ok on promoted typed errors when typed_gate_errors true on annotated procedures
    FAILURE_MODES: inherited
    EFFECTS: pure
    TERMINATION: total
  CALL ANALYZE_ESSENCE_PSEUDOCODE with typed_flow ignored for legacy passes
  IF TYPED_FLOW_CONTROLS.run_typed:
    CALL RUN_TYPED_FLOW_ANALYSIS
    CALL COMPOSE_TYPED_FLOW_SECTION
    MERGE sections.typed_flow into report
  RETURN report

## Phased MCP wiring

procedure PHASE_1A_INTERNAL_ONLY:
  # [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW] How: Export runTypedFlowAnalysis for unit tests and fixtures only; no MCP typed_flow flag until corpus 1-17 green.
  Contract:
    INPUT: fixture pseudocode paths under mcp-server/src/analysis/fixtures/typed-flow/
    OUTPUT: green unit tests
    PRE: IMPL sidecar validated; RED tests written
    POST: no MCP exposure; no report section in production handler
    EFFECTS: pure
    TERMINATION: total
  RUN unit tests for expression parser, typed IR, typed-flow pass

procedure PHASE_1B_MCP_FLAG:
  # [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW] How: Add typed_flow to pseudocode_analyze handler after Phase 1a green; composition tests prove flag propagation and read-only behavior.
  Contract:
    INPUT: MCP pseudocode_analyze args with typed_flow boolean
    OUTPUT: report with sections.typed_flow when true
    PRE: Phase 1a complete; F8/F9 regression passes
    POST: handler never writes client YAML; deterministic serialization
    EFFECTS: pure
    TERMINATION: total
  WIRE typed_flow through analyzeEssencePseudocode
  REGISTER composition tests in pseudocode-analyze-mcp.test.ts

## Client qualification (read-only)

procedure QUALIFY_AGAINST_MANIFEST(manifest):
  # [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW] How: Run baseline typed_flow false then pilot typed_flow true over qualification manifest; never mutate external corpus.
  Contract:
    INPUT: qualification manifest with absolute sidecar paths
    OUTPUT: baseline/ and pilot/ reports, metrics/compare-summary.json
    PRE: harness scripts built; mcp-server analyzer at pinned commit
    POST: Tier A/B gate pass rate unchanged with typed_flow false; zero new gate failures with typed_flow true vs baseline
    DATA_TRANSITION: empty qualification dirs→populated baseline/pilot reports; external corpus unchanged
    EFFECTS: IO
    TERMINATION: total
  CALL run-baseline.ts with gate_mode true typed_flow false
  CALL run-pilot.ts with typed_flow true and regression false pass
  CALL compare-reports.ts for threshold checks

## Phase 3 — scoped typed gate errors (3d default flip sponsor-approved 2026-09-10)

procedure TYPED_GATE_ERRORS_FLAG:
  # [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW] How: typed_gate_errors defaults true when gate_mode && typed_flow; explicit false opts out to warnings-only (pilot behavior).
  Contract:
    INPUT: typed_flow, gate_mode, typed_gate_errors flags on analyzer input
    OUTPUT: typed_gate_errors_effective boolean
    PRE: parse succeeded
    POST: ignored when typed_flow false or gate_mode false; explicit typed_gate_errors false preserves warnings-only; absent defaults to effective true when both gate flags true
    EFFECTS: pure
    TERMINATION: total
  IF typed_flow false OR gate_mode false: RETURN effective false
  IF typed_gate_errors explicitly false: RETURN effective false
  RETURN effective true

procedure ANNOTATED_PROCEDURE_DETECTION(proc):
  # [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW] How: Classify procedure as typed-annotated when ≥1 contract TypeTag or ≥1 body assignment/IF/CALL parsed to typed expression AST.
  Contract:
    INPUT: IrProcedure with contract entries and statements
    OUTPUT: is_annotated boolean
    PRE: procedure parsed
    POST: prose-only procedures (no TypeTag, no structured typed expr) return false; mixed contract rows with any TypeTag return true
    EFFECTS: pure
    TERMINATION: total
  FOR each contract entry: IF TypeTag present on value or binding: RETURN true
  FOR each assignment, IF, CALL statement: IF expression parser succeeds on relevant subexpression: RETURN true
  RETURN false

procedure PROMOTE_TYPED_DIAGNOSTIC_SEVERITY(program, typed_section, flags):
  # [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW] How: Promote proven gating codes to error-severity on annotated procedures when TYPED_GATE_ERRORS_FLAG effective; merge into top-level diagnostics for gate_mode ok aggregation.
  Contract:
    INPUT: program IR, sections.typed_flow diagnostics, gate_mode and typed_gate_errors flags
    OUTPUT: updated typed_section, gate_diagnostics[] for top-level merge
    PRE: typed_flow pass completed
    POST: TYPE_MISMATCH, NULL_FLOW, SHAPE_MISMATCH, CALL_TYPE_MISMATCH, JOIN_INCOMPATIBLE become error only when all activation predicate clauses hold; TYPED_OPAQUE_EXPR and TYPED_UNSUPPORTED_SYNTAX remain non-gating; prose-only procedures keep warning severity; default typed_gate_errors false leaves pilot behavior unchanged
    FAILURE_MODES: none
    EFFECTS: pure
    TERMINATION: total
    DATA_TRANSITION: typed_section.diagnostics severities updated; error-severity copies appended to report.diagnostics
  IF NOT TYPED_GATE_ERRORS_FLAG effective: RETURN typed_section unchanged with empty gate_diagnostics
  BUILD annotated_set from ANNOTATED_PROCEDURE_DETECTION for each procedure
  FOR each diagnostic in typed_section.diagnostics:
    IF code NOT IN gating set: LEAVE severity warning
    IF procedure NOT IN annotated_set: LEAVE severity warning
    ELSE: SET severity error
  MAP error-severity typed diagnostics to AnalysisDiagnostic and APPEND to gate_diagnostics
  RETURN updated typed_section and gate_diagnostics

procedure PHASE_3_QUALIFICATION(manifest):
  # [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW] How: Re-run 124-entry harness with typed_gate_errors true; prove R1/R2 zero new failures on prose-only and typed_flow false cohorts.
  Contract:
    INPUT: qualification manifest, pilot baseline reports
    OUTPUT: phase3/ reports and phase3-measurement-report.md metrics
    PRE: sub-phase 3a implementation green; corpus fixtures 18–24+ present
    POST: R1 typed_flow false unchanged vs pilot; R2 prose-only panel unchanged; annotated delta documented; sponsor approval NOT recorded until sub-phase 3c
    DATA_TRANSITION: phase3/ dir populated read-only; external client corpus unchanged
    EFFECTS: IO
    TERMINATION: total
  CALL run-phase3.ts with gate_mode true typed_flow true typed_gate_errors true
  COMPARE baseline and phase3 summaries for R1/R2/R4 thresholds
  DRAFT phase3-measurement-report.md without sponsor approval record
