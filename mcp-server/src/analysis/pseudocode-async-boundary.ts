/**
 * [IMPL-ASYNC_BOUNDARY_ANALYZER] [ARCH-ASYNC_ANALYSIS_PASS] [REQ-ASYNC_BOUNDARY_ANALYSIS]
 * Summary: Layer C async_boundary static analysis — structural contract consistency only.
 */
import { scanProcedureBlocks } from "./pseudocode-shared.js";
import type { CfgSection } from "./pseudocode-cfg.js";
import type {
  AnalysisDiagnostic,
  AnalysisUnknown,
  IrProgram,
  IrProcedure,
  PseudocodeAnalysisBudgets,
  SourceSpan,
} from "./pseudocode-ir.js";

export type AsyncBoundaryDiagnosticCode =
  | "ASYNC_EFFECTS_WITHOUT_BOUNDARY"
  | "AWAIT_NON_PROMISE_OUTPUT"
  | "MISSING_TIMEOUT_FAILURE_MODE"
  | "SEQUENCING_UNDEFINED_SHARED_DATA"
  | "CALL_ACROSS_ASYNC_BOUNDARY"
  | "RETRY_WITHOUT_IDEMPOTENCY"
  | "OPEN_WAIT_WITHOUT_TERMINATION";

export type AsyncBoundaryDiagnosticSeverity = "warning" | "error";

export type AsyncBoundaryDiagnostic = {
  severity: AsyncBoundaryDiagnosticSeverity;
  code: AsyncBoundaryDiagnosticCode;
  message: string;
  line: number;
  procedure?: string;
  block?: string;
  span?: SourceSpan;
};

export const GATING_ASYNC_DIAGNOSTIC_CODES: readonly AsyncBoundaryDiagnosticCode[] = [
  "ASYNC_EFFECTS_WITHOUT_BOUNDARY",
];

export type AsyncBoundarySection = {
  procedures_analyzed: number;
  diagnostics: AsyncBoundaryDiagnostic[];
  unknowns: AnalysisUnknown[];
};

export type AsyncBoundaryAnalysisOptions = {
  source: string;
  typed_flow?: boolean;
  gate_mode?: boolean;
  async_gate_errors?: boolean;
  budgets?: PseudocodeAnalysisBudgets;
};

export const ASYNC_BOUNDARY_PROOF_BOUNDARY_SUPPLEMENT =
  "Layer C async pass validates declared structure and type consistency only. It does not prove freedom from deadlock, livelock, or data races.";

export const ASYNC_GATE_ERRORS_PROOF_BOUNDARY_SUPPLEMENT =
  "Async gate errors apply only to ASYNC_EFFECTS_WITHOUT_BOUNDARY when async_gate_errors is effective under gate_mode and async_boundary.";

const TIMEOUT_FAILURE_ARROW_RE = /TIMEOUT:\s*[^\n]*→\s*([A-Z][A-Z0-9_]*)/i;

function diagnosticSort(a: AsyncBoundaryDiagnostic, b: AsyncBoundaryDiagnostic): number {
  return a.line - b.line || a.code.localeCompare(b.code) || a.message.localeCompare(b.message);
}

function unknownSort(a: AnalysisUnknown, b: AnalysisUnknown): number {
  return (a.line ?? 0) - (b.line ?? 0) || a.cause.localeCompare(b.cause);
}

function linesOf(source: string): string[] {
  return source.split(/\r?\n/);
}

function blockBody(lines: readonly string[], start: number, end: number): string {
  return lines.slice(start, end).join("\n");
}

function contractValue(proc: IrProcedure, field: string): string | undefined {
  return proc.contract.values?.[field] ?? proc.contract.entries?.find((e) => e.field === field)?.value;
}

function hasAsyncEffects(body: string, proc: IrProcedure): boolean {
  return /\bEFFECTS:\s*[^\n]*\bAsync\b/i.test(body)
    || /\bEFFECTS:\s*Async\b/i.test(contractValue(proc, "EFFECTS") ?? "");
}

function hasBoundaryRationale(body: string, proc: IrProcedure): boolean {
  const output = contractValue(proc, "OUTPUT") ?? "";
  return (
    /\bAWAIT\b/.test(body)
    || /\bSEND\b/.test(body)
    || /OUTPUT:[^\n]*Promise/i.test(body)
    || /Promise/i.test(output)
    || /ASYNC_BOUNDARY:/i.test(body)
  );
}

function hasAwait(body: string): boolean {
  return /\bAWAIT\b/.test(body);
}

function hasPromiseOutput(body: string, proc: IrProcedure): boolean {
  const output = contractValue(proc, "OUTPUT") ?? "";
  return /OUTPUT:[^\n]*Promise/i.test(body) || /Promise/i.test(output);
}

function hasSequencingOrOrdering(body: string): boolean {
  return /SEQUENCING:/i.test(body) || /CONTROL:\s*ordering/i.test(body);
}

