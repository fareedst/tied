# Test strategy — Slice D (Workflow D prod ops)

**Authority:** [CITDP-slice-d-workflow-d.yaml](./CITDP-slice-d-workflow-d.yaml) · **depth_tier:** `integrated` · **gate_policy:** `advisory`

## Module matrix

| Module | IMPL token | RED focus |
| --- | --- | --- |
| Failure state validate | `IMPL-TIED_EDPC_FAILURE_OPS` | Invalid classification enum; missing observation window; `critical_outcome` without row or `blind_spot` gap; Observed health with `production_touch: none` and prod-only evidence source; empty evidence_ids on `healthy_within_observed_scope` |
| Failure state build | `IMPL-TIED_EDPC_FAILURE_OPS` | Produces bundle index; attaches to SCM `receipt_refs`; stable JSON sort |
| Workflow router | `IMPL-TIED_EDPC_ORCHESTRATION` | `operational_health` → B,D,F; `billing_processor_health` → A,B,D,C,F; `resource_cost` → B,D,E,F; strip D on `source_static` |
| Publish builder | `IMPL-TIED_EDPC_PUBLISH` | `ofsm:` / `health:` gaps when bundle missing or outcomes uncovered; no `summary_healthy: true` without evidence |

**Fixtures:** `mcp-server/test/fixtures/edpc/ofsm/` — minimal charter with `critical_outcomes`, valid/invalid snapshots, tier matrices.

## Composition

1. Register two new MCP tools alongside existing four EDPC tools.  
2. Fixture chain: access_validate → failure_state_validate → failure_state_build → publish_build with OFSM ref.

## Regression

```bash
npm test --prefix mcp-server -- src/edpc
npm run lint:ts --prefix mcp-server
```

## Dogfood (D-lite)

- **Tier:** `toolchain_readonly` · **production_touch:** `none`  
- **Workflows:** B (existing receipts) → **D** (history from git + local `npm test` as Observed for dev toolchain only) → F  
- **Forbidden claims:** production billing health, SLO compliance, “all green” summary  
- **Evidence doc:** `evidence/slice-d-dogfood-d-lite.md` (build-plan)

## Pseudo-code gate

Layer C `pseudocode_validate` with `gate_mode: true` on:

- `tied-project/implementation-decisions/IMPL-TIED_EDPC_FAILURE_OPS-pseudocode.md` (new)

Before first RED in `failure-state-*.ts`.

## Integrated inquiry

New identity-bound `run_id` (e.g. `edpc-slice-d-pre-impl-YYYYMMDD`) before Slice D1 RED — v1 `edpc-closeout-20261019` does not cover failure-state MCP.
