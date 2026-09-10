#!/usr/bin/env node
/**
 * [IMPL-REQUEST_EVIDENCE_ENVELOPE_BATCH] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE]
 * CLI for request_evidence_envelope_batch_collect.
 */

import path from "node:path";

import { collectEnvelopeGapReport } from "../request-evidence-envelope/batch-collect.js";
import { getBasePath } from "../yaml-loader.js";

export type EnvelopeBatchCollectCliDeps = {
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
    "Usage: request-evidence-envelope-batch-collect (--manifest PATH | --corpus PATH) --yaml-out PATH [--project-root PATH] [--privacy-tier shareable_hashed|operator_local] [--include-absolute-paths]",
    "",
    "Collect envelope gap coverage across batch rows or evaluation-corpus extension rows.",
  ].join("\n");
}

export async function runEnvelopeBatchCollectCli(
  argv: string[],
  deps: EnvelopeBatchCollectCliDeps = {},
): Promise<number> {
  const writeOut = deps.writeStdout ?? ((text) => process.stdout.write(text));
  const writeErr = deps.writeStderr ?? ((text) => process.stderr.write(text));
  if (argv.includes("--help") || argv.includes("-h")) {
    writeOut(`${usage()}\n`);
    return 0;
  }
  const manifestPath = flagValue(argv, "--manifest");
  const corpusPath = flagValue(argv, "--corpus");
  const yamlOut = flagValue(argv, "--yaml-out");
  const projectRoot = flagValue(argv, "--project-root") ?? deps.projectRoot ?? deps.cwd ?? process.cwd();
  const privacyTierRaw = flagValue(argv, "--privacy-tier");
  if (!yamlOut || (!manifestPath && !corpusPath)) {
    writeErr(`${usage()}\n`);
    return 2;
  }
  if (privacyTierRaw && privacyTierRaw !== "shareable_hashed" && privacyTierRaw !== "operator_local") {
    writeErr("Invalid --privacy-tier; expected shareable_hashed or operator_local\n");
    return 2;
  }
  try {
    const result = await collectEnvelopeGapReport({
      manifestPath,
      corpusPath,
      yamlOut: path.resolve(projectRoot, yamlOut),
      projectRoot: path.resolve(projectRoot),
      defaultTiedBasePath: getBasePath(),
      privacyTier: privacyTierRaw as "shareable_hashed" | "operator_local" | undefined,
      includeAbsolutePaths: argv.includes("--include-absolute-paths"),
      now: deps.now,
    });
    if (result.ok) {
      writeOut(`DEBUG: [IMPL-REQUEST_EVIDENCE_ENVELOPE_BATCH] wrote ${result.yaml_path}\n`);
      return 0;
    }
    writeErr(`${result.error}: ${result.validation_errors.join("; ")}\n`);
    return result.exit_code;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeErr(`${message}\n`);
    return 1;
  }
}

function isDirectCliLaunch(): boolean {
  const invoked = process.argv[1] ?? "";
  return (
    invoked.endsWith("request-evidence-envelope-batch-collect.ts") ||
    invoked.endsWith("request-evidence-envelope-batch-collect.js")
  );
}

if (isDirectCliLaunch()) {
  runEnvelopeBatchCollectCli(process.argv.slice(2))
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`${message}\n`);
      process.exit(1);
    });
}
