import type { EvidenceObservation, SourceLocation } from "./types.js";

export type MinitestAdapterInput = {
  source: string;
  sourceRevision: string;
  blockRevision?: string;
  testCaseId?: string;
};

export type MinitestDiagnostic = {
  code: "invalid_source" | "unsupported_adapter" | "ambiguous_assertion";
  message: string;
  source: SourceLocation;
};

export type MinitestAdapterResult = {
  observations: EvidenceObservation[];
  diagnostics: MinitestDiagnostic[];
  derivation: "IMPL" | "REQ_ARCH" | "unknown";
};

type AssertionMatch = {
  kind: EvidenceObservation["kind"];
  value: string;
  column: number;
};

function parseAssertion(line: string, start: number): AssertionMatch | undefined {
  const source = line.slice(start);
  const assertEqual = source.match(/^assert_equal\s+(.+?)(?:,\s*)(.+?)(?:\s*,\s*".*)?$/u);
  if (assertEqual) {
    return {
      kind: "behavior",
      value: `assert_equal ${assertEqual[1]!.trim()}, ${assertEqual[2]!.trim()}`,
      column: start + 1,
    };
  }
  const assertRaises = source.match(/^assert_raises\s*\(\s*([^)]+)\)/u);
  if (assertRaises) {
    return {
      kind: "failure",
      value: `assert_raises(${assertRaises[1]!.trim()})`,
      column: start + 1,
    };
  }
  const assertEmpty = source.match(/^assert_empty\s+(.+?)(?:\s*,\s*".*)?$/u);
  if (assertEmpty) {
    return {
      kind: "behavior",
      value: `assert_empty ${assertEmpty[1]!.trim()}`,
      column: start + 1,
    };
  }
  const assert = source.match(/^assert\s+(.+?)(?:\s*,\s*".*)?$/u);
  if (assert) {
    return {
      kind: "behavior",
      value: `assert ${assert[1]!.trim()}`,
      column: start + 1,
    };
  }
  const refute = source.match(/^refute\s+(.+?)(?:\s*,\s*".*)?$/u);
  if (refute) {
    return {
      kind: "behavior",
      value: `refute ${refute[1]!.trim()}`,
      column: start + 1,
    };
  }
  return undefined;
}

function unsupportedAssertion(line: string): string | undefined {
  const match = line.match(/\b(assert_[a-z]\w*|expect|must_[a-z]\w*)\b/iu);
  if (!match) return undefined;
  if (["assert_equal", "assert_empty", "assert_raises"].includes(match[1]!.toLowerCase())) {
    return undefined;
  }
  if (match[1]!.toLowerCase() === "assert") return undefined;
  return match[1];
}

// [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
// How: extract only the approved Minitest assertions and emit unresolved diagnostics for unsupported adapters.
export function parseMinitestAssertions(input: MinitestAdapterInput): MinitestAdapterResult {
  const diagnostics: MinitestDiagnostic[] = [];
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
    const sourceLocation = (column: number): SourceLocation => ({
      location: `${input.testCaseId ?? "minitest"}.rb:${index + 1}`,
      line: index + 1,
      column,
    });
    const unsupported = unsupportedAssertion(line);
    if (unsupported) {
      diagnostics.push({
        code: "unsupported_adapter",
        message: `Unsupported Minitest assertion construct: ${unsupported}.`,
        source: sourceLocation(line.indexOf(unsupported) + 1),
      });
      return;
    }
    const match = line.match(/\b(assert_equal|assert_empty|assert_raises|assert|refute)\b/u);
    if (!match || match.index === undefined) return;
    const assertion = parseAssertion(line, match.index);
    if (!assertion) {
      diagnostics.push({
        code: "ambiguous_assertion",
        message: `Could not normalize assertion at line ${index + 1}.`,
        source: sourceLocation(match.index + 1),
      });
      return;
    }
    const id = `minitest-${index + 1}-${match[1]}`;
    observations.push({
      id,
      direction: "test",
      statementId: id,
      kind: assertion.kind,
      value: assertion.value,
      order: observations.length + 1,
      reliable: true,
      source: sourceLocation(assertion.column),
      provenance: "ruby-minitest",
      blockRevision: input.blockRevision ?? input.sourceRevision,
    });
  });

  return {
    observations,
    diagnostics,
    derivation: /\b(?:IMPL|REQ|ARCH)-[A-Z0-9_-]+\b/u.test(input.source)
      ? "IMPL"
      : "unknown",
  };
}
