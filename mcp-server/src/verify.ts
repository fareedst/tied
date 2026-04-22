/**
 * Verification-gated status update: set REQ/IMPL status from test results.
 * [PROC-TIED_VERIFICATION_GATED]
 */

import { loadIndex, updateRecord } from "./yaml-loader.js";

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

  if (dry_run) {
    const would_update = collectVerifyChanges(options);
    return {
      ok: true,
      dry_run: true,
      would_update,
      requirements_updated: 0,
      implementation_updated: 0,
      requirements_set_implemented: [],
      requirements_set_planned: [],
      implementation_set_active: [],
      implementation_set_planned: [],
    };
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
      } else if (set_unpassed_reqs_to_planned) {
        const res = updateRecord("requirements", token, { status: REQ_PLANNED_STATUS });
        if (res.ok) requirements_set_planned.push(token);
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
      } else if (set_unpassed_impl_to_planned) {
        const res = updateRecord("implementation", token, { status: IMPL_PLANNED_STATUS });
        if (res.ok) implementation_set_planned.push(token);
      }
    }
  }

  return {
    ok: true,
    requirements_updated: requirements_set_implemented.length + requirements_set_planned.length,
    implementation_updated: implementation_set_active.length + implementation_set_planned.length,
    requirements_set_implemented,
    requirements_set_planned,
    implementation_set_active,
    implementation_set_planned,
  };
}
