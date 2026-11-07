# Plan: NVIDIA Auto-Ontology × TIED — agent management / improvement (Wave 2, local-only)

**Slug:** `nvidia-auto-ontology-vs-tied`  
**Track:** `@non-tied-plan` → `@non-tied-refine` (this plan) → `@non-tied-build` → optional `@non-tied-close`  
**Wave 1 slug (sibling):** [`nvidia-auto-ontology-capture`](../nvidia-auto-ontology-capture/PLAN.md)  
**Source:** [NVIDIA/auto-ontology](https://github.com/NVIDIA/auto-ontology); local capture [`docs/comparisons/nvidia-auto-ontology.md`](../../../docs/comparisons/nvidia-auto-ontology.md)  
**Template:** [`tied-bundle/docs/external-service-three-wave-comparison-template.md`](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md) Wave 2 (14 sections)

## Scope

Doc-only **Wave 2 external-service comparison**: map NVIDIA Auto-Ontology **agent harness** patterns (Generate → Certify → Answer, MCP read / REST write seam, readiness → answerability → ask, modeling/publication/query-validation gates, three `nvidia-ontology-*` skills) to **TIED improvement opportunities** in this repo—**not** adopting the product runtime, Nemotron text-to-SQL, or enterprise catalog as TIED core.

| Boundary | Choice |
| --- | --- |
| Wave 2 deliverable | `docs/comparisons/nvidia-auto-ontology-vs-tied-agent-management.md` |
| Publish | **Local only** — `docs/comparisons/*` (no `.gitignore` allowlist) |
| Wave 3 | **Defer** — phased table doc-first only; no REQ mint from comparison prose |
| Distinct from | Netflix operational RDF flywheel; NDTP TTL wizard; Open Ontologies governance engine; LangChain trace bench |

## Evidence inputs (read-only)

| Role | Path |
| --- | --- |
| Wave 1 capture | `docs/comparisons/nvidia-auto-ontology.md` |
| Sibling analyses | `netflix-ontology-driven-observability-vs-tied-agent-management.md`, `ndtp-ai-ontology-extension-vs-tied-agent-management.md`, `open-ontologies-repository-vs-tied-agent-management.md`, `veronika-heimsbakk-ai-generated-ontologies-vs-tied-agent-management.md`, `langchain-harness-engineering-vs-tied-agent-management.md` |
| TIED anchors | `AGENTS.md`, `tied-bundle/docs/agent-req-implementation-checklist.md`, `tied-project/vocab/sponsor-agent-relationship.md`, comparison template |

## Deliverables (`@non-tied-build`)

| Artifact | Path |
| --- | --- |
| Wave 2 analysis + improvement plan | `docs/comparisons/nvidia-auto-ontology-vs-tied-agent-management.md` |
| Capture sibling link | Update `nvidia-auto-ontology.md` metadata **Analysis (sibling)** |
| Plan folder | `tied-project/non-tied-plans/nvidia-auto-ontology-vs-tied/` |

**Not in scope:** Wave 3 `REQ-TIED_*` YAML, `methodology-composition-matrix.md` row 18 (unless sponsor promotes), bundle doc edits, reciprocal sibling backlinks (optional Defer).

## Analysis contract

1. **14 template sections** in order (Executive summary → Related documents).
2. **§3:** Relationship to sibling comparisons — table per cursor plan scope ownership.
3. **§4:** Harness lessons — ten thematic mapping tables (preflight, MCP seam, skills router, validation layers, publication readback, learn loop, etc.).
4. **§6:** Primary capability matrix (~12–14 rows); dispositions Align / Composable / Tension / Gap / Defer only.
5. **§7:** Authority boundary mermaid — NVIDIA loop vs harness-adjacent vs TIED core (gates, project YAML MCP, sponsor ladder).
6. **§11:** Phased recommendations — improvement roadmap; Wave 3 rows default **Defer**.

## Center-of-gravity (compose-don’t-replace)

**NVIDIA (reported):** analytics **semantic layer** + certified text-to-SQL with provenance.

**TIED (stdd):** **software intent** traceability (REQ/ARCH/IMPL, IMPL pseudo-code, vocab, checklist gates, bounded tied-yaml MCP).

Borrow preflight gates, read/write seam discipline, fail-closed gaps, multi-layer validation, skill ownership tables—do not replace `tied_validate_consistency` or sponsor person branch with Auto-Ontology certification.

## Verification

See [test-strategy.md](test-strategy.md). Handoff: [evidence/session-handoff.md](evidence/session-handoff.md).

## Forbidden

Minting REQ/ARCH/IMPL from comparison prose; MCP project YAML writes; `.gitignore` allowlist without sponsor opt-in; BIRD/SQL benchmark claims as TIED proof; full MCP tool table paste; automatic git push.
