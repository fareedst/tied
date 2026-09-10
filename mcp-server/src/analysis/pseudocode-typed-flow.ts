/**
 * [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
 * Summary: CFG transfer/join typed-flow analysis with pilot diagnostics and unknown policy (D14 join iterations).
 */
import type { Expr } from "./pseudocode-expression-parser.js";
import { parseCallArgExpressions, parseExpression } from "./pseudocode-expression-parser.js";
import type { CfgSection, ProcedureCfg } from "./pseudocode-cfg.js";
import type {
  AnalysisUnknown,
  IrAssignment,
  IrCall,
  IrIf,
  IrProgram,
  IrProcedure,
  IrStatement,
  PseudocodeAnalysisBudgets,
  SourceSpan,
} from "./pseudocode-ir.js";
import {
  extractContractBinding,
  joinTypeFacts,
  parseTypeTag,
  type TypeFact,
  type TypeTag,
  typeFactFromTag,
  typesCompatible,
  unknownFact,
} from "./pseudocode-typed-ir.js";

export type TypedDiagnosticCode =
  | "TYPE_MISMATCH"
  | "NULL_FLOW"
  | "SHAPE_MISMATCH"
  | "CALL_TYPE_MISMATCH"
  | "JOIN_INCOMPATIBLE"
  | "TYPED_OPAQUE_EXPR"
  | "TYPED_UNSUPPORTED_SYNTAX";

export type TypedDiagnostic = {
  severity: "warning";
  code: TypedDiagnosticCode;
  message: string;
  line: number;
  block?: string;
  span?: SourceSpan;
};

export type TypedFlowSection = {
  procedures_analyzed: number;
  diagnostics: TypedDiagnostic[];
  unknowns: AnalysisUnknown[];
  join_iterations_applied: number;
};

export type TypedFlowBudgets = PseudocodeAnalysisBudgets & {
  max_cfg_join_iterations: number;
};

export const DEFAULT_TYPED_FLOW_BUDGETS: TypedFlowBudgets = {
  max_parse_nodes: 5000,
  max_procedures: 256,
  max_cfg_blocks_per_procedure: 512,
  max_call_graph_edges: 2048,
  max_fixed_point_iterations: 32,
  max_path_conditions: 64,
  max_report_diagnostics: 500,
  max_source_bytes: 512_000,
  max_cfg_join_iterations: 32,
};

export const TYPED_FLOW_PROOF_BOUNDARY_SUPPLEMENT =
  "Typed-flow checks apply only where Tier-2 annotations and structured expressions are present; not runtime execution or complete behavioral verification.";

type TypeEnv = Map<string, TypeFact>;

function diagnosticSort(a: TypedDiagnostic, b: TypedDiagnostic): number {
  return a.line - b.line || a.code.localeCompare(b.code) || a.message.localeCompare(b.message);
}

function unknownSort(a: AnalysisUnknown, b: AnalysisUnknown): number {
  return (a.line ?? 0) - (b.line ?? 0) || a.cause.localeCompare(b.cause);
}

function buildInitialEnv(proc: IrProcedure): TypeEnv {
  const env = new Map<string, TypeFact>();
  for (const entry of proc.contract.entries ?? []) {
    const binding = extractContractBinding(entry.value);
    const name = binding.name ?? entry.field.toLowerCase();
    if (binding.type_tag) {
      env.set(name, typeFactFromTag(binding.type_tag));
    } else if (entry.type_tag) {
      env.set(name, typeFactFromTag(entry.type_tag));
    } else {
      env.set(name, unknownFact("missing_annotation"));
    }
  }
  return env;
}

function literalType(value: Expr & { kind: "literal" }): TypeFact {
  if (value.value === null) {
    return typeFactFromTag({ kind: "nullable", inner: { kind: "scalar", tag: "int" } });
  }
  if (typeof value.value === "number") return typeFactFromTag({ kind: "scalar", tag: "int" });
  if (typeof value.value === "string") return typeFactFromTag({ kind: "scalar", tag: "string" });
  if (typeof value.value === "boolean") return typeFactFromTag({ kind: "scalar", tag: "bool" });
  return unknownFact("unsupported_literal");
}

