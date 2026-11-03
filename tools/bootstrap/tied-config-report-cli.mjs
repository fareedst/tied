#!/usr/bin/env node
/**
 * [REQ-TIED_CONFIG_REPORT] [IMPL-TIED_CONFIG_REPORT]
 * No-MCP-spawn CLI for tied-config-report.v1
 */
import process from "node:process";
import {
  buildTiedConfigReport,
  formatTiedConfigReportText,
} from "./lib/tied-config-report.mjs";

function parseArgs(argv) {
  let includeSecrets = false;
  let format = "json";
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--include-secrets") {
      includeSecrets = true;
    } else if (arg === "--format" && argv[i + 1]) {
      format = argv[i + 1];
      i += 1;
    } else if (arg === "--help" || arg === "-h") {
      process.stdout.write(`usage: tied-config-report-cli.mjs [--include-secrets] [--format json|text]\n`);
      process.exit(0);
    } else {
      process.stderr.write(`ERROR: unknown argument: ${arg}\n`);
      process.exit(1);
    }
  }
  if (format !== "json" && format !== "text") {
    process.stderr.write(`ERROR: --format must be json or text\n`);
    process.exit(1);
  }
  return { includeSecrets, format };
}

const { includeSecrets, format } = parseArgs(process.argv);

if (includeSecrets) {
  process.stderr.write(
    "WARNING: --include-secrets emits catalogued secret values on stdout; redirect carefully.\n",
  );
}

try {
  const report = buildTiedConfigReport({
    cwd: process.cwd(),
    processEnv: process.env,
    includeSecrets,
  });
  if (format === "text") {
    process.stdout.write(formatTiedConfigReportText(report));
  } else {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  }
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
