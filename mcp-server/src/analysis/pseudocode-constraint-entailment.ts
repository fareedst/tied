/**
 * [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [ARCH-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
 * Summary: CHECK_REFINEMENT_ENTAILMENT — evaluate refinement predicates against typed-flow facts.
 */
import type {
  ConstraintAnalysisBudgets,
  EntailmentOutcome,
  EntailmentResult,
  PredicateNode,
  PredicateValue,
  RefinementPredicate,
} from "./pseudocode-constraint-ir.js";
import { parseRefinementPredicate } from "./pseudocode-constraint-predicate.js";
import type { TypeFact } from "./pseudocode-typed-ir.js";

export type RefinementFactEnv = {
  typeEnv: Map<string, TypeFact>;
  scalarBounds: Map<string, { min?: number; max?: number; exact?: number }>;
  lengthBounds: Map<string, { min?: number; max?: number }>;
  nonNull: Set<string>;
  fieldDefined: Set<string>;
};

export function emptyRefinementFactEnv(typeEnv: Map<string, TypeFact>): RefinementFactEnv {
  return {
    typeEnv,
    scalarBounds: new Map(),
    lengthBounds: new Map(),
    nonNull: new Set(),
    fieldDefined: new Set(),
  };
}

function numericFromValue(value: PredicateValue, env: RefinementFactEnv): number | null {
  if (value.kind === "number") return value.value;
  if (value.kind === "bool") return value.value ? 1 : 0;
  if (value.kind === "ref") {
    const bounds = env.scalarBounds.get(value.name);
    if (bounds?.exact !== undefined) return bounds.exact;
  }
  if (value.kind === "field") {
    const key = `${value.base}.${value.field}`;
    const bounds = env.scalarBounds.get(key);
    if (bounds?.exact !== undefined) return bounds.exact;
  }
  return null;
}

function compareNumbers(left: number, op: string, right: number): EntailmentOutcome {
  switch (op) {
    case ">":
      return left > right ? "proven_true" : "proven_false";
    case ">=":
      return left >= right ? "proven_true" : "proven_false";
    case "<":
      return left < right ? "proven_true" : "proven_false";
    case "<=":
      return left <= right ? "proven_true" : "proven_false";
    case "=":
      return left === right ? "proven_true" : "proven_false";
    case "!=":
      return left !== right ? "proven_true" : "proven_false";
    default:
      return "inconclusive";
  }
}

function compareBounds(
  value: number,
  op: string,
  bound: number,
  min?: number,
  max?: number,
  exact?: number,
): EntailmentOutcome {
  if (exact !== undefined) return compareNumbers(exact, op, bound);
  if (op === ">") {
    if (min !== undefined && min > bound) return "proven_true";
    if (max !== undefined && max <= bound) return "proven_false";
  }
  if (op === ">=") {
    if (min !== undefined && min >= bound) return "proven_true";
    if (max !== undefined && max < bound) return "proven_false";
  }
  if (op === "<") {
    if (max !== undefined && max < bound) return "proven_true";
    if (min !== undefined && min >= bound) return "proven_false";
  }
  if (op === "<=") {
    if (max !== undefined && max <= bound) return "proven_true";
    if (min !== undefined && min > bound) return "proven_false";
  }
  if (op === "=") {
    if (exact !== undefined) return compareNumbers(exact, op, bound);
    if (min !== undefined && max !== undefined && min === max) return compareNumbers(min, op, bound);
  }
  return "inconclusive";
}

