# Session handoff — replacement-discovery-baseline

| Field | Value |
| --- | --- |
| **handoff_kind** | close_out_snapshot |
| **request_token** | — |
| **prompt_type** | non-tied-close |
| **plan_phase** | close-out-ready |
| **date** | 2026-11-18 |

## Plan spine

**PLAN:** [`../PLAN.md`](../PLAN.md)

## Plan execution steps

**Last updated:** 2026-11-18 · **prompt_type:** non-tied-build · **PLAN:** ../PLAN.md

### Required

- [x] `build-runbook-import` — Add `docs/methodologies/replacement-discovery-baseline-runbook.md` (provenance header + verbatim v1.0 body)
- [x] `build-doc-qa` — Satisfy `test-strategy.md` QA checklist
- [x] `build-mutual-links` — PLAN ↔ runbook ↔ related methodology docs

### Optional

- [x] `build-citdp-draft` — `CITDP-replacement-discovery-baseline.yaml` with `tied_tokens_new: []`
- [ ] `build-vocab-record` — `tied-project/vocab/replacement-discovery.md` (RDB, five views, discriminant vs EDPC)
- [x] `non-tied-close` — Scoped git commit when sponsor requests

### Recommendations

- Enrolling RDB as a new PROC vs extending EDPC is a **costly choice**—decide in wave 2 before MCP tools.
- Keep wave 1 free of `REQ-TIED_SELF_REENGINEERING` unless sponsor explicitly opens a TIED lane.
- Promoting the runbook into `tied-bundle/docs/` via `tied-install` is **reversible**; defer until PROC decision.

## Changelog (this REQ)

| Date | prompt_type | Summary |
| --- | --- | --- |
| 2026-11-18 | non-tied-plan | Cursor plan: methodologies-only placement, wave 1/2 split, EDPC/BFIE positioning |
| 2026-11-18 | non-tied-refine | Materialized PLAN, test-strategy, handoff; locked paths, discriminant, phase↔EDPC map, header template |
| 2026-11-18 | non-tied-build | Imported runbook to docs/methodologies/; doc QA pass (12 phases, 12 main sections) |
| 2026-11-18 | non-tied-close | Scoped commit: runbook + plan folder; traceable-commit-evidence |

## Finished this session

- Wave 1 closed: runbook committed under `docs/methodologies/`; plan package under `non-tied-plans/replacement-discovery-baseline/`.

## Do next

Wave 2: `@add-feature` or TIED enrollment per PLAN § Wave 2 entry. Optional vocab `replacement-discovery.md`.

## Constraints

- No project REQ/ARCH/IMPL YAML writes on this track.
- No automatic git commit or push.