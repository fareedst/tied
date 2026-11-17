# Visual encoding — semantic domains (STDD / TIED store)

**Scope:** Project-wide **semantic domain** ids (`dom.*`) and color literals for diagrams, tables, charts, and docs in the TIED methodology repository.

**Plan:** [stdd-vocab-visual-encoding PLAN](../non-tied-plans/stdd-vocab-visual-encoding/PLAN.md)

**Term index:** [term-domain-color-index.md](term-domain-color-index.md)

**Machine palette:** [visual-encoding-domains.v1.yaml](visual-encoding-domains.v1.yaml)

**Docs hub:** [visual-encoding-standards.md](../../docs/visual-encoding-standards.md)

**Methodology:** [@informative-color-coding](../../.cursor/skills/informative-color-coding/SKILL.md)

---

## Encoding sheet

**Audience:** Methodology authors, comparison-doc writers, workflow-visualization users, and agent operators diagramming TIED surfaces.

**Patterns to distinguish:** TIED YAML corpus & MCP, agent execution surfaces, harness benchmarking, evidence/assurance, adaptive practice/analysis, sponsor governance & external investigation, vocab index chrome.

**Channel budget:** 7/7 top-level `dom.*` hues · neutral junction: yes (`dom.metaVocab` / sub-role `junction`).

| Pattern | Hue / fill | Shape | Stroke | Label rule |
| --- | --- | --- | --- | --- |
| `dom.tiedCorpus` | Blue family | rectangles / YAML stores | solid | `tied-project/`, `tied-bundle/`, MCP tools |
| `dom.agentSurface` | Teal | processes / CLI | solid | `tied agentstream`, skills, prompt types |
| `dom.harnessBench` | Amber | benchmark / trial nodes | solid | HMEP, vendor harness |
| `dom.evidenceAssurance` | Purple | gates / proof artifacts | solid | verify, EDPC, fidelity |
| `dom.adaptivePractice` | Green | analysis / CITDP / CASE | solid | pseudo-code, residuality |
| `dom.governanceChoice` | Rose | sponsor / Jev / REA | solid | costly choice, dual MCP |
| `dom.metaVocab` | Neutral grey | index / routing | solid | PRELOAD, VOCAB_INDEX |
| `layer.*` | Stack hues | stack nodes | solid | Vocab → LEAP layers (orthogonal) |
| `edge.*` | n/a | links | style only | Derived / Declared / Verified |

---

## Top-level domains (7)

| Domain ID | Definition | Fill | Stroke | Mermaid `classDef` |
| --- | --- | --- | --- | --- |
| `dom.tiedCorpus` | Methodology layout, project YAML, MCP data plane, tokens, install/bootstrap | `#e7f0ff` | `#003366` | `domTiedCorpus` |
| `dom.agentSurface` | Agentstream, prompt composer, bundled skills, project-operations MCP | `#e0f7fa` | `#006064` | `domAgentSurface` |
| `dom.harnessBench` | Harness taxonomy, HMEP, metering canaries, platform seam vocabulary | `#fff3e0` | `#e65100` | `domHarnessBench` |
| `dom.evidenceAssurance` | QA profiles, fidelity, EDPC/EASAR/certification, BBCE proof boundaries | `#f3e5f5` | `#7b1fa2` | `domEvidenceAssurance` |
| `dom.adaptivePractice` | CASE, residuality, OEE, CITDP, pseudo-code / three-way alignment | `#e8f5e9` | `#2e7d32` | `domAdaptivePractice` |
| `dom.governanceChoice` | Sponsor–agent, Jev, external investigation MCP, costly choices | `#fce4ec` | `#880e4f` | `domGovernanceChoice` |
| `dom.metaVocab` | Routing index, full catalog, cross-topic index terms | `#f5f5f5` | `#616161` | `domMetaVocab` |

### Sub-roles

| Parent | Sub-role | Fill | Stroke | Use |
| --- | --- | --- | --- | --- |
| `dom.tiedCorpus` | `methodologyBundle` | `#eceff1` | `#455a64` | Read-only `tied-bundle/` |
| `dom.tiedCorpus` | `projectYaml` | `#e7f0ff` | `#003366` | Writable `tied-project/` indexes |
| `dom.tiedCorpus` | `tokenRegistry` | `#c5cae9` | `#283593` | REQ/ARCH/IMPL/PROC nodes |
| `dom.evidenceAssurance` | `proofBoundary` | `#ede7f6` | `#6a1b9a` | Explicit non-implication |
| `dom.metaVocab` | `junction` | `#f5f5f5` | `#616161` | Glue / link tables |

