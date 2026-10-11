/**
 * [IMPL-TIED_STORE_BUNDLE_GIT_POLICY] [REQ-TIED_STORE_BUNDLE_GIT_POLICY]
 * Copy tracked fixture pins into tied-bundle/working for runtime resolveWorkingPath (store local root).
 */
import fs from "node:fs";
import path from "node:path";

/**
 * @param {string} repoRoot
 * @param {string} [fixtureSubdir] optional REQ-* prefix under store-local-working
 */
export function seedStoreLocalWorkingFromFixtures(repoRoot, fixtureSubdir = "") {
  const srcRoot = path.join(
    repoRoot,
    "mcp-server/test/fixtures/store-local-working",
    fixtureSubdir,
  );
  if (!fs.existsSync(srcRoot)) {
    return { copied: 0 };
  }
  const destRoot = path.join(repoRoot, "tied-bundle/working", fixtureSubdir);
  let copied = 0;

  /** @param {string} rel */
  function walk(rel) {
    const abs = path.join(srcRoot, rel);
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(abs)) {
        walk(rel ? path.join(rel, name) : name);
      }
      return;
    }
    const dest = path.join(destRoot, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(abs, dest);
    copied += 1;
  }

  walk("");
  return { copied, destRoot };
}
