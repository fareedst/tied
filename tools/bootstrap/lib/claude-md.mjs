/**
 * [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS]
 * How: INSTALL_CLAUDE_MD_TEMPLATE — create-if-absent thin CLAUDE.md pointing to AGENTS.md.
 */
import fs from "node:fs";
import path from "node:path";
import { copyFileWithAttributes } from "./copy-managed.mjs";
import { sayXOfYClient } from "./console.mjs";
import { BUNDLE_DIR_NAME } from "./layout.mjs";

function resolveClaudeMdTemplatePath(tiedRepoRoot) {
  const candidates = [
    path.join(tiedRepoRoot, BUNDLE_DIR_NAME, "templates", "CLAUDE.md.template"),
    path.join(tiedRepoRoot, "tools", "bootstrap", "templates", "CLAUDE.md.template"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(`Missing CLAUDE.md template (checked: ${candidates.join(", ")})`);
}

/**
 * @param {string} projectRoot
 * @param {string} tiedRepoRoot
 * @returns {{ action: "installed" | "skipped" }}
 */
export function installClaudeMdTemplate(projectRoot, tiedRepoRoot) {
  const src = resolveClaudeMdTemplatePath(tiedRepoRoot);
  const dest = path.join(projectRoot, "CLAUDE.md");
  if (fs.existsSync(dest)) {
    return { action: "skipped" };
  }
  copyFileWithAttributes(src, dest);
  sayXOfYClient(1, 1, `Copied optional CLAUDE.md template into ${projectRoot}.`);
  return { action: "installed" };
}
