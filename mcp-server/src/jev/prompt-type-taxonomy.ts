/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [REQ-PROMPT_TYPE_GLOBAL_SKILLS] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 */

export const LEAF_PROMPT_TYPES = [
  "plan-new-feature",
  "refine-plan",
  "build-plan",
  "plan-close-out",
  "debug",
  "question",
  "use-skill",
  "ammend-commit",
  "non-tied-plan",
  "non-tied-debug",
  "leap-ad-hoc",
  "leap-diff-promote",
  "other",
] as const;

export type LeafPromptType = (typeof LEAF_PROMPT_TYPES)[number];

export type TiedApplicability = "full" | "client-local" | "minimal";

export const PROMPT_TYPE_HINTS: Record<LeafPromptType, string> = {
  "plan-new-feature": "New REQ/ARCH/IMPL feature with full TIED stack",
  "refine-plan": "Improve a linked or in-message plan",
  "build-plan": "Execute an approved linked plan",
  "plan-close-out": "LEAP close-out; commit deferred",
  debug: "TIED-tracked bug with gates",
  question: "Minimal answer-only workflow",
  "use-skill": "Import and run a named skill with TIED gates",
  "ammend-commit": "Stage patches and amend last commit",
  "non-tied-plan": "Development without TIED YAML writes",
  "non-tied-debug": "Ordinary debug without TIED sync",
  "leap-ad-hoc": "Fortify staged ad-hoc work with TIED gates",
  "leap-diff-promote": "Promote diff onto TIED-complete stage",
  other: "Custom prefix; minimal workflow",
};

export function isLeafPromptType(value: string): value is LeafPromptType {
  return (LEAF_PROMPT_TYPES as readonly string[]).includes(value);
}
