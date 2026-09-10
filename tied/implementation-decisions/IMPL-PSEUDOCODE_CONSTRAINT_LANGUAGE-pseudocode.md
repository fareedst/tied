# [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] — Full constraint-language pass composing after typed-flow; grammar v2 opt-in; interproc solver; alias/mutation policy; scoped gate promotion.

Grammar-Version: v2

## Constraint-flow controls and flag dependency

- [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] How: Define opt-in constraint_flow flag requiring typed_flow; zero constraint diagnostics when constraint_flow false regardless of v2 header.
- Contract:
  - INPUT: analyzeEssencePseudocode input with optional constraint_flow boolean (default false) and typed_flow boolean
  - PRE: parse pass completed successfully; typed-flow infrastructure available when constraint_flow true
  - OUTPUT: pseudocode-analysis-report.v1 with optional sections.constraint_language
  - POST: when constraint_flow false, zero constraint diagnostics and no sections.constraint_language; when constraint_flow true, typed_flow must be effective true or input rejected/coerced per Q7; report includes solver metadata and proof_boundary extension
  - FAILURE_MODES: ParseFatal, BudgetExceeded, InvalidFlagCombination
  - EFFECTS: pure
  - TERMINATION: total
  - DATA_TRANSITION: none
  - CONTROL: gate_mode applies to legacy and typed diagnostics always; constraint diagnostics promote to error only when constraint_gate_errors true on constraint-annotated procedures (sub-phases 3a–3d)

procedure CONSTRAINT_FLOW_CONTROLS:
  # [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] How: Skip constraint pass unless caller sets constraint_flow true and typed_flow is effective true.
  Contract:
    INPUT: constraint_flow flag, typed_flow flag, program IR, typed_flow section
    OUTPUT: run_constraint boolean
    PRE: parse succeeded
    POST: run_constraint false when constraint_flow false or absent; run_constraint false when typed_flow false (Q7); invalid combo rejected or typed_flow coerced with diagnostic CONSTRAINT_TYPED_FLOW_REQUIRED
    EFFECTS: pure
    TERMINATION: total
  IF constraint_flow is false or absent: RETURN run_constraint false
  IF typed_flow is false or absent: REJECT or COERCE typed_flow true with CONSTRAINT_TYPED_FLOW_REQUIRED warning
  RETURN run_constraint true

## Grammar v2 version boundary

procedure DETECT_GRAMMAR_VERSION(sidecar_text):
  # [IMPL-PSEUDOCODE_GRAMMAR_V2] [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_GRAMMAR_V2] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] How: Read Grammar-Version header from sidecar preamble; default v1 when absent; harness may accept grammar_version_override for qualification only.
  Contract:
    INPUT: sidecar markdown text, optional grammar_version_override (harness only)
    OUTPUT: grammar_version enum v1 | v2
    PRE: sidecar text non-empty
    POST: absent header implies v1; header Grammar-Version: v2 selects v2 parser path; production ignores override when absent from harness; file extension alone never selects v2
    FAILURE_MODES: GrammarVersionUnsupported
    EFFECTS: pure
    TERMINATION: total
  IF harness override present AND qualification_mode: RETURN override version
  SCAN preamble for line matching Grammar-Version: v2
  IF matched: RETURN v2
  RETURN v1

procedure PARSE_PROGRAM_V2(sidecar_text):
  # [IMPL-PSEUDOCODE_GRAMMAR_V2] [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_GRAMMAR_V2] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] How: When grammar_version v2, parse refinements, summary declarations, alias/immutability annotations, and predicate subset without mutating pseudocode-shared.ts regex (D13).
  Contract:
    INPUT: sidecar text, grammar_version
    OUTPUT: program IR with constraint extensions (refinement nodes, summary decls, alias/mut tags)
    PRE: DETECT_GRAMMAR_VERSION completed
    POST: v1 path unchanged when grammar_version v1; v2 retains v1 constructs; mixed v1+v2 constructs in one file supported (F1b analog); unsupported v2 syntax records CONSTRAINT_UNSUPPORTED_SYNTAX unknown
    FAILURE_MODES: ParseFatal, ConstraintSyntaxUnsupported
    EFFECTS: pure
    TERMINATION: total
    DATA_TRANSITION: none
  IF grammar_version is v1: DELEGATE to existing v1 + typed-flow extension parser
  PARSE refinement predicates on contract rows and types
  PARSE procedure summary declarations (CALL/RETURN effects)
  PARSE alias policy and (immutable)/(mutable) DATA annotations
  RETURN extended program IR

