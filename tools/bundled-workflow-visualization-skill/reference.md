# Workflow visualization reference

Normative section catalog for `@workflow-visualization`. Each included section: **2–4 sentences**, **Derived** vs **Declared**, one diagram.

## Hub document template (`docs/<project>-workflows.md`)

1. Title, product name, stack summary  
2. Comprehension source, baseline revision, evidence tier  
3. **Verification gaps**  
4. Related links (sibling `docs/`, `working/.../evidence/` paths)  
5. **Workflow inventory** (table: name, class, evidence refs, diagram anchor)  
6. Perspective sections (below)  
7. Optional index of satellite files  

## Output packaging

| File | When |
| --- | --- |
| `<project>-workflows.md` | Always (hub) |
| `<project>-workflows-<domain-slug>.md` | ≥2 critical domain paths with full diagrams, or hub > ~400 lines |
| `<project>-integrations.md` | ≥3 distinct external systems / integrators |
| `docs/README.md` | New `docs/` folder |

`hub_only: true` — foundation A1–A4 plus one diagram per inventoried flow (≤3 flows).

## Visualization catalog

### Foundation (A)

| Id | Perspective |
| --- | --- |
| A1 | System context (actors, central host) |
| A2 | Solution / project topology |
| A3 | Layer dependencies |
| A4 | Primary operator / user request path |

### Deployment and structure (B)

| Id | Perspective |
| --- | --- |
| B1 | Deployment / runtime topology |
| B2 | Configuration / feature-flag plane (dashed unless observed) |
| B3 | Source-graph hot path (EDPC C) |
| B4 | Declared vs observed (SCM vs inventory; publish gaps) |

### Behavioral — critical domain (C)

**One section per material workflow** — not a single “critical domain” slot.

- **Critical domain paths** — auth, billing, scheduling, core business, PII/financial handling when evidenced  
- **High-level operator workflows** — charter journeys, admin/support tools  
- **Supporting domain flows** — separate diagrams when integrators depend on them  

### Integration (D)

**Every integration-critical or cross-system workflow** gets its own section (or integrations satellite).

| Id | Perspective |
| --- | --- |
| D1 | External API / service plane (outbound) |
| D2 | External clients / integrators (inbound) |
| D3 | Async / messaging / events |
| D4 | Cross-system choreography |
| D5 | Operating-environment externalities (dashed) |
| D6 | File / EDI / batch interchange |

Do not merge unrelated integrators into one generic diagram.

### Data (E)

| Id | Perspective |
| --- | --- |
| E1 | OLTP / primary persistence |
| E2 | Secondary stores (cache, search, blob) |
| E3 | Reporting / replica path |
| E4 | Data integrity / reconciliation |

### Batch and operations (F)

| Id | Perspective |
| --- | --- |
| F1 | Batch / console / scheduled utilities |
| F2 | Operational failure / degraded modes (EDPC D) |
| F3 | Observation-window ops path (tier-gated) |
| F4 | Change-impact blast radius (EDPC E) |

### Security (G)

| Id | Perspective |
| --- | --- |
| G1 | Security / auth providers |
| G2 | Authorization / session propagation |
| G3 | Trust zones / network boundaries |

### UI and channels (H)

| Id | Perspective |
| --- | --- |
| H1 | Major UI / module areas map |
| H2 | Multi-channel delivery |

### Comprehension meta (I)

Optional after full EDPC — link to artifacts; no long queue/ledger tables.

| Id | Perspective |
| --- | --- |
| I1 | EDPC choreography (A–G/H process) |
| I2 | Evidence tier / proof boundary |
| I3 | Claims-to-view traceability |
| I4 | Open questions / evidence gaps from queues |

## Selection algorithm

1. Fill workflow inventory from comprehension inputs.  
2. **Must:** integration flows (D*), critical domain flows (C), A4.  
3. **Should:** remaining charter journeys, F1 batch paths when listed.  
4. **May omit** B2, E3, I* with one-line “not evidenced” in hub.  
5. **Never** merge unrelated domains or integrators to reduce diagram count.
