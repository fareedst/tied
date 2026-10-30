# Plan — standalone CITDP (`citdp-record`)

## Plan

1. Read `tied-bundle/docs/client-development-index.md` for tooling and CITDP paths.
2. Perform CITDP **analysis** (`change-definition`, impact, **`risk-assessment`**, **`test-strategy`**) per `tied-bundle/docs/citdp-policy.md` and `tied-bundle/docs/citdp-record-template.yaml`.
3. During impact discovery, select and record `depth_tier` and `gate_policy`. At **`risk-assessment`**, apply the eligibility table in `docs/integrated-activation-checklist-enforcement-plan.md` §7.
4. Keep `impact_analysis.tied_tokens_new` and `tied_tokens_affected` **empty** unless escalating to `@citdp-promote` or `@add-feature`.
5. **Persist** via MCP **`citdp_record_write`**: basename `CITDP-{change_request_id}.yaml` under `tied-project/citdp/`; prefer `PLAN-*` or `SPIKE-*` ids when no REQ exists yet.
6. Set `leap_feedback.record_status` to `draft` until promotion or full feature close-out.

**Gate:** Do **not** start RED tests or production code in this leaf. Optional advisory `tied_checklist_gate_validate` with `phase: pre_implementation` only when an analysis-only Tracker copy exists.

## Handoff

Return the CITDP path and sponsor next steps:

- **`@citdp-promote`** + filename when V+R+A+I enforcement is desired.
- **`@non-tied-plan`** when implementation must stay off the project stack.