type InferExprContext = {
  diagnostics?: TypedDiagnostic[];
  line?: number;
};

function inferExprType(
  expr: Expr,
  env: TypeEnv,
  recordFields?: Record<string, TypeTag>,
  ctx?: InferExprContext,
): TypeFact {
  switch (expr.kind) {
    case "literal":
      return literalType(expr);
    case "ref": {
      const fact = env.get(expr.name);
      return fact ?? unknownFact("unbound_ref");
    }
    case "field": {
      const base = inferExprType(expr.base, env, recordFields, ctx);
      if (base.status !== "known") return base;
      if (base.tag.kind === "record") {
        const fieldTag = base.tag.fields[expr.field];
        if (!fieldTag) {
          ctx?.diagnostics?.push({
            severity: "warning",
            code: "SHAPE_MISMATCH",
            message: `Field ${expr.field} missing on record shape`,
            line: ctx.line ?? 0,
          });
          return unknownFact("missing_field");
        }
        return typeFactFromTag(fieldTag);
      }
      if (base.tag.kind === "named" && recordFields?.[expr.field]) {
        return typeFactFromTag(recordFields[expr.field]!);
      }
      if (base.tag.kind === "named") {
        ctx?.diagnostics?.push({
          severity: "warning",
          code: "SHAPE_MISMATCH",
          message: `Field ${expr.field} missing on named shape ${base.tag.name}`,
          line: ctx.line ?? 0,
        });
      }
      return unknownFact("shape_unknown");
    }
    case "index": {
      const base = inferExprType(expr.base, env, recordFields, ctx);
      if (base.status !== "known") return base;
      if (base.tag.kind === "list") return typeFactFromTag(base.tag.element);
      return unknownFact("not_indexable");
    }
    case "binary": {
      const left = inferExprType(expr.left, env, recordFields, ctx);
      const right = inferExprType(expr.right, env, recordFields, ctx);
      if (left.status !== "known") return left.status === "bottom" ? left : unknownFact("opaque_lhs");
      if (right.status !== "known") return right.status === "bottom" ? right : unknownFact("opaque_rhs");
      if (expr.op === "+" || expr.op === "-" || expr.op === "*") {
        if (left.tag.kind === "scalar" && left.tag.tag === "int" && right.tag.kind === "scalar" && right.tag.tag === "int") {
          return typeFactFromTag({ kind: "scalar", tag: "int" });
        }
        return unknownFact("arithmetic_type");
      }
      return typeFactFromTag({ kind: "scalar", tag: "bool" });
    }
    case "unary":
      return typeFactFromTag({ kind: "scalar", tag: "bool" });
    case "is_not_null": {
      const operand = inferExprType(expr.operand, env, recordFields, ctx);
      if (operand.status === "known" && operand.tag.kind === "nullable") {
        return typeFactFromTag(operand.tag.inner);
      }
      if (operand.status === "known") return operand;
      return unknownFact("null_guard_opaque");
    }
    default:
      return unknownFact("unsupported_expr");
  }
}

function calleeInputTypes(program: IrProgram, callee: string): TypeTag[] {
  const proc = program.procedures.find((candidate) => candidate.name === callee);
  if (!proc) return [];
  const inputs: TypeTag[] = [];
  for (const entry of proc.contract.entries ?? []) {
    if (entry.field !== "INPUT") continue;
    const binding = extractContractBinding(entry.value);
    if (binding.type_tag) inputs.push(binding.type_tag);
  }
  return inputs;
}

