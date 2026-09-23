#!/usr/bin/env node
/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
 * YAML lint/canonicalize front-end — same behavior as scripts/yaml_tool.sh default path.
 */
import { spawn } from "node:child_process";

import { yamlCanonicalizerCliFromYamlCliModule } from "./paths.js";

function usage(): void {
  console.error(`Usage: tied yaml <lint|canonicalize> [--check] [file ...]

  lint          Fail when files are not in resolved canonical style (--check on canonicalizer)
  canonicalize  Rewrite each file to canonical style (default yaml_tool.sh lint path)
`);
}

function runCanonicalizer(args: string[]): void {
  const entry = yamlCanonicalizerCliFromYamlCliModule(import.meta.url);
  const child = spawn(process.execPath, [entry, ...args], {
    stdio: "inherit",
    env: process.env,
  });
  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 1);
  });
}

function main(): void {
  const [, , subcommand, ...rest] = process.argv;

  if (
    subcommand === "help" ||
    subcommand === "--help" ||
    subcommand === "-h" ||
    subcommand === undefined
  ) {
    usage();
    process.exit(subcommand === undefined ? 1 : 0);
  }

  if (subcommand === "lint") {
    runCanonicalizer(["--check", ...rest]);
    return;
  }

  if (subcommand === "canonicalize") {
    runCanonicalizer(rest);
    return;
  }

  console.error(`Unknown yaml subcommand: ${subcommand}`);
  usage();
  process.exit(1);
}

main();
