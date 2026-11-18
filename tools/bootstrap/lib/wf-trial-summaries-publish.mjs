#!/usr/bin/env node
/**
 * [REQ-WF_TRIAL_SUMMARIES_PUBLISH] [IMPL-WF_TRIAL_SUMMARIES_PUBLISH]
 * Full cohort refresh from existing WF trial readouts (no per-trial args).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { TIED_REPO_ROOT } from "./constants.mjs";
import {
  diffOrphanReadouts,
  globWfTrialReadoutBasenames,
  loadCatalogReadoutLinks,
} from "./wf-trial-catalog-readout-links.mjs";
import { patchRegistryComparisonMatrix } from "./build-wf-trial-comparison-matrix.mjs";
import { refreshTraditionalWorkflowTrialRunsRegistry } from "./wf-trial-registry-refresh.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function usage() {
  console.error(`Usage: wf-trial-summaries-publish.mjs [--store-root PATH] [--dry-run] [--check]
       [--skip-size-batch] [--skip-registry-matrix]

Refreshes WF trial cohort summaries from existing readouts (no positional args).`);
  process.exit(2);
}

function parseArgs(argv) {
  const opts = {
    storeRoot: TIED_REPO_ROOT,
    dryRun: false,
    check: false,
    skipSizeBatch: false,
    skipRegistryMatrix: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") usage();
    if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--check") opts.check = true;
    else if (a === "--skip-size-batch") opts.skipSizeBatch = true;
    else if (a === "--skip-registry-matrix") opts.skipRegistryMatrix = true;
    else if (a.startsWith("--store-root=")) opts.storeRoot = a.slice("--store-root=".length);
    else if (a === "--store-root" && argv[i + 1]) {
      opts.storeRoot = argv[++i];
    }
  }
  return opts;
}

/**
 * @param {string} storeRoot
 * @param {{ dryRun: boolean }} opts
 */
function runSizeBatchCompare(storeRoot, opts) {
  const script = path.join(__dirname, "project-size-batch-compare.mjs");
  const args = [
    script,
    "--store-root",
    storeRoot,
    "--include-trial-factors",
    "--limit",
    "0",
  ];
  if (opts.dryRun) {
    console.log("DEBUG: would run", "node", args.join(" "));
    return { ok: true, skipped: false };
  }
  const r = spawnSync(process.execPath, args, {
    cwd: storeRoot,
    encoding: "utf8",
    stdio: "inherit",
  });
  return { ok: r.status === 0, skipped: false };
}

/**
 * @param {ReturnType<typeof parseArgs>} opts
 */
export function publishWfTrialSummaries(opts) {
  const catalogLinks = loadCatalogReadoutLinks(opts.storeRoot);
  const hrefs = catalogLinks.map((l) => l.href);
  const onDisk = globWfTrialReadoutBasenames(opts.storeRoot);
  const { orphans, missing } = diffOrphanReadouts(opts.storeRoot, hrefs, onDisk);

  const report = {
    catalogLinkCount: hrefs.length,
    onDiskReadoutCount: onDisk.length,
    orphanReadouts: orphans,
    missingCatalogReadouts: missing,
    steps: [],
  };

  if (opts.dryRun) {
    report.steps.push("registry-refresh", "comparison-matrix", "size-batch");
    return { ok: true, dryRun: true, report };
  }

  if (!opts.skipRegistryMatrix) {
    const regen = refreshTraditionalWorkflowTrialRunsRegistry(opts.storeRoot, {
      write: true,
    });
    report.registrySync = regen.registrySync;
    const matrix = patchRegistryComparisonMatrix(opts.storeRoot, { write: true });
    if (!matrix.ok) return { ok: false, report, phase: "matrix" };
    report.steps.push("registry");
    report.steps.push("comparison-matrix");
  }

  if (!opts.skipSizeBatch) {
    const batch = runSizeBatchCompare(opts.storeRoot, opts);
    if (!batch.ok) {
      report.steps.push("size-batch-failed");
      return { ok: false, report, phase: "size-batch" };
    }
    report.steps.push("size-batch");
  }

  const evidenceDir = path.join(
    opts.storeRoot,
    "tied-project/working",
    `FACILITATOR-WF-PUBLISH-${Math.floor(Date.now() / 1000)}`,
    "evidence",
  );
  fs.mkdirSync(evidenceDir, { recursive: true });
  const summaryPath = path.join(evidenceDir, "publish-summary.md");
  const lines = [
    "# WF trial summaries publish",
    "",
    `**Date:** ${new Date().toISOString()}`,
    "",
    `| Catalog links | ${report.catalogLinkCount} |`,
    `| Readouts on disk | ${report.onDiskReadoutCount} |`,
    "",
    "## Diagnostics",
    "",
  ];
  if (orphans.length) {
    lines.push("### Orphan readouts (on disk, not in catalog links)");
    for (const o of orphans) lines.push(`- ${o}`);
    lines.push("");
  }
  if (missing.length) {
    lines.push("### Missing readouts (catalog link, file absent)");
    for (const m of missing) lines.push(`- ${m}`);
    lines.push("");
  }
  if (report.registrySync) {
    lines.push("### Registry sync");
    lines.push(`- inserted: ${report.registrySync.insertedCount}`);
    if (report.registrySync.insertedReadouts?.length) {
      for (const r of report.registrySync.insertedReadouts) {
        lines.push(`  - ${r}`);
      }
    }
    if (report.registrySync.syncSkipped?.length) {
      lines.push("- skipped:");
      for (const s of report.registrySync.syncSkipped) {
        lines.push(`  - ${s.href}: ${s.reason}`);
      }
    }
    lines.push("");
  }
  lines.push(`**Steps:** ${report.steps.join(", ")}`);
  fs.writeFileSync(summaryPath, lines.join("\n"));
  report.evidencePath = summaryPath;

  return { ok: true, report };
}

function main() {
  const opts = parseArgs(process.argv);
  if (opts.check && !opts.dryRun) {
    const matrixOk = patchRegistryComparisonMatrix(opts.storeRoot, { checkOnly: true });
    process.exit(matrixOk ? 0 : 1);
  }
  const result = publishWfTrialSummaries(opts);
  if (!result.ok) {
    console.error("DIAGNOSTIC: publish failed", result.phase);
    process.exit(1);
  }
  console.log("DEBUG:", JSON.stringify(result.report, null, 2));
}

const isMain =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) main();
