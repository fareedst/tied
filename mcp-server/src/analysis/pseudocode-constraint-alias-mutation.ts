/**
 * [IMPL-PSEUDOCODE_ALIAS_MUTATION_POLICY] [ARCH-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
 * Summary: Alias and immutability policy enforcement — MUTATION_VIOLATION, ALIAS_VIOLATION, unknown when policy absent.
 */
import { parseExpression, splitCallArgs } from "./pseudocode-expression-parser.js";
import type {
  AliasPolicy,
  ConstraintDiagnostic,
} from "./pseudocode-constraint-ir.js";
const ALIAS_MUTATION_PROOF_BOUNDARY =
  "Alias/mutation checks apply only where v2 (immutable)/(mutable) tags or ALIAS POLICY are declared; not runtime execution proof.";
import { extractV2ContractBinding } from "./pseudocode-grammar-v2.js";
import type {
  AnalysisUnknown,
  ContractFieldEntry,
  IrAssignment,
  IrCall,
  IrProcedure,
  IrProgram,
  IrRun,
} from "./pseudocode-ir.js";
import { GRAMMAR_VERSION_V2 } from "./pseudocode-ir.js";
import { extractContractBinding } from "./pseudocode-typed-ir.js";

export type AliasMutationSection = {
  diagnostics: ConstraintDiagnostic[];
  unknowns: AnalysisUnknown[];
  alias_mut_checked: number;
  alias_mut_violations: number;
};

type ParsedAliasRule =
  | { kind: "may_alias"; left: string; right: string }
  | { kind: "does_not_alias"; left: string; right: string };

class AliasEquivalence {
  private readonly parent = new Map<string, string>();

  find(name: string): string {
    if (!this.parent.has(name)) {
      this.parent.set(name, name);
    }
    let root = name;
    while (this.parent.get(root) !== root) {
      root = this.parent.get(root)!;
    }
    let current = name;
    while (current !== root) {
      const next = this.parent.get(current)!;
      this.parent.set(current, root);
      current = next;
    }
    return root;
  }

  union(a: string, b: string): void {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) {
      this.parent.set(ra, rb);
    }
  }

  mayAlias(a: string, b: string): boolean {
    return this.find(a) === this.find(b);
  }
}

function bindingNameFromEntry(entry: ContractFieldEntry, grammarVersion: string): string | undefined {
  const binding =
    grammarVersion === GRAMMAR_VERSION_V2
      ? extractV2ContractBinding(entry.value)
      : extractContractBinding(entry.value);
  if (binding.name) return binding.name;
  if (!binding.prose && entry.field) return entry.field.toLowerCase();
  return undefined;
}

function collectImmutableBindings(proc: IrProcedure, grammarVersion: string): Set<string> {
  const immutables = new Set<string>();
  for (const entry of proc.contract.entries ?? []) {
    if (entry.mutability !== "immutable") continue;
    const name = bindingNameFromEntry(entry, grammarVersion);
    if (name) immutables.add(name);
  }
  return immutables;
}

function parseAliasRule(rule: string): ParsedAliasRule | null {
  const mayMatch = rule.match(/^([A-Za-z_][A-Za-z0-9_]*)\s+may\s+alias\s+([A-Za-z_][A-Za-z0-9_]*)$/i);
  if (mayMatch) {
    return { kind: "may_alias", left: mayMatch[1], right: mayMatch[2] };
  }
  const notMatch = rule.match(/^([A-Za-z_][A-Za-z0-9_]*)\s+does\s+not\s+alias\s+([A-Za-z_][A-Za-z0-9_]*)$/i);
  if (notMatch) {
    return { kind: "does_not_alias", left: notMatch[1], right: notMatch[2] };
  }
  return null;
}

function resolveRuleNames(rule: ParsedAliasRule, bindings: Map<string, string>): { left: string; right: string } | null {
  const left = bindings.get(rule.left.toLowerCase()) ?? rule.left;
  const right = bindings.get(rule.right.toLowerCase()) ?? rule.right;
  if (!left || !right) return null;
  return { left, right };
}

