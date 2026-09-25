/**
 * [IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY] [ARCH-TIED_METHODOLOGY_CLIENT_BOUNDARY] [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY]
 * PACK_METHODOLOGY_BUNDLE_FOR_RELEASE — copy pinned methodology corpus + version manifest for @tied/mcp release.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const METHODOLOGY_BUNDLE_MANIFEST_SCHEMA = "methodology-bundle-manifest.v1" as const;

export type MethodologyBundleManifestV1 = {
  schema: typeof METHODOLOGY_BUNDLE_MANIFEST_SCHEMA;
  tied_mcp_version: string;
  generated_at: string;
  /** Relative path from repo root to source methodology dir (e.g. tied/methodology). */
  source_root: string;
  corpus_sha256: string;
  file_count: number;
  files: Array<{ relative_path: string; sha256: string; bytes: number }>;
  methodology_version?: string;
};

export type PackMethodologyBundleOptions = {
  /** Absolute path to tied/methodology/ (corpus source). */
  sourceMethodologyDir: string;
  /** Absolute output directory; receives flat tied/methodology/ contents (bundle runtime root). */
  corpusOutDir: string;
  /** Absolute path for methodology-bundle-manifest.v1.json (typically beside corpus parent). */
  manifestOutPath: string;
  /** @tied/mcp version from package.json. */
  tiedMcpVersion: string;
  /** Repo-relative label for source_root in manifest. */
  sourceRootRelative?: string;
  methodologyVersion?: string;
};

