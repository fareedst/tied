/**
 * [REQ-CITDP_ORDERED_LIST_KEYS] [REQ-TIED_LAYERED_CLIENT_INSTALL] [IMPL-CITDP_ORDERED_KEY_VALIDATE]
 * How: Brownfield migration of deprecated ordered-command YAML keys in client tied-project/.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import yaml from "js-yaml";
import { detectLegacyLayout, resolveTiedLayout } from "./layout.mjs";
import { childProcessSpawnOptions } from "./child-process-win.mjs";

function isRecord(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function shouldProcessCitdp(filePath) {
  const base = path.basename(filePath);
  if (base === "citdp-record-template.yaml") return true;
  if (base === "citdp.yaml") return true;
  if (base === "citdp-inline.yaml") return true;
  if (base === "citdp-record-body.yaml") return true;
  if (base.startsWith("CITDP-") && base.endsWith(".yaml")) return true;
  return false;
}

export function shouldProcessTracker(filePath) {
  const base = path.basename(filePath);
  if (base.includes("tracker") && base.endsWith(".yaml")) return true;
  if (base.startsWith("agent-req-implementation-checklist") && base.endsWith(".yaml")) return true;
  if (base.startsWith("citdp-doc-") && base.endsWith(".yaml")) return true;
  if (base.startsWith("checklist-tracker") && base.endsWith(".yaml")) return true;
  if (base === "REQ-TIED_BOOTSTRAP_DETAIL_INTEGRITY_20260825.yaml") return true;
  return false;
}

export function shouldProcessFile(filePath, includeTrackers) {
  if (shouldProcessCitdp(filePath)) return true;
  if (includeTrackers && shouldProcessTracker(filePath)) return true;
  return false;
}

export function collectMigrationTargets(roots, includeTrackers) {
  const files = [];
  for (const root of roots) {
    const abs = path.resolve(root);
    if (!fs.existsSync(abs)) continue;
    const stat = fs.statSync(abs);
    if (stat.isFile()) {
      if (shouldProcessFile(abs, includeTrackers)) files.push(abs);
      continue;
    }
    const stack = [abs];
    while (stack.length) {
      const dir = stack.pop();
      for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, ent.name);
        if (ent.isDirectory()) stack.push(p);
        else if (shouldProcessFile(p, includeTrackers)) files.push(p);
      }
    }
  }
  return [...new Set(files)].sort();
}

/**
 * @param {import("./layout.mjs").TiedLayout} layout
 */
export function clientMigrationRoots(layout) {
  const roots = [];
  const citdp = path.join(layout.tiedDir, "citdp");
  const working = path.join(layout.tiedDir, "working");
  if (fs.existsSync(citdp)) roots.push(citdp);
  if (fs.existsSync(working)) roots.push(working);
  return roots;
}

/** @param {string} storeRoot */
export function storeMaintenanceRoots(storeRoot) {
  return [
    path.join(storeRoot, "tied-project/citdp"),
    path.join(storeRoot, "tied-project/working"),
    path.join(storeRoot, "working"),
    path.join(storeRoot, "tied-bundle/docs/citdp-record-template.yaml"),
  ];
}

/**
 * @param {string} storeRoot
 */
export async function loadOrderedListKeyModules(storeRoot) {
  const dist = path.join(storeRoot, "mcp-server/dist");
  const keysPath = path.join(dist, "citdp-ordered-keys.js");
  const canonPath = path.join(dist, "yaml-canonicalizer.js");
  const missing = [];
  if (!fs.existsSync(keysPath)) missing.push(keysPath);
  if (!fs.existsSync(canonPath)) missing.push(canonPath);
  if (missing.length) {
    const err = new Error("MCP_DIST_MISSING");
    err.missing = missing;
    err.hint = "Run ./build-workspace.sh from the TIED store root (or npm run build --prefix mcp-server).";
    throw err;
  }
  const [{ transformCitdpOrderedListKeys }, { writeCanonicalValueAtomic }] = await Promise.all([
    import(pathToFileURL(keysPath).href),
    import(pathToFileURL(canonPath).href),
  ]);
  return { transformCitdpOrderedListKeys, writeCanonicalValueAtomic };
}

