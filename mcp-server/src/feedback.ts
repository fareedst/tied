/**
 * Feedback storage for TIED: load/append/export entries in tied/feedback.yaml.
 * [REQ-FEEDBACK_TO_TIED] [ARCH-FEEDBACK_STORAGE] [IMPL-MCP_FEEDBACK_TOOLS]
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { getBasePath } from "./yaml-loader.js";

export const FEEDBACK_TYPES = ["feature_request", "bug_report", "methodology_improvement"] as const;
export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export interface FeedbackEntry {
  id: string;
  type: FeedbackType;
  title: string;
  description: string;
  context?: Record<string, unknown>;
  created_at: string;
}

export interface FeedbackData {
  entries: FeedbackEntry[];
}

/**
 * Resolve path to feedback.yaml. [ARCH-FEEDBACK_STORAGE]
 * @param basePath - Optional override for TIED base path (default: getBasePath())
 */
export function getFeedbackPath(basePath?: string): string {
  const base = basePath ?? getBasePath();
  return path.join(base, "feedback.yaml");
}

/**
 * Load feedback.yaml or return default structure. [IMPL-MCP_FEEDBACK_TOOLS]
 * Does not create the file; appendEntry creates it on first write.
 */
export function loadFeedback(basePath?: string): FeedbackData {
  const filePath = getFeedbackPath(basePath);
  if (!fs.existsSync(filePath)) {
    return { entries: [] };
  }
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const data = yaml.load(raw) as unknown;
    if (data !== null && typeof data === "object" && !Array.isArray(data)) {
      const obj = data as Record<string, unknown>;
      const entries = Array.isArray(obj.entries) ? obj.entries : [];
      return { entries: entries as FeedbackEntry[] };
    }
  } catch {
    // invalid or empty -> default
  }
  return { entries: [] };
}

/**
 * Generate a unique id for a new entry (timestamp + random suffix to avoid collisions).
 */
function generateId(): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return `fb-${t}-${r}`;
}

export interface AppendEntryParams {
  type: FeedbackType;
  title: string;
  description: string;
  context?: Record<string, unknown>;
}

export interface AppendEntryResult {
  ok: boolean;
  id?: string;
  created_at?: string;
  error?: string;
}

/**
 * Append one feedback entry. [REQ-FEEDBACK_TO_TIED] Validates type, title, description; writes file.
 */
export function appendEntry(
  params: AppendEntryParams,
  basePath?: string
): AppendEntryResult {
  const { type, title, description, context } = params;
  if (!FEEDBACK_TYPES.includes(type)) {
    return { ok: false, error: `Invalid type: ${type}. Must be one of ${FEEDBACK_TYPES.join(", ")}` };
  }
  const trimmedTitle = typeof title === "string" ? title.trim() : "";
  if (!trimmedTitle) {
    return { ok: false, error: "title is required and must be non-empty" };
  }
  const trimmedDesc = typeof description === "string" ? description.trim() : "";
  if (!trimmedDesc) {
    return { ok: false, error: "description is required and must be non-empty" };
  }
  const id = generateId();
  const created_at = new Date().toISOString();
  const entry: FeedbackEntry = {
    id,
    type,
    title: trimmedTitle,
    description: trimmedDesc,
    created_at,
  };
  if (context !== undefined && context !== null && typeof context === "object") {
    entry.context = context as Record<string, unknown>;
  }
  const data = loadFeedback(basePath);
  data.entries.push(entry);
  const filePath = getFeedbackPath(basePath);
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, yaml.dump({ entries: data.entries }, { lineWidth: -1 }), "utf8");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `Failed to write feedback file: ${msg}` };
  }
  return { ok: true, id, created_at };
}

/**
 * Export entries as markdown for reporting to TIED. [REQ-FEEDBACK_TO_TIED]
 */
export function exportMarkdown(entries: FeedbackEntry[]): string {
  const lines: string[] = [];
  for (const e of entries) {
    lines.push(`## ${e.type}: ${e.title}`);
    lines.push("");
    lines.push(e.description);
    if (e.context && Object.keys(e.context).length > 0) {
      lines.push("");
      lines.push("**Context:**");
      lines.push("```json");
      lines.push(JSON.stringify(e.context, null, 2));
      lines.push("```");
    }
    lines.push("");
    lines.push(`*ID: ${e.id} | Created: ${e.created_at}*`);
    lines.push("");
    lines.push("---");
    lines.push("");
  }
  return lines.join("\n").trimEnd() || "(No feedback entries)";
}

/**
 * Export entries as JSON string for reporting to TIED.
 */
export function exportJson(entries: FeedbackEntry[]): string {
  return JSON.stringify(entries, null, 2);
}

/**
 * Build a copy-paste-ready markdown snippet for a single entry (e.g. for GitHub issue).
 */
export function buildReportSnippet(entry: FeedbackEntry): string {
  const lines: string[] = [
    `### ${entry.type}: ${entry.title}`,
    "",
    entry.description,
  ];
  if (entry.context && Object.keys(entry.context).length > 0) {
    lines.push("", "**Context:**", "```json", JSON.stringify(entry.context, null, 2), "```");
  }
  lines.push("", `*Reported at ${entry.created_at} (ID: ${entry.id})*`);
  return lines.join("\n");
}
