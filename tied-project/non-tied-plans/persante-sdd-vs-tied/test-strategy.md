# Test strategy — Persante SDD × TIED comparison docs (non-code)

Manual checks before `@non-tied-close` or treating the work as complete.

## Fidelity to Persante sources

- [ ] Every phase skill name and ordering matches the external skills (`persante-spec` → `persante-solution` → `persante-align` → `persante-implement` → `persante-validate` → `persante-triage` → `persante-ship`) and [artifact-contract.md](file:///Users/fareed/Documents/persante/repos/ticketing-platform/.claude/skills/persante-sdd-workflow/references/artifact-contract.md).
- [ ] Numeric caps stated correctly: **alignment attempts ≤ 5**; **review repair cycles ≤ 5**; final independent review called out where ship skill requires it.
- [ ] **Ship** behavior: opens/updates PR, runs `verify-pr`, **does not merge**; Bitbucket/API/credential details match skill text.
- [ ] Infra skills (`persante-deploy`, `persante-whatif-review`, `persante-naming-lint`) described as **adjuncts**, not as the main SDD loop.
- [ ] Fork lineage note present if the summary cites `persante-sdd-workflow` (Michael Duddy fork at stated commit per that SKILL.md).

## Fidelity to TIED (this repo)

- [ ] Anchors cite real paths: [AGENTS.md](../../AGENTS.md), [tied-bundle/docs/processes.md](../../../tied-bundle/docs/processes.md), [tied-bundle/docs/LEAP.md](../../../tied-bundle/docs/LEAP.md) as appropriate; no fabricated MCP tool names.
- [ ] **[PROC-LEAP]**, **[PROC-TIED_DEV_CYCLE]**, **IMPL `essence_pseudocode`**, **REQ/ARCH/IMPL** used in the comparison without claiming feature parity.
- [ ] Disposition key defined (Align | Composable | Tension | Gap | Defer) and used consistently in the phase matrix.

## Style and repo conventions

- [ ] Matches sibling comparisons: top metadata table, executive summary, tables, optional mermaid (valid syntax: no spaces in node IDs).
- [ ] In-repo links use **full repository-relative paths** (e.g. `docs/comparisons/...`, `tied-bundle/docs/...`).
- [ ] External Persante path labeled explicitly as **developer machine** or **external clone** so CI/docs readers are not misled.
- [ ] No emojis; analysis-only disclaimer (**does not mint** REQ/ARCH/IMPL) in metadata.

## Non-tied boundary

- [ ] No edits under `tied-project/requirements*`, `architecture-decisions*`, `implementation-decisions*`, or IMPL pseudo-code sidecars from this plan track unless sponsor promotes to full TIED lane.
- [ ] Optional matrix row in [methodology-composition-matrix.md](../../../docs/comparisons/methodology-composition-matrix.md) only if included in build scope.

## Security / misrepresentation

- [ ] No claim that TIED ships Bitbucket `verify-pr`, Persante `workflow.py`, or Azure deploy scripts.
- [ ] No claim of methodology superiority; **compose-don’t-replace** stance preserved.
