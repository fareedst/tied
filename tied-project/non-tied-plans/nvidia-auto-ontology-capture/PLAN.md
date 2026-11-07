# Plan: NVIDIA Auto-Ontology methodology capture (Wave 1, local-only)

**Slug:** `nvidia-auto-ontology-capture`  
**Track:** prior Cursor plan → `@non-tied-refine` (this plan) → `@non-tied-build` → optional `@non-tied-close`  
**Source repo:** [NVIDIA/auto-ontology](https://github.com/NVIDIA/auto-ontology)  
**Template (Wave 1 only):** [`tied-bundle/docs/external-service-three-wave-comparison-template.md`](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md) — capture sections, not Wave 2 matrix

## Scope

Doc-only **Wave 1 methodology capture**: extract NVIDIA’s **agent-facing** methodology (Generate → Certify → Answer, three `nvidia-ontology-*` skills, MCP read vs REST write, modeling/publication/query-validation gates) into one markdown file. **No** Wave 2 TIED × agent-management analysis, **no** project REQ/ARCH/IMPL YAML, **no** `.gitignore` allowlist.

| Boundary | Choice |
| --- | --- |
| Deliverable | `docs/comparisons/nvidia-auto-ontology.md` |
| Publish | **Local only** — parent rule `docs/comparisons/*` |
| Evidence tool | **agent-browser** (primary per sponsor); `raw.githubusercontent.com` acceptable for long skill/reference files |
| Claims | **NVIDIA-reported** or **skill-doc-observed**; stdd **not_measured** for runtime/deploy/MCP unless build session runs them |

## Evidence inputs (read-only)

| Role | Upstream path |
| --- | --- |
| Product spine | `README.md` — pillars, lifecycle, MCP tools, model roles, trust boundaries |
| Harness entry | `AGENTS.md` — skill ownership, composed lifecycle, sources-of-truth rules |
| Setup skill | `skills/nvidia-ontology-setup/SKILL.md`; `references/troubleshooting.md` when ops gates matter |
| Management skill | `skills/nvidia-ontology-management/SKILL.md`; `references/modeling.md`, `publication.md`, `write-api.md` |
| Query skill | `skills/nvidia-ontology-query/SKILL.md`; `references/query-validation.md` |
| MCP ops | `docs/mcp.md` (auth, sequencing) |

Optional context only (not full paste): `DEPLOYMENT.md`, OpenAPI JSON — link by path in capture footnotes.

## Deliverable outline (`@non-tied-build`)

1. Metadata table (source URL, captured date, purpose, proof boundary, sibling routing footnote only).
2. **TL;DR** — methodology in ~10 bullets (**NVIDIA-reported**).
3. **Problem framing** — Discover / Ground / Validate / Expose / Learn.
4. **Core lifecycle** — Generate / Certify / Answer; terms, SQL attributes, relationships.
5. **Harness methodology** — three skills + handoff table from `AGENTS.md`.
6. **Read vs write plane** — mermaid + MCP vs `/api` gateway.
7. **Modeling, publication, query validation** — distilled from skill references (contracts, fail-closed, evidence states).
8. **Inference roles** — REASONING / NON_REASONING / EMBED / RERANK; optional KumoRFM caveat.
9. **Interop & boundaries** — Ossie, ontology-sql-eval (link only), no external PRs, port/trust notes.
10. **Related comparisons** — NDTP, Netflix observability, Open Ontologies (links only; no TIED matrix).

## Plan package paths

| Artifact | Path |
| --- | --- |
| Capture | `docs/comparisons/nvidia-auto-ontology.md` |
| Plan folder | `tied-project/non-tied-plans/nvidia-auto-ontology-capture/PLAN.md`, `test-strategy.md`, `evidence/session-handoff.md` |

## Forbidden

Minting REQ/ARCH/IMPL from capture prose; MCP project YAML writes; `.gitignore` allowlist without sponsor opt-in; deploying Auto-Ontology or BIRD eval in this slug unless sponsor expands scope; duplicating full OpenAPI or MCP tool tables in the capture (point to upstream owners per `AGENTS.md`).

## Verification

See [test-strategy.md](test-strategy.md). Handoff: [evidence/session-handoff.md](evidence/session-handoff.md).
