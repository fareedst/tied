// [IMPL-TIED_SPONSOR_TWO_LANE_DELIVERY] [ARCH-TIED_SPONSOR_TWO_LANE_DELIVERY] [REQ-TIED_SPONSOR_TWO_LANE_DELIVERY]
// How: CLASSIFY_SPONSOR_DECISION_LANE, BATCH_CHARTER_COSTLY_CHOICES, VALIDATE_SELECTION_EVIDENCE, AUDIT_MID_LANE_SPONSOR_DEFERRAL — compose consequence ladder.

import { classifyDecisionConsequence, type DecisionInput } from "./consequence-ladder.js";

export type SponsorDecisionLane = "charter" | "selection" | "mid_lane_defer";

export type LaneDecisionInput = DecisionInput & {
  requires_product_evidence?: boolean;
  reversible_default_documented?: boolean;
};

export type SponsorBacklogRow = {
  decision_id: string;
  phase: string;
  lane: "charter" | "selection";
  default_or_option: string;
  consequence_rung: number;
  disposition: string;
  evidence_refs?: unknown[];
  selection_evidence?: unknown[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function unwrapCitdpBody(citdp: unknown): Record<string, unknown> | null {
  if (!isRecord(citdp)) return null;
  const keys = Object.keys(citdp);
  if (keys.length === 1 && keys[0]!.startsWith("CITDP-")) {
    const inner = citdp[keys[0]!];
    return isRecord(inner) ? inner : null;
  }
  return citdp;
}

export function readSponsorBacklogs(citdp: unknown): {
  sponsor_charter_backlog: SponsorBacklogRow[];
  sponsor_selection_backlog: SponsorBacklogRow[];
} {
  const body = unwrapCitdpBody(citdp);
  const empty = { sponsor_charter_backlog: [] as SponsorBacklogRow[], sponsor_selection_backlog: [] as SponsorBacklogRow[] };
  if (!body) return empty;

  const fromChange = isRecord(body.change_definition) ? body.change_definition : {};
  const fromRisk = isRecord(body.risk_analysis) ? body.risk_analysis : {};
  const charterRaw =
    fromChange.sponsor_charter_backlog ?? fromRisk.sponsor_charter_backlog ?? [];
  const selectionRaw =
    fromChange.sponsor_selection_backlog ?? fromRisk.sponsor_selection_backlog ?? [];

  return {
    sponsor_charter_backlog: Array.isArray(charterRaw) ? (charterRaw as SponsorBacklogRow[]) : [],
    sponsor_selection_backlog: Array.isArray(selectionRaw) ? (selectionRaw as SponsorBacklogRow[]) : [],
  };
}

// [IMPL-TIED_SPONSOR_TWO_LANE_DELIVERY] [ARCH-TIED_SPONSOR_TWO_LANE_DELIVERY] [REQ-TIED_SPONSOR_TWO_LANE_DELIVERY] — How: CLASSIFY_SPONSOR_DECISION_LANE block lead.
export function classifySponsorDecisionLane(decision: LaneDecisionInput): SponsorDecisionLane {
  const description = decision.description?.trim() ?? "";
  if (!description) {
    throw new Error("UNCLASSIFIABLE_DECISION");
  }
  if (decision.requires_product_evidence) {
    return "selection";
  }
  if (decision.reversible_default_documented || decision.reversibility_evidence?.trim()) {
    const rung = classifyDecisionConsequence(decision);
    if (rung <= 2) {
      return "mid_lane_defer";
    }
  }
  return "charter";
}

// [IMPL-TIED_SPONSOR_TWO_LANE_DELIVERY] [ARCH-TIED_SPONSOR_TWO_LANE_DELIVERY] [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP] [REQ-TIED_SPONSOR_TWO_LANE_DELIVERY] — How: BATCH_CHARTER_COSTLY_CHOICES.
export function batchCharterCostlyChoices(
  citdp: unknown,
  pendingDecisions: LaneDecisionInput[] = [],
): SponsorBacklogRow[] {
  const { sponsor_charter_backlog } = readSponsorBacklogs(citdp);
  const rows: SponsorBacklogRow[] = [...sponsor_charter_backlog];
  let index = rows.length;
  for (const decision of pendingDecisions) {
    const lane = classifySponsorDecisionLane(decision);
    if (lane !== "charter") continue;
    const rung = classifyDecisionConsequence(decision);
    if (rung < 3) continue;
    rows.push({
      decision_id: `pending-${index += 1}`,
      phase: "risk-assessment",
      lane: "charter",
      default_or_option: decision.description,
      consequence_rung: rung,
      disposition: "pending",
      evidence_refs: [],
    });
  }
  return rows;
}

// [IMPL-TIED_SPONSOR_TWO_LANE_DELIVERY] [ARCH-TIED_SPONSOR_TWO_LANE_DELIVERY] [REQ-TIED_SPONSOR_TWO_LANE_DELIVERY] — How: VALIDATE_SELECTION_EVIDENCE.
export function validateSelectionEvidence(option: unknown): { ok: boolean; diagnostics: string[] } {
  if (!isRecord(option)) {
    return { ok: false, diagnostics: ["selection_evidence_missing:invalid_option"] };
  }
  const evidence = option.selection_evidence;
  const hasEvidence = Array.isArray(evidence) && evidence.length > 0;
  if (!hasEvidence) {
    return { ok: false, diagnostics: ["selection_evidence_missing"] };
  }
  return { ok: true, diagnostics: [] };
}

// [IMPL-TIED_SPONSOR_TWO_LANE_DELIVERY] [ARCH-TIED_SPONSOR_TWO_LANE_DELIVERY] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_SPONSOR_TWO_LANE_DELIVERY] — How: AUDIT_MID_LANE_SPONSOR_DEFERRAL.
export function auditMidLaneSponsorDeferral(citdp: unknown, gatePolicy?: string): string[] {
  const policy = gatePolicy?.trim() || "advisory";
  const { sponsor_charter_backlog, sponsor_selection_backlog } = readSponsorBacklogs(citdp);
  const diagnostics: string[] = [];
  const total = sponsor_charter_backlog.length + sponsor_selection_backlog.length;
  if (total === 0) return diagnostics;
  if (policy === "advisory" || policy.startsWith("advisory")) {
    diagnostics.push(`mid_lane_sponsor_deferral:backlog_count=${total}`);
    return diagnostics;
  }
  diagnostics.push(`mid_lane_sponsor_backlog_present:count=${total}`);
  return diagnostics;
}
