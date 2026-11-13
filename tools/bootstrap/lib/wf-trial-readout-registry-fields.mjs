/**
 * [REQ-WF_TRIAL_SUMMARIES_PUBLISH] [IMPL-WF_TRIAL_SUMMARIES_PUBLISH]
 */
import fs from "node:fs";
import path from "node:path";

import {
  meanCompactGrades,
  normalizeBand,
  parseSessionGradingTable,
} from "./read-trial-readout-session-grading.mjs";

const WF_FROM_NAME_RE = /trial-readout-PROMPT-WF-(\d{2})-/i;
const CLIENT_ID_FROM_NAME_RE = /-(\d{9,})[^/]*\.md$/;

/**
 * @param {string} basename e.g. trial-readout-PROMPT-WF-01-...-1794587975-....md
 */
export function parseReadoutFilename(basename) {
  const wf = basename.match(WF_FROM_NAME_RE)?.[1] ?? null;
  const clientId = basename.match(CLIENT_ID_FROM_NAME_RE)?.[1] ?? null;
  return { wf, clientId: clientId ? Number(clientId) : null };
}

/**
 * @param {string} markdown
 */
function parseMetadataField(markdown, fieldName) {
  const re = new RegExp(
    `^\\|\\s*\\*\\*${fieldName}\\*\\*\\s*\\|\\s*([^|]+)\\|`,
    "im",
  );
  const m = markdown.match(re);
  return m ? m[1].trim() : null;
}

/**
 * @param {string} harnessRaw
 */
export function normalizeHarnessKey(harnessRaw) {
  if (!harnessRaw) return "—";
  const s = harnessRaw.toLowerCase();
  if (s.includes("cursor")) return "cursor";
  if (s.includes("claude")) return "claude";
  if (s.includes("manual")) return "manual-IDE";
  if (s.includes("mixed")) return "mixed";
  return harnessRaw.trim();
}

/**
 * @param {string} markdown
 */
export function parseOrchestratorExit(markdown) {
  const patterns = [
    /orchestrator\s+[`']?exit_code:\s*(\d+)/i,
    /exit_code:\s*(\d+)/i,
    /\*\*exit_code:\s*(\d+)\*\*/i,
  ];
  for (const re of patterns) {
    const m = markdown.match(re);
    if (m) return m[1];
  }
  return "—";
}

/**
 * @param {string} markdown
 */
export function parseWallSeconds(markdown) {
  const patterns = [
    /wall\s+\*\*(\d+)s\*\*/i,
    /\*\*Run time\*\*\s*\|\s*\*\*(\d+)\*\*/i,
    /orchestrator wall[^0-9]*(\d+)\s*s/i,
    /Run time[^0-9]*(\d+)\s*(?:seconds|s\b)/i,
  ];
  for (const re of patterns) {
    const m = markdown.match(re);
    if (m) return m[1];
  }
  return "—";
}

/**
 * @param {string} markdown readout body
 * @returns {{ wf: string | null, clientId: number | null, harness: string, modelSlug: string, exit: string, runTime: string, gradesDisplay: string, compactSlash: string }}
 */
export function scrapeReadoutForRegistryRow(markdown, basename) {
  const fromName = parseReadoutFilename(basename);
  const wf = fromName.wf;
  const clientId = fromName.clientId;

  const harnessRaw =
    parseMetadataField(markdown, "Harness") ??
    parseMetadataField(markdown, "Harness key");
  const harness = normalizeHarnessKey(harnessRaw ?? "");

  let modelSlug =
    parseMetadataField(markdown, "Model slug") ??
    parseMetadataField(markdown, "Model config") ??
    "—";
  modelSlug = modelSlug.replace(/^`|`$/g, "").trim();

  const { rows, errors } = parseSessionGradingTable(markdown);
  let gradesDisplay = "—";
  let compactSlash = "";
  if (errors.length === 0 && rows.length > 0) {
    compactSlash = rows.map((r) => normalizeBand(r.band)).join("/");
    const { display } = meanCompactGrades(compactSlash);
    gradesDisplay = display;
  }

  const gradeMeanLine = markdown.match(
    /Grade mean \(registry compact\):\*\*\s*([^\n]+)/i,
  );
  if (gradeMeanLine && gradesDisplay === "—") {
    gradesDisplay = gradeMeanLine[1].trim();
  }

  return {
    wf,
    clientId,
    harness,
    modelSlug,
    exit: parseOrchestratorExit(markdown),
    runTime: parseWallSeconds(markdown),
    gradesDisplay,
    compactSlash,
  };
}

/**
 * @param {string} storeRoot
 * @param {string} readoutHref relative under docs/demos
 */
export function loadReadoutRegistryFields(storeRoot, readoutHref) {
  const full = path.join(storeRoot, "docs/demos", path.basename(readoutHref));
  const markdown = fs.readFileSync(full, "utf8");
  return scrapeReadoutForRegistryRow(markdown, path.basename(readoutHref));
}
