/**
 * [REQ-TIED_PROJECT_SIZE_LAYERS] Markdown comparison table from snapshot receipts.
 */

const FORBIDDEN_PHRASES = ["leaderboard", "maturity_score", "maturity score"];

const PROOF_BOUNDARY_FALLBACK =
  "Read-only size evidence from subject repo; counts and hashes do not prove REQ satisfaction, test passage, checklist gates, or trial grade.";

function tailPath(repoRoot, parts = 3) {
  const segs = String(repoRoot).split(/[/\\]/).filter(Boolean);
  return segs.slice(-parts).join("/");
}

function fmtNum(value, decimals = 0) {
  if (value === null || value === undefined) return "—";
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  if (decimals === 0) return String(Math.round(value));
  return value.toFixed(decimals);
}

function hashPrefix(hash, len = 8) {
  if (typeof hash !== "string" || hash.length === 0) return "—";
  return hash.slice(0, len);
}

/** Glossary for summary table headers (aligned with project-size-metrics.registry.yaml). */
function renderColumnDefinitionsSection() {
  const lines = [];
  lines.push("## Column definitions");
  lines.push("");
  lines.push(
    "Three layers: **atoms** (agreement footprint), **operational intent** (IMPL pseudo-code mass), **proof facets** (tests and evidence files). See [catalog-tied-size-and-trial-statistics.md](../../../docs/demos/catalog-tied-size-and-trial-statistics.md).",
  );
  lines.push("");
  lines.push("| Column | Layer | Definition |");
  lines.push("| --- | --- | --- |");
  lines.push(
    "| **label** | — | Discover basename (disposable client dirname, often `{epoch}-wf-agentstream-…`). |",
  );
  lines.push(
    "| **ok** | — | Receipt `ok`: snapshot builder finished without fatal error (not workflow pass/fail). |",
  );
  lines.push("| **repo (tail)** | — | Last three path segments of absolute `repo_root`. |");
  lines.push("| **REQ** | atoms | Count of REQ tokens in `tied-project/requirements.yaml` index. |");
  lines.push("| **ARCH** | atoms | Count of ARCH tokens in `tied-project/architecture-decisions.yaml` index. |");
  lines.push("| **IMPL** | atoms | Count of IMPL tokens in `tied-project/implementation-decisions.yaml` index. |");
  lines.push(
    "| **vocab** | atoms | Rows in client vocab preferred-term tables under `tied-project/vocab/`. |",
  );
  lines.push(
    "| **applied_lines** | operational intent | Non-template pseudo-code lines across merged `IMPL-*-pseudocode.md` sidecars (gross minus template overlap). |",
  );
  lines.push(
    "| **applied_utf8** | operational intent | `applied_utf8_bytes`: UTF-8 byte length of trimmed non-empty lines minus template overlap bytes. |",
  );
  lines.push(
    "| **procedures** | operational intent | Analyzer procedure count in pseudo-code (`procedure_count`). |",
  );
  lines.push(
    "| **oi_hash** | operational intent | First 8 hex chars of `hashes.operational_intent_hash` (full pseudo-code body hash; changes when sidecars change). |",
  );
  lines.push(
    "| **unit** | proof facets | Unit test **cases** (`node:test` `it`/`test` per file) under subject `src/`. Receipt `validator_version` ≥ 1.1.0. |",
  );
  lines.push(
    "| **comp** | proof facets | Composition test **cases** per classified file (same counting rule). |",
  );
  lines.push("| **e2e** | proof facets | E2E test **cases** per classified file (same counting rule). |");
  lines.push(
    "| **verify_ev** | proof facets | Count of `*consistency*.json` evidence files under `tied-project/working/**/evidence/`. |",
  );
  lines.push(
    "| **oi/atom** | cross-layer | `operational_intent_per_atom`: applied_lines ÷ (vocab + REQ + ARCH + IMPL + optional corpus nodes). Descriptive ratio only. |",
  );
  lines.push(
    "| **utf8/atom** | cross-layer | `operational_intent_utf8_per_atom`: applied_utf8_bytes ÷ same atom denominator. |",
  );
  lines.push(
    "| **pf/atom** | cross-layer | `proof_facets_per_atom`: (unit + comp + e2e + binding-inventory **cases**) ÷ same atom denominator. Pre-1.1.0 receipts counted **files**. |",
  );
  lines.push("");
  lines.push(
    "Expanded table (`--verbose-table`): **corpus_nodes** / **corpus_edges** (corpus graph), **gross_lines** / **parse_nodes** / **sidecars** (operational intent), **binding_inv** (binding-inventory-related tests).",
  );
  lines.push("");
  return lines;
}

/**
 * @param {Array<{ label: string; receipt: Record<string, unknown> }>} rows
 * @param {{
 *   generatedAt?: string;
 *   discoverParent?: string;
 *   pattern?: string;
 *   patternRegex?: boolean;
 *   verboseTable?: boolean;
 * }} meta
 */
