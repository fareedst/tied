/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
 * Spawn the Go agentstream binary (AGENTSTREAM env or go run fallback).
 */
import { spawn } from "node:child_process";
import fs from "node:fs";

import { goAgentstreamModuleDirFromModule } from "./paths.js";

export function resolveAgentstreamImpl(): "go" | "ts" {
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

export function spawnGoAgentstream(
  args: string[],
  moduleUrl: string,
): void {
  const moduleDir = goAgentstreamModuleDirFromModule(moduleUrl);
  if (!fs.existsSync(moduleDir)) {
    console.error(`agentstream: Go module not found: ${moduleDir}`);
    process.exit(2);
  }

  const envBin = process.env.AGENTSTREAM?.trim();
  let command: string;
  let spawnArgs: string[];

  if (envBin) {
    try {
      fs.accessSync(envBin, fs.constants.X_OK);
    } catch {
      console.error(
        `agentstream: AGENTSTREAM is not an executable file: ${envBin}`,
      );
      process.exit(2);
    }
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
