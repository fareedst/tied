# CITDP-only boundary (`citdp-record`)

`citdp-record` is a **CITDP-only** workflow: partial TIED synchronization limited to change records and working evidence. It is **not** TIED-client-local (`non-tied-*`) and **not** full TIED (`add-feature`, `citdp-promote`).

## Allowed

- Read merged TIED indexes, IMPL pseudo-code, existing CITDP records, and vocabulary glossaries (RESOLVE/PRELOAD; no RECORD)
- **`citdp_record_write`** under `tied-project/citdp/CITDP-*.yaml`
- Working-folder evidence under `tied-project/working/{change_request_id}/`
- Optional **analysis-only** Tracker copy limited to checklist slugs: `change-definition`, `impact-discovery`, `risk-assessment`, `test-strategy`, `persist-citdp-record` (not a full implement-phase Tracker)

## Forbidden — project stack writes

- Writing or updating project TIED YAML indexes or detail files (`requirements.yaml`, `architecture-decisions.yaml`, `implementation-decisions.yaml`, `semantic-tokens.yaml`)
- Editing IMPL pseudo-code sidecars (`IMPL-*-pseudocode.md`)
- `tied_token_create_with_detail` and other new REQ/ARCH/IMPL token creation
- Invoking mutating verification (`tied_verify` with update)
- Creating or editing LEAP proposals (`leap-proposals/`, `tied_leap_proposal_*`)
- Recording vocabulary in `tied-project/vocab/` (RECORD touchpoint)

## Invariants

- `impact_analysis.tied_tokens_new` and `tied_tokens_affected` remain **empty** for `@citdp-record` unless the sponsor explicitly escalates to `@citdp-promote` or `@add-feature` in the same session.
- `change_definition.non_goals` must include that this pass creates **no** new project REQ/ARCH/IMPL tokens.
- **Retrospective** passes must cite diff summary, paths, or session evidence in the CITDP; do not invent tokens from narrative alone.

## Pairing

- Need **code/tests without tokens** → `@non-tied-plan` (does not write CITDP).
- Need **CITDP without tokens** → `@citdp-record`.
- Need **enforcement from an existing CITDP** → `@citdp-promote` with a named file.
