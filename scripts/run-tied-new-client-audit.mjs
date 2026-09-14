#!/usr/bin/env node
/**
 * [IMPL-TIED_NEW_CLIENT_ONBOARDING] [REQ-TIED_NEW_CLIENT_ADHERENCE]
 * Client-root G4 onboarding audit — grammar v2 default at gateStage G4, optional consistency, JSON report.
 *
 * Usage:
 *   node scripts/run-tied-new-client-audit.mjs --client-root PATH [--json-out PATH] [--with-consistency]
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { REPO_ROOT } from "./lib/audit-grammar-v2-default.mjs";
import { runTiedNewClientAudit } from "./lib/tied-new-client-audit.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function usage() {
  console.log(`Usage: node scripts/run-tied-new-client-audit.mjs \\
  --client-root PATH \\
  [--json-out PATH] \\
  [--with-consistency]

Options:
  --help              Show this help
  --client-root       Bootstrapped TIED client root (required unless --disposable)
  --disposable        Bootstrap temp client via copy_files.sh then audit (WS-NC-5 smoke)
  --json-out          Write tied-new-client-audit.v1 JSON to PATH
  --with-consistency  Run tied_validate_consistency on client tied/ (default off, OD-NC-2)
`);
}

function parseArgs(argv) {
  const out = {
    clientRoot: "",
    jsonOut: "",
    withConsistency: false,
    disposable: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--client-root") out.clientRoot = path.resolve(argv[++i] ?? "");
    else if (arg === "--json-out") out.jsonOut = path.resolve(argv[++i] ?? "");
    else if (arg === "--with-consistency") out.withConsistency = true;
    else if (arg === "--disposable") out.disposable = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return out;
}

function bootstrapDisposableClient() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-nc-audit-"));
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
  if (args.disposable) {
    const boot = bootstrapDisposableClient();
    clientRoot = boot.clientRoot;
    disposable = boot.disposable;
  }
  if (!clientRoot) {
    console.error("ERROR: --client-root PATH or --disposable required");
    usage();
    process.exit(2);
  }

  const auditCommand = args.disposable
    ? "node scripts/run-tied-new-client-audit.mjs --disposable"
    : `node scripts/run-tied-new-client-audit.mjs --client-root ${clientRoot}`;

  console.log(
    `DEBUG: runTiedNewClientAudit clientRoot=${clientRoot} withConsistency=${args.withConsistency}`,
  );

  try {
    const result = runTiedNewClientAudit({
      clientRoot,
      withConsistency: args.withConsistency,
      reportPath: args.jsonOut || undefined,
      auditCommand,
      repoRoot: REPO_ROOT,
    });

    const payload = `${JSON.stringify(result.report, null, 2)}\n`;
    if (!args.jsonOut) {
      console.log(payload.trimEnd());
    }

    if (!result.ok) {
      process.exit(1);
    }
  } finally {
    if (disposable) {
      fs.rmSync(clientRoot, { recursive: true, force: true });
    }
  }
}

main();
