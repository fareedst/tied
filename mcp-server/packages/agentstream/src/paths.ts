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

/** Package-local checklist golden fixtures (Phase 4d oracle freeze). */
export function checklistTestdataDirFromModule(moduleUrl: string): string {
  const here = fileURLToPath(moduleUrl);
  return path.join(path.dirname(here), "..", "testdata", "checklist");
}

/** Live-run composition fixtures (fake agents, control checklists). */
export function liveTestdataDirFromModule(moduleUrl: string): string {
  const here = fileURLToPath(moduleUrl);
  return path.join(path.dirname(here), "..", "testdata", "live");
}

/** Frozen Go oracle outputs captured at removal (RISK-UNIFIED-007). */
export function oracleFixturesDirFromModule(moduleUrl: string): string {
  const here = fileURLToPath(moduleUrl);
  return path.join(path.dirname(here), "..", "testdata", "oracle");
}

/** Claude stream oracles — [REQ-TIED_CLAUDE_LIVE_DRIVER] fixtures/claude/. */
export function claudeFixturesDirFromModule(moduleUrl: string): string {
  const here = fileURLToPath(moduleUrl);
  return path.join(path.dirname(here), "..", "fixtures", "claude");
}
