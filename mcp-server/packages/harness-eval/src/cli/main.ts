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

function usage(): void {
  console.error(`harness-eval — [REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM] M1

Usage:
  harness-eval suite validate <suite.yaml>
  harness-eval events import --wf-client <path> --trial-id <id> [--jsonl <path>]... [--store <dir>]
  harness-eval diagnostics [--store <dir>]
  harness-eval query summary [--store <dir>]
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
      const val = argv[++i];
      flags[key] = val;
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

import { pathToFileURL } from "node:url";

const invoked = process.argv[1]
  ? import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
  : false;
if (invoked) {
  process.exit(runCli(process.argv.slice(2)));
}
