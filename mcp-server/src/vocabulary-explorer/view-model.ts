/**
 * [IMPL-VOCABULARY_PROJECTION] [ARCH-VOCABULARY_DATA_CONTRACT] [REQ-VOCABULARY_EXPLORER]
 * vocabulary-explorer.v1 deterministic projection.
 */

import { createHash } from "node:crypto";
import path from "node:path";
import type { RunSummary } from "../analysis/scoped-analysis.js";
import type { SourceTermAnalysisResult, TermAnalysisPolicy, TermOccurrence } from "./term-analysis.js";
import type { TiedRecordCatalog, TiedOwnership } from "./tied-records.js";

export type VocabularyTermRelationship = {
  kind: string;
  target_id: string;
};

export type VocabularyTerm = {
  id: string;
  kind: "tied_token" | "source_identifier";
  display: string;
  normalized_key: string;
  frequency: number;
  ownership: TiedOwnership | "n/a";
  tied_layer: "REQ" | "ARCH" | "IMPL" | null;
  description: string;
  relationships: VocabularyTermRelationship[];
  occurrences: TermOccurrence[];
};

export type VocabularyExplorerV1Envelope = {
  schema: "vocabulary-explorer.v1";
  generated_at: string;
  project_root_label: string;
  proof_boundary: "offline_navigation_aid";
  walk_summary: {
    roots_used: string[];
    files_scanned: number;
    skipped_paths_count: number;
    truncation: {
      applied: boolean;
      max_terms: number;
      dropped_count: number;
    };
  };
  policy: {
    min_frequency: number;
    max_terms: number;
    include_extensions: string[];
    identifier_mode: "ast" | "lexical";
  };
  terms: VocabularyTerm[];
  filters_catalog: {
    directories: string[];
    languages: string[];
    file_kinds: string[];
  };
  views_catalog: string[];
};

/** [IMPL-VOCABULARY_PROJECTION] [ARCH-VOCABULARY_DATA_CONTRACT] [REQ-VOCABULARY_EXPLORER] */
export function stableTermId(kind: string, normalized_key: string): string {
  return createHash("sha256").update(`${kind}:${normalized_key}`, "utf8").digest("hex").slice(0, 16);
}

function languageFromPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const map: Record<string, string> = {
    ".ts": "typescript",
    ".tsx": "typescript",
    ".js": "javascript",
    ".jsx": "javascript",
    ".mjs": "javascript",
    ".rb": "ruby",
    ".md": "markdown",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".json": "json",
  };
  return map[ext] ?? "unknown";
}

function coOccurrenceRelationships(
  termId: string,
  allTerms: Map<string, { id: string; occurrences: TermOccurrence[] }>,
): VocabularyTermRelationship[] {
  const files = new Set(allTerms.get(termId)?.occurrences.map((o) => o.path) ?? []);
  const rels: VocabularyTermRelationship[] = [];
  for (const [otherKey, other] of allTerms) {
    if (other.id === termId) continue;
    const shared = other.occurrences.some((o) => files.has(o.path));
    if (shared) rels.push({ kind: "co_occurrence", target_id: other.id });
  }
  return rels.sort((a, b) => a.target_id.localeCompare(b.target_id));
}

/**
 * [IMPL-VOCABULARY_PROJECTION] [ARCH-VOCABULARY_DATA_CONTRACT] [REQ-VOCABULARY_EXPLORER]
 * How: merge source analysis and TIED catalog into sorted v1 envelope.
 */
