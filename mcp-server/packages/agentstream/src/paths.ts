import path from "node:path";
import { fileURLToPath } from "node:url";

/** [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN] — mcp-server workspace root from this package. */
export function mcpWorkspaceRootFromModule(moduleUrl: string): string {
  const here = fileURLToPath(moduleUrl);
  return path.resolve(path.dirname(here), "../../..");
}

/** Repository root (parent of mcp-server/). */
export function repoRootFromModule(moduleUrl: string): string {
  return path.resolve(mcpWorkspaceRootFromModule(moduleUrl), "..");
}

export function goAgentstreamModuleDirFromModule(moduleUrl: string): string {
  return path.join(repoRootFromModule(moduleUrl), "tools", "agentstream");
}

export function checklistTestdataDirFromModule(moduleUrl: string): string {
  return path.join(
    goAgentstreamModuleDirFromModule(moduleUrl),
    "checklist",
    "testdata",
  );
}
