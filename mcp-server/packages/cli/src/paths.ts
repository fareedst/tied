import path from "node:path";
import { fileURLToPath } from "node:url";

/** [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN] — workspace-relative MCP and onboarding dist entries. */
export function workspaceRootFromCliModule(moduleUrl: string): string {
  const cliFile = fileURLToPath(moduleUrl);
  return path.resolve(path.dirname(cliFile), "../../..");
}

export function mcpStdioEntryFromCliModule(moduleUrl: string): string {
  return path.join(workspaceRootFromCliModule(moduleUrl), "dist", "index.js");
}

export function onboardingEntryFromCliModule(moduleUrl: string): string {
  return path.join(
    workspaceRootFromCliModule(moduleUrl),
    "dist",
    "feature-orchestration",
    "onboarding-entry.js",
  );
}

export function repoRootFromCliModule(moduleUrl: string): string {
  return path.resolve(workspaceRootFromCliModule(moduleUrl), "..");
}

export function bootstrapCopyFilesEntryFromCliModule(moduleUrl: string): string {
  return path.join(
    repoRootFromCliModule(moduleUrl),
    "tools",
    "bootstrap",
    "copy-files.mjs",
  );
}

export function bootstrapNewClientEntryFromCliModule(moduleUrl: string): string {
  return path.join(
    repoRootFromCliModule(moduleUrl),
    "tools",
    "bootstrap",
    "new-tied-client.mjs",
  );
}

export function yamlCliEntryFromCliModule(moduleUrl: string): string {
  return path.join(
    workspaceRootFromCliModule(moduleUrl),
    "packages",
    "yaml-cli",
    "dist",
    "index.js",
  );
}

export function agentstreamTsEntryFromCliModule(moduleUrl: string): string {
  return path.join(
    workspaceRootFromCliModule(moduleUrl),
    "packages",
    "agentstream",
    "dist",
    "index.js",
  );
}

/** [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — DAE Wave 1 CLI dispatch targets under mcp-server/dist/cli/. */
export function gateCheckCliEntryFromCliModule(moduleUrl: string): string {
  return path.join(workspaceRootFromCliModule(moduleUrl), "dist", "cli", "gate-check.js");
}

export function tiedNextCliEntryFromCliModule(moduleUrl: string): string {
  return path.join(workspaceRootFromCliModule(moduleUrl), "dist", "cli", "tied-next.js");
}

export function handoffValidateCliEntryFromCliModule(moduleUrl: string): string {
  return path.join(
    workspaceRootFromCliModule(moduleUrl),
    "dist",
    "cli",
    "handoff-validate.js",
  );
}

export function branchCheckCliEntryFromCliModule(moduleUrl: string): string {
  return path.join(workspaceRootFromCliModule(moduleUrl), "dist", "cli", "branch-check.js");
}

