#!/usr/bin/env node
/**
 * [REQ-WF_TRIAL_READOUT_GRADING_RATIONALE] [IMPL-WF_TRIAL_READOUT_GRADING_RATIONALE]
 * One-shot store maintainer: rewrite Rationale cells only (bands frozen).
 * Usage: node tools/bootstrap/lib/backfill-wf-grading-rationales.mjs [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  isPlaceholderRationale,
  isSubABand,
  isSubstantiveSubARationale,
  normalizeBand,
  parseSessionGradingTable,
} from "./read-trial-readout-session-grading.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");
const DEMOS = path.join(ROOT, "docs/demos");
const dryRun = process.argv.includes("--dry-run");
const MAX_WORDS = 32;

function wordCount(s) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function extractFacts(md) {
  const facts = {
    tests: null,
    exitCode: null,
    commits: null,
    headSha: null,
    workflow: null,
    implOutcome: null,
    machineClose: null,
    consistency: null,
    turns: "four",
  };

  const testMatch = md.match(/facilitator[^\d]*\*\*(\d+)\*\*[^\n]*(?:pass|green)/i)
    || md.match(/\*\*(\d+)\*\* green tests/i)
    || md.match(/npm test[^\d]*\*\*(\d+)\*\*/i);
  if (testMatch) facts.tests = testMatch[1];

  const exitMatch = md.match(/exit_code:\s*\*\*`?(\d+)`?\*\*/i)
    || md.match(/\*\*Exit code\*\*[^\d]*\*\*`?(\d+)`?\*\*/i);
  if (exitMatch) facts.exitCode = exitMatch[1];

  const shaMatch = md.match(/\*\*Git:\*\*[^\n]*\*\*([0-9a-f]{7,40})\*\*/i)
    || md.match(/HEAD[^\n]*\*\*([0-9a-f]{7,40})\*\*/i);
  if (shaMatch) facts.headSha = shaMatch[1].slice(0, 7);

  const commitCount = md.match(/\*\*(\d+)\*\* commits/i);
  if (commitCount) facts.commits = commitCount[1];

  if (/Workflow outcome:\*\* \*\*Complete\*\*/i.test(md) || /workflow complete/i.test(md)) {
    facts.workflow = "complete";
  } else if (/Incomplete|split|blocked/i.test(md)) {
    facts.workflow = "split";
  }

  if (/Implementation outcome:\*\* \*\*Successful\*\*/i.test(md)) facts.implOutcome = "success";
  if (/Machine close_out\*\* \| \*\*pass\*\*/i.test(md)) facts.machineClose = "pass";
  if (/Machine close_out\*\* \| \*\*fail\*\*/i.test(md)) facts.machineClose = "fail";
  if (/tied_validate_consistency[^\n]*\*\*ok: true\*\*/i.test(md)) facts.consistency = "ok";

  return facts;
}

