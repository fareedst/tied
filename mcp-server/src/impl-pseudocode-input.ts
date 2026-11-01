/**
 * Load IMPL essence_pseudocode body from a repo path restricted to TIED_BASE_PATH. [IMPL]
 */
import fs from "node:fs";
import path from "node:path";

/** [IMPL-PSEUDOCODE_VALIDATE_PATH_INPUT] [REQ-TIED_CLIENT_OPERATOR_TOOLING] — repo-root paths when base is tied-project/. */
function normalizePseudocodePathForTiedBase(userPath: string, base: string): string {
  if (path.isAbsolute(userPath)) {
    return userPath;
  }
  const baseName = path.basename(path.resolve(base));
  if (baseName !== "tied-project" && baseName !== "tied") {
    return userPath;
  }
  return userPath.replace(/^(\.\/)?(tied-project|tied)\//, "");
}

/**
 * Return absolute path to a file under `base` (TIED project root) or an error.
 * `userPath` may be relative to `base` or absolute if it still lies under `base` after resolution.
 */
export function resolvePseudocodePathUnderTiedBase(
  userPath: string,
  base: string
): { ok: true; absolutePath: string } | { ok: false; error: string } {
  if (!userPath.trim()) {
    return { ok: false, error: "essence_pseudocode_path is empty" };
  }
  const b = path.resolve(base);
  const normalized = normalizePseudocodePathForTiedBase(userPath.trim(), b);
  const resolved = path.isAbsolute(normalized) ? path.resolve(normalized) : path.resolve(b, normalized);
  const rel = path.relative(b, resolved);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    return {
      ok: false,
      error: `essence_pseudocode_path must resolve under TIED_BASE_PATH (${b}), got: ${userPath}`,
    };
  }
  if (resolved === b) {
    return { ok: false, error: "essence_pseudocode_path must be a file path, not the TIED base directory" };
  }
  if (!fs.existsSync(resolved)) {
    return { ok: false, error: `essence_pseudocode_path not found: ${resolved}` };
  }
  if (!fs.statSync(resolved).isFile()) {
    return { ok: false, error: `essence_pseudocode_path is not a file: ${resolved}` };
  }
  return { ok: true, absolutePath: resolved };
}

export function readTextFromPseudocodePath(absolutePath: string): { ok: true; content: string } | { ok: false; error: string } {
  try {
    return { ok: true, content: fs.readFileSync(absolutePath, "utf8") };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `Failed to read ${absolutePath}: ${msg}` };
  }
}
