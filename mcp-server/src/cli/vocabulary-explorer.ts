#!/usr/bin/env node
/**
 * [IMPL-VOCABULARY_ANALYSIS] [ARCH-VOCABULARY_EXPLORER] [REQ-VOCABULARY_EXPLORER]
 * CLI for offline vocabulary explorer artifact generation.
 */

import fs from "node:fs";
import path from "node:path";
import { runVocabularyExplorer } from "../vocabulary-explorer/pipeline.js";

function printHelp(): void {
  process.stdout.write(`vocabulary-explorer [--config PATH] [--roots dir,...] [--out FILE]
  [--min-frequency N] [--max-terms N] [--include-extensions ext,...]
  [--identifier-mode ast|lexical] [--emit-json PATH] [--help]

Default --out: vocabulary-explorer.html in cwd.
Exit 0 on success; non-zero on errors.
`);
}

function parseArgs(argv: string[]): {
  config?: string;
  roots?: string[];
  out: string;
  minFrequency?: number;
  maxTerms?: number;
  includeExtensions?: string[];
  identifierMode?: "ast" | "lexical";
  emitJson?: string;
  help: boolean;
} {
  const out: ReturnType<typeof parseArgs> = { out: "vocabulary-explorer.html", help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--config") out.config = argv[++i];
    else if (a === "--roots") out.roots = argv[++i]?.split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--out") out.out = argv[++i] ?? out.out;
    else if (a === "--min-frequency") out.minFrequency = Number(argv[++i]);
    else if (a === "--max-terms") out.maxTerms = Number(argv[++i]);
    else if (a === "--include-extensions")
      out.includeExtensions = argv[++i]?.split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--identifier-mode") {
      const mode = argv[++i];
      if (mode === "ast" || mode === "lexical") out.identifierMode = mode;
    } else if (a === "--emit-json") out.emitJson = argv[++i];
  }
  return out;
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    process.exit(0);
    return;
  }

  const result = runVocabularyExplorer({
    config_path: args.config,
    roots: args.roots,
    min_frequency: args.minFrequency,
    max_terms: args.maxTerms,
    include_extensions: args.includeExtensions,
    identifier_mode: args.identifierMode,
  });

  if (!result.ok || !result.envelope || !result.html) {
    process.stderr.write(`DIAGNOSTIC: vocabulary-explorer failed: ${result.error ?? "unknown"}\n`);
    process.exit(1);
    return;
  }

  const outAbs = path.resolve(process.cwd(), args.out);
  fs.writeFileSync(outAbs, result.html, "utf8");

  if (args.emitJson) {
    const jsonAbs = path.resolve(process.cwd(), args.emitJson);
    fs.writeFileSync(jsonAbs, `${JSON.stringify(result.envelope, null, 2)}\n`, "utf8");
  }

  process.stdout.write(`DIAGNOSTIC: wrote ${outAbs} (${result.envelope.terms.length} terms)\n`);
  process.exit(0);
}

main();