function transferStatement(
  stmt: IrStatement,
  env: TypeEnv,
  program: IrProgram,
  proc: IrProcedure,
  diagnostics: TypedDiagnostic[],
  unknowns: AnalysisUnknown[],
): void {
  if (stmt.kind === "assignment") {
    transferAssignment(stmt, env, diagnostics, unknowns);
    return;
  }
  if (stmt.kind === "if") {
    transferIf(stmt, env, diagnostics, unknowns);
    return;
  }
  if (stmt.kind === "call") {
    transferCall(stmt, env, program, proc, diagnostics, unknowns);
    return;
  }
  if (stmt.kind === "run") {
    unknowns.push({
      cause: "TYPED_OPAQUE_EXPR",
      message: `RUN target opaque for typed-flow: ${stmt.target}`,
      procedure: proc.name,
      line: stmt.span.line,
      proof_boundary: TYPED_FLOW_PROOF_BOUNDARY_SUPPLEMENT,
    });
  }
}

function transferAssignment(
  stmt: IrAssignment,
  env: TypeEnv,
  diagnostics: TypedDiagnostic[],
  unknowns: AnalysisUnknown[],
): void {
  const parsed = parseExpression(stmt.value);
  if (!parsed.ok) {
    unknowns.push({
      cause: parsed.reason === "unsupported" ? "TYPED_UNSUPPORTED_SYNTAX" : "TYPED_OPAQUE_EXPR",
      message: `Opaque assignment RHS for ${stmt.target}`,
      procedure: undefined,
      line: stmt.span.line,
      proof_boundary: TYPED_FLOW_PROOF_BOUNDARY_SUPPLEMENT,
    });
    env.set(stmt.target, unknownFact("opaque_rhs"));
    return;
  }
  const rhsType = inferExprType(parsed.expr, env, undefined, {
    diagnostics,
    line: stmt.span.line,
  });
  const targetFact = env.get(stmt.target);
  if (targetFact?.status === "known" && rhsType.status === "known" && !typesCompatible(targetFact.tag, rhsType.tag)) {
    const nullableFlow =
      rhsType.tag.kind === "nullable" && typesCompatible(targetFact.tag, rhsType.tag.inner);
    diagnostics.push({
      severity: "warning",
      code: nullableFlow ? "NULL_FLOW" : "TYPE_MISMATCH",
      message: nullableFlow
        ? `Nullable value assigned to ${stmt.target} without null guard`
        : `Assignment to ${stmt.target} incompatible with inferred RHS type`,
      line: stmt.span.line,
      span: stmt.span,
    });
  }
  env.set(stmt.target, rhsType);
}

function transferIf(
  stmt: IrIf,
  env: TypeEnv,
  diagnostics: TypedDiagnostic[],
  unknowns: AnalysisUnknown[],
): void {
  const parsed = parseExpression(stmt.condition);
  if (!parsed.ok) {
    unknowns.push({
      cause: "TYPED_OPAQUE_EXPR",
      message: `Opaque IF condition: ${stmt.condition}`,
      line: stmt.span.line,
      proof_boundary: TYPED_FLOW_PROOF_BOUNDARY_SUPPLEMENT,
    });
    return;
  }
  if (parsed.expr.kind === "is_not_null") {
    const operand = parsed.expr.operand;
    if (operand.kind === "ref") {
      const fact = env.get(operand.name);
      if (fact?.status === "known" && fact.tag.kind === "nullable") {
        env.set(operand.name, typeFactFromTag(fact.tag.inner));
        return;
      }
      if (fact?.status === "known" && fact.tag.kind !== "nullable") {
        diagnostics.push({
          severity: "warning",
          code: "NULL_FLOW",
          message: `Non-null guard on ${operand.name} that is not nullable`,
          line: stmt.span.line,
          span: stmt.span,
        });
      }
    }
  }
}

