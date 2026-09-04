#!/usr/bin/env node
/**
 * [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 * How: Windows lint_yaml.cmd backend — supports -F tied (lint_yaml.sh -F tied parity).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TIED_REPO_ROOT } from "./lib/constants.mjs";
import { sayErr } from "./lib/console.mjs";
import { lintClientTiedYaml } from "./lib/lint-client-yaml.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = [...argv];
  let findMode = false;
  let findBase = ".";
  while (args.length > 0 && args[0].startsWith("-")) {
    const flag = args.shift();
    if (flag === "-F" || flag === "--find") {
      findMode = true;
      if (args.length > 0 && !args[0].startsWith("-")) {
        findBase = args.shift();
      }
    } else if (flag === "-h" || flag === "--help") {
      return { help: true };
    } else {
      sayErr(`lint-yaml: unsupported option: ${flag}`);
      return { error: true };
    }
  }
  if (!findMode) {
    sayErr("lint-yaml: v1 supports -F tied only (lint_yaml.sh -F tied parity)");
    return { error: true };
  }
  if (findBase !== "tied") {
    sayErr(`lint-yaml: v1 supports -F tied only (got: ${findBase})`);
    return { error: true };
  }
  if (args.length > 0) {
    sayErr("lint-yaml: extra arguments not supported with -F");
    return { error: true };
  }
  return { findBase };
}

function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.help) {
    process.stdout.write("usage: lint-yaml.mjs -F tied\n");
    process.exit(0);
  }
  if (parsed.error) {
    process.exit(2);
  }

  const sourceRoot = TIED_REPO_ROOT;
  const clientDir = process.cwd();
  const result = lintClientTiedYaml({ clientDir, sourceRoot });
  process.exit(result.ok ? 0 : result.code ?? 1);
}

main();
