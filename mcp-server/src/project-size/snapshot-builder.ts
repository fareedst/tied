/**
 * [IMPL-TIED_PROJECT_SIZE_SNAPSHOT] [ARCH-TIED_PROJECT_SIZE_SNAPSHOT] [REQ-TIED_PROJECT_SIZE_LAYERS]
 */

import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

import fg from "fast-glob";
import yaml from "js-yaml";

import { analyzeEssencePseudocode } from "../analysis/pseudocode-analyzer.js";
import { refreshCorpusGraphIndex } from "../corpus-graph/index-builder.js";
import {
  PROOF_BOUNDARY,
  RECEIPT_SCHEMA_VERSION,
  VALIDATOR_VERSION,
  type ProjectSizeSnapshotReceipt,
  type TrialFactorsAnnex,
} from "./types.js";

const TOKEN_KEY = /^(REQ|ARCH|IMPL|PROC)-[A-Z0-9_]+$/;
const INDEX_FILES = [
  { file: "requirements.yaml", kind: "req" as const },
  { file: "architecture-decisions.yaml", kind: "arch" as const },
  { file: "implementation-decisions.yaml", kind: "impl" as const },
];

const DEFAULT_TEMPLATE_REL = "tied-bundle/templates/impl-essence-pseudocode-template.md";

function hashNormalized(text: string): string {
  const normalized = text.replace(/\r\n/g, "\n");
  return createHash("sha256").update(normalized, "utf8").digest("hex");
}

function countNonEmptyLines(text: string): number {
  return text.split(/\r?\n/).filter((line) => line.trim().length > 0).length;
}

function templateBodyLines(templateFull: string): Set<string> {
  const dash = templateFull.indexOf("\n---\n");
  const body = dash >= 0 ? templateFull.slice(dash + 5) : templateFull;
  const lines = new Set<string>();
  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.length > 0) lines.add(trimmed);
  }
  return lines;
}

function countTemplateOverlap(sidecarText: string, templateLines: Set<string>): number {
  let overlap = 0;
  for (const line of sidecarText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.length > 0 && templateLines.has(trimmed)) overlap += 1;
  }
  return overlap;
}

function countVocabPreferredTerms(vocabText: string): number {
  let count = 0;
  for (const line of vocabText.split(/\r?\n/)) {
    if (/^\|\s+\*\*[^*]+\*\*\s+\|/.test(line)) count += 1;
  }
  return count;
}

function classifyTestFile(relPath: string): "unit" | "composition" | "e2e" | "binding" {
  const base = relPath.replace(/\\/g, "/");
  const lower = base.toLowerCase();
  if (lower.includes("binding-inventory") || lower.includes("binding_inventory")) {
    return "binding";
  }
  if (lower.includes("e2e") || lower.endsWith(".e2e.test.ts")) {
    return "e2e";
  }
  if (lower.includes("composition") || lower.endsWith(".composition.test.ts")) {
    return "composition";
  }
  return "unit";
}

async function countIndexAtoms(repoRoot: string, tiedRel: string): Promise<{
  req: number;
  arch: number;
  impl: number;
}> {
  const counts = { req: 0, arch: 0, impl: 0 };
  for (const { file, kind } of INDEX_FILES) {
    const abs = path.join(repoRoot, tiedRel, file);
    try {
      await access(abs);
    } catch {
      continue;
    }
    const raw = await readFile(abs, "utf8");
    const parsed = (yaml.load(raw) ?? {}) as Record<string, unknown>;
    for (const key of Object.keys(parsed)) {
      if (!TOKEN_KEY.test(key)) continue;
      counts[kind] += 1;
    }
  }
  return counts;
}

