#!/usr/bin/env node
/**
 * [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
 * How: CLI entry for layered TIED client install.
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { sayErr, sayOk } from "./lib/console.mjs";
import { parseParityCliFlags } from "./lib/parity-cli-options.mjs";
import { parseBootstrapToolFlags } from "./lib/client-tool-use-bootstrap.mjs";
import { installTiedLayers, refreshInstallFromManifest } from "./lib/install-layers-core.mjs";
import { TIED_REPO_ROOT } from "./lib/constants.mjs";
import { resolveStoreRoot } from "./lib/layers/store.mjs";
import { detectLegacyLayout } from "./lib/layout.mjs";
import { migrateLayout } from "./lib/migrate-layout.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");

function usage() {
  sayErr(`usage: install-layers.mjs [OPTIONS] [CLIENT_DIR]

Options:
  --layers db,mcp,skills,methodology   Capability layers (default: all)
  --harness cursor|claude|both         Default: both
  --mode linked|full                   Default: linked
  --store PATH                         TIED store root (default: env TIED_STORE_ROOT, else mcp.json, else TIED_REPO_ROOT)
  --methodology-bundle live|pinned     Default: live
  --refresh                            Re-run from tied-bundle/install.json
  --doctor                             No-MCP self-test on installed client
  --migrate-layout                     Brownfield layout migration (idempotent)
  --store                              With --migrate-layout --dry-run: print store git mv plan (p6)
  --dry-run                            With --migrate-layout: plan only
  --merge-vocab                        Accepted for parity (full methodology only)
  --methodology-readonly               Unix chmod for full methodology tree
  --install-methodology-hook           Install client pre-commit hook template
  Plus parity flags: --skip-parity-gate, --strict-refresh, etc.
  Plus tool flags: --full-tools, --with-jev, --with-dae, --with-bbce
`);
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
  let doctor = false;
  let migrateLayoutFlag = false;
  let storeMigrate = false;
  let dryRun = false;
  let mergeVocab = false;
  let methodologyReadonly = false;
  let installMethodologyHook = false;
  let claudeHarnessLabel;

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
    } else if (flag === "--doctor") {
      doctor = true;
      args.shift();
    } else if (flag === "--migrate-layout") {
      migrateLayoutFlag = true;
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
    } else {
      break;
    }
  }

  const { positional, parity, unknownFlag } = parseParityCliFlags(args);
  if (unknownFlag) {
    throw new Error(`Unknown option: ${unknownFlag}`);
  }

  const target = positional[0] ? path.resolve(positional[0]) : process.cwd();
  return {
    target,
    layers: layers ?? ["db", "mcp", "skills", "methodology"],
    harness,
    mode,
    store,
    methodologyBundle,
    refresh,
    doctor,
    migrateLayout: migrateLayoutFlag,
    storeMigrate,
    dryRun,
    mergeVocab,
    methodologyReadonly,
    installMethodologyHook,
    claudeHarnessLabel,
    toolUseProfile,
    ...parity,
  };
}

function main() {
  try {
    const parsed = parseInstallLayersArgs(process.argv.slice(2));
    if (parsed.migrateLayout) {
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
        process.exit(1);
      }
      sayOk(`migrate-layout: ${result.action}`);
      if (result.planned_commands) {
        for (const line of result.planned_commands) {
          console.log(line);
        }
      }
      return;
    }

    const legacy = detectLegacyLayout(parsed.target);
    if (legacy.detected) {
      sayErr(`${legacy.code}: ${legacy.hint}`);
      for (const p of legacy.paths) sayErr(`  ${p}`);
      process.exit(1);
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
      env: process.env,
    };

    if (parsed.refresh) {
      refreshInstallFromManifest(parsed.target, options);
    } else {
      installTiedLayers(parsed.target, options);
    }
  } catch (e) {
    if (e instanceof Error) {
      sayErr(e.message);
      if (e.missing) {
        for (const m of e.missing) sayErr(`  missing: ${m}`);
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
