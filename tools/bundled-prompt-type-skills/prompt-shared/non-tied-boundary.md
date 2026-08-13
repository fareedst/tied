# TIED-client-local boundary (non-tied-plan / non-tied-debug)

`non-tied-plan` and `non-tied-debug` are **TIED-client-local** workflows: development inside a TIED client repository that intentionally remains **outside** the TIED database and synchronization stack.

## Allowed

- Read TIED/YAML indexes, IMPL pseudo-code, CITDP records, and vocabulary glossaries for **domain understanding**
- Inspect and change ordinary project source, tests, and tooling when the caller authorizes
- Ordinary development test strategy and RED-before-code TDD

## Forbidden — TIED synchronization writes

- Writing or updating project TIED YAML (`tied/requirements.yaml`, `tied/architecture-decisions.yaml`, `tied/implementation-decisions.yaml`, `tied/semantic-tokens.yaml`, detail files)
- Editing IMPL pseudo-code sidecars (`IMPL-*-pseudocode.md`)
- Creating or editing `tied/citdp/CITDP-*.yaml`
- Recording vocabulary in `tied/vocab/` (RECORD touchpoint)
- Creating or editing LEAP proposals (`leap-proposals/`, `tied_leap_proposal_*`)
- Invoking mutating verification (`tied_verify` with update) or other TIED synchronization that changes tracked state
- Copying per-task **Tracker** files for TIED checklist execution

## Not a fallback

Presence of a `tied/` tree does **not** upgrade a `non-tied-*` request to full TIED tracking. The caller must explicitly choose a TIED prompt type instead.
