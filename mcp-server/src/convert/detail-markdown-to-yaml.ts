/**
 * Convert a single REQ/ARCH/IMPL detail document from markdown to YAML.
 * [REQ-CONVERSION_TOOL] [IMPL-MCP_CONVERSION]
 * Reuses monolithic parser (single-section) and existing *ToYamlRecord builders.
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import {
  parseMonolithicRequirements,
  parseMonolithicArchitecture,
  parseMonolithicImplementation,
  parseHeadingAndLabelSections,
  type ParsedRequirement,
  type ParsedArchitectureDecision,
  type ParsedImplementationDecision,
} from "./parser.js";
import {
  requirementToYamlRecord,
  architectureToYamlRecord,
  implementationToYamlRecord,
} from "./yaml-generator.js";
import { resolveOutputBase } from "./runner.js";
import { updateRecord, type IndexName } from "../yaml-loader.js";

const REQ_TOKEN_RE = /^#+\s*\[(REQ-[A-Z0-9_]+)\]\s*(.*)$/m;
const ARCH_TOKEN_RE = /^#+\s*\[(ARCH-[A-Z0-9_]+)\]\s*(.*)$/m;
const IMPL_TOKEN_RE = /^#+\s*\[(IMPL-[A-Z0-9_]+)\]\s*(.*)$/m;

export type DetailType = "requirement" | "architecture" | "implementation";

const SUBDIRS: Record<DetailType, string> = {
  requirement: "requirements",
  architecture: "architecture-decisions",
  implementation: "implementation-decisions",
};

const INDEX_NAMES: Record<DetailType, IndexName> = {
  requirement: "requirements",
  architecture: "architecture",
  implementation: "implementation",
};

function inferTokenFromContent(content: string): { token: string; type: DetailType } | null {
  const req = content.match(REQ_TOKEN_RE);
  if (req) return { token: req[1], type: "requirement" };
  const arch = content.match(ARCH_TOKEN_RE);
  if (arch) return { token: arch[1], type: "architecture" };
  const impl = content.match(IMPL_TOKEN_RE);
  if (impl) return { token: impl[1], type: "implementation" };
  return null;
}

function inferTokenFromFilePath(filePath: string): { token: string; type: DetailType } | null {
  const base = path.basename(filePath, path.extname(filePath));
  if (base.startsWith("REQ-") && /^REQ-[A-Z0-9_]+$/.test(base))
    return { token: base, type: "requirement" };
  if (base.startsWith("ARCH-") && /^ARCH-[A-Z0-9_]+$/.test(base))
    return { token: base, type: "architecture" };
  if (base.startsWith("IMPL-") && /^IMPL-[A-Z0-9_]+$/.test(base))
    return { token: base, type: "implementation" };
  return null;
}

/** Normalize single-# detail doc so ARCH/IMPL monolithic parser (expects ##) can match. */
function normalizeContentForParser(content: string, type: DetailType): string {
  if (type === "requirement") return content;
  const firstLineRe = /^#\s+(\[ARCH-[A-Z0-9_]+\])\s*(.*)$/m;
  const implFirstRe = /^#\s+(\[IMPL-[A-Z0-9_]+\])\s*(.*)$/m;
  if (type === "architecture" && firstLineRe.test(content)) {
    return content.replace(firstLineRe, "## 1. $1 $2");
  }
  if (type === "implementation" && implFirstRe.test(content)) {
    return content.replace(implFirstRe, "## 1. $1 $2");
  }
  return content;
}

