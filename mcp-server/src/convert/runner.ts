/**
 * Conversion runner: parse monolithic markdown and write YAML indexes + detail files.
 * Used by MCP tools with configurable output path, dry_run, and overwrite.
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import {
  parseMonolithicRequirements,
  parseMonolithicArchitecture,
  parseMonolithicImplementation,
} from "./parser.js";
import {
  requirementToYamlRecord,
  architectureToYamlRecord,
  implementationToYamlRecord,
} from "./yaml-generator.js";
import {
  requirementDetailMarkdown,
  architectureDetailMarkdown,
  implementationDetailMarkdown,
} from "./detail-generator.js";
import { getBasePath } from "../yaml-loader.js";

/** Token format for monolithic input: hyphen [REQ-*], colon [REQ:*], or both (normalize colon to hyphen). */
export type TokenFormat = "hyphen" | "colon" | "both";

/**
 * Normalize colon-style tokens to hyphen in markdown content so the parser (hyphen-only) can read STDD-style input.
 * Replaces [REQ: → [REQ-, [ARCH: → [ARCH-, [IMPL: → [IMPL-.
 */
export function normalizeTokenFormat(content: string): string {
  return content
    .replace(/\[REQ:/g, "[REQ-")
    .replace(/\[ARCH:/g, "[ARCH-")
    .replace(/\[IMPL:/g, "[IMPL-");
}

function applyTokenFormat(content: string, token_format?: TokenFormat): string {
  const format = token_format ?? "both";
  if (format === "colon" || format === "both") {
    return normalizeTokenFormat(content);
  }
  return content;
}

export function resolveOutputBase(outputBasePath?: string): string {
  const base = outputBasePath ?? getBasePath();
  return path.isAbsolute(base) ? base : path.resolve(process.cwd(), base);
}

function dedupeByToken<T extends { token: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.token)) return false;
    seen.add(item.token);
    return true;
  });
}

export interface ConversionSummary {
  ok: boolean;
  tokens: string[];
  index_path?: string;
  detail_paths?: string[];
  error?: string;
  dry_run?: boolean;
}

const SOURCE_REQUIREMENTS = "requirements.md";
const SOURCE_ARCHITECTURE = "architecture-decisions.md";
const SOURCE_IMPLEMENTATION = "implementation-decisions.md";

export interface ConversionOptions {
  dry_run?: boolean;
  overwrite?: boolean;
  /** When "colon" or "both", normalize [REQ:*] etc. to [REQ-*] before parsing. */
  token_format?: TokenFormat;
}

export function convertMonolithicRequirements(
  mdContent: string,
  outputBasePath?: string,
  options: ConversionOptions = {}
): ConversionSummary {
  const base = resolveOutputBase(outputBasePath);
  const indexPath = path.join(base, "requirements.yaml");
  const detailDir = path.join(base, "requirements");

  const content = applyTokenFormat(mdContent, options.token_format);
  const parsed = parseMonolithicRequirements(content);
  const deduped = dedupeByToken(parsed);
  if (deduped.length === 0) {
    return { ok: false, tokens: [], error: "No [REQ-*] sections found in content" };
  }

  const tokens = deduped.map((p) => p.token);
  const indexRecord: Record<string, unknown> = {};
  const detailPaths: string[] = [];

  for (const p of deduped) {
    const detailFile = `requirements/${p.token}.md`;
    indexRecord[p.token] = requirementToYamlRecord(p, detailFile);
    detailPaths.push(path.join(detailDir, `${p.token}.md`));
  }

  if (options.dry_run) {
    return {
      ok: true,
      tokens,
      index_path: indexPath,
      detail_paths: detailPaths,
      dry_run: true,
    };
  }

  try {
    if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });
    if (!fs.existsSync(detailDir)) fs.mkdirSync(detailDir, { recursive: true });
    fs.writeFileSync(
      indexPath,
      yaml.dump(indexRecord, { sortKeys: false, lineWidth: -1 }),
      "utf8"
    );
    for (let i = 0; i < deduped.length; i++) {
      const p = deduped[i];
      const detailPath = detailPaths[i];
      if (options.overwrite === false && fs.existsSync(detailPath)) continue;
      const md = requirementDetailMarkdown(p, SOURCE_REQUIREMENTS);
      fs.writeFileSync(detailPath, md, "utf8");
    }
    return { ok: true, tokens, index_path: indexPath, detail_paths: detailPaths };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, tokens, error: message };
  }
}