function sha256Buffer(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function listFilesRecursive(root: string, base = root): string[] {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  const files: string[] = [];
  for (const ent of entries) {
    const abs = path.join(root, ent.name);
    if (ent.isDirectory()) {
      files.push(...listFilesRecursive(abs, base));
    } else if (ent.isFile()) {
      files.push(abs);
    }
  }
  return files.sort();
}

/**
 * Validate manifest shape and optional hash consistency with corpus on disk.
 */
export function validateMethodologyBundleManifest(
  manifest: unknown,
  corpusDir?: string,
): { ok: true; manifest: MethodologyBundleManifestV1 } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  if (!manifest || typeof manifest !== "object") {
    return { ok: false, errors: ["manifest must be an object"] };
  }
  const m = manifest as Record<string, unknown>;
  if (m.schema !== METHODOLOGY_BUNDLE_MANIFEST_SCHEMA) {
    errors.push(`schema must be ${METHODOLOGY_BUNDLE_MANIFEST_SCHEMA}`);
  }
  if (typeof m.tied_mcp_version !== "string" || !m.tied_mcp_version.trim()) {
    errors.push("tied_mcp_version required");
  }
  if (typeof m.generated_at !== "string" || !m.generated_at.trim()) {
    errors.push("generated_at required");
  }
  if (typeof m.source_root !== "string" || !m.source_root.trim()) {
    errors.push("source_root required");
  }
  if (typeof m.corpus_sha256 !== "string" || !/^[a-f0-9]{64}$/.test(m.corpus_sha256)) {
    errors.push("corpus_sha256 must be 64-char hex");
  }
  if (typeof m.file_count !== "number" || m.file_count < 0) {
    errors.push("file_count must be a non-negative number");
  }
  if (!Array.isArray(m.files)) {
    errors.push("files must be an array");
  } else {
    for (const [i, f] of m.files.entries()) {
      if (!f || typeof f !== "object") {
        errors.push(`files[${i}] invalid`);
        continue;
      }
      const row = f as Record<string, unknown>;
      if (typeof row.relative_path !== "string") errors.push(`files[${i}].relative_path invalid`);
      if (typeof row.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(row.sha256 as string)) {
        errors.push(`files[${i}].sha256 invalid`);
      }
      if (typeof row.bytes !== "number") errors.push(`files[${i}].bytes invalid`);
    }
    if (typeof m.file_count === "number" && m.files.length !== m.file_count) {
      errors.push("file_count does not match files.length");
    }
  }
  if (errors.length > 0) {
    return { ok: false, errors };
  }
  const typed = m as unknown as MethodologyBundleManifestV1;

  if (corpusDir && fs.existsSync(corpusDir)) {
    const diskFiles = listFilesRecursive(corpusDir);
    if (diskFiles.length !== typed.files.length) {
      errors.push(`corpus file count mismatch: disk=${diskFiles.length} manifest=${typed.files.length}`);
    }
    const manifestPaths = new Set(typed.files.map((f) => f.relative_path));
    for (const abs of diskFiles) {
      const rel = path.relative(corpusDir, abs).split(path.sep).join("/");
      if (!manifestPaths.has(rel)) {
        errors.push(`manifest missing file: ${rel}`);
      }
    }
    const hashParts = typed.files
      .slice()
      .sort((a, b) => a.relative_path.localeCompare(b.relative_path))
      .map((f) => f.sha256);
    const recomputedCorpus = sha256Buffer(Buffer.from(hashParts.join("\n"), "utf8"));
    if (recomputedCorpus !== typed.corpus_sha256) {
      errors.push("corpus_sha256 does not match per-file hashes");
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, manifest: typed };
}

/**
 * Copy source methodology tree to corpusOutDir and write version manifest.
 */
export function packMethodologyBundle(options: PackMethodologyBundleOptions): MethodologyBundleManifestV1 {
  const {
    sourceMethodologyDir,
    corpusOutDir,
    manifestOutPath,
    tiedMcpVersion,
    sourceRootRelative = "tied/methodology",
    methodologyVersion,
  } = options;

  if (!fs.existsSync(sourceMethodologyDir) || !fs.statSync(sourceMethodologyDir).isDirectory()) {
    throw new Error(`SourceMissing: ${sourceMethodologyDir}`);
  }

  fs.rmSync(corpusOutDir, { recursive: true, force: true });
  fs.mkdirSync(corpusOutDir, { recursive: true });
  fs.cpSync(sourceMethodologyDir, corpusOutDir, { recursive: true });

  const absFiles = listFilesRecursive(corpusOutDir);
  const files: MethodologyBundleManifestV1["files"] = absFiles.map((abs) => {
    const buf = fs.readFileSync(abs);
    const relative_path = path.relative(corpusOutDir, abs).split(path.sep).join("/");
    return {
      relative_path,
      sha256: sha256Buffer(buf),
      bytes: buf.length,
    };
  });
  files.sort((a, b) => a.relative_path.localeCompare(b.relative_path));

  const corpus_sha256 = sha256Buffer(
    Buffer.from(
      files.map((f) => f.sha256).join("\n"),
      "utf8",
    ),
  );

  const manifest: MethodologyBundleManifestV1 = {
    schema: METHODOLOGY_BUNDLE_MANIFEST_SCHEMA,
    tied_mcp_version: tiedMcpVersion,
    generated_at: new Date().toISOString(),
    source_root: sourceRootRelative,
    corpus_sha256,
    file_count: files.length,
    files,
    ...(methodologyVersion ? { methodology_version: methodologyVersion } : {}),
  };

  fs.mkdirSync(path.dirname(manifestOutPath), { recursive: true });
  fs.writeFileSync(manifestOutPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  const validated = validateMethodologyBundleManifest(manifest, corpusOutDir);
  if (!validated.ok) {
    throw new Error(`ManifestInvalid: ${validated.errors.join("; ")}`);
  }

  return manifest;
}

/**
 * Resolve repo tied/methodology from mcp-server package root (parent of mcp-server/).
 */
export function defaultSourceMethodologyDir(mcpServerRoot: string): string {
  const repoRoot = path.resolve(mcpServerRoot, "..");
  return path.join(repoRoot, "tied", "methodology");
}

export function defaultBundleLayout(mcpServerRoot: string): {
  bundleRoot: string;
  corpusOutDir: string;
  manifestOutPath: string;
} {
  const bundleRoot = path.join(mcpServerRoot, "methodology-bundle");
  return {
    bundleRoot,
    corpusOutDir: path.join(bundleRoot, "corpus"),
    manifestOutPath: path.join(bundleRoot, "methodology-bundle-manifest.v1.json"),
  };
}

export function readTiedMcpVersion(mcpServerRoot: string): string {
  const pkgPath = path.join(mcpServerRoot, "package.json");
  const raw = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as { version?: string };
  if (!raw.version?.trim()) {
    throw new Error(`PackageVersionMissing: ${pkgPath}`);
  }
  return raw.version.trim();
}
