import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";
import { test } from "node:test";

import { TIED_REPO_ROOT } from "./constants.mjs";
import { runProjectSizeBatchCompare } from "./project-size-batch-compare.mjs";

const FIXTURE = path.join(
  TIED_REPO_ROOT,
  "mcp-server/test/fixtures/project-size/mini-client",
);
const DIST = path.join(TIED_REPO_ROOT, "mcp-server/dist/project-size/snapshot-builder.js");

test("runProjectSizeBatchCompare integration", async (t) => {
  if (!fs.existsSync(DIST)) {
    t.skip("mcp-server/dist not built");
    return;
  }
  if (!fs.existsSync(FIXTURE)) {
    t.skip("mini-client fixture missing");
    return;
  }

  const work = await fs.promises.mkdtemp(path.join(os.tmpdir(), "ps-batch-"));
  const parent = path.join(work, "empty-parent");
  await mkdir(parent);
  const manifestPath = path.join(work, "targets.manifest");
  await writeFile(manifestPath, `mini\t${FIXTURE}\n`, "utf8");

  const outDir = path.join(work, "out");
  await runProjectSizeBatchCompare(
    [
      "node",
      "project-size-batch-compare.mjs",
      "--store-root",
      TIED_REPO_ROOT,
      "--parent",
      parent,
      "--pattern",
      "no-match-xyz",
      "--manifest",
      manifestPath,
      "--limit",
      "5",
      "--out-dir",
      outDir,
    ],
    process.env,
  );

  assert.ok(fs.existsSync(path.join(outDir, "comparison-table.md")));
  assert.ok(fs.existsSync(path.join(outDir, "manifest.v1.json")));
  const manifest = JSON.parse(fs.readFileSync(path.join(outDir, "manifest.v1.json"), "utf8"));
  assert.equal(manifest.snapshot_count, 1);
});
