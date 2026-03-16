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
