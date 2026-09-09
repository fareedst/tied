/**
 * [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
 * Summary: Symbol table and contract analysis for parsed pseudo-code IR.
 */
import type { AnalysisDiagnostic, IrProgram } from "./pseudocode-ir.js";

const REQUIRED_CONTRACT_FIELDS = ["INPUT", "OUTPUT", "PRE", "POST", "EFFECTS"];
const BUILTIN_CALLS = new Set([
  "NORMALIZE",
  "NORMALIZE_COMMAND_RESULTS",
  "NORMALIZE_QUALITY_ROWS",
  "SORT",
]);

export type SymbolEntry = {
  name: string;
  kind: "procedure" | "local" | "builtin";
  declared_line: number;
  procedure?: string;
};

export type SymbolsSection = {
  procedures: string[];
  symbols: SymbolEntry[];
  defined_calls: string[];
  unresolved_calls: string[];
};

function diagnosticSort(a: AnalysisDiagnostic, b: AnalysisDiagnostic): number {
  return a.line - b.line || a.code.localeCompare(b.code) || a.message.localeCompare(b.message);
}

/**
 * [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
 * How: Build symbol table, validate contracts, and resolve CALL targets against definitions.
 */
export function analyzeSymbols(
  program: IrProgram,
  token: string,
  knownTokens?: string[],
): { section: SymbolsSection; diagnostics: AnalysisDiagnostic[] } {
  const diagnostics: AnalysisDiagnostic[] = [];
  const symbols: SymbolEntry[] = [];
  const defined = new Set<string>();
  const definedCalls: string[] = [];
  const unresolvedCalls: string[] = [];

  for (const proc of program.procedures) {
    if (defined.has(proc.name)) {
      diagnostics.push({
        severity: "error",
        code: "DUPLICATE_SYMBOL",
        message: `Duplicate procedure definition ${proc.name}`,
        line: proc.span.line,
        block: proc.name,
        span: proc.span,
      });
    }
    defined.add(proc.name);
    symbols.push({ name: proc.name, kind: "procedure", declared_line: proc.span.line });

    if (!proc.token_refs.includes(token)) {
      diagnostics.push({
        severity: "warning",
        code: "MISSING_CONTRACT_FIELD",
        message: `Block ${proc.name} does not reference target token ${token}`,
        line: proc.span.line,
        block: proc.name,
      });
    }

    const missing = REQUIRED_CONTRACT_FIELDS.filter((f) => !proc.contract.fields.includes(f));
    if (missing.length > 0) {
      diagnostics.push({
        severity: "error",
        code: "MISSING_CONTRACT_FIELD",
        message: `Block ${proc.name} missing contract fields: ${missing.join(", ")}`,
        line: proc.span.line,
        block: proc.name,
      });
    }

    const written = new Set<string>();
    for (const stmt of proc.statements) {
      if (stmt.kind === "assignment") {
        if (written.has(stmt.target) === false && symbols.some((s) => s.name === stmt.target && s.procedure === proc.name)) {
          // local redeclare ok
        }
        if (
          !written.has(stmt.target) &&
          stmt.target !== proc.name &&
          !defined.has(stmt.target) &&
          !BUILTIN_CALLS.has(stmt.target)
        ) {
          const priorUse = proc.statements.some(
            (s) =>
              s !== stmt &&
              s.kind === "assignment" &&
              s.value.includes(stmt.target),
          );
          if (priorUse) {
            diagnostics.push({
              severity: "warning",
              code: "READ_BEFORE_WRITE",
              message: `Possible read-before-write for ${stmt.target} in ${proc.name}`,
              line: stmt.span.line,
              block: proc.name,
              span: stmt.span,
            });
          }
        }
        written.add(stmt.target);
        if (!symbols.some((s) => s.name === stmt.target && s.procedure === proc.name)) {
          symbols.push({
            name: stmt.target,
            kind: "local",
            declared_line: stmt.span.line,
            procedure: proc.name,
          });
        }
      }
      if (stmt.kind === "call") {
        if (defined.has(stmt.callee) || BUILTIN_CALLS.has(stmt.callee)) {
          if (!definedCalls.includes(stmt.callee)) definedCalls.push(stmt.callee);
        } else {
          unresolvedCalls.push(`${proc.name}->${stmt.callee}`);
          diagnostics.push({
            severity: "error",
            code: "UNRESOLVED_CALL",
            message: `CALL references undefined procedure ${stmt.callee}`,
            line: stmt.span.line,
            block: proc.name,
            span: stmt.span,
          });
        }
      }
    }
  }

  if (knownTokens && knownTokens.length > 0) {
    const known = new Set(knownTokens);
    for (const ref of program.token_refs) {
      if (!known.has(ref)) {
        diagnostics.push({
          severity: "error",
          code: "UNKNOWN_TOKEN",
          message: `Unknown token reference ${ref}`,
          line: 1,
        });
      }
    }
  }

  definedCalls.sort((a, b) => a.localeCompare(b));
  unresolvedCalls.sort((a, b) => a.localeCompare(b));

  return {
    section: {
      procedures: program.procedures.map((p) => p.name).sort((a, b) => a.localeCompare(b)),
      symbols: symbols.sort((a, b) => a.name.localeCompare(b.name) || a.declared_line - b.declared_line),
      defined_calls: definedCalls,
      unresolved_calls: unresolvedCalls,
    },
    diagnostics: diagnostics.sort(diagnosticSort),
  };
}
