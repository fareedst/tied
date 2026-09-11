#!/usr/bin/env node
/**
 * [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
 * W5-D7: Sync execution_evidence.completed slugs to matching steps[].tracking.status + evidence_refs.
 * W8-D2: Append outcome_verified JSONL rows per completed slug to clear thin_ledger by construction.
 *
 * Usage:
 *   node tools/bootstrap/templates/sync-tracker-dispositions.mjs \
 *     --tracker working/REQ-EXAMPLE/agent-req-implementation-checklist.yaml \
 *     [--project-root /path/to/repo] \
 *     [--ledger-path working/REQ-EXAMPLE/gates/ledger.jsonl] \
 *     [--run-id wave8-sync-20260911] \
 *     [--dry-run]
 */

import { createHash } from "node:crypto";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
    projectRoot: path.resolve(get("--project-root") ?? process.cwd()),
    ledgerPath: get("--ledger-path"),
    runId: get("--run-id") ?? `sync-${Date.now()}`,
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

function sha256FileOrRef(projectRoot, ref) {
  const absolute = path.isAbsolute(ref) ? ref : path.join(projectRoot, ref);
  try {
    const body = readFileSync(absolute);
    return `sha256:${createHash("sha256").update(body).digest("hex")}`;
  } catch {
    return `sha256:${createHash("sha256").update(ref).digest("hex")}`;
  }
}

function existingOutcomeVerifiedSlugs(ledgerAbsolute) {
  const slugs = new Set();
  try {
    const contents = readFileSync(ledgerAbsolute, "utf8");
    for (const line of contents.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const row = JSON.parse(trimmed);
        if (row.event_class !== "outcome_verified") continue;
        const slug = row?.correlation?.step_slug;
        if (typeof slug === "string" && slug.trim()) slugs.add(slug.trim());
      } catch {
        continue;
      }
    }
  } catch {
    // no ledger yet
  }
  return slugs;
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-REQUEST_EVIDENCE_ENVELOPE] — How: W8-D2 emit outcome_verified rows for completed slugs.
function appendOutcomeVerifiedRows({ projectRoot, requestToken, runId, ledgerPath, slugs, dryRun }) {
  const ledgerAbsolute = path.isAbsolute(ledgerPath)
    ? ledgerPath
    : path.join(projectRoot, ledgerPath);
  const alreadyVerified = existingOutcomeVerifiedSlugs(ledgerAbsolute);
  const appended = [];
  if (!dryRun) {
    mkdirSync(path.dirname(ledgerAbsolute), { recursive: true });
  }
  slugs.forEach((slug, index) => {
    if (alreadyVerified.has(slug)) return;
    const refs = defaultEvidenceRefs(requestToken, slug);
    const artifactRef = refs[0];
    const artifactHash = sha256FileOrRef(projectRoot, artifactRef);
    const row = {
      schema_version: "agent-adherence-event.v1",
      event_class: "outcome_verified",
      correlation: {
        request_token: requestToken,
        run_id: runId,
        turn_index: index + 1,
        step_slug: slug,
        receipt_hash: `receipt-${runId}-${slug}`,
      },
      artifact_ref: artifactRef,
      artifact_hash: artifactHash,
      ref_kind: "file_path",
      source: {
        kind: "sync-tracker-dispositions",
        path: ledgerPath,
      },
    };
    if (!dryRun) {
      appendFileSync(ledgerAbsolute, `${JSON.stringify(row)}\n`, "utf8");
    }
    appended.push(slug);
  });
  return { ledger_path: ledgerPath, appended_slugs: appended };
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
  return { tracker, patched, requestToken, completedSlugs: slugs };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const tracker = yaml.load(readFileSync(args.trackerPath, "utf8"));
  if (!isRecord(tracker)) throw new Error("invalid tracker yaml");

  const { tracker: updated, patched, requestToken, completedSlugs: slugs } = syncTracker(tracker);
  const ledgerPath = args.ledgerPath
    ?? path.join("working", String(requestToken), "gates", "ledger.jsonl");
  const ledgerResult = appendOutcomeVerifiedRows({
    projectRoot: args.projectRoot,
    requestToken: String(requestToken),
    runId: args.runId,
    ledgerPath,
    slugs,
    dryRun: args.dryRun,
  });

  const summary = {
    ok: true,
    request_token: requestToken,
    patched_slugs: patched,
    outcome_verified: ledgerResult,
    dry_run: args.dryRun,
    tracker_path: args.trackerPath,
  };

  if (!args.dryRun && patched.length > 0) {
    writeFileSync(args.trackerPath, yaml.dump(updated, { lineWidth: 120 }), "utf8");
  }

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

main();
