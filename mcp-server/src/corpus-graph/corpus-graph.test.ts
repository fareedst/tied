import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildCorpusGraphMap,
  checkCorpusGraphFreshness,
  refreshCorpusGraphIndex,
  traceCorpusGraphNode,
} from "./index-builder.js";

const fixtureRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../test/fixtures/corpus-graph/mini-repo",
);

describe("corpus-graph index [IMPL-TIED_CORPUS_GRAPH_REFRESH] [REQ-TIED_CORPUS_COMPREHENSION]", () => {
  it("refresh-build-index: indexes three REQ tokens from requirements.yaml", async () => {
    const { index, diagnostics } = await refreshCorpusGraphIndex({
      repo_root: fixtureRoot,
      index_rel_path: "tied-bundle/reports/corpus-graph/corpus-graph-index.v1.json",
    });
    assert.ok(index.nodes.some((n) => n.node_id === "REQ-ALPHA"));
    assert.ok(index.nodes.some((n) => n.node_id === "REQ-BETA"));
    assert.ok(index.nodes.some((n) => n.node_id === "REQ-GAMMA"));
    assert.ok(diagnostics.some((d) => d.code === "MISSING_DETAIL"));
  });

  it("trace-token-refs: REQ-ALPHA references REQ-BETA from detail yaml", async () => {
    const { index } = await refreshCorpusGraphIndex({
      repo_root: fixtureRoot,
      index_rel_path: "tied-bundle/reports/corpus-graph/corpus-graph-index.v1.json",
    });
    const trace = traceCorpusGraphNode(index, "REQ-ALPHA", 1);
    assert.ok(trace.references.includes("REQ-BETA"));
    assert.ok(trace.detail_path?.includes("requirements/REQ-ALPHA.yaml"));
  });

  it("map-index-clusters: requirements.yaml cluster has node counts", async () => {
    const { index } = await refreshCorpusGraphIndex({
      repo_root: fixtureRoot,
      index_rel_path: "tied-bundle/reports/corpus-graph/corpus-graph-index.v1.json",
    });
    const map = buildCorpusGraphMap(index);
    assert.ok(map.totals.nodes >= 3);
    assert.ok(map.clusters.some((c) => c.index_file.endsWith("requirements.yaml")));
  });

  it("freshness-mismatch: stale index reports diagnostic", async () => {
    const { index } = await refreshCorpusGraphIndex({
      repo_root: fixtureRoot,
      index_rel_path: "tied-bundle/reports/corpus-graph/corpus-graph-index.v1.json",
    });
    const stale = { ...index, content_hash: "deadbeef" };
    const fresh = await checkCorpusGraphFreshness({ repo_root: fixtureRoot, index: stale });
    assert.equal(fresh.ok, false);
    assert.ok(fresh.diagnostics.some((d) => d.code === "STALE_INDEX"));
  });

  it("refresh-hash-stable: unchanged tree yields same hash", async () => {
    const first = await refreshCorpusGraphIndex({
      repo_root: fixtureRoot,
      index_rel_path: "tied-bundle/reports/corpus-graph/corpus-graph-index.v1.json",
    });
    const second = await refreshCorpusGraphIndex({
      repo_root: fixtureRoot,
      index_rel_path: "tied-bundle/reports/corpus-graph/corpus-graph-index.v1.json",
    });
    assert.equal(first.index.content_hash, second.index.content_hash);
  });

  it("scope-empty: missing tied-project emits SCOPE_EMPTY", async () => {
    const temp = await mkdtemp(path.join(tmpdir(), "cgc-empty-"));
    try {
      const { index_path, diagnostics } = await refreshCorpusGraphIndex({ repo_root: temp });
      assert.equal(index_path, "");
      assert.ok(diagnostics.some((d) => d.code === "SCOPE_EMPTY"));
      assert.equal(diagnostics.length > 0, true);
    } finally {
      await rm(temp, { recursive: true, force: true });
    }
  });

  it("sidecar-scan: pseudocode md adds IMPL reference edges", async () => {
    const temp = await mkdtemp(path.join(tmpdir(), "cgc-side-"));
    try {
      const tp = path.join(temp, "tied-project");
      await mkdir(path.join(tp, "implementation-decisions"), { recursive: true });
      await mkdir(path.join(tp, "requirements"), { recursive: true });
      await writeFile(
        path.join(tp, "requirements.yaml"),
        'REQ-SAMPLE:\n  detail_file: "requirements/REQ-SAMPLE.yaml"\n',
      );
      await writeFile(path.join(tp, "requirements/REQ-SAMPLE.yaml"), "REQ-SAMPLE:\n  description: ok\n");
      await writeFile(
        path.join(tp, "implementation-decisions/IMPL-SAMPLE-pseudocode.md"),
        "# [IMPL-SAMPLE] [REQ-SAMPLE] — sample\n",
      );
      const { index } = await refreshCorpusGraphIndex({
        repo_root: temp,
        index_rel_path: "tied-bundle/reports/corpus-graph/corpus-graph-index.v1.json",
      });
      assert.ok(
        index.edges.some(
          (e) => e.from_node_id === "IMPL-SAMPLE" && e.to_node_id === "REQ-SAMPLE" && e.kind === "references",
        ),
      );
    } finally {
      await rm(temp, { recursive: true, force: true });
    }
  });
});
