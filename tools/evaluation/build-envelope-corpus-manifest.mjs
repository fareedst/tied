#!/usr/bin/env node
/**
 * [REQ-REQUEST_EVIDENCE_ENVELOPE] G5 — scan tied-project/working for envelope files
 * and emit envelope-corpus-manifest.v1.yaml for request_evidence_envelope_batch_collect.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import yaml from "js-yaml";

const ENVELOPE_CORPUS_MANIFEST_SCHEMA = "envelope-corpus-manifest.v1";
const ENVELOPE_REL = "evidence/request-evidence-envelope.v1.json";

function resolveRepoRoot() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, "../..");
}

function readRequestToken(envelopeAbs, folderName) {
  try {
    const doc = JSON.parse(readFileSync(envelopeAbs, "utf8"));
    const fromIdentity = doc?.identity?.request_token;
    if (typeof fromIdentity === "string" && fromIdentity.trim()) return fromIdentity.trim();
  } catch {
    /* fall through */
  }
  return folderName;
}

function main() {
  const repoRoot = resolveRepoRoot();
  const workingRoot = path.join(repoRoot, "tied-project/working");
  const tiedBasePath = path.join(repoRoot, "tied-project");
  const outDir = path.join(workingRoot, "evaluation");
  const manifestPath = path.join(outDir, "envelope-corpus-manifest.v1.yaml");

  const rows = [];
  const skipped = [];

  for (const entry of readdirSync(workingRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "evaluation") continue;
    const envelopeAbs = path.join(workingRoot, entry.name, ENVELOPE_REL);
    if (!existsSync(envelopeAbs)) {
      skipped.push({ folder: entry.name, reason: "no_envelope_file" });
      continue;
    }
    const requestToken = readRequestToken(envelopeAbs, entry.name);
    const envelopeArtifact = path
      .relative(repoRoot, envelopeAbs)
      .split(path.sep)
      .join("/");
    rows.push({
      project_root: repoRoot,
      request_token: requestToken,
      client_alias: "stdd-store",
      envelope_require_mode: "require_envelope",
      envelope_artifact: envelopeArtifact,
      tied_base_path: tiedBasePath,
    });
  }

  rows.sort((a, b) => a.request_token.localeCompare(b.request_token));

  const manifest = {
    schema_version: ENVELOPE_CORPUS_MANIFEST_SCHEMA,
    privacy_tier: "shareable_hashed",
    include_absolute_paths: false,
    generated_at: new Date().toISOString(),
    generator: "tools/evaluation/build-envelope-corpus-manifest.mjs",
    notes:
      "Full store working-folder envelope inventory (G5). Refresh before batch collect; paths are operator-local project_root.",
    rows,
  };

  mkdirSync(outDir, { recursive: true });
  writeFileSync(manifestPath, yaml.dump(manifest, { lineWidth: 120 }), "utf8");

  const summary = {
    schema: "envelope-corpus-manifest-build-summary.v1",
    generated_at: manifest.generated_at,
    manifest_path: path.relative(repoRoot, manifestPath).split(path.sep).join("/"),
    row_count: rows.length,
    skipped_folder_count: skipped.length,
    manifest_sha256: createHash("sha256").update(readFileSync(manifestPath)).digest("hex"),
  };
  const summaryPath = path.join(outDir, "envelope-corpus-manifest-build-summary.v1.json");
  writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  process.stdout.write(
    `DEBUG: envelope corpus manifest rows=${rows.length} skipped=${skipped.length} -> ${manifestPath}\n`,
  );
}

main();
