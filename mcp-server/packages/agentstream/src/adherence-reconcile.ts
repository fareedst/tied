/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
 * Read-only adherence chain reconciliation (Go ReconcileAdherenceChain parity).
 */
import fs from "node:fs";
import path from "node:path";

import yaml from "js-yaml";

import {
  evidenceRefsFromTrackerStep,
  resolveEvidenceRefsSync,
  type EvidenceRefInput,
} from "./adherence-evidence-resolve.js";
import { fileContentHash, stableHash } from "./adherence-stable-hash.js";

const adherenceEventSchemaVersion = "agent-adherence-event.v1";
const gateReceiptSchemaVersion = "checklist-gate-receipt.v1";

export const findingRenderedWithoutAck = "rendered_without_acknowledgment";
export const findingAcknowledgedWithoutAttempt = "acknowledged_without_attempt";
export const findingAttemptWithoutVerified = "attempt_without_verified_outcome";
export const findingCompletedWithUnresolved = "completed_with_unresolved_evidence";
export const findingGateWithoutCurrentEvidence = "gate_without_current_evidence";
export const findingStatusChangeWithoutReceipt = "status_change_without_verification_receipt";
export const findingLegacyNoAdherenceChain = "legacy_no_adherence_chain";

export type ReconcileFinding = {
  code: string;
  detail?: Record<string, unknown>;
};

export type ReconcileReport = {
  request_token?: string;
  findings: ReconcileFinding[];
  ledger_rows: number;
  read_only: boolean;
  process_grade?: import("./adherence-process-grade.js").ProcessGrade;
};

export type TiedIndexSnapshot = {
  requirements?: Record<string, unknown>;
  implementation?: Record<string, unknown>;
};

export type ReconcileInput = {
  ledgerPath: string;
  trackerPath: string;
  tracker?: Record<string, unknown>;
  citdp?: Record<string, unknown>;
  gatesDir: string;
  workspace: string;
  tiedIndexes?: TiedIndexSnapshot;
  includeProcessGrade?: boolean;
};

export type AdherenceEvent = {
  lineNumber: number;
  raw: Record<string, unknown>;
  eventClass: string;
  correlation: Record<string, unknown>;
};

export function loadTracker(input: ReconcileInput): Record<string, unknown> {
  if (input.tracker) return input.tracker;
  const p = input.trackerPath.trim();
  if (!p) return {};
  const data = fs.readFileSync(p, "utf8");
  const doc = yaml.load(data) as Record<string, unknown>;
  if (!doc || typeof doc !== "object") {
    throw new Error("invalid_tracker");
  }
  return doc;
}

export function trackerRequestToken(tracker: Record<string, unknown>): string {
  const token = tracker.request_token;
  return typeof token === "string" ? token.trim() : "";
}

export function trackerStepsFromMap(tracker: Record<string, unknown>): Record<string, unknown>[] {
  const stepsRaw = tracker.steps;
  if (!Array.isArray(stepsRaw)) return [];
  return stepsRaw.filter(
    (item): item is Record<string, unknown> =>
      typeof item === "object" && item !== null,
  );
}

export function stepDisposition(step: Record<string, unknown>): string {
  if (typeof step.disposition === "string" && step.disposition.trim()) {
    return step.disposition.trim();
  }
  if (typeof step.status === "string" && step.status.trim()) {
    return step.status.trim();
  }
  const tracking = step.tracking;
  if (typeof tracking === "object" && tracking !== null) {
    const tr = tracking as Record<string, unknown>;
    if (typeof tr.status === "string" && tr.status.trim()) return tr.status.trim();
    if (typeof tr.disposition === "string" && tr.disposition.trim()) {
      return tr.disposition.trim();
    }
  }
  return "";
}

