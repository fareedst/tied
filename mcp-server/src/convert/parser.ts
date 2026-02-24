/**
 * Parser for STDD 1.0.0 monolithic markdown files.
 * Splits by section headings and extracts tokens, titles, and structured fields.
 */

const REQ_TOKEN_REGEX = /\[REQ-[A-Z0-9_]+\]/g;
const ARCH_TOKEN_REGEX = /\[ARCH-[A-Z0-9_]+\]/g;
const IMPL_TOKEN_REGEX = /\[IMPL-[A-Z0-9_]+\]/g;

/** Extract all tokens of a type from text (without brackets). */
function extractTokens(text: string, regex: RegExp): string[] {
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  const re = new RegExp(regex.source, "g");
  while ((m = re.exec(text)) !== null) {
    seen.add(m[0].replace(/^\[|\]$/g, ""));
  }
  return [...seen];
}

/** Normalize a heading or label to a YAML-style key: lowercase, spaces/special → single underscore. */
function normalizeKey(raw: string): string {
  return raw
    .trim()
    .replace(/^#+\s*/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s.:]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "") || "";
}

/**
 * Detect if content is a bullet list (all non-empty lines start with - or *).
 * If so, return array of trimmed item strings; otherwise return null.
 */
function parseListValue(text: string): string[] | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const lines = trimmed.split(/\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;
  const bulletRe = /^[-*]\s+/;
  const allBullets = lines.every((l) => bulletRe.test(l) || l.startsWith("-") || l.startsWith("*"));
  if (!allBullets) return null;
  return lines.map((l) => l.replace(/^[-*]\s*/, "").trim()).filter(Boolean);
}

type FieldEntry = { index: number; key: string; valueStart: number; sameLineValue?: string };

/**
 * Parse a section body: every ##/### heading or **Label** that immediately holds text or a list
 * becomes a key. Values are string or string[] (list). Empty values omitted.
 * [IMPL] Markdown-to-YAML: headings and labels become keys.
 */
export function parseHeadingAndLabelSections(
  body: string
): Record<string, string | string[]> {
  const entries: FieldEntry[] = [];
  // (1) Markdown headings ## or ###
  const headingRe = /^(#{2,3})\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = headingRe.exec(body)) !== null) {
    const rawKey = m[2].trim();
    const key = normalizeKey(rawKey);
    if (!key) continue;
    const lineEnd = body.indexOf("\n", m.index);
    const valueStart = lineEnd === -1 ? body.length : lineEnd + 1;
    entries.push({ index: m.index, key, valueStart });
  }
  // (2) Bold labels **Key** or **Key**:
  const labelLineRe = /^(?:-\s+)?\*\*([^*]+)\*\*\s*:?/gm;
  while ((m = labelLineRe.exec(body)) !== null) {
    let rawKey = m[1].trim();
    const lineEnd = body.indexOf("\n", m.index);
    const eol = lineEnd === -1 ? body.length : lineEnd;
    const valueStart = lineEnd === -1 ? body.length : lineEnd + 1;
    let sameLineValue: string | undefined;
    if (rawKey.includes(": ")) {
      const colonIdx = rawKey.indexOf(": ");
      sameLineValue = rawKey.slice(colonIdx + 2).trim();
      rawKey = rawKey.slice(0, colonIdx).trim();
    } else {
      const restOfLine = body.slice(m.index + m[0].length, eol).trim();
      if (restOfLine !== "" && !/^`\[[\w:-]+\]`\s*:?\s*$/.test(restOfLine))
        sameLineValue = restOfLine;
    }
    const key = normalizeKey(rawKey);
    if (!key) continue;
    entries.push({ index: m.index, key, valueStart, sameLineValue });
  }
  entries.sort((a, b) => a.index - b.index);
  const out: Record<string, string | string[]> = {};
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const nextStart = i + 1 < entries.length ? entries[i + 1].index : body.length;
    let value: string | string[];
    if (entry.sameLineValue !== undefined && entry.sameLineValue !== "") {
      value = entry.sameLineValue;
    } else {
      const raw = body.slice(entry.valueStart, nextStart).trim();
      const list = parseListValue(raw);
      value = list !== null ? list : raw;
    }
    if (typeof value === "string" && value === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[entry.key] = value;
  }
  return out;
}

/**
 * Parse a section body using "next bold label" strategy: each value runs from
 * the end of the label line until the next line that starts with **Label** or **Label**:.
 * Preserves multi-line content including bullet lists under Satisfaction Criteria,
 * Validation Criteria, Implementation Notes, etc.
 * Same-line values (e.g. **Priority: P0 (Critical)**) are captured by splitting key on ": ".
 */
function parseLabeledSections(
  body: string
): Record<string, string> & { _raw?: string } {
  const out: Record<string, string> = {};
  const labelLineRe = /^(?:-\s+)?\*\*([^*]+)\*\*\s*:?/gm;
  const labels: { index: number; key: string; valueStart: number; sameLineValue?: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = labelLineRe.exec(body)) !== null) {
    let rawKey = m[1].trim();
    const lineEnd = body.indexOf("\n", m.index);
    const eol = lineEnd === -1 ? body.length : lineEnd;
    const valueStart = lineEnd === -1 ? body.length : lineEnd + 1;
    const restOfLine = body.slice(m.index + m[0].length, eol).trim();
    let sameLineValue: string | undefined;
    if (rawKey.includes(": ")) {
      const colonIdx = rawKey.indexOf(": ");
      sameLineValue = rawKey.slice(colonIdx + 2).trim();
      rawKey = rawKey.slice(0, colonIdx).trim();
    } else if (restOfLine !== "" && !/^`\[[\w:-]+\]`\s*:?\s*$/.test(restOfLine)) {
      sameLineValue = restOfLine;
    }
    const key = normalizeKey(rawKey) || rawKey.replace(/\s+/g, "_").toLowerCase().replace(/:$/, "");
    labels.push({ index: m.index, key, valueStart, sameLineValue });
  }
  for (let i = 0; i < labels.length; i++) {
    const entry = labels[i];
    const multiLine = body.slice(entry.valueStart, i + 1 < labels.length ? labels[i + 1].index : body.length).trim();
    const value = entry.sameLineValue !== undefined && entry.sameLineValue !== ""
      ? entry.sameLineValue
      : multiLine;
    out[entry.key] = value;
  }
  return out;
}