export function convertMonolithicArchitecture(
  mdContent: string,
  outputBasePath?: string,
  options: ConversionOptions = {}
): ConversionSummary {
  const base = resolveOutputBase(outputBasePath);
  const indexPath = path.join(base, "architecture-decisions.yaml");
  const detailDir = path.join(base, "architecture-decisions");

  const content = applyTokenFormat(mdContent, options.token_format);
  const parsed = parseMonolithicArchitecture(content);
  const deduped = dedupeByToken(parsed);
  if (deduped.length === 0) {
    return { ok: false, tokens: [], error: "No [ARCH-*] sections found in content" };
  }

  const tokens = deduped.map((p) => p.token);
  const indexRecord: Record<string, unknown> = {};
  const detailPaths: string[] = [];

  for (const p of deduped) {
    const detailFile = `architecture-decisions/${p.token}.md`;
    indexRecord[p.token] = architectureToYamlRecord(p, detailFile);
    detailPaths.push(path.join(detailDir, `${p.token}.md`));
  }

  if (options.dry_run) {
    return {
      ok: true,
      tokens,
      index_path: indexPath,
      detail_paths: detailPaths,
      dry_run: true,
    };
  }

  try {
    if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });
    if (!fs.existsSync(detailDir)) fs.mkdirSync(detailDir, { recursive: true });
    fs.writeFileSync(
      indexPath,
      yaml.dump(indexRecord, { sortKeys: false, lineWidth: -1 }),
      "utf8"
    );
    for (let i = 0; i < deduped.length; i++) {
      const p = deduped[i];
      const detailPath = detailPaths[i];
      if (options.overwrite === false && fs.existsSync(detailPath)) continue;
      const md = architectureDetailMarkdown(p, SOURCE_ARCHITECTURE);
      fs.writeFileSync(detailPath, md, "utf8");
    }
    return { ok: true, tokens, index_path: indexPath, detail_paths: detailPaths };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, tokens, error: message };
  }
}

export function convertMonolithicImplementation(
  mdContent: string,
  outputBasePath?: string,
  options: ConversionOptions = {}
): ConversionSummary {
  const base = resolveOutputBase(outputBasePath);
  const indexPath = path.join(base, "implementation-decisions.yaml");
  const detailDir = path.join(base, "implementation-decisions");

  const content = applyTokenFormat(mdContent, options.token_format);
  const parsed = parseMonolithicImplementation(content);
  const deduped = dedupeByToken(parsed);
  if (deduped.length === 0) {
    return { ok: false, tokens: [], error: "No [IMPL-*] sections found in content" };
  }

  const tokens = deduped.map((p) => p.token);
  const indexRecord: Record<string, unknown> = {};
  const detailPaths: string[] = [];

  for (const p of deduped) {
    const detailFile = `implementation-decisions/${p.token}.md`;
    indexRecord[p.token] = implementationToYamlRecord(p, detailFile);
    detailPaths.push(path.join(detailDir, `${p.token}.md`));
  }

  if (options.dry_run) {
    return {
      ok: true,
      tokens,
      index_path: indexPath,
      detail_paths: detailPaths,
      dry_run: true,
    };
  }

  try {
    if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });
    if (!fs.existsSync(detailDir)) fs.mkdirSync(detailDir, { recursive: true });
    fs.writeFileSync(
      indexPath,
      yaml.dump(indexRecord, { sortKeys: false, lineWidth: -1 }),
      "utf8"
    );
    for (let i = 0; i < deduped.length; i++) {
      const p = deduped[i];
      const detailPath = detailPaths[i];
      if (options.overwrite === false && fs.existsSync(detailPath)) continue;
      const md = implementationDetailMarkdown(p, SOURCE_IMPLEMENTATION);
      fs.writeFileSync(detailPath, md, "utf8");
    }
    return { ok: true, tokens, index_path: indexPath, detail_paths: detailPaths };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, tokens, error: message };
  }
}

export interface ConvertAllOptions {
  requirements_path?: string;
  architecture_path?: string;
  implementation_path?: string;
  /** Raw markdown for requirements; when set, overrides requirements_path. */
  requirements_content?: string;
  /** Raw markdown for architecture; when set, overrides architecture_path. */
  architecture_content?: string;
  /** Raw markdown for implementation; when set, overrides implementation_path. */
  implementation_content?: string;
  output_base_path?: string;
  dry_run?: boolean;
  overwrite?: boolean;
  /** When "colon" or "both", normalize [REQ:*] etc. to [REQ-*] before parsing. */
  token_format?: TokenFormat;
}

export interface ConvertAllSummary {
  requirements?: ConversionSummary;
  architecture?: ConversionSummary;
  implementation?: ConversionSummary;
  errors: string[];
}

function getContent(
  pathContent: string | undefined,
  pathPath: string | undefined,
  read: (p: string) => string
): string {
  return pathContent ?? (pathPath ? read(pathPath) : "");
}

export function convertMonolithicAll(options: ConvertAllOptions): ConvertAllSummary {
  const result: ConvertAllSummary = { errors: [] };
  const base = options.output_base_path;
  const convOpts: ConversionOptions = {
    dry_run: options.dry_run,
    overwrite: options.overwrite,
    token_format: options.token_format,
  };

  const read = (p: string): string => {
    if (!p || !fs.existsSync(p)) return "";
    return fs.readFileSync(p, "utf8");
  };

  const reqContent = getContent(options.requirements_content, options.requirements_path, read);
  if (reqContent) {
    result.requirements = convertMonolithicRequirements(reqContent, base, convOpts);
    if (!result.requirements.ok) result.errors.push(result.requirements.error ?? "requirements failed");
  }

  const archContent = getContent(options.architecture_content, options.architecture_path, read);
  if (archContent) {
    result.architecture = convertMonolithicArchitecture(archContent, base, convOpts);
    if (!result.architecture.ok) result.errors.push(result.architecture.error ?? "architecture failed");
  }

  const implContent = getContent(options.implementation_content, options.implementation_path, read);
  if (implContent) {
    result.implementation = convertMonolithicImplementation(implContent, base, convOpts);
    if (!result.implementation.ok) result.errors.push(result.implementation.error ?? "implementation failed");
  }

  return result;
}