function validateAdherenceRow(row: Record<string, unknown>): void {
  const sv = row.schema_version;
  if (typeof sv !== "string" || sv.trim() !== adherenceEventSchemaVersion) {
    throw new Error(`invalid schema_version: ${String(row.schema_version)}`);
  }
  const eventClass = row.event_class;
  if (typeof eventClass !== "string" || !eventClass.trim()) {
    throw new Error("missing_correlation_field: event_class");
  }
  const corr = row.correlation;
  if (typeof corr !== "object" || corr === null) {
    throw new Error("missing_correlation_field: correlation");
  }
  const c = corr as Record<string, unknown>;
  const requireKeys = (keys: string[]) => {
    for (const key of keys) {
      if (!(key in c)) throw new Error(`missing_correlation_field: ${key}`);
    }
  };
  switch (eventClass) {
    case "instruction_rendered":
      requireKeys([
        "request_token",
        "turn_index",
        "step_slug",
        "instruction_hash",
        "instruction_nonce",
      ]);
      break;
    case "agent_acknowledged":
      requireKeys([
        "request_token",
        "turn_index",
        "step_slug",
        "instruction_hash",
        "instruction_nonce",
        "receipt_hash",
      ]);
      break;
    case "action_attempted":
      requireKeys([
        "request_token",
        "turn_index",
        "step_slug",
        "instruction_hash",
        "instruction_nonce",
      ]);
      if (!Array.isArray(row.evidence_refs) || row.evidence_refs.length === 0) {
        throw new Error("missing_correlation_field: evidence_refs");
      }
      break;
    case "outcome_verified":
      requireKeys(["request_token", "turn_index", "step_slug", "receipt_hash"]);
      if (typeof row.artifact_ref !== "string") {
        throw new Error("missing_correlation_field: artifact_ref");
      }
      if (typeof row.artifact_hash !== "string") {
        throw new Error("missing_correlation_field: artifact_hash");
      }
      break;
    case "gate_decided":
      requireKeys(["request_token", "phase"]);
      if (typeof row.artifact_ref !== "string") {
        throw new Error("missing_correlation_field: artifact_ref");
      }
      if (typeof row.artifact_hash !== "string") {
        throw new Error("missing_correlation_field: artifact_hash");
      }
      break;
    case "status_mutated":
      requireKeys(["request_token"]);
      if (typeof row.gate_receipt_ref !== "string") {
        throw new Error("missing_correlation_field: gate_receipt_ref");
      }
      if (typeof row.gate_receipt_hash !== "string") {
        throw new Error("missing_correlation_field: gate_receipt_hash");
      }
      break;
    default:
      throw new Error(`unknown event_class: ${eventClass}`);
  }
}

export function loadAdherenceLedger(ledgerPath: string): {
  events: AdherenceEvent[];
  errors: Error[];
} {
  const data = fs.readFileSync(ledgerPath, "utf8");
  const events: AdherenceEvent[] = [];
  const errors: Error[] = [];
  const lines = data.split("\n");
  let lineNo = 0;
  for (const line of lines) {
    lineNo++;
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const row = JSON.parse(trimmed) as Record<string, unknown>;
      validateAdherenceRow(row);
      const eventClass = String(row.event_class);
      const corr = row.correlation as Record<string, unknown>;
      events.push({
        lineNumber: lineNo,
        raw: row,
        eventClass,
        correlation: corr,
      });
    } catch (err) {
      errors.push(err instanceof Error ? err : new Error(String(err)));
    }
  }
  return { events, errors };
}

function fileExists(p: string): boolean {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function turnCorrelationKey(corr: Record<string, unknown>): string {
  return [
    String(corr.turn_index),
    String(corr.step_slug ?? "").trim(),
    String(corr.instruction_nonce ?? "").trim(),
    String(corr.instruction_hash ?? "").trim(),
  ].join("|");
}

function attemptCorrelationKey(corr: Record<string, unknown>): string {
  return [
    String(corr.turn_index),
    String(corr.step_slug ?? "").trim(),
    String(corr.receipt_hash ?? "").trim(),
  ].join("|");
}

function liveAttemptCorrelationKey(corr: Record<string, unknown>): string {
  return [
    String(corr.turn_index),
    String(corr.step_slug ?? "").trim(),
    String(corr.instruction_nonce ?? "").trim(),
    String(corr.instruction_hash ?? "").trim(),
  ].join("|");
}

function reconcileInstructionAck(events: AdherenceEvent[]): ReconcileFinding[] {
  const acks = new Set<string>();
  for (const ev of events) {
    if (ev.eventClass !== "agent_acknowledged") continue;
    acks.add(turnCorrelationKey(ev.correlation));
  }
  const out: ReconcileFinding[] = [];
  for (const ev of events) {
    if (ev.eventClass !== "instruction_rendered") continue;
    if (acks.has(turnCorrelationKey(ev.correlation))) continue;
    out.push({
      code: findingRenderedWithoutAck,
      detail: {
        turn_index: ev.correlation.turn_index,
        step_slug: ev.correlation.step_slug,
        instruction_nonce: ev.correlation.instruction_nonce,
        line: ev.lineNumber,
      },
    });
  }
  return out;
}

function stringListField(step: Record<string, unknown>, key: string): string[] {
  const raw = step[key];
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is string => typeof item === "string")
    .map((s) => s.trim())
    .filter(Boolean);
}

