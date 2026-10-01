// [IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP] [ARCH-TIED_SPONSOR_AGENT_RELATIONSHIP] [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP]
// How: pure helpers for CLASSIFY_DECISION_CONSEQUENCE and ROUTE_SPONSOR_TIED_DISAGREEMENT.

export type ConsequenceRung = 1 | 2 | 3 | 4;

export type DecisionInput = {
  description: string;
  reversibility_evidence?: string;
  affects_clients?: boolean;
  affects_status?: boolean;
};

export type DisagreementInput = {
  sponsor_statement: string;
  conflicting_tokens: string[];
  rung: ConsequenceRung;
};

export type DisagreementRoute = "LEAP" | "SPONSOR_QUESTION";

export function classifyDecisionConsequence(decision: DecisionInput): ConsequenceRung {
  const description = decision.description?.trim() ?? "";
  if (!description) {
    throw new Error("UNCLASSIFIABLE_DECISION");
  }
  if (decision.affects_status || decision.affects_clients) {
    return 4;
  }
  if (decision.reversibility_evidence?.trim()) {
    return 2;
  }
  return 1;
}

export function routeSponsorTiedDisagreement(input: DisagreementInput): DisagreementRoute {
  if (input.rung >= 3) {
    return "SPONSOR_QUESTION";
  }
  return "LEAP";
}
