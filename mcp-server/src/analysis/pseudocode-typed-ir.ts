/**
 * [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
 * Summary: Type tags, nullable lattice, shape records, and type-fact join for typed-flow analysis.
 */

export type ScalarTag = "int" | "string" | "bool";

export type TypeTag =
  | { kind: "scalar"; tag: ScalarTag }
  | { kind: "nullable"; inner: TypeTag }
  | { kind: "list"; element: TypeTag }
  | { kind: "record"; fields: Record<string, TypeTag> }
  | { kind: "named"; name: string };

export type TypeFact =
  | { status: "known"; tag: TypeTag }
  | { status: "unknown"; causes: string[] }
  | { status: "bottom" };

export const TYPED_FLOW_DEFAULT_JOIN_ITERATIONS = 32;

const NAMED_TYPE_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const NESTED_NAME_TYPE_PATTERN = /^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.+)$/;
const LIST_OF_PATTERN = /^(.+?)\s*\(\s*list\s+of\s+([A-Za-z_][A-Za-z0-9_]*)\s*\)\s*$/i;
const RECORD_INLINE_PATTERN = /^\{\s*([^}]+)\s*\}$/;

function scalarFromKeyword(text: string): ScalarTag | null {
  const lower = text.trim().toLowerCase();
  if (lower === "int") return "int";
  if (lower === "string") return "string";
  if (lower === "bool") return "bool";
  return null;
}

/**
 * [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
 * How: Parse pilot type clauses from contract value text after keyword-colon (D13: no shared regex edits).
 */
export function parseTypeTag(clause: string): TypeTag | null {
  const trimmed = clause.trim();
  if (!trimmed) return null;

  const nullablePipe = trimmed.match(/^(.+?)\s*\|\s*null\s*$/i);
  if (nullablePipe) {
    const inner = parseTypeTag(nullablePipe[1]);
    return inner ? { kind: "nullable", inner } : null;
  }

  const nullablePrefix = trimmed.match(/^nullable\s+(.+)$/i);
  if (nullablePrefix) {
    const inner = parseTypeTag(nullablePrefix[1]);
    return inner ? { kind: "nullable", inner } : null;
  }

  const listMatch = trimmed.match(LIST_OF_PATTERN);
  if (listMatch) {
    const elementName = listMatch[2];
    return { kind: "list", element: { kind: "named", name: elementName } };
  }

  const listOfMatch = trimmed.match(/^list\s+of\s+(.+)$/i);
  if (listOfMatch) {
    const element = parseTypeTag(listOfMatch[1]);
    return element ? { kind: "list", element } : null;
  }

  const recordMatch = trimmed.match(RECORD_INLINE_PATTERN);
  if (recordMatch) {
    const fields: Record<string, TypeTag> = {};
    for (const part of recordMatch[1].split(",")) {
      const fieldMatch = part.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.+)$/);
      if (!fieldMatch) return null;
      const fieldTag = parseTypeTag(fieldMatch[2]);
      if (!fieldTag) return null;
      fields[fieldMatch[1]] = fieldTag;
    }
    return { kind: "record", fields };
  }

  const scalar = scalarFromKeyword(trimmed);
  if (scalar) return { kind: "scalar", tag: scalar };

  if (NAMED_TYPE_PATTERN.test(trimmed)) return { kind: "named", name: trimmed };

  return null;
}

export type ContractBinding = {
  name?: string;
  type_tag?: TypeTag;
  prose: boolean;
};

/**
 * [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
 * How: Extract optional name/type binding from contract row value text (nested name:type inside keyword-colon value).
 */
export function extractContractBinding(value: string): ContractBinding {
  const trimmed = value.trim();
  if (!trimmed) return { prose: true };

  const listMatch = trimmed.match(LIST_OF_PATTERN);
  if (listMatch) {
    const name = listMatch[1].trim();
    const typeTag = parseTypeTag(trimmed);
    if (typeTag && NAMED_TYPE_PATTERN.test(name)) {
      return { name, type_tag: typeTag, prose: false };
    }
  }

  const nested = trimmed.match(NESTED_NAME_TYPE_PATTERN);
  if (nested) {
    const typeTag = parseTypeTag(nested[2]);
    if (typeTag) return { name: nested[1], type_tag: typeTag, prose: false };
  }

  const direct = parseTypeTag(trimmed);
  if (direct) return { type_tag: direct, prose: false };

  return { prose: true };
}

