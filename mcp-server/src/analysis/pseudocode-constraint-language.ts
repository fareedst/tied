/**
 * [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
 * Summary: Intraprocedural constraint pass — refinement entailment at PRE/POST (Slice 3 stub; no interproc solver).
 */
import { parseExpression } from "./pseudocode-expression-parser.js";
import type { CfgSection } from "./pseudocode-cfg.js";
import {
  assumePredicateFacts,
  checkRefinementEntailment,
  emptyRefinementFactEnv,
  type RefinementFactEnv,
} from "./pseudocode-constraint-entailment.js";
import type {
  ConstraintAnalysisBudgets,
  ConstraintDiagnostic,
  ConstraintFlowSection,
} from "./pseudocode-constraint-ir.js";
import { DEFAULT_CONSTRAINT_BUDGETS } from "./pseudocode-constraint-ir.js";
import { enforceAliasMutationPolicy } from "./pseudocode-constraint-alias-mutation.js";
import { runConstraintSolver, shouldRunInterproceduralSolver } from "./pseudocode-constraint-solver.js";
import type { CallGraphSection } from "./pseudocode-call-graph.js";
import { parseRefinementPredicate } from "./pseudocode-constraint-predicate.js";
import type {
  AnalysisUnknown,
  ContractFieldEntry,
  IrAssignment,
  IrIf,
  IrProcedure,
  IrProgram,
  IrStatement,
  PseudocodeAnalysisBudgets,
} from "./pseudocode-ir.js";
import { DEFAULT_BUDGETS, GRAMMAR_VERSION_V2 } from "./pseudocode-ir.js";
import { extractV2ContractBinding } from "./pseudocode-grammar-v2.js";
import type { TypedFlowSection } from "./pseudocode-typed-flow.js";
import {
  extractContractBinding as extractTypedBinding,
  typeFactFromTag,
  unknownFact,
} from "./pseudocode-typed-ir.js";

export const CONSTRAINT_FLOW_PROOF_BOUNDARY_SUPPLEMENT =
  "Constraint-language checks apply only where grammar v2 refinements are authored and within solver budgets; not runtime execution or complete behavioral verification.";

export const CONSTRAINT_GATE_ERRORS_PROOF_BOUNDARY_SUPPLEMENT =
  "Phase 3a constraint gate errors apply only to proven constraint violations in constraint-annotated procedures when constraint_gate_errors is true.";

/** Proven violation codes eligible for gate promotion on constraint-annotated procedures. */
export const GATING_CONSTRAINT_DIAGNOSTIC_CODES = [
  "REFINEMENT_VIOLATION",
  "MUTATION_VIOLATION",
  "ALIAS_VIOLATION",
  "SUMMARY_CONFLICT",
] as const satisfies readonly ConstraintDiagnostic["code"][];

function constraintDiagnosticSort(a: ConstraintDiagnostic, b: ConstraintDiagnostic): number {
  return a.line - b.line || a.code.localeCompare(b.code) || a.message.localeCompare(b.message);
}

function isGatingConstraintDiagnosticCode(
  code: ConstraintDiagnostic["code"],
): code is (typeof GATING_CONSTRAINT_DIAGNOSTIC_CODES)[number] {
  return (GATING_CONSTRAINT_DIAGNOSTIC_CODES as readonly string[]).includes(code);
}

export type ResolvedConstraintBudgets = PseudocodeAnalysisBudgets & ConstraintAnalysisBudgets;

/**
 * [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [ARCH-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
 * How: Merge ConstraintAnalysisBudgets with DEFAULT_BUDGETS parse/CFG knobs (D14 separate solver counters).
 */
export function resolveConstraintBudgets(
  partial: Partial<ConstraintAnalysisBudgets> = {},
): ResolvedConstraintBudgets {
  return {
    ...DEFAULT_BUDGETS,
    max_solver_steps: partial.max_solver_steps ?? DEFAULT_CONSTRAINT_BUDGETS.max_solver_steps,
    max_summary_depth: partial.max_summary_depth ?? DEFAULT_CONSTRAINT_BUDGETS.max_summary_depth,
    max_predicate_nodes: partial.max_predicate_nodes ?? DEFAULT_CONSTRAINT_BUDGETS.max_predicate_nodes,
  };
}