export function renderComparisonMarkdown(rows, meta = {}) {
  const generatedAt = meta.generatedAt ?? new Date().toISOString();
  const proof =
    (rows.find((r) => typeof r.receipt?.proof_boundary === "string")?.receipt
      ?.proof_boundary) || PROOF_BOUNDARY_FALLBACK;

  const lines = [];
  lines.push("# Project size comparison (facilitator)");
  lines.push("");
  lines.push(`**Generated:** ${generatedAt}`);
  if (meta.discoverParent) lines.push(`**Discover parent:** \`${meta.discoverParent}\``);
  if (meta.pattern !== undefined) {
    const mode = meta.patternRegex ? "regex" : "substring";
    lines.push(`**Pattern (${mode}):** \`${meta.pattern}\``);
  }
  lines.push("");
  lines.push("Descriptive cohort evidence only — not grades or REQ status.");
  lines.push("");
  lines.push(...renderColumnDefinitionsSection());

  const okRows = rows.filter((r) => r.receipt?.ok === true);
  const failRows = rows.filter((r) => r.receipt?.ok !== true);

  lines.push("## Summary");
  lines.push("");
  lines.push(
    "| label | ok | repo (tail) | REQ | ARCH | IMPL | vocab | applied_lines | applied_utf8 | procedures | oi_hash | unit | comp | e2e | verify_ev | oi/atom | utf8/atom | pf/atom |",
  );
  lines.push(
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  );

  for (const { label, receipt } of okRows) {
    const atoms = receipt.layers?.atoms ?? {};
    const oi = receipt.layers?.operational_intent ?? {};
    const pf = receipt.layers?.proof_facets ?? {};
    const cross = receipt.cross_layer ?? {};
    const hashes = receipt.hashes ?? {};
    lines.push(
      [
        label,
        "yes",
        tailPath(receipt.repo_root),
        fmtNum(atoms.index_req),
        fmtNum(atoms.index_arch),
        fmtNum(atoms.index_impl),
        fmtNum(atoms.vocab_preferred_terms),
        fmtNum(oi.applied_lines),
        fmtNum(oi.applied_utf8_bytes),
        fmtNum(oi.procedure_count),
        hashPrefix(hashes.operational_intent_hash),
        fmtNum(pf.unit_tests),
        fmtNum(pf.composition_tests),
        fmtNum(pf.e2e_tests),
        fmtNum(pf.verify_evidence_files),
        fmtNum(cross.operational_intent_per_atom, 3),
        fmtNum(cross.operational_intent_utf8_per_atom, 3),
        fmtNum(cross.proof_facets_per_atom, 3),
      ]
        .map((c) => String(c).replace(/\|/g, "\\|"))
        .join(" | ")
        .replace(/^/, "| ")
        .concat(" |"),
    );
  }

  if (okRows.length === 0) {
    lines.push("| — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |");
  }

  lines.push("");

  if (failRows.length > 0 || (meta.discoverDiagnostics?.length ?? 0) > 0) {
    lines.push("## Failed / skipped");
    lines.push("");
    for (const { label, receipt } of failRows) {
      const diags = Array.isArray(receipt?.diagnostics) ? receipt.diagnostics : [];
      const msg = diags.map((d) => `${d.code}: ${d.message}`).join("; ") || "ok=false";
      lines.push(`- **${label}:** ${msg}`);
    }
    for (const d of meta.discoverDiagnostics ?? []) {
      lines.push(`- **discover:** ${d.code}: ${d.message}`);
    }
    lines.push("");
  }

  if (meta.verboseTable === true && okRows.length > 0) {
    lines.push("## Expanded metrics");
    lines.push("");
    lines.push("| label | corpus_nodes | corpus_edges | gross_lines | parse_nodes | binding_inv | sidecars |");
    lines.push("| --- | --- | --- | --- | --- | --- | --- |");
    for (const { label, receipt } of okRows) {
      const atoms = receipt.layers?.atoms ?? {};
      const oi = receipt.layers?.operational_intent ?? {};
      const pf = receipt.layers?.proof_facets ?? {};
      lines.push(
        `| ${label} | ${fmtNum(atoms.corpus_graph_nodes)} | ${fmtNum(atoms.corpus_graph_edges)} | ${fmtNum(oi.gross_lines)} | ${fmtNum(oi.parse_node_count)} | ${fmtNum(pf.binding_inventory_tests)} | ${fmtNum(oi.sidecar_count)} |`,
      );
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push(`**Proof boundary:** ${proof}`);
  lines.push("");

  const text = lines.join("\n");
  for (const phrase of FORBIDDEN_PHRASES) {
    if (text.toLowerCase().includes(phrase)) {
      throw new Error(`FORBIDDEN_PHRASE_IN_OUTPUT: ${phrase}`);
    }
  }
  return text;
}

export function assertRenderableMarkdown(text) {
  for (const phrase of FORBIDDEN_PHRASES) {
    if (text.toLowerCase().includes(phrase)) {
      throw new Error(`FORBIDDEN_PHRASE: ${phrase}`);
    }
  }
  if (!text.includes("Proof boundary")) {
    throw new Error("MISSING_PROOF_BOUNDARY_SECTION");
  }
}
