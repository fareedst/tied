/**
 * [REQ-TIED_RUNTIME_DISK_CONFIG] SC-RDC-FIXTURE-PARITY — agentstream resolve probe for cross-runtime parity.
 * Usage: npx tsx tied-runtime-fixture-probe.ts <clientWorkspaceRoot>
 */
import { resolveTiedRuntimeConfigFromWorkspace } from "../../../../mcp-server/packages/agentstream/src/tied-runtime-config.ts";
import { normalizeResolveSnapshot } from "../../lib/tied-runtime-fixture-loader.mjs";

const clientRoot = process.argv[2]?.trim();
if (!clientRoot) {
  console.error("usage: tied-runtime-fixture-probe.ts <clientWorkspaceRoot>");
  process.exit(2);
}

const cfg = resolveTiedRuntimeConfigFromWorkspace(clientRoot);
const snapshot = normalizeResolveSnapshot(cfg);
process.stdout.write(`${JSON.stringify(snapshot)}\n`);