function collectContractBindings(proc: IrProcedure, grammarVersion: string): Map<string, string> {
  const bindings = new Map<string, string>();
  for (const entry of proc.contract.entries ?? []) {
    const name = bindingNameFromEntry(entry, grammarVersion);
    if (!name) continue;
    bindings.set(entry.field.toLowerCase(), name);
    bindings.set(name.toLowerCase(), name);
  }
  return bindings;
}

function refsFromExpression(text: string): string[] {
  const parsed = parseExpression(text.trim());
  if (!parsed.ok) {
    const trimmed = text.trim();
    return /^[A-Za-z_][A-Za-z0-9_]*$/.test(trimmed) ? [trimmed] : [];
  }
  const refs: string[] = [];
  const walk = (expr: import("./pseudocode-expression-parser.js").Expr): void => {
    if (expr.kind === "ref") refs.push(expr.name);
    if (expr.kind === "field") walk(expr.base);
    if (expr.kind === "index") {
      walk(expr.base);
      walk(expr.index);
    }
    if (expr.kind === "binary") {
      walk(expr.left);
      walk(expr.right);
    }
    if (expr.kind === "unary") walk(expr.operand);
    if (expr.kind === "is_not_null") walk(expr.operand);
  };
  walk(parsed.expr);
  return refs;
}

function isAliasConstructor(value: string): { source: string } | null {
  const match = value.trim().match(/^alias\s*\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)$/i);
  if (!match) return null;
  return { source: match[1] };
}

function isMutatingRunTarget(target: string): boolean {
  return /^mutate\s*\(/i.test(target.trim());
}

function mutatedNamesFromRun(target: string, immutables: Set<string>): string[] {
  const trimmed = target.trim();
  const mutateMatch = trimmed.match(/^mutate\s*\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)$/i);
  if (mutateMatch && immutables.has(mutateMatch[1]!)) {
    return [mutateMatch[1]!];
  }
  const callMatch = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\((.+)\)$/);
  if (callMatch) {
    const mutated: string[] = [];
    for (const arg of splitCallArgs(callMatch[2]!)) {
      for (const ref of refsFromExpression(arg)) {
        if (immutables.has(ref)) mutated.push(ref);
      }
    }
    return mutated;
  }
  return [];
}

function mutatedNamesFromCall(stmt: IrCall, immutables: Set<string>): string[] {
  if (!/^mutate$/i.test(stmt.callee)) return [];
  const mutated: string[] = [];
  for (const arg of stmt.args) {
    for (const ref of refsFromExpression(arg)) {
      if (immutables.has(ref)) mutated.push(ref);
    }
  }
  return mutated;
}

function hasAliasingConcerns(proc: IrProcedure): boolean {
  for (const stmt of proc.statements) {
    if (stmt.kind === "assignment") {
      if (isAliasConstructor(stmt.value)) return true;
    }
    if (stmt.kind === "run" && isMutatingRunTarget(stmt.target)) return true;
    if (stmt.kind === "call" && /^mutate$/i.test(stmt.callee)) return true;
  }
  return false;
}

function checkDoesNotAliasRules(
  aliasPolicy: AliasPolicy | undefined,
  bindings: Map<string, string>,
  aliases: AliasEquivalence,
  proc: IrProcedure,
  diagnostics: ConstraintDiagnostic[],
): number {
  if (!aliasPolicy) return 0;
  let violations = 0;
  for (const entry of aliasPolicy.entries) {
    const rule = parseAliasRule(entry.rule);
    if (!rule || rule.kind !== "does_not_alias") continue;
    const resolved = resolveRuleNames(rule, bindings);
    if (!resolved) continue;
    if (aliases.mayAlias(resolved.left, resolved.right)) {
      diagnostics.push({
        severity: "warning",
        code: "ALIAS_VIOLATION",
        message: `Alias policy violated: ${entry.rule}`,
        line: entry.span?.line ?? proc.span.line,
        procedure: proc.name,
        span: entry.span,
      });
      violations += 1;
    }
  }
  return violations;
}

function processAssignmentAliases(
  stmt: IrAssignment,
  aliases: AliasEquivalence,
  aliasPolicy: AliasPolicy | undefined,
  bindings: Map<string, string>,
  proc: IrProcedure,
  diagnostics: ConstraintDiagnostic[],
): number {
  let violations = 0;
  const aliasCtor = isAliasConstructor(stmt.value);
  if (aliasCtor) {
    aliases.union(stmt.target, aliasCtor.source);
  } else {
    const refs = refsFromExpression(stmt.value);
    if (refs.length === 1 && stmt.value.trim() === refs[0]) {
      aliases.union(stmt.target, refs[0]!);
    }
  }
  violations += checkDoesNotAliasRules(aliasPolicy, bindings, aliases, proc, diagnostics);
  return violations;
}

