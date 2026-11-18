# 09 — Evidence, uncertainties, and questions

| Field | Value |
| --- | --- |
| **Engagement** | `DOC-TIED-RDB-ANALYSIS` |
| **Updated** | 2026-11-18 |
| **Analysis phase** | 0–7 complete; **8–11 deferred** |

Living register for **unknowns that affect critical paths**. Owner must be named; silent gaps on critical paths are **not** allowed at wave 2 exit.

## Critical-path uncertainties

| ID | Statement | Critical path? | Owner | Next action |
| --- | --- | --- | --- | --- |
| GAP-002 | MCP base path binding | Yes (writes) | operator | **Closed** — validate each session (EV-005) |
| GAP-005 | `config.yaml` identity routing | Yes (writes) | agent | Survey `tied-project-config` + document in future DAT pass |
| GAP-006 | WF trial grading vs shell exit | Yes (harness) | sponsor | Read three-way table; REQ-WF_* working items |
| FAIL-001 | Wrong-tree writes | Yes | operator | `tied_config_get_base_path` before MCP writes |
| FAIL-002 | Split signal trials | Yes (harness) | sponsor | Do not use exit 0 alone for close-out |
| CGAP-001 | No CI WF trial matrix | Yes (harness) | sponsor | Accept manual readouts or fund CI matrix |
| CGAP-003 | Consistency not nightly | Yes (DATA) | operator | Run `tied_validate_consistency` before close-out |

## Non-critical / deferred unknowns

| ID | Statement | Owner | Notes |
| --- | --- | --- | --- |
| GAP-001 | Full hook/CI inventory | agent | Partial EV-025; pre-commit hooks unexplained |
| GAP-003 | Human-only contributor ACT | agent | Add ACT-006 only if evidence |
| GAP-004 | MCP tool 1:1 CAP map | agent | Future inventory tooling |
| FAIL-003 | Skipped build-workspace | operator | Documented CON-023 |
| FAIL-004 | Adherence drift | agent | Reconcile before close-out |
| FAIL-005 | Verification waiver gap | agent | LEAP follow-on per readouts |
| FAIL-006 | Jev without dist | operator | build-workspace on store |

Canonical machine list: `registry/gaps.yaml` + `registry/verification.yaml` `characterization_gaps`.

## Open questions for sponsor (analysis exit)

1. Is **manual harness readout review** sufficient for quality gates until CI matrix exists (CGAP-001)?
2. Should **identity routing** (GAP-005) block wave 3 replacement planning until documented?
3. Accept **G-0–G-7 + G-9** as wave 2 analysis complete without phases 8–11 artifacts?

## Draft opportunities (not approved)

See [`opportunities-inbox.md`](opportunities-inbox.md) — banner `not_approved_for_replacement`; inbox empty.

## Replacement phase deferral

Phases **8–11**, artifacts **10–13**, successor REQ, and migration execution remain **out of scope** until a new sponsor gate (parent PLAN).