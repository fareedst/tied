/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-GOAGENT-YAML-FEATURESPEC] [REQ-GOAGENT-FEATURESPEC-BATCH]
 * Feature-spec batch YAML → agent turns (Go featurespec/featurespec.go parity).
 */
import fs from "node:fs";

import yaml from "js-yaml";

import type { Turn } from "./checklist-load-turns.js";
import {
  orderFilterMatches,
  parseOrderFilter,
  type OrderFilter,
} from "./featurespec-order.js";

export type FeatureSpecOptions = {
  orderFilter?: OrderFilter;
};

type YamlRecord = Record<string, unknown>;

function normalizeRoot(doc: unknown, path: string): YamlRecord[] {
  if (doc === null || doc === undefined) {
    throw new Error(`invalid feature-spec batch YAML: empty document in ${path}`);
  }
  if (Array.isArray(doc)) {
    return doc as YamlRecord[];
  }
  if (typeof doc === "object" && doc !== null && "features" in doc) {
    const feats = (doc as { features?: unknown }).features;
    if (Array.isArray(feats)) {
      return feats as YamlRecord[];
    }
  }
  throw new Error(
    `invalid feature-spec batch YAML: root must be an array or a mapping with key "features"`,
  );
}

function orderKey(rec: YamlRecord): number {
  const o = rec.order;
  if (o === undefined || o === null || o === "") {
    return Number.POSITIVE_INFINITY;
  }
  const n = typeof o === "number" ? o : Number.parseFloat(String(o).trim());
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}

function sortRecords(records: YamlRecord[]): YamlRecord[] {
  const hasAny = records.some((r) => r.order !== undefined && r.order !== null && r.order !== "");
  if (!hasAny) {
    return records;
  }
  return records
    .map((n, idx) => ({ n, idx }))
    .sort((a, b) => {
      const oa = orderKey(a.n);
      const ob = orderKey(b.n);
      if (oa !== ob) {
        return oa - ob;
      }
      return a.idx - b.idx;
    })
    .map((p) => p.n);
}

function selectByOrder(
  records: YamlRecord[],
  opts: FeatureSpecOptions | undefined,
  path: string,
): YamlRecord[] {
  const filter = opts?.orderFilter;
  if (!filter) {
    return records;
  }
  const sel: YamlRecord[] = [];
  for (const rec of records) {
    const o = rec.order;
    if (o === undefined || o === null || o === "") {
      continue;
    }
    const v = typeof o === "number" ? o : Number.parseFloat(String(o).trim());
    if (!Number.isFinite(v)) {
      continue;
    }
    if (orderFilterMatches(filter, v)) {
      sel.push(rec);
    }
  }
  if (sel.length === 0) {
    throw new Error(`no feature-spec batch records matched order filter in ${path}`);
  }
  return sel;
}

function scalarString(v: unknown): string {
  if (v === undefined || v === null) {
    return "";
  }
  if (typeof v === "string") {
    return v;
  }
  if (typeof v === "number" || typeof v === "boolean") {
    return String(v);
  }
  return yaml.dump(v).trim();
}

function listItems(v: unknown): string[] {
  if (v === undefined || v === null) {
    return [];
  }
  if (Array.isArray(v)) {
    return v
      .map((x) => scalarString(x).trim())
      .filter((s) => s !== "");
  }
  const s = scalarString(v).trim();
  return s === "" ? [] : [s];
}

function appendSection(lines: string[], heading: string, items: string[]): void {
  if (items.length === 0) {
    return;
  }
  lines.push(heading);
  for (const it of items) {
    lines.push(`- ${it}`);
  }
  lines.push("");
}

function appendExamples(lines: string[], ex: unknown): void {
  if (ex === undefined || ex === null) {
    return;
  }
  const arr = Array.isArray(ex) ? ex : [ex];
  if (arr.length === 0) {
    return;
  }
  lines.push("## Examples");
  for (let i = 0; i < arr.length; i++) {
    lines.push(`### Example ${i + 1}`);
    const item = arr[i];
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      lines.push(scalarString(item).trim(), "");
      continue;
    }
    const rec = item as Record<string, unknown>;
    const g = scalarString(rec.given).trim();
    const w = scalarString(rec.when).trim();
    const t = scalarString(rec.then).trim();
    if (g !== "") {
      lines.push(`- Given: ${g}`);
    }
    if (w !== "") {
      lines.push(`- When: ${w}`);
    }
    if (t !== "") {
      lines.push(`- Then: ${t}`);
    }
    lines.push("");
  }
}

function messageForRecord(rec: YamlRecord): string {
  const name = scalarString(rec.feature_name).trim();
  const goal = scalarString(rec.goal).trim();
  if (name === "") {
    throw new Error("feature spec record requires feature_name");
  }
  if (goal === "") {
    throw new Error("feature spec record requires goal");
  }
  const lines: string[] = [];
  const order = rec.order;
  if (order === undefined || order === null || String(order).trim() === "") {
    lines.push(`# ${name}`);
  } else {
    lines.push(`# [${String(order).trim()}] ${name}`);
  }
  lines.push("", "## Goal", goal, "");
  const beh = scalarString(rec.behavior).trim();
  if (beh !== "") {
    lines.push("## Behavior", beh, "");
  }
  appendSection(lines, "## Rules", listItems(rec.rules));
  appendExamples(lines, rec.examples);
  appendSection(lines, "## Boundary conditions", listItems(rec.boundary_conditions));
  const oos = scalarString(rec.out_of_scope).trim();
  if (oos !== "") {
    lines.push("## Out of scope", oos, "");
  }
  return lines.join("\n").trim();
}

export function messagesFromFeatureSpecYaml(
  path: string,
  opts?: FeatureSpecOptions,
): string[] {
  const data = fs.readFileSync(path, "utf8");
  let doc: unknown;
  try {
    doc = yaml.load(data);
  } catch (err) {
    throw new Error(`invalid feature-spec batch YAML in ${path}: ${String(err)}`);
  }
  let records = normalizeRoot(doc, path);
  if (records.length === 0) {
    throw new Error(
      `invalid feature-spec batch YAML: expected a non-empty list of records in ${path}`,
    );
  }
  for (let i = 0; i < records.length; i++) {
    if (typeof records[i] !== "object" || records[i] === null || Array.isArray(records[i])) {
      throw new Error(`invalid feature-spec batch YAML: item ${i} must be a map`);
    }
  }
  records = sortRecords(records);
  const selected = selectByOrder(records, opts, path);
  return selected.map((rec) => messageForRecord(rec));
}

export function loadFeatureSpecTurns(
  path: string,
  opts?: FeatureSpecOptions,
): Turn[] {
  const msgs = messagesFromFeatureSpecYaml(path, opts);
  return msgs.map((m) => ({
    parts: [m],
    chainFromPrevious: false,
    stepStub: "",
  }));
}

export function parseFeatureSpecOrderFilter(raw: string): OrderFilter | undefined {
  const t = raw.trim();
  if (t === "") {
    return undefined;
  }
  return parseOrderFilter(t);
}
