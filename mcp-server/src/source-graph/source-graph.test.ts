import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildSourceGraphMap,
  checkSourceGraphFreshness,
  refreshSourceGraphIndex,
  traceSourceGraphSymbol,
} from "./index-builder.js";

const fixtureRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../test/fixtures/source-graph/mini-repo",
);

describe("source-graph index [IMPL-TIED_SOURCE_GRAPH_REFRESH] [REQ-TIED_SOURCE_GRAPH_COMPREHENSION]", () => {
  it("refresh-build-index: file change changes content hash", async () => {
    const temp = await mkdtemp(path.join(tmpdir(), "sgc-"));
    try {
      const libDir = path.join(temp, "lib");
      const appDir = path.join(temp, "app");
      await import("node:fs/promises").then((fs) =>
        Promise.all([fs.mkdir(libDir, { recursive: true }), fs.mkdir(appDir, { recursive: true })]),
      );
      await writeFile(path.join(libDir, "util.ts"), "export function helper() { return 1; }\n");
      await writeFile(
        path.join(appDir, "main.ts"),
        'import { helper } from "../lib/util.js";\nexport function main() { return helper(); }\n',
      );

      const first = await refreshSourceGraphIndex({ repo_root: temp });
      const second = await refreshSourceGraphIndex({ repo_root: temp });
      assert.equal(first.index.content_hash, second.index.content_hash);

      await writeFile(path.join(libDir, "util.ts"), "export function helper() { return 2; }\n");
      const third = await refreshSourceGraphIndex({ repo_root: temp });
      assert.notEqual(first.index.content_hash, third.index.content_hash);
    } finally {
      await rm(temp, { recursive: true, force: true });
    }
  });

  it("map-repo-clusters: fixture repo returns stable cluster counts", async () => {
    const { index } = await refreshSourceGraphIndex({ repo_root: fixtureRoot });
    const map = buildSourceGraphMap(index);
    assert.equal(map.totals.files, 2);
    assert.ok(map.totals.symbols >= 2);
    assert.ok(map.clusters.some((c) => c.directory === "app"));
    assert.ok(map.clusters.some((c) => c.directory === "lib"));
  });

  it("trace-symbol-edges: main calls helper; helper called from main", async () => {
    const { index } = await refreshSourceGraphIndex({ repo_root: fixtureRoot });
    const mainTrace = traceSourceGraphSymbol(index, "app/main.ts#main");
    assert.ok(mainTrace.callees.some((id) => id.includes("helper")));
    const helperTrace = traceSourceGraphSymbol(index, "lib/util.ts#helper");
    assert.ok(helperTrace.callers.some((id) => id.includes("main")));
  });

  it("freshness-mismatch: stale index reports diagnostic", async () => {
    const { index } = await refreshSourceGraphIndex({ repo_root: fixtureRoot });
    const stale = { ...index, content_hash: "deadbeef" };
    const fresh = await checkSourceGraphFreshness({ repo_root: fixtureRoot, index: stale });
    assert.equal(fresh.ok, false);
    assert.ok(fresh.diagnostics.some((d) => d.code === "STALE_INDEX"));
  });
});
