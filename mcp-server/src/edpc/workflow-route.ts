/**
 * [IMPL-TIED_EDPC_ORCHESTRATION] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_COMPREHENSION]
 */

import type { EvidenceAccessTier } from "./types.js";

export type EdpcWorkflowId = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export type EdpcRouteResult = {
  question_class: string;
  evidence_access_tier: EvidenceAccessTier;
  workflows: EdpcWorkflowId[];
  defaulted: boolean;
};

const ROUTE_TABLE: Record<string, EdpcWorkflowId[]> = {
  module_comprehension: ["B", "C", "F"],
  replacement_safety: ["B", "C", "E", "D", "F"],
  operational_health: ["B", "D", "F"],
  billing_processor_health: ["A", "B", "D", "C", "F"],
  resource_cost: ["B", "D", "E", "F"],
};

const DEFAULT_ROUTE: EdpcWorkflowId[] = ["B", "C", "F"];

function stripWorkflows(workflows: EdpcWorkflowId[], remove: EdpcWorkflowId[]): EdpcWorkflowId[] {
  const drop = new Set(remove);
  return workflows.filter((w) => !drop.has(w));
}

// [IMPL-TIED_EDPC_ORCHESTRATION] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_COMPREHENSION]
export function routeEdpcWorkflow(
  questionClass: string,
  evidenceAccessTier: EvidenceAccessTier,
): EdpcRouteResult {
  const key = questionClass.trim();
  let workflows = ROUTE_TABLE[key] ?? [...DEFAULT_ROUTE];
  const defaulted = !(key in ROUTE_TABLE);
  if (evidenceAccessTier === "source_static") {
    workflows = stripWorkflows(workflows, ["D", "E"]);
  }
  return {
    question_class: key || "unknown",
    evidence_access_tier: evidenceAccessTier,
    workflows,
    defaulted,
  };
}
