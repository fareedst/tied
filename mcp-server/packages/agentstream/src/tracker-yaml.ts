/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
 * Tracker YAML load helpers (Go checklist/tracker.go parity subset).
 */
import fs from "node:fs";
import yaml from "js-yaml";

export type TrackerDoc = Record<string, unknown>;

export function loadTrackerYaml(path: string): TrackerDoc {
  const data = fs.readFileSync(path, "utf8");
  let doc: unknown;
  try {
    doc = yaml.load(data);
  } catch (err) {
    throw new Error(`malformed_tracker: ${String(err)}`);
  }
  if (doc === null || typeof doc !== "object" || Array.isArray(doc)) {
    throw new Error(`malformed_tracker: invalid root in ${path}`);
  }
  return doc as TrackerDoc;
}

export function trackerStepSlugs(tracker: TrackerDoc): string[] {
  const stepsRaw = tracker.steps;
  if (!Array.isArray(stepsRaw)) {
    return [];
  }
  const out: string[] = [];
  for (const item of stepsRaw) {
    if (item === null || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }
    const row = item as Record<string, unknown>;
    const slug = String(row.slug ?? "").trim();
    if (slug !== "") {
      out.push(slug);
    }
  }
  return out;
}

export function trackerStepDispositions(
  tracker: TrackerDoc,
): Record<string, string> {
  const out: Record<string, string> = {};
  const stepsRaw = tracker.steps;
  if (!Array.isArray(stepsRaw)) {
    return out;
  }
  for (const item of stepsRaw) {
    if (item === null || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }
    const row = item as Record<string, unknown>;
    const slug = String(row.slug ?? "").trim();
    if (slug === "") {
      continue;
    }
    out[slug] = String(row.disposition ?? "").trim();
  }
  return out;
}
