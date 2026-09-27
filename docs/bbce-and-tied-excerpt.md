# Behavior-Bounded Change Engineering and TIED — tracked excerpt

**Status:** Public excerpt for program provenance; **not** a REQ/ARCH/IMPL record.  
**Full synthesis (local, gitignored):** [docs/comparisons/tied-vs-behavior-bounded-change-engineering.md](comparisons/tied-vs-behavior-bounded-change-engineering.md) — keep on disk for deep reading; do not rely on git for the full document.  
**Normative roadmap:** [tied-bbce-alignment-plan.md](tied-bbce-alignment-plan.md) (`PLAN-TIED-BBCE-ALIGNMENT`).

## Core distinction

- **BBCE** constrains **where change stays local** — behavioral slices, declared change surfaces, locality and blast-radius metrics.
- **TIED** preserves **traceable intent** (vocabulary → REQ → ARCH → IMPL → tests → quality evidence → LEAP).

BBCE supplies change-footprint discipline on codebases TIED already specifies; TIED owns, implements, and proves behavior. Locality findings feed review-gated evidence and optional gates — they do not replace REQ authority.

## Working terms (provisional)

| Term | Meaning |
| --- | --- |
| **behavioral slice** | Externally meaningful use case with an owning boundary; often maps to one `[REQ-*]` plus ARCH/IMPL/tests, not necessarily one directory |
| **declared change surface** | Pre-implementation list of behavior, slice, files, public boundary, tests, anticipated shared deps (BBCE §39) |
| **change locality** | Ratio of files changed inside owning slice vs total files changed (BBCE §25) |
| **blast radius** | Propagation of defect or change beyond the originating slice (BBCE §24) |

**Not** the same as TIED **module** (`[REQ-MODULE_VALIDATION]`) — module is validation boundary; slice is change-ownership unit. See `tied/vocab/behavior-bounded-change-engineering.md`.

## Mechanisms (A — partial/current through W2)

**W1 (2026-09-27):** Mechanism **A** pilot — `change-locality-pilot` + working git replay (`locality-run.json`).

**W2 (2026-09-27):** Mechanism **A** spike — repo `tied/analysis/agentstream-slice-map.yaml`, `bbce-declared-change-surface.v1` validator, optional checklist/CITDP fields (`declared_change_surface`, `risk_analysis.bbce_alignment.declared_change_surface_ref`), advisory `plumb-audit-gate-log.v2` + `bbce-locality-event.v1` JSONL (default off). Not mandatory gate blocking.

**W3 (executed):** Mechanisms **B–C** advisory pilot (`bbce-shared-code-justification.v1`, `bbce-boundary-violation.v1`).

**W4 (executed):** Mechanism **D** — checklist **`sub-bbce-advisory-verification-pass`** when Tracker **`bbce_advisory_enforced: true`** (default false); merged `risk_analysis.bbce_alignment` on working CITDP; optional ARCH snippet `templates/architecture-decisions/ARCH-BBCE_SLICE_OWNERSHIP_SNIPPET.yaml`. Program recommendation **Adopt (revise)** at advisory pilot; **not** CI hard fail without separate REQ. Machine PLAN close-out envelope still deferred.

## Authority boundary

> BBCE measures and constrains change spread; TIED formalizes and proves intent.

Locality scores, worksheets, and plumb-audit extensions are **review-gated evidence**, not substitutes for composition tests, REQ satisfaction criteria, or `[PROC-LEAP]`.
