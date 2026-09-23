import path from "node:path";
import { fileURLToPath } from "node:url";

/** [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN] — repo root and legacy bootstrap .mjs entries. */
export function repoRootFromBootstrapModule(moduleUrl: string): string {
  const here = fileURLToPath(moduleUrl);
  return path.resolve(path.dirname(here), "../../../..");
}

export function copyFilesMjsFromBootstrapModule(moduleUrl: string): string {
  return path.join(
    repoRootFromBootstrapModule(moduleUrl),
    "tools",
    "bootstrap",
    "copy-files.mjs",
  );
}

export function newTiedClientMjsFromBootstrapModule(moduleUrl: string): string {
  return path.join(
    repoRootFromBootstrapModule(moduleUrl),
    "tools",
    "bootstrap",
    "new-tied-client.mjs",
  );
}
