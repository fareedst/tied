# On AI-generated Ontologies

| Field | Value |
| --- | --- |
| **Source** | [On AI-generated Ontologies](https://veronahe.substack.com/p/on-ai-generated-ontologies) (Substack, Veronika Heimsbakk) — full article text is **not** stored in this repository |
| **Authors** | Veronika Heimsbakk |
| **Published** | 2026-10-22 |
| **Purpose** | External reference index for Wave 2 comparison — **link + summary only**; does not mint REQ/ARCH/IMPL tokens and does **not** reproduce the article body. |
| **Captured** | 2026-10-22 (summary); full-text capture **not permitted** (copyright / redistribution) |
| **Analysis (sibling)** | [veronika-heimsbakk-ai-generated-ontologies-vs-tied-agent-management.md](veronika-heimsbakk-ai-generated-ontologies-vs-tied-agent-management.md) |
| **Related capture (sibling)** | — |

---

## Why this file has no article body

The sponsor supplied enough content for analysis off-repo, but the **full Substack article must not be committed** to the repo. This stub keeps metadata, a **TL;DR**, and pointers for readers who follow the **Source** link off-repo.

**Off-repo read:** Follow the **Source** link above; do not copy the Substack article body into this repository.

---

## TLDR

Summarizes themes used in the sibling analysis (**Heimsbakk-reported** / read off-repo; not independently verified here).

- Teams that **generate ontologies with LLMs** without domain critique often end up with models **nobody understands** when operationalized in applications.
- The valuable part of semantic modeling is the **conversation** among domain experts (distinctions, sameness, ownership)—machine-readable RDF is the **output**, not the source of meaning.
- LLMs produce a **plausible average** of training corpora; illustrative OWL mistakes (e.g. product/SKU/`FunctionalProperty`) are syntactically fine but **wrong for your business** unless experts decided the distinctions.
- **Symptoms:** unexplained classes, validation against alien intent, surprising inferences from generous axioms, painful maintenance.
- **Blueprint pattern:** keep a small **human-authored** ontology core; use LLMs for **draft** SKOS-like vocab expansions and SHACL-like shape scaffolds, always curated against the blueprint.
- **Review ≠ authorship**; approving generated structure misses **absent** distinctions never debated.
- **Ownership tests:** What does it mean? Why is it there (need / competency question)? Who decided?

---

## Notes for stdd readers

- **Proof boundary:** Claims above are **summary-only** from sponsor-read content. They are **not** independently verified in Wave 1–2 and must not be treated as TIED methodology proof.
- **TIED analogy:** TIED uses a **SKOS-adjacent** vocabulary layer, not OWL—see sibling analysis and [vocabulary-layer-tied-leap-citdp.md](../../tied-bundle/docs/vocabulary-layer-tied-leap-citdp.md).
- **Wave 2:** [veronika-heimsbakk-ai-generated-ontologies-vs-tied-agent-management.md](veronika-heimsbakk-ai-generated-ontologies-vs-tied-agent-management.md) — meaning ownership × TIED agent governance (**reference only**).
