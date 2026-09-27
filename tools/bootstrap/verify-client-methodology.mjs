#!/usr/bin/env node
/**
 * [IMPL-TIED_CLIENT_REFRESH_PARITY] [ARCH-TIED_CLIENT_REFRESH_PARITY] [REQ-TIED_CLIENT_REFRESH_PARITY]
 * How: Standalone client refresh parity CLI (no copy side effects).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runClientRefreshParityGate, defaultTiedSourceRoot } from "./lib/client-refresh-parity.mjs";
import { parseParityCliFlags } from "./lib/parity-cli-options.mjs";
import { sayErr } from "./lib/console.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function printUsage() {
  console.error(`Usage: node tools/bootstrap/verify-client-methodology.mjs [options] <clientRoot>

Options:
  --strict-refresh           Doc drift fails with exit 1
  --skip-parity-gate         Skip parity (exit 0, no report)
  --parity-gate-report-only  Run report; parity never fails exit
  --parity-report=<path>     Report JSON path (default: <client>/.tied/client-refresh-parity-report.json)
  --semantic-yaml-compare    Use Ruby semantic compare for .yaml in Parity A
`);
}

function main() {
  const raw = process.argv.slice(2);
  let tiedSourceRoot = defaultTiedSourceRoot();
  const filtered = [];
  for (let i = 0; i < raw.length; i += 1) {
    if (raw[i] === "--tied-source-root" && raw[i + 1]) {
      tiedSourceRoot = path.resolve(raw[i + 1]);
      i += 1;
    } else {
      filtered.push(raw[i]);
    }
  }

  if (filtered.includes("-h") || filtered.includes("--help")) {
    printUsage();
    process.exit(0);
  }

  const { positional, parity, unknownFlag } = parseParityCliFlags(filtered);
  if (unknownFlag) {
    sayErr(`Unknown option: ${unknownFlag}`);
    printUsage();
    process.exit(1);
  }

  const clientRoot = positional[0] ? path.resolve(positional[0]) : process.cwd();
  const { exitCode } = runClientRefreshParityGate(tiedSourceRoot, clientRoot, {
    skipParityGate: parity.skipParityGate,
    strictRefresh: parity.strictRefresh,
    parityGateReportOnly: parity.parityGateReportOnly,
    semanticYamlCompare: parity.semanticYamlCompare,
    reportPath: parity.parityReport,
  });
  process.exit(exitCode);
}

main();