function buildTypeEnv(
  proc: IrProcedure,
  grammarVersion: string,
): Map<string, import("./pseudocode-typed-ir.js").TypeFact> {
  const env = new Map<string, import("./pseudocode-typed-ir.js").TypeFact>();
  for (const entry of proc.contract.entries ?? []) {
    const binding =
      grammarVersion === GRAMMAR_VERSION_V2
        ? extractV2ContractBinding(entry.value)
        : extractTypedBinding(entry.value);
    const name = binding.name ?? entry.field.toLowerCase();
    if (entry.type_tag) {
      env.set(name, typeFactFromTag(entry.type_tag));
    } else if (binding.type_tag) {
      env.set(name, typeFactFromTag(binding.type_tag));
    } else {
      env.set(name, unknownFact("missing_annotation"));
    }
  }
  return env;
}

function assumeContractRefinements(
  env: RefinementFactEnv,
  proc: IrProcedure,
  grammarVersion: string,
  unknowns: AnalysisUnknown[],
): void {
  for (const entry of proc.contract.entries ?? []) {
    const refinement = refinementFromEntry(entry, grammarVersion);
    if (!refinement) continue;
    const parsed = parseRefinementPredicate(refinement);
    if (!parsed.ok) {
      unknowns.push({
        cause: parsed.cause,
        message: parsed.message,
        procedure: proc.name,
        line: entry.value ? proc.contract.span?.line : proc.span.line,
        proof_boundary: CONSTRAINT_FLOW_PROOF_BOUNDARY_SUPPLEMENT,
      });
      continue;
    }
    assumePredicateFacts(env, parsed.predicate.ast!);
  }
}

function refinementFromEntry(entry: ContractFieldEntry, grammarVersion: string): string | undefined {
  if (entry.refinement) return entry.refinement;
  if (grammarVersion === GRAMMAR_VERSION_V2) {
    const binding = extractV2ContractBinding(entry.value);
    return binding.refinement;
  }
  return undefined;
}

function isRefinementOnlyPrePost(entry: ContractFieldEntry): boolean {
  if (entry.field !== "PRE" && entry.field !== "POST") return false;
  const trimmed = entry.value.trim();
  return trimmed.length > 0 && !/^(true|false)$/i.test(trimmed);
}

function transferRefinementFacts(stmt: IrStatement, env: RefinementFactEnv): void {
  if (stmt.kind === "assignment") {
    transferAssignmentFacts(stmt, env);
    return;
  }
  if (stmt.kind === "if") {
    transferIfFacts(stmt, env);
  }
}

function transferAssignmentFacts(stmt: IrAssignment, env: RefinementFactEnv): void {
  const parsed = parseExpression(stmt.value);
  if (!parsed.ok) return;
  if (parsed.expr.kind === "literal" && typeof parsed.expr.value === "number") {
    env.scalarBounds.set(stmt.target, { exact: parsed.expr.value });
    return;
  }
  if (parsed.expr.kind === "ref") {
    const sourceBounds = env.scalarBounds.get(parsed.expr.name);
    if (sourceBounds) {
      env.scalarBounds.set(stmt.target, { ...sourceBounds });
    }
    if (env.nonNull.has(parsed.expr.name)) {
      env.nonNull.add(stmt.target);
    }
  }
}

