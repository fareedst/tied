/**
 * [REQ-WF_TRIAL_COMPOSITION_EVIDENCE_SUBCHECK] [IMPL-WF_TRIAL_COMPOSITION_EVIDENCE_SUBCHECK]
 */

import { access, readFile } from "node:fs/promises";
import path from "node:path";

import fg from "fast-glob";

import { buildProjectSizeSnapshot } from "./snapshot-builder.js";
import { PROOF_BOUNDARY } from "./types.js";
import type { ProofFacetManifestV1 } from "./wf-proof-manifest-types.js";
import { validateWfProofManifest } from "./wf-proof-manifest-validate.js";

export const COMPOSITION_EVIDENCE_SUBCHECK_SCHEMA_VERSION = "wf-composition-evidence-subcheck.v2" as const;

export type CompositionEvidenceSubcheckVerdict = "pass" | "fail" | "n_a";

export type CompositionEvidenceSubcheckV2 = {
  schema_version: typeof COMPOSITION_EVIDENCE_SUBCHECK_SCHEMA_VERSION;
  composition_evidence_subcheck: CompositionEvidenceSubcheckVerdict;
  primary_lens: string;
  receipt_composition_declared: number;
  receipt_composition_inferred: number;
  label_case_counts: Record<string, number>;
  label_histogram_markdown: string;
  manifest_present: boolean;
  manifest_reconcile_ok: boolean;
  binding_test_present: boolean;
  prompt_id?: string;
  proof_boundary: string;
};

const COMPOSITION_COHORT_PROMPT = /^PROMPT-WF-(09|10|11|12)$/;

const DEFAULT_MANIFEST_REL_CANDIDATES = [
  "tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json",
];

export function renderLabelHistogramMarkdown(counts: Record<string, number>): string {
  const rows = Object.entries(counts)
    .filter(([, n]) => n > 0)
    .sort(([a], [b]) => a.localeCompare(b));
  const lines = ["| label | cases |", "| --- | ---: |"];
  for (const [label, n] of rows) {
    lines.push(`| ${label} | ${n} |`);
  }
  if (rows.length === 0) {
    lines.push("| _(none)_ | 0 |");
  }
  return `${lines.join("\n")}\n`;
}

export function bindingTestPresentFromSignals(args: {
  label_case_counts: Record<string, number>;
  composition_inferred_cases: number;
  manifest?: ProofFacetManifestV1;
}): boolean {
  const wiring = args.label_case_counts["composition.wiring"] ?? 0;
  const integration = args.label_case_counts["composition.integration"] ?? 0;
  const contract = args.label_case_counts["composition.contract"] ?? 0;
  const bindingInventory =
    (args.label_case_counts["binding_inventory.table"] ?? 0) +
    (args.label_case_counts["binding_inventory.row"] ?? 0);
  const manifestBindings = args.manifest?.bindings?.length ?? 0;
  if (manifestBindings > 0) return true;
  if (wiring > 0 || integration > 0 || contract > 0 || bindingInventory > 0) return true;
  if ((args.composition_inferred_cases ?? 0) > 0) return true;
  return false;
}

export function compositionSubcheckVerdict(
  prompt_id: string | undefined,
  binding_test_present: boolean,
): CompositionEvidenceSubcheckVerdict {
  if (!prompt_id || !COMPOSITION_COHORT_PROMPT.test(prompt_id)) {
    return "n_a";
  }
  return binding_test_present ? "pass" : "fail";
}

async function discoverManifestPath(repoRoot: string): Promise<string | null> {
  for (const rel of DEFAULT_MANIFEST_REL_CANDIDATES) {
    const abs = path.join(repoRoot, rel);
    try {
      await access(abs);
      return rel;
    } catch {
      // continue
    }
  }
  const hits = await fg("tied-project/working/*/evidence/proof-facet-manifest.v1.json", {
    cwd: repoRoot,
    onlyFiles: true,
  });
  return hits[0] ?? null;
}

async function loadManifest(repoRoot: string, manifestPath: string): Promise<ProofFacetManifestV1 | undefined> {
  try {
    const raw = await readFile(path.join(repoRoot, manifestPath), "utf8");
    return JSON.parse(raw) as ProofFacetManifestV1;
  } catch {
    return undefined;
  }
}

export async function runCompositionEvidenceSubcheck(args: {
  repo_root: string;
  prompt_id?: string;
  primary_lens?: string;
  manifest_path?: string;
}): Promise<CompositionEvidenceSubcheckV2> {
  const repoRoot = path.resolve(args.repo_root);
  const primaryLens = args.primary_lens ?? "wf-cohort";

  let manifestPath = args.manifest_path;
  let manifestPresent = false;
  let manifest: ProofFacetManifestV1 | undefined;

  if (manifestPath) {
    const abs = path.isAbsolute(manifestPath) ? manifestPath : path.join(repoRoot, manifestPath);
    manifestPath = path.relative(repoRoot, abs);
    try {
      await access(abs);
      manifestPresent = true;
      manifest = await loadManifest(repoRoot, manifestPath);
    } catch {
      manifestPresent = false;
    }
  } else {
    const discovered = await discoverManifestPath(repoRoot);
    if (discovered) {
      manifestPath = discovered;
      manifestPresent = true;
      manifest = await loadManifest(repoRoot, discovered);
    }
  }

  let manifestReconcileOk = false;
  if (manifestPresent && manifest) {
    const validation = await validateWfProofManifest({
      repo_root: repoRoot,
      manifest,
      reconcile_snapshot: true,
      blocking: false,
    });
    manifestReconcileOk = validation.ok;
  }

  const receipt = await buildProjectSizeSnapshot({
    repo_root: repoRoot,
    proof_facet_manifest: manifest,
  });

  const pf = receipt.layers.proof_facets;
  const labelCounts = pf.label_case_counts ?? {};
  const inferred = pf.composition_inferred_cases ?? 0;
  const bindingPresent = bindingTestPresentFromSignals({
    label_case_counts: labelCounts,
    composition_inferred_cases: inferred,
    manifest,
  });

  const promptId = args.prompt_id ?? manifest?.prompt_id;
  const verdict = compositionSubcheckVerdict(promptId, bindingPresent);

  return {
    schema_version: COMPOSITION_EVIDENCE_SUBCHECK_SCHEMA_VERSION,
    composition_evidence_subcheck: verdict,
    primary_lens: primaryLens,
    receipt_composition_declared: pf.composition_tests,
    receipt_composition_inferred: inferred,
    label_case_counts: { ...labelCounts },
    label_histogram_markdown: renderLabelHistogramMarkdown(labelCounts),
    manifest_present: manifestPresent,
    manifest_reconcile_ok: manifestReconcileOk,
    binding_test_present: bindingPresent,
    prompt_id: promptId,
    proof_boundary: receipt.proof_boundary ?? PROOF_BOUNDARY,
  };
}
