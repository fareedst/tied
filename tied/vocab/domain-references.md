# Domain vocabulary index (canonical)

**Scope:** Single-page directory for all domain vocabulary glossaries under `tied/vocab/`. Lists priority, scope, and cross-topic notes. This page is an **index only** — canonical terms live in the linked sibling files. Algorithms and step-by-step behavior stay in `tied/implementation-decisions/*-pseudocode.md`.

**Checklist path:** [`../docs/agent-req-implementation-checklist.yaml`](../docs/agent-req-implementation-checklist.yaml) sets `VOCAB_INDEX: ./tied/vocab`. Agents **CALL** `sub-vocabulary-sync` (RESOLVE before naming/writing; RECORD when concepts are generated or artifacts change) per [`../docs/processes.md`](../docs/processes.md) § `[PROC-VOCABULARY_INDEX]`.

**Standards:** [`../../docs/vocabulary-index-analysis-and-standards.md`](../../docs/vocabulary-index-analysis-and-standards.md).

**See also:** [`tied-methodology.md`](tied-methodology.md) · [`tied-yaml-mcp.md`](tied-yaml-mcp.md) · [`feedback-to-tied.md`](feedback-to-tied.md) · [`leap-proposal-queue.md`](leap-proposal-queue.md) · [`agentstream.md`](agentstream.md) · [`agent-stream-ruby.md`](agent-stream-ruby.md) · [`pseudocode-and-citdp.md`](pseudocode-and-citdp.md) · [`config-discovery.md`](config-discovery.md)

---

## Canonical glossaries

| Priority | Document | Scope |
|----------|----------|-------|
| 0 | [`domain-references.md`](domain-references.md) | This index |
| 1 | [`tied-methodology.md`](tied-methodology.md) | TIED layout, semantic tokens, module validation, bootstrap, methodology vs project YAML, PROC-* process names |
| 2 | [`tied-yaml-mcp.md`](tied-yaml-mcp.md) | TIED YAML MCP server, `tied-cli`, bundled skill, validation/verify/cycles/backlog/scoped analysis |
| 2b | [`feedback-to-tied.md`](feedback-to-tied.md) | Upstream feedback artifact (`feedback.yaml`) and MCP export |
| 3 | [`leap-proposal-queue.md`](leap-proposal-queue.md) | Non-canonical LEAP proposals, audit, diff/session import |
| 4 | [`agentstream.md`](agentstream.md) | Go `agentstream` CLI: pipeline, turns, checklist render, executor, HTML format, MCP preflight |
| 4b | [`agent-stream-ruby.md`](agent-stream-ruby.md) | Ruby ATDD runner parity with Go |
| 5 | [`pseudocode-and-citdp.md`](pseudocode-and-citdp.md) | Domain vocab vs IMPL grammar; three-way alignment; CITDP record naming |
| — | [`config-discovery.md`](config-discovery.md) | Planned layered YAML config (stub; `(proposed)` terms) |

---

## Authoring guides (not glossaries)

| Document | Role |
|----------|------|
| [`../../docs/vocabulary-index-analysis-and-standards.md`](../../docs/vocabulary-index-analysis-and-standards.md) | Meta-standard for glossary structure and TIED integration |
| [`../docs/pseudocode-writing-and-validation.md`](../docs/pseudocode-writing-and-validation.md) | IMPL pseudo-code lifecycle (not domain term registry) |
| [`../docs/implementation-decisions.md`](../docs/implementation-decisions.md) | IMPL grammar vocabulary (INPUT/OUTPUT/DATA) — distinct from domain vocab |

---

## Cross-topic notes

- **STDD / TIED repository layout:** canonical domain glossaries live at `tied/vocab/<topic>.md` (no `-vocabulary` filename suffix). Meta-standard: [`../../docs/vocabulary-index-analysis-and-standards.md`](../../docs/vocabulary-index-analysis-and-standards.md) § STDD convention. Other TIED client repos may use `docs/*-vocabulary.md` per the replication prompt; this repo uses `tied/vocab/`.
- **agentstream** (Go product/CLI name) vs **agent-stream** (Ruby directory/package) vs **run-feature-batch** driver scripts — define once in [`agentstream.md`](agentstream.md) and [`agent-stream-ruby.md`](agent-stream-ruby.md); link from both.
- **Domain vocabulary** (this tree) vs **IMPL grammar vocabulary** (INPUT/OUTPUT/DATA keywords) — define once in [`pseudocode-and-citdp.md`](pseudocode-and-citdp.md).
- **TIED base path** / **project YAML** vs **methodology YAML** — define once in [`tied-methodology.md`](tied-methodology.md); referenced from [`tied-yaml-mcp.md`](tied-yaml-mcp.md).
- **Non-canonical LEAP proposals** (`leap-proposals/`) never mutate project TIED YAML — see [`leap-proposal-queue.md`](leap-proposal-queue.md).

---

## Alphabetical index

| Term | Section |
|------|---------|
| agent-stream | Cross-topic notes |
| agentstream | Cross-topic notes |
| Domain vocabulary index | Title |
| IMPL grammar vocabulary | Authoring guides |
| sub-vocabulary-sync | Scope |
| VOCAB_INDEX | Scope |