function transferCall(
  stmt: IrCall,
  env: TypeEnv,
  program: IrProgram,
  proc: IrProcedure,
  diagnostics: TypedDiagnostic[],
  unknowns: AnalysisUnknown[],
): void {
  const expectedTypes = calleeInputTypes(program, stmt.callee);
  if (expectedTypes.length === 0) return;
  const argExprs = stmt.arg_exprs ?? parseCallArgExpressions(stmt.args);
  for (let index = 0; index < expectedTypes.length; index += 1) {
    const expected = expectedTypes[index]!;
    const expr = argExprs[index] ?? null;
    if (!expr) {
      unknowns.push({
        cause: "TYPED_UNSUPPORTED_SYNTAX",
        message: `CALL ${stmt.callee} arg ${index + 1} not in typed expression subset`,
        procedure: proc.name,
        line: stmt.span.line,
        proof_boundary: TYPED_FLOW_PROOF_BOUNDARY_SUPPLEMENT,
      });
      continue;
    }
    const actual = inferExprType(expr, env, undefined, {
      diagnostics,
      line: stmt.span.line,
    });
    if (actual.status === "known" && !typesCompatible(expected, actual.tag)) {
      diagnostics.push({
        severity: "warning",
        code: "CALL_TYPE_MISMATCH",
        message: `CALL ${stmt.callee} arg ${index + 1} type incompatible with callee INPUT`,
        line: stmt.span.line,
        block: proc.name,
        span: stmt.span,
      });
    }
  }
}

function cloneEnv(env: TypeEnv): TypeEnv {
  return new Map(env);
}

function joinEnvs(envs: TypeEnv[], diagnostics: TypedDiagnostic[], line: number, block: string): TypeEnv {
  if (envs.length === 0) return new Map();
  const keys = new Set<string>();
  for (const env of envs) {
    for (const key of env.keys()) keys.add(key);
  }
  const joined = new Map<string, TypeFact>();
  for (const key of keys) {
    let fact: TypeFact = unknownFact("missing_predecessor");
    let first = true;
    for (const env of envs) {
      const next = env.get(key) ?? unknownFact("missing_binding");
      if (first) {
        fact = next;
        first = false;
        continue;
      }
      const result = joinTypeFacts(fact, next);
      if (result.incompatible) {
        diagnostics.push({
          severity: "warning",
          code: "JOIN_INCOMPATIBLE",
          message: `Incompatible types for ${key} at join point`,
          line,
          block,
        });
      }
      fact = result.fact;
    }
    joined.set(key, fact);
  }
  return joined;
}

function hasLoopBackEdge(cfg: ProcedureCfg): boolean {
  return cfg.edges.some((edge) => edge.kind === "loop_back");
}

type BranchState =
  | { kind: "none" }
  | { kind: "then"; env: TypeEnv }
  | { kind: "else"; thenEnv: TypeEnv; elseEnv: TypeEnv };

function finalizeBranchState(
  branch: BranchState,
  env: TypeEnv,
  diagnostics: TypedDiagnostic[],
  line: number,
  procName: string,
): { env: TypeEnv; branch: BranchState } {
  if (branch.kind === "else") {
    return {
      env: joinEnvs([branch.thenEnv, branch.elseEnv], diagnostics, line, procName),
      branch: { kind: "none" },
    };
  }
  if (branch.kind === "then") {
    return {
      env: joinEnvs([branch.env, env], diagnostics, line, procName),
      branch: { kind: "none" },
    };
  }
  return { env, branch };
}

