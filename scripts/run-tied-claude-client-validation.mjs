#!/usr/bin/env node
/**
 * [IMPL-TIED_CLAUDE_BOOTSTRAP_OPS] [REQ-TIED_CLAUDE_BOOTSTRAP_OPS]
 * How: CLI entry for RUN_CLAUDE_CLIENT_VALIDATION on an existing bootstrapped client.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import { REPO_ROOT } from "./lib/audit-grammar-v2-default.mjs";
import { runClaudeClientValidation } from "../tools/bootstrap/lib/claude-client-validation.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function usage() {
  console.log(`Usage: node scripts/run-tied-claude-client-validation.mjs \\
  --client-root PATH \\
  [--source-root PATH] \\
  [--json-out PATH] \\
  [--with-consistency] \\
  [--with-agentstream-dry-run] \\
  [--no-agentstream-dry-run] \\
  [--with-live-claude]
  [--with-claude-code-interactive-smoke]

Options:
  --help                 Show this help
  --client-root          Bootstrapped Claude-first client root (required)
  --source-root          TIED repo root (default: parent of scripts/)
  --json-out             Override report path (default: client/working/tied-claude-client-validation.v1.json)
  --with-consistency     Run tied_validate_consistency (default off)
  --with-agentstream-dry-run  Run agentstream dry-run (default on)
  --no-agentstream-dry-run      Skip agentstream dry-run
  --with-live-claude     Reserved; live check skipped in v1
  --with-claude-code-interactive-smoke  Run claude -p strict MCP base_path smoke (needs Claude CLI + auth)
`);
}

function parseArgs(argv) {
  const out = {
    clientRoot: "",
    sourceRoot: "",
    jsonOut: "",
    withConsistency: false,
    withAgentstreamDryRun: true,
    withLiveClaude: false,
    withClaudeCodeInteractiveSmoke: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--client-root") out.clientRoot = path.resolve(argv[++i] ?? "");
    else if (arg === "--source-root") out.sourceRoot = path.resolve(argv[++i] ?? "");
    else if (arg === "--json-out") out.jsonOut = path.resolve(argv[++i] ?? "");
    else if (arg === "--with-consistency") out.withConsistency = true;
    else if (arg === "--with-agentstream-dry-run") out.withAgentstreamDryRun = true;
    else if (arg === "--no-agentstream-dry-run") out.withAgentstreamDryRun = false;
    else if (arg === "--with-live-claude") out.withLiveClaude = true;
    else if (arg === "--with-claude-code-interactive-smoke") {
      out.withClaudeCodeInteractiveSmoke = true;
    }
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (process.env.TIED_CLAUDE_CLIENT_WITH_CONSISTENCY === "1") {
    out.withConsistency = true;
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    process.exit(0);
  }
  if (!args.clientRoot) {
    console.error("ERROR: --client-root PATH required");
    usage();
    process.exit(2);
  }

  const sourceRoot = args.sourceRoot || REPO_ROOT;
  const validationCommand = `node scripts/run-tied-claude-client-validation.mjs --client-root ${args.clientRoot}`;

  console.log(
    `DEBUG: runClaudeClientValidation clientRoot=${args.clientRoot} withAgentstreamDryRun=${args.withAgentstreamDryRun}`,
  );

  const result = runClaudeClientValidation(args.clientRoot, sourceRoot, {
    withConsistency: args.withConsistency,
    withAgentstreamDryRun: args.withAgentstreamDryRun,
    withLiveClaude: args.withLiveClaude,
    withClaudeCodeInteractiveSmoke: args.withClaudeCodeInteractiveSmoke,
    reportPath: args.jsonOut || undefined,
    validationCommand,
  });

  if (!args.jsonOut) {
    console.log(JSON.stringify(result.report, null, 2));
  }

  process.exit(result.ok ? 0 : 1);
}

main();
