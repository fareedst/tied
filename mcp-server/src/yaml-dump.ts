/**
 * Safe YAML emission for TIED index and detail files.
 * Uses the resolved js-yaml scalar-style options so string values remain parseable in
 * either repository-selected style. Prefer this over yaml.dump for all TIED writes.
 */

import yaml from "js-yaml";
import { canonicalizeValue } from "./yaml-canonicalizer.js";
import {
  getDefaultTiedBasePath,
  resolveYamlStyle,
  yamlDumpOptionsForStyle,
  type ResolvedYamlStyle,
} from "./yaml-style-config.js";

const SAFE_DUMP_OPTIONS: yaml.DumpOptions = {
  sortKeys: false,
  lineWidth: -1,
  noRefs: true,
};

/**
 * Serialize an object to YAML with safe quoting so values containing colons
 * and other ambiguous characters are double-quoted and parse correctly.
 */
export function safeDump(
  obj: unknown,
  resolvedStyle: ResolvedYamlStyle = resolveYamlStyle(getDefaultTiedBasePath()),
): string {
  // [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
  // How: Canonicalize typed values and use the resolved scalar policy so all MCP YAML writers share one profile.
  return yaml.dump(canonicalizeValue(obj), {
    ...SAFE_DUMP_OPTIONS,
    ...yamlDumpOptionsForStyle(resolvedStyle.scalar_style),
  });
}

/**
 * Serialize a REQ/ARCH/IMPL detail document `{ [token]: record }` with safe quoting.
 * For REQ/ARCH, non-empty `essence_pseudocode` is emitted in YAML as a literal block (`|-`) when present.
 * For IMPL-*, the caller must omit `essence_pseudocode` and persist it to `IMPL-*-pseudocode.md` instead; this
 * function never embeds `essence_pseudocode` in the YAML for IMPL (strip before calling, or use writeTiedDetailToDisk).
 */
export function safeDumpTiedDetailDoc(
  token: string,
  record: Record<string, unknown>,
  resolvedStyle: ResolvedYamlStyle = resolveYamlStyle(getDefaultTiedBasePath()),
): string {
  if (token.startsWith("IMPL-")) {
    const { essence_pseudocode: _ep, ...rest } = record;
    return safeDump({ [token]: rest }, resolvedStyle);
  }
  const ep = record.essence_pseudocode;
  if (typeof ep !== "string" || ep.length === 0) {
    return safeDump({ [token]: record }, resolvedStyle);
  }
  const { essence_pseudocode: _ep, ...rest } = record;
  const base = yaml.dump(canonicalizeValue({ [token]: rest }), {
    ...SAFE_DUMP_OPTIONS,
    ...yamlDumpOptionsForStyle(resolvedStyle.scalar_style),
  });
  const trimmed = base.replace(/\n+$/, "");
  const bodyRaw = ep.endsWith("\n") ? ep.slice(0, -1) : ep;
  const bodyLines = bodyRaw.split("\n").map((line) => `    ${line}`).join("\n");
  return `${trimmed}\n  essence_pseudocode: |-\n${bodyLines}\n`;
}