export function projectVocabularyExplorerV1(params: {
  sourceAnalysis: SourceTermAnalysisResult;
  tiedCatalog: TiedRecordCatalog;
  walkSummary: RunSummary;
  filesScanned: number;
  policy: TermAnalysisPolicy;
  projectRootLabel: string;
  generatedAt?: string;
}): VocabularyExplorerV1Envelope {
  const {
    sourceAnalysis,
    tiedCatalog,
    walkSummary,
    filesScanned,
    policy,
    projectRootLabel,
    generatedAt = new Date().toISOString(),
  } = params;

  const termByKey = new Map<string, VocabularyTerm>();

  for (const rec of tiedCatalog.records) {
    const kind = "tied_token" as const;
    const id = stableTermId(kind, rec.normalized_key);
    termByKey.set(`${kind}:${rec.normalized_key}`, {
      id,
      kind,
      display: rec.display,
      normalized_key: rec.normalized_key,
      frequency: 0,
      ownership: rec.ownership,
      tied_layer: rec.layer,
      description: rec.description,
      relationships: rec.relationships.map((r) => ({
        kind: r.kind,
        target_id: stableTermId("tied_token", r.target_token.toLowerCase()),
      })),
      occurrences: [],
    });
  }

  for (const src of sourceAnalysis.terms) {
    const id = stableTermId(src.kind, src.normalized_key);
    const key = `${src.kind}:${src.normalized_key}`;
    const catalogKey = `tied_token:${src.normalized_key}`;
    const existing = termByKey.get(key) ?? (src.kind === "source_identifier" ? termByKey.get(catalogKey) : undefined);
    if (existing) {
      existing.frequency = Math.max(existing.frequency, src.occurrences.length);
      existing.occurrences = src.occurrences;
      if (src.kind === "tied_token") {
        existing.kind = "tied_token";
        existing.tied_layer = src.tied_layer;
        existing.display = src.display;
      }
    } else if (src.kind === "source_identifier" && termByKey.has(catalogKey)) {
      const cat = termByKey.get(catalogKey)!;
      cat.frequency = Math.max(cat.frequency, src.occurrences.length);
      cat.occurrences = src.occurrences.length > cat.occurrences.length ? src.occurrences : cat.occurrences;
    } else {
      termByKey.set(key, {
        id,
        kind: src.kind,
        display: src.display,
        normalized_key: src.normalized_key,
        frequency: src.occurrences.length,
        ownership: "n/a",
        tied_layer: src.tied_layer,
        description: "",
        relationships: [],
        occurrences: src.occurrences,
      });
    }
  }

  const occurrenceIndex = new Map<string, { id: string; occurrences: TermOccurrence[] }>();
  for (const t of termByKey.values()) {
    occurrenceIndex.set(t.id, { id: t.id, occurrences: t.occurrences });
  }

  const terms = [...termByKey.values()].map((t) => {
    const co = coOccurrenceRelationships(t.id, occurrenceIndex);
    const mergedRels = [...t.relationships, ...co].sort((a, b) => {
      const k = a.kind.localeCompare(b.kind);
      if (k !== 0) return k;
      return a.target_id.localeCompare(b.target_id);
    });
    return { ...t, relationships: mergedRels };
  });

  terms.sort((a, b) => a.id.localeCompare(b.id));

  const directories = new Set<string>();
  const languages = new Set<string>();
  const fileKinds = new Set<string>();
  for (const t of terms) {
    for (const o of t.occurrences) {
      const dir = path.posix.dirname(o.path);
      if (dir && dir !== ".") directories.add(dir);
      languages.add(languageFromPath(o.path));
      fileKinds.add(o.file_kind);
    }
  }

  return {
    schema: "vocabulary-explorer.v1",
    generated_at: generatedAt,
    project_root_label: projectRootLabel,
    proof_boundary: "offline_navigation_aid",
    walk_summary: {
      roots_used: walkSummary.roots_used.map((r) => path.basename(r)),
      files_scanned: filesScanned,
      skipped_paths_count: walkSummary.skipped_paths_count,
      truncation: sourceAnalysis.truncation,
    },
    policy: {
      min_frequency: policy.min_frequency,
      max_terms: policy.max_terms,
      include_extensions: [...policy.include_extensions].sort(),
      identifier_mode: policy.identifier_mode ?? "ast",
    },
    terms,
    filters_catalog: {
      directories: [...directories].sort(),
      languages: [...languages].sort(),
      file_kinds: [...fileKinds].sort(),
    },
    views_catalog: ["frequency", "relationships", "semantic_tokens"],
  };
}
