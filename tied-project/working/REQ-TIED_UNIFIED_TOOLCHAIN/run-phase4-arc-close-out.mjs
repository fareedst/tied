#!/usr/bin/env node
/**
 * Phase 4 arc close_out — gate validate + envelope blocking per build-plan skill.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const runner = path.join(repoRoot, "tools/bootstrap/templates/run-close-out-gates.mjs");
const runId = "phase4-full-close-out-2026-09-23";

const out = execFileSync(
  process.execPath,
  [
    runner,
    "--project-root",
    repoRoot,
    "--request-token",
    "REQ-TIED_UNIFIED_TOOLCHAIN",
    "--tracker-path",
    "working/REQ-TIED_UNIFIED_TOOLCHAIN/checklist-tracker.yaml",
    "--citdp-path",
    "tied/citdp/CITDP-REQ-TIED_UNIFIED_TOOLCHAIN.yaml",
    "--phase",
    "close_out",
    "--run-id",
    runId,
    "--sync-dispositions",
    "--reconcile",
    "--envelope-blocking",
  ],
  { encoding: "utf8", cwd: repoRoot },
);

const parsed = JSON.parse(out);
const gatePath = path.join(
  repoRoot,
  "working/REQ-TIED_UNIFIED_TOOLCHAIN/gates/phase4-full-close-out-gate.json",
);
fs.mkdirSync(path.dirname(gatePath), { recursive: true });
fs.writeFileSync(
  gatePath,
  `${JSON.stringify(
    {
      allowed: parsed.merged_decision?.allowed ?? false,
      ok: parsed.merged_decision?.allowed ?? false,
      blocking: parsed.merged_decision?.blocking ?? true,
      phase: "close_out",
      run_id: runId,
      diagnostics: parsed.gate?.diagnostics ?? [],
      envelope: {
        ok: parsed.envelope_validation?.ok ?? false,
        path: "working/REQ-TIED_UNIFIED_TOOLCHAIN/evidence/request-evidence-envelope.v1.json",
        blocking_gap_count: parsed.envelope_validation?.blocking_gap_count ?? null,
      },
      merged_decision: parsed.merged_decision,
      notes:
        "Arc close_out after Phase 4d local delivery; traceable-commit pending sponsor git commit.",
    },
    null,
    2,
  )}\n`,
  "utf8",
);
console.log(out);
process.exit(parsed.merged_decision?.allowed ? 0 : 1);
