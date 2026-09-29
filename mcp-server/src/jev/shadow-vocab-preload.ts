/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 */

import type { JevClientConfig } from "./client.js";
import { jevDecide } from "./client.js";
import { matchKeywordGlossaries } from "./keyword-preload.js";
import {
  glossaryIdFromFile,
  parseRoutingTableMarkdown,
  type RoutingRow,
} from "./routing-table.js";
import type { JevDecideResult, JevQuestions } from "./types.js";

export type VocabShadowPreloadLog = {
  prompt: string;
  keyword_glossaries: string[];
  jev_glossaries: string[];
  confidence: number | null;
  jev_skipped: boolean;
  jev_skip_reason?: string;
  /** Vendor/transport failure after a call was attempted (not local skip). */
  jev_error?: boolean;
  jev_error_excerpt?: string;
  agrees: boolean;
};

const NOUL_THRESHOLD = 0.55;

export function buildGlossaryJevQuestions(rows: RoutingRow[]): JevQuestions {
  const criteria: Record<string, string> = {};
  for (const row of rows) {
    const id = glossaryIdFromFile(row.file);
    criteria[id] = row.keywords.slice(0, 8).join(", ").slice(0, 240);
  }
  const questions: JevQuestions = {
    primary_glossary: {
      type: "choice",
      instructions: "Which single glossary best matches the task prompt?",
      criteria,
    },
  };
  for (const row of rows) {
    const id = glossaryIdFromFile(row.file);
    questions[`also_${id}`] = {
      type: "noul",
      instructions: `Does the prompt also require concepts from glossary "${id}"?`,
    };
  }
  return questions;
}

export function jevAnswersToGlossaryIds(
  rows: RoutingRow[],
  answers: Record<string, { type: string; choice?: string; noul?: number; confidence?: number }>,
): { glossaries: string[]; confidence: number | null } {
  const ids = new Set<string>();
  let confidence: number | null = null;
  const primary = answers.primary_glossary;
  if (primary?.type === "choice" && primary.choice) {
    ids.add(primary.choice);
    confidence = primary.confidence ?? confidence;
  }
  for (const row of rows) {
    const id = glossaryIdFromFile(row.file);
    const ans = answers[`also_${id}`];
    if (ans?.type === "noul" && typeof ans.noul === "number" && ans.noul >= NOUL_THRESHOLD) {
      ids.add(id);
    }
  }
  return { glossaries: [...ids].sort(), confidence };
}

export function vocabShadowAgrees(keyword: string[], jev: string[]): boolean {
  if (jev.length === 0) return true;
  const ks = new Set(keyword);
  const js = new Set(jev);
  if (ks.size === js.size && [...ks].every((k) => js.has(k))) return true;
  return [...js].every((j) => ks.has(j));
}

export async function shadowVocabPreloadFromRows(
  prompt: string,
  rows: RoutingRow[],
  config: JevClientConfig = {},
): Promise<VocabShadowPreloadLog> {
  const keyword_glossaries = matchKeywordGlossaries(prompt, rows);
  const decideResult: JevDecideResult = await jevDecide(
    { prompt: prompt.slice(0, 4000) },
    buildGlossaryJevQuestions(rows),
    config,
  );

  if (!decideResult.ok) {
    if (!decideResult.skipped) {
      return {
        prompt,
        keyword_glossaries,
        jev_glossaries: [],
        confidence: null,
        jev_skipped: false,
        jev_error: true,
        jev_error_excerpt: decideResult.error?.slice(0, 200),
        agrees: false,
      };
    }
    return {
      prompt,
      keyword_glossaries,
      jev_glossaries: [],
      confidence: null,
      jev_skipped: true,
      jev_skip_reason: decideResult.reason,
      agrees: true,
    };
  }

  const { glossaries: jev_glossaries, confidence } = jevAnswersToGlossaryIds(
    rows,
    decideResult.response.answers as Record<
      string,
      { type: string; choice?: string; noul?: number; confidence?: number }
    >,
  );

  return {
    prompt,
    keyword_glossaries,
    jev_glossaries,
    confidence,
    jev_skipped: false,
    agrees: vocabShadowAgrees(keyword_glossaries, jev_glossaries),
  };
}

export async function shadowVocabPreloadFromRoutingMarkdown(
  prompt: string,
  routingMarkdown: string,
  config: JevClientConfig = {},
): Promise<VocabShadowPreloadLog> {
  const rows = parseRoutingTableMarkdown(routingMarkdown);
  return shadowVocabPreloadFromRows(prompt, rows, config);
}

export function summarizeShadowAgreement(logs: VocabShadowPreloadLog[]): {
  total: number;
  jev_invoked: number;
  jev_errors: number;
  agreement_rate: number;
  disagreements: VocabShadowPreloadLog[];
  errors: VocabShadowPreloadLog[];
} {
  const errors = logs.filter((l) => l.jev_error === true);
  const invoked = logs.filter(
    (l) => !l.jev_skipped && l.jev_error !== true && l.jev_glossaries.length > 0,
  );
  const disagreements = invoked.filter((l) => !l.agrees);
  const agreement_rate =
    invoked.length === 0 ? 1 : (invoked.length - disagreements.length) / invoked.length;
  return {
    total: logs.length,
    jev_invoked: invoked.length,
    jev_errors: errors.length,
    agreement_rate,
    disagreements,
    errors,
  };
}
