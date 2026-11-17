# Visual encoding standards — STDD / TIED store docs

**Plan:** [stdd-vocab-visual-encoding PLAN](../tied-project/non-tied-plans/stdd-vocab-visual-encoding/PLAN.md)  
**Skill:** [@informative-color-coding](../.cursor/skills/informative-color-coding/SKILL.md)  
**Canonical registry:** [visual-encoding-domains.md](../tied-project/vocab/visual-encoding-domains.md) (`dom.*`, sub-roles, accessibility gate)  
**Term index:** [term-domain-color-index.md](../tied-project/vocab/term-domain-color-index.md)

Methodology-owned Markdown under `docs/` uses shared **runtime** domains (`dom.*`) for integration and workflow diagrams. **Stack** figures use the **`layer.*`** axis. **Planning-only** figures may use **`plan.*`**. Tier A rollout: [PLAN §5](../tied-project/non-tied-plans/stdd-vocab-visual-encoding/PLAN.md).

Pair **domain id** + **node label** in legends; hue alone is never sufficient.

---

## Runtime domains (`dom.*`)

| Label | Domain | Fill | Stroke | `classDef` |
| --- | --- | --- | --- | --- |
| **TiedCorpus** | `dom.tiedCorpus` | `#e7f0ff` | `#003366` | `domTiedCorpus` |
| **AgentSurface** | `dom.agentSurface` | `#e0f7fa` | `#006064` | `domAgentSurface` |
| **HarnessBench** | `dom.harnessBench` | `#fff3e0` | `#e65100` | `domHarnessBench` |
| **EvidenceAssurance** | `dom.evidenceAssurance` | `#f3e5f5` | `#7b1fa2` | `domEvidenceAssurance` |
| **AdaptivePractice** | `dom.adaptivePractice` | `#e8f5e9` | `#2e7d32` | `domAdaptivePractice` |
| **GovernanceChoice** | `dom.governanceChoice` | `#fce4ec` | `#880e4f` | `domGovernanceChoice` |
| **MetaVocab** | `dom.metaVocab` | `#f5f5f5` | `#616161` | `domMetaVocab` |

### Sub-role `classDef` (optional)

```text
  classDef domTiedBundle fill:#eceff1,stroke:#455a64,stroke-width:2px
  classDef domTiedProject fill:#e7f0ff,stroke:#003366,stroke-width:2px
  classDef domTokenRegistry fill:#c5cae9,stroke:#283593,stroke-width:2px
```

---

## Layer stack (`layer.*`)

| Layer | Fill | Stroke | `classDef` |
| --- | --- | --- | --- |
| Vocabulary | `#e8f5e9` | `#2e7d32` | `layerVocab` |
| CITDP | `#fff9c4` | `#f9a825` | `layerCitdp` |
| REQ | `#e7f0ff` | `#003366` | `layerReq` |
| ARCH | `#e1bee7` | `#6a1b9a` | `layerArch` |
| IMPL | `#ffe0b2` | `#ef6c00` | `layerImpl` |
| Tests | `#b2dfdb` | `#00695c` | `layerTests` |
| LEAP | `#f8bbd0` | `#c2185b` | `layerLeap` |

---

## Planning annex (`plan.*`)

| Label | Role | Fill | Stroke | `classDef` |
| --- | --- | --- | --- | --- |
| `plan.proposed` | Target / recommended | `#e7f0ff` | `#003366` | `planProposed` |
| `plan.pending` | Open / TBD | `#fff3e0` | `#e65100` | `planPending` |
| `plan.reference` | Context / cite | `#eceff1` | `#455a64` | `planReference` |

---

## Mermaid palette block (copy-paste)

Place after the opening fence on **flowchart** diagrams:

```text
  %% palette: docs/visual-encoding-standards.md
  classDef domTiedCorpus fill:#e7f0ff,stroke:#003366,stroke-width:2px
  classDef domAgentSurface fill:#e0f7fa,stroke:#006064,stroke-width:2px
  classDef domHarnessBench fill:#fff3e0,stroke:#e65100,stroke-width:2px
  classDef domEvidenceAssurance fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
  classDef domAdaptivePractice fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
  classDef domGovernanceChoice fill:#fce4ec,stroke:#880e4f,stroke-width:2px
  classDef domMetaVocab fill:#f5f5f5,stroke:#616161,stroke-width:2px
  classDef layerVocab fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
  classDef layerCitdp fill:#fff9c4,stroke:#f9a825,stroke-width:2px
  classDef layerReq fill:#e7f0ff,stroke:#003366,stroke-width:2px
  classDef layerArch fill:#e1bee7,stroke:#6a1b9a,stroke-width:2px
  classDef layerImpl fill:#ffe0b2,stroke:#ef6c00,stroke-width:2px
  classDef layerTests fill:#b2dfdb,stroke:#00695c,stroke-width:2px
  classDef layerLeap fill:#f8bbd0,stroke:#c2185b,stroke-width:2px
```

Apply with `:::className` on nodes. Omit unused `classDef` lines per figure.

**Sequence diagrams:** Mermaid does not apply `classDef` to participants reliably; add a **Visual encoding** note listing participant → `dom.*`.

**Edges:** `edge.derived` / `edge.declared` use `-.->` with legend text (see [stdd-workflows.md](stdd-workflows.md)).

---

## Tier A (applied)

| Id | File |
| --- | --- |
| T1 | [stdd-workflows.md](stdd-workflows.md) |
| T2 | [vocabulary-layer-tied-leap-citdp.md](vocabulary-layer-tied-leap-citdp.md) |
| T3 | [tied-domain-vocabulary-architecture.md](tied-domain-vocabulary-architecture.md) |
| T4 | [comparisons/traefik-harness-platform-vs-tied-agent-management.md](comparisons/traefik-harness-platform-vs-tied-agent-management.md) |

**Future:** Tier B/C slug `docs-visual-encoding-stdd` — inventory remaining `docs/**` Mermaid fences.

---

## Regenerate term index

```bash
node tied-project/non-tied-plans/stdd-vocab-visual-encoding/evidence/build-term-index.mjs
```