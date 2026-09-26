/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 * Explicit prompt-type names only — does not infer from ambiguous intent.
 */

import {
  isLeafPromptType,
  LEAF_PROMPT_TYPES,
  type LeafPromptType,
  type TiedApplicability,
} from "./prompt-type-taxonomy.js";

export function dedupeAdjacentPromptTypes(types: string[]): string[] {
  const out: string[] = [];
  for (const t of types) {
    if (!isLeafPromptType(t)) continue;
    if (out.length > 0 && out[out.length - 1] === t) continue;
    out.push(t);
  }
  return out;
}

/** Match `/build-plan`, `@build-plan`, or bare `build-plan` tokens. */
export function heuristicInferPromptTypes(remainder: string): LeafPromptType[] {
  const hay = remainder.toLowerCase();
  const hits: { index: number; type: LeafPromptType }[] = [];

  for (const type of LEAF_PROMPT_TYPES) {
    const patterns = [
      new RegExp(`/${type}(?:\\s|$)`, "i"),
      new RegExp(`@${type}(?:\\s|$)`, "i"),
      new RegExp(`\\b${type.replace(/-/g, "\\-")}\\b`, "i"),
    ];
    for (const re of patterns) {
      const m = hay.match(re);
      if (m && m.index !== undefined) {
        hits.push({ index: m.index, type });
        break;
      }
    }
  }

  hits.sort((a, b) => a.index - b.index);
  let types = dedupeAdjacentPromptTypes(hits.map((h) => h.type)) as LeafPromptType[];
  if (types.includes("non-tied-debug")) {
    types = types.filter((t) => t !== "debug");
  }
  return types;
}

export function heuristicTiedApplicability(
  types: LeafPromptType[],
): TiedApplicability {
  if (types.length === 0) return "minimal";
  if (types.some((t) => t === "non-tied-plan" || t === "non-tied-debug")) {
    return "client-local";
  }
  if (types.every((t) => t === "question" || t === "other")) {
    return "minimal";
  }
  return "full";
}

export function formatPromptTypeEnvelope(types: LeafPromptType[]): string {
  if (types.length === 0) return "";
  return types.map((t) => `prompt-type: ${t}`).join("\n");
}
