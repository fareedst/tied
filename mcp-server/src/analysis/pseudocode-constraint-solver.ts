/**
 * [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [ARCH-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
 * Summary: RUN_CONSTRAINT_SOLVER — fixed-point interprocedural summary propagation at CALL/RETURN.
 */
import { parseCallArgExpressions } from "./pseudocode-expression-parser.js";
import type { CallGraphSection } from "./pseudocode-call-graph.js";
import {
  applyAssumedRefinementToEnv,
  checkRefinementEntailment,
  emptyRefinementFactEnv,
  type RefinementFactEnv,
} from "./pseudocode-constraint-entailment.js";
import type {
  ConstraintAnalysisBudgets,
  ConstraintDiagnostic,
  ResolvedProcedureSummaries,
  SolverMetadata,
  SummaryEntry,
} from "./pseudocode-constraint-ir.js";
import { parseRefinementPredicate } from "./pseudocode-constraint-predicate.js";
const CONSTRAINT_SOLVER_PROOF_BOUNDARY =
  "Constraint-language checks apply only where grammar v2 refinements are authored and within solver budgets; not runtime execution or complete behavioral verification.";
import { extractV2ContractBinding } from "./pseudocode-grammar-v2.js";
import type { AnalysisUnknown, ContractFieldEntry, IrCall, IrProcedure, IrProgram } from "./pseudocode-ir.js";
import { GRAMMAR_VERSION_V2 } from "./pseudocode-ir.js";
import type { TypedFlowSection } from "./pseudocode-typed-flow.js";
import { extractContractBinding as extractTypedBinding, typeFactFromTag, unknownFact } from "./pseudocode-typed-ir.js";

export type ConstraintSolverResult = {
  diagnostics: ConstraintDiagnostic[];
  unknowns: AnalysisUnknown[];
  solver_metadata: SolverMetadata;
  interproc_facts_propagated: number;
  refinements_checked: number;
  refinements_proven: number;
};

function contractBindingNames(entries: ContractFieldEntry[] | undefined, field: string): string[] {
  const names: string[] = [];
  for (const entry of entries ?? []) {
    if (entry.field !== field) continue;
    const binding =
      entry.type_tag !== undefined || entry.refinement !== undefined
        ? { name: entry.field.toLowerCase(), type_tag: entry.type_tag }
        : extractV2ContractBinding(entry.value);
    const name = binding.name ?? entry.field.toLowerCase();
    if (!names.includes(name)) names.push(name);
  }
  return names;
}

