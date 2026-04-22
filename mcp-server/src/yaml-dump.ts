/**
 * Safe YAML emission for TIED index and detail files.
 * Uses js-yaml options so string values containing ":" (e.g. "criterion: Filter rule: keep...")
 * are quoted and do not break parsing. Prefer this over yaml.dump for all TIED writes.
 */

import yaml from "js-yaml";

const SAFE_DUMP_OPTIONS: yaml.DumpOptions = {
  sortKeys: false,
  lineWidth: -1,
  forceQuotes: true,
  quotingType: '"',
};

/**
 * Serialize an object to YAML with safe quoting so values containing colons
 * and other ambiguous characters are double-quoted and parse correctly.
 */
export function safeDump(obj: unknown): string {
  return yaml.dump(obj, SAFE_DUMP_OPTIONS);
}

/**
 * Serialize a REQ/ARCH/IMPL detail document `{ [token]: record }` with safe quoting,
 * but emit `essence_pseudocode` as a YAML literal block (`|-`) when non-empty so
 * multi-line pseudo-code stays readable in diffs ([IMPL] detail files only).
 */
export function safeDumpTiedDetailDoc(token: string, record: Record<string, unknown>): string {
  const ep = record.essence_pseudocode;
  if (typeof ep !== "string" || ep.length === 0) {
    return safeDump({ [token]: record });
  }
  const { essence_pseudocode: _ep, ...rest } = record;
  const base = yaml.dump({ [token]: rest }, SAFE_DUMP_OPTIONS);
  const trimmed = base.replace(/\n+$/, "");
  const bodyRaw = ep.endsWith("\n") ? ep.slice(0, -1) : ep;
  const bodyLines = bodyRaw.split("\n").map((line) => `    ${line}`).join("\n");
  return `${trimmed}\n  essence_pseudocode: |-\n${bodyLines}\n`;
}
