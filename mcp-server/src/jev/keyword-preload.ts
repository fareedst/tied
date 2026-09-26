/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 */

import { glossaryIdFromFile, type RoutingRow } from "./routing-table.js";

function normalize(text: string): string {
  return text.toLowerCase();
}

export function matchKeywordGlossaries(prompt: string, rows: RoutingRow[]): string[] {
  const hay = normalize(prompt);
  const matched: string[] = [];
  for (const row of rows) {
    const id = glossaryIdFromFile(row.file);
    for (const keyword of row.keywords) {
      const needle = normalize(keyword);
      if (needle.length < 2) continue;
      if (hay.includes(needle)) {
        matched.push(id);
        break;
      }
    }
  }
  return matched;
}
