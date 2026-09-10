/**
 * [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
 * Summary: Closed expression subset parser for typed-flow assignments, guards, and CALL args.
 */

export type Expr =
  | { kind: "literal"; value: number | string | boolean | null }
  | { kind: "ref"; name: string }
  | { kind: "field"; base: Expr; field: string }
  | { kind: "index"; base: Expr; index: Expr }
  | {
      kind: "binary";
      op: "+" | "-" | "*" | "=" | "!=" | "<" | ">" | "<=" | ">=" | "AND" | "OR";
      left: Expr;
      right: Expr;
    }
  | { kind: "unary"; op: "not"; operand: Expr }
  | { kind: "is_not_null"; operand: Expr };

export type ParseExpressionResult =
  | { ok: true; expr: Expr }
  | { ok: false; reason: "empty" | "unsupported" | "budget" };

export type ExpressionParserBudget = {
  max_nodes: number;
};

export const DEFAULT_EXPRESSION_PARSER_BUDGET: ExpressionParserBudget = {
  max_nodes: 128,
};

type Token =
  | { kind: "number"; value: number }
  | { kind: "string"; value: string }
  | { kind: "ident"; value: string }
  | { kind: "op"; value: string }
  | { kind: "lparen" }
  | { kind: "rparen" }
  | { kind: "lbracket" }
  | { kind: "rbracket" }
  | { kind: "dot" }
  | { kind: "null" }
  | { kind: "true" }
  | { kind: "false" }
  | { kind: "is" }
  | { kind: "not" }
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
    if (ch === '"' || ch === "'") {
      const quote = ch;
      index += 1;
      let value = "";
      while (index < text.length && text[index] !== quote) {
        value += text[index];
        index += 1;
      }
      if (index >= text.length) return null;
      index += 1;
      tokens.push({ kind: "string", value });
      continue;
    }
    const twoChar = text.slice(index, index + 2);
    if (twoChar === "!=" || twoChar === "<=" || twoChar === ">=") {
      tokens.push({ kind: "op", value: twoChar });
      index += 2;
      continue;
    }
    if ("+-*/=<>".includes(ch)) {
      tokens.push({ kind: "op", value: ch });
      index += 1;
      continue;
    }
    const wordMatch = text.slice(index).match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (wordMatch) {
      const word = wordMatch[0];
      const lower = word.toLowerCase();
      if (lower === "null") tokens.push({ kind: "null" });
      else if (lower === "true") tokens.push({ kind: "true" });
      else if (lower === "false") tokens.push({ kind: "false" });
      else if (lower === "is") tokens.push({ kind: "is" });
      else if (lower === "not") tokens.push({ kind: "not" });
      else if (lower === "and") tokens.push({ kind: "op", value: "AND" });
      else if (lower === "or") tokens.push({ kind: "op", value: "OR" });
      else tokens.push({ kind: "ident", value: word });
      index += word.length;
      continue;
    }
    const numberMatch = text.slice(index).match(/^\d+(?:\.\d+)?/);
    if (numberMatch) {
      tokens.push({ kind: "number", value: Number(numberMatch[0]) });
      index += numberMatch[0].length;
      continue;
    }
    return null;
  }
  tokens.push({ kind: "eof" });
  return tokens;
}

class Parser {
  private readonly tokens: Token[];
  private index = 0;
  private nodes = 0;
  private readonly maxNodes: number;

  constructor(tokens: Token[], maxNodes: number) {
    this.tokens = tokens;
    this.maxNodes = maxNodes;
  }

  private current(): Token {
    return this.tokens[this.index] ?? { kind: "eof" };
  }

  private currentOp(): string | null {
    const token = this.current();
    return token.kind === "op" ? token.value : null;
  }

  private consume(): Token {
    const token = this.current();
    this.index += 1;
    return token;
  }

  private bumpNode(): boolean {
    this.nodes += 1;
    return this.nodes <= this.maxNodes;
  }

  parseExpression(): ParseExpressionResult {
    if (!this.bumpNode()) return { ok: false, reason: "budget" };
    const expr = this.parseOr();
    if (!expr) return { ok: false, reason: "unsupported" };
    if (this.current().kind !== "eof") return { ok: false, reason: "unsupported" };
    return { ok: true, expr };
  }

  private parseOr(): Expr | null {
    let left = this.parseAnd();
    if (!left) return null;
    while (this.currentOp() === "OR") {
      this.consume();
      if (!this.bumpNode()) return null;
      const right = this.parseAnd();
      if (!right) return null;
      left = { kind: "binary", op: "OR", left, right };
    }
    return left;
  }

  private parseAnd(): Expr | null {
    let left = this.parseComparison();
    if (!left) return null;
    while (this.currentOp() === "AND") {
      this.consume();
      if (!this.bumpNode()) return null;
      const right = this.parseComparison();
      if (!right) return null;
      left = { kind: "binary", op: "AND", left, right };
    }
    return left;
  }

