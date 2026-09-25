#!/usr/bin/env node
/**
 * [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION]
 * `tied gate check` — composes tied_checklist_gate_validate with Tracker/CITDP paths.
 */

import path from "node:path";

import type { GatePhase } from "../checklist-validator.js";
import {
  defaultPathsForRequest,
  runGateCheckComposition,
} from "../dae/gate-check-composition.js";
import { createMcpGateValidateFn } from "../dae/gate-check-mcp.js";

function usage(): void {
  console.error(`Usage: tied gate check --request-token REQ-… --phase pre_implementation|verification|close_out [options]

Options:
  --slug SLUG
  --tracker PATH
  --citdp PATH
  --project-root PATH   Default: parent of tied/ (from TIED_BASE_PATH or cwd heuristic)
  --check-branch        Hard-fail when git branch mismatches CITDP/Tracker expected branch (W2a)
  --json-only           Omit human one-liner on stdout
  --help
`);
}

function getFlag(argv: string[], flag: string): string | undefined {
  const idx = argv.indexOf(flag);
  if (idx < 0) {
    return undefined;
  }
  const v = argv[idx + 1];
  if (!v || v.startsWith("--")) {
    return undefined;
  }
  return v;
}

function hasFlag(argv: string[], flag: string): boolean {
  return argv.includes(flag);
}

function resolveProjectRoot(explicit?: string): string {
  if (explicit?.trim()) {
    return path.resolve(explicit.trim());
  }
  if (process.env.TIED_BASE_PATH?.trim()) {
    return path.resolve(process.env.TIED_BASE_PATH.trim(), "..");
  }
  return process.cwd();
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  if (hasFlag(argv, "--help") || hasFlag(argv, "-h")) {
    usage();
    process.exit(0);
  }

  const requestToken = getFlag(argv, "--request-token");
  const phaseRaw = getFlag(argv, "--phase");
  if (!requestToken?.trim() || !phaseRaw?.trim()) {
    usage();
    process.exit(2);
  }

  const phase = phaseRaw.trim() as GatePhase;
  if (!["pre_implementation", "verification", "close_out"].includes(phase)) {
    console.error("DIAGNOSTIC: invalid --phase");
    process.exit(2);
  }

  const projectRoot = resolveProjectRoot(getFlag(argv, "--project-root"));
  const defaults = defaultPathsForRequest(
    projectRoot,
    requestToken.trim(),
    getFlag(argv, "--tracker"),
    getFlag(argv, "--citdp"),
  );

  let callGateValidate;
  try {
    callGateValidate = createMcpGateValidateFn();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(
      JSON.stringify({
        allowed: false,
        exit_code: 2,
        error: msg,
        manual_path: "tied/docs/using-tied-without-mcp.md",
      }),
    );
    console.error(`tied gate check: MCP unavailable (${msg})`);
    process.exit(2);
  }

  const summary = await runGateCheckComposition({
    requestToken: requestToken.trim(),
    phase,
    slug: getFlag(argv, "--slug"),
    trackerPath: defaults.trackerPath,
    citdpPath: defaults.citdpPath,
    projectRoot,
    checkBranch: hasFlag(argv, "--check-branch"),
    callGateValidate,
  });

  console.log(JSON.stringify(summary));
  if (!hasFlag(argv, "--json-only")) {
    const line = summary.allowed
      ? `gate ${phase}: allowed (exit ${summary.exit_code})`
      : `gate ${phase}: blocked — ${summary.reasons.join("; ")} (exit ${summary.exit_code})`;
    console.error(line);
  }

  process.exit(summary.exit_code);
}

main().catch((e) => {
  const msg = e instanceof Error ? e.message : String(e);
  console.error(JSON.stringify({ allowed: false, exit_code: 2, error: msg }));
  process.exit(2);
});
