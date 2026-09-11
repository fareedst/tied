#!/usr/bin/env node
/**
 * [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] W7-D1: transcript scoring rubric CLI.
 * Emits conversation-adherence-report.v1.yaml — read-only, not a gate substitute.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  DIMENSION_IDS,
  parseTranscriptLines,
  scoreAllDimensions,
} from "./lib/conversation-adherence-dimensions.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function usage() {
  console.log(`Usage: node scripts/conversation-adherence-score.mjs [options]

Options:
  --help
  --transcript-dir PATH       Directory of *.jsonl transcripts (recursive)
  --transcript PATH           Single transcript file (repeatable)
  --project-root PATH         Project root for disk artifact checks
  --request-token TOKEN       REQ token for envelope/manifest paths
  --yaml-out PATH             Write conversation-adherence-report.v1.yaml
  --json                      Emit JSON to stdout instead of YAML
`);
}

function parseArgs(argv) {
  const out = {
    transcriptDir: "",
    transcripts: [],
    projectRoot: process.cwd(),
    requestToken: "",
    yamlOut: "",
    json: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--json") out.json = true;
    else if (arg === "--transcript-dir") out.transcriptDir = path.resolve(argv[++i] ?? "");
    else if (arg === "--transcript") out.transcripts.push(path.resolve(argv[++i] ?? ""));
    else if (arg === "--project-root") out.projectRoot = path.resolve(argv[++i] ?? "");
    else if (arg === "--request-token") out.requestToken = argv[++i] ?? "";
    else if (arg === "--yaml-out") out.yamlOut = argv[++i] ?? "";
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return out;
}

function collectTranscripts(transcriptDir, explicit) {
  const files = [...explicit];
  if (transcriptDir && fs.existsSync(transcriptDir)) {
    const stack = [transcriptDir];
    while (stack.length > 0) {
      const dir = stack.pop();
      for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) stack.push(full);
        else if (name.endsWith(".jsonl")) files.push(full);
      }
    }
  }
  return [...new Set(files)];
}

function diskContext(projectRoot, requestToken) {
  if (!requestToken) return {};
  const base = path.join(projectRoot, "working", requestToken, "evidence");
  const envelopePath = path.join(base, "request-evidence-envelope.v1.json");
  const manifestPath = path.join(base, "verification-evidence-manifest.v1.json");
  return {
    envelopePath: fs.existsSync(envelopePath) ? envelopePath : undefined,
    manifestPath: fs.existsSync(manifestPath) ? manifestPath : undefined,
  };
}

function toYaml(report) {
  const lines = [
    `schema_version: conversation-adherence-report.v1`,
    `proof_boundary: transcript_observation_only`,
    `generated_at: "${report.generated_at}"`,
    `sessions_scored: ${report.sessions_scored}`,
    `dimensions:`,
  ];
  for (const dim of report.dimensions) {
    lines.push(`  - id: ${dim.id}`);
    lines.push(`    numerator: ${dim.numerator}`);
    lines.push(`    denominator: ${dim.denominator}`);
    lines.push(`    flagged: ${dim.flagged}`);
    lines.push(`    proof_boundary: ${dim.proof_boundary}`);
    if (dim.evidence_refs?.length) {
      lines.push(`    evidence_refs:`);
      for (const ref of dim.evidence_refs) lines.push(`      - ${ref}`);
    }
  }
  lines.push(`sessions:`);
  for (const session of report.sessions) {
    lines.push(`  - transcript_path: ${JSON.stringify(session.transcript_path)}`);
    lines.push(`    session_id: ${JSON.stringify(session.session_id)}`);
    for (const dim of session.dimensions) {
      lines.push(`    - dimension: ${dim.id}`);
      lines.push(`      numerator: ${dim.numerator}`);
      lines.push(`      denominator: ${dim.denominator}`);
      lines.push(`      flagged: ${dim.flagged}`);
    }
  }
  return `${lines.join("\n")}\n`;
}

function aggregateDimensions(sessions) {
  const totals = Object.fromEntries(DIMENSION_IDS.map((id) => [id, { numerator: 0, denominator: 0, flagged: 0 }]));
  for (const session of sessions) {
    for (const dim of session.dimensions) {
      totals[dim.id].numerator += dim.numerator;
      totals[dim.id].denominator += dim.denominator;
      if (dim.flagged) totals[dim.id].flagged += 1;
    }
  }
  return DIMENSION_IDS.map((id) => ({
    id,
    hypothesis: id,
    numerator: totals[id].numerator,
    denominator: totals[id].denominator,
    flagged: totals[id].flagged > 0,
    proof_boundary: "transcript_observation_only",
    evidence_refs: totals[id].flagged > 0 ? [`aggregate:${id}`] : [],
  }));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return 0;
  }
  const files = collectTranscripts(args.transcriptDir, args.transcripts);
  if (files.length === 0) {
    throw new Error("no transcript files found; pass --transcript-dir or --transcript");
  }
  const disk = diskContext(args.projectRoot, args.requestToken);
  const sessions = files.map((filePath) => {
    const raw = fs.readFileSync(filePath, "utf8");
    const turns = parseTranscriptLines(raw);
    const dimensions = scoreAllDimensions(turns, disk);
    return {
      transcript_path: filePath,
      session_id: path.basename(filePath, ".jsonl"),
      dimensions,
    };
  });
  const report = {
    schema_version: "conversation-adherence-report.v1",
    proof_boundary: "transcript_observation_only",
    generated_at: new Date().toISOString(),
    sessions_scored: sessions.length,
    dimensions: aggregateDimensions(sessions),
    sessions,
  };
  const outText = args.json ? `${JSON.stringify(report, null, 2)}\n` : toYaml(report);
  process.stdout.write(outText);
  if (args.yamlOut) {
    fs.mkdirSync(path.dirname(path.resolve(args.yamlOut)), { recursive: true });
    fs.writeFileSync(path.resolve(args.yamlOut), outText);
  }
  process.stderr.write(
    `DEBUG: [W7-D1] scored ${sessions.length} sessions across ${report.dimensions.length} dimensions\n`,
  );
  return 0;
}

try {
  process.exitCode = main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
}
