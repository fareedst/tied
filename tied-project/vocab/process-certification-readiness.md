# Process certification readiness (EDSE certifiability) (canonical)

**Scope:** Repository-owned **certifiability readiness** for Evidence-Driven Situational Engineering (EDSE)—not third-party certification, ISO compliance claims, or CMMI appraisal.

**Traceability:** `[REQ-TIED_PROCESS_CERTIFICATION_READINESS]` · `[ARCH-TIED_PROCESS_CERTIFICATION_READINESS]` · `IMPL-TIED_PROCESS_CERTIFICATION_*` · `[PROC-PROCESS_CERTIFICATION_READINESS]`

**Status:** RECORD build-plan (2026-10-18); C1/C2 accepted; VALIDATE before traceable commit.

**Sponsor decisions (v1 scope):** Adaptive-effectiveness harness is **fixture-grounded** (CASE/EASAR receipt fixtures). Independent assessment ingress is **file-based** (`independent-assessment-record.v1` on disk); MCP ingest deferred.

**See also:** [`context-adaptive-engineering.md`](context-adaptive-engineering.md) (CASE/EDSE practice layer) · [`quality-assurance.md`](quality-assurance.md) (**proof boundary**, **comparable arms**) · [`fidelity-research.md`](fidelity-research.md) (independent assessment) · [certification-of-workflows.md](../../docs/methodologies/certification-of-workflows.md)

---

## Terms

| Term | Definition | TIED preferred name |
| --- | --- | --- |
| **Certifiability readiness** | Machine-assessable foundation (versioned process spec, mappings, conformance, capability evidence, independent comparison, bounded experiments) that supports **external appraisal** without asserting certification. | `certifiability-readiness.v1` |
| **Normative process specification** | Versioned EDSE clause set (`EDSE-001`…`EDSE-007`) with evidence obligations, evaluation procedure, pass/fail rule, limitations, and content hash—not a quotation of ISO text. | `edse-process-spec.v1` |
| **Reference mapping only** | 12207 (or similar) crosswalk IDs with rationale and `reference_mapping_only` **proof boundary**; no standard text reproduction and no compliance claim. | `iso-12207-mapping.v1` |
| **Capability profile (330xx-style)** | Seven per-dimension results (context characterization, practice selection, execution, evidence management, verification, adaptation, continuous improvement) with evidence and limitations; **no aggregate maturity score**. | `capability-profile.v1` |
| **Conformance matrix** | Deterministic clause-by-clause evaluation output linked to catalog validators and existing TIED surfaces. | `conformance-matrix.v1` |
| **Independent assessment record** | Assessor identity, independence attestation, findings, and evidence refs; insufficient independence is a hard failure. | `independent-assessment-record.v1` |
| **Assessor agreement report** | Deterministic agreement/disagreement between independent assessor records. | `assessor-agreement-report.v1` |
| **Adaptive effectiveness experiment** | Bounded harness with **fixed**, **rule-selected**, and **adaptive** arms, context perturbations, held-out cases, provenance, and stop criteria; observational only. | `adaptive-effectiveness-report.v1` |
| **Assessor handoff** | `assessor-pack.v1` plus committed checklist/limitations for stages 6–8 (human-owned external appraisal). | `assessor-pack.v1` |
| **External appraisal** | Future third-party or scheme-owned evaluation; out of scope for automated `certified` claims. | (process stage, not artifact schema) |
| **Ready for external appraisal** | Readiness output state when declared evidence conditions pass; **must not** imply `certified` or ISO/CMMI compliance. | `ready_for_external_appraisal` |

---

## Proof boundaries

- Passing **conformance** does not imply **capability**, **product quality**, or **method superiority**.
- **Reference mappings** do not establish standard compliance.
- **Adaptive effectiveness** observations do not establish causal superiority without a separate, sponsor-owned study design.
- Readiness tools remain **read-only** for project TIED YAML and do not change checklist or CASE selector authority.

---

## Alphabetical index

| Term | Section |
| --- | --- |
| adaptive effectiveness experiment | Terms |
| assessor agreement report | Terms |
| assessor handoff | Terms |
| capability profile (330xx-style) | Terms |
| certifiability readiness | Terms |
| conformance matrix | Terms |
| external appraisal | Terms |
| independent assessment record | Terms |
| normative process specification | Terms |
| proof boundaries | Proof boundaries |
| ready for external appraisal | Terms |
| reference mapping only | Terms |
