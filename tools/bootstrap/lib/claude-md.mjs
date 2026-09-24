/**
 * [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS]
 * How: INSTALL_CLAUDE_MD_TEMPLATE — create-if-absent thin CLAUDE.md pointing to AGENTS.md.
 */
import fs from "node:fs";
import path from "node:path";
import { copyFileWithAttributes } from "./copy-managed.mjs";
import { sayXOfYClient } from "./console.mjs";

const TEMPLATE_REL = path.join("tools", "bootstrap", "templates", "CLAUDE.md.template");

/**
 * @param {string} projectRoot
 * @param {string} tiedRepoRoot
 * @returns {{ action: "installed" | "skipped" }}
 */
export function installClaudeMdTemplate(projectRoot, tiedRepoRoot) {
  const src = path.join(tiedRepoRoot, TEMPLATE_REL);
  if (!fs.existsSync(src)) {
    throw new Error(`Missing CLAUDE.md template: ${src}`);
  }
  const dest = path.join(projectRoot, "CLAUDE.md");
  if (fs.existsSync(dest)) {
    return { action: "skipped" };
  }
  copyFileWithAttributes(src, dest);
  sayXOfYClient(1, 1, `Copied optional CLAUDE.md template into ${projectRoot}.`);
  return { action: "installed" };
}
