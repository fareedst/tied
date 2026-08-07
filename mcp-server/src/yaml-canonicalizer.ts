import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import {
  getDefaultTiedBasePath,
  resolveYamlStyle,
  yamlDumpOptionsForStyle,
  type ResolvedYamlStyle,
  type YamlScalarStyle,
} from "./yaml-style-config.js";

export const YAML_FORMAT_PROFILE = "tied-yaml-canonical-v1";

export type CanonicalYamlValue =
  | null
  | string
  | number
  | boolean
  | CanonicalYamlValue[]
  | { [key: string]: CanonicalYamlValue };

export type YamlFormatMetadata = {
  profile_id: string;
  scalar_style: YamlScalarStyle;
  style_source: string;
  recursive_key_order: string;
  ordered_list_key_pattern: string;
  string_list_rule: string;
  scalar_policy: string;
  opaque_block_policy: string;
};

// [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
// How: Recursively sort maps and eligible string lists with case-insensitive-primary ordering and original-value lexical tie-breaking while preserving scalar types, ordered-list order, object-list order, mixed-list order, and opaque text structure.
export function canonicalizeValue(value: unknown, parentKey?: string): CanonicalYamlValue {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    const canonical = value.map((item) => canonicalizeValue(item, parentKey));
    const allStrings = value.every((item) => typeof item === "string");
    if (allStrings && !isOrderedListKey(parentKey)) {
      return canonical.sort((left, right) => compareLexical(String(left), String(right)));
    }
    return canonical;
  }

  if (typeof value === "object") {
    const result: Record<string, CanonicalYamlValue> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort(compareLexical)) {
      result[key] = canonicalizeValue((value as Record<string, unknown>)[key], key);
    }
    return result;
  }

  throw new TypeError(`Unsupported YAML value: ${typeof value}`);
}

// [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
// How: Compare Unicode-lowercased values first, then original values as a deterministic case-sensitive tie-breaker.
function compareLexical(left: string, right: string): number {
  const foldedComparison = compareCodeUnits(left.toLowerCase(), right.toLowerCase());
  if (foldedComparison !== 0) return foldedComparison;
  return compareCodeUnits(left, right);
}

function compareCodeUnits(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function isOrderedListKey(key: string | undefined): boolean {
  return Boolean(key && /^(?:order|order_.*|.*_order|.*_order_.*)$/.test(key));
}

// [IMPL-TIED_YAML_STYLE_RESOLVER] [ARCH-TIED_YAML_STYLE_RESOLUTION] [REQ-TIED_YAML_STYLE_CONFIGURATION]
// How: Return stable metadata describing the canonical profile, resolved scalar style, and preservation boundaries.
export function formatYamlMetadata(
  resolvedStyle: ResolvedYamlStyle = resolveYamlStyle(getDefaultTiedBasePath()),
): YamlFormatMetadata {
  return {
    profile_id: YAML_FORMAT_PROFILE,
    scalar_style: resolvedStyle.scalar_style,
    style_source: resolvedStyle.style_source,
    recursive_key_order: "case-insensitive-primary locale-independent lexical with original-value tie-break",
    ordered_list_key_pattern: "order|order_*|*_order|*_order_*",
    string_list_rule: "sort all-string lists except ordered-list keys",
    scalar_policy: "preserve string, boolean, number, and null types",
    opaque_block_policy: "preserve block-scalar bodies and IMPL pseudo-code sidecars",
  };
}

// [IMPL-TIED_YAML_STYLE_RESOLVER] [ARCH-TIED_YAML_STYLE_RESOLUTION] [REQ-TIED_YAML_STYLE_CONFIGURATION] [REQ-TIED_YAML_CANONICALIZATION]
// How: Parse, canonicalize with the resolved style, serialize, and atomically replace one YAML file only after every operation succeeds.
export function writeCanonicalYamlAtomic(
  filePath: string
): { ok: true; yaml_format: YamlFormatMetadata } | { ok: false; error: string } {
  try {
    const source = fs.readFileSync(filePath, "utf8");
    const canonical = canonicalizeYamlText(source);
    if (!canonical.ok) return canonical;
    return writeSerializedAtomic(filePath, canonical.text, canonical.yaml_format);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export function canonicalizeYamlText(
  text: string,
): { ok: true; text: string; yaml_format: YamlFormatMetadata } | { ok: false; error: string } {
  try {
    const resolvedStyle = resolveYamlStyle(getDefaultTiedBasePath());
    const serialized = yaml.dump(canonicalizeValue(yaml.load(text)), {
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
      ...yamlDumpOptionsForStyle(resolvedStyle.scalar_style),
    });
    return { ok: true, text: serialized, yaml_format: formatYamlMetadata(resolvedStyle) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export function writeCanonicalYamlTextAtomic(
  filePath: string,
  text: string
): { ok: true; yaml_format: YamlFormatMetadata } | { ok: false; error: string } {
  try {
    const canonical = canonicalizeYamlText(text);
    if (!canonical.ok) return canonical;
    return writeSerializedAtomic(filePath, canonical.text, canonical.yaml_format);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export function writeCanonicalValueAtomic(
  filePath: string,
  value: unknown
): { ok: true; yaml_format: YamlFormatMetadata } | { ok: false; error: string } {
  try {
    const resolvedStyle = resolveYamlStyle(getDefaultTiedBasePath());
    const serialized = yaml.dump(canonicalizeValue(value), {
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
      ...yamlDumpOptionsForStyle(resolvedStyle.scalar_style),
    });
    return writeSerializedAtomic(filePath, serialized, formatYamlMetadata(resolvedStyle));
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export function writeAtomicText(
  filePath: string,
  text: string,
  resolvedStyle: ResolvedYamlStyle = resolveYamlStyle(getDefaultTiedBasePath()),
): { ok: true; yaml_format: YamlFormatMetadata } | { ok: false; error: string } {
  try {
    return writeSerializedAtomic(filePath, text, formatYamlMetadata(resolvedStyle));
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

function writeSerializedAtomic(
  filePath: string,
  serialized: string,
  yamlFormat: YamlFormatMetadata,
): { ok: true; yaml_format: YamlFormatMetadata } {
  const temporaryPath = path.join(
    path.dirname(filePath),
    `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`,
  );
  fs.writeFileSync(temporaryPath, serialized, "utf8");
  try {
    fs.renameSync(temporaryPath, filePath);
  } catch (error) {
    try {
      fs.unlinkSync(temporaryPath);
    } catch {
      // Preserve the original error; cleanup is best effort.
    }
    throw error;
  }
  return { ok: true, yaml_format: yamlFormat };
}
