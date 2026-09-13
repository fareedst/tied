/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION]
 * Append-only wave stop/go log (OD-P4-6).
 */
import { randomUUID } from "node:crypto";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { METHODOLOGY_PIN_LABEL, REPO_ROOT } from "./constants.ts";

export type StopGoDisposition = "go" | "stop" | "halt";

export type WaveStopGoRecord = {
  schema_version: 1;
  record_id: string;
  wave_id: string;
  client_ids: string[];
  gate_stage: "G2" | "G3";
  disposition: StopGoDisposition;
  decided_at: string;
  methodology_pin: string;
  blocking_evidence_gaps?: string[];
  f11_fp_thresholds_ref?: string;
  receipt_summary_path?: string;
  operator?: string;
  notes?: string;
};

export type AppendWaveStopGoInput = {
  wave_id: string;
  client_ids: string[];
  gate_stage: "G2" | "G3";
  disposition: StopGoDisposition;
  methodology_pin?: string;
  blocking_evidence_gaps?: string[];
  f11_fp_thresholds_ref?: string;
  receipt_summary_path?: string;
  operator?: string;
  notes?: string;
  decided_at?: string;
};

const DEFAULT_STOP_GO_PATH = join(
  REPO_ROOT,
  "working/fleet-constraint-v2/wave-stop-go.v1.json",
);

export function validateStopGoRecord(record: WaveStopGoRecord): void {
  if (record.schema_version !== 1) {
    throw new Error(`DIAGNOSTIC: stop/go schema_version must be 1`);
  }
  if (!record.record_id?.trim()) throw new Error("DIAGNOSTIC: record_id required");
  if (!record.wave_id?.trim()) throw new Error("DIAGNOSTIC: wave_id required");
  if (!record.client_ids?.length) throw new Error("DIAGNOSTIC: client_ids required");
  if (record.gate_stage !== "G2" && record.gate_stage !== "G3") {
    throw new Error("DIAGNOSTIC: gate_stage must be G2 or G3");
  }
  if (!["go", "stop", "halt"].includes(record.disposition)) {
    throw new Error("DIAGNOSTIC: invalid disposition");
  }
  if (!record.decided_at?.trim()) throw new Error("DIAGNOSTIC: decided_at required");
  if (!record.methodology_pin?.trim()) {
    throw new Error("DIAGNOSTIC: methodology_pin required");
  }
  const gaps = record.blocking_evidence_gaps ?? [];
  if (record.disposition === "go" && gaps.length > 0) {
    throw new Error("DIAGNOSTIC: go disposition must have empty blocking_evidence_gaps");
  }
  if ((record.disposition === "stop" || record.disposition === "halt") && gaps.length < 1) {
    throw new Error("DIAGNOSTIC: stop/halt requires non-empty blocking_evidence_gaps");
  }
  if (record.disposition === "halt" && !record.f11_fp_thresholds_ref?.trim()) {
    throw new Error("DIAGNOSTIC: halt disposition requires f11_fp_thresholds_ref");
  }
}

export function buildStopGoRecord(input: AppendWaveStopGoInput): WaveStopGoRecord {
  const gaps =
    input.disposition === "go"
      ? []
      : (input.blocking_evidence_gaps ?? []).filter((g) => g.trim().length > 0);
  const record: WaveStopGoRecord = {
    schema_version: 1,
    record_id: randomUUID(),
    wave_id: input.wave_id,
    client_ids: [...input.client_ids],
    gate_stage: input.gate_stage,
    disposition: input.disposition,
    decided_at: input.decided_at ?? new Date().toISOString(),
    methodology_pin: input.methodology_pin ?? METHODOLOGY_PIN_LABEL,
    blocking_evidence_gaps: gaps.length > 0 ? gaps : undefined,
    f11_fp_thresholds_ref: input.f11_fp_thresholds_ref,
    receipt_summary_path: input.receipt_summary_path,
    operator: input.operator,
    notes: input.notes,
  };
  validateStopGoRecord(record);
  return record;
}

export async function loadWaveStopGoLog(
  path = DEFAULT_STOP_GO_PATH,
): Promise<WaveStopGoRecord[]> {
  try {
    await access(path);
  } catch {
    return [];
  }
  const raw = await readFile(path, "utf8");
  const trimmed = raw.trim();
  if (!trimmed) return [];
  const parsed = JSON.parse(trimmed) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("DIAGNOSTIC: wave-stop-go.v1.json must be a JSON array");
  }
  for (const entry of parsed) {
    validateStopGoRecord(entry as WaveStopGoRecord);
  }
  return parsed as WaveStopGoRecord[];
}

export function hasStopGoForWave(log: WaveStopGoRecord[], waveId: string): boolean {
  return log.some((r) => r.wave_id === waveId);
}

export function latestStopGoForWave(
  log: WaveStopGoRecord[],
  waveId: string,
): WaveStopGoRecord | undefined {
  const matches = log.filter((r) => r.wave_id === waveId);
  if (matches.length === 0) return undefined;
  return matches[matches.length - 1];
}

export async function appendWaveStopGo(
  input: AppendWaveStopGoInput,
  path = DEFAULT_STOP_GO_PATH,
): Promise<{ record: WaveStopGoRecord; log_path: string }> {
  const log = await loadWaveStopGoLog(path);
  const record = buildStopGoRecord(input);
  log.push(record);
  await writeFile(path, `${JSON.stringify(log, null, 2)}\n`, "utf8");
  return { record, log_path: path.replace(`${REPO_ROOT}/`, "") };
}

export { DEFAULT_STOP_GO_PATH };
