/**
 * [IMPL-VOCABULARY_ANALYSIS] [ARCH-VOCABULARY_DATA_CONTRACT] [REQ-VOCABULARY_ANALYSIS]
 * Deterministic source term extraction with conservative lexical heuristics.
 */

import {
  isMethodologyContentPath,
  isNonProductionContentPath,
  isTestFilePath,
  mergeTestFileConfig,
  type TraceabilityGapProjectConfig,
} from "../analysis/traceability-gap.js";
import { extractAstIdentifiers, isAstExtractableExtension } from "./identifier-ast.js";
import path from "node:path";

export type FileKind = "production" | "test" | "methodology" | "example" | "unknown";

export type IdentifierExtractionMode = "ast" | "lexical";

export type TermAnalysisPolicy = {
  min_frequency: number;
  max_terms: number;
  include_extensions: string[];
  identifier_mode?: IdentifierExtractionMode;
  traceability_gap?: TraceabilityGapProjectConfig;
};

export type TermOccurrence = {
  path: string;
  line: number;
  excerpt: string;
  file_kind: FileKind;
};

export type RawSourceTerm = {
  kind: "tied_token" | "source_identifier";
  display: string;
  normalized_key: string;
  tied_layer: "REQ" | "ARCH" | "IMPL" | null;
  occurrences: TermOccurrence[];
  /** Distinct file paths or scope keys for frequency counting. */
  scope_keys: Set<string>;
};

export type SourceTermAnalysisResult = {
  terms: RawSourceTerm[];
  truncation: {
    applied: boolean;
    max_terms: number;
    dropped_count: number;
  };
};

const TIED_TOKEN_RE = /\[(REQ-[A-Za-z0-9_-]+|ARCH-[A-Za-z0-9_-]+|IMPL-[A-Za-z0-9_-]+)\]/g;
const IDENTIFIER_RE = /[A-Za-z_][A-Za-z0-9_-]{2,127}/g;
const SECRET_RE = /(api[_-]?key|password|secret|token)\s*[:=]\s*\S+/gi;

const ECMA_RESERVED = new Set([
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "let",
  "new",
  "null",
  "return",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "undefined",
  "var",
  "void",
  "while",
  "with",
  "yield",
  "await",
]);

const ENGLISH_STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "this",
  "that",
  "from",
  "return",
  "import",
  "export",
  "class",
  "function",
  "const",
  "let",
  "var",
]);

export function classifyFileKind(
  relPosix: string,
  traceabilityGap?: TraceabilityGapProjectConfig,
): FileKind {
  const testCfg = mergeTestFileConfig(traceabilityGap?.test_file);
  if (isTestFilePath(relPosix, testCfg)) return "test";
  if (isMethodologyContentPath(relPosix, traceabilityGap?.methodology_path_markers)) return "methodology";
  if (isNonProductionContentPath(relPosix, traceabilityGap?.non_production_path_markers)) return "example";
  return "production";
}

export function redactSecrets(text: string): string {
  return text.replace(SECRET_RE, (match) => {
    const idx = match.search(/[:=]/);
    if (idx < 0) return match;
    return `${match.slice(0, idx + 1)} [REDACTED]`;
  });
}

export function buildExcerpt(lines: string[], lineIndex: number): string {
  const start = Math.max(0, lineIndex - 1);
  const end = Math.min(lines.length, lineIndex + 2);
  const slice = lines.slice(start, end).join("\n");
  const redacted = redactSecrets(slice);
  if (redacted.length <= 240) return redacted;
  return `${redacted.slice(0, 237)}...`;
}

function tiedLayerFromToken(token: string): "REQ" | "ARCH" | "IMPL" | null {
  if (token.startsWith("REQ-")) return "REQ";
  if (token.startsWith("ARCH-")) return "ARCH";
  if (token.startsWith("IMPL-")) return "IMPL";
  return null;
}

function isStopWordIdentifier(normalized: string, display: string): boolean {
  if (ECMA_RESERVED.has(normalized)) return true;
  if (ENGLISH_STOP.has(normalized)) return true;
  if (normalized.length <= 3 && normalized === display.toLowerCase() && !display.includes("-")) return true;
  return false;
}

function scopeKeyForMatch(relPosix: string, line: number, column: number): string {
  return `${relPosix}#${line}:${column}`;
}

export type FileTextEntry = {
  relPosix: string;
  text: string;
};

/**
 * [IMPL-VOCABULARY_ANALYSIS] [ARCH-VOCABULARY_DATA_CONTRACT] [REQ-VOCABULARY_ANALYSIS]
 * How: extract TIED tokens and source identifiers; apply frequency, stop words, truncation.
 */