function trackerStepEvidenceRefs(tracker: Record<string, unknown>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const step of trackerStepsFromMap(tracker)) {
    const slug = typeof step.slug === "string" ? step.slug : "";
    if (!slug) continue;
    out[slug] = stringListField(step, "evidence_refs");
  }
  return out;
}

function indexActionAttempts(events: AdherenceEvent[]): Record<string, Record<string, boolean>> {
  const out: Record<string, Record<string, boolean>> = {};
  for (const ev of events) {
    if (ev.eventClass !== "action_attempted") continue;
    const keys = [liveAttemptCorrelationKey(ev.correlation)];
    const receipt = String(ev.correlation.receipt_hash ?? "").trim();
    if (receipt && receipt !== "undefined") {
      keys.push(attemptCorrelationKey(ev.correlation));
    }
    const refs = ev.raw.evidence_refs;
    if (!Array.isArray(refs)) continue;
    for (const key of keys) {
      if (!out[key]) out[key] = {};
      for (const item of refs) {
        if (typeof item === "string" && item.trim()) {
          out[key][item.trim()] = true;
        }
      }
    }
  }
  return out;
}

function reconcileAckAttempt(
  tracker: Record<string, unknown>,
  events: AdherenceEvent[],
): ReconcileFinding[] {
  const stepEvidence = trackerStepEvidenceRefs(tracker);
  const attempts = indexActionAttempts(events);
  const out: ReconcileFinding[] = [];
  for (const ev of events) {
    if (ev.eventClass !== "agent_acknowledged") continue;
    const slug = String(ev.correlation.step_slug ?? "");
    const refs = stepEvidence[slug] ?? [];
    if (refs.length === 0) continue;
    const key = liveAttemptCorrelationKey(ev.correlation);
    let covered = attempts[key];
    if (!covered) covered = attempts[attemptCorrelationKey(ev.correlation)];
    for (const ref of refs) {
      if (!covered?.[ref]) {
        out.push({
          code: findingAcknowledgedWithoutAttempt,
          detail: {
            turn_index: ev.correlation.turn_index,
            step_slug: slug,
            evidence_ref: ref,
            line: ev.lineNumber,
          },
        });
      }
    }
  }
  return out;
}

function indexOutcomeVerified(events: AdherenceEvent[]): Record<string, Record<string, boolean>> {
  const out: Record<string, Record<string, boolean>> = {};
  for (const ev of events) {
    if (ev.eventClass !== "outcome_verified") continue;
    const key = attemptCorrelationKey(ev.correlation);
    if (!out[key]) out[key] = {};
    const artifactRef = String(ev.raw.artifact_ref ?? "").trim();
    if (artifactRef) out[key][artifactRef] = true;
  }
  return out;
}

function reconcileAttemptOutcome(events: AdherenceEvent[]): ReconcileFinding[] {
  const verified = indexOutcomeVerified(events);
  const out: ReconcileFinding[] = [];
  for (const ev of events) {
    if (ev.eventClass !== "action_attempted") continue;
    const key = attemptCorrelationKey(ev.correlation);
    const refs = ev.raw.evidence_refs;
    if (!Array.isArray(refs)) continue;
    for (const item of refs) {
      if (typeof item !== "string") continue;
      const ref = item.trim();
      if (!ref) continue;
      if (verified[key]?.[ref]) continue;
      out.push({
        code: findingAttemptWithoutVerified,
        detail: {
          turn_index: ev.correlation.turn_index,
          step_slug: ev.correlation.step_slug,
          evidence_ref: ref,
          line: ev.lineNumber,
        },
      });
    }
  }
  return out;
}

