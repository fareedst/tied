/**
 * Verification-gated status update: set REQ/IMPL status from test results.
 * [PROC-TIED_VERIFICATION_GATED]
 */

import { loadIndex, updateRecord } from "./yaml-loader.js";
import { formatYamlMetadata, type YamlFormatMetadata } from "./yaml-canonicalizer.js";
import { validateChecklistGate, type GatePhase } from "./checklist-validator.js";
import {
  persistGateDecisionReceipt,
  persistStatusMutationReceipt,
  type GateValidationResult,
} from "./gate-receipt.js";

const REQ_IMPLEMENTED_STATUS = "Implemented";
const REQ_PLANNED_STATUS = "Planned";
const IMPL_ACTIVE_STATUS = "Active";
const IMPL_PLANNED_STATUS = "Planned";

export interface VerifyUpdateOptions {
  /** REQ tokens that have passing tests; their status will be set to Implemented */
  passed_requirement_tokens?: string[];
  /** IMPL tokens that have passing tests; their status will be set to Active */
  passed_impl_tokens?: string[];
  /** If true, REQs not in passed_requirement_tokens will be set to Planned (default: false) */
  set_unpassed_reqs_to_planned?: boolean;
  /** If true, IMPLs not in passed_impl_tokens will be set to Planned (default: false) */
  set_unpassed_impl_to_planned?: boolean;
  /** If true, do not write; return would_update with planned index changes only */
  dry_run?: boolean;
  /** Shared fail-closed process evidence gate for verification/close-out updates. */
  checklist_gate?: {
    phase: GatePhase;
    tracker: unknown;
    citdp: unknown;
    requiredStepSlugs?: readonly string[];
    activation?: {
      receipt?: unknown;
      artifacts?: unknown;
      expected?: {
        request_token: string;
        project_id: string;
        run_id: string;
        phase: GatePhase;
        scope: string[];
        scope_hash: string;
      };
    };
  };
  /** @deprecated Gate evidence is required for every status update. */
  require_checklist_gate?: boolean;
  /** Optional durable receipt persistence for gate and status mutation (Stage J). */
  receipt_persistence?: {
    request_token: string;
    gates_dir: string;
    ledger_path: string;
    run_id?: string;
    /** When gate receipt already persisted, skip gate write and use this ref for status mutation. */
    gate_receipt_ref?: string;
    gate_receipt_hash?: string;
    /** Persist gate decision receipt (default true when receipt_persistence is set). */
    persist_gate?: boolean;
  };
}

/** One index row that would change when dry_run is true */
export interface VerifyDryRunChange {
  index: "requirements" | "implementation";
  token: string;
  previous_status: string | undefined;
  next_status: string;
}

export interface VerifyUpdateResult {
  ok: boolean;
  error?: string;
  dry_run?: boolean;
  /** When dry_run is true: index rows that would receive a new status */
  would_update?: VerifyDryRunChange[];
  requirements_updated?: number;
  implementation_updated?: number;
  requirements_set_implemented?: string[];
  requirements_set_planned?: string[];
  implementation_set_active?: string[];
  implementation_set_planned?: string[];
  yaml_format?: YamlFormatMetadata;
  diagnostics?: string[];
  /** Persisted gate receipt path when receipt_persistence is enabled. */
  gate_receipt?: { path: string; hash: string };
  /** Whether status_mutated ledger row was appended. */
  status_mutation_receipt?: boolean;
}