async function readTrialFactors(repoRoot: string, tiedRel: string): Promise<TrialFactorsAnnex | undefined> {
  const inventoryGlob = path.posix.join(tiedRel, "working/**/trial-workflow-interaction-inventory.v1.json");
  const matches = await fg(inventoryGlob, { cwd: repoRoot, onlyFiles: true });
  const annex: TrialFactorsAnnex = {};
  if (matches.length > 0) {
    const sorted = [...matches].sort();
    try {
      const raw = await readFile(path.join(repoRoot, sorted[0]!), "utf8");
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (typeof parsed.implementation_stack_id === "string") {
        annex.implementation_stack_id = parsed.implementation_stack_id;
      }
    } catch {
      // optional annex — ignore parse errors
    }
  }
  const manifestGlob = path.posix.join(
    tiedRel,
    "working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json",
  );
  const manifests = await fg(manifestGlob, { cwd: repoRoot, onlyFiles: true });
  if (manifests.length > 0) {
    try {
      const raw = await readFile(path.join(repoRoot, manifests[0]!), "utf8");
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (typeof parsed.exit_code === "number") {
        annex.orchestrator_exit_code = parsed.exit_code;
      }
    } catch {
      // ignore
    }
  }
  return Object.keys(annex).length > 0 ? annex : undefined;
}

