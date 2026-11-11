#!/usr/bin/env node
/**
 * Batch project size snapshots + comparison table (facilitator).
 * Plan: tied-project/non-tied-plans/project-size-batch-discover-compare/
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";

import { resolveTestRoot } from "./new-tied-client-pipeline.mjs";
import {
  discoverClients,
  sanitizeLabelForFilename,
} from "./project-size-discover-clients.mjs";
import {
  DEFAULT_SUMMARY_EPOCH_MIN,
  renderComparisonMarkdown,
} from "./project-size-comparison-render.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_OUT = path.resolve(
  __dirname,
  "../../../tied-project/non-tied-plans/project-size-batch-discover-compare/evidence",
);

function usage() {
  console.error(`Usage: node project-size-batch-compare.mjs --store-root PATH [options]

Options:
  --parent PATH           Discover root (default: TIED_TEST_ROOT or ~/Documents/dev/test)
  --pattern TEXT          Basename filter (default: wf-agentstream)
  --pattern-regex         Treat --pattern as RegExp
  --limit N               Max discover rows (default: 50)
  --newest-first          Sort newest epoch/mtime first (default on)
  --no-newest-first       Disable newest-first sort
  --manifest PATH         Extra repo roots (union)
  --include LABEL=PATH    Force include (repeatable)
  --include-store         Add store-root row labeled stdd-store
  --include-trial-factors Pass trial_factors annex to snapshot builder
  --summary-epoch-min N   Summary epoch floor (strict >); default ${DEFAULT_SUMMARY_EPOCH_MIN}
  --verbose-table         Second expanded metrics table
  --fine-labels           Append fine label_case_counts table (1.2.0 receipts)
  --dry-run               List targets only
  --out-dir PATH          Output directory
  --store-root PATH       TIED store root (required; dist + registry)
`);
  process.exit(2);
}

function parseArgs(argv) {
  const opts = {
    pattern: "wf-agentstream",
    patternRegex: false,
    limit: 50,
    newestFirst: true,
    includes: [],
    includeStore: false,
    includeTrialFactors: false,
    verboseTable: false,
    fineLabels: false,
    dryRun: false,
    outDir: DEFAULT_OUT,
    summaryEpochMin: DEFAULT_SUMMARY_EPOCH_MIN,
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "--store-root":
        opts.storeRoot = path.resolve(argv[++i]);
        break;
      case "--parent":
        opts.parent = path.resolve(argv[++i]);
        break;
      case "--pattern":
        opts.pattern = argv[++i];
        break;
      case "--pattern-regex":
        opts.patternRegex = true;
        break;
      case "--limit":
        opts.limit = Number(argv[++i]);
        break;
      case "--newest-first":
        opts.newestFirst = true;
        break;
      case "--no-newest-first":
        opts.newestFirst = false;
        break;
      case "--manifest":
        opts.manifestPath = path.resolve(argv[++i]);
        break;
      case "--include": {
        const raw = argv[++i];
        const eq = raw.indexOf("=");
        if (eq < 0) {
          const root = path.resolve(raw);
          opts.includes.push({ repo_root: root, label: path.basename(root) });
        } else {
          opts.includes.push({
            label: raw.slice(0, eq),
            repo_root: path.resolve(raw.slice(eq + 1)),
          });
        }
        break;
      }
      case "--include-store":
        opts.includeStore = true;
        break;
      case "--include-trial-factors":
        opts.includeTrialFactors = true;
        break;
      case "--summary-epoch-min":
        opts.summaryEpochMin = Number(argv[++i]);
        break;
      case "--verbose-table":
        opts.verboseTable = true;
        break;
      case "--fine-labels":
        opts.fineLabels = true;
        break;
      case "--dry-run":
        opts.dryRun = true;
        break;
      case "--out-dir":
        opts.outDir = path.resolve(argv[++i]);
        break;
      case "-h":
      case "--help":
        usage();
        break;
      default:
        console.error(`Unknown option: ${a}`);
        usage();
    }
  }

  if (!opts.storeRoot) {
    console.error("ERROR: --store-root is required");
    usage();
  }
  if (!opts.parent) {
    opts.parent = resolveTestRoot(process.env);
  }
  return opts;
}

function snapshotDistPath(storeRoot) {
  return path.join(storeRoot, "mcp-server/dist/project-size/snapshot-builder.js");
}

export async function runProjectSizeBatchCompare(argv = process.argv, env = process.env) {
  const opts = parseArgs(argv);
  const distPath = snapshotDistPath(opts.storeRoot);
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `MISSING_SNAPSHOT_BUILDER: ${distPath}\nRun: npm run build --prefix mcp-server`,
    );
  }

  if (opts.includeStore) {
    opts.includes.push({ label: "stdd-store", repo_root: opts.storeRoot });
  }

  const discovered = await discoverClients({
    parentDir: opts.parent,
    pattern: opts.pattern,
    patternRegex: opts.patternRegex,
    limit: opts.limit,
    newestFirst: opts.newestFirst,
    includes: opts.includes,
    manifestPath: opts.manifestPath,
  });

  if (opts.dryRun) {
    for (const t of discovered.targets) {
      console.log(`${t.label}\t${t.repo_root}`);
    }
    return { dryRun: true, targets: discovered.targets };
  }

  const { buildProjectSizeSnapshot } = await import(pathToFileURL(distPath).href);

  await mkdir(opts.outDir, { recursive: true });
  const receiptsDir = path.join(opts.outDir, "receipts");
  await mkdir(receiptsDir, { recursive: true });

  const rows = [];
  const receiptPaths = [];

  for (const target of discovered.targets) {
    const receipt = await buildProjectSizeSnapshot({
      repo_root: target.repo_root,
      include_trial_factors: opts.includeTrialFactors,
    });
    const safe = sanitizeLabelForFilename(target.label);
    const receiptPath = path.join(receiptsDir, `${safe}.json`);
    await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
    receiptPaths.push(receiptPath);
    rows.push({ label: target.label, receipt });
  }

  const generatedAt = new Date().toISOString();
  const markdown = renderComparisonMarkdown(rows, {
    generatedAt,
    discoverParent: discovered.parentDir,
    pattern: discovered.pattern,
    patternRegex: discovered.patternRegex,
    discoverDiagnostics: discovered.diagnostics,
    verboseTable: opts.verboseTable,
    fineLabels: opts.fineLabels,
    summaryEpochMin: opts.summaryEpochMin,
  });

  const manifest = {
    schema_version: "project-size-batch-manifest.v1",
    generated_at: generatedAt,
    options: {
      store_root: opts.storeRoot,
      parent: opts.parent,
      pattern: opts.pattern,
      pattern_regex: opts.patternRegex,
      limit: opts.limit,
      newest_first: opts.newestFirst,
      include_trial_factors: opts.includeTrialFactors,
      summary_epoch_min: opts.summaryEpochMin,
      verbose_table: opts.verboseTable,
      fine_labels: opts.fineLabels,
    },
    discover_diagnostics: discovered.diagnostics,
    targets: discovered.targets,
    receipt_paths: receiptPaths,
    snapshot_count: rows.length,
  };

  await writeFile(path.join(opts.outDir, "comparison-table.md"), markdown, "utf8");
  await writeFile(
    path.join(opts.outDir, "manifest.v1.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );

  console.log(`DEBUG: Wrote ${rows.length} snapshot(s) to ${opts.outDir}`);
  return { outDir: opts.outDir, snapshotCount: rows.length, manifest };
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  runProjectSizeBatchCompare().catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  });
}
