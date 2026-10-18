/**
 * [IMPL-TIED_EASAR_RECEIPTS] [ARCH-TIED_EASAR_ARTIFACT_MODEL] [REQ-TIED_EASAR_RECOVERY]
 * Stage 9 portable export map + manifest (read-only; export_only discipline).
 */

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import yaml from "js-yaml";

import type { ReflexionReportV1 } from "./reflexion-report-v1.js";

export const RECOVERY_PORTABLE_MAP_V1_SCHEMA = "recovery-portable-map.v1";
export const RECOVERY_EXPORT_MANIFEST_V1_SCHEMA = "recovery-export-manifest.v1";
export const VERIFICATION_REPORT_EXPORT_SCHEMA = "verification-report.v1";

export const RECOVERY_TRANSFORM_IDS = [
  "copy_json",
  "copy_yaml",
  "markdown_excerpt",
  "reflexion_to_verification_report",
  "from_manifest_receipt",
] as const;

export type RecoveryTransformId = (typeof RECOVERY_TRANSFORM_IDS)[number];

export type PortableMapSlot = {
  portable_path: string;
  canonical_source: string;
  transform: RecoveryTransformId;
  required?: boolean;
};

export type RecoveryPortableMapV1 = {
  schema_version: typeof RECOVERY_PORTABLE_MAP_V1_SCHEMA;
  request_token: string;
  slots: PortableMapSlot[];
  documented_gaps: string[];
};

export type RecoveryExportManifestEntry = {
  portable_path: string;
  canonical_source: string;
  transform: RecoveryTransformId;
  content_hash: string;
  source_kind: "committed" | "regenerable";
  written_relative_path?: string;
};

export type RecoveryExportManifestV1 = {
  schema_version: typeof RECOVERY_EXPORT_MANIFEST_V1_SCHEMA;
  request_token: string;
  map_path: string;
  git_rev?: string;
  export_only: true;
  entries: RecoveryExportManifestEntry[];
  gaps: string[];
  errors: string[];
  content_hash: string;
};

export type VerificationReportExportV1 = {
  schema_version: typeof VERIFICATION_REPORT_EXPORT_SCHEMA;
  source_reflexion_schema: "reflexion-report.v1";
  request_token: string;
  inquiry_run_id: string;
  gate_allowed: boolean;
  obligation_report_ref: string;
  adversarial_ledger_ref?: string;
  divergences_count: number;
  export_only: true;
};

function stableHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex");
}

