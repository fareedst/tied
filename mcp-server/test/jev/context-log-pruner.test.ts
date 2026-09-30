/**
 * [REQ-TIED_JEV_CONTEXT_LOG_PRUNING] [IMPL-TIED_JEV_CONTEXT_LOG_PRUNING]
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  deterministicChunkDisposition,
  mergeKeptRegionsWithSurround,
  pruneContextLog,
  resolveContextLogPruningConfig,
  shouldPassThrough,
  splitIntoChunks,
  splitLogLines,
} from "../../src/jev/context-log-pruner.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, "../../fixtures/context-pruning");

// Top-level tests avoid Bun nested-describe load ordering with plan-skills + allTools.
test("REQ-TIED_JEV_CONTEXT_LOG_PRUNING resolveContextLogPruningConfig defaults off", () => {
    const c = resolveContextLogPruningConfig({}, false);
    assert.equal(c.enabled, false);
    assert.equal(c.passThroughLines, 30);
    assert.equal(c.chunkLines, 10);
});

test("REQ-TIED_JEV_CONTEXT_LOG_PRUNING resolveContextLogPruningConfig opt-in via env", () => {
    const c = resolveContextLogPruningConfig({ TIED_JEV_CONTEXT_LOG_PRUNING: "1" }, false);
    assert.equal(c.enabled, true);
});

test("REQ-TIED_JEV_CONTEXT_LOG_PRUNING SC-PASS-THROUGH ≤30 lines unchanged", async () => {
    const lines = Array.from({ length: 30 }, (_, i) => `line-${i}`);
    const log = lines.join("\n");
    assert.equal(shouldPassThrough(log, 30), true);
    const { text, metrics } = await pruneContextLog(log, { arm: "pruner_jev_on" });
    assert.equal(text, log);
    assert.equal(metrics.pass_through, true);
});

test("REQ-TIED_JEV_CONTEXT_LOG_PRUNING 31 lines triggers chunking", async () => {
    const lines = Array.from({ length: 31 }, (_, i) =>
      i === 30 ? "FAIL test suite" : "✓ progress",
    );
    const log = lines.join("\n");
    assert.equal(shouldPassThrough(log, 30), false);
    const { text, metrics } = await pruneContextLog(log, {
      arm: "pruner_jev_off",
    });
    assert.equal(metrics.pass_through, false);
    assert.ok(text.includes("FAIL test suite"));
});

test("REQ-TIED_JEV_CONTEXT_LOG_PRUNING splitIntoChunks covers all indices", () => {
    const lines = Array.from({ length: 25 }, (_, i) => `L${i}`);
    const chunks = splitIntoChunks(lines, 10);
    assert.equal(chunks.length, 3);
    assert.equal(chunks[0]!.startIndex, 0);
    assert.equal(chunks[2]!.endIndexExclusive, 25);
});

test("REQ-TIED_JEV_CONTEXT_LOG_PRUNING deterministicChunkDisposition fatal", () => {
    const d = deterministicChunkDisposition("✓ ok\n✓ ok\nAssertionError: expected true\n");
    assert.ok(d.fatal_noul >= 0.4);
});

test("REQ-TIED_JEV_CONTEXT_LOG_PRUNING mergeKeptRegionsWithSurround ±2", () => {
    const lines = Array.from({ length: 20 }, (_, i) => `line-${i}`);
    const chunks = splitIntoChunks(lines, 10);
    const kept = [chunks[1]!];
    const merged = mergeKeptRegionsWithSurround(lines, kept, 2);
    assert.ok(merged.includes("line-8"));
    assert.ok(merged.includes("line-19"));
});

test("REQ-TIED_JEV_CONTEXT_LOG_PRUNING raw_before arm identity", async () => {
    const log = "a\n".repeat(50);
    const { text, metrics } = await pruneContextLog(log, { arm: "raw_before" });
    assert.equal(text, log);
    assert.equal(metrics.arm, "raw_before");
});

test("REQ-TIED_JEV_CONTEXT_LOG_PRUNING deterministic_only keep all", async () => {
    const log = Array.from({ length: 40 }, () => "boiler").join("\n");
    const { text, metrics } = await pruneContextLog(log, { arm: "deterministic_only" });
    assert.equal(text, log);
    assert.equal(metrics.chunks_kept, metrics.chunk_count);
});

test("REQ-TIED_JEV_CONTEXT_LOG_PRUNING SC-FALLBACK unavailable", async () => {
    const log = Array.from({ length: 50 }, () => "✓ running").join("\n");
    const { text, metrics } = await pruneContextLog(log, {
      arm: "pruner_jev_unavailable",
    });
    assert.equal(splitLogLines(text).length, splitLogLines(log).length);
    assert.ok(metrics.jev_skipped_chunks > 0);
});

test("REQ-TIED_JEV_CONTEXT_LOG_PRUNING mock Jev drops boilerplate", async () => {
    const progress = Array.from({ length: 35 }, () => "✓ test passed").join("\n");
    const fatal = "FAIL critical error at end";
    const log = `${progress}\n${fatal}`;
    const { text } = await pruneContextLog(log, {
      arm: "pruner_jev_on",
      mockDecide: async (chunk) => {
        if (chunk.includes("FAIL")) {
          return { fatal_noul: 0.95, boilerplate_noul: 0.1, jev_skipped: false, latency_ms: 1 };
        }
        return { fatal_noul: 0.1, boilerplate_noul: 0.9, jev_skipped: false, latency_ms: 1 };
      },
    });
    assert.ok(text.includes("FAIL critical"));
    assert.ok(text.length < log.length);
});

test("REQ-TIED_JEV_CONTEXT_LOG_PRUNING labeled corpus safety", async () => {
    const corpusPath = path.join(FIXTURES_DIR, "labeled-corpus.jsonl");
    assert.ok(fs.existsSync(corpusPath), "fixtures must exist");
    const rows = fs
      .readFileSync(corpusPath, "utf8")
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l) as { id: string; log: string; labels: string[] });

    assert.ok(rows.length >= 20, "corpus size");

    const fatalRows = rows.filter((r) => r.labels.includes("fatal_diagnostic"));
    let recalled = 0;
    for (const row of fatalRows) {
      const { text } = await pruneContextLog(row.log, { arm: "pruner_jev_off" });
      const markers = row.log.split("\n").filter((ln) =>
        /FAIL|error TS|AssertionError|panic|✗|error:/i.test(ln),
      );
      if (markers.length === 0 || markers.every((m) => text.includes(m))) recalled += 1;
    }
    const recallRate = fatalRows.length ? recalled / fatalRows.length : 1;
    assert.ok(recallRate >= 0.99, `fatal recall ${recallRate}`);

    const ctxRows = rows.filter((r) => r.labels.includes("context_required"));
    for (const row of ctxRows) {
      const { text } = await pruneContextLog(row.log, { arm: "pruner_jev_off" });
      assert.equal(text, row.log, `context_required must not shrink: ${row.id}`);
    }
});