/** Build minimal ParsedRequirement from token + body when monolithic parser returns none. */
function buildMinimalRequirement(
  token: string,
  title: string,
  body: string
): ParsedRequirement {
  const fields = parseHeadingAndLabelSections(body);
  const desc = fields.description;
  const rationale = fields.rationale;
  const satisfaction = fields.satisfaction_criteria;
  const validation = fields.validation_criteria;
  const priority = fields.priority;
  const category = fields.category;
  const status = fields.status;
  const implNotes = fields.implementation_notes;
  const archMatch = body.match(/\[ARCH-[A-Z0-9_]+\]/g);
  const arch = archMatch ? [...new Set(archMatch.map((s) => s.replace(/^\[|\]$/g, "")))] : [];
  const implMatch = body.match(/\[IMPL-[A-Z0-9_]+\]/g);
  const impl = implMatch ? [...new Set(implMatch.map((s) => s.replace(/^\[|\]$/g, "")))] : [];
  const reqMatch = body.match(/\[REQ-[A-Z0-9_]+\]/g);
  const dep = reqMatch ? [...new Set(reqMatch.map((s) => s.replace(/^\[|\]$/g, "")))].filter((t) => t !== token) : [];
  return {
    token,
    title: title || token,
    body,
    fields: Object.keys(fields).length ? fields : undefined,
    description: typeof desc === "string" ? desc : Array.isArray(desc) ? desc.join("\n") : undefined,
    rationale: typeof rationale === "string" ? rationale : Array.isArray(rationale) ? rationale.join("\n") : undefined,
    satisfaction_criteria: typeof satisfaction === "string" ? satisfaction : Array.isArray(satisfaction) ? satisfaction.join("\n") : undefined,
    validation_criteria: typeof validation === "string" ? validation : Array.isArray(validation) ? validation.join("\n") : undefined,
    implementation_notes: typeof implNotes === "string" ? implNotes : undefined,
    traceability_arch: arch.length ? arch : undefined,
    traceability_impl: impl.length ? impl : undefined,
    related_depends_on: dep.length ? dep : undefined,
    priority: typeof priority === "string" ? priority : Array.isArray(priority) ? priority[0] : undefined,
    category: typeof category === "string" ? category : Array.isArray(category) ? category[0] : undefined,
    status: typeof status === "string" ? status : Array.isArray(status) ? status[0] : undefined,
  };
}

/** Build minimal ParsedArchitectureDecision when monolithic parser returns none. */
function buildMinimalArchitecture(
  token: string,
  title: string,
  body: string
): ParsedArchitectureDecision {
  const fields = parseHeadingAndLabelSections(body);
  const decision = fields.decision;
  const rationale = fields.rationale;
  const alternatives = fields.alternatives_considered;
  const approach = fields.implementation_approach;
  const status = fields.status;
  const tokenCoverage = fields.token_coverage;
  const reqRefs: string[] = [];
  const bodyMatch = body.match(/\[REQ-[A-Z0-9_]+\]/g);
  if (bodyMatch) reqRefs.push(...[...new Set(bodyMatch)].map((s) => s.replace(/^\[|\]$/g, "")));
  return {
    token,
    title: title || token,
    body,
    fields: Object.keys(fields).length ? fields : undefined,
    req_refs: reqRefs,
    decision: typeof decision === "string" ? decision : Array.isArray(decision) ? decision.join("\n") : undefined,
    rationale: typeof rationale === "string" ? rationale : Array.isArray(rationale) ? rationale.join("\n") : undefined,
    alternatives_considered: typeof alternatives === "string" ? alternatives : Array.isArray(alternatives) ? alternatives.join("\n") : undefined,
    implementation_approach: typeof approach === "string" ? approach : Array.isArray(approach) ? approach.join("\n") : undefined,
    token_coverage: typeof tokenCoverage === "string" ? tokenCoverage : undefined,
    status: typeof status === "string" ? status : Array.isArray(status) ? status[0] : undefined,
  };
}

