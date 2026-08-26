/**
 * Shared detail_file path classification for validator and loader.
 * [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_BOOTSTRAP_DETAIL_INTEGRITY] [REQ-TIED_SETUP]
 */

import path from "node:path";

const DETAIL_FILE_SENTINELS = new Set(["null", "~"]);

/** True when detail_file is a non-empty relative path (not null, "null", "~", or whitespace). */
export function isUsableDetailFilePath(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (DETAIL_FILE_SENTINELS.has(trimmed)) return false;
  return true;
}

/** Resolve index detail_file under base; reject traversal outside base. Returns null when unusable or escaping. */
export function resolveDetailFileUnderBase(basePath: string, detailFile: unknown): string | null {
  if (!isUsableDetailFilePath(detailFile)) return null;
  const resolvedBase = path.resolve(basePath);
  const candidate = path.resolve(resolvedBase, detailFile);
  const relative = path.relative(resolvedBase, candidate);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return candidate;
}
