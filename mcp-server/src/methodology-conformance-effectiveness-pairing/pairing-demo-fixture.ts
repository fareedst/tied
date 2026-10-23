/**
 * [IMPL-TIED_COMMITTED_WORKING_GIT_HYGIENE] [REQ-TIED_COMMITTED_WORKING_GIT_HYGIENE]
 * [REQ-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Repo-relative path for demo gate receipt (local working root). */
export const METHODOLOGY_PAIRING_DEMO_GATE_RECEIPT_PATH =
  "tied-bundle/working/REQ-METHODOLOGY-LEARNING-EXPERIMENT/evidence/pre_implementation-gate-result.json";

const mcpRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const fixtureSource = path.join(
  mcpRoot,
  "test/fixtures/methodology-pairing/pre_implementation-gate-result.json",
);

/** Copy pinned fixture into tied-bundle/working when absent (tests / fresh CI). */
export function ensureMethodologyPairingDemoGateReceipt(projectRoot: string): void {
  const target = path.join(projectRoot, METHODOLOGY_PAIRING_DEMO_GATE_RECEIPT_PATH);
  if (fs.existsSync(target)) {
    return;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(fixtureSource, target);
}