function collectVerifyChanges(options: VerifyUpdateOptions): VerifyDryRunChange[] {
  const {
    passed_requirement_tokens = [],
    passed_impl_tokens = [],
    set_unpassed_reqs_to_planned = false,
    set_unpassed_impl_to_planned = false,
  } = options;

  const reqImplemented = new Set(passed_requirement_tokens.filter((t) => t.startsWith("REQ-")));
  const implActive = new Set(passed_impl_tokens.filter((t) => t.startsWith("IMPL-")));

  const changes: VerifyDryRunChange[] = [];

  const reqData = loadIndex("requirements");
  if (reqData) {
    for (const token of Object.keys(reqData)) {
      if (token.startsWith("#") || !token.startsWith("REQ-")) continue;
      const record = reqData[token];
      if (typeof record !== "object" || record === null) continue;
      const status = (record as { status?: string }).status;
      if (reqImplemented.has(token)) {
        if (status !== REQ_IMPLEMENTED_STATUS) {
          changes.push({
            index: "requirements",
            token,
            previous_status: status,
            next_status: REQ_IMPLEMENTED_STATUS,
          });
        }
      } else if (set_unpassed_reqs_to_planned && status !== REQ_PLANNED_STATUS) {
        changes.push({
          index: "requirements",
          token,
          previous_status: status,
          next_status: REQ_PLANNED_STATUS,
        });
      }
    }
  }

  const implData = loadIndex("implementation");
  if (implData) {
    for (const token of Object.keys(implData)) {
      if (token.startsWith("#") || !token.startsWith("IMPL-")) continue;
      const record = implData[token];
      if (typeof record !== "object" || record === null) continue;
      const status = (record as { status?: string }).status;
      if (implActive.has(token)) {
        if (status !== IMPL_ACTIVE_STATUS) {
          changes.push({
            index: "implementation",
            token,
            previous_status: status,
            next_status: IMPL_ACTIVE_STATUS,
          });
        }
      } else if (set_unpassed_impl_to_planned && status !== IMPL_PLANNED_STATUS) {
        changes.push({
          index: "implementation",
          token,
          previous_status: status,
          next_status: IMPL_PLANNED_STATUS,
        });
      }
    }
  }

  return changes;
}

/**
 * Update requirement and optionally implementation index status from passed tokens.
 * Use after running tests and collecting which REQ/IMPL tokens are covered by passing tests.
 */
