#!/usr/bin/env node
/**
 * [IMPL-EVIDENCE_CHAIN_REPORT] [ARCH-EVIDENCE_CHAIN_REPORT] [REQ-EVIDENCE_CHAIN_REPORT]
 * How: Parse argv and map GENERATE_EVIDENCE_CHAIN_REPORT errors to exit 0, 1, or 2 without printing absolute client paths unless requested.
 */

import {
  generateEvidenceChainStatisticsReport,
  type GenerateReportResult,
  type ReportMode,
  type ReportVersion,
} from "../fidelity-research/evidence-chain-report.js";

export type EvidenceChainReportCliDeps = {
  cwd?: string;
  projectRoot?: string;
  now?: string | Date;
  writeStdout?: (text: string) => void;
  writeStderr?: (text: string) => void;
};

function flagValue(argv: string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  if (index < 0) return undefined;
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) return undefined;
  return value;
}

function usage(): string {
  return [
    "Usage: evidence-chain-report --inputs <manifest.yaml> --yaml-out <report.yaml> --markdown-out <report.md> [--mode strict|partial] [--report-version v1|v2]",
    "",
    "Read-only aggregator for evidence-chain-profile.v1 artifacts.",
  ].join("\n");
}

export function runEvidenceChainReportCli(argv: string[], deps: EvidenceChainReportCliDeps = {}): number {
  const writeOut = deps.writeStdout ?? ((text) => process.stdout.write(text));
  const writeErr = deps.writeStderr ?? ((text) => process.stderr.write(text));
  if (argv.includes("--help") || argv.includes("-h")) {
    writeOut(`${usage()}\n`);
    return 0;
  }
  const inputsPath = flagValue(argv, "--inputs");
  const yamlOut = flagValue(argv, "--yaml-out");
  const markdownOut = flagValue(argv, "--markdown-out");
  const modeRaw = flagValue(argv, "--mode");
  const reportVersionRaw = flagValue(argv, "--report-version");
  if (!inputsPath || !yamlOut || !markdownOut) {
    writeErr(`${usage()}\n`);
    return 1;
  }
  if (modeRaw !== undefined && modeRaw !== "strict" && modeRaw !== "partial") {
    writeErr("Invalid --mode; expected strict or partial\n");
    return 1;
  }
  if (reportVersionRaw !== undefined && reportVersionRaw !== "v1" && reportVersionRaw !== "v2") {
    writeErr("Invalid --report-version; expected v1 or v2\n");
    return 1;
  }
  const result: GenerateReportResult = generateEvidenceChainStatisticsReport({
    inputsPath,
    yamlOut,
    markdownOut,
    modeOverride: modeRaw as ReportMode | undefined,
    reportVersion: (reportVersionRaw ?? "v1") as ReportVersion,
    now: deps.now,
    cwd: deps.cwd,
    projectRoot: deps.projectRoot,
  });
  if (result.ok) {
    writeOut("DEBUG: [IMPL-EVIDENCE_CHAIN_REPORT] CLI wrote report files\n");
    return 0;
  }
  const includeAbsolute = result.excluded_inputs.some((row) => row.artifact_ref.includes("/"));
  const detail = result.validation_errors[0]?.message ?? result.error;
  if (includeAbsolute) {
    writeErr(`${result.error}: ${detail}\n`);
  } else {
    writeErr(`${result.error}\n`);
  }
  return result.exit_code;
}

function isDirectCliLaunch(): boolean {
  const invoked = process.argv[1] ?? "";
  return invoked.endsWith("evidence-chain-report.ts") || invoked.endsWith("evidence-chain-report.js");
}

if (isDirectCliLaunch()) {
  process.exitCode = runEvidenceChainReportCli(process.argv.slice(2));
}
