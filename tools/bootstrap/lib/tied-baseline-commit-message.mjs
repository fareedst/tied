/**
 * [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 * How: Derive disposable client baseline git message from AGENTS.md methodology version.
 */
import fs from "node:fs";
import path from "node:path";

import { TIED_REPO_ROOT } from "./constants.mjs";

const VERSION_LINE = /^\*\*TIED Methodology Version\*\*:\s*(.+)\s*$/m;

/**
 * @param {string} [sourceRoot]
 * @returns {string} e.g. "TIED 3.0.0"
 */
export function tiedBaselineCommitMessage(sourceRoot = TIED_REPO_ROOT) {
  const agentsPath = path.join(sourceRoot, "AGENTS.md");
  try {
    const text = fs.readFileSync(agentsPath, "utf8");
    const match = text.match(VERSION_LINE);
    const version = match?.[1]?.trim();
    if (version) {
      return `TIED ${version}`;
    }
  } catch {
    // fall through
  }
  return "TIED 3.0.0";
}