function hasSharedData(proc: IrProcedure, body: string): boolean {
  return proc.contract.fields.includes("DATA") || /DATA:/i.test(body);
}

function countAwaits(body: string): number {
  return (body.match(/\bAWAIT\b/g) ?? []).length;
}

function hasOpenWait(body: string): boolean {
  return (
    (/\bWHILE\b|open wait|subscription|FOR each.*line/i.test(body)
      && !/TERMINATION:\s*(total|may_diverge)/i.test(body))
  );
}

function timeoutFailureModeMissing(body: string, proc: IrProcedure): boolean {
  if (!/TIMEOUT:/i.test(body)) return false;
  const arrowMatch = body.match(TIMEOUT_FAILURE_ARROW_RE);
  if (arrowMatch) {
    const failureName = arrowMatch[1];
    const failureModes = contractValue(proc, "FAILURE_MODES") ?? "";
    if (/FAILURE_MODES:/i.test(body)) {
      const bodyFailure = body.match(/FAILURE_MODES:\s*([^\n]+)/i)?.[1] ?? "";
      return !bodyFailure.includes(failureName) && !failureModes.includes(failureName);
    }
    return !failureModes.includes(failureName);
  }
  return true;
}

function calleeHasAsyncEffects(program: IrProgram, callee: string): boolean {
  const proc = program.procedures.find((candidate) => candidate.name === callee);
  if (!proc) return false;
  const effects = contractValue(proc, "EFFECTS") ?? "";
  return /\bAsync\b/i.test(effects);
}

function callerCallsAsyncWithoutAwait(proc: IrProcedure, program: IrProgram): AsyncBoundaryDiagnostic | null {
  for (const stmt of proc.statements) {
    if (stmt.kind !== "call") continue;
    if (!calleeHasAsyncEffects(program, stmt.callee)) continue;
    const bodyHasAwait = proc.statements.some(
      (candidate) =>
        candidate.kind === "assignment"
        && candidate.target === "AWAIT"
        && candidate.value.includes(stmt.callee),
    ) || proc.statements.some((candidate) => candidate.kind === "assignment" && candidate.target === "AWAIT");
    if (!bodyHasAwait) {
      return {
        severity: "warning",
        code: "CALL_ACROSS_ASYNC_BOUNDARY",
        message: `${proc.name}: CALL ${stmt.callee} with Async EFFECTS without AWAIT in caller`,
        line: stmt.span.line,
        procedure: proc.name,
        block: proc.name,
        span: stmt.span,
      };
    }
  }
  return null;
}

function analyzeProcedure(
  proc: IrProcedure,
  body: string,
  program: IrProgram,
  options: AsyncBoundaryAnalysisOptions,
  diagnostics: AsyncBoundaryDiagnostic[],
  unknowns: AnalysisUnknown[],
): void {
  const line = proc.contract.span?.line ?? proc.span.line;

  if (hasAsyncEffects(body, proc) && !hasBoundaryRationale(body, proc)) {
    diagnostics.push({
      severity: "warning",
      code: "ASYNC_EFFECTS_WITHOUT_BOUNDARY",
      message: `${proc.name}: Async in EFFECTS without AWAIT/SEND/Promise OUTPUT or explicit boundary rationale`,
      line,
      procedure: proc.name,
      block: proc.name,
      span: proc.contract.span ?? proc.span,
    });
  }

  if (!options.typed_flow && hasAwait(body) && !hasPromiseOutput(body, proc)) {
    diagnostics.push({
      severity: "warning",
      code: "AWAIT_NON_PROMISE_OUTPUT",
      message: `${proc.name}: AWAIT present but OUTPUT is not Promise-typed`,
      line,
      procedure: proc.name,
      block: proc.name,
      span: proc.span,
    });
  }

  if (timeoutFailureModeMissing(body, proc)) {
    if (/TIMEOUT:/i.test(body)) {
      diagnostics.push({
        severity: "warning",
        code: "MISSING_TIMEOUT_FAILURE_MODE",
        message: `${proc.name}: TIMEOUT row references undefined or missing FAILURE_MODE`,
        line: body.match(/TIMEOUT:/i)?.index !== undefined
          ? line + (body.slice(0, body.search(/TIMEOUT:/i)).match(/\n/g) ?? []).length
          : line,
        procedure: proc.name,
        block: proc.name,
      });
    }
  }

  if (hasSharedData(proc, body) && countAwaits(body) >= 2 && !hasSequencingOrOrdering(body)) {
    diagnostics.push({
      severity: "warning",
      code: "SEQUENCING_UNDEFINED_SHARED_DATA",
      message: `${proc.name}: multiple AWAITs touch DATA without SEQUENCING or CONTROL: ordering`,
      line,
      procedure: proc.name,
      block: proc.name,
    });
  }

  const callDiagnostic = callerCallsAsyncWithoutAwait(proc, program);
  if (callDiagnostic) {
    diagnostics.push(callDiagnostic);
  }

  if (/RETRY:/i.test(body) && !/IDEMPOTENCY:/i.test(body)) {
    diagnostics.push({
      severity: "warning",
      code: "RETRY_WITHOUT_IDEMPOTENCY",
      message: `${proc.name}: RETRY declared without IDEMPOTENCY or deduplication outcome`,
      line,
      procedure: proc.name,
      block: proc.name,
    });
  }

  if (hasOpenWait(body)) {
    diagnostics.push({
      severity: "warning",
      code: "OPEN_WAIT_WITHOUT_TERMINATION",
      message: `${proc.name}: open wait without close/unsubscribe or TERMINATION: may_diverge rationale`,
      line,
      procedure: proc.name,
      block: proc.name,
    });
  }

  if (program.truncated_parse) {
    unknowns.push({
      cause: "truncated_parse",
      message: `${proc.name}: truncated parse may hide async boundary obligations`,
      procedure: proc.name,
      line: proc.span.line,
      proof_boundary: ASYNC_BOUNDARY_PROOF_BOUNDARY_SUPPLEMENT,
    });
  }

  for (const stmt of proc.statements) {
    if (stmt.kind !== "call") continue;
    if (!program.procedures.some((candidate) => candidate.name === stmt.callee)) {
      unknowns.push({
        cause: "unresolved_async_callee",
        message: `${proc.name}: CALL ${stmt.callee} unresolved for async boundary check`,
        procedure: proc.name,
        line: stmt.span.line,
        proof_boundary: ASYNC_BOUNDARY_PROOF_BOUNDARY_SUPPLEMENT,
      });
    }
  }
}

