/**
 * [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT]
 * Non-compact HTML transform for Turn.Parts (Go htmlformat parity, Phase 4a dry-run/live).
 */
import type { Turn } from "./checklist-load-turns.js";

export type HtmlFormatOptions = {
  enabled: boolean;
  stableIndent: number;
};

export function formatNonCompactHtml(
  part: string,
  o: HtmlFormatOptions,
): string {
  if (part === "") {
    return "";
  }
  if (!o.enabled) {
    return part;
  }
  return deterministicNonCompactHtmlForPart(part, o);
}

function deterministicNonCompactHtmlForPart(
  text: string,
  o: HtmlFormatOptions,
): string {
  if (text === "") {
    return "";
  }
  let s = addNonCompactLineBreaks(text);
  if (o.stableIndent > 0) {
    s = applyStableIndentLines(s, o.stableIndent);
  }
  return s;
}

function addNonCompactLineBreaks(utf8: string): string {
  const s = utf8.replaceAll("><", ">\n<");
  if (s.includes("\n")) {
    return s;
  }
  const i = s.indexOf(">");
  if (i >= 0) {
    return s.slice(0, i + 1) + "\n" + s.slice(i + 1);
  }
  return utf8 + "\n";
}

function applyStableIndentLines(s: string, n: number): string {
  if (n <= 0) {
    return s;
  }
  const pad = " ".repeat(n);
  const lines = s.split("\n");
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === "") {
      continue;
    }
    lines[i] = pad + lines[i]!;
  }
  return lines.join("\n");
}

export function applyNonCompactHtmlToTurns(
  turns: Turn[],
  o: HtmlFormatOptions,
): Turn[] {
  if (!o.enabled) {
    return turns;
  }
  for (const t of turns) {
    for (let j = 0; j < t.parts.length; j++) {
      t.parts[j] = formatNonCompactHtml(t.parts[j]!, o);
    }
  }
  return turns;
}
