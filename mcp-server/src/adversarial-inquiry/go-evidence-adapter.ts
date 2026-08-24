import type { EvidenceObservation, SourceLocation } from "./types.js";

export type GoEvidenceAdapterInput = {
  source: string;
  sourceRevision: string;
  blockRevision?: string;
  testCaseId?: string;
};

export type GoEvidenceDiagnostic = {
  code: "invalid_source" | "unsupported_adapter" | "ambiguous_assertion";
  message: string;
  source: SourceLocation;
};

export type GoEvidenceAdapterResult = {
  observations: EvidenceObservation[];
  diagnostics: GoEvidenceDiagnostic[];
  derivation: "IMPL" | "REQ_ARCH" | "unknown";
};

const SUPPORTED_TESTIFY = new Set([
  "assert.equal",
  "assert.noerror",
  "require.equal",
  "require.noerror",
]);

const UNSUPPORTED_CONSTRUCTS = [
  "cmp.equal",
  "cmp.diff",
  "assert.indelta",
  "assert.inepsilon",
  "assert.indelta",
  "gomega",
  "require.indelta",
];

function sourceLocation(
  testCaseId: string | undefined,
  line: number,
  column: number,
): SourceLocation {
  const base = testCaseId ?? "go_test.go";
  return {
    location: `${base}:${line}`,
    line,
    column,
  };
}

function observationId(line: number, construct: string): string {
  return `gotest-${line}-${construct}`;
}

function pushObservation(
  observations: EvidenceObservation[],
  input: GoEvidenceAdapterInput,
  line: number,
  column: number,
  construct: string,
  kind: EvidenceObservation["kind"],
  value: string,
): void {
  const id = observationId(line, construct);
  observations.push({
    id,
    direction: "test",
    statementId: id,
    kind,
    value,
    order: observations.length + 1,
    reliable: true,
    source: sourceLocation(input.testCaseId, line, column),
    provenance: "go-test",
    blockRevision: input.blockRevision ?? input.sourceRevision,
  });
}

function classifyTErrorf(value: string): EvidenceObservation["kind"] {
  const lower = value.toLowerCase();
  if (lower.includes("expected error") || lower.includes("want error") || lower.includes("expected err")) {
    return "failure";
  }
  return "behavior";
}

function parseTestifyCall(
  line: string,
  lineNumber: number,
  matchIndex: number,
  construct: string,
): { kind: EvidenceObservation["kind"]; value: string; column: number } | undefined {
  const callMatch = line.slice(matchIndex).match(/^(assert|require)\.([A-Za-z]+)\s*\(/u);
  if (!callMatch) return undefined;
  const normalized = `${callMatch[1]!.toLowerCase()}.${callMatch[2]!.toLowerCase()}`;
  if (!SUPPORTED_TESTIFY.has(normalized)) return undefined;
  const kind = normalized.includes("noerror") ? "precondition" : "behavior";
  return {
    kind,
    value: line.slice(matchIndex).trim(),
    column: matchIndex + 1,
  };
}

function unsupportedConstruct(line: string): string | undefined {
  const lower = line.toLowerCase();
  for (const construct of UNSUPPORTED_CONSTRUCTS) {
    if (lower.includes(construct)) return construct;
  }
  if (/\breflect\.deepequal\b/u.test(line) && !/\bt\.(errorf|fatalf|error|fatal)\b/u.test(line)) {
    return "reflect.DeepEqual";
  }
  return undefined;
}

// [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
// How: extract only the approved Go testing.T and testify subset and emit unresolved diagnostics for unsupported adapters.
export function parseGoTestEvidence(input: GoEvidenceAdapterInput): GoEvidenceAdapterResult {
  const diagnostics: GoEvidenceDiagnostic[] = [];
  const observations: EvidenceObservation[] = [];
  if (!input.sourceRevision.trim()) {
    diagnostics.push({
      code: "invalid_source",
      message: "sourceRevision is required.",
      source: { location: "<input>", line: 1, column: 1 },
    });
  }

  const lines = input.source.split(/\r?\n/u);
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const unsupported = unsupportedConstruct(line);
    if (unsupported) {
      diagnostics.push({
        code: "unsupported_adapter",
        message: `Unsupported Go test construct: ${unsupported}.`,
        source: sourceLocation(input.testCaseId, lineNumber, Math.max(line.indexOf(unsupported) + 1, 1)),
      });
      return;
    }

    const testifyMatch = line.match(/\b(assert|require)\.[A-Za-z]+\s*\(/u);
    if (testifyMatch && testifyMatch.index !== undefined) {
      const parsed = parseTestifyCall(line, lineNumber, testifyMatch.index, testifyMatch[0]);
      if (!parsed) {
        diagnostics.push({
          code: "unsupported_adapter",
          message: `Unsupported testify construct: ${testifyMatch[0]}.`,
          source: sourceLocation(input.testCaseId, lineNumber, testifyMatch.index + 1),
        });
        return;
      }
      pushObservation(
        observations,
        input,
        lineNumber,
        parsed.column,
        testifyMatch[0].split("(")[0] ?? "testify",
        parsed.kind,
        parsed.value,
      );
      return;
    }

    const tMatch = line.match(/\bt\.(Errorf|Fatalf|Error|Fatal)\s*\(/u);
    if (!tMatch || tMatch.index === undefined) return;
    const construct = `t.${tMatch[1]}`;
    const value = line.slice(tMatch.index).trim();
    const kind = tMatch[1]!.toLowerCase().includes("fatal")
      ? "failure"
      : classifyTErrorf(value);
    pushObservation(
      observations,
      input,
      lineNumber,
      tMatch.index + 1,
      construct,
      kind,
      value,
    );
  });

  return {
    observations,
    diagnostics,
    derivation: /\b(?:IMPL|REQ|ARCH)-[A-Z0-9_-]+\b/u.test(input.source)
      ? "IMPL"
      : "unknown",
  };
}

export function detectGoTestClassifier(testPath: string): boolean {
  return testPath.endsWith("_test.go") || /\/[^/]*_test\.go$/u.test(testPath);
}
