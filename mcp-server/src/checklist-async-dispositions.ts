/**
 * [IMPL-ASYNC_CHECKLIST_DISPOSITIONS] [ARCH-ASYNC_CHECKLIST_INTEGRATION] [REQ-ASYNC_CHECKLIST_CATALOG]
 * Checklist async catalog table validation, contradiction routing, and async_in_scope Tracker disposition.
 */
import { parseContractFields, scanProcedureBlocks } from "./analysis/pseudocode-shared.js";

export const ASYNC_CATALOG_COLUMNS = [
  "Block",
  "Boundary kind",
  "Await/message/event",
  "Timeout",
  "Cancellation",
  "Retry/idempotency",
  "Shared DATA",
  "Termination/order",
] as const;

export type AsyncCatalogColumn = (typeof ASYNC_CATALOG_COLUMNS)[number];

export type AsyncCatalogRow = Record<AsyncCatalogColumn, string>;

export type AsyncSemanticClass =
  | "await_sequencing"
  | "message_event_delivery"
  | "cancellation"
  | "timeout"
  | "retry_idempotency"
  | "shared_data"
  | "termination";

export type AsyncContradictionCode =
  | "AWAIT_WITHOUT_ASYNC_EFFECTS"
  | "SEQUENCING_CONTROL_MISMATCH"
  | "MESSAGE_DELIVERY_MISMATCH"
  | "RETRY_WITHOUT_IDEMPOTENCY"
  | "OPEN_WAIT_WITHOUT_TERMINATION"
  | "REQ_TIMEOUT_NOT_IN_IMPL"
  | "ASYNC_EFFECTS_WITHOUT_BOUNDARY";

export type AsyncDispositionFinding = {
  code: AsyncContradictionCode | "ASYNC_CATALOG_ROW_MISSING" | "ASYNC_CATALOG_COLUMN_MISSING";
  severity: "error" | "warning";
  block?: string;
  message: string;
  route_to: "resolve-pseudocode" | "catalog-async-boundaries" | "flag-async-contradictions";
  semantic_class?: AsyncSemanticClass;
};

export type AsyncCatalogValidationResult = {
  ok: boolean;
  async_in_scope: boolean;
  matched_semantic_classes: AsyncSemanticClass[];
  findings: AsyncDispositionFinding[];
};

export type AsyncInScopeTrackerValidation = {
  ok: boolean;
  diagnostics: string[];
};

const ASYNC_MARKER_PATTERN =
  /\bAWAIT\b|\bSEND\b|Promise|Async|EFFECTS:\s*[^\n]*\bAsync\b|TERMINATION:\s*may_diverge|ASYNC_BOUNDARY:/i;

const ASYNC_OPTIONAL_ROW_PATTERN =
  /^\s*(ASYNC_BOUNDARY|TIMEOUT|CANCELLATION|SEQUENCING|MESSAGE_CONTRACT|RETRY|IDEMPOTENCY)\s*:/i;

function linesOf(source: string): string[] {
  return source.split(/\r?\n/);
}

function blockBody(lines: readonly string[], start: number, end: number): string {
  return lines.slice(start, end).join("\n");
}

function hasAsyncBoundary(body: string): boolean {
  return /\bAWAIT\b|\bSEND\b|Promise|ASYNC_BOUNDARY:/i.test(body);
}

function hasOpenWait(body: string): boolean {
  return /\bWHILE\b|open wait|subscription|FOR each.*line/i.test(body)
    && !/TERMINATION:\s*(total|may_diverge)/i.test(body);
}

function classifySemanticClasses(source: string): AsyncSemanticClass[] {
  const classes = new Set<AsyncSemanticClass>();
  if (/\bAWAIT\b|SEQUENCING:|CONTROL:\s*ordering/i.test(source)) {
    classes.add("await_sequencing");
  }
  if (/\bSEND\b|MESSAGE_CONTRACT:|ON\s+|WHEN\s+/i.test(source)) {
    classes.add("message_event_delivery");
  }
  if (/CANCELLATION:/i.test(source)) classes.add("cancellation");
  if (/TIMEOUT:/i.test(source)) classes.add("timeout");
  if (/RETRY:|IDEMPOTENCY:/i.test(source)) classes.add("retry_idempotency");
  if (/DATA:|DATA_TRANSITION:/i.test(source) && /\bAWAIT\b|SEND/i.test(source)) {
    classes.add("shared_data");
  }
  if (/TERMINATION:|may_diverge|unsubscribe|close/i.test(source)) {
    classes.add("termination");
  }
  return [...classes].sort();
}

function emptyCatalogRow(block: string): AsyncCatalogRow {
  return Object.fromEntries(
    ASYNC_CATALOG_COLUMNS.map((column) => [column, column === "Block" ? block : ""]),
  ) as AsyncCatalogRow;
}

function missingColumns(row: AsyncCatalogRow): AsyncCatalogColumn[] {
  return ASYNC_CATALOG_COLUMNS.filter((column) => !row[column]?.trim());
}

