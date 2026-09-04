/**
 * [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 * How: COPY_WITH_ATTRIBUTES — preserve attributes, source-date midnight on destination, modification warnings.
 */
import fs from "node:fs";
import path from "node:path";
import { sayWarn } from "./console.mjs";

export function sourceDateMidnightSeconds(mtimeMs) {
  const local = new Date(mtimeMs);
  local.setHours(0, 0, 0, 0);
  return local.getTime() / 1000;
}

export function isLocalDateMidnight(mtimeMs) {
  const midnightMs = sourceDateMidnightSeconds(mtimeMs) * 1000;
  return Math.abs(mtimeMs - midnightMs) <= 1;
}

function* descendants(root) {
  yield root;
  if (!fs.existsSync(root)) return;
  const stat = fs.lstatSync(root);
  if (!stat.isDirectory() || stat.isSymbolicLink()) return;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const child = path.join(root, entry.name);
    yield* descendants(child);
  }
}

export function warnModifiedCopyTarget(destPath) {
  if (!fs.existsSync(destPath)) {
    return;
  }
  try {
    for (const item of descendants(destPath)) {
      const stat = fs.lstatSync(item);
      if (!isLocalDateMidnight(stat.mtimeMs)) {
        sayWarn(`WARNING: Client-modified managed copy detected: ${item}`);
      }
    }
  } catch {
    // absent destination — silent
  }
}

export function normalizeCopiedPathTimestamps(sourcePath, destPath) {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`TIMESTAMP_CALCULATION_FAILED: source does not exist: ${sourcePath}`);
  }
  if (!fs.existsSync(destPath)) {
    throw new Error(`TIMESTAMP_NORMALIZATION_FAILED: destination does not exist: ${destPath}`);
  }
  for (const sourceItem of descendants(sourcePath)) {
    const relative = path.relative(sourcePath, sourceItem);
    const destItem = relative === "" || relative === "." ? destPath : path.join(destPath, relative);
    if (!fs.existsSync(destItem)) {
      throw new Error(`PATH_MAPPING_FAILED: missing copied path ${destItem} for ${sourceItem}`);
    }
    const sourceMidnight = sourceDateMidnightSeconds(fs.statSync(sourceItem).mtimeMs);
    const destStat = fs.statSync(destItem);
    fs.utimesSync(destItem, destStat.atime, sourceMidnight);
  }
}

export function copyFileWithAttributes(source, dest) {
  if (!fs.existsSync(source)) {
    throw new Error(`SOURCE_MISSING: ${source}`);
  }
  warnModifiedCopyTarget(dest);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(source, dest);
  try {
    fs.chmodSync(dest, fs.statSync(source).mode);
  } catch {
    // mode copy may fail on some platforms
  }
  const midnight = sourceDateMidnightSeconds(fs.statSync(source).mtimeMs);
  const atime = fs.statSync(dest).atime;
  fs.utimesSync(dest, atime, midnight);
}

export function copyTreeWithAttributes(source, dest) {
  if (!fs.existsSync(source)) {
    throw new Error(`SOURCE_MISSING: ${source}`);
  }
  warnModifiedCopyTarget(dest);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  fs.cpSync(source, dest, { recursive: true, preserveTimestamps: true });
  normalizeCopiedPathTimestamps(source, dest);
}

export function chmodExecutableRecursive(root) {
  if (process.platform === "win32") return;
  for (const item of descendants(root)) {
    try {
      const stat = fs.statSync(item);
      if (stat.isFile()) {
        fs.chmodSync(item, stat.mode | 0o111);
      }
    } catch {
      // ignore
    }
  }
}
