/**
 * [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_SETUP] Read repo root VERSION for W7 CLI defaults.
 */
import fs from "node:fs";
import path from "node:path";

const SEMVER_RE = /^\d+\.\d+\.\d+$/;

/**
 * @param {string} projectRoot
 * @returns {string}
 */
export function readTiedMethodologyVersionFromProjectRoot(projectRoot) {
  let dir = path.resolve(projectRoot);
  for (let i = 0; i < 12; i += 1) {
    const candidate = path.join(dir, "VERSION");
    if (fs.existsSync(candidate)) {
      const version = fs.readFileSync(candidate, "utf8").trim();
      if (!SEMVER_RE.test(version)) {
        throw new Error(`Invalid VERSION semver at ${candidate}`);
      }
      return version;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(`VERSION file not found from ${projectRoot}`);
}
