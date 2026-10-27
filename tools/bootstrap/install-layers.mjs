#!/usr/bin/env node
/**
 * [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
 * How: CLI entry for layered TIED client install.
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { sayErr, sayOk, writeErrorHints } from "./lib/console.mjs";
import {
  isTiedInstallHelpArgv,
  printTiedInstallHelp,
} from "./lib/tied-install-help.mjs";
import { parseParityCliFlags } from "./lib/parity-cli-options.mjs";
import { parseBootstrapToolFlags } from "./lib/client-tool-use-bootstrap.mjs";
import { installTiedLayers, refreshInstallFromManifest } from "./lib/install-layers-core.mjs";
import { resolveStoreRoot } from "./lib/layers/store.mjs";
import { readInstallManifest } from "./lib/layers/install-manifest.mjs";
import { detectLegacyLayout } from "./lib/layout.mjs";
import { migrateLayout } from "./lib/migrate-layout.mjs";
import {
  migrateOrderedListKeys,
  runPostMigrateAuditCheck,
} from "./lib/migrate-ordered-list-keys.mjs";
import {
  assertInstallTargetDirectories,
  dedupeInstallTargets,
  filterInstallTargets,
  loadInstallTargetsYaml,
} from "./lib/install-targets-list.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @param {{
 *   targetsFile?: string,
 *   positionalClient?: string,
 *   targetsPlan?: boolean,
 *   targetsInclude?: string,
 *   targetsExclude?: string,
 *   targetsSkipMissing?: boolean,
 *   targetsOnlyInstalled?: boolean,
 * }} parsed
 */
export function resolveInstallTargets(parsed) {
  const filterOpts = {
    includeGlob: parsed.targetsInclude,
    excludeGlob: parsed.targetsExclude,
    skipMissing: parsed.targetsSkipMissing,
    onlyInstalled: parsed.targetsOnlyInstalled,
    readManifest: readInstallManifest,
  };

  if (parsed.targetsFile) {
    let paths = dedupeInstallTargets(
      loadInstallTargetsYaml(parsed.targetsFile, { baseDir: process.cwd() }),
    );
    const hasFilters =
      filterOpts.includeGlob
      || filterOpts.excludeGlob
      || filterOpts.skipMissing
      || filterOpts.onlyInstalled;
    if (hasFilters) {
      ({ paths } = filterInstallTargets(paths, filterOpts));
    } else {
      assertInstallTargetDirectories(paths);
    }
    return paths;
  }

  if (parsed.targetsPlan) {
    throw new Error("--targets-plan requires --targets or TIED_INSTALL_TARGETS");
  }

  const single = path.resolve(parsed.positionalClient ?? process.cwd());
  assertInstallTargetDirectories([single]);
  return [single];
}

/**
 * @param {string[]} argv
 */