export function analyzeSourceTerms(
  files: FileTextEntry[],
  policy: TermAnalysisPolicy,
): SourceTermAnalysisResult {
  const termMap = new Map<string, RawSourceTerm>();

  const upsert = (
    kind: RawSourceTerm["kind"],
    display: string,
    tied_layer: RawSourceTerm["tied_layer"],
    relPosix: string,
    line: number,
    excerpt: string,
    file_kind: FileKind,
    scopeKey: string,
  ) => {
    const normalized_key =
      kind === "tied_token" ? display.toLowerCase() : display.toLowerCase();
    const mapKey = `${kind}:${normalized_key}`;
    let entry = termMap.get(mapKey);
    if (!entry) {
      entry = {
        kind,
        display,
        normalized_key,
        tied_layer,
        occurrences: [],
        scope_keys: new Set<string>(),
      };
      termMap.set(mapKey, entry);
    }
    entry.scope_keys.add(scopeKey);
    const occ: TermOccurrence = { path: relPosix, line, excerpt, file_kind };
    const dup = entry.occurrences.some(
      (o) => o.path === occ.path && o.line === occ.line && o.excerpt === occ.excerpt,
    );
    if (!dup) entry.occurrences.push(occ);
  };

  for (const file of files) {
    const file_kind = classifyFileKind(file.relPosix, policy.traceability_gap);
    const lines = file.text.split(/\r?\n/);
    const useAst =
      (policy.identifier_mode ?? "ast") === "ast" &&
      isAstExtractableExtension(path.extname(file.relPosix));

    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i];
      TIED_TOKEN_RE.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = TIED_TOKEN_RE.exec(lineText)) !== null) {
        const token = m[1];
        upsert(
          "tied_token",
          token,
          tiedLayerFromToken(token),
          file.relPosix,
          i + 1,
          buildExcerpt(lines, i),
          file_kind,
          scopeKeyForMatch(file.relPosix, i + 1, m.index),
        );
      }

      if (useAst) continue;

      const parts = lineText.split(/[^A-Za-z0-9_-]+/);
      for (const part of parts) {
        if (!part || part.length < 3) continue;
        if (!/^[A-Za-z_][A-Za-z0-9_-]{2,127}$/.test(part)) continue;
        if (/^(REQ|ARCH|IMPL)-/.test(part)) continue;
        const normalized = part.toLowerCase();
        if (/^\d+$/.test(part)) continue;
        if (isStopWordIdentifier(normalized, part)) continue;
        const idx = lineText.indexOf(part);
        upsert(
          "source_identifier",
          part,
          null,
          file.relPosix,
          i + 1,
          buildExcerpt(lines, i),
          file_kind,
          scopeKeyForMatch(file.relPosix, i + 1, idx >= 0 ? idx : 0),
        );
      }
    }

    if (useAst) {
      for (const hit of extractAstIdentifiers(file.text, file.relPosix)) {
        if (hit.display.length < 3) continue;
        if (!/^[A-Za-z_][A-Za-z0-9_-]{2,127}$/.test(hit.display)) continue;
        if (/^(REQ|ARCH|IMPL)-/.test(hit.display)) continue;
        const normalized = hit.display.toLowerCase();
        if (/^\d+$/.test(hit.display)) continue;
        if (isStopWordIdentifier(normalized, hit.display)) continue;
        const lineIndex = hit.line - 1;
        upsert(
          "source_identifier",
          hit.display,
          null,
          file.relPosix,
          hit.line,
          buildExcerpt(lines, lineIndex),
          file_kind,
          scopeKeyForMatch(file.relPosix, hit.line, hit.column),
        );
      }
    }
  }

  let terms = [...termMap.values()].filter((t) => {
    if (t.kind === "tied_token") return true;
    const filePaths = new Set(t.occurrences.map((o) => o.path));
    if (filePaths.size >= policy.min_frequency) return true;
    if (t.scope_keys.size >= policy.min_frequency) return true;
    return false;
  });

  terms.sort((a, b) => {
    const freqA = a.occurrences.length;
    const freqB = b.occurrences.length;
    if (freqA !== freqB) return freqA - freqB;
    const keyCmp = a.normalized_key.localeCompare(b.normalized_key);
    if (keyCmp !== 0) return keyCmp;
    const pathA = a.occurrences[0]?.path ?? "";
    const pathB = b.occurrences[0]?.path ?? "";
    return pathA.localeCompare(pathB);
  });

  let dropped_count = 0;
  let applied = false;
  if (terms.length > policy.max_terms) {
    dropped_count = terms.length - policy.max_terms;
    terms = terms.slice(0, policy.max_terms);
    applied = true;
  }

  for (const t of terms) {
    t.occurrences.sort((a, b) => {
      const p = a.path.localeCompare(b.path);
      if (p !== 0) return p;
      return a.line - b.line;
    });
  }

  return {
    terms,
    truncation: {
      applied,
      max_terms: policy.max_terms,
      dropped_count,
    },
  };
}

export { TIED_TOKEN_RE };
