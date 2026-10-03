/**
 * [REQ-TIED_TWO_FOLDER_LAYOUT] Test helper — locate store/client root from cwd.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { LEGACY_PROJECT_DIR_NAME, PROJECT_DIR_NAME } from "../src/tied-layout.js";

export function resolveRepoRootFromCwd(maxDepth = 8): string {
  let dir = path.resolve(process.cwd());
  for (let i = 0; i < maxDepth; i += 1) {
    for (const name of [PROJECT_DIR_NAME, LEGACY_PROJECT_DIR_NAME]) {
      if (existsSync(path.join(dir, name, "requirements.yaml"))) {
        return dir;
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(process.cwd(), "..");
}

export function repoTiedBasePath(repoRoot: string): string {
  const modern = path.join(repoRoot, PROJECT_DIR_NAME);
  if (existsSync(path.join(modern, "requirements.yaml"))) return modern;
  return path.join(repoRoot, LEGACY_PROJECT_DIR_NAME);
}