/**
 * [IMPL-ASYNC_BOUNDARY_ANALYZER] [ARCH-ASYNC_ANALYSIS_PASS] [REQ-ASYNC_BOUNDARY_ANALYSIS]
 * How: Scan procedures for structural async contract mismatches; no concurrency proof claims.
 */
export function runAsyncBoundaryAnalysis(
  program: IrProgram,
  _cfg: CfgSection,
  options: AsyncBoundaryAnalysisOptions,
): { section: AsyncBoundarySection } {
  const diagnostics: AsyncBoundaryDiagnostic[] = [];
  const unknowns: AnalysisUnknown[] = [];
  const lines = linesOf(options.source);
  const ranges = scanProcedureBlocks(lines);

  for (const proc of program.procedures) {
    const range = ranges.find((candidate) => candidate.name === proc.name);
    const body = range ? blockBody(lines, range.start, range.end) : "";
    analyzeProcedure(proc, body, program, options, diagnostics, unknowns);
  }

  const maxDiagnostics = options.budgets?.max_report_diagnostics ?? 500;
  const section: AsyncBoundarySection = {
    procedures_analyzed: program.procedures.length,
    diagnostics: diagnostics.sort(diagnosticSort).slice(0, maxDiagnostics),
    unknowns: unknowns.sort(unknownSort),
  };

  return { section };
}

/**
 * [IMPL-ASYNC_BOUNDARY_ANALYZER] [ARCH-ASYNC_ANALYSIS_PASS] [REQ-ASYNC_BOUNDARY_ANALYSIS]
 * How: Promote ASYNC_EFFECTS_WITHOUT_BOUNDARY to error when async_gate_errors is effective (D7).
 */
export function applyAsyncGateSeverityPromotion(
  section: AsyncBoundarySection,
): AsyncBoundarySection {
  const diagnostics = section.diagnostics.map((diagnostic) => {
    if (!GATING_ASYNC_DIAGNOSTIC_CODES.includes(diagnostic.code)) {
      return diagnostic;
    }
    return { ...diagnostic, severity: "error" as const };
  });
  return {
    ...section,
    diagnostics: diagnostics.sort(diagnosticSort),
  };
}

/**
 * [IMPL-ASYNC_BOUNDARY_ANALYZER] [ARCH-ASYNC_ANALYSIS_PASS] [REQ-ASYNC_BOUNDARY_ANALYSIS]
 * How: Map error-severity async diagnostics into top-level gate diagnostics for gate_mode ok aggregation.
 */
export function asyncGateDiagnosticsToAnalysis(section: AsyncBoundarySection): AnalysisDiagnostic[] {
  return section.diagnostics
    .filter(
      (diagnostic) =>
        diagnostic.severity === "error"
        && GATING_ASYNC_DIAGNOSTIC_CODES.includes(diagnostic.code),
    )
    .map((diagnostic) => ({
      severity: "error" as const,
      code: diagnostic.code as AnalysisDiagnostic["code"],
      message: diagnostic.message,
      line: diagnostic.line,
      block: diagnostic.procedure ?? diagnostic.block,
      span: diagnostic.span,
    }));
}

export function isAsyncGateErrorsEffective(input: {
  gate_mode?: boolean;
  async_boundary?: boolean;
  async_gate_errors?: boolean;
}): boolean {
  if (input.gate_mode !== true || input.async_boundary !== true) return false;
  if (input.async_gate_errors !== true) return false;
  return true;
}
