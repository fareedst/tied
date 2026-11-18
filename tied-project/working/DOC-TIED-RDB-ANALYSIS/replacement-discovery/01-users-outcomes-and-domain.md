# 01 — Users, outcomes, and domain

| Field | Value |
| --- | --- |
| **Engagement** | `DOC-TIED-RDB-ANALYSIS` |
| **RDB phase** | 1 — purpose and user value |
| **Completed** | 2026-11-18 |
| **Evidence revision** | `c8353309` |
| **BFIE mode** | `report_only` — dispositions `observed` / `unresolved` only |

## Domain (analysis lens)

TIED is a **methodology platform**: it packages process guidance, declarative obligation indexes, agent operating rules, and automation surfaces so software teams (and coding agents) can deliver changes with traceability and validation. The **store** repository (`stdd`) is the authoritative implementation of that platform; **client** repositories consume an installed copy and hold project-specific declarations and committed working evidence.

This slice states **who** benefits and **what outcomes** they need—without naming implementation modules. Mechanisms are deferred to slices 3–7 (CAP, CON, topology).

## Actor registry (canonical: `registry/actors.yaml`)

| ID | Actor | Role | Primary problems |
| --- | --- | --- | --- |
| **ACT-001** | Sponsor | Program authority | Evidence before replacement; controlled scope |
| **ACT-002** | Client operator | Methodology in product repos | Safe install/refresh; no corpus clobber |
| **ACT-003** | Coding agent | Obligation-driven delivery | Traceable work; bounded writes |
| **ACT-004** | MCP / tool consumer | IDE, CLI, harness automation | Stable read/update at boundary |
| **ACT-005** | Methodology implementer | Store maintainer | Evolve shared package; prove behavior |

### Actor → outcome map

```text
ACT-001 ── OUT-001, OUT-005, OUT-007
ACT-002 ── OUT-002, OUT-004
ACT-003 ── OUT-001, OUT-004, OUT-006
ACT-004 ── OUT-003, OUT-004, OUT-007
ACT-005 ── OUT-003, OUT-005, OUT-006
```

## Outcome registry (canonical: `registry/outcomes.yaml`)

| ID | Outcome (technology-agnostic) | Criticality |
| --- | --- | --- |
| **OUT-001** | End-to-end traceability from sponsor intent through obligations, decisions, implementation records, and tests | critical |
| **OUT-002** | Predictable client adoption with separated inherited guidance vs project-owned records | critical |
| **OUT-003** | Validatable consistency among declaration indexes and detail artifacts | critical |
| **OUT-004** | Bounded automated write authority per session and repository region | critical |
| **OUT-005** | Evidence-backed comprehension before major redesign or replacement | major |
| **OUT-006** | Unified ordered delivery procedure (analysis → docs → tests → verification) | major |
| **OUT-007** | Stable external tool contracts at the automation boundary | major |

## Value streams (abbreviated)

### Stream A — Sponsor governs change

1. Sponsor frames intent and gates (including deferral of replacement).
2. Agents and implementers produce traceable artifacts and validation receipts.
3. Sponsor reviews comprehension and gate evidence before costly lanes (OUT-001, OUT-005).

### Stream B — Client adopts methodology

1. Operator installs linked or full methodology layout into a product repo.
2. Session bootstrap confirms write targets vs read-only inherited corpus.
3. Operators refresh methodology without losing project indexes (OUT-002, OUT-004).

### Stream C — Automated assistance at scale

1. Tool consumer discovers supported read/validate/update operations.
2. Agent follows checklist ordering and records evidence.
3. Consistency checks run before close-out (OUT-003, OUT-006, OUT-007).

## Representative journeys (narrative, not UI)

| Journey | Actor | Happy path | Failure signal |
| --- | --- | --- | --- |
| **Authorize analysis-only engagement** | ACT-001 | Charter + deferral recorded; agents write only under working DOC path | Replacement scope appears in deliverables without gate |
| **Onboard new client repo** | ACT-002 | Install produces expected two-region layout; bootstrap docs readable | Project YAML overwritten on refresh |
| **Close a REQ-scoped change** | ACT-003 | Checklist steps yield tests + updated declarations + validation pass | Declared status treated as verified without receipt |
| **Harness trial against store** | ACT-004 | Tools resolve correct base path; read-only survey succeeds | Writes land in wrong clone or parent repo |

## Domain vocabulary (pointers)

| Term | Where defined |
| --- | --- |
| Methodology vs project data | CON-002 · AGENTS.md · slice 1 |
| DOC working lane | CON-001 · non-tied boundary skill |
| Verification vs declared status | DOC-STDD-TIED-PROJECT-BROWNFIELD corpus map (compose) |
| RDB analysis vs replacement | CON-005 · parent PLAN |

New glossaries remain optional (`build-vocab-record`); this slice references existing vocabulary rather than minting REQ tokens.

## BFIE matrix (report_only)

| Claim cluster | Disposition | Notes |
| --- | --- | --- |
| Actors above serve real store/client roles | observed | Charter beneficiaries + parent slice 2 starters |
| Outcomes OUT-001–007 reflect declared agent/operator intent | observed | Grounded in AGENTS.md principles and install/MCP boundaries (EV-007) |
| OUT criticality tiers | unresolved | Full criticality calibration awaits CAP/WF slice 3 |
| Undocumented persona (e.g. casual contributor without agent) | unresolved | GAP-003 — optional ACT-006 in later slice if evidence appears |

## Gate G-1

| Criterion | Met |
| --- | --- |
| ≥3 **ACT** records | Yes — 5 (`registry/actors.yaml`) |
| ≥5 **OUT** records, technology-agnostic wording | Yes — 7 (`registry/outcomes.yaml`) |
| Outcomes avoid implementation names | Yes — no class/service/framework names in OUT statements |
| Phase 1 report published | [phase-1-report.md](../evidence/phase-1-report.md) |

## Evidence

| ID | Role |
| --- | --- |
| EV-007 | AGENTS.md + ai-principles user-value statements |
| EV-008 | tied-install / bootstrap README operator intent (skim) |

See [registry/evidence.yaml](./registry/evidence.yaml).