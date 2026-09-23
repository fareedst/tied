import fs from "node:fs";
import path from "node:path";

import { oracleFixturesDirFromModule } from "./paths.js";

/** [IMPL-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN] — load frozen oracle text for parity tests. */
export function readOracleFixture(moduleUrl: string, name: string): string {
  const p = path.join(oracleFixturesDirFromModule(moduleUrl), name);
  if (!fs.existsSync(p)) {
    throw new Error(`oracle fixture missing: ${p}`);
  }
  return fs.readFileSync(p, "utf8");
}

export function normalizeDryRunOutput(text: string): string {
  return text
    .replace(/\/var\/folders\/[^\s"]+/g, "<TMP>")
    .replace(/\/tmp\/[^\s"]+/g, "<TMP>")
    .replace(/\/private\/var\/[^\s"]+/g, "<TMP>")
    .replace(
      /\/Users\/[^\s"]+\/mcp-server\/packages\/agentstream\/testdata\/oracle\/dry-run-workspace/g,
      "<TMP>",
    );
}