export function parseInstallLayersArgs(argv, env = process.env) {
  const { profile: toolUseProfile, argv: afterToolFlags } = parseBootstrapToolFlags(argv, env);
  const args = [...afterToolFlags];
  let layers = null;
  let harness = "both";
  let mode = "linked";
  let store;
  let methodologyBundle = "live";
  let refresh = false;
  let allowSelfInstall = false;
  let doctor = false;
  let migrateLayoutFlag = false;
  let migrateOrderedListKeysFlag = false;
  let migrateFailIfPending = false;
  let storeMigrate = false;
  let dryRun = false;
  let mergeVocab = false;
  let methodologyReadonly = false;
  let installMethodologyHook = false;
  let claudeHarnessLabel;
  /** @type {string | undefined} */
  let targetsFile;
  let targetsInclude;
  let targetsExclude;
  let targetsSkipMissing = false;
  let targetsOnlyInstalled = false;
  let targetsPlan = false;
  let targetsContinueOnError = false;

  while (args.length > 0 && args[0].startsWith("-")) {
    const flag = args[0];
    if (flag === "--layers") {
      layers = args[1]?.split(",").map((s) => s.trim()).filter(Boolean);
      args.splice(0, 2);
    } else if (flag === "--harness") {
      harness = args[1] ?? "both";
      args.splice(0, 2);
    } else if (flag === "--mode") {
      mode = args[1] ?? "linked";
      args.splice(0, 2);
    } else if (flag === "--store") {
      if (args[1] && !args[1].startsWith("-")) {
        store = args[1];
        args.splice(0, 2);
      } else {
        storeMigrate = true;
        args.shift();
      }
    } else if (flag === "--methodology-bundle") {
      methodologyBundle = args[1] ?? "live";
      args.splice(0, 2);
    } else if (flag === "--refresh") {
      refresh = true;
      args.shift();
    } else if (flag === "--allow-self-install") {
      allowSelfInstall = true;
      args.shift();
    } else if (flag === "--doctor") {
      doctor = true;
      args.shift();
    } else if (flag === "--migrate-layout") {
      migrateLayoutFlag = true;
      args.shift();
    } else if (flag === "--migrate-ordered-list-keys") {
      migrateOrderedListKeysFlag = true;
      args.shift();
    } else if (flag === "--fail-if-pending") {
      migrateFailIfPending = true;
      args.shift();
    } else if (flag === "--dry-run") {
      dryRun = true;
      args.shift();
    } else if (flag === "--merge-vocab") {
      mergeVocab = true;
      args.shift();
    } else if (flag === "--methodology-readonly") {
      methodologyReadonly = true;
      args.shift();
    } else if (flag === "--install-methodology-hook") {
      installMethodologyHook = true;
      args.shift();
    } else if (flag === "--claude-harness-label") {
      claudeHarnessLabel = args[1];
      args.splice(0, 2);
    } else if (flag === "--targets") {
      targetsFile = args[1];
      if (!targetsFile) {
        throw new Error("--targets requires a YAML list file path (or - for stdin)");
      }
      args.splice(0, 2);
    } else if (flag === "--targets-include") {
      targetsInclude = args[1];
      args.splice(0, 2);
    } else if (flag === "--targets-exclude") {
      targetsExclude = args[1];
      args.splice(0, 2);
    } else if (flag === "--targets-skip-missing") {
      targetsSkipMissing = true;
      args.shift();
    } else if (flag === "--targets-only-installed") {
      targetsOnlyInstalled = true;
      args.shift();
    } else if (flag === "--targets-plan") {
      targetsPlan = true;
      args.shift();
    } else if (flag === "--targets-continue-on-error") {
      targetsContinueOnError = true;
      args.shift();
    } else {
      break;
    }
  }

  const { positional, parity, unknownFlag } = parseParityCliFlags(args);
  if (unknownFlag) {
    throw new Error(`Unknown option: ${unknownFlag}`);
  }

  if (migrateFailIfPending && !migrateOrderedListKeysFlag) {
    throw new Error("--fail-if-pending requires --migrate-ordered-list-keys");
  }

  if (!targetsFile && env.TIED_INSTALL_TARGETS?.trim()) {
    targetsFile = env.TIED_INSTALL_TARGETS.trim();
  }

  if (positional[0] && targetsFile) {
    throw new Error("Cannot combine a positional client directory with --targets");
  }

  const parsed = {
    positionalClient: positional[0],
    targetsFile,
    targetsInclude,
    targetsExclude,
    targetsSkipMissing,
    targetsOnlyInstalled,
    targetsPlan,
    targetsContinueOnError,
    layers: layers ?? ["db", "mcp", "skills", "methodology"],
    harness,
    mode,
    store,
    methodologyBundle,
    refresh,
    allowSelfInstall,
    doctor,
    migrateLayout: migrateLayoutFlag,
    migrateOrderedListKeys: migrateOrderedListKeysFlag,
    migrateFailIfPending,
    storeMigrate,
    dryRun,
    mergeVocab,
    methodologyReadonly,
    installMethodologyHook,
    claudeHarnessLabel,
    toolUseProfile,
    ...parity,
  };

  parsed.targets = resolveInstallTargets(parsed);
  return parsed;
}

/**
 * @param {ReturnType<typeof parseInstallLayersArgs>} parsed
 * @returns {Promise<number>}
 */
export async function runInstallForTarget(parsed) {
  const target = parsed.target;
  if (parsed.migrateOrderedListKeys) {
    return handleMigrateOrderedListKeys({ ...parsed, target });
  }
  if (parsed.migrateLayout) {
    return runMigrateLayoutForTarget({ ...parsed, target });
  }

  const legacy = detectLegacyLayout(target);
  if (legacy.detected) {
    sayErr(`${legacy.code}: ${legacy.hint}`);
    for (const p of legacy.paths) sayErr(`  ${p}`);
    return 1;
  }

  const options = {
    layers: parsed.layers,
    harness: parsed.harness,
    mode: parsed.mode,
    store: parsed.store,
    methodologyBundle: parsed.methodologyBundle,
    doctor: parsed.doctor,
    toolUseProfile: parsed.toolUseProfile,
    methodologyReadonly: parsed.methodologyReadonly,
    installMethodologyHook: parsed.installMethodologyHook,
    claudeHarnessLabel: parsed.claudeHarnessLabel,
    skipParityGate: parsed.skipParityGate,
    strictRefresh: parsed.strictRefresh,
    parityGateReportOnly: parsed.parityGateReportOnly,
    semanticYamlCompare: parsed.semanticYamlCompare,
    parityReport: parsed.parityReport,
    allowSelfInstall: parsed.allowSelfInstall,
    env: process.env,
  };

  try {
    if (parsed.refresh) {
      refreshInstallFromManifest(target, options);
    } else {
      installTiedLayers(target, options);
    }
    return 0;
  } catch (e) {
    if (e instanceof Error) {
      sayErr(e.message);
      if (e.missing) {
        for (const m of e.missing) sayErr(`  missing: ${m}`);
      }
    }
    return 1;
  }
}