  private parseComparison(): Expr | null {
    let left = this.parseIsNotNull();
    if (!left) return null;
    const opValue = this.currentOp();
    if (opValue && ["=", "!=", "<", ">", "<=", ">="].includes(opValue)) {
      const op = opValue as Extract<Expr, { kind: "binary" }>["op"];
      this.consume();
      if (!this.bumpNode()) return null;
      const right = this.parseAddSub();
      if (!right) return null;
      return { kind: "binary", op, left, right };
    }
    return left;
  }

  private parseIsNotNull(): Expr | null {
    const left = this.parseAddSub();
    if (!left) return null;
    if (this.current().kind === "is") {
      this.consume();
      if (this.current().kind !== "not") return null;
      this.consume();
      if (this.current().kind !== "null") return null;
      this.consume();
      if (!this.bumpNode()) return null;
      return { kind: "is_not_null", operand: left };
    }
    return left;
  }

  private parseAddSub(): Expr | null {
    let left = this.parseMulDiv();
    if (!left) return null;
    while (this.currentOp() === "+" || this.currentOp() === "-") {
      const op = this.currentOp() as "+" | "-";
      this.consume();
      if (!this.bumpNode()) return null;
      const right = this.parseMulDiv();
      if (!right) return null;
      left = { kind: "binary", op, left, right };
    }
    return left;
  }

  private parseMulDiv(): Expr | null {
    let left = this.parseUnary();
    if (!left) return null;
    while (this.currentOp() === "*") {
      this.consume();
      if (!this.bumpNode()) return null;
      const right = this.parseUnary();
      if (!right) return null;
      left = { kind: "binary", op: "*", left, right };
    }
    return left;
  }

  private parseUnary(): Expr | null {
    if (this.current().kind === "not") {
      this.consume();
      if (!this.bumpNode()) return null;
      const operand = this.parseUnary();
      if (!operand) return null;
      return { kind: "unary", op: "not", operand };
    }
    return this.parsePostfix();
  }

  private parsePostfix(): Expr | null {
    let expr = this.parsePrimary();
    if (!expr) return null;
    while (true) {
      if (this.current().kind === "dot") {
        this.consume();
        if (this.current().kind !== "ident") return null;
        const fieldToken = this.consume();
        if (fieldToken.kind !== "ident") return null;
        const field = fieldToken.value;
        if (!this.bumpNode()) return null;
        expr = { kind: "field", base: expr, field };
        continue;
      }
      if (this.current().kind === "lbracket") {
        this.consume();
        if (!this.bumpNode()) return null;
        const index = this.parseAddSub();
        if (!index || this.current().kind !== "rbracket") return null;
        this.consume();
        expr = { kind: "index", base: expr, index };
        continue;
      }
      break;
    }
    return expr;
  }

  private parsePrimary(): Expr | null {
    const token = this.current();
    if (token.kind === "number") {
      this.consume();
      return { kind: "literal", value: token.value };
    }
    if (token.kind === "string") {
      this.consume();
      return { kind: "literal", value: token.value };
    }
    if (token.kind === "true") {
      this.consume();
      return { kind: "literal", value: true };
    }
    if (token.kind === "false") {
      this.consume();
      return { kind: "literal", value: false };
    }
    if (token.kind === "null") {
      this.consume();
      return { kind: "literal", value: null };
    }
    if (token.kind === "ident") {
      this.consume();
      return { kind: "ref", name: token.value };
    }
    if (token.kind === "lparen") {
      this.consume();
      const expr = this.parseOr();
      if (!expr || this.current().kind !== "rparen") return null;
      this.consume();
      return expr;
    }
    return null;
  }
}

/**
 * [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
 * How: Parse closed expression subset; unsupported constructs return opaque marker without crashing parse pass.
 */
export function parseExpression(
  text: string,
  budget: ExpressionParserBudget = DEFAULT_EXPRESSION_PARSER_BUDGET,
): ParseExpressionResult {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, reason: "empty" };
  const tokens = tokenize(trimmed);
  if (!tokens) return { ok: false, reason: "unsupported" };
  return new Parser(tokens, budget.max_nodes).parseExpression();
}

/**
 * [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
 * How: Split CALL argument list on commas respecting nested parentheses.
 */
export function splitCallArgs(argList: string): string[] {
  const trimmed = argList.trim();
  if (!trimmed) return [];
  const args: string[] = [];
  let current = "";
  let depth = 0;
  for (const ch of trimmed) {
    if (ch === "(") {
      depth += 1;
      current += ch;
    } else if (ch === ")") {
      depth = Math.max(0, depth - 1);
      current += ch;
    } else if (ch === "," && depth === 0) {
      args.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) args.push(current.trim());
  return args;
}

/**
 * [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
 * How: Parse each CALL arg with expression parser when typed subset matches.
 */
export function parseCallArgExpressions(
  args: string[],
  budget: ExpressionParserBudget = DEFAULT_EXPRESSION_PARSER_BUDGET,
): Array<Expr | null> {
  return args.map((arg) => {
    const parsed = parseExpression(arg, budget);
    return parsed.ok ? parsed.expr : null;
  });
}