### Layer axis (`layer.*`)

| Layer | Fill | Stroke | `classDef` |
| --- | --- | --- | --- |
| `layer.vocab` | `#e8f5e9` | `#2e7d32` | `layerVocab` |
| `layer.citdp` | `#fff9c4` | `#f9a825` | `layerCitdp` |
| `layer.req` | `#e7f0ff` | `#003366` | `layerReq` |
| `layer.arch` | `#e1bee7` | `#6a1b9a` | `layerArch` |
| `layer.impl` | `#ffe0b2` | `#ef6c00` | `layerImpl` |
| `layer.tests` | `#b2dfdb` | `#00695c` | `layerTests` |
| `layer.leap` | `#f8bbd0` | `#c2185b` | `layerLeap` |

### Plan axis (`plan.*`)

| Role | Fill | Stroke | `classDef` |
| --- | --- | --- | --- |
| `plan.proposed` | `#e7f0ff` | `#003366` | `planProposed` |
| `plan.pending` | `#fff3e0` | `#e65100` | `planPending` |
| `plan.reference` | `#eceff1` | `#455a64` | `planReference` |

### Edge axis (`edge.*`)

| Kind | Stroke | Mermaid |
| --- | --- | --- |
| `edge.verified` | solid | default `---` / `-->` |
| `edge.derived` | dashed | `-.->` |
| `edge.declared` | dotted | `-.->` + legend note |

---

## Crosswalk

| Artifact | Uses |
| --- | --- |
| [visual-encoding-standards.md](../../docs/visual-encoding-standards.md) | Copy-paste `classDef`, Tier A registry |
| [stdd-workflows.md](../../docs/stdd-workflows.md) | W1–W6 workflow domains |
| [vocabulary-layer-tied-leap-citdp.md](../../docs/vocabulary-layer-tied-leap-citdp.md) | `layer.*` stack |
| [term-domain-color-index.md](term-domain-color-index.md) | Term → `dom.*` |
| [term-domain-glossary-defaults.yaml](term-domain-glossary-defaults.yaml) | File-level defaults |
| [term-domain-overrides.yaml](term-domain-overrides.yaml) | Cross-topic fixes |

---

## Legend (named labels)

| Label | Domain |
| --- | --- |
| **TiedCorpus** | `dom.tiedCorpus` |
| **AgentSurface** | `dom.agentSurface` |
| **HarnessBench** | `dom.harnessBench` |
| **EvidenceAssurance** | `dom.evidenceAssurance` |
| **AdaptivePractice** | `dom.adaptivePractice` |
| **GovernanceChoice** | `dom.governanceChoice` |
| **MetaVocab** | `dom.metaVocab` |
| **LayerStack** | `layer.*` only |
| **PlanFigure** | `plan.*` only |

---

## Accessibility gate

| Check | Status |
| --- | --- |
| Grayscale | OK — domain ids in subgraph titles, node labels, stroke style for `edge.*`, `layer`/`dom` legends |
| CVD | Purple assurance vs green practice vs blue corpus vs amber harness — deuteranopia-safe pairing; rose governance distinct from purple |
| Text on fills | Light fills + dark 2px strokes on diagrams; legends name domains explicitly |
| Adjacent fills | Prefer stroke borders between regions; see informative-color-coding border guidance |

**Export alt-text pattern:** Name `dom.*` / `layer.*` and roles; do not rely on hue alone.

---

## Assignment precedence (summary)

1. **Override file** → `term-domain-overrides.yaml`.
2. **Glossary default** → `term-domain-glossary-defaults.yaml`.
3. **Persistence / write authority** → `dom.tiedCorpus` + sub-role.
4. **Operator execution** → `dom.agentSurface`.
5. **Harness / HMEP** → `dom.harnessBench`.
6. **Proof & gates** → `dom.evidenceAssurance`.
7. **CITDP / CASE / pseudo-code** → `dom.adaptivePractice`.
8. **Sponsor / Jev / REA** → `dom.governanceChoice`.

## Ownership

Client-owned STDD vocabulary; update when glossaries grow or Tier B/C doc rollout extends diagrams. Do not mint TIED tokens for `dom.*` in non-tied tracks.