function evalCompare(node: Extract<PredicateNode, { kind: "compare" }>, env: RefinementFactEnv): EntailmentOutcome {
  const { op, left, right } = node;

  if (left.kind === "length" || left.kind === "size") {
    const bound = numericFromValue(right, env);
    if (bound === null) return "inconclusive";
    const lengthBounds = env.lengthBounds.get(left.target);
    if (!lengthBounds) return "inconclusive";
    return compareBounds(0, op, bound, lengthBounds.min, lengthBounds.max);
  }

  if (right.kind === "length" || right.kind === "size") {
    const bound = numericFromValue(left, env);
    if (bound === null) return "inconclusive";
    const lengthBounds = env.lengthBounds.get(right.target);
    if (!lengthBounds) return "inconclusive";
    const flippedOp =
      op === ">" ? "<" : op === ">=" ? "<=" : op === "<" ? ">" : op === "<=" ? ">=" : op;
    return compareBounds(0, flippedOp, bound, lengthBounds.min, lengthBounds.max);
  }

  const leftNum = numericFromValue(left, env);
  const rightNum = numericFromValue(right, env);
  if (leftNum !== null && rightNum !== null) {
    return compareNumbers(leftNum, op, rightNum);
  }

  if (left.kind === "ref") {
    const bounds = env.scalarBounds.get(left.name);
    const rightNumOnly = numericFromValue(right, env);
    if (rightNumOnly !== null && bounds) {
      return compareBounds(0, op, rightNumOnly, bounds.min, bounds.max, bounds.exact);
    }
  }

  if (left.kind === "field") {
    const key = `${left.base}.${left.field}`;
    const bounds = env.scalarBounds.get(key);
    const rightNumOnly = numericFromValue(right, env);
    if (rightNumOnly !== null && bounds) {
      return compareBounds(0, op, rightNumOnly, bounds.min, bounds.max, bounds.exact);
    }
    if (right.kind === "bool" && bounds?.exact !== undefined) {
      return compareNumbers(bounds.exact, op, right.value ? 1 : 0);
    }
  }

  if (left.kind === "ref" && right.kind === "ref" && op === "=") {
    const leftBounds = env.scalarBounds.get(left.name);
    const rightBounds = env.scalarBounds.get(right.name);
    if (
      leftBounds?.exact !== undefined &&
      rightBounds?.exact !== undefined &&
      leftBounds.exact === rightBounds.exact
    ) {
      return "proven_true";
    }
  }

  if (left.kind === "ref" && right.kind === "ref" && (op === ">=" || op === "<=" || op === "=")) {
    const leftBounds = env.scalarBounds.get(left.name);
    const rightBounds = env.scalarBounds.get(right.name);
    if (leftBounds && rightBounds) {
      const sameBounds =
        leftBounds.exact === rightBounds.exact &&
        leftBounds.min === rightBounds.min &&
        leftBounds.max === rightBounds.max;
      if (sameBounds && (op === ">=" || op === "<=" || op === "=")) {
        return "proven_true";
      }
      if (op === ">=" && leftBounds.exact !== undefined && rightBounds.exact !== undefined) {
        return leftBounds.exact >= rightBounds.exact ? "proven_true" : "proven_false";
      }
    }
  }

  return "inconclusive";
}

function evalNode(node: PredicateNode, env: RefinementFactEnv): EntailmentOutcome {
  switch (node.kind) {
    case "compare":
      return evalCompare(node, env);
    case "is_not_null": {
      if (node.target.kind === "ref" && env.nonNull.has(node.target.name)) return "proven_true";
      const fact = node.target.kind === "ref" ? env.typeEnv.get(node.target.name) : undefined;
      if (fact?.status === "known" && fact.tag.kind !== "nullable") return "proven_true";
      if (fact?.status === "known" && fact.tag.kind === "nullable") return "inconclusive";
      return "inconclusive";
    }
    case "field_defined": {
      const key = `${node.base}.${node.field}`;
      if (env.fieldDefined.has(key)) return "proven_true";
      const baseFact = env.typeEnv.get(node.base);
      if (baseFact?.status === "known" && baseFact.tag.kind === "record" && node.field in baseFact.tag.fields) {
        return "proven_true";
      }
      return "inconclusive";
    }
    case "and": {
      let sawInconclusive = false;
      for (const child of node.children) {
        const outcome = evalNode(child, env);
        if (outcome === "proven_false") return "proven_false";
        if (outcome === "inconclusive") sawInconclusive = true;
      }
      return sawInconclusive ? "inconclusive" : "proven_true";
    }
    case "or": {
      let sawInconclusive = false;
      for (const child of node.children) {
        const outcome = evalNode(child, env);
        if (outcome === "proven_true") return "proven_true";
        if (outcome === "inconclusive") sawInconclusive = true;
      }
      return sawInconclusive ? "inconclusive" : "proven_false";
    }
    case "not": {
      const inner = evalNode(node.child, env);
      if (inner === "proven_true") return "proven_false";
      if (inner === "proven_false") return "proven_true";
      return "inconclusive";
    }
    case "forall":
      // Bounded quantifiers: prove only when range is empty or body is trivially true on bounds.
      if (node.start > node.end) return "proven_true";
      if (node.end - node.start > 32) return "inconclusive";
      for (let i = node.start; i <= node.end; i += 1) {
        const iterEnv: RefinementFactEnv = {
          ...env,
          scalarBounds: new Map(env.scalarBounds),
        };
        iterEnv.scalarBounds.set(node.var, { exact: i });
        const outcome = evalNode(node.body, iterEnv);
        if (outcome === "proven_false") return "proven_false";
        if (outcome === "inconclusive") return "inconclusive";
      }
      return "proven_true";
    default:
      return "inconclusive";
  }
}

