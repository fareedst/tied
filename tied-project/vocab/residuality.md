# Residuality (canonical)

**Scope:** Stressor-driven architecture-discovery vocabulary for TIED clients. Pilot reference: `PLAN-TIED-RESIDUALITY-ANALYSIS` (W1–W4 complete; W5 promotion applied 2026-09-27). Terms **do not** replace REQ/ARCH/IMPL authority.

**Traceability:** [REQ-RESIDUALITY_STRESSOR_RECORD_VALIDATION](../requirements/REQ-RESIDUALITY_STRESSOR_RECORD_VALIDATION.yaml) · `PLAN-TIED-RESIDUALITY-ANALYSIS` · `stressor_residue_record_validate`

**Status:** Promoted glossary (W5 build-plan) — VALIDATE at commit per `[PROC-VOCABULARY_INDEX]`. Machine validation: `[REQ-RESIDUALITY_STRESSOR_RECORD_VALIDATION]` / `stressor_residue_record_validate`.

**See also:** [`routing.md`](routing.md) · [`quality-assurance.md`](quality-assurance.md) · [`pseudocode-and-citdp.md`](pseudocode-and-citdp.md) · [`fidelity-research.md`](fidelity-research.md) · [`../../docs/residuality-theory-and-tied-excerpt.md`](../../docs/residuality-theory-and-tied-excerpt.md) · full synthesis (may be gitignored locally) [`../../docs/comparisons/residuality-theory-and-tied.md`](../../docs/comparisons/residuality-theory-and-tied.md)

**Pilot evidence:** `working/PLAN-TIED-RESIDUALITY-ANALYSIS/pilot/` (25 stressors, classification ledger, W4 tests).

---

## Preferred terms vs synonyms

| Preferred | Avoid | Notes |
|-----------|-------|-------|
| **stressor** | chaos event (alone), failure case (alone) | Disruptive technical, organizational, commercial, environmental, or human condition applied to a baseline architecture |
| **naïve architecture** | naive design, throwaway sketch (alone) | Deliberately simple baseline that meets current functional need before resilience mechanisms; preferred starting form of a **candidate system** |
| **candidate system** | system under analysis | Broader baseline including software, data, dependencies, people, and processes; may begin as a naïve architecture |
| **residue** | leftover, remnant (alone) | What remains possible, trustworthy, recoverable, explainable, or operational after a stressor — software, data, or operational/human capability |
| **desirable residue** | good remnant | Intentionally preserved post-stressor property; candidate for REQ criterion / ARCH constraint after review |
| **harmful residue** | accidental residue (narrow), bad remnant | Accidental or damaging remainder (corruption, unbounded queues, orphaned resources, harmful attractors) |
| **attractor** | failure funnel (alone) | Recurring state or pattern the broader system tends toward under stress across multiple stressors |
| **incidence matrix** | stressor matrix | Read-only stressor-by-capability analysis view; never a second specification authority |
| **validation stressor** | unfamiliar stressor, holdout stressor | Independent scenario reserved for retesting after redesign; does not prove universal resilience |
| **stressor-residue claim** | residue assertion | Bounded “After stressor S, property R remains…” claim to be tested — not evidence by itself |
| **residuality discovery loop** | residue workshop (alone) | Baseline → stressors → residues/attractors → redesign → validation stressors |
| **stressor-residue record** | residue ledger row | Working artifact (`stressor-residue.v1`) bridging worksheet fields to TIED evidence/disposition |

## Critical contrasts (do not conflate)

| Residuality term | Existing TIED term | Distinction |
|------------------|--------------------|-------------|
| **residue** | **residual risk** | Residue = system remainder after a stressor. Residual risk = risk remaining after controls and evidence (`quality-assurance.md`). |
| **attractor** | **risk tier** | Attractor = observed system dynamic tendency. Risk tier = assurance-depth classification. |
| **incidence matrix** | **quality evidence matrix** | Incidence matrix = discovery view. Quality evidence matrix = obligation/evidence rows with provenance. |
| **stressor-residue record** | **REQ/ARCH/IMPL** | Working/research artifact until reviewed promotion via LEAP. Never silently mutates project YAML. |
| **validation stressor** | **abuse case** | Overlap possible; abuse cases are security-profile scenarios. Validation stressors are holdout redesign checks across categories. |

## Naming bridge

| Concept | Artifact / symbol | Notes |
|---------|-------------------|-------|
| Worksheet (minimum) | Stressor, Impact Path, Residue, Business Priority, Design Response | Discovery input only |
| Machine schema | `stressor-residue.v1` | Example: `working/PLAN-TIED-RESIDUALITY-ANALYSIS/schemas/stressor-residue.v1.example.yaml`; validate via `stressor_residue_record_validate` |
| CITDP attach field | `risk_analysis.residuality_analysis` | Attach-first pattern; see `working/PLAN-TIED-RESIDUALITY-ANALYSIS/w5-promotion/risk_analysis.residuality_analysis.proposed.yaml` |
| Checklist hook | `sub-residuality-analysis-pass` | Optional near `impact-discovery` — `[PROC-AGENT_REQ_CHECKLIST]` |
| Composition fault | `CONTROLLED_COMPOSITION_FAULT` | Existing composition-coverage patterns (W4 pilot) |
| Tooling REQ | `[REQ-RESIDUALITY_STRESSOR_RECORD_VALIDATION]` | Structural validator only; no runtime resilience proof |

## Authority boundary

1. Residuality **discovers** cross-cutting properties under stress.
2. TIED **owns**, formalizes, implements, and proves accepted properties via vocabulary → REQ → ARCH → IMPL → tests → code → quality evidence → LEAP.
3. Observed residues and attractors remain research/working artifacts until classified and promoted.
4. Structural presence of an incidence matrix, stressor worksheet, or passing `stressor_residue_record_validate` never proves runtime resilience.

## Integration recommendation (pilot exit)

**Adopt (revise):** Optional risk-triggered `sub-residuality-analysis-pass` after impact-discovery when assurance profiles or sponsor flag warrant it. Default recommendation from pilot DoD item 12 — discovery feeds TIED authority; does not replace REQ/ARCH/IMPL or TDD/composition gates.

## Alphabetical index

| Term | Section |
|------|---------|
| attractor | Preferred terms vs synonyms |
| candidate system | Preferred terms vs synonyms |
| desirable residue | Preferred terms vs synonyms |
| harmful residue | Preferred terms vs synonyms |
| incidence matrix | Preferred terms vs synonyms |
| naïve architecture | Preferred terms vs synonyms |
| residue | Preferred terms vs synonyms |
| stressor | Preferred terms vs synonyms |
| stressor-residue claim | Preferred terms vs synonyms |
| stressor-residue record | Preferred terms vs synonyms |
| validation stressor | Preferred terms vs synonyms |
