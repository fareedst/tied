# 06 — Quality, operations, security

| Field | Value |
| --- | --- |
| **Engagement** | `DOC-TIED-RDB-ANALYSIS` |
| **RDB phase** | 6 (slice 6) |
| **Completed** | 2026-11-18 |
| **Revision** | `c8353309` |

## Quality mechanisms (canonical: `registry/quality.yaml`)

| ID | Mechanism | Targets |
| --- | --- | --- |
| QUA-001 | `mcp-server` `npm test` | MCP/validation stack |
| QUA-002 | `tied_validate_consistency` | Index/detail traceability |
| QUA-003 | WF trial `tied_gate_check` receipts | Harness close-out honesty |
| QUA-004 | `lint_yaml` edit loop | Project YAML mutations |
| QUA-005 | Windows bootstrap CI smoke | Cross-platform install |

## Harness and trials (as-operated)

| Source | Role |
| --- | --- |
| `docs/agent-harness-evaluation/readouts/` | Published trial readouts (WF-01, WF-09, …) |
| `workflow_trial_agentstream` | Disposable cells with cataloged prompts/models |
| `mcp-server/packages/harness-eval` | HMEP import, metrics, billing ledger (optional) |
| Facilitator replay | Post-trial test re-run on store (evidence-grade) |

**Grading discipline:** Treat **orchestrator exit code**, **machine gate receipts**, and **process contract** as **three separate signals** (FAIL-002). A green shell exit does not imply close-out authorization.

## Top operational risks (`registry/failures.yaml`)

| ID | Risk | Severity |
| --- | --- | --- |
| FAIL-001 | Wrong `TIED_BASE_PATH` / multi-root writes | critical |
| FAIL-002 | Agentstream pass + blocked verification/close_out | major |
| FAIL-003 | Skipped `build-workspace` before install | major |
| FAIL-004 | Adherence hash drift after gates | major |
| FAIL-005 | Minimal-profile adversarial waiver at verification | major |
| FAIL-006 | Jev harness enabled without store dist | major |

Registries also track open **GAP-*** items (analysis uncertainties).

## Gate G-6

| Criterion | Met |
| --- | --- |
| ≥5 FAIL or GAP for top operational risks | Yes — FAIL-001–006 (+ existing GAP-001–005) |

## Operations (routine)

| Activity | Owner | Notes |
| --- | --- | --- |
| Store workspace build | Operator | Before install or harness with Jev |
| Client refresh | Operator | `--refresh` methodology only |
| Session base-path check | Agent | EV-005 pattern |
| Trial cohort review | Sponsor | Readouts + gate JSON where present |
| Analysis engagements | Agent | DOC lane — no `tied_verify` update |

## Security and safety (analysis scope)

| Control | Status |
| --- | --- |
| Read-only discovery on product code | Observed — charter slice 0 |
| No credential harvest in RDB artifacts | Observed — no secrets in working tree |
| BFIE `report_only` | No `approved` promotions this wave |
| Harness Jev `Shell` guard | Fail-closed when enabled (FAIL-006) |
| MCP write isolation | CON-003, project indexes only |

Deeper threat modeling and production security posture are **out of scope** for wave 2 analysis (not a deployed multi-tenant service).

## Related artifact

Failure history and methodology responses: [`07-failure-risk-and-historical-decisions.md`](07-failure-risk-and-historical-decisions.md).