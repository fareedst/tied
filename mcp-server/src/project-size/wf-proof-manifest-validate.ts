/**
 * [REQ-WF_TRIAL_PROOF_MANIFEST_LITE] [IMPL-WF_TRIAL_PROOF_MANIFEST_LITE]
 */

import { access, readFile } from "node:fs/promises";
import path from "node:path";

import { buildProjectSizeSnapshot } from "./snapshot-builder.js";
import {
  facetForProofSubtype,
  isProofSubtype,
  resolveProofSubtypeForFile,
  resolveProofSubtypeWithManifest,
} from "./proof-label-resolve.js";
import { PROOF_BOUNDARY } from "./types.js";
import {
  PROOF_FACET_MANIFEST_SCHEMA_VERSION,
  type ProofFacetManifestV1,
} from "./wf-proof-manifest-types.js";

export type LabelReconcileDiagnostic = {
  path: string;
  manifest_subtype: string;
  path_resolved_subtype: string;
  match: boolean;
};

export type WfProofManifestValidateResult = {
  ok: boolean;
  schema_version: typeof PROOF_FACET_MANIFEST_SCHEMA_VERSION | null;
  proof_boundary: string;
  errors: Array<{ code: string; message: string }>;
  label_reconcile_diagnostics: LabelReconcileDiagnostic[];
  advisory: boolean;
};

