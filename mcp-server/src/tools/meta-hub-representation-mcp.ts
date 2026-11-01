/**
 * [IMPL-TIED_META_HUB_MCP] [ARCH-TIED_META_HUB_REPRESENTATION_BOUNDARY] [REQ-TIED_META_HUB_REPRESENTATION]
 * How: MCP adapters for meta-hub representation tooling.
 */

import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import yaml from "js-yaml";

import { prettyCanonicalJson } from "../storage-dump.js";
import { getBasePath } from "../yaml-loader.js";
import { textContent } from "../types.js";
import {
  applyReconcileLedger,
  buildReconcileLedger,
  type ForceDisposition,
} from "../meta-hub-representation/citdp-reconcile.js";
import { writeCorpusMapFile } from "../meta-hub-representation/corpus-map-build.js";

function resolveProjectRoot(projectRoot?: string): string {
  return projectRoot ? path.resolve(projectRoot) : path.resolve(getBasePath(), "..");
}

function assertHubPath(hubPath: string): void {
  const normalized = hubPath.replace(/\\/g, "/");
  if (!normalized.includes("tied-project")) {
    throw new Error("hub_path must include tied-project");
  }
}

export const metaHubRepresentationMcpTools = [
  {
    name: "tied_citdp_reconcile_run",
    config: {
      description:
        "[REQ-TIED_META_HUB_REPRESENTATION] Reconcile divergent working CITDP drafts against tied-project/citdp/ (dry-run default).",
      inputSchema: z.object({
        dry_run: z.boolean().optional(),
        project_root: z.string().optional(),
        working_paths: z.array(z.string()).optional(),
        report_path: z.string().optional(),
        force_dispositions: z
          .record(z.string(), z.enum(["keep_canonical", "take_working", "skip"]))
          .optional(),
      }),
    },
    handler: async (args: {
      dry_run?: boolean;
      project_root?: string;
      working_paths?: string[];
      report_path?: string;
      force_dispositions?: Record<string, ForceDisposition>;
    }) => {
      const dryRun = args.dry_run !== false;
      const projectRoot = resolveProjectRoot(args.project_root);
      const ledger = buildReconcileLedger({
        projectRoot,
        workingPaths: args.working_paths,
        dryRun,
        forceDispositions: args.force_dispositions,
      });
      let report_path: string | undefined;
      if (args.report_path?.trim()) {
        report_path = path.resolve(projectRoot, args.report_path.trim());
        fs.mkdirSync(path.dirname(report_path), { recursive: true });
        fs.writeFileSync(report_path, yaml.dump(ledger), "utf8");
      }
      let applyResult;
      if (!dryRun) {
        applyResult = applyReconcileLedger({ ...ledger, dry_run: false });
      }
      return textContent(
        prettyCanonicalJson({
          ledger,
          report_path,
          apply: applyResult,
        }),
      );
    },
  },
  {
    name: "tied_corpus_map_build",
    config: {
      description:
        "[REQ-TIED_META_HUB_REPRESENTATION] Generate meta-hub corpus map markdown under tied-project/working evidence.",
      inputSchema: z.object({
        project_root: z.string().optional(),
        hub_path: z.string().optional(),
        out_path: z.string(),
        request_token: z.string().optional(),
        baseline_revision: z.string().optional(),
      }),
    },
    handler: async (args: {
      project_root?: string;
      hub_path?: string;
      out_path: string;
      request_token?: string;
      baseline_revision?: string;
    }) => {
      const hub = args.hub_path ?? "tied-project/";
      assertHubPath(hub);
      const projectRoot = resolveProjectRoot(args.project_root);
      const outPath = path.resolve(projectRoot, args.out_path);
      const result = writeCorpusMapFile({
        projectRoot,
        hubPath: hub,
        outPath,
        requestToken: args.request_token,
        baselineRevision: args.baseline_revision,
      });
      return textContent(prettyCanonicalJson(result));
    },
  },
];
