#!/usr/bin/env node
/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
 * Umbrella `tied` CLI — Phase 1 dispatches `mcp` to the existing stdio MCP entry.
 */
import { spawn } from "node:child_process";

import {
  agentstreamTsEntryFromCliModule,
  bootstrapCopyFilesEntryFromCliModule,
  bootstrapNewClientEntryFromCliModule,
  branchCheckCliEntryFromCliModule,
  gateCheckCliEntryFromCliModule,
  handoffValidateCliEntryFromCliModule,
  mcpStdioEntryFromCliModule,
  onboardingEntryFromCliModule,
  tiedNextCliEntryFromCliModule,
  yamlCliEntryFromCliModule,
} from "./paths.js";

function printHelp(): void {
  console.error(`Usage: tied <subcommand> [args...]

Subcommands:
  mcp         Start the TIED YAML MCP server on stdio (same as mcp-server/dist/index.js)
  bootstrap   Copy TIED templates into a client (default: copy-files; use "new-client" for pipeline)
  yaml        Lint or canonicalize YAML (lint | canonicalize)
  gate        Checklist gate composition (check — calls tied_checklist_gate_validate)
  branch      Git branch hygiene vs CITDP/Tracker (check)
  next        Recommend next checklist slug from Tracker discovery
  handoff     Validate handoff-shaped phase YAML (validate)
  agentstream Run agentstream pipeline (TS-only; default ts)
  help        Show this message

Unknown first arguments are forwarded to feature onboarding (legacy tied bin behavior).
`);
}

function resolveAgentstreamImpl(): "go" | "ts" {
  const raw = (process.env.TIED_AGENTSTREAM_IMPL ?? "ts").trim().toLowerCase();
  if (raw === "go") {
    return "go";
  }
  if (raw !== "ts" && raw !== "") {
    console.error(
      `DIAGNOSTIC: unknown TIED_AGENTSTREAM_IMPL=${JSON.stringify(raw)}; using ts`,
    );
  }
  return "ts";
}

const LEGACY_GO_REINSTALL_HINT =
  "TIED_AGENTSTREAM_IMPL=go was removed in Phase 4d. For emergency legacy Go agentstream, checkout a git tag from before Go removal (see working/REQ-TIED_UNIFIED_TOOLCHAIN/phase4c-deprecation-notice.md and phase4d-go-oracle-freeze.json).";

function runAgentstream(args: string[]): void {
  if (resolveAgentstreamImpl() === "go") {
    console.error(`tied agentstream: ${LEGACY_GO_REINSTALL_HINT}`);
    process.exit(2);
  }
  runNodeEntry(agentstreamTsEntryFromCliModule(import.meta.url), args);
}

function runNodeEntry(entry: string, args: string[]): void {
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

  if (subcommand === "help" || subcommand === "--help" || subcommand === "-h") {
    printHelp();
    process.exit(0);
  }

  if (subcommand === "mcp") {
    runNodeEntry(mcpStdioEntryFromCliModule(import.meta.url), rest);
    return;
  }

  if (subcommand === "bootstrap") {
    const action = rest[0];
    if (action === "new-client") {
      runNodeEntry(
        bootstrapNewClientEntryFromCliModule(import.meta.url),
        rest.slice(1),
      );
      return;
    }
    runNodeEntry(bootstrapCopyFilesEntryFromCliModule(import.meta.url), rest);
    return;
  }

  if (subcommand === "yaml") {
    runNodeEntry(yamlCliEntryFromCliModule(import.meta.url), rest);
    return;
  }

  if (subcommand === "agentstream") {
    runAgentstream(rest);
    return;
  }

  if (subcommand === "gate") {
    const action = rest[0];
    if (action === "check") {
      runNodeEntry(gateCheckCliEntryFromCliModule(import.meta.url), rest.slice(1));
      return;
    }
    printHelp();
    process.exit(action === undefined ? 1 : 2);
  }

  if (subcommand === "next") {
    runNodeEntry(tiedNextCliEntryFromCliModule(import.meta.url), rest);
    return;
  }

  if (subcommand === "handoff") {
    const action = rest[0];
    if (action === "validate") {
      runNodeEntry(handoffValidateCliEntryFromCliModule(import.meta.url), rest.slice(1));
      return;
    }
    printHelp();
    process.exit(action === undefined ? 1 : 2);
  }

  if (subcommand === "branch") {
    const action = rest[0];
    if (action === "check") {
      runNodeEntry(branchCheckCliEntryFromCliModule(import.meta.url), rest.slice(1));
      return;
    }
    printHelp();
    process.exit(action === undefined ? 1 : 2);
  }

  if (subcommand === undefined) {
    printHelp();
    process.exit(1);
  }

  if (subcommand === "onboarding") {
    runNodeEntry(onboardingEntryFromCliModule(import.meta.url), rest);
    return;
  }

  // Legacy `tied` forwarded argv to onboarding; preserve for existing scripts.
  runNodeEntry(onboardingEntryFromCliModule(import.meta.url), [subcommand, ...rest]);
}

main();