function reconcileCompletedEvidence(
  tracker: Record<string, unknown>,
  workspace: string,
): ReconcileFinding[] {
  if (!workspace.trim()) return [];
  const out: ReconcileFinding[] = [];
  for (const step of trackerStepsFromMap(tracker)) {
    const disposition = stepDisposition(step);
    if (disposition !== "completed") continue;
    const slug = typeof step.slug === "string" ? step.slug : "";
    const refs = evidenceRefsFromTrackerStep(step);
    if (refs.length === 0) continue;
    try {
      resolveEvidenceRefsSync(
        {
          slug,
          disposition: "completed",
          evidenceRefs: refs as EvidenceRefInput[],
        },
        workspace,
      );
    } catch (err) {
      out.push({
        code: findingCompletedWithUnresolved,
        detail: {
          step_slug: slug,
          error: err instanceof Error ? err.message : String(err),
        },
      });
    }
  }
  return out;
}

function reconcileGateEvidence(
  gatesDir: string,
  tracker: Record<string, unknown>,
  citdp: Record<string, unknown>,
  events: AdherenceEvent[],
): ReconcileFinding[] {
  if (!gatesDir.trim()) return [];
  const currentTrackerHash = `sha256:${stableHash(tracker)}`;
  const currentCitdpHash = `sha256:${stableHash(citdp)}`;
  const out: ReconcileFinding[] = [];

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(gatesDir, { withFileTypes: true });
  } catch {
    return [];
  }

  for (const entry of entries) {
    if (entry.isDirectory() || !entry.name.endsWith(".json")) continue;
    const gatePath = path.join(gatesDir, entry.name);
    let receipt: Record<string, unknown>;
    try {
      receipt = JSON.parse(fs.readFileSync(gatePath, "utf8")) as Record<string, unknown>;
    } catch {
      continue;
    }
    if (receipt.schema_version !== gateReceiptSchemaVersion) continue;
    const inputHashes = receipt.input_hashes as Record<string, unknown> | undefined;
    const trackerHash = String(inputHashes?.tracker_hash ?? "");
    const citdpHash = String(inputHashes?.citdp_hash ?? "");
    if (trackerHash !== currentTrackerHash || citdpHash !== currentCitdpHash) {
      out.push({
        code: findingGateWithoutCurrentEvidence,
        detail: {
          gate_receipt: gatePath,
          stored_tracker_hash: trackerHash,
          current_tracker_hash: currentTrackerHash,
          stored_citdp_hash: citdpHash,
          current_citdp_hash: currentCitdpHash,
        },
      });
    }
  }

  for (const ev of events) {
    if (ev.eventClass !== "gate_decided") continue;
    const artifactRef = String(ev.raw.artifact_ref ?? "");
    const artifactHash = String(ev.raw.artifact_hash ?? "");
    if (!artifactRef) continue;
    let data: Buffer;
    try {
      data = fs.readFileSync(artifactRef);
    } catch {
      out.push({
        code: findingGateWithoutCurrentEvidence,
        detail: {
          gate_decided_line: ev.lineNumber,
          artifact_ref: artifactRef,
          error: "missing_gate_receipt_file",
        },
      });
      continue;
    }
    const computed = fileContentHash(data);
    if (artifactHash && artifactHash !== computed) {
      out.push({
        code: findingGateWithoutCurrentEvidence,
        detail: {
          gate_decided_line: ev.lineNumber,
          artifact_ref: artifactRef,
          stored_hash: artifactHash,
          computed_hash: computed,
        },
      });
    }
  }
  return out;
}

