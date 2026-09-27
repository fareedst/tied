# Residuality (provisional)

**Scope:** Stressor-driven architecture-discovery vocabulary for the TIED Residuality Analysis pilot (`PLAN-TIED-RESIDUALITY-ANALYSIS`). Terms are **provisional** until Wave 0/W5 promotion criteria are met. They do **not** replace REQ/ARCH/IMPL authority.

**Status:** Provisional — RECORD for refine-plan / feature-plan authoring. Canonical promotion deferred to pilot exit (see [`docs/tied-residuality-analysis-plan.md`](../../docs/tied-residuality-analysis-plan.md)).

**See also:** [`routing.md`](routing.md) · [`quality-assurance.md`](quality-assurance.md) · [`pseudocode-and-citdp.md`](pseudocode-and-citdp.md) · [`fidelity-research.md`](fidelity-research.md) · [`../../docs/comparisons/residuality-theory-and-tied.md`](../../docs/comparisons/residuality-theory-and-tied.md)

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
| **stressor-residue record** | residue ledger row | Candidate working artifact (`stressor-residue.v1`) bridging worksheet fields to TIED evidence/disposition |

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
| Candidate schema | `stressor-residue.v1.yaml` | Provisional; not canonical until W5 decision |
| CITDP hook (proposed) | `risk_analysis.residuality_analysis` | Optional; W5 only |
| Checklist hook (proposed) | `sub-residuality-analysis-pass` | Optional near `impact-discovery` / `author-architecture` |
| Composition fault | `CONTROLLED_COMPOSITION_FAULT` | Existing composition-coverage patterns used in W4 |
| Pilot REQs | `[REQ-FEAT_TASK_EXECUTION_RECOVERY]`, `[REQ-FEAT_IDEMPOTENT_CREATION]` | W1 discovery targets |

## Authority boundary

1. Residuality **discovers** cross-cutting properties under stress.
2. TIED **owns**, formalizes, implements, and proves accepted properties via vocabulary → REQ → ARCH → IMPL → tests → code → quality evidence → LEAP.
3. Observed residues and attractors remain research/working artifacts until classified and promoted.
4. Structural presence of an incidence matrix or stressor worksheet never proves runtime resilience.
