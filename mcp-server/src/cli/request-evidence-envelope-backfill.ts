#!/usr/bin/env node
/**
 * [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE]
 * CLI for request_evidence_envelope_backfill.
 */

import path from "node:path";

import { backfillRequestEvidenceEnvelope } from "../request-evidence-envelope/backfill.js";
import type { DepthTier } from "../request-evidence-envelope/types.js";
import { getBasePath } from "../yaml-loader.js";

export type EnvelopeBackfillCliDeps = {
  cwd?: string;
  projectRoot?: string;
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
    "Usage: request-evidence-envelope-backfill --project-root PATH --request-token REQ-TOKEN",
    "       [--tied-base-path PATH] [--depth-tier minimal|integrated|strict_candidate]",
    "       [--gate-policy POLICY] [--write-not-applicable-receipts] [--no-write-not-applicable-receipts]",
    "",
    "Backfill request-evidence-envelope.v1.json for legacy timestamp client repos.",
  ].join("\n");
}

export async function runEnvelopeBackfillCli(
  argv: string[],
  deps: EnvelopeBackfillCliDeps = {},
): Promise<number> {
  const writeOut = deps.writeStdout ?? ((text) => process.stdout.write(text));
  const writeErr = deps.writeStderr ?? ((text) => process.stderr.write(text));
  if (argv.includes("--help") || argv.includes("-h")) {
    writeOut(`${usage()}\n`);
    return 0;
  }

  const requestToken = flagValue(argv, "--request-token");
  const projectRoot = flagValue(argv, "--project-root") ?? deps.projectRoot ?? deps.cwd ?? process.cwd();
  const tiedBasePath = flagValue(argv, "--tied-base-path") ?? path.join(path.resolve(projectRoot), "tied");
  const depthTierRaw = flagValue(argv, "--depth-tier");
  const gatePolicy = flagValue(argv, "--gate-policy");

  if (!requestToken) {
    writeErr(`${usage()}\n`);
    return 2;
  }
  if (
    depthTierRaw &&
    depthTierRaw !== "minimal" &&
    depthTierRaw !== "integrated" &&
    depthTierRaw !== "strict_candidate"
  ) {
    writeErr("Invalid --depth-tier; expected minimal, integrated, or strict_candidate\n");
    return 2;
  }

  const resolvedProjectRoot = path.resolve(projectRoot);
  const tiedOverride = flagValue(argv, "--tied-base-path");
  const effectiveTiedBase = tiedOverride
    ? path.resolve(tiedOverride)
    : resolvedProjectRoot === path.resolve(path.dirname(getBasePath()))
      ? getBasePath()
      : path.join(resolvedProjectRoot, "tied");
  const effectiveConfirmed = effectiveTiedBase;

  try {
    const result = await backfillRequestEvidenceEnvelope({
      request_token: requestToken,
      project_root: path.resolve(projectRoot),
      tied_base_path: effectiveTiedBase,
      confirmed_tied_base_path: effectiveConfirmed,
      depth_tier: depthTierRaw as DepthTier | undefined,
      gate_policy: gatePolicy,
      write_not_applicable_receipts: !argv.includes("--no-write-not-applicable-receipts"),
    });
    writeOut(`${JSON.stringify(result, null, 2)}\n`);
    if (result.ok) {
      writeOut(
        `DEBUG: [IMPL-REQUEST_EVIDENCE_ENVELOPE] backfill wrote ${result.envelope_path}` +
          `${result.not_applicable_receipt_path ? ` and ${result.not_applicable_receipt_path}` : ""}\n`,
      );
      return 0;
    }
    return 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeErr(`${message}\n`);
    return 1;
  }
}

function isDirectCliLaunch(): boolean {
  const invoked = process.argv[1] ?? "";
  return (
    invoked.endsWith("request-evidence-envelope-backfill.ts") ||
    invoked.endsWith("request-evidence-envelope-backfill.js")
  );
}

if (isDirectCliLaunch()) {
  runEnvelopeBackfillCli(process.argv.slice(2))
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`${message}\n`);
      process.exit(1);
    });
}
