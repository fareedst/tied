/**
 * [IMPL-TIED_COMMITTED_WORKING_GIT_HYGIENE] [REQ-TIED_COMMITTED_WORKING_GIT_HYGIENE] [REQ-TIED_GIT_HYGIENE]
 * Close-out artifacts under tied-project/working/{REQ}/ that must be git add'd at traceable-commit when on disk.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

/** Per-REQ relative paths (under tied-project/working/{REQ}/) that stay indexed when close-out produced them. */
export const COMMITTED_CLOSEOUT_EVIDENCE_REL = [
  "evidence/verification-evidence-manifest.v1.json",
  "evidence/request-evidence-envelope.v1.json",
];

/**
 * @param {string} projectRoot
 * @param {string} rel repo-relative path
 */
export function isGitTracked(projectRoot, rel) {
  try {
    execFileSync("git", ["ls-files", "--error-unmatch", rel], {
      cwd: projectRoot,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string} projectRoot
 * @param {string} requestToken
 * @returns {string[]} repo-relative paths that exist but are not in the index
 */
export function listCommittedWorkingStageCandidates(projectRoot, requestToken) {
  const token = requestToken.trim();
  if (!token) {
    return [];
  }
  const root = path.resolve(projectRoot);
  const prefix = `tied-project/working/${token}`;
  /** @type {string[]} */
  const out = [];
  for (const tail of COMMITTED_CLOSEOUT_EVIDENCE_REL) {
    const rel = `${prefix}/${tail}`;
    const abs = path.join(root, rel);
    if (fs.existsSync(abs) && !isGitTracked(root, rel)) {
      out.push(rel);
    }
  }
  return out.sort();
}
