/**
 * [IMPL-TIED_SPONSOR_QUESTIONS] [IMPL-TIED_SPONSOR_TWO_LANE_DELIVERY] [ARCH-TIED_SPONSOR_QUESTIONS_BOUNDARY] [ARCH-TIED_SPONSOR_TWO_LANE_DELIVERY] [REQ-TIED_SPONSOR_QUESTIONS] [REQ-TIED_SPONSOR_TWO_LANE_DELIVERY]
 * How: hinge validation, consequence ladder, lane metadata, pending LEAP proposals — library imports only.
 */

import { validateHingeFields } from "../checklist-validator.js";
import { classifyDecisionConsequence } from "../relationship/consequence-ladder.js";
import {
  classifySponsorDecisionLane,
  readSponsorBacklogs,
  validateSelectionEvidence,
  type SponsorDecisionLane,
} from "../relationship/sponsor-decision-lane.js";
import { listProposals } from "../analysis/leap-proposal-queue.js";

export type SponsorQuestion = {
  kind: "costly_decision" | "leap_proposal" | "hinge_gap" | "backlog_item";
  summary: string;
  rung?: number;
  proposal_id?: string;
  lane?: SponsorDecisionLane | "charter" | "selection";
  phase?: string;
  deferred?: boolean;
  selection_evidence?: unknown[];
};

export type SponsorQuestionsInput = {
  project_root: string;
  citdp?: unknown;
  phase?: string;
  pending_decisions?: Array<{
    description: string;
    reversibility_evidence?: string;
    affects_clients?: boolean;
    affects_status?: boolean;
    requires_product_evidence?: boolean;
    reversible_default_documented?: boolean;
  }>;
};

export type SponsorQuestionsResult = {
  ok: boolean;
  questions: SponsorQuestion[];
  hinge_diagnostics: string[];
  leap_pending_count: number;
  diagnostics: string[];
};

function phaseMatches(questionPhase: string | undefined, filter: string | undefined): boolean {
  if (!filter?.trim()) return true;
  if (!questionPhase?.trim()) return true;
  return questionPhase === filter;
}

export function extractSponsorQuestions(input: SponsorQuestionsInput): SponsorQuestionsResult {
  const questions: SponsorQuestion[] = [];
  const diagnostics: string[] = [];
  let hinge_diagnostics: string[] = [];

  if (input.citdp !== undefined) {
    const hinge = validateHingeFields(input.citdp);
    hinge_diagnostics = hinge.diagnostics;
    if (hinge.diagnostics.length > 0) {
      questions.push({
        kind: "hinge_gap",
        summary: `CITDP hinge fields incomplete: ${hinge.diagnostics.join(", ")}`,
        lane: "charter",
        phase: "pre_implementation",
      });
    }

    const { sponsor_charter_backlog, sponsor_selection_backlog } = readSponsorBacklogs(input.citdp);
    for (const row of sponsor_charter_backlog) {
      if (!phaseMatches(row.phase, input.phase)) continue;
      questions.push({
        kind: "backlog_item",
        summary: row.default_or_option,
        lane: "charter",
        phase: row.phase,
        deferred: row.disposition === "deferred",
        rung: row.consequence_rung,
      });
    }
    for (const row of sponsor_selection_backlog) {
      if (!phaseMatches(row.phase, input.phase)) continue;
      const evidenceCheck = validateSelectionEvidence(row);
      if (!evidenceCheck.ok) {
        diagnostics.push(...evidenceCheck.diagnostics);
      }
      questions.push({
        kind: "backlog_item",
        summary: row.default_or_option,
        lane: "selection",
        phase: row.phase,
        deferred: row.disposition === "deferred",
        selection_evidence: row.selection_evidence,
        rung: row.consequence_rung,
      });
    }
  }

  for (const decision of input.pending_decisions ?? []) {
    try {
      const lane = classifySponsorDecisionLane(decision);
      const rung = classifyDecisionConsequence(decision);
      if (lane === "selection" || rung >= 3) {
        const selectionEvidence =
          lane === "selection" && decision.requires_product_evidence
            ? [{ kind: "product_evidence_required" }]
            : undefined;
        questions.push({
          kind: "costly_decision",
          summary: decision.description,
          rung,
          lane,
          deferred: lane === "mid_lane_defer",
          selection_evidence: selectionEvidence,
        });
      }
    } catch {
      diagnostics.push("unclassifiable_decision");
    }
  }

  const pending = listProposals(input.project_root, { status: "pending" });
  for (const proposal of pending) {
    questions.push({
      kind: "leap_proposal",
      summary: proposal.title ?? proposal.summary ?? proposal.id,
      proposal_id: proposal.id,
      lane: "charter",
    });
  }

  return {
    ok: true,
    questions,
    hinge_diagnostics,
    leap_pending_count: pending.length,
    diagnostics,
  };
}