export function updateStatusFromPassedTokens(options: VerifyUpdateOptions): VerifyUpdateResult {
  const {
    passed_requirement_tokens = [],
    passed_impl_tokens = [],
    set_unpassed_reqs_to_planned = false,
    set_unpassed_impl_to_planned = false,
    dry_run = false,
  } = options;

  // [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: select depth before evaluating phase gates and fail closed on invalid evidence.
  if (!options.checklist_gate) {
    return {
      ok: false,
      error: "CHECKLIST_GATE_BLOCKED: missing checklist gate evidence",
      diagnostics: ["missing_checklist_gate"],
    };
  }
  const gate = validateChecklistGate(options.checklist_gate);
  if (!gate.allowed) {
    return {
      ok: false,
      error: "CHECKLIST_GATE_BLOCKED: process evidence did not satisfy the selected gate",
      diagnostics: gate.diagnostics,
    };
  }

  let gateReceiptRef = options.receipt_persistence?.gate_receipt_ref;
  let gateReceiptHash = options.receipt_persistence?.gate_receipt_hash;
  let gateReceiptPath: string | undefined;

  if (options.receipt_persistence) {
    const persistGate = options.receipt_persistence.persist_gate !== false;
    if (persistGate && !gateReceiptRef) {
      const persisted = persistGateDecisionReceipt({
        gateResult: gate as GateValidationResult,
        phase: options.checklist_gate.phase,
        tracker: options.checklist_gate.tracker,
        citdp: options.checklist_gate.citdp,
        gatesDir: options.receipt_persistence.gates_dir,
        ledgerPath: options.receipt_persistence.ledger_path,
        requestToken: options.receipt_persistence.request_token,
        runId: options.receipt_persistence.run_id,
      });
      if (!persisted.ok) {
        return {
          ok: false,
          error: `GATE_RECEIPT_BLOCKED: ${persisted.error}`,
          diagnostics: persisted.diagnostics,
        };
      }
      gateReceiptRef = persisted.path;
      gateReceiptHash = persisted.hash;
      gateReceiptPath = persisted.path;
    }
  }

  const wouldUpdate = collectVerifyChanges(options);

  if (dry_run) {
    let statusMutationReceipt = false;

    if (options.receipt_persistence && wouldUpdate.length > 0) {
      if (!gateReceiptRef || !gateReceiptHash) {
        return {
          ok: false,
          error: "GATE_RECEIPT_BLOCKED: missing_gate_receipt_ref",
          diagnostics: ["missing_gate_receipt_ref"],
        };
      }
      const mutationReceipt = persistStatusMutationReceipt({
        ledgerPath: options.receipt_persistence.ledger_path,
        requestToken: options.receipt_persistence.request_token,
        phase: options.checklist_gate.phase,
        runId: options.receipt_persistence.run_id,
        mutations: wouldUpdate,
        gateReceiptRef,
        gateReceiptHash,
        mutationApplied: false,
      });
      if (!mutationReceipt.ok) {
        return {
          ok: false,
          error: `STATUS_RECEIPT_BLOCKED: ${mutationReceipt.error}`,
          diagnostics: mutationReceipt.diagnostics,
        };
      }
      statusMutationReceipt = true;
    }

    return {
      ok: true,
      dry_run: true,
      would_update: wouldUpdate,
      requirements_updated: 0,
      implementation_updated: 0,
      requirements_set_implemented: [],
      requirements_set_planned: [],
      implementation_set_active: [],
      implementation_set_planned: [],
      ...(gateReceiptPath && gateReceiptHash
        ? { gate_receipt: { path: gateReceiptPath, hash: gateReceiptHash } }
        : {}),
      ...(statusMutationReceipt ? { status_mutation_receipt: true } : {}),
    };
  }

  if (options.receipt_persistence && wouldUpdate.length > 0) {
    if (!gateReceiptRef || !gateReceiptHash) {
      return {
        ok: false,
        error: "GATE_RECEIPT_BLOCKED: missing_gate_receipt_ref",
        diagnostics: ["missing_gate_receipt_ref"],
      };
    }
  }

  const reqImplemented = new Set(passed_requirement_tokens.filter((t) => t.startsWith("REQ-")));
  const implActive = new Set(passed_impl_tokens.filter((t) => t.startsWith("IMPL-")));

  const requirements_set_implemented: string[] = [];
  const requirements_set_planned: string[] = [];
  const implementation_set_active: string[] = [];
  const implementation_set_planned: string[] = [];

  const reqData = loadIndex("requirements");
  if (reqData) {
    for (const token of Object.keys(reqData)) {
      if (token.startsWith("#") || !token.startsWith("REQ-")) continue;
      const record = reqData[token];
      if (typeof record !== "object" || record === null) continue;
      if (reqImplemented.has(token)) {
        const res = updateRecord("requirements", token, { status: REQ_IMPLEMENTED_STATUS });
        if (res.ok) requirements_set_implemented.push(token);
        else return { ok: false, error: res.error };
      } else if (set_unpassed_reqs_to_planned) {
        const res = updateRecord("requirements", token, { status: REQ_PLANNED_STATUS });
        if (res.ok) requirements_set_planned.push(token);
        else return { ok: false, error: res.error };
      }
    }
  }

  const implData = loadIndex("implementation");
  if (implData) {
    for (const token of Object.keys(implData)) {
      if (token.startsWith("#") || !token.startsWith("IMPL-")) continue;
      const record = implData[token];
      if (typeof record !== "object" || record === null) continue;
      if (implActive.has(token)) {
        const res = updateRecord("implementation", token, { status: IMPL_ACTIVE_STATUS });
        if (res.ok) implementation_set_active.push(token);
        else return { ok: false, error: res.error };
      } else if (set_unpassed_impl_to_planned) {
        const res = updateRecord("implementation", token, { status: IMPL_PLANNED_STATUS });
        if (res.ok) implementation_set_planned.push(token);
        else return { ok: false, error: res.error };
      }
    }
  }

  let statusMutationReceipt = false;
  if (options.receipt_persistence && wouldUpdate.length > 0 && gateReceiptRef && gateReceiptHash) {
    const mutationReceipt = persistStatusMutationReceipt({
      ledgerPath: options.receipt_persistence.ledger_path,
      requestToken: options.receipt_persistence.request_token,
      phase: options.checklist_gate.phase,
      runId: options.receipt_persistence.run_id,
      mutations: wouldUpdate,
      gateReceiptRef,
      gateReceiptHash,
      mutationApplied: true,
    });
    if (!mutationReceipt.ok) {
      return {
        ok: false,
        error: `STATUS_RECEIPT_BLOCKED: ${mutationReceipt.error}`,
        diagnostics: mutationReceipt.diagnostics,
      };
    }
    statusMutationReceipt = true;
  }

  return {
    ok: true,
    requirements_updated: requirements_set_implemented.length + requirements_set_planned.length,
    implementation_updated: implementation_set_active.length + implementation_set_planned.length,
    requirements_set_implemented,
    requirements_set_planned,
    implementation_set_active,
    implementation_set_planned,
    yaml_format: formatYamlMetadata(),
    ...(gateReceiptPath && gateReceiptHash
      ? { gate_receipt: { path: gateReceiptPath, hash: gateReceiptHash } }
      : {}),
    ...(statusMutationReceipt ? { status_mutation_receipt: true } : {}),
  };
}
