/**
 * [IMPL-TIED_COMMITTED_WORKING_GIT_HYGIENE] [REQ-TIED_COMMITTED_WORKING_GIT_HYGIENE]
 * Classify git-tracked tied-project/working paths for wave untrack migration.
 */
import { classifyWorkingRelativePath } from "./working-root.mjs";

/** @type {readonly RegExp[]} Per-REQ relative paths that stay tracked after hygiene. */
export const COMMITTED_WORKING_KEEP_RELATIVE_RES = [
  /^PLAN(-.*)?\.md$/,
  /^CLOSE-OUT-PLAN\.md$/,
  /^agent-req-implementation-checklist\.yaml$/,
  /^checklist-tracker.*\.yaml$/,
  /^handoffs\//,
  /^CITDP-.*\.yaml$/,
  /^evidence\/[^/]+-evidence\.md$/,
  /^evidence\/close-out-handoff\.md$/,
  /^evidence\/session-handoff\.md$/,
  /^evidence\/traceable-commit-evidence.*\.md$/,
  /^evidence\/git-hygiene-receipt.*\.md$/,
  /^evidence\/persist-citdp-record-evidence\.md$/,
  /^evidence\/proposed-commit-message\.txt$/,
];

/**
 * @param {string} repoRelativePath git path under tied-project/working/
 * @returns {"keep"|"untrack"|"relocate_fixture"}
 */
export function bucketCommittedWorkingPath(repoRelativePath) {
  const norm = repoRelativePath.replace(/\\/g, "/");
  if (!norm.startsWith("tied-project/working/")) {
    return "keep";
  }
  const tail = norm.slice("tied-project/working/".length);
  if (tail.startsWith("evaluation/") || tail === "evaluation") {
    return "keep";
  }
  const slash = tail.indexOf("/");
  const relative = slash === -1 ? "" : tail.slice(slash + 1);
  if (!relative) {
    return "keep";
  }
  if (COMMITTED_WORKING_KEEP_RELATIVE_RES.some((re) => re.test(relative))) {
    return "keep";
  }
  if (/^evidence\/.+\.stdout\.txt$/.test(relative)) {
    return "untrack";
  }
  if (classifyWorkingRelativePath(relative) === "local") {
    return "untrack";
  }
  return "keep";
}
