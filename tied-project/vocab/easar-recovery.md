# EASAR recovery (Mode C)

**Purpose:** Domain vocabulary for Evidence-Assured Software Architecture Recovery engagements in TIED clients. Methodology bridge: [evidence-assured-software-architecture-recovery.md](../../docs/methodologies/evidence-assured-software-architecture-recovery.md).

**Tokens:** `[REQ-TIED_EASAR_RECOVERY]`, `[ARCH-TIED_EASAR_ARTIFACT_MODEL]`, `[IMPL-TIED_EASAR_RECEIPTS]`, `[PROC-EASAR_RECOVERY]`.

---

## Terms (EASAR §7.4 map)

| Term | Definition | TIED preferred name |
| --- | --- | --- |
| **Recovery engagement (Mode C)** | Full EASAR orchestration composing BFIE, graph, claims, fidelity, inquiry, envelope | Tracker `brownfield_intent_elevation.engagement: easar_full` with `mode: pilot` or `strict` |
| **Evidence-backed traceability stack** | REQ/ARCH/IMPL + working receipts + envelope | `tied-project/` + `tied-project/working/{REQ}/` |
| **Claim registry** | Interpretations with verification state | Intent elevation matrix + claims-review output (not adversarial finding-ledger) |
| **Evaluation ledger** | Measured close-out outcomes | Request evidence envelope + gate receipts |
| **Grading** | Comparable arms / optional rubric pilot | Quality-assurance glossary; not blocking 85/100 without costly choice |

---

## Receipts (MVP)

| Artifact | Schema | Role |
| --- | --- | --- |
| Inventory | `inventory.v1` | Stages 0–1 scoped analysis normalization |
| Code graph matrix receipt | `code-graph-matrix-receipt.v1` | Stage 2 row ↔ graph freshness/trace |
| Claim matrix map | `claim-matrix-map.v1` | Stage 4 `claim.id` ↔ matrix `#` |
| Reflexion report | `reflexion-report.v1` | Stage 6 export-only ARCH ↔ graph divergence synthesis |

---

## Anti-patterns

- Repo-root `recovery/` as source of truth
- Merging adversarial `finding-ledger.jsonl` with claims-review ledgers
- Promoting `observed` matrix rows to REQ without sponsor promotion slugs
