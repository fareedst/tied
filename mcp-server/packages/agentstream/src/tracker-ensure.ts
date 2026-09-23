/**
 * [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
 * EnsureTracker + materialize Authoritative Tracker (Go checklist/tracker.go parity).
 */
import fs from "node:fs";
import path from "node:path";

import yaml from "js-yaml";

import {
  GATE_SUB_PROCEDURE_SLUG,
  TRACKER_SCHEMA_VERSION,
} from "./checklist-constants.js";
import { refuseDefinitionAsTracker } from "./tracker-migration-preview.js";
import { atomicWriteYaml } from "./tracker-atomic-write.js";
import { loadTrackerYaml, type TrackerDoc } from "./tracker-yaml.js";

type ChecklistStep = { slug?: string };
type ChecklistSub = { slug?: string };
type ChecklistDoc = {
  name?: string;
  steps?: ChecklistStep[];
  sub_procedures?: ChecklistSub[];
};

function pendingStepRow(slug: string, kind: string): Record<string, unknown> {
  return { slug, kind, disposition: "pending" };
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

export function materializeAuthoritativeTracker(
  definitionPath: string,
  trackerPath: string,
  opts: { requestToken?: string; name?: string },
): void {
  refuseDefinitionAsTracker(definitionPath, trackerPath);
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
    throw new Error(`duplicate_slug: ${String(err)}`);
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

  const steps: Record<string, unknown>[] = [];
  const seen = new Set<string>();
  for (const step of doc.steps) {
    const slug = String(step.slug ?? "").trim();
    if (seen.has(slug)) {
      throw new Error(`duplicate_slug: ${JSON.stringify(slug)}`);
    }
    seen.add(slug);
    steps.push(pendingStepRow(slug, "main"));
  }
  if (!seen.has(GATE_SUB_PROCEDURE_SLUG)) {
    steps.push(pendingStepRow(GATE_SUB_PROCEDURE_SLUG, "sub_procedure"));
  }

  let name = String(opts.name ?? "").trim();
  if (name === "") {
    name = String(doc.name ?? "").trim();
  }
  const requestToken = String(opts.requestToken ?? "").trim();
  const tracker: Record<string, unknown> = {
    schema_version: TRACKER_SCHEMA_VERSION,
    source_document: path.normalize(definitionPath),
    steps,
    execution_evidence: {
      completed: [],
      request: requestToken,
    },
    state_history: [],
  };
  if (name !== "") {
    tracker.name = name;
  }
  if (requestToken !== "") {
    tracker.request_token = requestToken;
  }
  atomicWriteYaml(trackerPath, tracker);
}

export function validateTrackerIdentity(
  tracker: TrackerDoc,
  definitionPath: string,
  requestToken: string,
): void {
  if (tracker === null || typeof tracker !== "object") {
    throw new Error("malformed_tracker");
  }
  const wantSource = path.normalize(definitionPath);
  const gotSource = String(tracker.source_document ?? "").trim();
  if (gotSource !== "" && path.normalize(gotSource) !== wantSource) {
    throw new Error(
      `tracker source_document mismatch: got ${JSON.stringify(gotSource)} want ${JSON.stringify(wantSource)}`,
    );
  }
  const req = requestToken.trim();
  if (req === "") {
    return;
  }
  let gotReq = String(tracker.request_token ?? "").trim();
  if (gotReq === "") {
    const ee = tracker.execution_evidence;
    if (ee !== null && typeof ee === "object" && !Array.isArray(ee)) {
      gotReq = String((ee as Record<string, unknown>).request ?? "").trim();
    }
  }
  if (gotReq !== "" && gotReq !== req) {
    throw new Error(
      `tracker request_token mismatch: got ${JSON.stringify(gotReq)} want ${JSON.stringify(req)}`,
    );
  }
}

export function ensureTracker(
  definitionPath: string,
  trackerPath: string,
  requestToken: string,
): void {
  refuseDefinitionAsTracker(definitionPath, trackerPath);
  try {
    fs.accessSync(trackerPath, fs.constants.F_OK);
  } catch {
    materializeAuthoritativeTracker(definitionPath, trackerPath, {
      requestToken,
    });
    return;
  }
  const tracker = loadTrackerYaml(trackerPath);
  validateTrackerIdentity(tracker, definitionPath, requestToken);
}
