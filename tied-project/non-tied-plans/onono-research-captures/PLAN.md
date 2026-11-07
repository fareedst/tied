# Plan: ONONO Progressive AI × TIED (Wave 2, local-only)

**Slug:** `onono-research-captures`  
**Track:** Wave 0 captures (done) → `@non-tied-refine` (this plan) → `@non-tied-build` → optional `@non-tied-close`  
**Seed:** [Beyond the Model: Continual Learning](https://onono.ai/research/beyond-the-model-continual-learning-is-moving-to-the-system-level)  
**Template:** [`tied-bundle/docs/external-service-three-wave-comparison-template.md`](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md) Wave 2 only (Wave 1 captures on disk, gitignored)

## Scope

Doc-only **external-service comparison** Wave 2: one **agent-management lens** analysis synthesizing all seven ONONO research captures (Progressive AI, Mind Ontology, system-level learning, manifesto agency). **No** project REQ/ARCH/IMPL YAML, **no** `.gitignore` allowlist, **no** sibling comparison cross-links (per sponsor). **No** Wave 3 REQ.

| Boundary | Choice |
| --- | --- |
| Publish | **Local only** — deliverable stays under `docs/comparisons/` (parent rule `docs/comparisons/*`) |
| Cross-links | TIED anchors + local capture sibling only; omit Traefik/LangChain/Netflix × TIED backlinks |
| Claims | **ONONO-reported**; Hou et al. / arXiv as **third-party (ONONO-cited, not verified in stdd)** |

## Evidence inputs (read-only)

| Role | Path |
| --- | --- |
| Index | `docs/comparisons/onono-research-capture-index.md` |
| Spine | `docs/comparisons/onono-beyond-the-model-continual-learning.md` |
| Framework | `docs/comparisons/onono-foundation-progressive-ai.md` |
| Mind Ontology | `docs/comparisons/onono-mind-ontology-beyond-ai-memory.md` |
| Agency | `docs/comparisons/onono-core-manifesto-autonomous-subject.md` |
| Supporting | `onono-scientific-foundations-digital-mind.md`, `onono-world-models-time-journalistic-research.md`, `onono-essence-of-understanding-and-language.md` |

## Deliverables (`@non-tied-build`)

| Artifact | Path |
| --- | --- |
| Wave 2 analysis | `docs/comparisons/onono-progressive-ai-system-learning-vs-tied-agent-management.md` |
| Plan folder | `tied-project/non-tied-plans/onono-research-captures/PLAN.md`, `test-strategy.md`, `evidence/session-handoff.md` |

**Not in scope for build:** Wave 1 re-capture; git allowlist; `methodology-composition-matrix.md` row; `tied-project/working/DOC-*`.

## Analysis contract

1. **14 template sections** in order (Executive summary → Proof boundary).
2. **§3:** replace “Relationship to sibling comparisons” with **Scope ownership (this doc only)** — no links to other `*-vs-tied*` comparisons.
3. **§14:** TIED anchors only (`AGENTS.md`, checklist, `sponsor-agent-relationship.md`, comparison template).
4. **Harness lessons (§4):** mapping tables for system-level adaptation, Mind Ontology vs vocab, Progressive AI agency vs sponsor ladder, uncertainty, autopoiesis.
5. **Capability matrix (§6):** ~12 rows; dispositions Align / Composable / Tension / Gap / Defer only.
6. **Authority boundary (§7):** mermaid — ONONO runtime mind stack = harness-adjacent/Defer; TIED core = gates, MCP project YAML, `tied_validate_consistency`, sponsor person branch.

## Center-of-gravity contrast (compose-don’t-replace)

**ONONO (reported):** intelligence develops outside model weights via persistent memory, skills, protocols, Mind Ontology, and default proactive agency (“AI-in-the-life”).

**TIED (stdd):** intelligence for **software delivery** lives in project REQ/ARCH/IMPL YAML, IMPL `essence_pseudocode`, vocab RESOLVE/RECORD/VALIDATE, checklist gates, explicit prompt-types, and **sponsor-owned intent** on the consequence ladder—not a product cognition runtime.

## Verification

See [test-strategy.md](test-strategy.md). Handoff: [evidence/session-handoff.md](evidence/session-handoff.md).

## Forbidden

Minting REQ/ARCH/IMPL from comparison prose; MCP project YAML writes; `.gitignore` allowlist without sponsor opt-in; automatic git commit/push; equating ONONO product claims with TIED effectiveness proof.
