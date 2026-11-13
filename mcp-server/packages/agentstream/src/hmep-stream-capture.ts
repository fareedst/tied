/**
 * [IMPL-WF_TRIAL_RANGE_HMEP_AUTO_INGEST] [ARCH-WF_TRIAL_RANGE_HMEP_AUTO_INGEST] [REQ-WF_TRIAL_RANGE_HMEP_AUTO_INGEST]
 * Persist agent stream-json NDJSON for HMEP import (WF_TRIAL_HMEP_CAPTURE).
 */
import fs from "node:fs";
import path from "node:path";

const ORCH_EVIDENCE_REL = path.join(
  "tied-project",
  "working",
  "wf-trial-orchestrator-run",
  "evidence",
  "stream-json",
);

function envTruthy(name: string): boolean {
  const v = process.env[name]?.trim();
  return v === "1" || v === "true";
}

export function hmepStreamCaptureSkipped(): boolean {
  return envTruthy("WF_TRIAL_SKIP_HMEP_CAPTURE");
}

/** [WF_TRIAL_HMEP_CAPTURE_ENABLED] */
export function hmepStreamCaptureEnabled(): boolean {
  if (hmepStreamCaptureSkipped()) {
    return false;
  }
  return envTruthy("WF_TRIAL_HMEP_CAPTURE") || envTruthy("AGENTSTREAM_HMEP_STREAM_CAPTURE");
}

/** [RESOLVE_HMEP_STREAM_JSON_PATH] */
export function resolveHmepStreamJsonPath(workspace: string, turnIndex: number): string {
  const ws = workspace.trim();
  if (ws === "") {
    throw new Error("DEBUG: hmep capture workspace required");
  }
  const idx = Math.max(1, Math.floor(turnIndex));
  const file = `turn-${String(idx).padStart(3, "0")}.jsonl`;
  return path.join(ws, ORCH_EVIDENCE_REL, file);
}

/** [APPEND_HMEP_STREAM_JSON_LINE] */
export function appendHmepStreamJsonLine(workspace: string, turnIndex: number, line: string): void {
  if (!hmepStreamCaptureEnabled()) {
    return;
  }
  const trimmed = line.trim();
  if (trimmed === "") {
    return;
  }
  try {
    const outPath = resolveHmepStreamJsonPath(workspace, turnIndex);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.appendFileSync(outPath, `${trimmed}\n`, "utf8");
  } catch (err) {
    process.stderr.write(
      `DIAGNOSTIC: hmep_stream_capture append failed: ${(err as Error).message}\n`,
    );
  }
}

export function readHmepCaptureTurnFromEnv(): number | null {
  const raw = (process.env.AGENTSTREAM_HMEP_CAPTURE_TURN_INDEX ?? "").trim();
  if (raw === "") {
    return null;
  }
  const n = Number(raw);
  if (Number.isNaN(n) || n < 1) {
    return null;
  }
  return Math.floor(n);
}

export function readHmepCaptureWorkspaceFromEnv(): string {
  return (process.env.AGENTSTREAM_HMEP_CAPTURE_WORKSPACE ?? "").trim();
}

/** Append when capture on and env workspace/turn set (subprocess drivers). */
export function appendHmepStreamJsonLineFromEnv(line: string): void {
  if (!hmepStreamCaptureEnabled()) {
    return;
  }
  const workspace = readHmepCaptureWorkspaceFromEnv();
  const turnIndex = readHmepCaptureTurnFromEnv();
  if (workspace === "" || turnIndex === null) {
    return;
  }
  appendHmepStreamJsonLine(workspace, turnIndex, line);
}