/**
 * [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [ARCH-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
 * How: Evaluate refinement predicate against RefinementFactEnv; budget via max_predicate_nodes.
 */
export function checkRefinementEntailment(
  env: RefinementFactEnv,
  predicate: RefinementPredicate,
  budgets: ConstraintAnalysisBudgets,
): EntailmentResult {
  let ast = predicate.ast;
  let nodeCount = predicate.node_count ?? 0;

  if (!ast) {
    const parsed = parseRefinementPredicate(predicate.text);
    if (!parsed.ok) {
      return { outcome: "inconclusive", cause: parsed.cause };
    }
    ast = parsed.predicate.ast!;
    nodeCount = parsed.predicate.node_count ?? 0;
  }

  if (nodeCount > budgets.max_predicate_nodes) {
    return { outcome: "inconclusive", cause: "solver_truncation" };
  }

  const outcome = evalNode(ast, env);
  if (outcome === "inconclusive") {
    return { outcome, cause: "refinement_inconclusive" };
  }
  return { outcome };
}

export function applyAssumedRefinementToEnv(
  env: RefinementFactEnv,
  predicateText: string,
): EntailmentResult {
  const parsed = parseRefinementPredicate(predicateText);
  if (!parsed.ok) {
    return { outcome: "inconclusive", cause: parsed.cause };
  }
  const ast = parsed.predicate.ast!;
  assumePredicateFacts(env, ast);
  return { outcome: "proven_true" };
}

export function assumePredicateFacts(env: RefinementFactEnv, node: PredicateNode): void {
  switch (node.kind) {
    case "compare": {
      if (node.left.kind === "length" && node.right.kind === "number") {
        const existing = env.lengthBounds.get(node.left.target) ?? {};
        if (node.op === ">") env.lengthBounds.set(node.left.target, { ...existing, min: node.right.value + 1 });
        if (node.op === ">=") env.lengthBounds.set(node.left.target, { ...existing, min: node.right.value });
        if (node.op === "<") env.lengthBounds.set(node.left.target, { ...existing, max: node.right.value - 1 });
        if (node.op === "<=") env.lengthBounds.set(node.left.target, { ...existing, max: node.right.value });
      }
      if (node.left.kind === "ref" && node.right.kind === "number") {
        const existing = env.scalarBounds.get(node.left.name) ?? {};
        if (node.op === ">") env.scalarBounds.set(node.left.name, { ...existing, min: node.right.value + 1 });
        if (node.op === ">=") env.scalarBounds.set(node.left.name, { ...existing, min: node.right.value });
        if (node.op === "<") env.scalarBounds.set(node.left.name, { ...existing, max: node.right.value - 1 });
        if (node.op === "<=") env.scalarBounds.set(node.left.name, { ...existing, max: node.right.value });
        if (node.op === "=") env.scalarBounds.set(node.left.name, { exact: node.right.value });
      }
      if (node.left.kind === "field" && node.right.kind === "bool") {
        const key = `${node.left.base}.${node.left.field}`;
        if (node.op === "=") env.scalarBounds.set(key, { exact: node.right.value ? 1 : 0 });
        env.fieldDefined.add(key);
      }
      if (node.left.kind === "field" && node.right.kind === "number") {
        const key = `${node.left.base}.${node.left.field}`;
        if (node.op === "=") env.scalarBounds.set(key, { exact: node.right.value });
        env.fieldDefined.add(key);
      }
      break;
    }
    case "is_not_null":
      if (node.target.kind === "ref") env.nonNull.add(node.target.name);
      break;
    case "field_defined":
      env.fieldDefined.add(`${node.base}.${node.field}`);
      break;
    case "and":
      for (const child of node.children) assumePredicateFacts(env, child);
      break;
    default:
      break;
  }
}