/** Build minimal ParsedImplementationDecision when monolithic parser returns none. [IMPL] v2.2.0: fields passed through so generator can fill rationale.problems_solved/benefits, implementation_approach.details, essence_pseudocode, composed_with. */
function buildMinimalImplementation(
  token: string,
  title: string,
  body: string
): ParsedImplementationDecision {
  const fields = parseHeadingAndLabelSections(body);
  const decision = fields.decision;
  const rationale = fields.rationale;
  const approach = fields.implementation_approach;
  const implementationDetails = fields.implementation_details;
  const status = fields.status;
  const codeMarkers = fields.code_markers;
  const validationEvidence = fields.validation_evidence;
  const archRefs: string[] = [];
  const reqRefs: string[] = [];
  const archMatch = body.match(/\[ARCH-[A-Z0-9_]+\]/g);
  if (archMatch) archRefs.push(...[...new Set(archMatch)].map((s) => s.replace(/^\[|\]$/g, "")));
  const reqMatch = body.match(/\[REQ-[A-Z0-9_]+\]/g);
  if (reqMatch) reqRefs.push(...[...new Set(reqMatch)].map((s) => s.replace(/^\[|\]$/g, "")));
  return {
    token,
    title: title || token,
    body,
    fields: Object.keys(fields).length ? fields : undefined,
    arch_refs: archRefs,
    req_refs: reqRefs,
    decision: typeof decision === "string" ? decision : Array.isArray(decision) ? decision.join("\n") : undefined,
    rationale: typeof rationale === "string" ? rationale : Array.isArray(rationale) ? rationale.join("\n") : undefined,
    implementation_approach: typeof approach === "string" ? approach : Array.isArray(approach) ? approach.join("\n") : undefined,
    implementation_details: typeof implementationDetails === "string" ? implementationDetails : Array.isArray(implementationDetails) ? implementationDetails.join("\n") : undefined,
    code_markers: typeof codeMarkers === "string" ? codeMarkers : undefined,
    validation_evidence: typeof validationEvidence === "string" ? validationEvidence : Array.isArray(validationEvidence) ? validationEvidence.join("\n") : undefined,
    status: typeof status === "string" ? status : Array.isArray(status) ? status[0] : undefined,
  };
}

export interface ConvertDetailMarkdownOptions {
  /** Markdown content (or read from file_path). */
  content?: string;
  /** Path to .md file (cwd-relative or absolute). */
  file_path?: string;
  /** Requirement | architecture | implementation; inferred from token/path if omitted. */
  type?: DetailType;
  /** Token override (e.g. REQ-TIED_SETUP); inferred from content or path if omitted. */
  token?: string;
  /** Output directory for written .yaml; default getBasePath(). */
  output_base_path?: string;
  /** If true, return summary and paths without writing. */
  dry_run?: boolean;
  /** If false, skip writing when detail .yaml already exists. */
  overwrite?: boolean;
  /** If true, write the .yaml detail file (default true). */
  write_file?: boolean;
  /** If true, set index record detail_file to the new .yaml path (default true). Index is at getBasePath(). */
  sync_index?: boolean;
  /** If true and source was file_path to .md, remove the .md file after successful write (default false). */
  remove_md_after?: boolean;
}

export interface ConvertDetailMarkdownResult {
  ok: boolean;
  token?: string;
  record?: Record<string, unknown>;
  detail_path?: string;
  dry_run?: boolean;
  error?: string;
}

