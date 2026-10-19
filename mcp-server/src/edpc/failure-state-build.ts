/**
 * [IMPL-TIED_EDPC_FAILURE_OPS] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_COMPREHENSION]
 */

import type { EvidenceAccessMatrix } from "./types.js";
import {
  type EdpcCharterCriticalOutcomes,
  type OperationalFailureStateBundle,
  validateEdpcFailureState,
} from "./failure-state-validate.js";
import type { ScmSnapshotShell } from "./publish-build.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stableSortObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableSortObject);
  if (!isRecord(value)) return value;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(value).sort()) {
    sorted[key] = stableSortObject(value[key]);
  }
  return sorted;
}

// [IMPL-TIED_EDPC_FAILURE_OPS] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_COMPREHENSION]
export function buildEdpcFailureState(input: {
  charter: EdpcCharterCriticalOutcomes;
  access_matrix: EvidenceAccessMatrix;
  ofsm_bundle: OperationalFailureStateBundle;
  scm_shell: unknown;
}): {
  ok: boolean;
  diagnostics: string[];
  merged_shell?: ScmSnapshotShell;
  normalized_bundle?: Record<string, unknown>;
} {
  const validation = validateEdpcFailureState({
    charter: input.charter,
    access_matrix: input.access_matrix,
    ofsm_bundle: input.ofsm_bundle,
  });

  if (!isRecord(input.scm_shell)) {
    return {
      ok: false,
      diagnostics: [...validation.diagnostics, "invalid_scm_shell"],
    };
  }

  const shell = { ...(input.scm_shell as ScmSnapshotShell) };
  const bundlePath = input.ofsm_bundle.bundle_path;
  if (typeof bundlePath === "string" && bundlePath.trim()) {
    shell.receipt_refs = {
      ...(shell.receipt_refs ?? {}),
      operational_failure_state: bundlePath.trim(),
    };
  }

  const normalized_bundle = stableSortObject(validation.normalized_bundle) as Record<string, unknown>;

  return {
    ok: validation.ok,
    diagnostics: validation.diagnostics,
    merged_shell: shell,
    normalized_bundle,
  };
}