function rowIsClosed(row: AsyncCatalogRow): boolean {
  return missingColumns(row).length === 0;
}

/**
 * [IMPL-ASYNC_CHECKLIST_DISPOSITIONS] [REQ-ASYNC_CHECKLIST_CATALOG] — How: detect async markers for impact-discovery async_in_scope.
 */
export function detectAsyncInScope(source: string): {
  async_in_scope: boolean;
  matched_semantic_classes: AsyncSemanticClass[];
} {
  const async_in_scope = ASYNC_MARKER_PATTERN.test(source);
  return {
    async_in_scope,
    matched_semantic_classes: async_in_scope ? classifySemanticClasses(source) : [],
  };
}

/**
 * [IMPL-ASYNC_CHECKLIST_DISPOSITIONS] [REQ-ASYNC_CHECKLIST_CATALOG] — How: require one closed catalog row per async-marked block.
 */
export function validateAsyncCatalogTable(input: {
  pseudocode: string;
  catalog_rows?: AsyncCatalogRow[];
}): AsyncCatalogValidationResult {
  const lines = linesOf(input.pseudocode);
  const ranges = scanProcedureBlocks(lines);
  const asyncBlocks = ranges.filter((range) => hasAsyncBoundary(blockBody(lines, range.start, range.end)));
  const scope = detectAsyncInScope(input.pseudocode);
  const findings: AsyncDispositionFinding[] = [];
  const rowsByBlock = new Map((input.catalog_rows ?? []).map((row) => [row.Block.trim(), row]));

  if (!scope.async_in_scope) {
    return { ok: true, async_in_scope: false, matched_semantic_classes: [], findings: [] };
  }

  for (const block of asyncBlocks) {
    const row = rowsByBlock.get(block.name);
    if (!row) {
      findings.push({
        code: "ASYNC_CATALOG_ROW_MISSING",
        severity: "error",
        block: block.name,
        message: `Async block ${block.name} requires one closed catalog row per catalog-async-boundaries.`,
        route_to: "catalog-async-boundaries",
      });
      continue;
    }
    for (const column of missingColumns(row)) {
      findings.push({
        code: "ASYNC_CATALOG_COLUMN_MISSING",
        severity: "error",
        block: block.name,
        message: `Catalog row for ${block.name} missing column ${column}.`,
        route_to: "catalog-async-boundaries",
      });
    }
    if (rowIsClosed(row)) {
      continue;
    }
  }

  return {
    ok: findings.length === 0,
    async_in_scope: true,
    matched_semantic_classes: scope.matched_semantic_classes,
    findings,
  };
}

/**
 * [IMPL-ASYNC_CHECKLIST_DISPOSITIONS] [REQ-ASYNC_CHECKLIST_CATALOG] — How: deterministic async contradiction flags with resolve-pseudocode routing.
 */