function transferIfFacts(stmt: IrIf, env: RefinementFactEnv): void {
  const parsed = parseExpression(stmt.condition);
  if (!parsed.ok) {
    const refinementParsed = parseRefinementPredicate(stmt.condition);
    if (refinementParsed.ok && refinementParsed.predicate.ast) {
      assumePredicateFacts(env, refinementParsed.predicate.ast);
    }
    return;
  }
  if (parsed.expr.kind === "binary" && parsed.expr.op === ">") {
    if (parsed.expr.left.kind === "ref" && parsed.expr.right.kind === "literal") {
      const existing = env.scalarBounds.get(parsed.expr.left.name) ?? {};
      env.scalarBounds.set(parsed.expr.left.name, {
        ...existing,
        min: (parsed.expr.right.value as number) + 1,
      });
    }
  }
  const condText = stmt.condition.trim();
  const lengthMatch = condText.match(/^length\s*\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)\s*>\s*(\d+)$/i);
  if (lengthMatch) {
    const existing = env.lengthBounds.get(lengthMatch[1]!) ?? {};
    env.lengthBounds.set(lengthMatch[1]!, {
      ...existing,
      min: Number(lengthMatch[2]) + 1,
    });
  }
  if (parsed.expr.kind === "is_not_null" && parsed.expr.operand.kind === "ref") {
    env.nonNull.add(parsed.expr.operand.name);
  }
}

function checkContractRefinement(
  proc: IrProcedure,
  entry: ContractFieldEntry,
  env: RefinementFactEnv,
  grammarVersion: string,
  budgets: ConstraintAnalysisBudgets,
  diagnostics: ConstraintDiagnostic[],
  unknowns: AnalysisUnknown[],
  point: "PRE" | "POST",
): { checked: number; proven: number } {
  let text = refinementFromEntry(entry, grammarVersion);
  if (!text && isRefinementOnlyPrePost(entry)) {
    text = entry.value.trim();
  }
  if (!text || /^(true|false)$/i.test(text)) return { checked: 0, proven: 0 };

  const parsed = parseRefinementPredicate(text);
  if (!parsed.ok) {
    unknowns.push({
      cause: parsed.cause,
      message: parsed.message,
      procedure: proc.name,
      line: proc.contract.span?.line ?? proc.span.line,
      proof_boundary: CONSTRAINT_FLOW_PROOF_BOUNDARY_SUPPLEMENT,
    });
    return { checked: 0, proven: 0 };
  }

  const result = checkRefinementEntailment(env, parsed.predicate, budgets);
  if (result.outcome === "proven_false") {
    diagnostics.push({
      severity: "warning",
      code: "REFINEMENT_VIOLATION",
      message: `${point} refinement violated: ${text}`,
      line: proc.contract.span?.line ?? proc.span.line,
      procedure: proc.name,
      span: proc.contract.span,
    });
    return { checked: 1, proven: 0 };
  }
  if (result.outcome === "inconclusive") {
    unknowns.push({
      cause: result.cause ?? "refinement_inconclusive",
      message: `${point} refinement inconclusive: ${text}`,
      procedure: proc.name,
      line: proc.contract.span?.line ?? proc.span.line,
      proof_boundary: CONSTRAINT_FLOW_PROOF_BOUNDARY_SUPPLEMENT,
    });
    return { checked: 1, proven: 0 };
  }
  return { checked: 1, proven: 1 };
}

function analyzeProcedureConstraints(
  proc: IrProcedure,
  grammarVersion: string,
  budgets: ConstraintAnalysisBudgets,
  diagnostics: ConstraintDiagnostic[],
  unknowns: AnalysisUnknown[],
): { checked: number; proven: number } {
  let checked = 0;
  let proven = 0;

  const typeEnv = buildTypeEnv(proc, grammarVersion);
  const entryEnv = emptyRefinementFactEnv(typeEnv);
  assumeContractRefinements(entryEnv, proc, grammarVersion, unknowns);

  for (const entry of proc.contract.entries ?? []) {
    if (entry.field !== "PRE") continue;
    const stats = checkContractRefinement(
      proc,
      entry,
      entryEnv,
      grammarVersion,
      budgets,
      diagnostics,
      unknowns,
      "PRE",
    );
    checked += stats.checked;
    proven += stats.proven;
  }

  let exitEnv = emptyRefinementFactEnv(typeEnv);
  assumeContractRefinements(exitEnv, proc, grammarVersion, unknowns);
  for (const stmt of proc.statements) {
    if (stmt.kind === "return") {
      for (const entry of proc.contract.entries ?? []) {
        if (entry.field !== "POST") continue;
        const stats = checkContractRefinement(
          proc,
          entry,
          exitEnv,
          grammarVersion,
          budgets,
          diagnostics,
          unknowns,
          "POST",
        );
        checked += stats.checked;
        proven += stats.proven;
      }
    }
    transferRefinementFacts(stmt, exitEnv);
  }

  return { checked, proven };
}

