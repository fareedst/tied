/**
 * [IMPL-TIED_SPONSOR_QUESTIONS] [ARCH-TIED_SPONSOR_QUESTIONS_BOUNDARY] [REQ-TIED_SPONSOR_QUESTIONS]
 * How: hinge validation, consequence ladder, pending LEAP proposals — library imports only.
 */

import { validateHingeFields } from "../checklist-validator.js";
import { classifyDecisionConsequence } from "../relationship/consequence-ladder.js";
import { listProposals } from "../analysis/leap-proposal-queue.js";

export type SponsorQuestion = {
  kind: "costly_decision" | "leap_proposal" | "hinge_gap";
  summary: string;
  rung?: number;
  proposal_id?: string;
};

export type SponsorQuestionsInput = {
  project_root: string;
  citdp?: unknown;
  pending_decisions?: Array<{
    description: string;
    reversibility_evidence?: string;
    affects_clients?: boolean;
    affects_status?: boolean;
  }>;
};

export type SponsorQuestionsResult = {
  ok: boolean;
  questions: SponsorQuestion[];
  hinge_diagnostics: string[];
  leap_pending_count: number;
  diagnostics: string[];
};

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
      });
    }
  }

  for (const decision of input.pending_decisions ?? []) {
    try {
      const rung = classifyDecisionConsequence(decision);
      if (rung >= 3) {
        questions.push({
          kind: "costly_decision",
          summary: decision.description,
          rung,
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
