/**
 * [IMPL-TIED_CITDP_RECONCILE] [REQ-TIED_META_HUB_REPRESENTATION]
 * How: parse DOC-STDD citdp-dedupe-log § Kept (divergent) working paths.
 */

import fs from "node:fs";

const DIVERGENT_HEADER = "## Kept (divergent)";

export function parseDivergentWorkingPathsFromDedupeLog(markdown: string): string[] {
  const start = markdown.indexOf(DIVERGENT_HEADER);
  if (start < 0) return [];
  const section = markdown.slice(start);
  const paths: string[] = [];
  for (const line of section.split("\n")) {
    const match = line.match(/^\|\s*`(tied-project\/working\/[^`]+)`\s*\|/);
    if (match?.[1]) paths.push(match[1]);
  }
  return paths;
}

export function loadDefaultDivergentPaths(repoRoot: string): string[] {
  const logPath = `${repoRoot}/tied-project/working/DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/reports/citdp-dedupe-log.md`;
  const markdown = fs.readFileSync(logPath, "utf8");
  return parseDivergentWorkingPathsFromDedupeLog(markdown);
}
