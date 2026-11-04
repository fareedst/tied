# TIED-client-local boundary (non-tied-*)

Development inside a TIED client repository that intentionally remains **outside** full TIED V+R+A+I synchronization.

## Non-tied plan track (sequence)

**Leaves:** `non-tied-plan`, `non-tied-refine`, `non-tied-build`, `non-tied-close` ([prompt-execution-mode.md](prompt-execution-mode.md)).

**Artifact root:** `tied-project/non-tied-plans/{slug}/` (`PLAN.md`, optional `CITDP-*.yaml` with **`tied_tokens_new: []`**, `test-strategy.md`).

### Allowed (plan track)

- Read TIED/YAML for context
- Writes under `tied-project/non-tied-plans/{slug}/`
- CITDP analysis in that folder (not promotion to V+R+A+I without `@citdp-promote` or TIED lane)
- **RECORD** in `tied-project/vocab/` during plan/build track
- Product source/tests in **agent** leaves (`non-tied-build`, `non-tied-close`)

### Forbidden (plan track)

- Project REQ/ARCH/IMPL indexes and detail YAML, IMPL pseudo-code sidecars
- `tied-project/citdp/CITDP-*.yaml` canonical persist (use plan-folder draft only)
- TIED checklist **Tracker** under `tied-project/working/{REQ}/` for this sequence
- `tied_verify` with update; LEAP proposal mutators

## Legacy monolithic (`non-tied-debug`)

`non-tied-debug` keeps the prior boundary: read TIED context; change product code; **no** TIED sync writes and **no** vocab RECORD into `tied-project/vocab/` per [non-tied-plan.md](non-tied-plan.md) implement note.

### Forbidden — TIED synchronization (all non-tied except plan-track vocab/CITDP above)

- Writing or updating project TIED YAML indexes and detail files
- Editing IMPL pseudo-code sidecars
- Invoking mutating verification (`tied_verify` with update)
- Copying per-task **Tracker** for TIED checklist execution (plan track)

## Not a fallback

Presence of a `tied/` tree does **not** upgrade a `non-tied-*` request to full TIED tracking. Choose `add-feature` / `build-plan` explicitly.

## CITDP without V+R+A+I

Standalone retrospective: **`citdp-record`** ([citdp-only-boundary.md](citdp-only-boundary.md)). The four-step non-tied sequence uses `non-tied-plans/` instead.