/** Get string from fields map for a key (value may be string or string[]; array joined with newlines). */
function fieldString(fields: Record<string, string | string[]>, key: string): string | undefined {
  const v = fields[key];
  if (v == null) return undefined;
  if (typeof v === "string") return v || undefined;
  return v.length ? v.join("\n") : undefined;
}

export interface ParsedRequirement {
  token: string;
  title: string;
  body: string;
  /** All heading/label keys from section body (string or list of strings). */
  fields?: Record<string, string | string[]>;
  description?: string;
  rationale?: string;
  satisfaction_criteria?: string;
  validation_criteria?: string;
  implementation_notes?: string;
  traceability_arch?: string[];
  traceability_impl?: string[];
  related_depends_on?: string[];
  related_related_to?: string[];
  priority?: string;
  category?: string;
  status?: string;
}

/**
 * Split requirements markdown by ### [REQ-*] or # [REQ-*] and parse each section.
 * Allows optional numbering after heading (e.g. ### 2. [REQ-ANOTHER_FEATURE] Title).
 */
export function parseMonolithicRequirements(md: string): ParsedRequirement[] {
  const results: ParsedRequirement[] = [];
  // Optional (?:\d+\.\s+)? allows "### 2. [REQ-...]" style; lookahead must match same.
  // Use (?![\s\S]) for end-of-string ( . in JS does not match newline, so (?!.) would match before \n ).
  const fallbackRegex = /(?:^###\s+(?:\d+\.\s+)?|^##\s+(?:\d+\.\s+)?|^#\s+(?:\d+\.\s+)?)(\[REQ-[A-Z0-9_]+\])\s*([^\n]*)\n([\s\S]*?)(?=(?:^###\s+(?:\d+\.\s+)?|^##\s+(?:\d+\.\s+)?|^#\s+(?:\d+\.\s+)?)\[REQ-|(?![\s\S]))/gm;
  let fallback: RegExpExecArray | null;
  while ((fallback = fallbackRegex.exec(md)) !== null) {
    const token = fallback[1].replace(/^\[|\]$/g, "");
    const title = fallback[2].trim() || token;
    const body = fallback[3].trim();
    const fields = parseHeadingAndLabelSections(body);
    const parsed = parseLabeledSections(body);
    const arch = extractTokens(body, ARCH_TOKEN_REGEX);
    const impl = extractTokens(body, IMPL_TOKEN_REGEX);
    const reqInBody = extractTokens(body, REQ_TOKEN_REGEX).filter((t) => t !== token);
    results.push({
      token,
      title,
      body,
      fields: Object.keys(fields).length ? fields : undefined,
      description: fieldString(fields, "description") ?? parsed.description ?? undefined,
      rationale: fieldString(fields, "rationale") ?? parsed.rationale ?? undefined,
      satisfaction_criteria: fieldString(fields, "satisfaction_criteria") ?? parsed.satisfaction_criteria ?? undefined,
      validation_criteria: fieldString(fields, "validation_criteria") ?? parsed.validation_criteria ?? undefined,
      implementation_notes: fieldString(fields, "implementation_notes") ?? parsed.implementation_notes ?? undefined,
      traceability_arch: arch.length ? arch : undefined,
      traceability_impl: impl.length ? impl : undefined,
      related_depends_on: reqInBody.length ? reqInBody : undefined,
      priority: fieldString(fields, "priority") ?? parsed.priority ?? undefined,
      category: fieldString(fields, "category") ?? parsed.category ?? undefined,
      status: fieldString(fields, "status") ?? parsed.status ?? undefined,
    });
  }
  return results;
}

export interface ParsedArchitectureDecision {
  token: string;
  title: string;
  body: string;
  /** All heading/label keys from section body (string or list of strings). */
  fields?: Record<string, string | string[]>;
  req_refs: string[];
  decision?: string;
  rationale?: string;
  alternatives_considered?: string;
  implementation_approach?: string;
  token_coverage?: string;
  status?: string;
}

/** Extract "### Decision: ..." block from section body (until next ** or ###). */
function extractDecisionBlock(body: string): { decision: string; restBody: string } {
  const decisionRe = /^###\s+Decision\s*:\s*([\s\S]*?)(?=^\s*(\*\*|###)|\s*$)/m;
  const match = body.match(decisionRe);
  if (!match) return { decision: "", restBody: body };
  const decision = match[1].trim();
  const restStart = match.index! + match[0].length;
  const restBody = body.slice(restStart).trim();
  return { decision, restBody };
}

/** Extract "### Implementation Approach: ..." block (until next ### heading or end). Used for IMPL sections. */
function extractImplementationApproachBlock(body: string): { implementation_approach: string; restBody: string } {
  const re = /^###\s+Implementation\s+Approach\s*:\s*([\s\S]*?)(?=^###\s|$)/m;
  const match = body.match(re);
  if (!match) return { implementation_approach: "", restBody: body };
  const implementation_approach = match[1].trim();
  const restStart = match.index! + match[0].length;
  const restBody = body.slice(restStart).trim();
  return { implementation_approach, restBody };
}

/** Structured field entry for result type or item error fields (STDD implementation approach). */
export interface ImplementationFieldEntry {
  name: string;
  type?: string;
}

/**
 * Parse field-list text (e.g. under "Result Type Fields" or "ItemError Fields") into structured entries.
 * Handles lines like "  - ItemsCompleted, ItemsFailed (int)" or "  - BytesCopied (int64)" or "SourcePath, DestPath (string)".
 * Converts headings/categories into data keys: each line becomes one or more { name, type } entries.
 */
export function parseFieldListText(text: string): ImplementationFieldEntry[] {
  if (!text || !text.trim()) return [];
  const entries: ImplementationFieldEntry[] = [];
  const lines = text
    .split(/\n/)
    .map((s) => s.trim().replace(/^\s*[-*]\s*/, "").trim())
    .filter(Boolean);
  for (const line of lines) {
    // Match "Name1, Name2 (type)" or "Name (type)" or "Name1, Name2" at end of line
    const withType = line.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    if (withType) {
      const typeStr = withType[2].trim();
      let namesStr = withType[1].trim();
      namesStr = namesStr.replace(/^\s*[-*]\s*/, "").trim();
      const names = namesStr.split(/\s*,\s*/).map((n) => n.trim()).filter(Boolean);
      for (const name of names) entries.push({ name, type: typeStr });
    } else {
      let clean = line.replace(/^\s*[-*]\s*/, "").trim();
      const names = clean.split(/\s*,\s*/).map((n) => n.trim()).filter(Boolean);
      for (const name of names) entries.push({ name });
    }
  }
  return entries;
}

/** Known implementation-approach data keys (headings/categories → YAML keys). */
const IMPL_APPROACH_KEYS = [
  "location",
  "result_type_fields",
  "item_error_fields",
  "population",
  "availability",
] as const;

/** Parser produces e.g. "itemerror_fields" from "ItemError Fields"; map to canonical key. */
const IMPL_APPROACH_KEY_ALIASES: Record<string, string> = {
  itemerror_fields: "item_error_fields",
  resulttype_fields: "result_type_fields",
};

function getRawForImpltKey(parsed: Record<string, string>, implParsed: Record<string, string>, canonicalKey: string): string {
  let raw = (parsed[canonicalKey] ?? implParsed[canonicalKey]) as string | undefined;
  if (raw != null && raw !== "") return raw;
  const alias = Object.keys(IMPL_APPROACH_KEY_ALIASES).find((k) => IMPL_APPROACH_KEY_ALIASES[k] === canonicalKey);
  if (alias) raw = (parsed[alias] ?? implParsed[alias]) as string | undefined;
  return (raw ?? "") as string;
}

function extractImplementationApproachData(
  parsed: Record<string, string>,
  implBlock: string
): {
  location?: string;
  result_type_fields?: string;
  result_type_fields_structured?: ImplementationFieldEntry[];
  item_error_fields?: string;
  item_error_fields_structured?: ImplementationFieldEntry[];
  population?: string;
  availability?: string;
} {
  const out: {
    location?: string;
    result_type_fields?: string;
    result_type_fields_structured?: ImplementationFieldEntry[];
    item_error_fields?: string;
    item_error_fields_structured?: ImplementationFieldEntry[];
    population?: string;
    availability?: string;
  } = {};
  const implParsed = implBlock ? parseLabeledSections(implBlock) : {};
  for (const key of IMPL_APPROACH_KEYS) {
    const raw = getRawForImpltKey(parsed, implParsed as Record<string, string>, key);
    if (!raw || typeof raw !== "string") continue;
    if (key === "location") out.location = raw.replace(/^`|`$/g, "").trim();
    else if (key === "population") out.population = raw.trim();
    else if (key === "availability") out.availability = raw.trim();
    else if (key === "result_type_fields") {
      out.result_type_fields = raw.trim();
      out.result_type_fields_structured = parseFieldListText(raw);
    } else if (key === "item_error_fields") {
      out.item_error_fields = raw.trim();
      out.item_error_fields_structured = parseFieldListText(raw);
    }
  }
  return out;
}

/**
 * Split architecture-decisions markdown by ## N. Title [ARCH-*] and parse each section.
 * Allows decimal numbering (e.g. 4.1, 14.1.) and optional [REQ-*] / [IMPL-*] after [ARCH-*].
 */
export function parseMonolithicArchitecture(md: string): ParsedArchitectureDecision[] {
  const results: ParsedArchitectureDecision[] = [];
  // Allow \d+(\.\d+)*\.? for "3.", "4.1", "14.1." style numbering; capture title and [ARCH-*]; optional [REQ-*][IMPL-*] refs
  const sectionRegex = /^##\s+\d+(?:\.\d+)*\.?\s+(.+?)\s+(\[ARCH-[A-Z0-9_]+\])\s*((?:\[(?:REQ|IMPL)-[A-Z0-9_]+\]\s*)*)\s*$/gm;
  let m: RegExpExecArray | null;
  const sections: { index: number; token: string; title: string; reqRefs: string[] }[] = [];
  while ((m = sectionRegex.exec(md)) !== null) {
    const title = m[1].trim();
    const token = m[2].replace(/^\[|\]$/g, "");
    const refPart = m[3] || "";
    const reqRefs = extractTokens(refPart, REQ_TOKEN_REGEX);
    sections.push({ index: m.index, token, title, reqRefs });
  }
  for (let i = 0; i < sections.length; i++) {
    const start = sections[i].index;
    const end = i + 1 < sections.length ? sections[i + 1].index : md.length;
    const sectionMd = md.slice(start, end);
    const firstLineEnd = sectionMd.indexOf("\n");
    const body = firstLineEnd >= 0 ? sectionMd.slice(firstLineEnd).trim() : "";
    const fields = parseHeadingAndLabelSections(body);
    const { decision: decisionBlock, restBody } = extractDecisionBlock(body);
    const parsed = parseLabeledSections(restBody);
    const reqInBody = extractTokens(body, REQ_TOKEN_REGEX);
    const reqRefs = [...new Set([...sections[i].reqRefs, ...reqInBody])];
    const implementation_approach =
      fieldString(fields, "implementation_approach") ??
      (parsed.implementation_approach ||
        parsed.implementation_plan ||
        (parsed as Record<string, string>).implementation ||
        undefined);
    const token_coverage = fieldString(fields, "token_coverage") ?? parsed.token_coverage ?? undefined;
    const status =
      fieldString(fields, "status") ??
      (parsed.status ||
        (parsed as Record<string, string>).implementation_status ||
        undefined);
    results.push({
      token: sections[i].token,
      title: sections[i].title,
      body,
      fields: Object.keys(fields).length ? fields : undefined,
      req_refs: reqRefs,
      decision: decisionBlock || fieldString(fields, "decision") || parsed.decision || undefined,
      rationale: fieldString(fields, "rationale") ?? parsed.rationale ?? undefined,
      alternatives_considered: fieldString(fields, "alternatives_considered") ?? parsed.alternatives_considered ?? undefined,
      implementation_approach,
      token_coverage,
      status,
    });
  }
  if (results.length > 0) return results;

  // Fallback: any ## ... [ARCH-*] with body until next ## or end of string
  const altRegex = /^##\s+.+?(\[ARCH-[A-Z0-9_]+\])\s*([^\n]*)\n([\s\S]*?)(?=^##\s+|(?![\s\S]))/gm;
  let alt: RegExpExecArray | null;
  while ((alt = altRegex.exec(md)) !== null) {
    const token = alt[1].replace(/^\[|\]$/g, "");
    const title = alt[2].trim() || token;
    const body = alt[3].trim();
    const fields = parseHeadingAndLabelSections(body);
    const { decision: decisionBlock, restBody } = extractDecisionBlock(body);
    const parsed = parseLabeledSections(restBody);
    const reqRefs = extractTokens(alt[0] + body, REQ_TOKEN_REGEX);
    const implementation_approach =
      fieldString(fields, "implementation_approach") ??
      (parsed.implementation_approach ||
        parsed.implementation_plan ||
        (parsed as Record<string, string>).implementation ||
        undefined);
    const token_coverage = fieldString(fields, "token_coverage") ?? parsed.token_coverage ?? undefined;
    const status =
      fieldString(fields, "status") ??
      (parsed.status ||
        (parsed as Record<string, string>).implementation_status ||
        undefined);
    results.push({
      token,
      title,
      body,
      fields: Object.keys(fields).length ? fields : undefined,
      req_refs: reqRefs,
      decision: decisionBlock || fieldString(fields, "decision") || parsed.decision || undefined,
      rationale: fieldString(fields, "rationale") ?? parsed.rationale ?? undefined,
      alternatives_considered: fieldString(fields, "alternatives_considered") ?? parsed.alternatives_considered ?? undefined,
      implementation_approach,
      token_coverage,
      status,
    });
  }
  return results;
}

export interface ParsedImplementationDecision {
  token: string;
  title: string;
  body: string;
  /** All heading/label keys from section body (string or list of strings). */
  fields?: Record<string, string | string[]>;
  arch_refs: string[];
  req_refs: string[];
  decision?: string;
  rationale?: string;
  implementation_approach?: string;
  implementation_details?: string;
  code_markers?: string;
  token_coverage?: string;
  validation_evidence?: string;
  status?: string;
  /** [IMPL] Location (e.g. file path) from Implementation Approach. */
  location?: string;
  /** [IMPL] Raw text for Result Type Fields. */
  result_type_fields?: string;
  /** [IMPL] Parsed Result Type Fields as data keys (name + type). */
  result_type_fields_structured?: ImplementationFieldEntry[];
  /** [IMPL] Raw text for ItemError Fields. */
  item_error_fields?: string;
  /** [IMPL] Parsed ItemError Fields as data keys (name + type). */
  item_error_fields_structured?: ImplementationFieldEntry[];
  /** [IMPL] Population (when/how populated). */
  population?: string;
  /** [IMPL] Availability (when returned). */
  availability?: string;
}

/**
 * Split implementation-decisions markdown by ## N. Title [IMPL-*] and parse each section.
 * Allows numbering: N., 1., 2a., 8.1.; header may contain [ARCH-*] [REQ-*] [IMPL-*] refs.
 */
export function parseMonolithicImplementation(md: string): ParsedImplementationDecision[] {
  const results: ParsedImplementationDecision[] = [];
  // (?:N|\d+) allows literal "N." or numbers; (?:\.\d+)*[a-zA-Z]* allows .1 and 2a
  const sectionRegex = /^##\s+(?:N|\d+)(?:\.\d+)*[a-zA-Z]*\.?\s+(.+?)\s+(\[IMPL-[A-Z0-9_]+\])\s*((?:(?:\[ARCH-[A-Z0-9_]+\]|\[REQ-[A-Z0-9_]+\]|\[IMPL-[A-Z0-9_]+\])\s*)*)\s*$/gm;
  let m: RegExpExecArray | null;
  const sections: { index: number; token: string; title: string; archRefs: string[]; reqRefs: string[] }[] = [];
  while ((m = sectionRegex.exec(md)) !== null) {
    const title = m[1].trim();
    const token = m[2].replace(/^\[|\]$/g, "");
    const refPart = m[3] || "";
    const archRefs = extractTokens(refPart, ARCH_TOKEN_REGEX);
    const reqRefs = extractTokens(refPart, REQ_TOKEN_REGEX);
    sections.push({ index: m.index, token, title, archRefs, reqRefs });
  }
  for (let i = 0; i < sections.length; i++) {
    const start = sections[i].index;
    const end = i + 1 < sections.length ? sections[i + 1].index : md.length;
    const sectionMd = md.slice(start, end);
    const firstLineEnd = sectionMd.indexOf("\n");
    const body = firstLineEnd >= 0 ? sectionMd.slice(firstLineEnd).trim() : "";
    const fields = parseHeadingAndLabelSections(body);
    const { decision: decisionBlock, restBody: bodyAfterDecision } = extractDecisionBlock(body);
    const { implementation_approach: implBlock } = extractImplementationApproachBlock(bodyAfterDecision);
    const parsed = parseLabeledSections(bodyAfterDecision);
    const archInBody = extractTokens(body, ARCH_TOKEN_REGEX);
    const reqInBody = extractTokens(body, REQ_TOKEN_REGEX);
    const implApproach =
      implBlock ||
      fieldString(fields, "implementation_approach") ||
      parsed.implementation_approach ||
      (parsed as Record<string, string>).implementation_approach ||
      (parsed as Record<string, string>).implementation ||
      undefined;
    const token_coverage = fieldString(fields, "token_coverage") ?? parsed.token_coverage ?? undefined;
    const code_markers =
      fieldString(fields, "code_markers") ?? (parsed as Record<string, string>).code_markers ?? undefined;
    const validation_evidence =
      fieldString(fields, "validation_evidence") ?? (parsed as Record<string, string>).validation_evidence ?? undefined;
    const implementation_details =
      fieldString(fields, "implementation_details") ?? (parsed as Record<string, string>).implementation_details ?? undefined;
    const status =
      fieldString(fields, "status") ??
      (parsed.status ||
        (parsed as Record<string, string>).implementation_status ||
        undefined);
    const approachData = extractImplementationApproachData(
      parsed as Record<string, string>,
      implBlock
    );
    results.push({
      token: sections[i].token,
      title: sections[i].title,
      body,
      fields: Object.keys(fields).length ? fields : undefined,
      arch_refs: [...new Set([...sections[i].archRefs, ...archInBody])],
      req_refs: [...new Set([...sections[i].reqRefs, ...reqInBody])],
      decision: decisionBlock || fieldString(fields, "decision") || parsed.decision || undefined,
      rationale: fieldString(fields, "rationale") ?? parsed.rationale ?? undefined,
      implementation_approach: implApproach,
      implementation_details,
      code_markers,
      token_coverage,
      validation_evidence,
      status,
      ...approachData,
    });
  }
  if (results.length > 0) return results;

  const altRegex = /^##\s+.+?(\[IMPL-[A-Z0-9_]+\])\s*([^\n]*)\n([\s\S]*?)(?=^##\s+|(?![\s\S]))/gm;
  let alt: RegExpExecArray | null;
  while ((alt = altRegex.exec(md)) !== null) {
    const token = alt[1].replace(/^\[|\]$/g, "");
    const title = alt[2].trim() || token;
    const body = alt[3].trim();
    const fields = parseHeadingAndLabelSections(body);
    const { decision: decisionBlock, restBody: bodyAfterDecision } = extractDecisionBlock(body);
    const { implementation_approach: implBlock } = extractImplementationApproachBlock(bodyAfterDecision);
    const parsed = parseLabeledSections(bodyAfterDecision);
    const full = alt[0] + body;
    const implApproach =
      implBlock ||
      fieldString(fields, "implementation_approach") ||
      parsed.implementation_approach ||
      (parsed as Record<string, string>).implementation ||
      undefined;
    const token_coverage = fieldString(fields, "token_coverage") ?? parsed.token_coverage ?? undefined;
    const code_markers =
      fieldString(fields, "code_markers") ?? (parsed as Record<string, string>).code_markers ?? undefined;
    const validation_evidence =
      fieldString(fields, "validation_evidence") ?? (parsed as Record<string, string>).validation_evidence ?? undefined;
    const implementation_details =
      fieldString(fields, "implementation_details") ?? (parsed as Record<string, string>).implementation_details ?? undefined;
    const status =
      fieldString(fields, "status") ??
      (parsed.status ||
        (parsed as Record<string, string>).implementation_status ||
        undefined);
    const approachData = extractImplementationApproachData(
      parsed as Record<string, string>,
      implBlock
    );
    results.push({
      token,
      title,
      body,
      fields: Object.keys(fields).length ? fields : undefined,
      arch_refs: extractTokens(full, ARCH_TOKEN_REGEX),
      req_refs: extractTokens(full, REQ_TOKEN_REGEX),
      decision: decisionBlock || fieldString(fields, "decision") || parsed.decision || undefined,
      rationale: fieldString(fields, "rationale") ?? parsed.rationale ?? undefined,
      implementation_approach: implApproach,
      implementation_details,
      code_markers,
      token_coverage,
      validation_evidence,
      status,
      ...approachData,
    });
  }
  return results;
}
