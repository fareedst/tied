#!/usr/bin/env node
/**
 * [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE]
 * CLI entry for PATCH_REQUEST_EVIDENCE_ENVELOPE (agentstream dual-write parity).
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import { getBasePath } from "../yaml-loader.js";
import { patchRequestEvidenceEnvelope } from "../request-evidence-envelope/patch.js";
import type { PatchRequestEvidenceEnvelopeInput } from "../request-evidence-envelope/types.js";

function usage(): void {
  // eslint-disable-next-line no-console
  console.error(`Usage: request-evidence-envelope-patch [--args-file PATH]

Reads PatchRequestEvidenceEnvelopeInput JSON from stdin or --args-file.
Writes JSON result to stdout; exits 0 on ok:true, 1 otherwise.
`);
}

async function main(): Promise<void> {
  const argsFileIdx = process.argv.indexOf("--args-file");
  let raw = "";
  if (argsFileIdx >= 0) {
    const filePath = process.argv[argsFileIdx + 1];
    if (!filePath) {
      usage();
      process.exit(2);
    }
    raw = readFileSync(path.resolve(filePath), "utf8");
  } else if (!process.stdin.isTTY) {
    raw = readFileSync(0, "utf8");
  } else {
    usage();
    process.exit(2);
  }

  const input = JSON.parse(raw) as PatchRequestEvidenceEnvelopeInput;
  const tiedBase = input.tied_base_path ?? getBasePath();
  const result = await patchRequestEvidenceEnvelope({
    ...input,
    tied_base_path: tiedBase,
    confirmed_tied_base_path: input.confirmed_tied_base_path ?? tiedBase,
  });
  process.stdout.write(`${JSON.stringify(result)}\n`);
  process.exit(result.ok ? 0 : 1);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stdout.write(`${JSON.stringify({ ok: false, gaps: [], error: message })}\n`);
  process.exit(1);
});
