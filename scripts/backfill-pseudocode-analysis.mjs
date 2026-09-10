#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_STATIC_ANALYSIS] [PROC-PSEUDOCODE_VALIDATION]
 * W2-D6: backfill working/{REQ}/pseudocode-analysis/{IMPL}.v1.json with gate_mode PSA reports.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { analyzeEssencePseudocode } from "../mcp-server/dist/analysis/pseudocode-analyzer.js";
import { serializeAnalysisReport } from "../mcp-server/dist/analysis/pseudocode-analyze-report.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function usage() {
  console.log(`Usage: node scripts/backfill-pseudocode-analysis.mjs \\
  --req REQ-TOKEN \\
  [--project-root PATH] \\
  [--tied-base PATH] \\
  [--gate-mode] \\
  [--impl IMPL-TOKEN ...]

Options:
  --help              Show this help
  --req               Request token (required)
  --project-root      Repository root (default: parent of scripts/)
  --tied-base         TIED base path (default: {project-root}/tied)
  --gate-mode         Run pseudocode_analyze with gate_mode true (default: true)
  --impl              One or more IMPL tokens; default reads CITDP/tracker impl_inventory when present
`);
}

function parseArgs(argv) {
  const out = {
    req: "",
    projectRoot: path.resolve(__dirname, ".."),
    tiedBase: "",
    gateMode: true,
    impls: [],
    help: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--req") out.req = argv[++i] ?? "";
    else if (arg === "--project-root") out.projectRoot = path.resolve(argv[++i] ?? "");
    else if (arg === "--tied-base") out.tiedBase = path.resolve(argv[++i] ?? "");
    else if (arg === "--gate-mode") out.gateMode = true;
    else if (arg === "--no-gate-mode") out.gateMode = false;
    else if (arg === "--impl") out.impls.push(argv[++i] ?? "");
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!out.tiedBase) out.tiedBase = path.join(out.projectRoot, "tied");
  return out;
}

function readYamlInventory(projectRoot, req) {
  const candidates = [
    path.join(projectRoot, "working", req, "wave2-pseudocode-enforcement-tracker.yaml"),
    path.join(projectRoot, "working", req, "agent-req-implementation-checklist.yaml"),
    path.join(projectRoot, "working", req, `CITDP-${req}.yaml`),
    path.join(projectRoot, "working", req, "CITDP-wave2-pseudocode-enforcement.yaml"),
  ];
  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;
    const text = fs.readFileSync(filePath, "utf8");
    const impls = [];
    for (const match of text.matchAll(/impl_token:\s*["']?(IMPL-[A-Z0-9][A-Z0-9_-]*)["']?/gu)) {
      impls.push(match[1]);
    }
    for (const match of text.matchAll(/^\s+-\s+(IMPL-[A-Z0-9][A-Z0-9_-]*)\s*$/gmu)) {
      if (text.includes("impl_inventory:")) impls.push(match[1]);
    }
    if (impls.length > 0) return [...new Set(impls)];
  }
  return [];
}

function sidecarPath(tiedBase, implToken) {
  return path.join(tiedBase, "implementation-decisions", `${implToken}-pseudocode.md`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    process.exit(0);
  }
  if (!args.req) {
    usage();
    process.exit(1);
  }

  const impls = args.impls.length > 0 ? args.impls : readYamlInventory(args.projectRoot, args.req);
  if (impls.length === 0) {
    console.error("No IMPL tokens found; pass --impl IMPL-TOKEN");
    process.exit(1);
  }

  const outDir = path.join(args.projectRoot, "working", args.req, "pseudocode-analysis");
  fs.mkdirSync(outDir, { recursive: true });

  let failures = 0;
  for (const implToken of impls) {
    const sidecar = sidecarPath(args.tiedBase, implToken);
    if (!fs.existsSync(sidecar)) {
      console.error(`MISSING_SIDECAR ${implToken} ${sidecar}`);
      failures += 1;
      continue;
    }
    const pseudocode = fs.readFileSync(sidecar, "utf8");
    const report = analyzeEssencePseudocode({
      token: implToken,
      pseudocode,
      gate_mode: args.gateMode,
    });
    const outPath = path.join(outDir, `${implToken}.v1.json`);
    fs.writeFileSync(outPath, `${serializeAnalysisReport(report)}\n`, "utf8");
    console.log(`WROTE ${outPath} ok=${report.ok} gate_mode_applied=${report.gate_mode_applied === true}`);
    if (!report.ok || report.gate_mode_applied !== true) failures += 1;
  }

  process.exit(failures > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
