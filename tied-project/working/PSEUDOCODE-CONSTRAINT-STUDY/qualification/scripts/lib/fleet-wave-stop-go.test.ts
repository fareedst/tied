/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Unit tests — wave stop/go builder and log validation.
 */
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  appendWaveStopGo,
  buildStopGoRecord,
  hasStopGoForWave,
  loadWaveStopGoLog,
  validateStopGoRecord,
} from "./fleet-wave-stop-go.ts";

test("buildStopGoRecord go with empty gaps", () => {
  const record = buildStopGoRecord({
    wave_id: "W-stdd-1",
    client_ids: ["stdd"],
    gate_stage: "G2",
    disposition: "go",
    receipt_summary_path: "working/fleet-constraint-v2/pilots/stdd/receipts/summary.json",
  });
  assert.equal(record.disposition, "go");
  assert.equal(record.blocking_evidence_gaps, undefined);
  validateStopGoRecord(record);
});

test("buildStopGoRecord stop requires blocking gaps", () => {
  assert.throws(
    () =>
      buildStopGoRecord({
        wave_id: "W-x",
        client_ids: ["stdd"],
        gate_stage: "G3",
        disposition: "stop",
      }),
    /blocking_evidence_gaps/,
  );
});

test("appendWaveStopGo appends to file", async () => {
  const dir = await mkdtemp(join(tmpdir(), "stop-go-"));
  const path = join(dir, "wave-stop-go.v1.json");
  try {
    const { record } = await appendWaveStopGo(
      {
        wave_id: "W-test",
        client_ids: ["stdd"],
        gate_stage: "G3",
        disposition: "go",
      },
      path,
    );
    const log = await loadWaveStopGoLog(path);
    assert.equal(log.length, 1);
    assert.equal(log[0].record_id, record.record_id);
    assert.ok(hasStopGoForWave(log, "W-test"));
    const raw = await readFile(path, "utf8");
    assert.ok(raw.startsWith("["));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
