#!/usr/bin/env node
/**
 * [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
 * W8-D6: Parameterized cohort replay against evaluation corpus disposable clients.
 *
 * Usage:
 *   node scripts/replay-adherence-fixtures.mjs \
 *     --corpus working/evaluation/evaluation-corpus.v1.yaml \
 *     [--filter 1789147101] \
 *     [--skip-run]
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STDD_ROOT = path.resolve(__dirname, "..");
const RUNNER = path.join(STDD_ROOT, "tools/bootstrap/templates/run-close-out-gates.mjs");

const FIXTURE_EXPECTATIONS = {
  "1789147101": {
    label: "FILEHASH PSA-rich gate-fail baseline",
    require_allowed: true,
    forbid_diagnostics_prefix: ["psa_missing:"],
    forbid_blocking_gaps: ["thin_ledger"],
  },
  "1789136889": {
    label: "TCP post-remediation regression",
    require_allowed: true,
  },
  "1789087315": {
    label: "DUPCOMPARE dual-write baseline",
    require_allowed: true,
    forbid_blocking_gaps: ["thin_ledger", "tracker_dual_write"],
  },
  "1789069630": {
    label: "MACOS document-only regression",
    require_envelope_visible_errors: true,
    forbid_silent_pass: true,
    allow_runner_error: true,
  },
};

function parseArgs(argv) {
  const get = (flag) => {
    const index = argv.indexOf(flag);
    return index >= 0 && argv[index + 1] ? argv[index + 1] : undefined;
  };
  return {
    corpusPath: path.resolve(get("--corpus") ?? "working/evaluation/evaluation-corpus.v1.yaml"),
    filter: get("--filter"),
    skipRun: argv.includes("--skip-run"),
    dryRun: argv.includes("--dry-run"),
  };
}

function discoverPaths(projectRoot, requestToken) {
  const trackerCandidates = [
    path.join(projectRoot, "working", requestToken, "agent-req-implementation-checklist.yaml"),
  ];
  const citdpCandidates = [
    path.join(projectRoot, "tied", "citdp", `CITDP-${requestToken}.yaml`),
    path.join(projectRoot, "working", requestToken, `CITDP-${requestToken}.yaml`),
  ];
  const tracker = trackerCandidates.find((item) => existsSync(item));
  const citdp = citdpCandidates.find((item) => existsSync(item));
  return { tracker, citdp };
}

function loadPhaseRunId(projectRoot, requestToken, phase) {
  const provenancePath = path.join(
    projectRoot,
    "working",
    requestToken,
    "adversarial-inquiry",
    `phase-${phase}`,
    "evidence-provenance.json",
  );
  if (!existsSync(provenancePath)) return undefined;
  try {
    const doc = JSON.parse(readFileSync(provenancePath, "utf8"));
    const runId = doc?.provenance?.run_id ?? doc?.provenance?.runId;
    return typeof runId === "string" && runId.trim() ? runId.trim() : undefined;
  } catch {
    return undefined;
  }
}

function runCloseOut(row) {
  const { project_root: projectRoot, request_token: requestToken, tied_base_path: tiedBase } = row;
  const { tracker, citdp } = discoverPaths(projectRoot, requestToken);
  if (!tracker || !citdp) {
    return { ok: false, error: "missing_tracker_or_citdp", tracker, citdp };
  }
  const phase = "close_out";
  const runId = loadPhaseRunId(projectRoot, requestToken, phase);
  const phaseDir = path.join(projectRoot, "working", requestToken, "adversarial-inquiry", `phase-${phase}`);
  const argv = [
    RUNNER,
    "--project-root",
    projectRoot,
    "--request-token",
    requestToken,
    "--tracker-path",
    tracker,
    "--citdp-path",
    citdp,
    "--phase",
    phase,
    "--envelope-blocking",
    "--sync-dispositions",
    "--reconcile",
  ];
  if (runId && existsSync(phaseDir)) {
    argv.push("--run-id", runId);
  }
  const stdout = execFileSync(process.execPath, argv, {
    cwd: STDD_ROOT,
    encoding: "utf8",
    env: {
      ...process.env,
      TIED_BASE_PATH: tiedBase ?? path.join(projectRoot, "tied"),
    },
  });
  return { ok: true, summary: JSON.parse(stdout) };
}

function gapCodes(summary) {
  const envelope = summary?.envelope;
  if (!envelope?.diagnostics) return [];
  return envelope.diagnostics
    .filter((item) => typeof item === "string" && item.includes(":"))
    .map((item) => item.split(":")[0]);
}

function evaluateExpectations(alias, result) {
  const expectations = FIXTURE_EXPECTATIONS[alias];
  if (!expectations) {
    return { ok: true, skipped: true, reason: "no_expectations" };
  }
  if (!result.ok) {
    if (expectations.allow_runner_error && expectations.require_envelope_visible_errors) {
      return { ok: true, expectations, note: "runner_error_allowed_for_document_only_fixture" };
    }
    return { ok: false, error: result.error, expectations };
  }
  const summary = result.summary;
  const merged = summary.merged_decision ?? {};
  const gateDiagnostics = summary.gate?.diagnostics ?? [];
  const failures = [];

  if (expectations.require_allowed === true && merged.allowed !== true) {
    failures.push(`expected merged_decision.allowed true, got ${merged.allowed}`);
  }
  if (expectations.require_allowed === false && merged.allowed === true) {
    failures.push("expected merged_decision.allowed false pre-remediation");
  }
  for (const prefix of expectations.forbid_diagnostics_prefix ?? []) {
    if (gateDiagnostics.some((d) => d.startsWith(prefix))) {
      failures.push(`forbidden gate diagnostic prefix ${prefix}`);
    }
  }
  for (const code of expectations.forbid_blocking_gaps ?? []) {
    if (gapCodes(summary).includes(code) && summary.envelope?.blocking_gap_count > 0) {
      failures.push(`forbidden blocking gap ${code}`);
    }
  }
  if (expectations.require_envelope_visible_errors) {
    const blocking = summary.envelope?.blocking_gap_count ?? 0;
    const advisory = summary.envelope?.advisory_gap_count ?? 0;
    if (blocking + advisory === 0) {
      failures.push("expected visible envelope gaps for document-only fixture");
    }
  }
  if (expectations.forbid_silent_pass && merged.allowed === true
    && (summary.envelope?.blocking_gap_count ?? 0) > 0) {
    failures.push("silent pass: merged allowed true with blocking envelope gaps");
  }

  return failures.length === 0
    ? { ok: true, expectations, summary }
    : { ok: false, failures, expectations, summary };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const corpus = yaml.load(readFileSync(args.corpusPath, "utf8"));
  const projects = (corpus.projects ?? []).filter((row) => row.project_root && row.request_token);
  const selected = args.filter
    ? projects.filter((row) => row.client_alias === args.filter || row.project_root.includes(args.filter))
    : projects.filter((row) => FIXTURE_EXPECTATIONS[row.client_alias]);

  const results = [];
  let failed = 0;
  for (const row of selected) {
    const alias = row.client_alias;
    if (args.skipRun) {
      results.push({ alias, ok: true, skipped: true });
      continue;
    }
    let replay;
    try {
      replay = runCloseOut(row);
    } catch (error) {
      replay = { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
    const evaluation = evaluateExpectations(alias, replay);
    if (!evaluation.ok) failed += 1;
    results.push({ alias, request_token: row.request_token, evaluation });
  }

  const report = { ok: failed === 0, replayed: results.length, failed, results };
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (failed > 0) process.exitCode = 1;
}

main();
