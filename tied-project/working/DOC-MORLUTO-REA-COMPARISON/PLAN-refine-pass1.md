# morluto/rea × TIED — refined plan (pass 1)

| Field | Value |
| --- | --- |
| **Working token** | `DOC-MORLUTO-REA-COMPARISON` (outreach doc bundle; **no REQ mint**) |
| **Refined** | 2026-11-08 |
| **Source** | [morluto/rea](https://github.com/morluto/rea) — **target-repo-observed** via GitHub raw docs during stdd authoring |
| **Process** | [external-service-three-wave-comparison-template.md](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md) — **Wave 1 + Wave 2** |
| **Tracker** | [checklist-tracker-refine.yaml](./checklist-tracker-refine.yaml) |
| **Phase × wave handoff** | [multi-step-phase-wave-handoff.md](./multi-step-phase-wave-handoff.md) |
| **Sibling pattern** | [Open Ontologies × TIED](../../../docs/comparisons/open-ontologies-repository-vs-tied-agent-management.md) (large external MCP); [Traefik × TIED](../../../docs/comparisons/traefik-harness-platform-vs-tied-agent-management.md) (harness/platform seam); [Google agent skills × TIED](../../../docs/comparisons/google-agent-skills-vs-tied-agent-management.md) (skill distribution) |

---

## Refine (Touchpoint 1 — RESOLVE)

**PRELOAD (session):** [quality-assurance.md](../../../tied-project/vocab/quality-assurance.md), [sponsor-agent-relationship.md](../../../tied-project/vocab/sponsor-agent-relationship.md), [prompt-composer.md](../../../tied-project/vocab/prompt-composer.md), [tied-yaml-mcp.md](../../../tied-project/vocab/tied-yaml-mcp.md).

| REA / target term | TIED canonical term | Layer | Notes |
| --- | --- | --- | --- |
| **Evidence** record (limitations, unknowns) | Gate receipts, claims-evidence review, proof boundary | Evidence | **Align** discipline — different artifact |
| **rea-agents setup** (MCP + skills) | `tied-install.sh`, bundled prompt-type skills | Harness | **Tension** — both mutate IDE config; different authority |
| **reverse-engineer-anything** skill | `@external-service-comparison`, domain skills | Harness | **Composable** |
| Large RE MCP tool catalog | TIED YAML MCP + `TIED_BASE_PATH` seam | Platform | **Composable** — dual MCP client repos |
| Ghidra/Hopper/IDA native providers | — | **Defer** | Sponsor RE toolchain |
| Investigation → implement in **your** repo | CITDP, TDD, LEAP | Process | **Composable** downstream |
| Skip REA for ordinary source-repo analysis | Brownfield vs greenfield intent | Process | **Align** with Trail-Code pre-read spirit |
| Compact MCP input/output schema profiles | Agentstream context, tool surface size | Harness | **Composable** |
| RL environments / AgentEnv bundles | — | **Defer** | Out of TIED core |

**Consequence ladder:** Wave 1+2 + allowlist = **reversible**; matrix row + Wave 3 REQ = **Defer**.

**Distinct from Open Ontologies:** RDF plan/apply and Lean certs; REA owns **binary/JS/.NET/WEB reverse engineering** MCP.

---

## Implement (execution order)

### Phase 0 — Git allowlist

Add `!docs/comparisons/morluto-rea-*.md` lines to root `.gitignore`.

### Phase 1 — Wave 1 capture

Create [docs/comparisons/morluto-rea-reverse-engineering.md](../../../docs/comparisons/morluto-rea-reverse-engineering.md).

### Phase 2 — Wave 2 analysis

Create [docs/comparisons/morluto-rea-reverse-engineering-vs-tied-agent-management.md](../../../docs/comparisons/morluto-rea-reverse-engineering-vs-tied-agent-management.md) — 14 template sections.

### Phase 3 — Verification

See [evidence/build-plan-handoff.md](./evidence/build-plan-handoff.md).

**Skip:** `tied_validate_consistency` (no project YAML). **Skip:** `npx rea-agents setup`, target tests, vendor MCP in stdd.

---

## Wave 3 handoff

Default **Defer** for matrix §2 row, vocab RECORD, bundling REA in stdd. See [multi-step-phase-wave-handoff.md](./multi-step-phase-wave-handoff.md).