function normalizeManifestPath(p: string): string {
  return p.replace(/\\/g, "/").replace(/^\.\//, "");
}

export function validateProofFacetManifestShape(
  manifest: unknown,
): { ok: boolean; errors: Array<{ code: string; message: string }>; parsed?: ProofFacetManifestV1 } {
  const errors: Array<{ code: string; message: string }> = [];
  if (!manifest || typeof manifest !== "object") {
    errors.push({ code: "MANIFEST_NOT_OBJECT", message: "Manifest must be a JSON object" });
    return { ok: false, errors };
  }
  const m = manifest as Record<string, unknown>;
  if (m.schema_version !== PROOF_FACET_MANIFEST_SCHEMA_VERSION) {
    errors.push({
      code: "SCHEMA_VERSION",
      message: `schema_version must be ${PROOF_FACET_MANIFEST_SCHEMA_VERSION}`,
    });
  }
  if (typeof m.prompt_id !== "string" || !m.prompt_id.trim()) {
    errors.push({ code: "PROMPT_ID", message: "prompt_id is required" });
  }
  if (typeof m.proof_boundary !== "string" || !m.proof_boundary.trim()) {
    errors.push({ code: "PROOF_BOUNDARY", message: "proof_boundary is required" });
  }

  const files = m.files;
  if (files !== undefined) {
    if (!Array.isArray(files)) {
      errors.push({ code: "FILES_ARRAY", message: "files must be an array when present" });
    } else {
      for (const [i, row] of files.entries()) {
        if (!row || typeof row !== "object") {
          errors.push({ code: "FILE_ROW", message: `files[${i}] must be an object` });
          continue;
        }
        const r = row as Record<string, unknown>;
        if (typeof r.path !== "string") errors.push({ code: "FILE_PATH", message: `files[${i}].path required` });
        if (typeof r.proof_subtype !== "string" || !isProofSubtype(r.proof_subtype)) {
          errors.push({ code: "UNKNOWN_SUBTYPE", message: `files[${i}].proof_subtype invalid` });
        } else if (typeof r.proof_facet === "string") {
          const expected = facetForProofSubtype(r.proof_subtype as never);
          if (r.proof_facet !== expected) {
            errors.push({
              code: "FACET_SUBTYPE_MISMATCH",
              message: `files[${i}] proof_facet ${r.proof_facet} does not match subtype rollup`,
            });
          }
        }
      }
    }
  }

  const bindings = m.bindings;
  if (bindings !== undefined && !Array.isArray(bindings)) {
    errors.push({ code: "BINDINGS_ARRAY", message: "bindings must be an array when present" });
  }

  return {
    ok: errors.length === 0,
    errors,
    parsed: errors.length === 0 ? (m as ProofFacetManifestV1) : undefined,
  };
}

export async function validateWfProofManifest(args: {
  repo_root: string;
  manifest?: ProofFacetManifestV1;
  manifest_path?: string;
  reconcile_snapshot?: boolean;
  blocking?: boolean;
}): Promise<WfProofManifestValidateResult> {
  const advisory = args.blocking !== true;
  const repoRoot = path.resolve(args.repo_root);
  const errors: Array<{ code: string; message: string }> = [];
  let manifest: ProofFacetManifestV1 | undefined = args.manifest;

  if (!manifest && args.manifest_path) {
    const abs = path.isAbsolute(args.manifest_path)
      ? args.manifest_path
      : path.join(repoRoot, args.manifest_path);
    try {
      const raw = await readFile(abs, "utf8");
      manifest = JSON.parse(raw) as ProofFacetManifestV1;
    } catch (e) {
      errors.push({
        code: "MANIFEST_READ",
        message: `Cannot read manifest: ${e instanceof Error ? e.message : String(e)}`,
      });
    }
  }

  if (!manifest) {
    errors.push({ code: "MANIFEST_MISSING", message: "manifest or manifest_path required" });
    return {
      ok: false,
      schema_version: null,
      proof_boundary: PROOF_BOUNDARY,
      errors,
      label_reconcile_diagnostics: [],
      advisory,
    };
  }

  const shape = validateProofFacetManifestShape(manifest);
  errors.push(...shape.errors);
  const parsed = shape.parsed ?? manifest;

  const label_reconcile_diagnostics: LabelReconcileDiagnostic[] = [];
  const fileRows = parsed.files ?? [];

  for (const row of fileRows) {
    const rel = normalizeManifestPath(row.path);
    const abs = path.join(repoRoot, rel);
    try {
      await access(abs);
    } catch {
      errors.push({ code: "FILE_MISSING", message: `Test file not found: ${rel}` });
    }
    if (args.reconcile_snapshot !== false) {
      let text = "";
      try {
        text = await readFile(path.join(repoRoot, rel), "utf8");
      } catch {
        continue;
      }
      const pathOnly = resolveProofSubtypeForFile(rel, text);
      const withManifest = resolveProofSubtypeWithManifest(rel, text, parsed);
      label_reconcile_diagnostics.push({
        path: rel,
        manifest_subtype: row.proof_subtype,
        path_resolved_subtype: pathOnly,
        match: row.proof_subtype === withManifest && (row.proof_subtype === pathOnly || withManifest !== pathOnly),
      });
      if (row.proof_subtype !== pathOnly && row.proof_subtype === withManifest) {
        // advisory override intentional
      } else if (row.proof_subtype !== pathOnly && row.proof_subtype !== withManifest) {
        errors.push({
          code: "RECONCILE_MISMATCH",
          message: `Manifest subtype ${row.proof_subtype} disagrees with path ${pathOnly} for ${rel}`,
        });
      }
    }
  }

  let snapshotOk = true;
  if (args.reconcile_snapshot !== false && shape.ok) {
    const receipt = await buildProjectSizeSnapshot({
      repo_root: repoRoot,
      proof_facet_manifest: parsed,
    });
    snapshotOk = receipt.ok === true;
    if (!receipt.ok) {
      errors.push({ code: "SNAPSHOT_FAILED", message: "Snapshot failed during manifest reconcile" });
    }
  }

  const hardFail = !advisory && errors.length > 0;
  const ok = shape.ok && snapshotOk && (advisory || errors.length === 0) && !hardFail;

  return {
    ok: advisory ? shape.ok && snapshotOk && errors.filter((e) => e.code !== "RECONCILE_MISMATCH").length === 0 : ok,
    schema_version: PROOF_FACET_MANIFEST_SCHEMA_VERSION,
    proof_boundary: parsed.proof_boundary ?? PROOF_BOUNDARY,
    errors: advisory
      ? errors.filter((e) => e.code !== "RECONCILE_MISMATCH")
      : errors,
    label_reconcile_diagnostics,
    advisory,
  };
}
