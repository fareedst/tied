#!/usr/bin/env node
/**
 * [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 * How: CLI for BOOTSTRAP_TIED — --merge-vocab, optional target (default cwd).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bootstrapTied } from "./lib/bootstrap.mjs";
import { sayErr } from "./lib/console.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = [...argv];
  let mergeVocab = false;
  let methodologyReadonly = false;
  let installMethodologyHook = false;
  while (args.length > 0 && args[0].startsWith("-")) {
    if (args[0] === "--merge-vocab") {
      mergeVocab = true;
      args.shift();
    } else if (args[0] === "--methodology-readonly") {
      methodologyReadonly = true;
      args.shift();
    } else if (args[0] === "--install-methodology-hook") {
      installMethodologyHook = true;
      args.shift();
    } else {
      sayErr(`Unknown option: ${args[0]}`);
      process.exit(1);
    }
  }
  const target = args[0] ? path.resolve(args[0]) : process.cwd();
  return { mergeVocab, target, methodologyReadonly, installMethodologyHook };
}

function main() {
  const { mergeVocab, target, methodologyReadonly, installMethodologyHook } = parseArgs(
    process.argv.slice(2),
  );
  try {
    bootstrapTied(target, {
      mergeVocab,
      env: process.env,
      methodologyReadonly,
      installMethodologyHook,
    });
  } catch (e) {
    if (e instanceof Error && e.message) {
      sayErr(e.message);
    }
    process.exit(1);
  }
}

main();
