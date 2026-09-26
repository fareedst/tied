/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 * Advisory only — never loads or invokes prompt-type skills.
 */

import type { JevClientConfig } from "./client.js";
import { jevDecide } from "./client.js";
import {
  dedupeAdjacentPromptTypes,
  formatPromptTypeEnvelope,
  heuristicInferPromptTypes,
  heuristicTiedApplicability,
} from "./prompt-type-heuristic.js";
import {
  isLeafPromptType,
  LEAF_PROMPT_TYPES,
  PROMPT_TYPE_HINTS,
  type LeafPromptType,
  type TiedApplicability,
} from "./prompt-type-taxonomy.js";
import type { JevDecideResult, JevQuestions } from "./types.js";

export type PromptTypeAdvisoryLog = {
  invocation_remainder: string;
  heuristic_prompt_types: LeafPromptType[];
  jev_prompt_types: LeafPromptType[];
  suggested_prompt_types: LeafPromptType[];
  tied_applicability: TiedApplicability;
  needs_linked_plan: boolean | null;
  confidence: number | null;
  jev_skipped: boolean;
  jev_skip_reason?: string;
  agrees: boolean;
  envelope_hint: string;
};

const NOUL_THRESHOLD = 0.55;

export function buildPromptTypeJevQuestions(): JevQuestions {
  const typeCriteria: Record<string, string> = {};
  for (const type of LEAF_PROMPT_TYPES) {
    typeCriteria[type] = PROMPT_TYPE_HINTS[type];
  }
  const questions: JevQuestions = {
    primary_prompt_type: {
      type: "choice",
      instructions:
        "Which prompt-type best matches the invocation remainder? Explicit skill names only.",
      criteria: typeCriteria,
    },
    tied_applicability: {
      type: "choice",
      instructions:
        "Which TIED applicability boundary fits? full = full TIED stack; client-local = read tied/ no YAML writes; minimal = answer-only or other.",
      criteria: {
        full: "Full TIED/CITDP/LEAP workflow",
        "client-local": "TIED-client-local; no project YAML mutations",
        minimal: "question, other, or no TIED tracking",
      },
    },
    needs_linked_plan: {
      type: "noul",
      instructions:
        "Does this request require a linked plan document (refine-plan or build-plan)?",
    },
  };
  for (const type of LEAF_PROMPT_TYPES) {
    questions[`also_${type}`] = {
      type: "noul",
      instructions: `Should prompt-type "${type}" also appear in the composed sequence?`,
    };
  }
  return questions;
}

export function jevAnswersToPromptTypes(
  answers: Record<
    string,
    { type: string; choice?: string; noul?: number; confidence?: number }
  >,
): { types: LeafPromptType[]; applicability: TiedApplicability; confidence: number | null; needsLinkedPlan: boolean | null } {
  const types: LeafPromptType[] = [];
  let confidence: number | null = null;
  const primary = answers.primary_prompt_type;
  if (primary?.type === "choice" && primary.choice && isLeafPromptType(primary.choice)) {
    types.push(primary.choice);
    confidence = primary.confidence ?? confidence;
  }
  for (const type of LEAF_PROMPT_TYPES) {
    const ans = answers[`also_${type}`];
    if (ans?.type === "noul" && typeof ans.noul === "number" && ans.noul >= NOUL_THRESHOLD) {
      if (!types.includes(type)) types.push(type);
    }
  }
  let applicability: TiedApplicability = "minimal";
  const app = answers.tied_applicability;
  if (app?.type === "choice" && app.choice) {
    if (app.choice === "full" || app.choice === "client-local" || app.choice === "minimal") {
      applicability = app.choice;
    }
  }
  let needsLinkedPlan: boolean | null = null;
  const nlp = answers.needs_linked_plan;
  if (nlp?.type === "noul" && typeof nlp.noul === "number") {
    needsLinkedPlan = nlp.noul >= NOUL_THRESHOLD;
  }
  return {
    types: dedupeAdjacentPromptTypes(types) as LeafPromptType[],
    applicability,
    confidence,
    needsLinkedPlan,
  };
}

export function promptTypeAdvisoryAgrees(
  heuristic: LeafPromptType[],
  jev: LeafPromptType[],
): boolean {
  if (jev.length === 0) return true;
  if (heuristic.length === 0) return true;
  if (heuristic[0] !== jev[0]) return false;
  return jev.every((t) => heuristic.includes(t));
}

export async function advisePromptTypes(
  invocationRemainder: string,
  config: JevClientConfig = {},
): Promise<PromptTypeAdvisoryLog> {
  const heuristic_prompt_types = heuristicInferPromptTypes(invocationRemainder);
  const heuristicApplicability = heuristicTiedApplicability(heuristic_prompt_types);

  const decideResult: JevDecideResult = await jevDecide(
    { invocation_remainder: invocationRemainder.slice(0, 4000) },
    buildPromptTypeJevQuestions(),
    config,
  );

  if (!decideResult.ok) {
    const suggested = heuristic_prompt_types;
    return {
      invocation_remainder: invocationRemainder,
      heuristic_prompt_types,
      jev_prompt_types: [],
      suggested_prompt_types: suggested,
      tied_applicability: heuristicApplicability,
      needs_linked_plan:
        suggested.includes("refine-plan") || suggested.includes("build-plan")
          ? true
          : null,
      confidence: null,
      jev_skipped: decideResult.skipped,
      jev_skip_reason: decideResult.skipped ? decideResult.reason : undefined,
      agrees: true,
      envelope_hint: formatPromptTypeEnvelope(suggested),
    };
  }

  const parsed = jevAnswersToPromptTypes(
    decideResult.response.answers as Record<
      string,
      { type: string; choice?: string; noul?: number; confidence?: number }
    >,
  );

  const suggested_prompt_types =
    heuristic_prompt_types.length > 0 ? heuristic_prompt_types : parsed.types;

  const tied_applicability =
    heuristic_prompt_types.length > 0 ? heuristicApplicability : parsed.applicability;

  return {
    invocation_remainder: invocationRemainder,
    heuristic_prompt_types,
    jev_prompt_types: parsed.types,
    suggested_prompt_types,
    tied_applicability,
    needs_linked_plan: parsed.needsLinkedPlan,
    confidence: parsed.confidence,
    jev_skipped: false,
    agrees: promptTypeAdvisoryAgrees(heuristic_prompt_types, parsed.types),
    envelope_hint: formatPromptTypeEnvelope(suggested_prompt_types),
  };
}
