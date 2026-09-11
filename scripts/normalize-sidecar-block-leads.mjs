#!/usr/bin/env node
/**
 * [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [ARCH-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP]
 * CLI for sidecar block-lead placement inventory and normalization.
 *
 * Usage:
 *   node scripts/normalize-sidecar-block-leads.mjs --check [--wave B1|B2|B3] [--root PATH] [--output PATH.json]
 *   node scripts/normalize-sidecar-block-leads.mjs --write [--wave B1|B2|B3] [--files path...] [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  DEFAULT_SIDECAR_ROOT,
  applyNormalization,
  buildInventory,
  resolveSidecarFiles,
} from "./lib/normalize-sidecar-block-leads.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function usage() {
  console.log(`Usage: node scripts/normalize-sidecar-block-leads.mjs \\
  (--check | --write) \\
  [--wave B1|B2|B3] \\
  [--files path...] \\
  [--root tied/implementation-decisions] \\
  [--output path.json] \\
  [--dry-run]

Exit codes:
  0  inventory clean or write success
  1  validation/gate failure (leaks remain)
  2  usage/IO error
`);
}

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  const out = {
    check: false,
    write: false,
    wave: /** @type {"B1"|"B2"|"B3"|""} */ (""),
    files: /** @type {string[]} */ ([]),
    root: DEFAULT_SIDECAR_ROOT,
    output: "",
    dryRun: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--check") out.check = true;
    else if (arg === "--write") out.write = true;
    else if (arg === "--dry-run") out.dryRun = true;
    else if (arg === "--wave") out.wave = /** @type {"B1"|"B2"|"B3"} */ (argv[++index] ?? "");
    else if (arg === "--root") out.root = path.resolve(argv[++index] ?? "");
    else if (arg === "--output") out.output = path.resolve(argv[++index] ?? "");
    else if (arg === "--files") {
      while (argv[index + 1] && !argv[index + 1].startsWith("--")) {
        out.files.push(path.resolve(argv[++index]));
      }
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!out.check && !out.write) {
    throw new Error("One of --check or --write is required");
  }
  if (out.check && out.write) {
    throw new Error("Use either --check or --write, not both");
  }
  if (out.wave && !["B1", "B2", "B3"].includes(out.wave)) {
    throw new Error(`Invalid wave: ${out.wave}`);
  }
  return out;
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
      usage();
      process.exit(0);
    }

    if (!fs.existsSync(args.root)) {
      throw new Error(`Sidecar root unavailable: ${args.root}`);
    }

    const filePaths = resolveSidecarFiles(args.root, args.wave || null, args.files);
    if (filePaths.length === 0) {
      throw new Error("No sidecar files resolved for the requested scope");
    }

    for (const filePath of filePaths) {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Missing sidecar file: ${filePath}`);
      }
    }

    if (args.check) {
      const inventory = buildInventory(filePaths);
      inventory.mode = "check";
      inventory.wave = args.wave || null;
      inventory.root = args.root;
      const payload = `${JSON.stringify(inventory, null, 2)}\n`;
      if (args.output) {
        fs.mkdirSync(path.dirname(args.output), { recursive: true });
        fs.writeFileSync(args.output, payload, "utf8");
      }
      console.log(payload.trimEnd());
      process.exit(inventory.ok ? 0 : 1);
    }

    const results = applyNormalization(filePaths, { write: true, dryRun: args.dryRun });
    const afterInventory = buildInventory(filePaths);
    const payload = {
      schema_version: "block-lead-write-result.v1",
      mode: args.dryRun ? "dry-run" : "write",
      wave: args.wave || null,
      root: args.root,
      file_count: filePaths.length,
      changed_count: Object.values(results).filter((entry) => entry.changed).length,
      results,
      inventory_after: afterInventory,
      ok: afterInventory.ok,
    };
    const serialized = `${JSON.stringify(payload, null, 2)}\n`;
    if (args.output) {
      fs.mkdirSync(path.dirname(args.output), { recursive: true });
      fs.writeFileSync(args.output, serialized, "utf8");
    }
    console.log(serialized.trimEnd());
    process.exit(afterInventory.ok ? 0 : 1);
  } catch (error) {
    console.error(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
    usage();
    process.exit(2);
  }
}

main();
