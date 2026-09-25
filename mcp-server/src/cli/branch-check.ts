#!/usr/bin/env node
/**
 * [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION]
 * `tied branch check` — W2a shared branch hygiene lib CLI.
 */

import path from "node:path";

import { defaultPathsForRequest } from "../dae/gate-check-composition.js";
import { loadCitdpBodyFromFile, loadTrackerFromFile } from "../dae/yaml-load.js";
import { runBranchCheck } from "../dae/branch-check.js";

function usage(): void {
  console.error(`Usage: tied branch check --request-token REQ-… [options]

Options:
  --tracker PATH
  --citdp PATH
  --project-root PATH
  --json-only
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
  if (!requestToken?.trim()) {
    usage();
    process.exit(2);
  }

  const projectRoot = resolveProjectRoot(getFlag(argv, "--project-root"));
  const defaults = defaultPathsForRequest(
    projectRoot,
    requestToken.trim(),
    getFlag(argv, "--tracker"),
    getFlag(argv, "--citdp"),
  );

  let citdp;
  let tracker;
  try {
    const trackerAbs = path.isAbsolute(defaults.trackerPath)
      ? defaults.trackerPath
      : path.join(projectRoot, defaults.trackerPath);
    const citdpAbs = path.isAbsolute(defaults.citdpPath)
      ? defaults.citdpPath
      : path.join(projectRoot, defaults.citdpPath);
    tracker = loadTrackerFromFile(trackerAbs);
    citdp = loadCitdpBodyFromFile(citdpAbs);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(JSON.stringify({ ok: false, exit_code: 2, error: msg }));
    process.exit(2);
  }

  const result = runBranchCheck({ projectRoot, citdp, tracker });
  console.log(JSON.stringify(result));
  if (!hasFlag(argv, "--json-only")) {
    const line = result.skipped
      ? "branch check: skipped (exit 0)"
      : result.ok
        ? `branch check: ok ${result.current ?? ""} (exit ${result.exit_code})`
        : `branch check: ${result.reasons.join("; ")} (exit ${result.exit_code})`;
    console.error(line);
  }
  process.exit(result.exit_code);
}

main().catch((e) => {
  const msg = e instanceof Error ? e.message : String(e);
  console.error(JSON.stringify({ ok: false, exit_code: 2, error: msg }));
  process.exit(2);
});
