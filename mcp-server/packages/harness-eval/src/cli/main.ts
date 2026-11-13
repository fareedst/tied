#!/usr/bin/env node
/**
 * [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] harness-eval CLI — F-17 subset
 */
import fs from "node:fs";
import path from "node:path";
import { resolveStoreRoot, ensureStoreLayout } from "../config/paths.js";
import { openEvalDatabase } from "../store/db.js";
import { crossHarnessSummaryJson } from "../store/query.js";
import { loadSuiteFile } from "../suite/load.js";
import { validateSuiteIntegrity } from "../suite/integrity.js";
import { importWfClient } from "../runner/import-wf.js";
import { formatDiagnosticsReport } from "./diagnostics.js";
import { cohortReportJson } from "../report/cohort.js";
import { getTrialRow } from "../store/query.js";
import {
  allVerifiersPass,
  findScenarioForWfId,
  runTrialVerifiers,
  type SuiteScenario,
} from "../verify/trial.js";
import { importBillingLedger } from "../billing/import.js";
import { reconcileReportJson } from "../report/reconcile.js";
import { validateRegressionBaselineIntegrity } from "../regression/baseline.js";
import { compareTrialToBaselineFile } from "../regression/compare.js";
import { replayBatchFromManifest } from "../runner/replay.js";

function usage(): void {
  console.error(`harness-eval — [REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM]

Usage:
  harness-eval suite validate <suite.yaml>
  harness-eval events import --wf-client <path> --trial-id <id> [--jsonl <path>]... [--store <dir>]
  harness-eval diagnostics [--store <dir>]
  harness-eval query summary [--store <dir>]
  harness-eval report cohort [--store <dir>]
  harness-eval report reconcile [--store <dir>]
  harness-eval billing import --ledger <ledger.yaml> [--store <dir>]
  harness-eval verify trial --trial-id <id> --suite <suite.yaml> [--store <dir>]
  harness-eval regression baseline validate <baseline.yaml>
  harness-eval regression compare --baseline <baseline.yaml> --trial-id <id> [--store <dir>] [--no-strict]
  harness-eval replay batch --manifest <replay-manifest.yaml> [--store <dir>]
`);
}

function parseArgs(argv: string[]): {
  cmd: string[];
  flags: Record<string, string | string[] | boolean>;
} {
  const cmd: string[] = [];
  const flags: Record<string, string | string[] | boolean> = {};
  let i = 0;
  while (i < argv.length) {
    const a = argv[i];
    if (a === "--jsonl") {
      const p = argv[++i];
      const cur = flags.jsonl;
      if (typeof cur === "string") {
        flags.jsonl = [cur, p];
      } else if (Array.isArray(cur)) {
        cur.push(p);
      } else {
        flags.jsonl = p;
      }
      i++;
      continue;
    }
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) {
        flags[key] = true;
      } else {
        flags[key] = next;
        i++;
      }
      i++;
      continue;
    }
    cmd.push(a);
    i++;
  }
  return { cmd, flags };
}

