#!/usr/bin/env node
/**
 * [IMPL-TIED_STORE_BUNDLE_GIT_POLICY] [REQ-TIED_STORE_BUNDLE_GIT_POLICY]
 * Apply store gitignore profile to repo-root .gitignore (idempotent).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { applyStoreGitignoreProfile } from "../lib/working-gitignore.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const gitignorePath = path.join(repoRoot, ".gitignore");
const before = fs.readFileSync(gitignorePath, "utf8");
const after = applyStoreGitignoreProfile(before);
if (before !== after) {
  fs.writeFileSync(gitignorePath, after, "utf8");
  console.log(`DEBUG: updated ${gitignorePath} with store gitignore profile`);
} else {
  console.log(`DEBUG: ${gitignorePath} already matches store profile`);
}
