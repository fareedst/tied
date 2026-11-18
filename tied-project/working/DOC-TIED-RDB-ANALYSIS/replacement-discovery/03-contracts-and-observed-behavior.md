# 03 — Contracts and observed behavior

| Field | Value |
| --- | --- |
| **Engagement** | `DOC-TIED-RDB-ANALYSIS` |
| **RDB phase** | 3 (slice 3 starter set) |
| **Completed** | 2026-11-18 (partial — slice 4 deepens intended vs observed) |
| **Canonical registry** | `registry/contracts.yaml` |

## Slice 3 contribution

Extended **CON-001–015** with `intended` / `observed` split where operator contracts are documented in prose and enforced via tooling. Full per-workflow behavior comparison remains slice 4.

| Band | IDs | Theme |
| --- | --- | --- |
| Governance (slice 1) | CON-001–005 | DOC lane, layout, MCP writes, bootstrap, runbook scope |
| Operator surfaces (slice 3) | CON-006–015 | Checklist order, prompt types, install default, batch rollback, agentstream seam, pseudocode gate, vocabulary, verify defaults, harness trials, YAML lint |

## Gate G-3 (interim)

| Criterion | Status |
| --- | --- |
| ≥15 **CON** with status | **Met** — 15 records, all `observed` |
| Intended vs observed split where docs/code may disagree | Started — CON-006–015 carry intended/observed fields; deeper diffs in slice 4 |

See [phase-3-report.md](../evidence/phase-3-report.md).