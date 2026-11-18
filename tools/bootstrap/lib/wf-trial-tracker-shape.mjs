/**
 * [REQ-WF_TRIAL_SLIM_TRACKER_INTER_TURN] [REQ-WF_TRIAL_INTERLEAVED_RESUME_CAPTURE]
 * [IMPL-WF_TRIAL_SLIM_TRACKER_INTER_TURN] [IMPL-WF_TRIAL_INTERLEAVED_RESUME_CAPTURE]
 * Classify disposable checklist-tracker.yaml slim template shape vs legacy agent wrappers.
 */
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const _require = createRequire(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../mcp-server/packages/agentstream/package.json"),
);
const yaml = _require("js-yaml");

export const SLIM_SCHEMA_VERSION = "checklist-tracker.v1";

/**
 * @param {string} text raw YAML
 * @returns {boolean}
 */
export function isSlimTrackerShape(text) {
  let doc;
  try {
    doc = yaml.load(text);
  } catch {
    return false;
  }
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) {
    return false;
  }
  /** @type {Record<string, unknown>} */
  const root = doc;
  if (Object.prototype.hasOwnProperty.call(root, "tracker")) {
    return false;
  }
  const schema = root.schema_version;
  if (schema !== SLIM_SCHEMA_VERSION) {
    return false;
  }
  if (!Array.isArray(root.steps)) {
    return false;
  }
  return true;
}

/**
 * @param {string} text captured subprocess stdout or stderr
 * @returns {string} session id or empty
 */
export function parseSessionIdFromText(text) {
  for (const line of text.split("\n")) {
    if (line.startsWith("session_id=")) {
      return line.slice("session_id=".length).trim();
    }
  }
  return "";
}

/** @deprecated alias — same as parseSessionIdFromText */
export const parseSessionIdFromStdout = parseSessionIdFromText;

/**
 * CLI: `node wf-trial-tracker-shape.mjs <path>` → exit 0 when slim, 1 otherwise
 */
function main() {
  const file = process.argv[2];
  if (!file) {
    process.stderr.write("usage: wf-trial-tracker-shape.mjs <tracker.yaml>\n");
    process.exit(2);
  }
  const text = fs.readFileSync(file, "utf8");
  process.exit(isSlimTrackerShape(text) ? 0 : 1);
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  main();
}