function reconcileStatusMutations(
  indexes: TiedIndexSnapshot,
  events: AdherenceEvent[],
): ReconcileFinding[] {
  const mutated: Record<
    string,
    {
      next_status: string;
      gate_receipt_ref: string;
      gate_receipt_hash: string;
      line: number;
    }
  > = {};

  for (const ev of events) {
    if (ev.eventClass !== "status_mutated") continue;
    const gateRef = String(ev.raw.gate_receipt_ref ?? "").trim();
    const gateHash = String(ev.raw.gate_receipt_hash ?? "").trim();
    if (!gateRef || !gateHash) continue;
    const mutations = ev.raw.status_mutations;
    if (!Array.isArray(mutations)) continue;
    for (const item of mutations) {
      if (typeof item !== "object" || item === null) continue;
      const row = item as Record<string, unknown>;
      const token = String(row.token ?? "");
      const indexName = String(row.index ?? "");
      const nextStatus = String(row.next_status ?? "");
      if (!token) continue;
      const key = `${indexName}:${token}`;
      mutated[key] = {
        next_status: nextStatus,
        gate_receipt_ref: gateRef,
        gate_receipt_hash: gateHash,
        line: ev.lineNumber,
      };
    }
  }

  const out: ReconcileFinding[] = [];
  const checkIndex = (indexName: string, records: Record<string, unknown> | undefined) => {
    if (!records) return;
    for (const [token, raw] of Object.entries(records)) {
      if (typeof raw !== "object" || raw === null) continue;
      const rec = raw as Record<string, unknown>;
      let status = typeof rec.status === "string" ? rec.status.trim() : "";
      if (!status || status === "Planned" || status === "Draft") continue;
      const key = `${indexName}:${token}`;
      const m = mutated[key];
      if (!m) {
        out.push({
          code: findingStatusChangeWithoutReceipt,
          detail: { index: indexName, token, status },
        });
        continue;
      }
      if (m.next_status && m.next_status !== status) {
        out.push({
          code: findingStatusChangeWithoutReceipt,
          detail: {
            index: indexName,
            token,
            index_status: status,
            ledger_next_status: m.next_status,
            ledger_line: m.line,
          },
        });
      }
      if (m.gate_receipt_ref) {
        try {
          const data = fs.readFileSync(m.gate_receipt_ref);
          const computed = fileContentHash(data);
          if (m.gate_receipt_hash && m.gate_receipt_hash !== computed) {
            out.push({
              code: findingStatusChangeWithoutReceipt,
              detail: {
                index: indexName,
                token,
                gate_receipt_ref: m.gate_receipt_ref,
                stored_hash: m.gate_receipt_hash,
                computed_hash: computed,
              },
            });
          }
        } catch {
          out.push({
            code: findingStatusChangeWithoutReceipt,
            detail: {
              index: indexName,
              token,
              gate_receipt_ref: m.gate_receipt_ref,
              error: "missing_gate_receipt_file",
            },
          });
        }
      }
    }
  };

  checkIndex("requirements", indexes.requirements);
  checkIndex("implementation", indexes.implementation);
  return out;
}

export function reconcileAdherenceChain(input: ReconcileInput): ReconcileReport {
  const report: ReconcileReport = {
    read_only: true,
    findings: [],
    ledger_rows: 0,
  };

  const tracker = loadTracker(input);
  const citdp = input.citdp ?? {};
  const requestToken = trackerRequestToken(tracker);

  const ledgerPath = input.ledgerPath.trim();
  if (!ledgerPath || !fileExists(ledgerPath)) {
    report.findings.push({
      code: findingLegacyNoAdherenceChain,
      detail: { ledger_path: ledgerPath },
    });
    return report;
  }

  const { events, errors } = loadAdherenceLedger(ledgerPath);
  for (const loadErr of errors) {
    report.findings.push({
      code: "malformed_ledger_row",
      detail: { error: loadErr.message },
    });
  }
  report.ledger_rows = events.length;
  report.request_token = requestToken;

  report.findings.push(...reconcileInstructionAck(events));
  report.findings.push(...reconcileAckAttempt(tracker, events));
  report.findings.push(...reconcileAttemptOutcome(events));
  report.findings.push(...reconcileCompletedEvidence(tracker, input.workspace));
  report.findings.push(
    ...reconcileGateEvidence(input.gatesDir, tracker, citdp, events),
  );
  report.findings.push(
    ...reconcileStatusMutations(input.tiedIndexes ?? {}, events),
  );

  return report;
}
