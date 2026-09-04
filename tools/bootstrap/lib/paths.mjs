/**
 * [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 * How: Path helpers — realpath, JSON-safe forward-slash absolutes for mcp.json.
 */
import fs from "node:fs";
import path from "node:path";

export function realpath(p) {
  return fs.realpathSync.native ? fs.realpathSync.native(p) : fs.realpathSync(p);
}

/** Absolute path with forward slashes for JSON / shell script baking. */
export function jsonSafeAbsolute(p) {
  return realpath(p).split(path.sep).join("/");
}

export function shellScriptRoot(root) {
  return jsonSafeAbsolute(root);
}
