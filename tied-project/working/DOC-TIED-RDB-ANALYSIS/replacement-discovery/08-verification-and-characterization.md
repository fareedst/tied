# 08 — Verification and characterization

| Field | Value |
| --- | --- |
| **Engagement** | `DOC-TIED-RDB-ANALYSIS` |
| **RDB phase** | 7 (slice 7) |
| **Completed** | 2026-11-18 |
| **Revision** | `c8353309` |

## Verification registry

Canonical: `registry/verification.yaml` (**VER-001–015**).

### CAP → verification map (critical paths)

| CAP | VER anchors | Characterization gap |
| --- | --- | --- |
| CAP-001 Checklist | VER-001 | CGAP-002 (live adherence) |
| CAP-002 Install | VER-002, VER-015 | — |
| CAP-003 MCP read | VER-003, VER-009 | — |
| CAP-004 MCP write | VER-004, VER-005, VER-014 | — |
| CAP-005 Consistency | VER-008 | CGAP-003 |
| CAP-006 Prompt-type | VER-011 | — |
| CAP-007 Agentstream | VER-010 | — |
| CAP-008 Harness trial | VER-013 + readouts EV-027 | CGAP-001 |
| CAP-009 Pseudocode | VER-006 | — |
| CAP-010 tied_verify | VER-007 | — |
| CAP-011 Refresh | VER-002 (install paths) | — |
| CAP-012 tied-cli | VER-012 | — |

## Primary automated entry points

| Entry | Scope |
| --- | --- |
| `cd mcp-server && npm test` | Build + `run-mcp-tests.mjs` — all `*.test.ts` under `src/`, `packages/*/src/` |
| `scripts/lint_yaml.sh` | Changed TIED YAML (project edit loop) |
| `tied_validate_consistency` | MCP tool — merged corpus consistency (operator) |
| GitHub workflows | Bootstrap smoke + observability receipt (EV-025) |

`run-mcp-tests.mjs` strips inherited `TIED_BASE_PATH` from IDE env so tests use fixtures (EV-030).

## Characterization strategy (analysis)

| Layer | What it proves | Limit |
| --- | --- | --- |
| Unit (yaml-loader, verify, updates) | Merge/write contracts CON-003/016/009 | Not full IDE UX |
| E2E (bootstrap-and-load) | Install produces expected layout | One factory pattern |
| Agentstream unit | Dry-run/oracle fixtures | Not live Cursor/Claude unless operator |
| Harness readouts | Real cohort behavior FAIL-002 | Not regression-gated in CI |

## Gate G-7

| Criterion | Met |
| --- | --- |
| VER per critical CAP | Yes — each CAP-001–012 has ≥1 VER |
| Gaps named | Yes — CGAP-001–003 in registry |

## Phase report

[phase-7-report.md](../evidence/phase-7-report.md)