function analyzeProcedure(
  proc: IrProcedure,
  cfg: ProcedureCfg | undefined,
  program: IrProgram,
  budgets: TypedFlowBudgets,
  diagnostics: TypedDiagnostic[],
  unknowns: AnalysisUnknown[],
): number {
  let env = buildInitialEnv(proc);
  let branch: BranchState = { kind: "none" };
  let iterations = 0;

  const finalizeAt = (line: number) => {
    const finalized = finalizeBranchState(branch, env, diagnostics, line, proc.name);
    env = finalized.env;
    branch = finalized.branch;
  };

  for (let index = 0; index < proc.statements.length; index += 1) {
    const stmt = proc.statements[index]!;
    if (stmt.kind === "if" || stmt.kind === "while" || stmt.kind === "for") {
      finalizeAt(stmt.span.line);
    }

    if (stmt.kind === "if") {
      const thenEnv = cloneEnv(env);
      transferIf(stmt, thenEnv, diagnostics, unknowns);
      branch = { kind: "then", env: thenEnv };
      continue;
    }
    if (stmt.kind === "else") {
      if (branch.kind === "then") {
        branch = { kind: "else", thenEnv: branch.env, elseEnv: cloneEnv(env) };
      }
      continue;
    }

    let activeEnv: TypeEnv;
    if (branch.kind === "then") activeEnv = branch.env;
    else if (branch.kind === "else") activeEnv = branch.elseEnv;
    else activeEnv = env;
    transferStatement(stmt, activeEnv, program, proc, diagnostics, unknowns);
    if (branch.kind === "then") branch = { kind: "then", env: activeEnv };
    else if (branch.kind === "else") branch = { kind: "else", thenEnv: branch.thenEnv, elseEnv: activeEnv };
    else env = activeEnv;

    const next = proc.statements[index + 1];
    if (branch.kind === "else" && next && next.kind !== "else" && !["if", "while", "for"].includes(next.kind)) {
      // continue accumulating else branch
    } else if (branch.kind === "else" && (!next || next.kind === "if" || next.kind === "while" || next.kind === "for")) {
      finalizeAt(stmt.span.line);
    }
  }

  finalizeAt(proc.span.line);

  if (cfg && hasLoopBackEdge(cfg)) {
    let loopEnv = cloneEnv(env);
    let changed = true;
    while (changed && iterations < budgets.max_cfg_join_iterations) {
      changed = false;
      iterations += 1;
      for (const stmt of proc.statements) {
        if (stmt.kind !== "while" && stmt.kind !== "for") continue;
        const nextEnv = cloneEnv(loopEnv);
        for (const inner of proc.statements) {
          if (inner.span.line <= stmt.span.line) continue;
          if (inner.kind === "while" || inner.kind === "for" || inner.kind === "else") break;
          transferStatement(inner, nextEnv, program, proc, diagnostics, unknowns);
        }
        const joined = joinEnvs([loopEnv, nextEnv], diagnostics, stmt.span.line, proc.name);
        const before = JSON.stringify([...loopEnv.entries()].sort());
        const after = JSON.stringify([...joined.entries()].sort());
        if (before !== after) changed = true;
        loopEnv = joined;
      }
    }
    if (changed) {
      unknowns.push({
        cause: "budget_exceeded",
        message: `Typed-flow join iteration cap exceeded in ${proc.name}`,
        procedure: proc.name,
        line: proc.span.line,
        proof_boundary: TYPED_FLOW_PROOF_BOUNDARY_SUPPLEMENT,
      });
    }
  }

  return iterations;
}

/**
 * [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
 * How: Run CFG transfer/join until stable on loop back-edges or max_cfg_join_iterations (D14 semantic change).
 */
export function runTypedFlowAnalysis(
  program: IrProgram,
  cfg: CfgSection,
  budgets: TypedFlowBudgets = DEFAULT_TYPED_FLOW_BUDGETS,
): { section: TypedFlowSection } {
  const diagnostics: TypedDiagnostic[] = [];
  const unknowns: AnalysisUnknown[] = [];
  let joinIterations = 0;

  for (const proc of program.procedures) {
    const procCfg = cfg.procedures.find((candidate) => candidate.procedure === proc.name);
    joinIterations += analyzeProcedure(proc, procCfg, program, budgets, diagnostics, unknowns);
  }

  const section: TypedFlowSection = {
    procedures_analyzed: program.procedures.length,
    diagnostics: diagnostics.sort(diagnosticSort).slice(0, budgets.max_report_diagnostics),
    unknowns: unknowns.sort(unknownSort),
    join_iterations_applied: joinIterations,
  };

  return { section };
}
