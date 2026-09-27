/**
 * [IMPL-TIED_CLIENT_REFRESH_PARITY] [ARCH-TIED_CLIENT_REFRESH_PARITY] [REQ-TIED_CLIENT_REFRESH_PARITY]
 * How: Shared CLI flag parsing for copy-files and verify-client-methodology.
 */
import { sayErr } from "./console.mjs";

/**
 * @param {string[]} argv raw args after script name
 * @returns {{ positional: string[], parity: import('./parity-cli-options.mjs').ParityBootstrapOptions }}
 */
export function parseParityCliFlags(argv) {
  const args = [...argv];
  /** @type {ParityBootstrapOptions} */
  const parity = {
    skipParityGate: false,
    strictRefresh: false,
    parityGateReportOnly: false,
    semanticYamlCompare: false,
    parityReport: undefined,
  };

  while (args.length > 0 && args[0].startsWith("-")) {
    const flag = args[0];
    if (flag === "--strict-refresh") {
      parity.strictRefresh = true;
      args.shift();
    } else if (flag === "--skip-parity-gate") {
      parity.skipParityGate = true;
      args.shift();
    } else if (flag === "--parity-gate-report-only") {
      parity.parityGateReportOnly = true;
      args.shift();
    } else if (flag === "--semantic-yaml-compare") {
      parity.semanticYamlCompare = true;
      args.shift();
    } else if (flag.startsWith("--parity-report=")) {
      parity.parityReport = flag.slice("--parity-report=".length);
      args.shift();
    } else {
      return { positional: args, parity, unknownFlag: flag };
    }
  }

  if (parity.skipParityGate && parity.parityGateReportOnly) {
    sayErr("--skip-parity-gate and --parity-gate-report-only are mutually exclusive");
    throw new Error("PARITY_CLI_INVALID");
  }

  return { positional: args, parity, unknownFlag: null };
}

/**
 * @typedef {object} ParityBootstrapOptions
 * @property {boolean} skipParityGate
 * @property {boolean} strictRefresh
 * @property {boolean} parityGateReportOnly
 * @property {boolean} semanticYamlCompare
 * @property {string | undefined} parityReport
 */