export function detectAsyncContradictions(input: {
  pseudocode: string;
  req_declares_timeout?: boolean;
  typed_evidence_available?: boolean;
  caller_pseudocode?: string;
  callee_pseudocode?: string;
  phase?: "phase_b" | "verification";
}): AsyncDispositionFinding[] {
  const findings: AsyncDispositionFinding[] = [];
  const lines = linesOf(input.pseudocode);
  const ranges = scanProcedureBlocks(lines);

  for (const range of ranges) {
    const body = blockBody(lines, range.start, range.end);
    const fields = parseContractFields(lines.slice(range.start, range.end));
    const hasAwait = /\bAWAIT\b/.test(body);
    const hasSend = /\bSEND\b/.test(body);
    const hasPromiseOutput = /OUTPUT:[^\n]*Promise/i.test(body);
    const hasAsyncEffects = /EFFECTS:[^\n]*\bAsync\b/i.test(body);
    const hasBoundaryRationale = hasAwait || hasSend || hasPromiseOutput || /ASYNC_BOUNDARY:/i.test(body);

    if (input.typed_evidence_available && hasAwait && !hasPromiseOutput && !hasAsyncEffects) {
      findings.push({
        code: "AWAIT_WITHOUT_ASYNC_EFFECTS",
        severity: "error",
        block: range.name,
        message: `${range.name}: AWAIT present but OUTPUT is not Promise-typed and EFFECTS omits Async when typed evidence is available.`,
        route_to: "flag-async-contradictions",
        semantic_class: "await_sequencing",
      });
    }

    if (hasAsyncEffects && !hasBoundaryRationale) {
      findings.push({
        code: "ASYNC_EFFECTS_WITHOUT_BOUNDARY",
        severity: "error",
        block: range.name,
        message: `${range.name}: Async in EFFECTS without AWAIT/SEND/Promise OUTPUT or explicit boundary rationale.`,
        route_to: "flag-async-contradictions",
        semantic_class: "await_sequencing",
      });
    }

    if (/RETRY:/i.test(body) && !/IDEMPOTENCY:/i.test(body)) {
      findings.push({
        code: "RETRY_WITHOUT_IDEMPOTENCY",
        severity: "error",
        block: range.name,
        message: `${range.name}: RETRY declared without IDEMPOTENCY or deduplication outcome for repeated DATA transitions.`,
        route_to: "flag-async-contradictions",
        semantic_class: "retry_idempotency",
      });
    }

    if (hasOpenWait(body)) {
      findings.push({
        code: "OPEN_WAIT_WITHOUT_TERMINATION",
        severity: "warning",
        block: range.name,
        message: `${range.name}: open wait without close/unsubscribe or TERMINATION: may_diverge rationale.`,
        route_to: "flag-async-contradictions",
        semantic_class: "termination",
      });
    }

    if (/MESSAGE_CONTRACT:[^\n]*at-least-once/i.test(body) && !/IDEMPOTENCY:|dedup/i.test(body)) {
      findings.push({
        code: "MESSAGE_DELIVERY_MISMATCH",
        severity: "error",
        block: range.name,
        message: `${range.name}: at-least-once MESSAGE_CONTRACT without handler dedup or IDEMPOTENCY outcome.`,
        route_to: "flag-async-contradictions",
        semantic_class: "message_event_delivery",
      });
    }

    if (input.req_declares_timeout && !/TIMEOUT:/i.test(body)) {
      findings.push({
        code: "REQ_TIMEOUT_NOT_IN_IMPL",
        severity: input.phase === "verification" ? "error" : "warning",
        block: range.name,
        message: `${range.name}: REQ declares timeout but IMPL TIMEOUT row is absent.`,
        route_to: "flag-async-contradictions",
        semantic_class: "timeout",
      });
    }
  }

  if (input.caller_pseudocode && input.callee_pseudocode) {
    const callerSeq = input.caller_pseudocode.match(/SEQUENCING:\s*([^\n]+)/i)?.[1]?.trim();
    const calleeSeq = input.callee_pseudocode.match(/SEQUENCING:\s*([^\n]+)/i)?.[1]?.trim();
    const callerControl = input.caller_pseudocode.match(/CONTROL:\s*ordering\s*([^\n]*)/i)?.[1]?.trim();
    const calleeControl = input.callee_pseudocode.match(/CONTROL:\s*ordering\s*([^\n]*)/i)?.[1]?.trim();
    if (
      (callerSeq && calleeSeq && callerSeq !== calleeSeq)
      || (callerControl && calleeControl && callerControl !== calleeControl)
    ) {
      findings.push({
        code: "SEQUENCING_CONTROL_MISMATCH",
        severity: "error",
        message: "Caller/callee SEQUENCING or CONTROL: ordering assumptions disagree.",
        route_to: "resolve-pseudocode",
        semantic_class: "await_sequencing",
      });
    }
  }

  return findings;
}

/**
 * [IMPL-ASYNC_CHECKLIST_DISPOSITIONS] [ARCH-ASYNC_CHECKLIST_INTEGRATION] — How: validate async_in_scope Tracker disposition without inquiry activation.
 */
export function validateAsyncInScopeTracker(tracker: unknown): AsyncInScopeTrackerValidation {
  const diagnostics: string[] = [];
  if (typeof tracker !== "object" || tracker === null) {
    return { ok: false, diagnostics: ["tracker_missing"] };
  }
  const record = tracker as Record<string, unknown>;
  if (!("async_in_scope" in record)) {
    diagnostics.push("async_in_scope_missing");
  } else if (typeof record.async_in_scope !== "boolean") {
    diagnostics.push("async_in_scope_not_boolean");
  }
  if (record.async_in_scope === true) {
    const classes = record.async_matched_semantic_classes;
    if (!Array.isArray(classes) || classes.length === 0) {
      diagnostics.push("async_matched_semantic_classes_missing");
    }
    if (record.async_inquiry_activated === true) {
      diagnostics.push("async_inquiry_must_not_activate_from_async_in_scope");
    }
  }
  return { ok: diagnostics.length === 0, diagnostics };
}

export function buildEmptyAsyncCatalogRows(pseudocode: string): AsyncCatalogRow[] {
  const lines = linesOf(pseudocode);
  return scanProcedureBlocks(lines)
    .filter((range) => hasAsyncBoundary(blockBody(lines, range.start, range.end)))
    .map((range) => emptyCatalogRow(range.name));
}

export function parseAsyncOptionalRows(source: string): string[] {
  return linesOf(source)
    .filter((line) => ASYNC_OPTIONAL_ROW_PATTERN.test(line))
    .map((line) => line.trim());
}

export const INTEGRATED_ASYNC_INQUIRY_CASES = [
  "timeout without FAILURE_MODE",
  "double AWAIT on non-idempotent DATA",
  "missing ordering between SEND and AWAIT",
  "retry without duplicate protection",
] as const;
