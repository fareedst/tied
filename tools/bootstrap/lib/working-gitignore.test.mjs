import { test } from "node:test";
import assert from "node:assert/strict";
import {
  collapseWorkingGitignoreLine,
  mergeLocalWorkingGitignoreBlock,
  GITIGNORE_LOCAL_WORKING_BEGIN,
  GITIGNORE_UNDIVIDED_MIRROR_BEGIN,
  undividedMirrorGlob,
} from "./working-gitignore.mjs";

test("collapseWorkingGitignoreLine remaps local gate globs", () => {
  assert.equal(
    collapseWorkingGitignoreLine("working/**/gates/"),
    "tied-bundle/working/**/gates/",
  );
  assert.equal(
    collapseWorkingGitignoreLine("!working/REQ-TIED_FOO/gates/"),
    "!working/REQ-TIED_FOO/gates/",
  );
});

test("mergeLocalWorkingGitignoreBlock adds undivided mirror for store profile", () => {
  const merged = mergeLocalWorkingGitignoreBlock("# root\n", {
    profile: "store",
    undividedMirror: true,
  });
  assert.ok(merged.includes(GITIGNORE_LOCAL_WORKING_BEGIN));
  assert.ok(merged.includes("tied-bundle/working/**/gates/"));
  assert.ok(merged.includes("working/**/gates/"));
  assert.equal(undividedMirrorGlob("tied-bundle/working/**/jev/"), "working/**/jev/");
});

test("client profile removes legacy blocks without appending", () => {
  const withBlocks = [
    "# keep",
    GITIGNORE_LOCAL_WORKING_BEGIN,
    "tied-bundle/working/foo/",
    "# END TIED LOCAL WORKING (managed)",
    GITIGNORE_UNDIVIDED_MIRROR_BEGIN,
    "working/foo/",
    "# END TIED UNDIVIDED STORE MIRROR",
    "",
  ].join("\n");
  const merged = mergeLocalWorkingGitignoreBlock(withBlocks, { profile: "client" });
  assert.ok(merged.includes("# keep"));
  assert.ok(!merged.includes(GITIGNORE_LOCAL_WORKING_BEGIN));
  assert.ok(!merged.includes(GITIGNORE_UNDIVIDED_MIRROR_BEGIN));
});
