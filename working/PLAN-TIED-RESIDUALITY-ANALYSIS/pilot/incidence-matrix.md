# Exploratory incidence matrix (W1)

**Status:** Populated — build-plan W1 workshop (2026-09-27)

**Legend:** `●` strong impact on capability · `○` moderate · `—` minimal · `⚠` harmful residue risk (see worksheet class)

## Capabilities (columns)

| ID | Capability |
|----|------------|
| C1 | Stable `task_id` across attempts |
| C2 | Append-only evidence history |
| C3 | Dependent lock on failure / stale / cancel |
| C4 | Deterministic status + reason |
| C5 | Request-key repeat (same fingerprint) |
| C6 | Request-key collision (divergent fingerprint) |
| C7 | Concurrent create serialization |
| C8 | Atomic manifest publication |
| C9 | Operator/support explainability |

## Matrix (stressors × capabilities)

| Stressor | C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | C9 |
|----------|----|----|----|----|----|----|----|----|-----|
| S-T01 | ● | ● | ○ | ○ | ● | — | ○ | ○ | ○ |
| S-T02 | ● | ● | ● | ○ | — | — | — | — | ○ |
| S-T03 | ○ | ● | ○ | ● | ○ | — | ● | ● | ○ |
| S-T04 | ● | ○ | ○ | ○ | ● | — | ○ | ○ | ○ |
| S-T05 | ○ | ○ | ● | ○ | — | — | — | — | — |
| S-T06 | ● | ○ | ● | ● | — | — | — | — | ○ |
| S-T07 | — | — | — | ○ | ● | — | ● | ● | — |
| S-T08 | — | — | — | ○ | ○ | — | ● | ● | — |
| S-T09 | ○ | ⚠ | ○ | ● | ● | ● | ○ | ○ | ⚠ |
| S-T10 | — | — | — | ● | ○ | — | ● | ● | ○ |
| S-T11 | ○ | ● | ○ | ○ | ● | — | ● | ○ | — |
| S-T12 | ● | ⚠ | ○ | ○ | — | — | — | — | ⚠ |
| S-T13 | ● | ● | ● | ● | — | — | — | — | ○ |
| S-T14 | ● | ● | ● | ● | — | — | — | — | ● |
| S-T15 | ● | ● | ○ | ● | — | — | — | — | ○ |
| S-T16 | ○ | ○ | ○ | ⚠ | — | — | — | — | ⚠ |
| S-T17 | — | — | — | ● | — | — | — | — | — |
| S-T18 | — | — | — | ○ | ○ | — | ● | ● | ○ |
| S-O01 | ● | ● | ● | ● | — | — | — | — | ○ |
| S-O02 | ○ | ⚠ | ⚠ | ⚠ | — | — | — | — | ⚠ |
| S-O03 | ● | ● | ○ | ● | — | — | — | — | ● |
| S-O04 | ● | ○ | ● | ● | — | — | — | — | ○ |
| S-O05 | — | — | — | ● | — | ● | — | — | ● |
| S-O06 | ● | ● | ● | ● | — | — | — | — | ⚠ |
| S-O07 | — | — | — | ○ | ○ | — | ● | ○ | ⚠ |

## Attractors (recurring patterns)

| Attractor | Pattern | Example stressors | W2 disposition lean |
|-----------|---------|-------------------|---------------------|
| **A1 — Evidence append anchor** | Auditability survives duplicate delivery, crash, poison loops | S-T01, S-T02, S-T14 | desirable → confirm REQ/IMPL coverage |
| **A2 — Dependent lock funnel** | Non-success outcomes keep graph blocked | S-T06, S-T14, S-O01, S-O04, S-O06 | desirable → covered by REQ criterion 3 |
| **A3 — Request-key serialization funnel** | Concurrency collapses to single winner + stable retry | S-T07, S-T18, S-T11, S-O07 | desirable → ARCH/IMPL lock path |
| **A4 — Deterministic error surface** | STALE_INPUT, COLLISION, REQUIRED instead of silent drift | S-T06, S-T17, S-O05 | desirable → covered |
| **A5 — Ops/scale/version gaps** | Human tooling, skew, storms not fully specified in pilot REQs | S-T09, S-T11, S-T16, S-O02, S-O06, S-O07 | harmful/accidental → ARCH constraint or accepted residual risk |

## Coupling notes

- **Create ↔ execute:** S-T01 and S-T04 couple idempotent create with execution retry semantics (shared client retry behavior).
- **Lock ↔ store:** S-T03, S-T10, S-T18 share lock coordinator + store failure modes (composition seam for W4).
- **Human ↔ deterministic errors:** S-O04, S-O05 show operational quality depends on error taxonomy already in ARCH/IMPL.

## Proof boundary

Read-only discovery view — **not** the quality evidence matrix. Attractors are analytical labels, not risk tiers.
