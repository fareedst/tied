/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
 * Repository root discovery (Go config.FindRepoRoot parity subset).
 */
import fs from "node:fs";
import path from "node:path";

function walkForChecklist(start: string): string {
  let dir = start;
  try {
    const st = fs.statSync(start);
    if (!st.isDirectory()) {
      dir = path.dirname(start);
    }
  } catch {
    dir = path.dirname(start);
  }
  for (;;) {
    const candidate = path.join(
      dir,
      "tied",
      "docs",
      "agent-req-implementation-checklist.yaml",
    );
    try {
      const st = fs.statSync(candidate);
      if (st.isFile()) {
        return dir;
      }
    } catch {
      /* continue walk */
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      return "";
    }
    dir = parent;
  }
}

export function findRepoRootFromPath(start: string): string {
  const fromStart = walkForChecklist(start);
  if (fromStart !== "") {
    return fromStart;
  }
  return walkForChecklist(process.cwd());
}
