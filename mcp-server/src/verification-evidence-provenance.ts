/**
 * [IMPL-TIED_VERIFICATION_EVIDENCE_PROVENANCE] [ARCH-TIED_VERIFICATION_EVIDENCE_PROVENANCE] [REQ-TIED_VERIFICATION_EVIDENCE_PROVENANCE]
 * Trusted verification manifest binding for tied_verify (REQ-CTRL-005 / REQ-CTRL-011).
 */

import fs from "node:fs";
import path from "node:path";
import { loadProjectConfig } from "./tied-project-config.js";
import type { VerificationEvidenceManifest } from "./quality-evidence.js";

export type VerifyManifestProvenanceInput = {
  tiedBasePath: string;
  verificationManifestPath?: string;
  passedRequirementTokens: readonly string[];
  passedImplTokens: readonly string[];
  /** When set, manifest.commit must match (CASE-005 evidence freshness). */
  currentCommit?: string;
};

export type VerifyManifestProvenanceResult =
  | { ok: true; manifest?: VerificationEvidenceManifest }
  | { ok: false; error: string; diagnostics: string[] };

function projectRootFromTiedBase(tiedBasePath: string): string {
  return path.dirname(path.resolve(tiedBasePath));
}

export function isVerifyManifestProvenanceEnforced(tiedBasePath: string): boolean {
  const loaded = loadProjectConfig(projectRootFromTiedBase(tiedBasePath));
  if (!loaded) return true;
  const verification = loaded.record.verification;
  if (verification !== null && typeof verification === "object" && !Array.isArray(verification)) {
    const flag = (verification as Record<string, unknown>).require_manifest_provenance;
    if (flag === false) return false;
  }
  return true;
}

function normalizeTokenList(tokens: readonly string[]): string[] {
  return [...new Set(tokens.map((t) => t.trim()).filter((t) => t.length > 0))].sort((a, b) =>
    a.localeCompare(b),
  );
}

function isManifestShape(raw: unknown): raw is VerificationEvidenceManifest {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return false;
  const doc = raw as Record<string, unknown>;
  return doc.schema_version === "verification-evidence-manifest.v1";
}

export function validateVerifyManifestProvenance(
  input: VerifyManifestProvenanceInput,
): VerifyManifestProvenanceResult {
  const reqTokens = normalizeTokenList(input.passedRequirementTokens.filter((t) => t.startsWith("REQ-")));
  const implTokens = normalizeTokenList(input.passedImplTokens.filter((t) => t.startsWith("IMPL-")));
  const promoting = reqTokens.length + implTokens.length > 0;

  if (!isVerifyManifestProvenanceEnforced(input.tiedBasePath)) {
    return { ok: true };
  }
  if (!promoting) {
    return { ok: true };
  }

  const manifestPathRaw = input.verificationManifestPath?.trim();
  if (!manifestPathRaw) {
    return {
      ok: false,
      error: "VERIFY_MANIFEST_BLOCKED: missing verification_manifest_path",
      diagnostics: ["missing_verification_manifest"],
    };
  }

  const manifestPath = path.isAbsolute(manifestPathRaw)
    ? manifestPathRaw
    : path.join(projectRootFromTiedBase(input.tiedBasePath), manifestPathRaw);

  if (!fs.existsSync(manifestPath)) {
    return {
      ok: false,
      error: "VERIFY_MANIFEST_BLOCKED: verification manifest not found",
      diagnostics: ["verification_manifest_not_found"],
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    return {
      ok: false,
      error: "VERIFY_MANIFEST_BLOCKED: invalid verification manifest JSON",
      diagnostics: ["verification_manifest_invalid_json"],
    };
  }

  if (!isManifestShape(parsed)) {
    return {
      ok: false,
      error: "VERIFY_MANIFEST_BLOCKED: unsupported verification manifest schema",
      diagnostics: ["verification_manifest_invalid_schema"],
    };
  }

  const manifest = parsed;
  const covered = new Set(normalizeTokenList(manifest.covered_tokens ?? []));

  const diagnostics: string[] = [];
  for (const token of [...reqTokens, ...implTokens]) {
    if (!covered.has(token)) {
      diagnostics.push(`untrusted_pass_token:${token}`);
    }
  }
  if (diagnostics.length > 0) {
    return {
      ok: false,
      error: "VERIFY_MANIFEST_BLOCKED: passed tokens not covered by trusted manifest (CASE-002)",
      diagnostics,
    };
  }

  for (const row of manifest.command_results ?? []) {
    if (row.result === "failed") {
      return {
        ok: false,
        error: "VERIFY_MANIFEST_BLOCKED: manifest records failed command results",
        diagnostics: [`failed_command_result:${row.id}`],
      };
    }
  }

  const currentCommit = input.currentCommit?.trim();
  if (currentCommit && manifest.commit.trim() !== currentCommit) {
    return {
      ok: false,
      error: "VERIFY_MANIFEST_BLOCKED: verification manifest commit mismatch (CASE-005)",
      diagnostics: ["evidence_stale"],
    };
  }

  return { ok: true, manifest };
}
