import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyStoreGitignoreProfile,
  collapseWorkingGitignoreLine,
  mergeLocalWorkingGitignoreBlock,
  GITIGNORE_LOCAL_WORKING_BEGIN,
  GITIGNORE_STORE_LOCAL_WORKING_BEGIN,
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

test("applyStoreGitignoreProfile uses whole-root store local working without undivided mirror", () => {
  const merged = applyStoreGitignoreProfile("# root\n");
  assert.ok(merged.includes(GITIGNORE_STORE_LOCAL_WORKING_BEGIN));
  assert.ok(merged.includes("tied-bundle/working/"));
  assert.ok(!merged.includes(GITIGNORE_UNDIVIDED_MIRROR_BEGIN));
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
