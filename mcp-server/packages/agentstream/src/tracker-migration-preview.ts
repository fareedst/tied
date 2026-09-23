/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
 * Read-only tracker migration preview (Go checklist/tracker_migration_preview.go parity).
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

import {
  GATE_SUB_PROCEDURE_SLUG,
  STALE_REASON_STEP_REMOVED,
  TRACKER_MIGRATION_PREVIEW_SCHEMA,
} from "./checklist-constants.js";
import {
  loadTrackerYaml,
  trackerStepDispositions,
  trackerStepSlugs,
} from "./tracker-yaml.js";

type ChecklistStep = { slug?: string };
type ChecklistSub = { slug?: string };
type ChecklistDoc = {
  steps?: ChecklistStep[];
  sub_procedures?: ChecklistSub[];
};

export type StaleDisposition = {
  slug: string;
  disposition: string;
  reason: string;
};

export type TrackerMigrationPreviewReport = {
  schema_version: string;
  definition_path: string;
  tracker_path: string;
  read_only: boolean;
  definition_slugs: string[];
  tracker_slugs: string[];
  missing_in_tracker: string[];
  extra_in_tracker: string[];
  stale_dispositions: StaleDisposition[] | null;
  would_materialize_fresh: boolean;
};

export function refuseDefinitionAsTracker(
  definitionPath: string,
  trackerPath: string,
): void {
  const def = path.resolve(path.normalize(definitionPath));
  const track = path.resolve(path.normalize(trackerPath));
  if (def === track) {
    throw new Error(
      `tracker path must not equal checklist definition path: ${def}`,
    );
  }
}

function validateStepsHaveSlugs(steps: ChecklistStep[], filePath: string): void {
  for (let i = 0; i < steps.length; i++) {
    if (String(steps[i]?.slug ?? "").trim() === "") {
      throw new Error(
        `checklist step at "steps" index ${i} missing required "slug" in ${filePath}`,
      );
    }
  }
}

function validateDuplicateSlugs(steps: ChecklistStep[], filePath: string): void {
  const seen = new Map<string, number>();
  for (let i = 0; i < steps.length; i++) {
    const slug = String(steps[i]?.slug ?? "").trim();
    const prev = seen.get(slug);
    if (prev !== undefined) {
      throw new Error(
        `checklist duplicate slug ${JSON.stringify(slug)} at "steps" indices ${prev} and ${i} in ${filePath}`,
      );
    }
    seen.set(slug, i);
  }
}

export function definitionStepSlugs(definitionPath: string): string[] {
  let data: string;
  try {
    data = fs.readFileSync(definitionPath, "utf8");
  } catch (err) {
    throw new Error(`definition_not_readable: ${String(err)}`);
  }
  let doc: ChecklistDoc;
  try {
    doc = yaml.load(data) as ChecklistDoc;
  } catch (err) {
    throw new Error(`invalid_definition: ${String(err)}`);
  }
  if (doc.steps === undefined || doc.steps === null) {
    throw new Error(`invalid_definition: missing steps in ${definitionPath}`);
  }
  validateStepsHaveSlugs(doc.steps, definitionPath);
  try {
    validateDuplicateSlugs(doc.steps, definitionPath);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`duplicate_slug: ${msg}`);
  }

  let hasGateSub = false;
  for (const sub of doc.sub_procedures ?? []) {
    if (String(sub.slug ?? "").trim() === GATE_SUB_PROCEDURE_SLUG) {
      hasGateSub = true;
      break;
    }
  }
  if (!hasGateSub) {
    throw new Error(
      `missing_gate_sub_procedure: ${JSON.stringify(GATE_SUB_PROCEDURE_SLUG)} not found in sub_procedures`,
    );
  }

  const slugs: string[] = [];
  const seen = new Set<string>();
  for (const step of doc.steps) {
    const slug = String(step.slug ?? "").trim();
    if (seen.has(slug)) {
      throw new Error(`duplicate_slug: ${JSON.stringify(slug)}`);
    }
    seen.add(slug);
    slugs.push(slug);
  }
  if (!seen.has(GATE_SUB_PROCEDURE_SLUG)) {
    slugs.push(GATE_SUB_PROCEDURE_SLUG);
  }
  return slugs;
}

function slugSet(slugs: string[]): Set<string> {
  return new Set(slugs);
}

function sortedSetDiff(from: Set<string>, subtract: Set<string>): string[] {
  const out: string[] = [];
  for (const slug of from) {
    if (subtract.has(slug)) {
      continue;
    }
    out.push(slug);
  }
  out.sort();
  return out;
}

export function previewTrackerMigration(
  definitionPath: string,
  trackerPath: string,
): TrackerMigrationPreviewReport {
  const report: TrackerMigrationPreviewReport = {
    schema_version: TRACKER_MIGRATION_PREVIEW_SCHEMA,
    definition_path: path.normalize(definitionPath),
    tracker_path: path.normalize(trackerPath),
    read_only: true,
    definition_slugs: [],
    tracker_slugs: [],
    missing_in_tracker: [],
    extra_in_tracker: [],
    stale_dispositions: null,
    would_materialize_fresh: false,
  };

  refuseDefinitionAsTracker(definitionPath, trackerPath);

  const defSlugs = definitionStepSlugs(definitionPath);
  report.definition_slugs = [...defSlugs];

  let tracker;
  try {
    tracker = loadTrackerYaml(trackerPath);
  } catch (err) {
    throw new Error(`tracker_not_readable: ${String(err)}`);
  }

  const trackSlugs = trackerStepSlugs(tracker);
  report.tracker_slugs = [...trackSlugs];

  const defSet = slugSet(defSlugs);
  const trackSet = slugSet(trackSlugs);
  report.missing_in_tracker = sortedSetDiff(defSet, trackSet);
  report.extra_in_tracker = sortedSetDiff(trackSet, defSet);

  const dispositions = trackerStepDispositions(tracker);
  const stale: StaleDisposition[] = [];
  for (const slug of report.extra_in_tracker) {
    const disp = dispositions[slug] ?? "";
    if (disp === "" || disp === "pending") {
      continue;
    }
    stale.push({
      slug,
      disposition: disp,
      reason: STALE_REASON_STEP_REMOVED,
    });
  }
  stale.sort((a, b) => a.slug.localeCompare(b.slug));
  report.stale_dispositions = stale.length > 0 ? stale : null;

  return report;
}

export function encodePreviewReport(
  report: TrackerMigrationPreviewReport,
): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}
