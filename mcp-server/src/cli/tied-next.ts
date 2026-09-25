#!/usr/bin/env node
/**
 * [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION]
 * `tied next` — recommend next checklist slug from Authoritative Tracker(s).
 */

import path from "node:path";

import { runTiedNext } from "../dae/tied-next.js";

function usage(): void {
  console.error(`Usage: tied next [--request-token REQ-…] [--project-root PATH] [--help]
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

function resolveProjectRoot(explicit?: string): string {
  if (explicit?.trim()) {
    return path.resolve(explicit.trim());
  }
  if (process.env.TIED_BASE_PATH?.trim()) {
    return path.resolve(process.env.TIED_BASE_PATH.trim(), "..");
  }
  return process.cwd();
}

function main(): void {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    usage();
    process.exit(0);
  }

  const result = runTiedNext({
    projectRoot: resolveProjectRoot(getFlag(argv, "--project-root")),
    requestToken: getFlag(argv, "--request-token"),
  });

  console.log(JSON.stringify(result));
  if (result.exit_code === 0 && result.slug) {
    console.error(`next slug: ${result.slug} (${result.rationale})`);
  } else if (result.exit_code === 2 && result.ambiguous_trackers) {
    console.error(`ambiguous trackers: ${result.ambiguous_trackers.join(", ")}`);
  }

  process.exit(result.exit_code);
}

main();
