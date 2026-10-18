# EASAR recovery (Mode C) (canonical)

**Scope:** Domain vocabulary for Evidence-Assured Software Architecture Recovery (EASAR) Mode C engagements in TIED clients. Terms **do not** replace REQ/ARCH/IMPL authority.

**Traceability:** `[REQ-TIED_EASAR_RECOVERY]` · `[ARCH-TIED_EASAR_ARTIFACT_MODEL]` · `[IMPL-TIED_EASAR_RECEIPTS]` · `[PROC-EASAR_RECOVERY]` · methodology [evidence-assured-software-architecture-recovery.md](../../docs/methodologies/evidence-assured-software-architecture-recovery.md) §7

**Status:** Slice 5 Stage 7 validation corpus on disk (2026-10-18); Slice 6 portable export plan refined (2026-10-19). Re-VALIDATE on glossary edits per `[PROC-VOCABULARY_INDEX]`.

**See also:** [`routing.md`](routing.md) (row **2f**) · [`quality-assurance.md`](quality-assurance.md) (grading / evaluation corpus contrast) · [`fidelity-research.md`](fidelity-research.md) (adversarial inquiry vs claims review) · [`tied-methodology.md`](tied-methodology.md)

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
| Validation cases | `validation-cases.v1.yaml` | Stage 7 SWE-QA-aligned comprehension tasks (bounded dogfood) |
| Validation results | `validation-results.v1.json` | Stage 7 grader outcomes + evidence refs (not a blocking scorecard) |
| Recovery export manifest | `recovery-export-manifest.v1.json` | Stage 9 read-only map receipt (canonical → portable); not a git `recovery/` root |
| Portable map | `recovery-portable-map.v1.yaml` | Machine table of §6.2 paths, transforms, and documented gaps |

---

## Stage 9 export terms

| Term | Definition | TIED preferred name |
| --- | --- | --- |
| **Portable export adapter** | Read-only serializer from §6.1 canonical paths to §6.2 layout | MCP `tied_easar_recovery_export_build` (planned); IMPL `RUN_EASAR_RECOVERY_EXPORT_V1` |
| **Export tree** | Materialized `recovery/` directory for external auditors | Default under `tied-bundle/working/{REQ}/recovery-export/` — **gitignored** |
| **Manifest gaps** | Explicit unmapped §6.2 slots in export receipt | `gaps[]` on `recovery-export-manifest.v1.json` — not blocking completeness gate |

---

## Stage 7 terms

| Term | Definition | TIED preferred name |
| --- | --- | --- |
| **Validation case** | Independent assessment task with structured oracle | Row in `validation-cases.v1.yaml` |
| **Grader** | Deterministic checker (graph trace, receipt field, test path) | `grader` field — not LLM-as-judge in Slice 5 MVP |
| **Validation suite run** | Execute all cases for one repo revision | MCP `tied_easar_validation_suite_run` |

**Distinction:** `evaluation-corpus.v1.yaml` rows index **envelope gap batch collect** across clients; they are **not** EASAR Stage 7 validation cases.

---

## Anti-patterns

- Repo-root `recovery/` as source of truth
- Merging adversarial `finding-ledger.jsonl` with claims-review ledgers
- Promoting `observed` matrix rows to REQ without sponsor promotion slugs

---

## Alphabetical index

| Term | Section |
| --- | --- |
| claim registry | Terms (EASAR §7.4 map) |
| evaluation ledger | Terms (EASAR §7.4 map) |
| export tree | Stage 9 export terms |
| grader | Stage 7 terms |
| grading | Terms (EASAR §7.4 map) |
| manifest gaps | Stage 9 export terms |
| portable export adapter | Stage 9 export terms |
| recovery engagement (Mode C) | Terms (EASAR §7.4 map) |
| validation case | Stage 7 terms |
| validation suite run | Stage 7 terms |
