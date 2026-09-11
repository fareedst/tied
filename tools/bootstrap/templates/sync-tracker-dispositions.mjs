#!/usr/bin/env node
/**
 * [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
 * W5-D7: Sync execution_evidence.completed slugs to matching steps[].tracking.status + evidence_refs.
 *
 * Usage:
 *   node tools/bootstrap/templates/sync-tracker-dispositions.mjs \
 *     --tracker working/REQ-EXAMPLE/agent-req-implementation-checklist.yaml \
 *     [--dry-run]
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

function parseArgs(argv) {
  const get = (flag) => {
    const index = argv.indexOf(flag);
    return index >= 0 && argv[index + 1] ? argv[index + 1] : undefined;
  };
  const tracker = get("--tracker");
  if (!tracker) throw new Error("missing --tracker");
  return {
    trackerPath: path.resolve(tracker),
    dryRun: argv.includes("--dry-run"),
  };
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function completedSlugs(tracker) {
  const ee = isRecord(tracker.execution_evidence) ? tracker.execution_evidence : null;
  const completed = ee?.completed;
  if (!Array.isArray(completed)) return [];
  return completed.filter((item) => typeof item === "string" && item.trim());
}

function defaultEvidenceRefs(requestToken, slug) {
  const base = `working/${requestToken}/evidence`;
  if (slug === "verification-gate") {
    return [`${base}/verification-evidence-manifest.v1.json`];
  }
  if (slug === "persist-citdp-record") {
    return [`working/${requestToken}/CITDP-${requestToken}.yaml`];
  }
  return [`${base}/${slug}-evidence.md`];
}

function syncTracker(tracker) {
  const requestToken = typeof tracker.request === "string"
    ? tracker.request
    : (isRecord(tracker.execution_evidence) ? tracker.execution_evidence.request : "REQ-UNKNOWN");
  const slugs = completedSlugs(tracker);
  if (!Array.isArray(tracker.steps)) {
    tracker.steps = [];
  }

  const patched = [];
  for (const slug of slugs) {
    let step = tracker.steps.find((item) => isRecord(item) && item.slug === slug);
    if (!step) {
      step = { slug, tracking: { status: "pending" } };
      tracker.steps.push(step);
    }
    if (!isRecord(step.tracking)) {
      step.tracking = {};
    }
    if (step.tracking.status === "pending" || !step.tracking.status) {
      step.tracking.status = "completed";
      step.disposition = "completed";
      const refs = defaultEvidenceRefs(String(requestToken), slug);
      step.evidence_refs = refs;
      step.tracking.evidence_refs = refs;
      patched.push(slug);
    }
  }
  return { tracker, patched, requestToken };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const tracker = yaml.load(readFileSync(args.trackerPath, "utf8"));
  if (!isRecord(tracker)) throw new Error("invalid tracker yaml");

  const { tracker: updated, patched, requestToken } = syncTracker(tracker);
  const summary = {
    ok: true,
    request_token: requestToken,
    patched_slugs: patched,
    dry_run: args.dryRun,
    tracker_path: args.trackerPath,
  };

  if (!args.dryRun && patched.length > 0) {
    writeFileSync(args.trackerPath, yaml.dump(updated, { lineWidth: 120 }), "utf8");
  }

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

main();
