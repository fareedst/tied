/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 * LOAD_MERGED_ROUTING_BASELINE
 */

import fs from "node:fs";
import path from "node:path";
import { BUNDLE_DIR_NAME } from "../tied-layout.js";
import { getMethodologyBasePath } from "../yaml-loader.js";
import {
  glossaryIdFromFile,
  parseRoutingTableMarkdown,
  type RoutingRow,
} from "./routing-table.js";

export type MergedRoutingLoadResult = {
  rows: RoutingRow[];
  diagnostics: string[];
};

export function mergeRoutingRows(clientRows: RoutingRow[], methodologyRows: RoutingRow[]): RoutingRow[] {
  const seen = new Set<string>();
  const merged: RoutingRow[] = [];
  for (const row of [...clientRows, ...methodologyRows]) {
    const id = glossaryIdFromFile(row.file);
    if (seen.has(id)) continue;
    seen.add(id);
    merged.push(row);
  }
  return merged;
}

export function loadMergedRoutingBaseline(options: {
  tiedBasePath: string;
  readFile?: (absolutePath: string) => string;
  exists?: (absolutePath: string) => boolean;
}): MergedRoutingLoadResult {
  const readFile = options.readFile ?? ((p: string) => fs.readFileSync(p, "utf8"));
  const exists = options.exists ?? ((p: string) => fs.existsSync(p));
  const diagnostics: string[] = [];

  const clientPath = path.join(options.tiedBasePath, "vocab", "routing.md");
  let clientRows: RoutingRow[] = [];
  if (exists(clientPath)) {
    clientRows = parseRoutingTableMarkdown(readFile(clientPath));
  }

  const projectRoot = path.dirname(path.resolve(options.tiedBasePath));
  const bundleRouting = path.join(projectRoot, BUNDLE_DIR_NAME, "vocab", "routing.md");
  const legacyRouting = path.join(options.tiedBasePath, "methodology", "vocab", "routing.md");
  const methodologyRoot = getMethodologyBasePath();
  const methodologyPath = exists(bundleRouting)
    ? bundleRouting
    : methodologyRoot
      ? path.join(methodologyRoot, "vocab", "routing.md")
      : legacyRouting;
  let methodologyRows: RoutingRow[] = [];
  if (exists(methodologyPath)) {
    methodologyRows = parseRoutingTableMarkdown(readFile(methodologyPath));
  } else {
    diagnostics.push("methodology_routing_missing");
  }

  return {
    rows: mergeRoutingRows(clientRows, methodologyRows),
    diagnostics,
  };
}