export async function buildProjectSizeSnapshot(input: {
  repo_root: string;
  tied_project_rel?: string;
  include_trial_factors?: boolean;
}): Promise<ProjectSizeSnapshotReceipt> {
  const repoRoot = path.resolve(input.repo_root);
  const tiedRel = input.tied_project_rel ?? "tied-project";
  const diagnostics: Array<{ code: string; message: string }> = [];

  const tiedRoot = path.join(repoRoot, tiedRel);
  try {
    await access(tiedRoot);
  } catch {
    diagnostics.push({ code: "MISSING_TIED_PROJECT", message: `Missing ${tiedRel}/ under repo_root` });
    return {
      schema_version: RECEIPT_SCHEMA_VERSION,
      ok: false,
      proof_boundary: PROOF_BOUNDARY,
      validator_version: VALIDATOR_VERSION,
      repo_root: repoRoot,
      layers: {
        atoms: {
          vocab_preferred_terms: 0,
          index_req: 0,
          index_arch: 0,
          index_impl: 0,
          corpus_graph_nodes: 0,
          corpus_graph_edges: 0,
        },
        operational_intent: {
          sidecar_count: 0,
          gross_lines: 0,
          template_overlap_lines: 0,
          applied_lines: 0,
          procedure_count: 0,
          parse_node_count: 0,
        },
        proof_facets: {
          unit_tests: 0,
          composition_tests: 0,
          e2e_tests: 0,
          binding_inventory_tests: 0,
          verify_evidence_files: 0,
        },
      },
      cross_layer: {
        operational_intent_per_atom: null,
        proof_facets_per_atom: null,
        tests_per_procedure: null,
      },
      hashes: { operational_intent_hash: hashNormalized("") },
      diagnostics,
    };
  }

  let templateLines = new Set<string>();
  const templateAbs = path.join(repoRoot, DEFAULT_TEMPLATE_REL);
  try {
    const templateFull = await readFile(templateAbs, "utf8");
    templateLines = templateBodyLines(templateFull);
  } catch {
    diagnostics.push({
      code: "TEMPLATE_MISSING",
      message: `${DEFAULT_TEMPLATE_REL} not found; template overlap treated as zero`,
    });
  }

  const indexCounts = await countIndexAtoms(repoRoot, tiedRel);

  let vocabPreferred = 0;
  const vocabFiles = await fg(path.posix.join(tiedRel, "vocab", "*.md").replace(/\\/g, "/"), {
    cwd: repoRoot,
    onlyFiles: true,
  });
  for (const rel of vocabFiles.sort()) {
    const text = await readFile(path.join(repoRoot, rel), "utf8");
    vocabPreferred += countVocabPreferredTerms(text);
  }

  const { index: corpusIndex } = await refreshCorpusGraphIndex({
    repo_root: repoRoot,
    tied_project_rel: tiedRel,
  });

  const sidecarPattern = path.posix.join(tiedRel, "implementation-decisions", "*-pseudocode.md");
  const sidecars = await fg(sidecarPattern.replace(/\\/g, "/"), { cwd: repoRoot, onlyFiles: true });
  const mergedBodies: string[] = [];
  let grossLines = 0;
  let templateOverlap = 0;
  let procedureCount = 0;
  let parseNodeCount = 0;

  for (const rel of sidecars.sort()) {
    const text = await readFile(path.join(repoRoot, rel), "utf8");
    mergedBodies.push(text.replace(/\r\n/g, "\n"));
    grossLines += countNonEmptyLines(text);
    templateOverlap += countTemplateOverlap(text, templateLines);
    const analyze = analyzeEssencePseudocode({
      token: "IMPL-AGGREGATE",
      pseudocode: text,
      analyses: ["parse"],
    });
    if ("sections" in analyze && analyze.sections.parse) {
      procedureCount += analyze.sections.parse.procedure_count;
      parseNodeCount += analyze.sections.parse.parse_node_count;
    }
  }

  const operationalIntentHash = hashNormalized(mergedBodies.join("\n---\n"));
  const appliedLines = Math.max(0, grossLines - templateOverlap);

  const testFiles = await fg(
    ["src/**/*.test.ts", "src/**/*.test.mjs"].map((p) => p.replace(/\\/g, "/")),
    { cwd: repoRoot, onlyFiles: true },
  );
  const proofCounts = {
    unit_tests: 0,
    composition_tests: 0,
    e2e_tests: 0,
    binding_inventory_tests: 0,
  };
  for (const rel of testFiles) {
    const kind = classifyTestFile(rel);
    if (kind === "binding") proofCounts.binding_inventory_tests += 1;
    else if (kind === "e2e") proofCounts.e2e_tests += 1;
    else if (kind === "composition") proofCounts.composition_tests += 1;
    else proofCounts.unit_tests += 1;
  }

  const verifyEvidence = await fg(
    path.posix.join(tiedRel, "working/**/evidence/*consistency*.json").replace(/\\/g, "/"),
    { cwd: repoRoot, onlyFiles: true },
  );

  const atomTotal =
    vocabPreferred + indexCounts.req + indexCounts.arch + indexCounts.impl + corpusIndex.nodes.length;
  const proofTotal =
    proofCounts.unit_tests +
    proofCounts.composition_tests +
    proofCounts.e2e_tests +
    proofCounts.binding_inventory_tests;

  const crossLayer = {
    operational_intent_per_atom: atomTotal > 0 ? appliedLines / atomTotal : null,
    proof_facets_per_atom: atomTotal > 0 ? proofTotal / atomTotal : null,
    tests_per_procedure: procedureCount > 0 ? proofTotal / procedureCount : null,
  };

  const trial_factors =
    input.include_trial_factors === true
      ? await readTrialFactors(repoRoot, tiedRel)
      : undefined;

  return {
    schema_version: RECEIPT_SCHEMA_VERSION,
    ok: true,
    proof_boundary: PROOF_BOUNDARY,
    validator_version: VALIDATOR_VERSION,
    repo_root: repoRoot,
    layers: {
      atoms: {
        vocab_preferred_terms: vocabPreferred,
        index_req: indexCounts.req,
        index_arch: indexCounts.arch,
        index_impl: indexCounts.impl,
        corpus_graph_nodes: corpusIndex.nodes.length,
        corpus_graph_edges: corpusIndex.edges.length,
      },
      operational_intent: {
        sidecar_count: sidecars.length,
        gross_lines: grossLines,
        template_overlap_lines: templateOverlap,
        applied_lines: appliedLines,
        procedure_count: procedureCount,
        parse_node_count: parseNodeCount,
      },
      proof_facets: {
        ...proofCounts,
        verify_evidence_files: verifyEvidence.length,
      },
    },
    cross_layer: crossLayer,
    hashes: {
      operational_intent_hash: operationalIntentHash,
      corpus_graph_content_hash: corpusIndex.content_hash,
    },
    ...(trial_factors ? { trial_factors } : {}),
    diagnostics,
  };
}
