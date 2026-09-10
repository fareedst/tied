/**
 * [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [ARCH-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
 * Summary: Parse grammar v2 refinement predicate subset into PredicateNode AST.
 */
import type {
  ParseRefinementResult,
  PredicateNode,
  PredicateValue,
  RefinementPredicate,
} from "./pseudocode-constraint-ir.js";

type Token =
  | { kind: "number"; value: number }
  | { kind: "ident"; value: string }
  | { kind: "op"; value: string }
  | { kind: "lparen" }
  | { kind: "rparen" }
  | { kind: "lbracket" }
  | { kind: "rbracket" }
  | { kind: "dot" }
  | { kind: "colon" }
  | { kind: "true" }
  | { kind: "false" }
  | { kind: "is" }
  | { kind: "not" }
  | { kind: "null" }
  | { kind: "defined" }
  | { kind: "forall" }
  | { kind: "in" }
  | { kind: "eof" };

function tokenize(text: string): Token[] | null {
  const tokens: Token[] = [];
  let index = 0;
  while (index < text.length) {
    const ch = text[index];
    if (/\s/.test(ch)) {
      index += 1;
      continue;
    }
    const twoChar = text.slice(index, index + 2);
    if (twoChar === ".." || twoChar === "!=" || twoChar === "<=" || twoChar === ">=") {
      tokens.push({ kind: "op", value: twoChar });
      index += 2;
      continue;
    }
    if (ch === "=" || ch === "<" || ch === ">") {
      tokens.push({ kind: "op", value: ch });
      index += 1;
      continue;
    }
    if (ch === "(") {
      tokens.push({ kind: "lparen" });
      index += 1;
      continue;
    }
    if (ch === ")") {
      tokens.push({ kind: "rparen" });
      index += 1;
      continue;
    }
    if (ch === "[") {
      tokens.push({ kind: "lbracket" });
      index += 1;
      continue;
    }
    if (ch === "]") {
      tokens.push({ kind: "rbracket" });
      index += 1;
      continue;
    }
    if (ch === ".") {
      tokens.push({ kind: "dot" });
      index += 1;
      continue;
    }
    if (ch === ":") {
      tokens.push({ kind: "colon" });
      index += 1;
      continue;
    }
    if (/\d/.test(ch)) {
      let num = "";
      while (index < text.length && /[\d.]/.test(text[index]!)) {
        num += text[index];
        index += 1;
      }
      tokens.push({ kind: "number", value: Number(num) });
      continue;
    }
    const identMatch = text.slice(index).match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (identMatch) {
      const ident = identMatch[0];
      const lower = ident.toLowerCase();
      if (lower === "and") tokens.push({ kind: "op", value: "AND" });
      else if (lower === "or") tokens.push({ kind: "op", value: "OR" });
      else if (lower === "not") tokens.push({ kind: "not" });
      else if (lower === "is") tokens.push({ kind: "is" });
      else if (lower === "null") tokens.push({ kind: "null" });
      else if (lower === "defined") tokens.push({ kind: "defined" });
      else if (lower === "forall") tokens.push({ kind: "forall" });
      else if (lower === "in") tokens.push({ kind: "in" });
      else if (lower === "true") tokens.push({ kind: "true" });
      else if (lower === "false") tokens.push({ kind: "false" });
      else if (lower === "length" || lower === "size") tokens.push({ kind: "ident", value: lower });
      else tokens.push({ kind: "ident", value: ident });
      index += ident.length;
      continue;
    }
    return null;
  }
  tokens.push({ kind: "eof" });
  return tokens;
}

function countNodes(node: PredicateNode): number {
  switch (node.kind) {
    case "compare":
    case "is_not_null":
    case "field_defined":
      return 1;
    case "not":
      return 1 + countNodes(node.child);
    case "and":
    case "or":
      return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
    case "forall":
      return 1 + countNodes(node.body);
    default:
      return 1;
  }
}

class Parser {
  private index = 0;

  constructor(private readonly tokens: Token[]) {}

  private peek(): Token {
    return this.tokens[this.index] ?? { kind: "eof" };
  }

  private advance(): Token {
    const token = this.peek();
    this.index += 1;
    return token;
  }

  private expect(kind: Token["kind"], value?: string): Token | null {
    const token = this.peek();
    if (token.kind !== kind) return null;
    if (value !== undefined && "value" in token && token.value !== value) return null;
    return this.advance();
  }

  parse(): PredicateNode | null {
    const node = this.parseOr();
    if (!node) return null;
    if (this.peek().kind !== "eof") return null;
    return node;
  }

  private parseOr(): PredicateNode | null {
    let left = this.parseAnd();
    if (!left) return null;
    while (this.peek().kind === "op" && (this.peek() as { value: string }).value === "OR") {
      this.advance();
      const right = this.parseAnd();
      if (!right) return null;
      if (left.kind === "or") left.children.push(right);
      else left = { kind: "or", children: [left, right] };
    }
    return left;
  }

  private parseAnd(): PredicateNode | null {
    let left = this.parseNot();
    if (!left) return null;
    while (this.peek().kind === "op" && (this.peek() as { value: string }).value === "AND") {
      this.advance();
      const right = this.parseNot();
      if (!right) return null;
      if (left.kind === "and") left.children.push(right);
      else left = { kind: "and", children: [left, right] };
    }
    return left;
  }

