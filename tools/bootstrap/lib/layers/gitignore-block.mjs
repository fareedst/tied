/**
 * [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_TWO_FOLDER_LAYOUT]
 * [IMPL-TIED_LAYERED_CLIENT_INSTALL] — v2 block: tied-bundle/ + harness; no tied-project/ entries.
 * How: Idempotent managed .gitignore block for gitignored install artifacts.
 */
import fs from "node:fs";
import path from "node:path";
import { BUNDLE_DIR_NAME } from "../layout.mjs";
import { mergeLocalWorkingGitignoreBlock } from "../working-gitignore.mjs";

export const GITIGNORE_BLOCK_BEGIN = "# BEGIN TIED INSTALL MANAGED";
export const GITIGNORE_BLOCK_END = "# END TIED INSTALL MANAGED";
export const GITIGNORE_BLOCK_VERSION = 2;

/** @type {readonly string[]} Legacy v1 paths replaced by v2 block migration. */
export const GITIGNORE_MANAGED_PATHS_V1 = [
  "tied-bundle/",
  "tied-bundle/docs/",
  "templates/impl-essence-pseudocode-template.md",
  "tied/.tied-install.json",
  "tied/.linked-methodology-view/",
];

/** @type {readonly string[]} */
export const GITIGNORE_MANAGED_PATHS = [
  ".cursor/mcp.json",
  ".mcp.json",
  ".cursor/skills/",
  ".claude/skills/",
  `${BUNDLE_DIR_NAME}/`,
  "CLAUDE.md",
  ".cursor/hooks.json",
  ".claude/hooks/",
  ".claude/settings.json",
];

/**
 * @param {string} projectRoot
 */
export function writeGitignoreBlock(projectRoot) {
  const gitignorePath = path.join(projectRoot, ".gitignore");
  const blockBody = [
    GITIGNORE_BLOCK_BEGIN,
    ...GITIGNORE_MANAGED_PATHS,
    GITIGNORE_BLOCK_END,
    "",
  ].join("\n");

  let existing = "";
  if (fs.existsSync(gitignorePath)) {
    existing = fs.readFileSync(gitignorePath, "utf8");
  }

  const blockRegex = new RegExp(
    `${GITIGNORE_BLOCK_BEGIN}[\\s\\S]*?${GITIGNORE_BLOCK_END}\\n?`,
    "m",
  );

  let next;
  if (blockRegex.test(existing)) {
    next = existing.replace(blockRegex, blockBody);
  } else {
    next = existing.endsWith("\n") || existing.length === 0 ? `${existing}${blockBody}` : `${existing}\n${blockBody}`;
  }

  next = mergeLocalWorkingGitignoreBlock(next, { undividedMirror: false });
  fs.writeFileSync(gitignorePath, next, "utf8");
  return { gitignorePath, paths: GITIGNORE_MANAGED_PATHS };
}
