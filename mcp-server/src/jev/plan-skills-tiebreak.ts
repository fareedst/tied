/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 * APPLY_TIEBREAK_ADVISORY_DISPLAY — W6d display-only tiebreak fields.
 */

import type { PlanSkillsReadiness } from "./plan-skills-types.js";

export const TIEBREAK_CONFIDENCE_MIN = 0.9;

export type PlanSkillsShadowMode = "advisory" | "tiebreak";

export type TiebreakDisplayInput = {
  shadow_mode: PlanSkillsShadowMode;
  readiness: PlanSkillsReadiness;
  keyword_glossaries: string[];
  jev_glossaries: string[];
  confidence: number | null;
};

export type TiebreakDisplayFields = {
  shadow_mode?: PlanSkillsShadowMode;
  tiebreak_active: boolean;
  advisory_primary?: string;
  recommended_glossary_order?: string[];
};

export function applyTiebreakAdvisoryDisplay(input: TiebreakDisplayInput): TiebreakDisplayFields {
  const base: TiebreakDisplayFields = {
    tiebreak_active: false,
  };

  if (input.shadow_mode !== "tiebreak") {
    return base;
  }

  const distinctKeyword = new Set(input.keyword_glossaries);
  if (input.readiness !== "ready") {
    return { ...base, shadow_mode: "tiebreak", tiebreak_active: false };
  }
  if (distinctKeyword.size < 2) {
    return { ...base, shadow_mode: "tiebreak", tiebreak_active: false };
  }
  if (input.confidence === null || input.confidence < TIEBREAK_CONFIDENCE_MIN) {
    return { ...base, shadow_mode: "tiebreak", tiebreak_active: false };
  }
  if (input.jev_glossaries.length === 0) {
    return { ...base, shadow_mode: "tiebreak", tiebreak_active: false };
  }

  const recommended_glossary_order = [...input.jev_glossaries];
  const advisory_primary = recommended_glossary_order[0];

  return {
    shadow_mode: "tiebreak",
    tiebreak_active: true,
    advisory_primary,
    recommended_glossary_order,
  };
}
