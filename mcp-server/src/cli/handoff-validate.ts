#!/usr/bin/env node
/**
 * [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION]
 * `tied handoff validate` — validate handoff-shaped phase YAML (schema v1).
 */

import path from "node:path";

import { validateHandoffYamlFile } from "../handoff-yaml.js";

function usage(): void {
  console.error(`Usage: tied handoff validate --path PATH | --phase PHASE --request-token REQ-… [--project-root PATH]
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

  const explicitPath = getFlag(argv, "--path");
  const phase = getFlag(argv, "--phase");
  const requestToken = getFlag(argv, "--request-token");
  const projectRoot = resolveProjectRoot(getFlag(argv, "--project-root"));

  let targetPath: string | undefined;
  if (explicitPath?.trim()) {
    targetPath = path.isAbsolute(explicitPath)
      ? explicitPath
      : path.join(projectRoot, explicitPath);
  } else if (phase?.trim() && requestToken?.trim()) {
    targetPath = path.join(
      projectRoot,
      "working",
      requestToken.trim(),
      "handoffs",
      `${phase.trim()}.yaml`,
    );
  } else {
    usage();
    process.exit(2);
  }

  const result = validateHandoffYamlFile(targetPath);
  console.log(JSON.stringify(result));
  if (!result.ok) {
    console.error(result.diagnostics.join("; "));
  }
  process.exit(result.exit_code);
}

main();