## Constraint analysis budgets

procedure RESOLVE_CONSTRAINT_BUDGETS(input):
  # [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] How: Merge ConstraintAnalysisBudgets with DEFAULT_BUDGETS for parse/CFG; do not repurpose max_fixed_point_iterations (D14 abstract-pass counter).
  Contract:
    INPUT: optional ConstraintAnalysisBudgets partial, DEFAULT_BUDGETS
    OUTPUT: resolved budgets object
    PRE: DEFAULT_BUDGETS available
    POST: max_solver_steps, max_summary_depth, max_predicate_nodes present with documented defaults; parse/CFG/call-graph budgets inherited from DEFAULT_BUDGETS; zero solver_truncation on corpus at defaults (F10 analog)
    EFFECTS: pure
    TERMINATION: total
  MERGE max_solver_steps default 256
  MERGE max_summary_depth default 8
  MERGE max_predicate_nodes default 512
  INHERIT parse, cfg, call-graph knobs from DEFAULT_BUDGETS
  RETURN resolved budgets

## Intraprocedural refinement entailment

procedure CHECK_REFINEMENT_ENTAILMENT(env, predicate):
  # [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] How: Evaluate refinement predicates against type env facts at PRE/POST points; case 12 positive/negative controls (CL-1).
  Contract:
    INPUT: TypeEnv from typed-flow, RefinementPredicate AST, span
    OUTPUT: entailment result or diagnostic
    PRE: typed-flow pass completed for procedure
    POST: proven violation emits REFINEMENT_VIOLATION; unprovable emits unknown with cause predicate_unsupported; quantifier/bounds subset per grammar v2 spec
    FAILURE_MODES: PredicateBudgetExceeded
    EFFECTS: pure
    TERMINATION: total
  IF predicate node count exceeds max_predicate_nodes: RECORD solver_truncation unknown; RETURN unknown
  ATTEMPT entailment on scalar, nullable, collection bounds, quantifiers
  ON proven false: EMIT REFINEMENT_VIOLATION diagnostic
  ON inconclusive: RECORD unknown cause refinement_inconclusive
  RETURN result

## Interprocedural fixed-point solver

procedure RUN_CONSTRAINT_SOLVER(program, call_graph, typed_section, budgets):
  # [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] How: Iterate procedure summaries until stable or max_solver_steps; propagate CALL/RETURN effects; disclose truncation in solver_metadata (CL-4, CL-5).
  Contract:
    INPUT: program IR with summaries, call graph, typed_section, ConstraintAnalysisBudgets
    OUTPUT: constraint facts, summary conflicts, solver_metadata
    PRE: CONSTRAINT_FLOW_CONTROLS returned run_constraint true
    POST: missing callee summary yields unknown not silent pass (CL-4); budget exceed sets solver_truncation in metadata; summary conflicts emit SUMMARY_CONFLICT warning
    FAILURE_MODES: BudgetExceeded
    EFFECTS: pure
    TERMINATION: may_diverge
    DATA_TRANSITION: procedure summary map updated each iteration
  INITIALIZE summary map from declared procedure summaries
  REPEAT:
    FOR each CALL site: JOIN callee summary with caller env
    FOR each RETURN: propagate return refinement to caller POST
    INCREMENT solver step counter
  UNTIL stable OR steps exceed max_solver_steps OR depth exceeds max_summary_depth
  IF truncated: SET solver_metadata.solver_truncation true with cause and budgets_applied
  RETURN constraint facts and metadata

## Alias and immutability policy

procedure ENFORCE_ALIAS_MUTATION_POLICY(program, env):
  # [IMPL-PSEUDOCODE_ALIAS_MUTATION_POLICY] [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] How: When alias/immutability policy declared, check mutations and aliasing; cases 8 and 11; unknown when policy absent (CL-2, CL-3).
  Contract:
    INPUT: program IR with alias policy decls and (immutable)/(mutable) DATA rows, current env
    OUTPUT: alias/mutation diagnostics and unknowns
    PRE: typed-flow env available
    POST: proven immutability violation emits MUTATION_VIOLATION error candidate; alias policy violation emits ALIAS_VIOLATION; undeclared alias/mut policy yields 100% unknown disclosure not errors
    FAILURE_MODES: AliasAnalysisUnsupported
    EFFECTS: pure
    TERMINATION: total
    DATA_TRANSITION: none
  FOR each DATA row with (immutable): IF proven mutation: EMIT MUTATION_VIOLATION
  FOR each alias policy block: CHECK reference equality rules at CALL/RETURN
  IF alias policy absent for procedure: RECORD unknown cause alias_policy_absent
  RETURN diagnostics and unknowns

