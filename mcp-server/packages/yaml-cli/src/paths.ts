import path from "node:path";
import { fileURLToPath } from "node:url";

/** [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN] — MCP workspace dist canonicalizer entry. */
export function mcpWorkspaceRootFromYamlCliModule(moduleUrl: string): string {
  const here = fileURLToPath(moduleUrl);
  return path.resolve(path.dirname(here), "../../..");
}

export function yamlCanonicalizerCliFromYamlCliModule(moduleUrl: string): string {
  return path.join(
    mcpWorkspaceRootFromYamlCliModule(moduleUrl),
    "dist",
    "cli",
    "yaml-canonicalizer.js",
  );
}