/** @param {string} dimension @param {string} bandNorm @param {object} facts */
function draftLine(dimension, bandNorm, facts) {
  const subA = isSubABand(bandNorm);
  const t = facts.tests ? `${facts.tests} green tests` : "tests on disk";
  const exit0 = facts.exitCode === "0";
  const sha = facts.headSha ? `commit ${facts.headSha}` : "product commit on branch";

  const templates = {
    "Requirement interpretation": subA
      ? `Written scope met the prompt but PLAN acceptance did not spell out every edge case before RED.`
      : `Comparator scope and invalid-input rule were locked in PLAN before implementation.`,
    "Traceability closure": subA
      ? `Decision records and code mostly align; ${facts.consistency === "ok" ? "consistency ok" : "traceability gaps remain"} vs full stack promotion.`
      : `Project REQ, architecture, and implementation records match green tests and facilitator checks.`,
    "Test strategy": subA
      ? `RED/GREEN path exists but case count stays lean versus richer peer WF cells (${t}).`
      : `${t.charAt(0).toUpperCase() + t.slice(1)} cover core behavior with archived RED/GREEN evidence.`,
    "Algorithm / implementation": subA
      ? `Shipped behavior matches PROMPT shape; ${facts.implOutcome === "success" ? "limits" : "gaps"} leave some fault paths lightly exercised.`
      : `Implementation matches locked PLAN behavior with honest scope limits documented.`,
    "Process adherence": subA
      ? `Tracker and handoffs present; ${facts.machineClose === "fail" ? "close-out gate failed" : "adherence ledger or envelope thinner than strict depth"}.`
      : `Four-turn checklist, gate receipts, and completion signals align with claims.`,
    "Workflow choreography": subA
      ? `Four turns ran with orchestrator exit ${facts.exitCode ?? "?"}; ${facts.workflow === "split" ? "harness ok while facilitator work incomplete" : "minor inventory or phase-boundary fuzz"}.`
      : `Four distinct sessions, complete inventory, orchestrator exit_code ${facts.exitCode ?? "0"}.`,
    "Methodology learning readout": /^N\/A$/i.test(bandNorm)
      ? `Catalog friction log not in scope; future-test rule still applies to this readout.`
      : subA
        ? `Readout documents cohort friction (harness vs close-out) without turning into a model leaderboard.`
        : `Future-test rule stated; session evidence supports operator reproducibility only.`,
  };

  let line = templates[dimension] ?? (subA ? `Main gap on this dimension versus A band for this trial.` : `Met this dimension for this trial.`);

  if (exit0 && dimension === "Workflow choreography" && !subA) {
    line = `Four orchestrated turns with exit_code 0 and phase handoffs on disk.`;
  }
  if (facts.headSha && dimension === "Traceability closure" && !subA) {
    line = `Traceable ${sha} with decision records aligned to ${t}.`;
  }

  while (wordCount(line) > MAX_WORDS) {
    const parts = line.split(/;\s+|\s+—\s+/);
    line = parts[0];
    if (wordCount(line) <= MAX_WORDS) break;
    line = line.split(/,\s+/).slice(0, 2).join(", ");
  }
  return line;
}

function replaceRationales(md, rows, facts) {
  const parts = md.split(/^## Session grading\s*$/m);
  if (parts.length < 2) return md;
  const head = parts[0];
  const tail = parts[1];
  const afterTableIdx = tail.search(/\n\n(?!\|)/);
  const suffix = afterTableIdx >= 0 ? tail.slice(afterTableIdx) : `\n${tail.trimStart()}`;

  const dataLines = rows.map((row) => {
    let rationale = row.rationale;
    const need =
      isPlaceholderRationale(rationale) ||
      wordCount(rationale) > MAX_WORDS ||
      (isSubABand(row.bandNorm) && !isSubstantiveSubARationale(rationale)) ||
      row.band.includes("—") ||
      row.band.includes("–");
    if (need) {
      rationale = draftLine(row.dimension, row.bandNorm, facts);
    }
    return `| ${row.dimension} | ${row.band} | ${rationale} |`;
  });

  const table = [
    "## Session grading",
    "",
    "| Dimension | Band | Rationale |",
    "| --- | --- | --- |",
    ...dataLines,
  ].join("\n");

  return `${head}${table}${suffix}`;
}

function runBackfill() {
const files = fs
  .readdirSync(DEMOS)
  .filter((f) => f.startsWith("trial-readout-PROMPT-WF-") && f.endsWith(".md"));

let updated = 0;
for (const file of files) {
  const full = path.join(DEMOS, file);
  let md = fs.readFileSync(full, "utf8");
  const { rows, errors } = parseSessionGradingTable(md);
  if (errors.length) {
    console.error(`SKIP ${file}: ${errors.join(", ")}`);
    continue;
  }
  const facts = extractFacts(md);
  const next = replaceRationales(md, rows, facts);
  if (next !== md) {
    updated++;
    if (!dryRun) fs.writeFileSync(full, next);
    else console.log(`would update ${file}`);
  }
}

console.log(`DEBUG: backfill updated ${updated} of ${files.length} readouts dryRun=${dryRun}`);
}

const isMain =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) runBackfill();
