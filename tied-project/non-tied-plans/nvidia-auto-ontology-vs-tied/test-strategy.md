# Test strategy — NVIDIA Auto-Ontology × TIED Wave 2 (doc-only)

No RED unit tests. Manual verification checklist for `@non-tied-build`.

## Preconditions

- [x] Wave 1 capture at `docs/comparisons/nvidia-auto-ontology.md`
- [x] Plan package under `tied-project/non-tied-plans/nvidia-auto-ontology-vs-tied/`

## Wave 2 analysis

- [x] Metadata table: purpose, audience, capture sibling link, status/date, proof boundary, **Executable follow-up** = Wave 3 Defer
- [x] All **14** template sections in order
- [x] Source summary bullets **NVIDIA-reported** / **skill-doc-observed** from capture
- [x] §3 sibling scope table (Netflix, NDTP, Open Ontologies, Heimsbakk, LangChain)
- [x] §4 harness lessons: ≥8 mapping tables with disposition vocabulary
- [x] §5 RESOLVE table + disposition key + claim labeling
- [x] §6 capability matrix (~12–14 rows)
- [x] §7 authority boundary mermaid (valid node IDs)
- [x] §8 anti-patterns (≥5 rows)
- [x] §9 compose-don’t-replace table
- [x] §10 bounded operator recommendations (≥5 numbered)
- [x] §11 phased recommendations — improvement plan; Phase 0 capture Done / analysis Done after build
- [x] §12 explicit non-adoptions; §13 proof boundary; §14 related documents
- [x] **No** new REQ/ARCH/IMPL tokens in body

## Capture cross-link

- [x] `nvidia-auto-ontology.md` metadata links to vs-tied sibling; removes or replaces “Wave 2 deferred” line

## Local-only git

- [x] `git check-ignore -v docs/comparisons/nvidia-auto-ontology-vs-tied-agent-management.md` → `docs/comparisons/*`
- [x] `git check-ignore -v docs/comparisons/nvidia-auto-ontology.md` → ignored

## Commands

```bash
git check-ignore -v docs/comparisons/nvidia-auto-ontology-vs-tied-agent-management.md
test -f docs/comparisons/nvidia-auto-ontology-vs-tied-agent-management.md && wc -l docs/comparisons/nvidia-auto-ontology-vs-tied-agent-management.md
```
