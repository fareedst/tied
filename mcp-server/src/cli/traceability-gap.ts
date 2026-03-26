#!/usr/bin/env node
/**
 * CLI for traceability gap report: prints JSON and exits with suggested_exit_code
 * when --strict is set (for CI). Default exit 0 unless strict + gaps.
 */

import { runScopedAnalysis } from "../analysis/scoped-analysis.js";

function main(): void {
  const argv = process.argv.slice(2);
  const strict = argv.includes("--strict");
  const rest = argv.filter((a) => a !== "--strict");

  const result = runScopedAnalysis({
    mode: "traceability_gap_report",
    traceability_strict: strict,
  });

  const merged = {
    ...result,
    cli: {
      strict_requested: strict,
    },
  };

  process.stdout.write(`${JSON.stringify(merged, null, 2)}\n`);

  if (!strict) {
    process.exit(0);
    return;
  }

  const code = result.traceability_gap_report?.exit_policy.suggested_exit_code ?? 0;
  process.exit(code);
}

main();