export function transformMigrationDocument(data, filename, includeTrackers, transformCitdpOrderedListKeys) {
  if (filename === "citdp-record-template.yaml") {
    return transformCitdpOrderedListKeys(data);
  }
  if (!isRecord(data)) return data;
  const keys = Object.keys(data);
  if (keys.length === 1 && keys[0].startsWith("CITDP-")) {
    return { [keys[0]]: transformCitdpOrderedListKeys(data[keys[0]]) };
  }
  if ("evidence" in data || "test_strategy" in data || "execution_evidence" in data) {
    return transformCitdpOrderedListKeys(data);
  }
  if (includeTrackers && shouldProcessTracker(filename)) {
    return transformCitdpOrderedListKeys(data);
  }
  return data;
}

/**
 * @param {string} storeRoot
 * @param {string[]} scanRoots
 */
export function runPostMigrateAuditCheck(storeRoot, scanRoots) {
  const script = path.join(storeRoot, "scripts/audit-ordered-yaml-lists.mjs");
  if (!fs.existsSync(script)) {
    return {
      ok: false,
      code: "AUDIT_SCRIPT_MISSING",
      hint: `Expected ${script} in the TIED store.`,
    };
  }
  const existingRoots = scanRoots.filter((r) => fs.existsSync(r));
  if (existingRoots.length === 0) {
    return { ok: true };
  }
  const result = spawnSync(
    process.execPath,
    [script, "--check", ...existingRoots],
    childProcessSpawnOptions({
      cwd: storeRoot,
      stdio: "inherit",
      encoding: "utf8",
    }),
  );
  return { ok: result.status === 0, status: result.status ?? 1 };
}

/**
 * @param {string} projectRoot
 * @param {{
 *   storeRoot: string,
 *   roots?: string[],
 *   includeTrackers?: boolean,
 *   dryRun?: boolean,
 *   failIfPending?: boolean,
 *   logRelativeTo?: string,
 * }} options
 */
export async function migrateOrderedListKeys(projectRoot, options) {
  const {
    storeRoot,
    roots: rootsOverride,
    includeTrackers = true,
    dryRun = false,
    failIfPending = false,
    logRelativeTo = projectRoot,
  } = options;

  const legacy = detectLegacyLayout(projectRoot);
  if (legacy.detected) {
    return {
      ok: false,
      code: legacy.code,
      hint: legacy.hint,
      paths: legacy.paths,
      changed: 0,
      scanned: 0,
      changedPaths: [],
      skippedParse: [],
    };
  }

  const layout = resolveTiedLayout(projectRoot);
  const scanRoots = rootsOverride ?? clientMigrationRoots(layout);
  if (scanRoots.length === 0) {
    return {
      ok: true,
      changed: 0,
      scanned: 0,
      changedPaths: [],
      skippedParse: [],
      message: "nothing to migrate",
      scanRoots: [],
    };
  }

  const { transformCitdpOrderedListKeys, writeCanonicalValueAtomic } =
    await loadOrderedListKeyModules(storeRoot);

  const targets = collectMigrationTargets(scanRoots, includeTrackers);
  const writeFiles = !dryRun && !failIfPending;
  const preview = dryRun || failIfPending;

  /** @type {string[]} */
  const changedPaths = [];
  /** @type {{ file: string, message: string }[]} */
  const skippedParse = [];
  let writeFailures = 0;

  for (const filePath of targets) {
    const before = fs.readFileSync(filePath, "utf8");
    let data;
    try {
      data = yaml.load(before);
    } catch (e) {
      skippedParse.push({ file: filePath, message: e instanceof Error ? e.message : String(e) });
      continue;
    }
    const afterData = transformMigrationDocument(
      data,
      path.basename(filePath),
      includeTrackers,
      transformCitdpOrderedListKeys,
    );
    if (JSON.stringify(afterData) === JSON.stringify(data)) continue;
    const rel = path.relative(logRelativeTo, filePath);
    changedPaths.push(rel);
    console.log(preview ? "would change:" : "changed:", rel);
    if (writeFiles) {
      const result = writeCanonicalValueAtomic(filePath, afterData);
      if (!result.ok) {
        console.error("DIAGNOSTIC: write failed", rel, result.error);
        writeFailures += 1;
      }
    }
  }

  console.log(
    `DEBUG: TRACE: ${changedPaths.length} file(s) ${preview ? "need migration" : "migrated"} of ${targets.length} scanned`,
  );

  if (writeFailures > 0) {
    return {
      ok: false,
      code: "MIGRATE_WRITE_FAILED",
      changed: changedPaths.length,
      scanned: targets.length,
      changedPaths,
      skippedParse,
      scanRoots,
    };
  }

  return {
    ok: true,
    changed: changedPaths.length,
    scanned: targets.length,
    changedPaths,
    skippedParse,
    scanRoots,
    pending: changedPaths.length > 0 && failIfPending,
  };
}