/**
 * [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
 * How: Classify constraint-annotated procedure when refinements/summaries/alias/immutability present (CL-6 guard).
 */
export function isConstraintAnnotatedProcedure(proc: IrProcedure, grammarVersion: string): boolean {
  for (const entry of proc.contract.entries ?? []) {
    if (entry.refinement) return true;
    if (entry.mutability) return true;
    if (refinementFromEntry(entry, grammarVersion)) return true;
    if (grammarVersion === GRAMMAR_VERSION_V2 && isRefinementOnlyPrePost(entry)) return true;
  }
  if (proc.summaries && proc.summaries.length > 0) return true;
  if (proc.alias_policy && proc.alias_policy.entries.length > 0) return true;
  return false;
}

function mergeConstraintSections(
  base: ConstraintFlowSection,
  interproc: ReturnType<typeof runConstraintSolver> | null,
): ConstraintFlowSection {
  if (!interproc) return base;
  const diagnostics = [...base.diagnostics, ...interproc.diagnostics].sort(
    (a, b) => a.line - b.line || a.code.localeCompare(b.code),
  );
  const unknowns = [...base.unknowns, ...interproc.unknowns].sort(
    (a, b) => (a.line ?? 0) - (b.line ?? 0) || a.cause.localeCompare(b.cause),
  );
  return {
    procedures_analyzed: base.procedures_analyzed,
    diagnostics,
    unknowns,
    refinements_checked: base.refinements_checked + interproc.refinements_checked,
    refinements_proven: base.refinements_proven + interproc.refinements_proven,
    solver_metadata: interproc.solver_metadata,
    interproc_enabled: true,
    alias_mut_checked: base.alias_mut_checked,
    alias_mut_violations: base.alias_mut_violations,
  };
}

function mergeAliasMutationSection(
  base: ConstraintFlowSection,
  aliasMut: ReturnType<typeof enforceAliasMutationPolicy>,
): ConstraintFlowSection {
  const diagnostics = [...base.diagnostics, ...aliasMut.diagnostics].sort(
    (a, b) => a.line - b.line || a.code.localeCompare(b.code),
  );
  const unknowns = [...base.unknowns, ...aliasMut.unknowns].sort(
    (a, b) => (a.line ?? 0) - (b.line ?? 0) || a.cause.localeCompare(b.cause),
  );
  return {
    ...base,
    diagnostics,
    unknowns,
    alias_mut_checked: (base.alias_mut_checked ?? 0) + aliasMut.alias_mut_checked,
    alias_mut_violations: (base.alias_mut_violations ?? 0) + aliasMut.alias_mut_violations,
  };
}

/**
 * [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
 * How: Full constraint pass — intraprocedural refinements then interproc solver when v2 summaries/CALL present.
 */
export function runConstraintAnalysis(
  program: IrProgram,
  callGraph: CallGraphSection,
  cfg: CfgSection,
  typedSection: TypedFlowSection,
  budgets: ResolvedConstraintBudgets = resolveConstraintBudgets(),
): { section: ConstraintFlowSection } {
  const intraprocedural = runIntraproceduralConstraintAnalysis(program, cfg, typedSection, budgets);
  let section = intraprocedural.section;
  if (shouldRunInterproceduralSolver(program)) {
    const interproc = runConstraintSolver(program, callGraph, typedSection, budgets);
    section = mergeConstraintSections(section, interproc);
  }
  const aliasMut = enforceAliasMutationPolicy(program);
  return { section: mergeAliasMutationSection(section, aliasMut) };
}

