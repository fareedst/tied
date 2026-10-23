/**
 * [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
 * Atomic YAML writer for Authoritative Tracker (Go checklist atomicWriteYAML parity).
 */
import fs from "node:fs";
import path from "node:path";

import yaml from "js-yaml";

/**
 * Checklist tracker YAML: preserve list order under workflow keys (subset of tied-yaml-canonical-v1).
 * Full profile lives in mcp-server storage-dump; agentstream package stays js-yaml-only at build time.
 */
const ORDERED_LIST_KEY_REGEX =
  /^(?:order|order_.*|.*_order|.*_order_.*|steps|steps_.*|.*_steps|.*_steps_.*|_order|_order_.*|_seq|_seq_.*|_sequence|_sequence_.*|.*_seq|.*_sequence|seq_.*|sequence_.*)$/;

function compareLexical(left: string, right: string): number {
  const fl = left.toLowerCase();
  const fr = right.toLowerCase();
  if (fl < fr) return -1;
  if (fl > fr) return 1;
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function canonicalizeTrackerValue(value: unknown, parentKey?: string): unknown {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (Array.isArray(value)) {
    if (parentKey && ORDERED_LIST_KEY_REGEX.test(parentKey)) {
      return value.map((item, index) => canonicalizeTrackerValue(item, `${parentKey}[${index}]`));
    }
    if (value.every((item) => typeof item === "string")) {
      return [...value].sort(compareLexical);
    }
    return value.map((item, index) => canonicalizeTrackerValue(item, `${parentKey ?? ""}[${index}]`));
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort(compareLexical);
    const out: Record<string, unknown> = {};
    for (const key of keys) {
      out[key] = canonicalizeTrackerValue(record[key], key);
    }
    return out;
  }
  return value;
}

export function atomicWriteYaml(
  filePath: string,
  doc: Record<string, unknown>,
): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
  const body = yaml.dump(canonicalizeTrackerValue(doc), { lineWidth: -1, noRefs: true, sortKeys: false });
  const tmp = path.join(
    dir,
    `.tracker-${process.pid}-${Date.now()}.yaml.tmp`,
  );
  try {
    fs.writeFileSync(tmp, body, { mode: 0o644 });
    fs.renameSync(tmp, filePath);
  } catch (err) {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
    throw new Error(`write_failure: ${String(err)}`);
  }
}