  private parseNot(): PredicateNode | null {
    if (this.peek().kind === "not") {
      this.advance();
      const child = this.parseNot();
      return child ? { kind: "not", child } : null;
    }
    return this.parsePrimary();
  }

  private parsePrimary(): PredicateNode | null {
    if (this.peek().kind === "forall") {
      return this.parseForall();
    }
    if (this.peek().kind === "lparen") {
      this.advance();
      const inner = this.parseOr();
      if (!inner || !this.expect("rparen")) return null;
      return inner;
    }
    return this.parseComparisonOrNull();
  }

  private parseForall(): PredicateNode | null {
    if (!this.expect("forall")) return null;
    const varToken = this.expect("ident");
    if (!varToken || varToken.kind !== "ident") return null;
    if (!this.expect("in")) return null;
    const startToken = this.expect("number");
    if (!startToken || startToken.kind !== "number") return null;
    if (!this.expect("op", "..")) return null;
    const endToken = this.expect("number");
    if (!endToken || endToken.kind !== "number") return null;
    if (this.peek().kind === "ident" && (this.peek() as { value: string }).value === "in") {
      // skip optional trailing unit token like "items" in "0..n-1"
    }
    if (!this.expect("colon")) return null;
    const body = this.parseOr();
    if (!body) return null;
    return {
      kind: "forall",
      var: varToken.value,
      start: startToken.value,
      end: endToken.value,
      body,
    };
  }

  private parseComparisonOrNull(): PredicateNode | null {
    const leftValue = this.parseValue();
    if (!leftValue) return null;

    if (this.peek().kind === "is") {
      this.advance();
      if (this.peek().kind === "not") {
        this.advance();
        if (!this.expect("null")) return null;
        return { kind: "is_not_null", target: leftValue };
      }
      if (this.peek().kind === "defined") {
        this.advance();
        if (leftValue.kind !== "field") return null;
        return { kind: "field_defined", base: leftValue.base, field: leftValue.field };
      }
      return null;
    }

    if (this.peek().kind === "op") {
      const opToken = this.advance() as { kind: "op"; value: string };
      const op = opToken.value as PredicateNode extends { kind: "compare"; op: infer O } ? O : never;
      if (![">", ">=", "<", "<=", "=", "!="].includes(opToken.value)) return null;
      const rightValue = this.parseValue();
      if (!rightValue) return null;
      return { kind: "compare", op, left: leftValue, right: rightValue };
    }

    return null;
  }

  private parseValue(): PredicateValue | null {
    if (this.peek().kind === "number") {
      const token = this.advance() as { kind: "number"; value: number };
      return { kind: "number", value: token.value };
    }
    if (this.peek().kind === "true") {
      this.advance();
      return { kind: "bool", value: true };
    }
    if (this.peek().kind === "false") {
      this.advance();
      return { kind: "bool", value: false };
    }
    if (this.peek().kind === "ident") {
      const name = (this.advance() as { kind: "ident"; value: string }).value;
      if ((name === "length" || name === "size") && this.peek().kind === "lparen") {
        this.advance();
        const argToken = this.expect("ident");
        if (!argToken || argToken.kind !== "ident") return null;
        if (!this.expect("rparen")) return null;
        return name === "length"
          ? { kind: "length", target: argToken.value }
          : { kind: "size", target: argToken.value };
      }
      if (this.peek().kind === "dot") {
        this.advance();
        const fieldToken = this.expect("ident");
        if (!fieldToken || fieldToken.kind !== "ident") return null;
        return { kind: "field", base: name, field: fieldToken.value };
      }
      return { kind: "ref", name };
    }
    return null;
  }
}

/**
 * [IMPL-PSEUDOCODE_CONSTRAINT_SOLVER] [ARCH-PSEUDOCODE_CONSTRAINT_SOLVER] [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE]
 * How: Parse refinement predicate text into AST; unsupported syntax returns explicit cause (not silent).
 */
export function parseRefinementPredicate(text: string): ParseRefinementResult {
  const trimmed = text.trim();
  if (!trimmed || /^(true|false)$/i.test(trimmed)) {
    return { ok: false, cause: "empty", message: "Trivial or empty predicate" };
  }

  const tokens = tokenize(trimmed);
  if (!tokens) {
    return {
      ok: false,
      cause: "CONSTRAINT_UNSUPPORTED_SYNTAX",
      message: `Unsupported predicate tokenization: ${trimmed}`,
    };
  }

  const parser = new Parser(tokens);
  const ast = parser.parse();
  if (!ast) {
    const hasCustomCall = /\b[A-Za-z_][A-Za-z0-9_]*\s*\(/.test(trimmed) && !/\b(length|size)\s*\(/i.test(trimmed);
    return {
      ok: false,
      cause: hasCustomCall ? "predicate_unsupported" : "CONSTRAINT_UNSUPPORTED_SYNTAX",
      message: `Unsupported predicate syntax: ${trimmed}`,
    };
  }

  const predicate: RefinementPredicate = {
    text: trimmed,
    ast,
    node_count: countNodes(ast),
  };
  return { ok: true, predicate };
}

export { countNodes as countPredicateNodes };