export function convertDetailMarkdownToYaml(
  options: ConvertDetailMarkdownOptions
): ConvertDetailMarkdownResult {
  let content = options.content;
  const filePath = options.file_path;
  if (content == null && filePath) {
    try {
      content = fs.readFileSync(
        path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath),
        "utf8"
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { ok: false, error: `Read failed: ${msg}` };
    }
  }
  if (content == null || content.trim() === "") {
    return { ok: false, error: "Provide content or file_path" };
  }

  let type = options.type;
  let token = options.token;

  const fromPath = filePath ? inferTokenFromFilePath(filePath) : null;
  const fromContent = inferTokenFromContent(content);

  if (token) {
    if (token.startsWith("REQ-")) type = type ?? "requirement";
    else if (token.startsWith("ARCH-")) type = type ?? "architecture";
    else if (token.startsWith("IMPL-")) type = type ?? "implementation";
    else return { ok: false, error: `Invalid token: ${token}. Must be REQ-*, ARCH-*, or IMPL-*` };
  } else if (fromContent) {
    token = fromContent.token;
    type = type ?? fromContent.type;
  } else if (fromPath) {
    token = fromPath.token;
    type = type ?? fromPath.type;
  } else {
    return { ok: false, error: "Could not infer token; provide token or use a file path like REQ-TOKEN.md or content starting with # [REQ-TOKEN] Title" };
  }

  type = type ?? (token.startsWith("REQ-") ? "requirement" : token.startsWith("ARCH-") ? "architecture" : "implementation");
  const normalized = normalizeContentForParser(content, type);

  let parsed:
    | ParsedRequirement
    | ParsedArchitectureDecision
    | ParsedImplementationDecision;

  if (type === "requirement") {
    const arr = parseMonolithicRequirements(normalized);
    if (arr.length > 0) {
      parsed = arr[0];
    } else {
      const m = content.match(REQ_TOKEN_RE);
      const title = m ? m[2].trim() : token;
      const body = m ? content.slice(content.indexOf("\n") + 1).trim() : content.trim();
      parsed = buildMinimalRequirement(token, title, body);
    }
  } else if (type === "architecture") {
    const singleArch = content.match(/^#\s+\[(ARCH-[A-Z0-9_]+)\]\s*(.*)$/m);
    if (singleArch) {
      const title = singleArch[2].trim();
      const body = content.slice(content.indexOf("\n") + 1).trim();
      parsed = buildMinimalArchitecture(token, title, body);
    } else {
      const arr = parseMonolithicArchitecture(normalized);
      if (arr.length > 0) parsed = arr[0];
      else {
        const m = content.match(ARCH_TOKEN_RE);
        const title = m ? m[2].trim() : token;
        const body = m ? content.slice(content.indexOf("\n") + 1).trim() : content.trim();
        parsed = buildMinimalArchitecture(token, title, body);
      }
    }
  } else {
    const singleImpl = content.match(/^#\s+\[(IMPL-[A-Z0-9_]+)\]\s*(.*)$/m);
    if (singleImpl) {
      const title = singleImpl[2].trim();
      const body = content.slice(content.indexOf("\n") + 1).trim();
      parsed = buildMinimalImplementation(token, title, body);
    } else {
      const arr = parseMonolithicImplementation(normalized);
      if (arr.length > 0) parsed = arr[0];
      else {
        const m = content.match(IMPL_TOKEN_RE);
        const title = m ? m[2].trim() : token;
        const body = m ? content.slice(content.indexOf("\n") + 1).trim() : content.trim();
        parsed = buildMinimalImplementation(token, title, body);
      }
    }
  }

  const subdir = SUBDIRS[type];
  const detailFile = `${subdir}/${token}.yaml`;
  const base = resolveOutputBase(options.output_base_path);
  const detailDir = path.join(base, subdir);
  const detailPath = path.join(detailDir, `${token}.yaml`);

  const record =
    type === "requirement"
      ? requirementToYamlRecord(parsed as ParsedRequirement, detailFile)
      : type === "architecture"
        ? architectureToYamlRecord(parsed as ParsedArchitectureDecision, detailFile)
        : implementationToYamlRecord(parsed as ParsedImplementationDecision, detailFile);

  const dryRun = options.dry_run === true;
  const writeFile = options.write_file !== false;
  const syncIndex = options.sync_index !== false;
  const overwrite = options.overwrite !== false;
  const removeMdAfter = options.remove_md_after === true;

  if (dryRun) {
    return {
      ok: true,
      token,
      record,
      detail_path: detailPath,
      dry_run: true,
    };
  }

  if (writeFile) {
    if (!overwrite && fs.existsSync(detailPath)) {
      return {
        ok: true,
        token,
        record,
        detail_path: detailPath,
        error: "Detail file already exists; skipped (use overwrite: true to replace)",
      };
    }
    try {
      if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });
      if (!fs.existsSync(detailDir)) fs.mkdirSync(detailDir, { recursive: true });
      fs.writeFileSync(
        detailPath,
        yaml.dump({ [token]: record }, { sortKeys: false, lineWidth: -1 }),
        "utf8"
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { ok: false, token, error: `Write failed: ${msg}` };
    }
  }

  if (syncIndex) {
    const indexName = INDEX_NAMES[type];
    const res = updateRecord(indexName, token, { detail_file: detailFile });
    if (!res.ok) {
      return {
        ok: true,
        token,
        record,
        detail_path: detailPath,
        error: `File written but index update failed: ${(res as { error?: string }).error ?? "unknown"}`,
      };
    }
  }

  if (removeMdAfter && filePath && filePath.endsWith(".md")) {
    const mdPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
    try {
      if (fs.existsSync(mdPath)) fs.unlinkSync(mdPath);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        ok: true,
        token,
        record,
        detail_path: detailPath,
        error: `Conversion succeeded but could not remove .md: ${msg}`,
      };
    }
  }

  return { ok: true, token, record, detail_path: detailPath };
}