## Constraint-annotated procedure detection

procedure CONSTRAINT_ANNOTATED_PROCEDURE_DETECTION(proc, grammar_version):
  # [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] How: Classify procedure as constraint-annotated when v2 header in file scope OR ≥1 refinement/summary/alias/immutability annotation OR constraint predicate in procedure body.
  Contract:
    INPUT: IrProcedure, file-level grammar_version, constraint annotation inventory
    OUTPUT: is_constraint_annotated boolean
    PRE: procedure parsed
    POST: prose-only v1-only procedures return false; any refinement/summary/alias/immutability/predicate returns true; v2 header alone does not annotate prose-only procedures without constraint constructs (CL-6)
    EFFECTS: pure
    TERMINATION: total
  IF procedure contains refinement on contract row: RETURN true
  IF procedure contains summary declaration: RETURN true
  IF procedure contains alias policy or immutability tag: RETURN true
  IF procedure body contains parsed constraint predicate: RETURN true
  RETURN false

## Severity promotion and gate scoping

procedure CONSTRAINT_GATE_ERRORS_FLAG:
  # [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] How: Sub-phase 3d — default effective true when gate_mode && typed_flow && constraint_flow; explicit false opts out (mirrors typed_gate_errors Phase 3d).
  Contract:
    INPUT: gate_mode, typed_flow, constraint_flow, constraint_gate_errors flags
    OUTPUT: constraint_gate_errors_effective boolean
    PRE: parse succeeded
    POST: ignored when any of gate_mode, typed_flow, constraint_flow false; explicit constraint_gate_errors false opts out; otherwise effective true after Slice 8 sponsor approval
    EFFECTS: pure
    TERMINATION: total
  IF gate_mode false OR typed_flow false OR constraint_flow false: RETURN effective false
  IF constraint_gate_errors explicitly false: RETURN effective false
  RETURN effective true

procedure PROMOTE_CONSTRAINT_DIAGNOSTIC_SEVERITY(program, constraint_section, flags):
  # [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] How: Promote proven gating codes to error on constraint-annotated procedures when CONSTRAINT_GATE_ERRORS_FLAG effective; PSA-CONSTRAINT-001..004.
  Contract:
    INPUT: program IR, sections.constraint_language diagnostics, gate flags
    OUTPUT: updated constraint_section, gate_diagnostics[] for top-level merge
    PRE: constraint pass completed
    POST: REFINEMENT_VIOLATION, MUTATION_VIOLATION, ALIAS_VIOLATION, SUMMARY_CONFLICT (proven) become error only when activation predicate holds; solver truncation and unsupported codes remain non-gating; prose-only/v1-only procedures keep warning severity (PSA-CONSTRAINT-002)
    FAILURE_MODES: none
    EFFECTS: pure
    TERMINATION: total
    DATA_TRANSITION: constraint_section.diagnostics severities updated; error copies appended to report.diagnostics
  IF NOT CONSTRAINT_GATE_ERRORS_FLAG effective: RETURN constraint_section unchanged with empty gate_diagnostics
  BUILD annotated_set from CONSTRAINT_ANNOTATED_PROCEDURE_DETECTION for each procedure
  FOR each diagnostic in constraint_section.diagnostics:
    IF code NOT IN gating set: LEAVE severity warning
    IF procedure NOT IN annotated_set: LEAVE severity warning
    IF diagnostic caused by solver_truncation or unknown: LEAVE severity warning (PSA-CONSTRAINT-004)
    ELSE: SET severity error
  MAP error-severity constraint diagnostics to AnalysisDiagnostic and APPEND to gate_diagnostics
  RETURN updated constraint_section and gate_diagnostics

## Report section and orchestration