function analyzeProcedureAliasMutation(
  proc: IrProcedure,
  grammarVersion: string,
  diagnostics: ConstraintDiagnostic[],
  unknowns: AnalysisUnknown[],
): { checked: number; violations: number } {
  let checked = 0;
  let violations = 0;

  const immutables = collectImmutableBindings(proc, grammarVersion);
  const aliasPolicy = proc.alias_policy;
  const bindings = collectContractBindings(proc, grammarVersion);
  const aliases = new AliasEquivalence();

  for (const name of bindings.values()) {
    aliases.find(name);
  }

  if (immutables.size > 0 || aliasPolicy) {
    checked += 1;
  }

  for (const stmt of proc.statements) {
    if (stmt.kind === "assignment") {
      if (immutables.has(stmt.target)) {
        diagnostics.push({
          severity: "warning",
          code: "MUTATION_VIOLATION",
          message: `Proven mutation of immutable binding: ${stmt.target}`,
          line: stmt.span.line,
          procedure: proc.name,
          span: stmt.span,
        });
        violations += 1;
        continue;
      }
      if (aliasPolicy) {
        violations += processAssignmentAliases(stmt, aliases, aliasPolicy, bindings, proc, diagnostics);
      }
    }

    if (stmt.kind === "run") {
      for (const name of mutatedNamesFromRun((stmt as IrRun).target, immutables)) {
        diagnostics.push({
          severity: "warning",
          code: "MUTATION_VIOLATION",
          message: `Proven mutation of immutable binding via RUN: ${name}`,
          line: stmt.span.line,
          procedure: proc.name,
          span: stmt.span,
        });
        violations += 1;
      }
    }

    if (stmt.kind === "call") {
      for (const name of mutatedNamesFromCall(stmt as IrCall, immutables)) {
        diagnostics.push({
          severity: "warning",
          code: "MUTATION_VIOLATION",
          message: `Proven mutation of immutable binding via CALL: ${name}`,
          line: stmt.span.line,
          procedure: proc.name,
          span: stmt.span,
        });
        violations += 1;
      }
    }
  }

  if (aliasPolicy) {
    violations += checkDoesNotAliasRules(aliasPolicy, bindings, aliases, proc, diagnostics);
  } else if (hasAliasingConcerns(proc)) {
    unknowns.push({
      cause: "alias_policy_absent",
      message: "Aliasing pattern present but no ALIAS POLICY declared",
      procedure: proc.name,
      line: proc.span.line,
      proof_boundary: ALIAS_MUTATION_PROOF_BOUNDARY,
    });
    checked += 1;
  }

  return { checked, violations };
}

/**
 * [IMPL-PSEUDOCODE_ALIAS_MUTATION_POLICY] [ARCH-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
 * How: Scan procedures for (immutable) violations and alias policy rules; unknown when policy absent (CL-2, CL-3).
 */
export function enforceAliasMutationPolicy(
  program: IrProgram,
): AliasMutationSection {
  const diagnostics: ConstraintDiagnostic[] = [];
  const unknowns: AnalysisUnknown[] = [];
  let aliasMutChecked = 0;
  let aliasMutViolations = 0;
  const grammarVersion = program.grammar_version ?? "pseudocode-grammar.v1";

  for (const proc of program.procedures) {
    const stats = analyzeProcedureAliasMutation(proc, grammarVersion, diagnostics, unknowns);
    aliasMutChecked += stats.checked;
    aliasMutViolations += stats.violations;
  }

  return {
    diagnostics: diagnostics.sort((a, b) => a.line - b.line || a.code.localeCompare(b.code)),
    unknowns: unknowns.sort((a, b) => (a.line ?? 0) - (b.line ?? 0) || a.cause.localeCompare(b.cause)),
    alias_mut_checked: aliasMutChecked,
    alias_mut_violations: aliasMutViolations,
  };
}
