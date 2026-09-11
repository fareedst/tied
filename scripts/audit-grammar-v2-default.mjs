#!/usr/bin/env node
/**
 * [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]
 * Disposable-client grammar v2 default audit with independent dimensions.
 *
 * Usage:
 *   node scripts/audit-grammar-v2-default.mjs [--client-root PATH] [--json-out PATH]
 *
 * When --client-root is omitted, bootstraps a temporary client via copy_files.sh.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { REPO_ROOT, runGrammarV2DefaultAudit } from "./lib/audit-grammar-v2-default.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function usage() {
  console.log(`Usage: node scripts/audit-grammar-v2-default.mjs \\
  [--client-root PATH] \\
  [--json-out PATH]

Options:
  --help           Show this help
  --client-root    Bootstrapped TIED client root (default: disposable copy_files.sh client)
  --json-out       Write the audit JSON report to PATH
`);
}

function parseArgs(argv) {
  const out = { clientRoot: "", jsonOut: "", help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--client-root") out.clientRoot = path.resolve(argv[++i] ?? "");
    else if (arg === "--json-out") out.jsonOut = path.resolve(argv[++i] ?? "");
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return out;
}

function bootstrapDisposableClient() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-grammar-v2-audit-"));
  const copyScript = path.join(REPO_ROOT, "copy_files.sh");
  execFileSync("bash", [copyScript, tempDir], { cwd: REPO_ROOT, stdio: "pipe" });
  return { clientRoot: tempDir, disposable: true };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    process.exit(0);
  }

  let clientRoot = args.clientRoot;
  let disposable = false;
  if (!clientRoot) {
    const bootstrapped = bootstrapDisposableClient();
    clientRoot = bootstrapped.clientRoot;
    disposable = bootstrapped.disposable;
  }

  try {
    const report = runGrammarV2DefaultAudit(clientRoot);
    const payload = JSON.stringify(report, null, 2);
    if (args.jsonOut) {
      fs.mkdirSync(path.dirname(args.jsonOut), { recursive: true });
      fs.writeFileSync(args.jsonOut, `${payload}\n`, "utf8");
    }
    console.log(payload);
    if (!report.ok) {
      process.exit(1);
    }
  } finally {
    if (disposable) {
      fs.rmSync(clientRoot, { recursive: true, force: true });
    }
  }
}

main();