procedure COMPOSE_CONSTRAINT_LANGUAGE_SECTION(constraint_result):
  # [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] How: Attach sections.constraint_language to pseudocode-analysis-report.v1 without REPORT_SCHEMA_VERSION bump (Q2).
  Contract:
    INPUT: constraint_result diagnostics, unknowns, solver_metadata, proof_boundary extension text
    OUTPUT: sections.constraint_language object
    PRE: constraint pass ran
    POST: section includes diagnostics, unknowns, solver_metadata with truncation disclosure; deterministic JSON serialization (F9); no global schema_version change
    EFFECTS: pure
    TERMINATION: total
  ASSEMBLE sections.constraint_language with diagnostics, unknowns, solver_metadata, budgets_applied subset
  EXTEND proof_boundary text with constraint-language claim limits
  RETURN section

procedure ANALYZE_ESSENCE_PSEUDOCODE_CONSTRAINT(input):
  # [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] How: After typed-flow pass, optionally invoke constraint pipeline when constraint_flow true; F8 baseline when all constraint flags false vs Phase 3 commit 9438d1f.
  Contract:
    INPUT: standard analyze input plus constraint_flow and typed_flow flags
    OUTPUT: pseudocode-analysis-report.v1
    PRE: inherited ANALYZE_ESSENCE_PSEUDOCODE and typed-flow preconditions
    POST: when constraint_flow false, identical to typed-flow Phase 3 baseline with constraint flags off; when true, sections.constraint_language present; constraint_flow requires typed_flow (Q7)
    FAILURE_MODES: inherited
    EFFECTS: pure
    TERMINATION: total
  CALL DETECT_GRAMMAR_VERSION on sidecar text
  CALL ANALYZE_ESSENCE_PSEUDOCODE_TYPED with typed_flow per input
  IF CONSTRAINT_FLOW_CONTROLS.run_constraint:
    CALL PARSE_PROGRAM_V2 when grammar_version v2 else reuse typed program IR
    CALL RESOLVE_CONSTRAINT_BUDGETS
    CALL CHECK_REFINEMENT_ENTAILMENT for intraprocedural points
    CALL RUN_CONSTRAINT_SOLVER
    CALL ENFORCE_ALIAS_MUTATION_POLICY
    CALL PROMOTE_CONSTRAINT_DIAGNOSTIC_SEVERITY
    CALL COMPOSE_CONSTRAINT_LANGUAGE_SECTION
    MERGE sections.constraint_language into report
  RETURN report

## Qualification and regression baseline

procedure QUALIFY_CONSTRAINT_BASELINE(manifest):
  # [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] How: R1/R2/F8 vs typed-flow Phase 3 close-out 9438d1f; constraint_flow false byte-identical; never mutate client trees under /Users/fareed/Documents/dev/test.
  Contract:
    INPUT: qualification manifest with absolute sidecar paths
    OUTPUT: constraint baseline reports under working/REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE/qualification/
    PRE: harness scripts built; analyzer pinned to Phase 3 baseline for regression compare
    POST: R1 124/124 gate unchanged with constraint_flow false; R2 zero new failures on prose-only panel; outputs read-only on external corpus
    DATA_TRANSITION: working qualification dirs populated; external corpus unchanged
    EFFECTS: IO
    TERMINATION: total
  CALL run-constraint-baseline.ts with gate_mode true typed_flow false constraint_flow false
  COMPARE reports to Phase 3 snapshots at commit 9438d1f
  RECORD diff summary for R1/R2 thresholds

## F11 authoring burden gate (Slice 8)

procedure F11_CONSTRAINT_AUTHORING_GATE(retrofit_study):
  # [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] How: Median ≤15 lines/procedure and ≤25 decisions/procedure on 5–8 retrofits; stop >15 → REVISE/REJECT; SP-1..SP-7 any fail → REVISE; blocks constraint_gate_errors 3d without sponsor approval.
  Contract:
    INPUT: annotation-overhead-constraint.yaml study results
    OUTPUT: proceed | defer | reject recommendation
    PRE: Slice 7 corpus green
    POST: production constraint_gate_errors default blocked when median exceeds threshold even if F12 recall 100%
    EFFECTS: pure
    TERMINATION: total
  COMPUTE median annotation lines and decisions per procedure
  IF median lines > 15 OR median decisions > 25: RETURN reject
  IF any SP-1..SP-7 fail: RETURN revise
  RETURN proceed