function buildTypeEnv(proc: IrProcedure, grammarVersion: string): Map<string, import("./pseudocode-typed-ir.js").TypeFact> {
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

function resolveDeclaredSummaries(proc: IrProcedure): ResolvedProcedureSummaries {
  const call: SummaryEntry[] = [];
  const ret: SummaryEntry[] = [];
  for (const summary of proc.summaries ?? []) {
    if (summary.kind === "call") call.push(...summary.entries);
    if (summary.kind === "return") ret.push(...summary.entries);
  }
  return { call, return: ret };
}

function remapPredicateText(text: string, mapping: Map<string, string>): string {
  let remapped = text;
  const keys = [...mapping.keys()].sort((a, b) => b.length - a.length);
  for (const key of keys) {
    const target = mapping.get(key)!;
    remapped = remapped.replace(new RegExp(`\\b${key}\\b`, "g"), target);
  }
  return remapped;
}

function boundsConflict(a: { min?: number; max?: number; exact?: number }, b: { min?: number; max?: number; exact?: number }): boolean {
  const minA = a.exact ?? a.min;
  const maxA = a.exact ?? a.max;
  const minB = b.exact ?? b.min;
  const maxB = b.exact ?? b.max;
  if (minA !== undefined && maxB !== undefined && minA > maxB) return true;
  if (minB !== undefined && maxA !== undefined && minB > maxA) return true;
  if (a.exact !== undefined && b.exact !== undefined && a.exact !== b.exact) return true;
  return false;
}

/**
 * [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [ARCH-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
 * How: Detect conflicting ensures/requires within declared SUMMARY blocks (CL-16).
 */
export function detectSummaryConflicts(proc: IrProcedure): ConstraintDiagnostic[] {
  const diagnostics: ConstraintDiagnostic[] = [];
  const summaries = proc.summaries ?? [];
  const ensuresByVar = new Map<string, Array<{ text: string; bounds: { min?: number; max?: number; exact?: number } }>>();

  for (const summary of summaries) {
    for (const entry of summary.entries) {
      if (entry.key !== "ensures" && entry.key !== "requires") continue;
      const parsed = parseRefinementPredicate(entry.value);
      if (!parsed.ok || !parsed.predicate.ast) continue;
      const ast = parsed.predicate.ast;
      if (ast.kind !== "compare" || ast.left.kind !== "ref" || ast.right.kind !== "number") continue;
      const varName = ast.left.name;
      const bounds: { min?: number; max?: number; exact?: number } = {};
      if (ast.op === ">=") bounds.min = ast.right.value;
      else if (ast.op === ">") bounds.min = ast.right.value + 1;
      else if (ast.op === "<=") bounds.max = ast.right.value;
      else if (ast.op === "<") bounds.max = ast.right.value - 1;
      else if (ast.op === "=") bounds.exact = ast.right.value;
      const list = ensuresByVar.get(varName) ?? [];
      list.push({ text: entry.value, bounds });
      ensuresByVar.set(varName, list);
    }
  }

  for (const [varName, entries] of ensuresByVar) {
    for (let i = 0; i < entries.length; i += 1) {
      for (let j = i + 1; j < entries.length; j += 1) {
        if (boundsConflict(entries[i]!.bounds, entries[j]!.bounds)) {
          diagnostics.push({
            severity: "warning",
            code: "SUMMARY_CONFLICT",
            message: `Conflicting ${varName} summary constraints: ${entries[i]!.text} vs ${entries[j]!.text}`,
            line: proc.contract.span?.line ?? proc.span.line,
            procedure: proc.name,
            span: proc.contract.span,
          });
        }
      }
    }
  }

  return diagnostics;
}

function callArgRefNames(stmt: IrCall): string[] {
  const argExprs = stmt.arg_exprs ?? parseCallArgExpressions(stmt.args);
  return argExprs.map((expr) => (expr?.kind === "ref" ? expr.name : ""));
}

function buildCallNameMapping(
  caller: IrProcedure,
  callee: IrProcedure,
  stmt: IrCall,
): Map<string, string> {
  const mapping = new Map<string, string>();
  const calleeInputs = contractBindingNames(callee.contract.entries, "INPUT");
  const calleeOutputs = contractBindingNames(callee.contract.entries, "OUTPUT");
  const callerOutputs = contractBindingNames(caller.contract.entries, "OUTPUT");
  const argNames = callArgRefNames(stmt);

  for (let i = 0; i < calleeInputs.length; i += 1) {
    const calleeName = calleeInputs[i]!;
    const callerName = argNames[i];
    if (callerName) mapping.set(calleeName, callerName);
  }
  for (let i = 0; i < calleeOutputs.length; i += 1) {
    const calleeName = calleeOutputs[i]!;
    const callerName = callerOutputs[i] ?? callerOutputs[0];
    if (callerName) mapping.set(calleeName, callerName);
  }
  return mapping;
}

function applySummaryEntries(
  env: RefinementFactEnv,
  entries: SummaryEntry[],
  mapping: Map<string, string>,
  keyFilter: Set<string>,
): number {
  let applied = 0;
  for (const entry of entries) {
    if (!keyFilter.has(entry.key)) continue;
    const remapped = remapPredicateText(entry.value, mapping);
    const result = applyAssumedRefinementToEnv(env, remapped);
    if (result.outcome === "proven_true") applied += 1;
  }
  return applied;
}

function envSignature(env: RefinementFactEnv): string {
  const scalar = [...env.scalarBounds.entries()].sort(([a], [b]) => a.localeCompare(b));
  const length = [...env.lengthBounds.entries()].sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify({ scalar, length, nonNull: [...env.nonNull].sort() });
}

function calleeHasSummaries(proc: IrProcedure | undefined): boolean {
  if (!proc?.summaries || proc.summaries.length === 0) return false;
  return proc.summaries.some((s) => s.entries.length > 0);
}

function programHasInterprocSites(program: IrProgram): boolean {
  const hasCalls = program.procedures.some((proc) => proc.statements.some((s) => s.kind === "call"));
  const hasSummaries = program.procedures.some((proc) => calleeHasSummaries(proc));
  return hasCalls || hasSummaries;
}

function checkPostWithEnv(
  proc: IrProcedure,
  env: RefinementFactEnv,
  grammarVersion: string,
  budgets: ConstraintAnalysisBudgets,
): { checked: number; proven: number } {
  let checked = 0;
  let proven = 0;
  for (const entry of proc.contract.entries ?? []) {
    if (entry.field !== "POST") continue;
    let text = entry.refinement;
    if (!text && grammarVersion === GRAMMAR_VERSION_V2) {
      const binding = extractV2ContractBinding(entry.value);
      text = binding.refinement;
    }
    if (!text || /^(true|false)$/i.test(text)) {
      const trimmed = entry.value.trim();
      if (trimmed && !/^(true|false)$/i.test(trimmed)) text = trimmed;
    }
    if (!text || /^(true|false)$/i.test(text)) continue;
    const parsed = parseRefinementPredicate(text);
    if (!parsed.ok) continue;
    checked += 1;
    const result = checkRefinementEntailment(env, parsed.predicate, budgets);
    if (result.outcome === "proven_true") proven += 1;
  }
  return { checked, proven };
}

/**
 * [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [ARCH-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
 * How: Fixed-point loop joining callee summaries at CALL sites; disclose truncation (CL-4, CL-5).
 */
export function runConstraintSolver(
  program: IrProgram,
  callGraph: CallGraphSection,
  _typedSection: TypedFlowSection,
  budgets: ConstraintAnalysisBudgets,
): ConstraintSolverResult {
  const diagnostics: ConstraintDiagnostic[] = [];
  const unknowns: AnalysisUnknown[] = [];
  const procByName = new Map(program.procedures.map((p) => [p.name, p]));
  const grammarVersion = program.grammar_version ?? "pseudocode-grammar.v1";
  let interprocFactsPropagated = 0;
  let refinementsChecked = 0;
  let refinementsProven = 0;
  let interprocCallsAnalyzed = 0;

  for (const proc of program.procedures) {
    diagnostics.push(...detectSummaryConflicts(proc));
  }

  const exitEnvByProc = new Map<string, RefinementFactEnv>();
  for (const proc of program.procedures) {
    exitEnvByProc.set(proc.name, emptyRefinementFactEnv(buildTypeEnv(proc, grammarVersion)));
  }

  let solverSteps = 0;
  let summaryDepth = 0;
  let changed = true;
  let truncated = false;
  let truncationCause: SolverMetadata["truncation_cause"];

  while (changed && !truncated) {
    changed = false;
    if (solverSteps >= budgets.max_solver_steps) {
      truncated = true;
      truncationCause = "max_solver_steps";
      break;
    }
    if (summaryDepth >= budgets.max_summary_depth) {
      truncated = true;
      truncationCause = "max_summary_depth";
      break;
    }

    solverSteps += 1;

    for (const edge of callGraph.edges) {
      if (edge.kind !== "call") continue;
      const caller = procByName.get(edge.caller);
      const callee = procByName.get(edge.callee);
      if (!caller || !callee) continue;

      const callStmt = caller.statements.find((s) => s.kind === "call" && s.callee === edge.callee && s.span.line === edge.line);
      if (!callStmt || callStmt.kind !== "call") continue;

      interprocCallsAnalyzed += 1;

      if (!calleeHasSummaries(callee)) {
        unknowns.push({
          cause: "summary_missing",
          message: `CALL ${edge.callee} lacks procedure summary for interprocedural constraint propagation`,
          procedure: edge.caller,
          line: edge.line,
          proof_boundary: CONSTRAINT_SOLVER_PROOF_BOUNDARY,
        });
        continue;
      }

      const declared = resolveDeclaredSummaries(callee);
      const mapping = buildCallNameMapping(caller, callee, callStmt);
      const callerEnv = exitEnvByProc.get(caller.name)!;
      const beforeSig = envSignature(callerEnv);

      interprocFactsPropagated += applySummaryEntries(callerEnv, declared.call, mapping, new Set(["requires"]));
      interprocFactsPropagated += applySummaryEntries(callerEnv, declared.return, mapping, new Set(["ensures"]));

      if (envSignature(callerEnv) !== beforeSig) changed = true;
    }

    if (changed) summaryDepth += 1;
  }

  for (const proc of program.procedures) {
    const hasCall = proc.statements.some((s) => s.kind === "call");
    if (!hasCall) continue;
    const env = exitEnvByProc.get(proc.name)!;
    const stats = checkPostWithEnv(proc, env, grammarVersion, budgets);
    refinementsChecked += stats.checked;
    refinementsProven += stats.proven;
  }

  const solver_metadata: SolverMetadata = {
    solver_steps: solverSteps,
    summary_depth: summaryDepth,
    budgets_applied: { ...budgets },
    interproc_calls_analyzed: interprocCallsAnalyzed,
    interproc_facts_propagated: interprocFactsPropagated,
    ...(truncated
      ? {
          solver_truncation: true,
          truncation_cause: truncationCause,
        }
      : {}),
  };

  return {
    diagnostics: diagnostics.sort((a, b) => a.line - b.line || a.code.localeCompare(b.code)),
    unknowns: unknowns.sort((a, b) => (a.line ?? 0) - (b.line ?? 0) || a.cause.localeCompare(b.cause)),
    solver_metadata,
    interproc_facts_propagated: interprocFactsPropagated,
    refinements_checked: refinementsChecked,
    refinements_proven: refinementsProven,
  };
}

/**
 * [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [ARCH-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
 * How: True when grammar v2 program has CALL sites or declared summaries for interproc pass.
 */
export function shouldRunInterproceduralSolver(program: IrProgram): boolean {
  if (program.grammar_version !== GRAMMAR_VERSION_V2) return false;
  return programHasInterprocSites(program);
}
