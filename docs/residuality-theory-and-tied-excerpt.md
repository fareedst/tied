# Residuality Theory and TIED — tracked excerpt

**Status:** Public excerpt for program provenance; **not** a REQ/ARCH/IMPL record.  
**Full synthesis (local, gitignored):** [docs/comparisons/residuality-theory-and-tied.md](comparisons/residuality-theory-and-tied.md) — keep on disk for deep reading; do not rely on git for the full document.  
**Normative roadmap:** [tied-residuality-analysis-plan.md](tied-residuality-analysis-plan.md) (`PLAN-TIED-RESIDUALITY-ANALYSIS`).

## Core distinction

- **Residuality** discovers what **remains** after **stressors** (duplication, crash, timeout, reordering, partition, overload).
- **TIED** preserves **traceable intent** (REQ → ARCH → IMPL → tests → evidence).

Residuality supplies architectural questions under stress; TIED owns, implements, and proves behavior. Residuality findings feed TIED via LEAP — they do not replace REQ authority.

## Working terms (provisional)

| Term | Meaning |
| --- | --- |
| Stressor | Event or condition that interferes with assumed behavior |
| Residue | What remains after the stressor (desirable or accidental) |
| Stressor-residue claim | Bounded claim to test: after stressor S, property R holds or becomes observable |

**Not** the same as TIED **residual risk** (risk after controls). See `tied/vocab/residuality.md`.

## Pilot mapping (W3–W4)

Pilot REQs exercised in code/tests:

- `[REQ-FEAT_TASK_EXECUTION_RECOVERY]` — stable task identity, append-only evidence, resume/stale/dependency ordering.
- `[REQ-FEAT_IDEMPOTENT_CREATION]` — redelivery returns existing feature, lock TTL, collision and partial-publish guards.

Automated stressor matrix: `mcp-server/src/feature-orchestration/w4-residuality-pilot.*.test.ts` (see working plan evidence).

## Authority boundary

> Residuality discovers; TIED formalizes and proves.

Worksheets, incidence matrices, and classification ledgers are **review-gated evidence**, not a second specification authority.