export function typeFactFromTag(tag: TypeTag): TypeFact {
  return { status: "known", tag };
}

export function unknownFact(cause: string): TypeFact {
  return { status: "unknown", causes: [cause] };
}

function tagsEqual(left: TypeTag, right: TypeTag): boolean {
  if (left.kind !== right.kind) return false;
  switch (left.kind) {
    case "scalar":
      return right.kind === "scalar" && left.tag === right.tag;
    case "named":
      return right.kind === "named" && left.name === right.name;
    case "nullable":
      return right.kind === "nullable" && tagsEqual(left.inner, right.inner);
    case "list":
      return right.kind === "list" && tagsEqual(left.element, right.element);
    case "record": {
      if (right.kind !== "record") return false;
      const leftKeys = Object.keys(left.fields).sort();
      const rightKeys = Object.keys(right.fields).sort();
      if (leftKeys.length !== rightKeys.length) return false;
      return leftKeys.every(
        (key, index) => key === rightKeys[index] && tagsEqual(left.fields[key], right.fields[key]!),
      );
    }
    default:
      return false;
  }
}

function mergeNullable(left: TypeTag, right: TypeTag): TypeTag | null {
  if (left.kind === "nullable" && right.kind === "nullable") {
    const merged = mergeTypeTags(left.inner, right.inner);
    return merged ? { kind: "nullable", inner: merged } : null;
  }
  if (left.kind === "nullable") {
    const merged = mergeTypeTags(left.inner, right);
    return merged ? { kind: "nullable", inner: merged } : null;
  }
  if (right.kind === "nullable") {
    const merged = mergeTypeTags(left, right.inner);
    return merged ? { kind: "nullable", inner: merged } : null;
  }
  return null;
}

function mergeTypeTags(left: TypeTag, right: TypeTag): TypeTag | null {
  if (tagsEqual(left, right)) return left;
  const nullable = mergeNullable(left, right);
  if (nullable) return nullable;
  return null;
}

export type JoinTypeFactsResult = {
  fact: TypeFact;
  incompatible: boolean;
};

/**
 * [IMPL-PSEUDOCODE_TYPED_FLOW] [ARCH-PSEUDOCODE_TYPED_FLOW_PASS] [REQ-PSEUDOCODE_TYPED_FLOW]
 * How: Merge type facts at CFG join points; incompatible scalars become bottom with JOIN_INCOMPATIBLE signal.
 */
export function joinTypeFacts(left: TypeFact, right: TypeFact): JoinTypeFactsResult {
  if (left.status === "bottom" || right.status === "bottom") {
    return { fact: { status: "bottom" }, incompatible: true };
  }
  if (left.status === "unknown" && right.status === "unknown") {
    return {
      fact: { status: "unknown", causes: [...new Set([...left.causes, ...right.causes])] },
      incompatible: false,
    };
  }
  if (left.status === "unknown") return { fact: left, incompatible: false };
  if (right.status === "unknown") return { fact: right, incompatible: false };

  const merged = mergeTypeTags(left.tag, right.tag);
  if (merged) return { fact: { status: "known", tag: merged }, incompatible: false };
  return { fact: { status: "bottom" }, incompatible: true };
}

export function typesCompatible(expected: TypeTag, actual: TypeTag): boolean {
  if (tagsEqual(expected, actual)) return true;
  if (expected.kind === "nullable") {
    return typesCompatible(expected.inner, actual);
  }
  if (actual.kind === "nullable") {
    return false;
  }
  if (expected.kind === "named" && actual.kind === "named") {
    return expected.name === actual.name;
  }
  if (expected.kind === "scalar" && actual.kind === "scalar") {
    return expected.tag === actual.tag;
  }
  return false;
}

export function serializeTypeTag(tag: TypeTag): string {
  switch (tag.kind) {
    case "scalar":
      return tag.tag;
    case "named":
      return tag.name;
    case "nullable":
      return `${serializeTypeTag(tag.inner)} | null`;
    case "list":
      return `list of ${serializeTypeTag(tag.element)}`;
    case "record":
      return `{ ${Object.entries(tag.fields)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, fieldTag]) => `${name}: ${serializeTypeTag(fieldTag)}`)
        .join(", ")} }`;
    default:
      return "unknown";
  }
}