export function runCli(argv: string[]): number {
  const { cmd, flags } = parseArgs(argv);
  if (cmd.length === 0) {
    usage();
    return 2;
  }
  if (cmd[0] === "suite" && cmd[1] === "validate") {
    const suitePath = cmd[2];
    if (!suitePath) {
      usage();
      return 2;
    }
    const doc = loadSuiteFile(suitePath) as unknown as Record<string, unknown>;
    const result = validateSuiteIntegrity(doc);
    if (!result.ok) {
      console.error(
        `DIAGNOSTIC: suite integrity mismatch expected=${result.expected} actual=${result.actual}`,
      );
      return 1;
    }
    console.log(`DEBUG: suite validate ok ${doc.suite_id ?? suitePath}`);
    return 0;
  }
  if (cmd[0] === "events" && cmd[1] === "import") {
    const client = flags["wf-client"];
    const trialId = flags["trial-id"];
    if (typeof client !== "string" || typeof trialId !== "string") {
      usage();
      return 2;
    }
    const jsonlRaw = flags.jsonl;
    const jsonlPaths = Array.isArray(jsonlRaw)
      ? jsonlRaw
      : typeof jsonlRaw === "string"
        ? [jsonlRaw]
        : [];
    const store = typeof flags.store === "string" ? flags.store : undefined;
    const { observationsInserted } = importWfClient({
      clientRoot: path.resolve(client),
      trialId,
      jsonlPaths: jsonlPaths.map((p) => path.resolve(p)),
      storeRoot: store,
    });
    console.log(
      `TRACE: import wf-client trial_id=${trialId} observations_inserted=${observationsInserted}`,
    );
    return 0;
  }
  if (cmd[0] === "diagnostics") {
    const storeRoot = resolveStoreRoot(typeof flags.store === "string" ? flags.store : undefined);
    ensureStoreLayout(storeRoot);
    console.log(formatDiagnosticsReport(storeRoot));
    return 0;
  }
  if (cmd[0] === "billing" && cmd[1] === "import") {
    const ledger = flags.ledger;
    if (typeof ledger !== "string") {
      usage();
      return 2;
    }
    const storeRoot = resolveStoreRoot(typeof flags.store === "string" ? flags.store : undefined);
    const { dbPath } = ensureStoreLayout(storeRoot);
    if (!fs.existsSync(dbPath)) {
      console.error("DEBUG: no eval store — import trials before billing ledger");
      return 1;
    }
    const db = openEvalDatabase(dbPath);
    const result = importBillingLedger(db, path.resolve(ledger));
    db.close();
    console.log(JSON.stringify(result, null, 2));
    console.log(
      `TRACE: billing import ledger_revision=${result.ledger_revision} updated=${result.updated} skipped=${result.skipped_unknown_trial.length}`,
    );
    return 0;
  }
  if (cmd[0] === "report" && cmd[1] === "reconcile") {
    const storeRoot = resolveStoreRoot(typeof flags.store === "string" ? flags.store : undefined);
    const { dbPath } = ensureStoreLayout(storeRoot);
    if (!fs.existsSync(dbPath)) {
      console.log(JSON.stringify({ trials: [] }, null, 2));
      return 0;
    }
    const db = openEvalDatabase(dbPath);
    console.log(reconcileReportJson(db));
    db.close();
    return 0;
  }
  if (cmd[0] === "report" && cmd[1] === "cohort") {
    const storeRoot = resolveStoreRoot(typeof flags.store === "string" ? flags.store : undefined);
    const { dbPath } = ensureStoreLayout(storeRoot);
    if (!fs.existsSync(dbPath)) {
      console.log(JSON.stringify({ by_wf_id: {}, trials: [] }, null, 2));
      return 0;
    }
    const db = openEvalDatabase(dbPath);
    console.log(cohortReportJson(db));
    db.close();
    return 0;
  }
  if (cmd[0] === "verify" && cmd[1] === "trial") {
    const trialId = flags["trial-id"];
    const suitePath = flags.suite;
    if (typeof trialId !== "string" || typeof suitePath !== "string") {
      usage();
      return 2;
    }
    const storeRoot = resolveStoreRoot(typeof flags.store === "string" ? flags.store : undefined);
    const { dbPath } = ensureStoreLayout(storeRoot);
    if (!fs.existsSync(dbPath)) {
      console.error("DEBUG: no eval store");
      return 1;
    }
    const db = openEvalDatabase(dbPath);
    const trial = getTrialRow(db, trialId);
    if (!trial) {
      console.error(`DEBUG: unknown trial_id=${trialId}`);
      db.close();
      return 1;
    }
    const suiteDoc = loadSuiteFile(suitePath) as { scenarios?: SuiteScenario[] };
    const scenario = findScenarioForWfId(suiteDoc.scenarios ?? [], trial.wf_id);
    const results = runTrialVerifiers(db, trial, scenario);
    console.log(JSON.stringify({ trial_id: trialId, results }, null, 2));
    const code = allVerifiersPass(results) ? 0 : 1;
    db.close();
    return code;
  }
  if (cmd[0] === "regression" && cmd[1] === "baseline" && cmd[2] === "validate") {
    const baselinePath = cmd[3];
    if (!baselinePath) {
      usage();
      return 2;
    }
    const result = validateRegressionBaselineIntegrity(path.resolve(baselinePath));
    if (!result.ok) {
      console.error(
        `DIAGNOSTIC: baseline integrity mismatch expected=${result.expected} actual=${result.actual}`,
      );
      return 1;
    }
    console.log(`DEBUG: baseline validate ok ${baselinePath}`);
    return 0;
  }
  if (cmd[0] === "regression" && cmd[1] === "compare") {
    const baseline = flags.baseline;
    const trialId = flags["trial-id"];
    if (typeof baseline !== "string" || typeof trialId !== "string") {
      usage();
      return 2;
    }
    const storeRoot = resolveStoreRoot(typeof flags.store === "string" ? flags.store : undefined);
    const { dbPath } = ensureStoreLayout(storeRoot);
    if (!fs.existsSync(dbPath)) {
      console.error("DEBUG: no eval store");
      return 1;
    }
    const db = openEvalDatabase(dbPath);
    let summary;
    try {
      summary = compareTrialToBaselineFile(db, trialId, path.resolve(baseline));
    } catch (err) {
      console.error((err as Error).message);
      db.close();
      return 1;
    }
    console.log(JSON.stringify(summary, null, 2));
    const strict = flags["no-strict"] !== true;
    db.close();
    return strict && !summary.ok ? 1 : 0;
  }
  if (cmd[0] === "replay" && cmd[1] === "batch") {
    const manifest = flags.manifest;
    if (typeof manifest !== "string") {
      usage();
      return 2;
    }
    const storeRoot = resolveStoreRoot(typeof flags.store === "string" ? flags.store : undefined);
    try {
      const result = replayBatchFromManifest({
        manifestPath: path.resolve(manifest),
        storeRoot,
      });
      console.log(JSON.stringify(result, null, 2));
      console.log(
        `TRACE: replay batch revision=${result.manifest_revision} imported=${result.entries.filter((e) => e.status === "imported").length} skipped=${result.skipped_missing_client_root.length}`,
      );
      return 0;
    } catch (err) {
      console.error((err as Error).message);
      return 1;
    }
  }
  if (cmd[0] === "query" && cmd[1] === "summary") {
    const storeRoot = resolveStoreRoot(typeof flags.store === "string" ? flags.store : undefined);
    const { dbPath } = ensureStoreLayout(storeRoot);
    if (!fs.existsSync(dbPath)) {
      console.log(JSON.stringify({ by_harness: {}, trials: [] }, null, 2));
      return 0;
    }
    const db = openEvalDatabase(dbPath);
    console.log(crossHarnessSummaryJson(db));
    db.close();
    return 0;
  }
  usage();
  return 2;
}

import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

function cliEntryMatched(): boolean {
  if (!process.argv[1]) {
    return false;
  }
  try {
    const entry = realpathSync(path.resolve(process.argv[1]));
    const self = realpathSync(fileURLToPath(import.meta.url));
    return entry === self;
  } catch {
    return false;
  }
}

if (cliEntryMatched()) {
  process.exit(runCli(process.argv.slice(2)));
}
