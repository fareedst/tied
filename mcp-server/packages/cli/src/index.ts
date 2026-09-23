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
  goAgentstreamModuleDirFromCliModule,
  mcpStdioEntryFromCliModule,
  onboardingEntryFromCliModule,
  yamlCliEntryFromCliModule,
} from "./paths.js";

function printHelp(): void {
  console.error(`Usage: tied <subcommand> [args...]

Subcommands:
  mcp         Start the TIED YAML MCP server on stdio (same as mcp-server/dist/index.js)
  bootstrap   Copy TIED templates into a client (default: copy-files; use "new-client" for pipeline)
  yaml        Lint or canonicalize YAML (lint | canonicalize)
  agentstream Run Go agentstream pipeline (TIED_AGENTSTREAM_IMPL=go|ts)
  help        Show this message

Unknown first arguments are forwarded to feature onboarding (legacy tied bin behavior).
`);
}

function resolveAgentstreamImpl(): "go" | "ts" {
  const raw = (process.env.TIED_AGENTSTREAM_IMPL ?? "go").trim().toLowerCase();
  if (raw === "ts") {
    return "ts";
  }
  if (raw !== "go" && raw !== "") {
    console.error(
      `DIAGNOSTIC: unknown TIED_AGENTSTREAM_IMPL=${JSON.stringify(raw)}; using go`,
    );
  }
  return "go";
}

function spawnGoAgentstream(args: string[]): void {
  const moduleDir = goAgentstreamModuleDirFromCliModule(import.meta.url);
  const envBin = process.env.AGENTSTREAM?.trim();
  let command: string;
  let spawnArgs: string[];

  if (envBin) {
    command = envBin;
    spawnArgs = args;
  } else {
    command = "go";
    spawnArgs = ["run", "-C", moduleDir, "./cmd/agentstream", ...args];
  }

  const child = spawn(command, spawnArgs, {
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

function runAgentstream(args: string[]): void {
  if (resolveAgentstreamImpl() === "ts") {
    runNodeEntry(agentstreamTsEntryFromCliModule(import.meta.url), args);
    return;
  }
  spawnGoAgentstream(args);
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