/**
 * @param {ReturnType<typeof parseInstallLayersArgs> & { target: string }} parsed
 * @returns {Promise<number>}
 */
async function handleMigrateOrderedListKeys(parsed) {
  const storeRoot = resolveStoreRoot({ store: parsed.store, projectRoot: parsed.target });
  const preview = parsed.dryRun || parsed.migrateFailIfPending;
  const result = await migrateOrderedListKeys(parsed.target, {
    storeRoot,
    includeTrackers: true,
    dryRun: preview,
    failIfPending: parsed.migrateFailIfPending,
    logRelativeTo: parsed.target,
  });

  if (!result.ok) {
    sayErr(result.code ?? "MIGRATE_ORDERED_LIST_KEYS_FAILED");
    if (result.hint) sayErr(result.hint);
    if (result.paths) {
      for (const p of result.paths) sayErr(`  ${p}`);
    }
    return 1;
  }

  if (result.message) {
    sayOk(`migrate-ordered-list-keys: ${result.message}`);
  } else {
    sayOk(
      `migrate-ordered-list-keys: ${result.changed} file(s) ${preview ? "need migration" : "migrated"} of ${result.scanned} scanned`,
    );
  }

  if (parsed.migrateFailIfPending && result.changed > 0) {
    return 1;
  }

  if (!preview && result.changed > 0 && result.scanRoots?.length) {
    const audit = runPostMigrateAuditCheck(storeRoot, result.scanRoots);
    if (!audit.ok) {
      sayErr(audit.code ?? "ORDERED_LIST_AUDIT_FAILED");
      if (audit.hint) sayErr(audit.hint);
      return audit.status ?? 1;
    }
  }
  return 0;
}

/**
 * @param {ReturnType<typeof parseInstallLayersArgs> & { target: string }} parsed
 * @returns {number}
 */
function runMigrateLayoutForTarget(parsed) {
  const result = migrateLayout(parsed.target, {
    store: parsed.storeMigrate,
    dryRun: parsed.dryRun,
    storeRoot: resolveStoreRoot({ store: parsed.store, projectRoot: parsed.target }),
  });
  if (!result.ok) {
    sayErr(result.code ?? "MIGRATE_LAYOUT_FAILED");
    if (result.hint) sayErr(result.hint);
    if (result.paths) {
      for (const p of result.paths) sayErr(`  ${p}`);
    }
    return 1;
  }
  sayOk(`migrate-layout: ${result.action}`);
  if (result.planned_commands) {
    for (const line of result.planned_commands) {
      console.log(line);
    }
  }
  return 0;
}

/**
 * @param {ReturnType<typeof parseInstallLayersArgs>} parsed
 * @param {{ runOne?: (p: ReturnType<typeof parseInstallLayersArgs> & { target: string }) => Promise<number> }} [options]
 * @returns {Promise<number>}
 */
export async function runInstallBatch(parsed, options = {}) {
  const runOne = options.runOne ?? (async (p) => runInstallForTarget(p));
  const targets = parsed.targets;

  if (parsed.targetsPlan) {
    for (const t of targets) {
      console.log(t);
    }
    return 0;
  }

  let succeeded = 0;
  let anyFailed = false;
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const label = `[${i + 1}/${targets.length}]`;
    sayOk(`${label} ${target}`);
    const code = await runOne({ ...parsed, target });
    if (code !== 0) {
      anyFailed = true;
      sayErr(`${label} failed (exit ${code})`);
      if (!parsed.targetsContinueOnError) {
        console.error(`DIAGNOSTIC: batch aborted at ${i + 1}/${targets.length}`);
        return code;
      }
    } else {
      succeeded += 1;
    }
  }

  if (anyFailed) {
    console.error(`DIAGNOSTIC: batch ${succeeded}/${targets.length} succeeded`);
    return 1;
  }
  if (targets.length > 1) {
    console.error(`DIAGNOSTIC: batch ${targets.length}/${targets.length} succeeded`);
  }
  return 0;
}

async function main() {
  const argv = process.argv.slice(2);
  if (isTiedInstallHelpArgv(argv)) {
    printTiedInstallHelp();
    return;
  }
  try {
    const parsed = parseInstallLayersArgs(argv);
    const code = await runInstallBatch(parsed);
    if (code !== 0) {
      process.exit(code);
    }
  } catch (e) {
    if (e instanceof Error) {
      if (e.message.startsWith("Unknown option:")) {
        writeErrorHints(e.message, [
          "Run ./tied-install.sh with no arguments for full help.",
          "Use ./tied-install.sh . to install the current directory.",
        ]);
      } else {
        sayErr(e.message);
        if (e.missing) {
          for (const m of e.missing) sayErr(`  missing: ${m}`);
        }
      }
    }
    process.exit(1);
  }
}

function isMainModule() {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }
  return import.meta.url === pathToFileURL(path.resolve(entry)).href;
}

if (isMainModule()) {
  main();
}
