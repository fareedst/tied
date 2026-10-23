# Open Ontologies — repository summary (read-only capture)

| Field | Value |
| --- | --- |
| **Source** | [fabio-rovai/open-ontologies](https://github.com/fabio-rovai/open-ontologies) (MIT) |
| **Local path** | `/Users/fareed/Downloads/open-ontologies-main` (**target-repo-observed** during stdd authoring) |
| **Crate version** | `2.1.0` in `Cargo.toml` (**target-repo-observed**) |
| **MCP registry name** | `io.github.fabio-rovai/open-ontologies` (README front matter, **target-repo-observed**) |
| **Purpose** | Read-only repository summary for comparison and architecture reference — **external content**; this document does not mint REQ/ARCH/IMPL tokens. |
| **Captured** | 2026-10-23 |
| **Analysis (sibling)** | [open-ontologies-repository-vs-tied-agent-management.md](open-ontologies-repository-vs-tied-agent-management.md) |
| **Related (meaning ownership)** | [Heimsbakk × TIED](veronika-heimsbakk-ai-generated-ontologies-vs-tied-agent-management.md) — essay on LLM ontology **meaning**; this capture covers the **engine** |

---

## TL;DR

- **Single Rust binary** — CLI (`open-ontologies` / `oo`), MCP server (`serve`), optional Studio HTTP REST, Docker/GHCR images (**Tesseract-reported** / **target-repo-observed** in README and `docs/architecture.md`).
- **In-memory Oxigraph** triple store plus **SQLite** for lineage, version snapshots, lint/enforce feedback, and embeddings; native **DL reasoner** (SHIQ tableaux, RDFS, OWL-RL) and optional ONNX embeddings (**target-repo-observed**).
- **Generate–validate–iterate loop** for RDF/OWL: load, validate, query, reason, SHACL, ingest from CSV/JSON/Parquet/XLSX/PostgreSQL, clinical crosswalks, alignment (**SKILL.md** workflow).
- **Terraform-style lifecycle** — `onto_plan` → `onto_enforce` → `onto_apply` → `onto_monitor` → `onto_drift` with persisted `plan_id`, risk scores, optional conservativity check (**target-repo-observed** in `docs/lifecycle.md`).
- **Lean 4 derivation certificates** — forward-chaining runs can emit `oo-cert/1` TSV bundles checked by `lean/` (`OOCert.certificate_sound`); scope limits and refutation rules documented in `docs/lean-certificates.md` (**target-repo-observed**).
- **MCP tool surface** — `docs/tool-reference.md` states **122 tools** at default profile; bundled **SKILL.md** says **110 MCP tools** at version `0.5.1` (**target-repo-observed doc drift** — record both, do not reconcile in stdd).
- **CI honesty** — `docs/ci-gates.md` documents which Rust/Python tests run **strict** vs **skip** vs **not run**; target explicitly warns that green CI can hide skipped legs (**target-repo-observed**).

---

## What it is

Open Ontologies is an **AI-native ontology engineering engine**: build, validate, query, reason over, and govern RDF/OWL knowledge graphs with a large MCP/CLI surface aimed at agent loops (Claude, Cursor, etc.).

### Architecture (summary)

From `docs/architecture.md` (**target-repo-observed**):

| Layer | Role |
| --- | --- |
| **Clients** | LLM via MCP stdio/streamable HTTP; CLI subcommands; Studio (sessionless REST) |
| **Transport** | MCP HTTP `/mcp`; REST `/api/query`, `/api/update`, `/api/save`, `/api/load`, `/api/lineage` |
| **Tool groups** | Core (validate, load, diff, lint…); Data pipeline (map, ingest, SHACL, reason…); Lifecycle (plan, apply, drift, enforce, monitor, lineage); Alignment + clinical; Versioning (history, rollback) |
| **Core engine** | Oxigraph in-memory store; SQLite sidecar; DL reasoner; optional embedding engine (tract-onnx) |
| **External inputs** | Files, remote SPARQL, OWL imports, PostgreSQL schema, Parquet clinical crosswalks |

**Certified inference** — Selected reasoner profiles can write derivation certificates; Lean checkers verify derivations relative to asserted triples, with documented limits on refutation rules, unsatisfiability visibility, and temporal graph selection (`valid_at` / `as_of` requirements).

### Surfaces and packaging

- **Rust workspace** — Primary implementation; feature flags gate embeddings, plugins, SQL (**SKILL.md**, **target-repo-observed**).
- **Python lite engine** — Separate path for lighter deployments; differential tests against Rust + Lean documented in README (**target-repo-observed**).
- **Studio / browser demo** — Hosted try-it flows (**Tesseract-reported** in README); stdd did not exercise Studio during capture.
- **Tests and fixtures** — Large Rust and Python test corpus; SHACL/W3C suites; differential and certificate tests tied to Lean toolchain availability (**target-repo-observed** in `docs/ci-gates.md`).

---

## How it is used

### Core agent workflow (`SKILL.md`)

Prerequisites: install binary (`cargo install --git …` or releases), MCP config with `open-ontologies serve`. Default processing is **local**; optional outbound network only for user-supplied URLs in `onto_pull` / `onto_push` (**target-repo-observed**).

Typical loop (**paraphrase, not a fixed pipeline**):

1. Load or generate Turtle/OWL.
2. Validate, lint, SHACL as needed.
3. Query and reason; optionally emit Lean-checkable certificates.
4. For production changes: **plan** semantic delta, **enforce** design patterns, **apply** delta or migrate with equivalences, **monitor** and detect **drift**.

### Lifecycle semantics (`docs/lifecycle.md`)

- **Plan** diffs current vs proposed Turtle (complete desired state — omissions are removals). Reports blast radius, risk (`low`/`medium`/`high`), locked IRIs, optional **conservativity** block (`check_conservativity: true` opt-in; skipped runs still expose `ran: false`).
- **Apply** uses stored `plan_id`; plan and apply are **separate** invocations (CLI or MCP). Session-scoped “most recent plan” prevents cross-session accidental apply in HTTP multi-session mode (**target-repo-observed**).
- **Enforce** runs built-in or custom SPARQL design packs (`generic`, `boro`, `value_partition`, …).

### Entry points

| Entry | Use |
| --- | --- |
| CLI | `oo plan`, `oo apply`, `open-ontologies reason --certificate`, batch mode |
| MCP | `onto_*` tools (122 listed in tool reference at default profile) |
| Studio | REST for query/update without MCP session |
| Docker/GHCR | Container image per README badges (**Tesseract-reported**) |

---

## Observation boundary (stdd)

| Fact class | Label |
| --- | --- |
| Structure and docs read from local tree **2026-10-23** | **target-repo-observed** |
| Product/marketing claims in README (stars, enterprise support, demo outcomes) | **Tesseract-reported** |
| Tool counts (`122` vs `110`), SKILL version `0.5.1` vs crate `2.1.0` | **target-repo-observed doc drift** — cite sources; stdd did not pick a canonical count |
| stdd execution | **Did not** run `cargo test`, Lean `lake exe oo-cert`, MCP `serve`, or target CI workflows during this capture |

---

## Target proof limits (from upstream docs)

Summarized from `docs/lean-certificates.md`, README “What the tool proves”, and `docs/ci-gates.md` (**target-repo-observed**):

- **Certificates** prove that recorded derivations follow from recorded asserted triples under the checker’s formal fragment — **not** that the ontology matches real-world domain truth.
- **Scope** — Checker reads `asserted.tsv` / `derivations.tsv`; `scope.tsv` documents graph selection but is not read by the checker; temporal stores require explicit `valid_at` / `as_of` / `all_versions` on reason runs.
- **Unsatisfiability / refutation** — Partial rule coverage; some OWL-DL cases visible only to tableau paths without certificates; README states limits on unsatisfiability guarantees explicitly.
- **Conservativity** — Opt-in Horn-fragment check; skipped or non-fatal outcomes still return plans with explicit skip reasons.
- **CI green ≠ full matrix** — Jobs may **skip** when toolchains missing unless `OO_REQUIRE_FIXTURES=1`; target documents tables and maintenance tests to reduce silent skip success.

---

## Notes for stdd readers

- For **TIED agent-management mapping**, read the sibling [Wave 2 analysis](open-ontologies-repository-vs-tied-agent-management.md).
- For **meaning ownership before machine-readable graphs** (LLM-generated OWL critique), read [Heimsbakk × TIED](veronika-heimsbakk-ai-generated-ontologies-vs-tied-agent-management.md) — **compose** with this engine comparison; scopes do not merge.
- For **executable-spec / run-record** patterns in software delivery, see [AI-SDLC factory × TIED](ai-sdlc-atdd-software-factory-vs-tied.md).
- Process template: [external-service-three-wave-comparison-template.md](../../tied-bundle/docs/external-service-three-wave-comparison-template.md).
