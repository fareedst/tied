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
  record_list_rule: string;
  scalar_policy: string;
  opaque_block_policy: string;
};

// [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
// Normative record-list registry: parent key → stable sort field priority.
export const RECORD_LIST_REGISTRY: Record<string, readonly string[]> = {
  satisfaction_criteria: ["criterion"],
  validation_criteria: ["method"],
  alternatives_considered: ["name"],
  files: ["description", "path"],
  functions: ["description", "name"],
  risks: ["description", "mitigation"],
};

export type ListItemTier = {
  tier: 0 | 1;
  sortKey: string;
};

type RecordListRecognition = {
  sort_field: string;
  registry_key: string;
};

// [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
// How: Return registry entry when every list item is a mapping with the configured stable sort field.
function recognizeRecordList(parentKey: string | undefined, items: unknown[]): RecordListRecognition | null {
  if (!parentKey || !(parentKey in RECORD_LIST_REGISTRY)) return null;
  if (!items.every((item) => typeof item === "object" && item !== null && !Array.isArray(item))) return null;
  for (const field of RECORD_LIST_REGISTRY[parentKey]) {
    if (items.every((item) => field in (item as Record<string, unknown>))) {
      return { sort_field: field, registry_key: parentKey };
    }
  }
  return null;
}

function recordFingerprint(record: CanonicalYamlValue): string {
  return JSON.stringify(canonicalizeRecordInner(record));
}

function canonicalizeRecordInner(value: CanonicalYamlValue): CanonicalYamlValue {
  if (Array.isArray(value)) {
    return value.map((item) => canonicalizeRecordInner(item));
  }
  if (value !== null && typeof value === "object") {
    const result: Record<string, CanonicalYamlValue> = {};
    for (const key of Object.keys(value).sort(compareLexical)) {
      result[key] = canonicalizeRecordInner((value as Record<string, CanonicalYamlValue>)[key]);
    }
    return result;
  }
  return value;
}

// [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
// How: Sort complete mapping records by COMPARE_CANONICAL_TEXT on sort field with original-value and fingerprint tie-breaks.
function sortRecordList(items: CanonicalYamlValue[], recognition: RecordListRecognition): CanonicalYamlValue[] {
  const field = recognition.sort_field;
  return [...items].sort((left, right) => {
    const leftRecord = left as Record<string, CanonicalYamlValue>;
    const rightRecord = right as Record<string, CanonicalYamlValue>;
    const leftKey = String(leftRecord[field] ?? "");
    const rightKey = String(rightRecord[field] ?? "");
    const primary = compareLexical(leftKey, rightKey);
    if (primary !== 0) return primary;
    return compareLexical(recordFingerprint(left), recordFingerprint(right));
  });
}

function resolveSortFields(parentKey: string | undefined): readonly string[] | null {
  if (!parentKey || !(parentKey in RECORD_LIST_REGISTRY)) return null;
  return RECORD_LIST_REGISTRY[parentKey];
}

// [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
// How: Infer lexicographically first string-valued map key for unregistered homogeneous map lists.
function inferHeuristicSortField(record: Record<string, CanonicalYamlValue>): string | null {
  const stringKeys = Object.keys(record)
    .filter((key) => typeof record[key] === "string")
    .sort(compareLexical);
  return stringKeys[0] ?? null;
}

// [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
// How: Classify each list item as tier 0 (strings, arrays, keyless maps) or tier 1 (maps with resolved sort field).
export function resolveListItemTier(
  item: CanonicalYamlValue,
  parentKey: string | undefined,
  sortFields: readonly string[] | null = resolveSortFields(parentKey),
): ListItemTier {
  if (typeof item === "string") {
    return { tier: 0, sortKey: item };
  }
  if (Array.isArray(item)) {
    return { tier: 0, sortKey: recordFingerprint(item) };
  }
  if (item !== null && typeof item === "object") {
    const record = item as Record<string, CanonicalYamlValue>;
    if (sortFields) {
      for (const field of sortFields) {
        if (field in record) {
          return { tier: 1, sortKey: `${field}.${String(record[field] ?? "")}` };
        }
      }
    } else {
      const inferred = inferHeuristicSortField(record);
      if (inferred) {
        return { tier: 1, sortKey: `${inferred}.${String(record[inferred] ?? "")}` };
      }
    }
    return { tier: 0, sortKey: recordFingerprint(item) };
  }
  return { tier: 0, sortKey: String(item) };
}

function compareTieredItems(
  left: { item: CanonicalYamlValue; tier: 0 | 1; sortKey: string },
  right: { item: CanonicalYamlValue; tier: 0 | 1; sortKey: string },
): number {
  const primary = compareLexical(left.sortKey, right.sortKey);
  if (primary !== 0) return primary;
  return compareLexical(recordFingerprint(left.item), recordFingerprint(right.item));
}

// [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
// How: Sort heterogeneous lists with tier 0 before tier 1; each tier sorted by canonical lexical sort key.
export function sortListItems(items: CanonicalYamlValue[], parentKey?: string): CanonicalYamlValue[] {
  if (isOrderedListKey(parentKey)) {
    return items;
  }

  const allStrings = items.every((item) => typeof item === "string");
  if (allStrings) {
    return [...items].sort((left, right) => compareLexical(String(left), String(right)));
  }

  const sortFields = resolveSortFields(parentKey);
  const withTiers = items.map((item) => ({
    item,
    ...resolveListItemTier(item, parentKey, sortFields),
  }));

  const tier0 = withTiers.filter((entry) => entry.tier === 0).sort(compareTieredItems);
  const tier1 = withTiers.filter((entry) => entry.tier === 1).sort(compareTieredItems);
  return [...tier0.map((entry) => entry.item), ...tier1.map((entry) => entry.item)];
}

// [IMPL-TIED_YAML_CANONICALIZER] [ARCH-TIED_YAML_CANONICAL_PROFILE] [REQ-TIED_YAML_CANONICALIZATION]
// How: Recursively sort maps and eligible string lists with case-insensitive-primary ordering and original-value lexical tie-breaking while preserving scalar types, ordered-list order, object-list order, mixed-list order, and opaque text structure.
export function canonicalizeValue(value: unknown, parentKey?: string): CanonicalYamlValue {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    const mapped = value.map((item) => canonicalizeValue(item, parentKey));
    if (isOrderedListKey(parentKey)) {
      return mapped;
    }
    const recognition = recognizeRecordList(parentKey, value);
    if (recognition) {
      return sortRecordList(mapped, recognition);
    }
    return sortListItems(mapped, parentKey);
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
export function compareLexical(left: string, right: string): number {
  const foldedComparison = compareCodeUnits(left.toLowerCase(), right.toLowerCase());
  if (foldedComparison !== 0) return foldedComparison;
  return compareCodeUnits(left, right);
}

function compareCodeUnits(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function isOrderedListKey(key: string | undefined): boolean {
  return Boolean(key && /^(?:order|order_.*|.*_order|.*_order_.*|steps|steps_.*|.*_steps|.*_steps_.*)$/.test(key));
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
    ordered_list_key_pattern: "order|order_*|*_order|*_order_*|steps|steps_*|*_steps|*_steps_*",
    string_list_rule: "sort all-string lists except ordered-list keys",
    record_list_rule:
      "tier-0/tier-1 heterogeneous list sorting: strings/arrays/keyless maps before keyed maps; registry and heuristic map lists sort by fieldName.fieldValue; ordered-list keys preserve document order",
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