function fileContentHash(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// [IMPL-TIED_EASAR_RECEIPTS] [REQ-TIED_EASAR_RECOVERY] — BUILD_RECOVERY_EXPORT_MANIFEST_V1: load map YAML.
export function parseRecoveryPortableMapV1(
  raw: unknown,
): { ok: true; map: RecoveryPortableMapV1 } | { ok: false; error: string } {
  if (!isRecord(raw)) {
    return { ok: false, error: "map_not_object" };
  }
  if (raw.schema_version !== RECOVERY_PORTABLE_MAP_V1_SCHEMA) {
    return { ok: false, error: "schema_mismatch" };
  }
  if (typeof raw.request_token !== "string" || !raw.request_token.trim()) {
    return { ok: false, error: "missing_request_token" };
  }
  if (!Array.isArray(raw.slots)) {
    return { ok: false, error: "missing_slots" };
  }
  const slots: PortableMapSlot[] = [];
  for (const item of raw.slots) {
    if (!isRecord(item)) {
      return { ok: false, error: "invalid_slot" };
    }
    const transform = item.transform;
    if (typeof item.portable_path !== "string" || typeof item.canonical_source !== "string") {
      return { ok: false, error: "invalid_slot_paths" };
    }
    if (!RECOVERY_TRANSFORM_IDS.includes(transform as RecoveryTransformId)) {
      return { ok: false, error: `invalid_transform:${String(transform)}` };
    }
    slots.push({
      portable_path: item.portable_path,
      canonical_source: item.canonical_source,
      transform: transform as RecoveryTransformId,
      required: item.required === true,
    });
  }
  const documented_gaps = Array.isArray(raw.documented_gaps)
    ? raw.documented_gaps.filter((g): g is string => typeof g === "string")
    : [];
  return {
    ok: true,
    map: {
      schema_version: RECOVERY_PORTABLE_MAP_V1_SCHEMA,
      request_token: raw.request_token,
      slots,
      documented_gaps,
    },
  };
}

export function loadRecoveryPortableMapFromFile(
  absolutePath: string,
): { ok: true; map: RecoveryPortableMapV1 } | { ok: false; error: string } {
  if (!fs.existsSync(absolutePath)) {
    return { ok: false, error: "map_file_missing" };
  }
  const text = fs.readFileSync(absolutePath, "utf8");
  const parsed = yaml.load(text);
  return parseRecoveryPortableMapV1(parsed);
}

// [IMPL-TIED_EASAR_RECEIPTS] [ARCH-TIED_EASAR_ARTIFACT_MODEL] — reflexion → verification-report adapter (no ledger body).
export function reflexionToVerificationReportExport(
  reflexion: ReflexionReportV1,
): VerificationReportExportV1 {
  return {
    schema_version: VERIFICATION_REPORT_EXPORT_SCHEMA,
    source_reflexion_schema: "reflexion-report.v1",
    request_token: reflexion.request_token,
    inquiry_run_id: reflexion.inquiry_run_id,
    gate_allowed: reflexion.gate_allowed,
    obligation_report_ref: reflexion.obligation_report_ref,
    adversarial_ledger_ref: reflexion.adversarial_ledger_ref,
    divergences_count: reflexion.divergences.length,
    export_only: true,
  };
}

export function markdownExcerptFromPlan(
  planText: string,
  maxLines = 80,
): string {
  const lines = planText.split(/\r?\n/);
  const excerpt = lines.slice(0, maxLines).join("\n");
  const suffix = lines.length > maxLines ? "\n\n<!-- excerpt truncated -->\n" : "\n";
  return `${excerpt}${suffix}`;
}

export type TransformContext = {
  projectRoot: string;
  workingRoot: string;
  manifestDraft?: Omit<RecoveryExportManifestV1, "content_hash">;
};

export function resolveCanonicalAbsolute(
  ctx: TransformContext,
  canonicalSource: string,
): string {
  const normalized = canonicalSource.replace(/\\/g, "/");
  if (path.isAbsolute(normalized)) {
    return normalized;
  }
  if (normalized.startsWith("tied-project/") || normalized.startsWith("tied-bundle/")) {
    return path.join(ctx.projectRoot, normalized);
  }
  return path.join(ctx.workingRoot, normalized);
}

export function applyRecoveryTransform(
  ctx: TransformContext,
  slot: PortableMapSlot,
): { ok: true; content: string; source_kind: "committed" | "regenerable" } | { ok: false; error: string } {
  const absolute = resolveCanonicalAbsolute(ctx, slot.canonical_source);
  if (slot.transform === "from_manifest_receipt") {
    if (!ctx.manifestDraft) {
      return { ok: false, error: "manifest_draft_missing" };
    }
    const yamlBody = yaml.dump({
      schema_version: "recovery-manifest.v1",
      request_token: ctx.manifestDraft.request_token,
      map_path: ctx.manifestDraft.map_path,
      export_only: true,
      entry_count: ctx.manifestDraft.entries.length,
      gaps: ctx.manifestDraft.gaps,
    });
    return { ok: true, content: yamlBody, source_kind: "committed" };
  }

  if (!fs.existsSync(absolute)) {
    return { ok: false, error: `source_missing:${slot.canonical_source}` };
  }

  const source_kind: "committed" | "regenerable" = slot.canonical_source.includes("source-graph-index")
    ? "regenerable"
    : "committed";

  switch (slot.transform) {
    case "copy_json": {
      const raw = fs.readFileSync(absolute, "utf8");
      const parsed = JSON.parse(raw) as unknown;
      return { ok: true, content: `${JSON.stringify(parsed, null, 2)}\n`, source_kind };
    }
    case "copy_yaml": {
      const raw = fs.readFileSync(absolute, "utf8");
      return { ok: true, content: raw.endsWith("\n") ? raw : `${raw}\n`, source_kind };
    }
    case "markdown_excerpt": {
      const raw = fs.readFileSync(absolute, "utf8");
      return { ok: true, content: markdownExcerptFromPlan(raw), source_kind: "committed" };
    }
    case "reflexion_to_verification_report": {
      const raw = fs.readFileSync(absolute, "utf8");
      const reflexion = JSON.parse(raw) as ReflexionReportV1;
      const report = reflexionToVerificationReportExport(reflexion);
      return { ok: true, content: `${JSON.stringify(report, null, 2)}\n`, source_kind: "committed" };
    }
    default:
      return { ok: false, error: `unsupported_transform:${slot.transform}` };
  }
}

export type BuildRecoveryExportManifestInput = {
  map: RecoveryPortableMapV1;
  map_path: string;
  project_root: string;
  working_root: string;
  git_rev?: string;
  output_dir?: string;
};

export type BuildRecoveryExportManifestResult =
  | { ok: true; manifest: RecoveryExportManifestV1; written_files: string[] }
  | { ok: false; error: string };

// [IMPL-TIED_EASAR_RECEIPTS] [REQ-TIED_EASAR_RECOVERY] — RUN_EASAR_RECOVERY_EXPORT_V1
export function buildRecoveryExportManifestV1(
  input: BuildRecoveryExportManifestInput,
): BuildRecoveryExportManifestResult {
  const projectRoot = path.resolve(input.project_root);
  const workingRoot = path.isAbsolute(input.working_root)
    ? input.working_root
    : path.join(projectRoot, input.working_root);

  const ctxBase: TransformContext = {
    projectRoot,
    workingRoot,
  };

  const entries: RecoveryExportManifestEntry[] = [];
  const errors: string[] = [];
  const written_files: string[] = [];
  const outputDir = input.output_dir?.trim()
    ? path.isAbsolute(input.output_dir)
      ? input.output_dir
      : path.join(projectRoot, input.output_dir)
    : undefined;

  const deferredManifestSlots = input.map.slots.filter((s) => s.transform === "from_manifest_receipt");
  const primarySlots = input.map.slots.filter((s) => s.transform !== "from_manifest_receipt");

  const manifestDraft: Omit<RecoveryExportManifestV1, "content_hash"> = {
    schema_version: RECOVERY_EXPORT_MANIFEST_V1_SCHEMA,
    request_token: input.map.request_token,
    map_path: input.map_path.replace(/\\/g, "/"),
    git_rev: input.git_rev,
    export_only: true,
    entries: [],
    gaps: [...input.map.documented_gaps],
    errors: [],
  };

  for (const slot of primarySlots) {
    const transformed = applyRecoveryTransform(ctxBase, slot);
    if (!transformed.ok) {
      if (slot.required !== false) {
        errors.push(`${slot.portable_path}:${transformed.error}`);
      }
      continue;
    }
    const content_hash = fileContentHash(transformed.content);
    let written_relative_path: string | undefined;
    if (outputDir) {
      const dest = path.join(outputDir, slot.portable_path);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, transformed.content, "utf8");
      written_relative_path = path.relative(outputDir, dest).split(path.sep).join("/");
      written_files.push(written_relative_path);
    }
    const entry: RecoveryExportManifestEntry = {
      portable_path: slot.portable_path,
      canonical_source: slot.canonical_source,
      transform: slot.transform,
      content_hash,
      source_kind: transformed.source_kind,
      written_relative_path,
    };
    entries.push(entry);
    manifestDraft.entries.push(entry);
  }

  for (const slot of deferredManifestSlots) {
    const ctx: TransformContext = { ...ctxBase, manifestDraft };
    const transformed = applyRecoveryTransform(ctx, slot);
    if (!transformed.ok) {
      errors.push(`${slot.portable_path}:${transformed.error}`);
      continue;
    }
    const content_hash = fileContentHash(transformed.content);
    let written_relative_path: string | undefined;
    if (outputDir) {
      const dest = path.join(outputDir, slot.portable_path);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, transformed.content, "utf8");
      written_relative_path = path.relative(outputDir, dest).split(path.sep).join("/");
      written_files.push(written_relative_path);
    }
    const entry: RecoveryExportManifestEntry = {
      portable_path: slot.portable_path,
      canonical_source: slot.canonical_source,
      transform: slot.transform,
      content_hash,
      source_kind: "committed",
      written_relative_path,
    };
    entries.push(entry);
    manifestDraft.entries.push(entry);
  }

  const body: Omit<RecoveryExportManifestV1, "content_hash"> = {
    ...manifestDraft,
    entries,
    errors,
  };
  const manifest: RecoveryExportManifestV1 = {
    ...body,
    content_hash: stableHash({
      schema_version: body.schema_version,
      request_token: body.request_token,
      map_path: body.map_path,
      entries: body.entries,
      gaps: body.gaps,
    }),
  };

  return { ok: true, manifest, written_files };
}