/**
 * [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
 * How: Intraprocedural constraint pass composing typed-flow facts with v2 refinements.
 */
export function runIntraproceduralConstraintAnalysis(
  program: IrProgram,
  _cfg: CfgSection,
  _typedSection: TypedFlowSection,
  budgets: ResolvedConstraintBudgets = resolveConstraintBudgets(),
): { section: ConstraintFlowSection } {
  const diagnostics: ConstraintDiagnostic[] = [];
  const unknowns: AnalysisUnknown[] = [];
  let refinementsChecked = 0;
  let refinementsProven = 0;
  const grammarVersion = program.grammar_version ?? "pseudocode-grammar.v1";

  for (const proc of program.procedures) {
    if (!isConstraintAnnotatedProcedure(proc, grammarVersion)) continue;
    const stats = analyzeProcedureConstraints(proc, grammarVersion, budgets, diagnostics, unknowns);
    refinementsChecked += stats.checked;
    refinementsProven += stats.proven;
  }

  const section: ConstraintFlowSection = {
    procedures_analyzed: program.procedures.length,
    diagnostics: diagnostics.sort((a, b) => a.line - b.line || a.code.localeCompare(b.code)),
    unknowns: unknowns.sort((a, b) => (a.line ?? 0) - (b.line ?? 0) || a.cause.localeCompare(b.cause)),
    refinements_checked: refinementsChecked,
    refinements_proven: refinementsProven,
  };

  return { section };
}

/**
 * [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
 * How: Promote proven gating constraint codes to error on constraint-annotated procedures when constraint_gate_errors is effective.
 */
export function applyConstraintGateSeverityPromotion(
  program: IrProgram,
  section: ConstraintFlowSection,
): ConstraintFlowSection {
  const grammarVersion = program.grammar_version ?? "pseudocode-grammar.v1";
  const annotated = new Set(
    program.procedures
      .filter((proc) => isConstraintAnnotatedProcedure(proc, grammarVersion))
      .map((candidate) => candidate.name),
  );
  const diagnostics = section.diagnostics.map((diagnostic) => {
    if (!isGatingConstraintDiagnosticCode(diagnostic.code)) {
      return diagnostic;
    }
    const procName = diagnostic.procedure;
    if (!procName || !annotated.has(procName)) {
      return diagnostic;
    }
    return { ...diagnostic, severity: "error" as const };
  });
  return {
    ...section,
    diagnostics: diagnostics.sort(constraintDiagnosticSort),
  };
}

/**
 * [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
 * How: Map error-severity constraint diagnostics into top-level gate diagnostics for gate_mode ok aggregation.
 */
export function constraintGateDiagnosticsToAnalysis(section: ConstraintFlowSection): import("./pseudocode-ir.js").AnalysisDiagnostic[] {
  return section.diagnostics
    .filter(
      (diagnostic) =>
        diagnostic.severity === "error" && isGatingConstraintDiagnosticCode(diagnostic.code),
    )
    .map((diagnostic) => ({
      severity: "error" as const,
      code: diagnostic.code as import("./pseudocode-ir.js").AnalysisDiagnostic["code"],
      message: diagnostic.message,
      line: diagnostic.line,
      block: diagnostic.procedure,
      span: diagnostic.span,
    }));
}

/**
 * [IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE] [ARCH-PSEUDOCODE_CONSTRAINT_LANGUAGE_PASS] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
 * How: Sub-phase 3d — default true when gate_mode && typed_flow && constraint_flow; explicit false opts out.
 */
export function isConstraintGateErrorsEffective(input: {
  gate_mode?: boolean;
  typed_flow?: boolean;
  constraint_flow?: boolean;
  constraint_gate_errors?: boolean;
}): boolean {
  if (input.gate_mode !== true || input.typed_flow !== true || input.constraint_flow !== true) {
    return false;
  }
  if (input.constraint_gate_errors === false) return false;
  return true;
}
