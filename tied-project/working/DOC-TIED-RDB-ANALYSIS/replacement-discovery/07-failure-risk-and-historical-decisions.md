# 07 — Failure, risk, and historical decisions

| Field | Value |
| --- | --- |
| **Engagement** | `DOC-TIED-RDB-ANALYSIS` |
| **RDB phase** | 6 (slice 6) |
| **Completed** | 2026-11-18 |

## Historical decisions (observed, not replacement authorization)

| Theme | Evidence | Analysis note |
| --- | --- | --- |
| Two-folder layout | `tied-bundle/` vs `tied-project/` | Core mitigation for methodology refresh without clobbering client data (DAT slice 4) |
| MCP-first YAML | AGENTS.md, tied-yaml skill | Reduces invalid hand-edited index corruption |
| Agentstream preflight chain | agentstream README | Composes checks without replacing MCP write authority (CON-010) |
| WF trial disposable gates | CITDP disposable gate alignment working folders | Addresses split-signal and receipt hydration (FAIL-002) |
| Wrong-base-path class | CITDP two-folder, feedback.yaml narratives | Motivates `tied_config_get_base_path` + client feedback capture REQ threads |

No new **DEC-*** replacement decisions are recorded in this engagement (phases 8–11 deferred).

## Risk register (links)

| ID | Type | Owner |
| --- | --- | --- |
| FAIL-001–006 | Observed failure modes | `registry/failures.yaml` |
| GAP-001–006 | Open analysis gaps | `registry/gaps.yaml` |

### GAP-006 (new)

| Field | Value |
| --- | --- |
| **Statement** | WF trial grading (SC-DCR-06) and gate receipt file presence still evolve across cohorts |
| **Impact** | Sponsor mis-reads “success” from shell exit alone |
| **Mitigation path** | Continue harness readouts + REQ-WF_* working evidence; not closed in analysis wave |

## Cohort pointers (harness)

| Readout | Lesson for RDB |
| --- | --- |
| WF-01 @ 1794975372 | Interleaved four-phase complete; machine close_out **fail** |
| WF-01 @ 1794981051 | Verification/close_out blocked; waiver propagation open (FAIL-005) |
| WF-01 @ 1795017442 | Gates green; adherence hash drift (FAIL-004) |
| WF-09 @ 1795021618 | Verification pass; tier B close_out without receipt file |

Paths under `docs/agent-harness-evaluation/readouts/` (EV-027).