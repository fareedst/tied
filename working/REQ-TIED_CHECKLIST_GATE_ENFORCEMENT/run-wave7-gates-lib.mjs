/**
 * [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] Wave 7 gate helper utilities.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/** @typedef {"pre_implementation" | "verification" | "close_out"} GatePhase */

export const RUN_IDS = {
  pre_implementation: "wave5-pre-20260910",
  verification: "wave5-verify-20260910",
  close_out: "wave5-closeout-20260910",
};

/**
 * @param {readonly string[]} argv
 * @returns {GatePhase}
 */
export function resolveWave7GatePhase(argv) {
  if (argv.includes("--close-out")) return "close_out";
  if (argv.includes("--verification")) return "verification";
  return "pre_implementation";
}

/**
 * @param {string} phase
 * @returns {string}
 */
export function runIdForPhase(phase) {
  const runId = RUN_IDS[phase];
  if (!runId) throw new Error(`unknown gate phase ${phase}`);
  return runId;
}

/**
 * @param {Record<string, unknown>} citdp
 * @param {string} repo
 * @param {string} req
 * @returns {Record<string, unknown>}
 */
export function loadPseudocodeReports(citdp, repo, req) {
  const psaDir = path.join(repo, "working", req, "pseudocode-analysis");
  if (!existsSync(psaDir)) return {};

  const inventory = citdp?.impact_analysis?.impl_inventory ?? [];
  const implTokens = inventory
    .map((entry) => (typeof entry === "string" ? entry : entry?.impl_token))
    .filter(Boolean);

  const reports = {};
  for (const implToken of implTokens) {
    const filePath = path.join(psaDir, `${implToken}.v1.json`);
    if (existsSync(filePath)) {
      reports[implToken] = JSON.parse(readFileSync(filePath, "utf8"));
    }
  }

  if (Object.keys(reports).length > 0) return reports;

  for (const name of readdirSync(psaDir).filter((item) => item.endsWith(".v1.json"))) {
    const implToken = name.replace(/\.v1\.json$/u, "");
    reports[implToken] = JSON.parse(readFileSync(path.join(psaDir, name), "utf8"));
  }
  return reports;
}
