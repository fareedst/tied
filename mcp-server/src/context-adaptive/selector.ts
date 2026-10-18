/**
 * [IMPL-TIED_CONTEXT_ADAPTIVE_SELECTOR] [ARCH-TIED_CONTEXT_ADAPTIVE_ENGINEERING]
 * [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING]
 */

import { createHash } from "node:crypto";
import { SELECTION_RECEIPT_SCHEMA, SELECTOR_PROOF_BOUNDARY } from "./constants.js";
import type { PracticeLibraryV1, PracticeContractV1 } from "./contracts.js";
import type { ContextProfileV1 } from "./profile.js";
import { applicabilityMatches } from "./profile.js";

export type HardConstraint = {
  id: string;
  reject_practice_ids?: string[];
};

export type SelectionReceiptV1 = {
  schema_version: typeof SELECTION_RECEIPT_SCHEMA;
  context_hash: string;
  library_version: string;
  selected_practice_ids: string[];
  rejected_practice_ids: Array<{ id: string; rule_id: string }>;
  matched_rules: string[];
  proof_boundary: string;
};

export function hashStable(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex");
}

function passesApplicability(contract: PracticeContractV1, profile: ContextProfileV1): boolean {
  const signals = contract.applicability ?? {};
  for (const [dimension, allowed] of Object.entries(signals)) {
    const actual = profile.dimensions[dimension as keyof ContextProfileV1["dimensions"]];
    if (!applicabilityMatches(allowed, actual)) {
      return false;
    }
  }
  return true;
}

/** [IMPL-TIED_CONTEXT_ADAPTIVE_SELECTOR] SELECT_PRACTICES_DETERMINISTIC_V1 */
export function selectPracticesDeterministicV1(input: {
  library: PracticeLibraryV1;
  profile: ContextProfileV1;
  hard_constraints?: HardConstraint[];
}): SelectionReceiptV1 {
  const rejected: SelectionReceiptV1["rejected_practice_ids"] = [];
  const matchedRules: string[] = [];
  const blocked = new Set<string>();

  for (const hc of input.hard_constraints ?? []) {
    matchedRules.push(hc.id);
    for (const id of hc.reject_practice_ids ?? []) {
      blocked.add(id);
    }
  }

  const selected: string[] = [];
  const rejectedIds = new Set<string>();

  const trySelect = (contract: PracticeContractV1): boolean => {
    if (selected.includes(contract.id) || rejectedIds.has(contract.id)) {
      return false;
    }
    if (blocked.has(contract.id)) {
      rejected.push({ id: contract.id, rule_id: "hard_constraint" });
      rejectedIds.add(contract.id);
      return false;
    }
    if (contract.hard_constraint && input.profile.dimensions.criticality === "UNKNOWN") {
      rejected.push({ id: contract.id, rule_id: "unknown_criticality_hard" });
      rejectedIds.add(contract.id);
      return false;
    }
    if (!passesApplicability(contract, input.profile)) {
      rejected.push({ id: contract.id, rule_id: "applicability" });
      rejectedIds.add(contract.id);
      return false;
    }
    for (const prereq of contract.prerequisites ?? []) {
      if (!selected.includes(prereq)) {
        return false;
      }
    }
    for (const incompatible of contract.incompatible_with ?? []) {
      if (selected.includes(incompatible)) {
        rejected.push({ id: contract.id, rule_id: "incompatible" });
        rejectedIds.add(contract.id);
        return false;
      }
    }
    selected.push(contract.id);
    matchedRules.push(`selected:${contract.id}`);
    return true;
  };

  let progress = true;
  while (progress) {
    progress = false;
    for (const contract of input.library.contracts) {
      if (trySelect(contract)) progress = true;
    }
  }
  for (const contract of input.library.contracts) {
    if (selected.includes(contract.id) || rejectedIds.has(contract.id)) continue;
    rejected.push({ id: contract.id, rule_id: "missing_prerequisite" });
  }

  return {
    schema_version: SELECTION_RECEIPT_SCHEMA,
    context_hash: hashStable(input.profile),
    library_version: hashStable(input.library.contracts.map((c) => c.id)),
    selected_practice_ids: selected,
    rejected_practice_ids: rejected,
    matched_rules: matchedRules,
    proof_boundary: SELECTOR_PROOF_BOUNDARY,
  };
}

export function selectionReceiptHash(receipt: SelectionReceiptV1): string {
  return hashStable(receipt);
}
