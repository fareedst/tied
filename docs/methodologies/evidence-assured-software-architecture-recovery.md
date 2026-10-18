# EASAR — Evidence-Assured Software Architecture Recovery

## An AI-first process for understanding, documenting, verifying, and grading existing software

Status: Proposed methodology, combining established software engineering methods with recent agentic AI techniques.

**TIED alignment (this repository):** EASAR describes a full recovery pipeline. TIED implements overlapping stages through brownfield intent elevation, fidelity research, source-graph comprehension, claims/evidence review, adversarial inquiry, and request-scoped close-out gates. Artifact paths below use the **two-folder client layout** documented in `tied-bundle/docs/working-artifact-placement.md` (`tied-project/working/` committed, `tied-bundle/working/` local/regenerable). We do **not** rename existing repo directories to match a portable `recovery/` export unless a feature explicitly requires it.

**For implementers:** Section **§7** maps portable EASAR names to TIED conventions, records stage maturity, and states how a full implementation plan in this repo is **likely** to proceed (compose existing PROC/REQ tokens, add versioned receipts and optional export— not a parallel `recovery/` tree in git).

Objective: Transform an existing codebase into an evidence-supported, independently verifiable representation of its architecture, behavior, requirements, interfaces, and constraints.

The process must evaluate not only the documentation produced, but also the reliability of the analysis that produced it.

## 1. Foundational principles

1. Evidence before assertion. Every significant technical claim must be traceable to source code, configuration, tests, runtime observations, or another identifiable source.
2. AI-driven investigation. AI agents plan investigations, interpret evidence, formulate hypotheses, generate documentation, and initiate verification.
3. Deterministic verification wherever possible. Use parsers, static analyzers, tests, dependency graphs, and executable probes instead of relying exclusively on model judgment.
4. Independent evaluation. An agent must not be the sole judge of its own output. Verification requires separate evidence, procedures, or evaluators.
5. Explicit uncertainty. Distinguish observed facts, verified conclusions, plausible interpretations, contradictions, and unknowns.
6. Hierarchical comprehension. Understand the system at multiple levels: repository, subsystem, component, feature, and implementation.
7. Continuous refinement. Failures and discrepancies trigger targeted investigation and correction.
8. Reproducibility. Results must be tied to a specific repository revision, environment, tool configuration, and evaluation procedure.

The methodology builds on Software Architecture Reconstruction (SAR), which recovers higher-level architectural representations from existing implementations, and on ISO/IEC/IEEE 42010 for architectural descriptions.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.sei.cmu.edu\&sz=32)

CMU Software Engineering Institute

+1



## 2. Process architecture

The process consists of ten stages:

0\. Establish scope and evaluation contract

1\. Discover and inventory

2\. Build structural models

3\. Recover behavior and intent

4\. Collect and challenge evidence

5\. Synthesize documentation

6\. Independently verify

7\. Validate through executable tasks

8\. Grade and adjudicate

9\. Publish and maintain

Each stage produces explicit artifacts and has acceptance criteria. Failed acceptance checks create corrective work, returning to the earliest relevant stage.

### 2.1 Engagement modes in TIED (pick one before Stage 0)

Full EASAR is the superset. TIED already ships **narrower** paths; an implementation plan should extend these modes rather than invent a second bootstrap.

| Mode | TIED name | Typical stages | Promotes to REQ/ARCH? | Checklist entry |
| --- | --- | --- | --- | --- |
| **A — Retrofit pseudo-code** | Track C ([pseudocode-writing-and-validation.md](../../tied-bundle/docs/pseudocode-writing-and-validation.md)) | 1–3 (partial), optional 6 via fidelity audit | No — IMPL sidecars only | Standard checklist; `[impl-pseudocode-from-code-agent-prompt.md](../../tied-bundle/docs/impl-pseudocode-from-code-agent-prompt.md)` |
| **B — Brownfield intent** | `[PROC-BROWNFIELD_INTENT_ELEVATION]` | 0–6 emphasis; matrix-driven 4–5 | Only **`approved`** matrix rows | `brownfield-baseline-lock` … `brownfield-closure` when Tracker `brownfield_intent_elevation.mode` is `pilot` or `strict` |
| **C — Full recovery (target)** | EASAR + mode B/C compose | 0–9 | Same human gates as B; plus validation task bank when built | Expected: umbrella REQ (e.g. **`REQ-TIED_EASAR_RECOVERY`**, name TBD in plan) extending brownfield slugs or a dedicated `recovery-*` slug set—not a duplicate checklist |

Mode **C** is what the upcoming build plan should close; modes **A** and **B** are the **existing** production paths to preserve.

## 3. Detailed procedure

### Stage 0 — Establish scope and evaluation contract

Purpose: Make success measurable before analysis begins.

Actions:

- Identify repository revision, included and excluded directories, languages, build systems, and available environments.
- Define intended consumers: maintainers, architects, testers, developers, or other agents.
- Establish required documentation views and expected level of detail.
- Identify critical features, data flows, integration boundaries, and risk areas.
- Define grading criteria, minimum acceptance thresholds, and stopping conditions.
- Prepare a baseline of known facts, tests, and reference documentation without assuming they are correct.

Output (portable): `scope.md`, `evaluation-contract.yaml`, `baseline.json`.

**TIED (where used):** `tied-project/working/{REQ-TOKEN}/PLAN.md`, per-request `checklist-tracker.yaml`, draft `CITDP-{REQ-TOKEN}.yaml` (persisted to `tied-project/citdp/` at close-out), CITDP `depth_tier` / gate policy, and brownfield `brownfield-baseline-lock` revision scope when `[PROC-BROWNFIELD_INTENT_ELEVATION]` applies.

Acceptance: Scope, evidence rules, grading criteria, and required outputs are fixed before production analysis.

Reference: Goal–Question–Metric (GQM), Basili et al., which derives measurements from explicit goals and evaluation questions.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://onlinelibrary.wiley.com\&sz=32)

Wiley Online Library



### Stage 1 — Discover and inventory

Purpose: Establish what actually exists.

Actions:

- Inventory source files, dependencies, configurations, schemas, tests, and generated assets.
- Locate executable entry points, public interfaces, commands, services, and event handlers.
- Identify runtime and deployment environments.
- Discover documentation and historical design decisions.
- Flag inaccessible, generated, obsolete, or unclassifiable material.
- Record reproducible execution commands and initial test results.

AI agents classify components, while deterministic tools establish the underlying inventory.

Output (portable): `inventory.json`, `component-catalog.yaml`, `environment.md`.

**TIED (where used):** `[PROC-PROJECT_SURVEY_AND_SETUP]` discovery notes; MCP `tied_scoped_analysis_run`; binding inventory validation (`binding_inventory_validate`); checklist slugs such as `evidence-inventory` under brownfield adoption.

Acceptance: Every in-scope artifact is accounted for, classified, or explicitly marked unresolved. Critical entry points have been investigated.

### Stage 2 — Build structural models

Purpose: Recover the implementation's organization.

Actions:

- Construct symbol tables, abstract syntax trees, and dependency graphs.
- Extract calls, imports, inheritance, interfaces, and data relationships.
- Infer subsystem and component boundaries.
- Identify dependencies crossing those boundaries.
- Reconstruct architectural views from low-level evidence.
- Distinguish inferred architecture from explicitly declared architecture.

Output (portable): `structure.json`, `dependency-graph.json`, `architecture-model.md`.

**TIED (where used):** MCP `tied_source_graph_refresh`, `tied_source_graph_map`, `tied_source_graph_trace`, `tied_source_graph_freshness`; deterministic index at `tied-bundle/reports/source-graph/source-graph-index.v1.json` (TS/JS static extraction; not a full multi-language SAR substitute).

Acceptance: Documented relationships can be traced to structural evidence, and known architectural contradictions are reported.

Reference: CMU SEI's Architecture Reconstruction Guidelines, which describe successive abstraction from extracted implementation facts.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.sei.cmu.edu\&sz=32)

CMU Software Engineering Institute



### Stage 3 — Recover behavior and intent

Purpose: Understand what the software does, not merely how it is organized.

Actions:

- Trace user requests, commands, events, messages, and scheduled operations through the code.
- Reconstruct input/output contracts, state transitions, persistence, side effects, and failure paths.
- Identify business rules, invariants, assumptions, and exceptional behavior.
- Examine existing tests as evidence of expected behavior.
- Execute representative workflows in a controlled environment where feasible.
- Distinguish implemented behavior from intended behavior and historical design rationale.

Use specialized agents for separate features or subsystems. Synthesize their findings into cross-component behavioral models.

Output (portable): `behavior-catalog.yaml`, `contracts.yaml`, `execution-traces/`.

**TIED (where used):** Track C reverse documentation → IMPL `essence_pseudocode` sidecars (`tied-project/implementation-decisions/IMPL-*-pseudocode.md`); tests and `[PROC-TIED_BOOTSTRAP_FROM_TESTS]` as behavioral evidence; fidelity research Stages 0–4 (`tied-bundle/docs/tied-fidelity-research.md`, `pseudocode-fidelity-audit-agent-prompt.md`). Approved product intent promotion is **not** automatic—see Stage 5 and `[PROC-BROWNFIELD_INTENT_ELEVATION]`.

Acceptance: Each critical feature has an evidence-linked behavioral description, with unverified interpretations clearly identified.

Reference: CodeWiki (ACL 2026) demonstrates hierarchical decomposition, specialized agents, and bottom-up synthesis for repository-scale understanding.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://aclanthology.org\&sz=32)

ACL Anthology



### Stage 4 — Collect and challenge evidence

Purpose: Turn plausible interpretations into testable claims.

For every significant claim, record (portable **CLM-*** ids):

```
Claim ID: CLM-0042
Subject: ReferralHandler.UpdateReferral
Assertion: Persists a changed referral record
Evidence:
  - Source symbol and commit reference
  - Relevant call chain
  - Test result or runtime observation
Classification: Observed / Inferred / Assumed
Verification: Pending / Supported / Refuted / Inconclusive
Uncertainty: Known limitations and alternatives
```

**TIED row shape (preferred in-repo):** use the intent elevation matrix (`#` column + disposition + proof boundary) or claims-review dispositions (`shown` / `unsettled` / `not_examined`)—do **not** introduce a parallel `claims.jsonl` in `tied-project/` unless an export adapter emits it for external auditors. Map portable **CLM-*** → matrix row `#` or fidelity finding id when implementing tooling.

Actions:

- Assign stable identifiers to claims.
- Attach precise evidence references and repository revision identifiers.
- Have a separate agent search for counterexamples and contradictory evidence.
- Generate hypotheses that could disprove important claims.
- Design executable probes where static evidence is insufficient.
- Track unsupported, conflicting, or unresolved claims.

Output (portable): `claims.jsonl`, `evidence.jsonl`, `uncertainties.yaml`.

**TIED (where used):** MCP `tied_claims_evidence_review_run` (outputs under a caller-chosen `{project-root}/tied-project/working/{REQ-TOKEN}/claims-evidence-review/` or equivalent `working/` path on undivided layouts); static pilot input via `scripts/build_claims_evidence_from_tied.rb`; fidelity **finding-ledger** lifecycle (`observed` / `triaged` / …) in `tied-project/vocab/fidelity-research.md`; brownfield matrix `tied-project/working/{REQ-TOKEN}/evidence/intent-elevation-matrix.md` from `tied-bundle/templates/brownfield-evidence-to-intent-matrix.md` with dispositions `observed` | `approved` | `unresolved` | `rejected`; MCP `evidence_chain_profile_generate`.

Acceptance: Every mandatory claim has traceable evidence or an explicit unresolved status. Critical contradictions prevent unqualified acceptance.

This stage is essential: generating an explanation and establishing its correctness are different engineering tasks.

### Stage 5 — Synthesize documentation

Purpose: Produce consistent, navigable descriptions from verified and qualified evidence.

Actions:

- Generate system-level architectural overviews.
- Document subsystems, components, public interfaces, and dependencies.
- Produce feature-oriented descriptions independent of source directory organization.
- Describe execution flows, state transitions, persistence, and error handling.
- Generate architectural and behavioral diagrams.
- Link documentation assertions to the claim and evidence registry.
- Identify missing information and known documentation limitations.

Documentation should distinguish observed implementation behavior from inferred design intent.

Output (portable): `docs/`, `architecture/`, `feature-catalog.md`, `traceability.json`.

**TIED (where used):** Canonical traceability in `tied-project/requirements.yaml`, `architecture-decisions.yaml`, `implementation-decisions.yaml`, detail dirs, and semantic tokens—written via TIED MCP / `tied-cli`, not ad-hoc `docs/architecture/` trees. Human-facing rationale stays in `tied-project/working/{REQ-TOKEN}/` (PLAN, slug `*-evidence.md`). Only **`approved`** brownfield matrix rows promote into REQ/ARCH; `observed` rows remain code-linked documentation only.

Acceptance: Required documentation views are present, cross-references resolve, and substantive assertions connect to the evidence registry.

Reference: ISO/IEC/IEEE 42010:2022 provides a formal framework for architectural descriptions, viewpoints, and model relationships.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.iso.org\&sz=32)

Architecture description



### Stage 6 — Independently verify

Purpose: Determine whether the recovered knowledge is supported by the actual implementation.

A separate verification agent examines the documentation without relying on the authoring agent's conclusions.

Actions:

- Check source references against the exact repository revision.
- Independently inspect a risk-weighted sample of documented claims.
- Compare documented dependencies against extracted dependency graphs.
- Compare behavioral descriptions against code and execution traces.
- Identify unsupported assertions, contradictions, missing conditions, and overgeneralizations.
- Check consistency between system-level, component-level, and feature-level descriptions.
- Report failed checks and request specific corrections.

Output (portable): `verification-report.json`, `contradictions.yaml`, `corrections.yaml`.

**TIED (where used):** Separated verification via MCP `tied_adversarial_inquiry_run` (challenger role) with deterministic artifacts under `tied-bundle/working/{REQ-TOKEN}/adversarial-inquiry/` (`obligation-report.json`, append-only `finding-ledger.jsonl`, `gate-result.json`, `evidence-provenance.json`); structural checks `tied_validate_consistency`, `pseudocode_validate`, `brownfield_intent_evidence_validate` (report-only by default); claims review as an independent pass.

Acceptance: Every critical assertion is verified, explicitly qualified as unresolved, or refuted. Unqualified contradictions block acceptance.

Reference: Murphy, Notkin, and Sullivan's Software Reflexion Models establishes a method for identifying correspondence and divergence between architectural models and implementations.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.researchgate.net\&sz=32)

ResearchGate



### Stage 7 — Validate through executable tasks

Purpose: Establish whether the recovered knowledge is sufficiently accurate and useful for real software engineering work.

Verification asks whether the documentation reflects the implementation. Validation asks whether it successfully serves its intended purpose.

Construct an independently prepared suite of assessment tasks.

Examples:

- Given an input, predict the observable execution path.
- Identify all components involved in a particular feature.
- Explain where a specific business rule is implemented.
- Predict the consequences of changing an interface or data structure.
- Identify which tests exercise a given behavior.
- Derive additional characterization tests from the documentation.
- Reconstruct a selected behavioral contract without inspecting the original implementation.

Compare predictions against independent source analysis, existing tests, controlled execution, or expert-reviewed reference answers.

Use negative cases, edge cases, and cross-module questions to expose incomplete understanding.

Output (portable): `validation-cases.yaml`, `validation-results.json`.

**TIED (where used):** Executable validation through the agent checklist (`tied-bundle/docs/agent-req-implementation-checklist.md`), composition/E2E tests, MCP `test_adequacy_validate`, verification-gated `tied_verify`; cross-project task corpora may register in `tied-project/working/evaluation/evaluation-corpus.v1.yaml` (envelope paths per row).

Acceptance: Required tasks meet predefined success thresholds; failed tasks become new investigation work.

References: SWE-QA (2025) addresses repository-level reasoning questions, while research on the test oracle problem explains why executable tests still require trustworthy expectations.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://arxiv.org\&sz=32)

arXiv

+1



### Stage 8 — Grade and adjudicate

Purpose: Convert verification and validation results into an objective, comparable quality assessment.

Use a scoring rubric established in Stage 0.

Proposed grading rubric

Factual accuracy and evidence

25 pts

Correctness of claims and quality of supporting evidence

Behavioral accuracy

20 pts

Agreement with independently observed execution and tests

Coverage and completeness

20 pts

Coverage of the predefined risk-weighted system inventory

Architectural consistency

15 pts

Consistency among components, relationships, and architectural views

Uncertainty management

10 pts

Accurate disclosure and investigation of unknowns and contradictions

Usability and reproducibility

10 pts

Successful documentation-driven tasks and reproducible evidence

Total possible 100 pts

The weights above are proposed, not established industry standards. The bars represent maximum point allocations, not measured performance.

Measurements must use explicit denominators and defined sampling policies. For instance, coverage is measured against the predetermined feature and component inventory, not against the material an agent happened to document.

Grading should combine automated checks, independently judged tasks, and adjudication of disputed results.

Proposed release criteria (portable EASAR):

- Score of at least 85/100.
- No unresolved critical contradictions.
- All mandatory architectural views present.
- Reproducible supporting evidence.
- Required behavioral validation cases passing.

A numerical score never overrides a failed critical condition. Incomplete evidence must not be converted into apparent certainty.

**TIED close-out today:** Integrated REQs use fail-closed gates (`tied_gate_check`, checklist evidence gate) plus `request_evidence_envelope_validate` with blocking error gaps; comparable arms (`envelope-gap-report`, evidence-chain statistics) deliberately avoid a single rollup score—see `tied-bundle/docs/request-evidence-envelope.md`. The rubric above remains the portable EASAR grading model; map its dimensions to gate receipts, envelope gaps, and adjudication notes rather than assuming an enforced 85/100 in every client.

Output (portable): `grade-report.json`, `quality-scorecard.md`, `adjudication-log.md`.

**TIED (where used):** `tied-project/working/{REQ-TOKEN}/evidence/request-evidence-envelope.v1.json`, optional `evidence/verification-evidence-manifest.v1.json`, `evidence-chain-profile.v1.json`, close-out gate JSON under `tied-bundle/working/{REQ-TOKEN}/gates/`, sponsor adjudication in committed slug evidence markdown.

Acceptance: Each score can be reproduced from recorded checks, outcomes, weights, and reference answers.

Reference: CodeWikiBench (ACL 2026) introduces hierarchical, repository-specific rubrics and agentic evaluation of generated documentation.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://aclanthology.org\&sz=32)

ACL Anthology



### Stage 9 — Publish and maintain

Purpose: Preserve validity as the codebase changes.

Actions:

- Publish only documentation with an explicit verification status.
- Record repository commit, analysis configuration, evaluator version, and evaluation results.
- Detect changes to symbols, components, dependencies, tests, and interfaces.
- Identify documentation claims affected by those changes.
- Invalidate affected verification results.
- Perform targeted analysis and revalidation.
- Compare quality scores across revisions.

Output: Versioned documentation, evidence registry, validation suite, and quality history.

**TIED (where used):** Git-versioned `tied-project/` YAML and committed working evidence; `[PROC-LEAP]` when implementation changes; `tied_source_graph_freshness` and targeted re-analysis after symbol/graph drift; `request_evidence_envelope_backfill` / `patch` when revision or producer artifacts change.

Acceptance: Every published documentation version is associated with an exact source revision and a recorded evaluation result.

Reference: Google's Code Wiki (2025) illustrates continuously updated repository documentation, although automated updating does not itself guarantee factual correctness.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://developers.googleblog.com\&sz=32)

Google Developers Blog



## 4. AI agent responsibilities

The methodology requires logical separation of responsibilities. These may be separate agents or isolated agent executions.

| Agent               | Responsibility                                              |
| ------------------- | ----------------------------------------------------------- |
| Orchestrator        | Plans work, manages stages and acceptance gates.            |
| Discovery agent     | Inventories repository contents and capabilities.           |
| Analysis agent      | Recovers structure, behavior, and architectural models.     |
| Evidence agent      | Collects provenance and maintains claim records.            |
| Challenger agent    | Searches for contradictions and alternative explanations.   |
| Documentation agent | Produces structured, evidence-linked documentation.         |
| Verification agent  | Independently checks claims and relationships.              |
| Validation agent    | Executes assessment tasks against reference evidence.       |
| Evaluation agent    | Calculates grades, reports failures, and recommends rework. |

The orchestrator maintains the process state. Every agent receives bounded responsibilities and produces structured artifacts.

A failed stage creates a corrective task with a defined acceptance condition. Rework must produce new evidence or a justified change, not simply regenerate the same explanation.

Human adjudication is reserved for irreducibly ambiguous requirements, unavailable evidence, conflicting authorities, or questions about the system's intended purpose.

**TIED orchestration:** The orchestrator role maps to the agent implementation checklist and CITDP gates; specialized agents map to MCP tools and checklist sub-flows (for example adversarial inquiry, claims review, scoped analysis, source graph refresh) rather than a separate runtime process per row.

## 5. Evidence and evaluation discipline

Four distinct judgments must be maintained:

| Judgment     | Question                                                                           |
| ------------ | ---------------------------------------------------------------------------------- |
| Verification | Is this assertion supported by the implementation and available evidence?          |
| Validation   | Does this recovered model accurately support its intended engineering uses?        |
| Evaluation   | How well does the result satisfy its predefined quality objectives?                |
| Grading      | What reproducible numerical or categorical assessment follows from the evaluation? |

This separation matters. A completely accurate description of one module may have excellent factual verification but poor repository coverage. Conversely, extensive documentation may appear complete yet contain unsupported claims.

Maintain three independent records: an evidence ledger recording observations, a claim ledger recording interpretations and verification states, and an evaluation ledger recording measured outcomes.

In TIED clients, those roles map approximately to: fidelity/adversarial **finding ledgers** and provenance JSON (observations), claims review + brownfield intent matrix + REQ/ARCH/IMPL tokens (interpretations and verification state), and request evidence envelope + gate receipts + evaluation corpus rows (measured close-out outcomes)—without collapsing them into one file.

## 6. Final deliverables

### 6.1 TIED knowledge package (preferred in this repository)

A completed brownfield or recovery-aligned engagement in a TIED client produces:

```text
tied-project/                          # canonical traceability (commit)
  requirements.yaml, requirements/
  architecture-decisions.yaml, architecture-decisions/
  implementation-decisions.yaml, implementation-decisions/
  implementation-decisions/IMPL-*-pseudocode.md
  citdp/CITDP-{REQ-TOKEN}.yaml         # after persist-citdp-record

tied-project/working/{REQ-TOKEN}/      # committed process evidence
  PLAN.md
  checklist-tracker.yaml
  CITDP-{REQ-TOKEN}.yaml               # draft until persisted
  evidence/request-evidence-envelope.v1.json
  evidence/intent-elevation-matrix.md  # brownfield intent elevation
  evidence/*-evidence.md                 # checklist slug summaries
  handoffs/{phase}.yaml

tied-bundle/reports/source-graph/      # regenerable structural report
  source-graph-index.v1.json

tied-bundle/working/{REQ-TOKEN}/       # local working evidence (gitignored on clients)
  gates/
  adversarial-inquiry/
    obligation-report.json
    finding-ledger.jsonl
    gate-result.json
    evidence-provenance.json
  claims-evidence-review/                # MCP output_dir when run

tied-project/working/evaluation/       # optional cross-REQ policy corpus
  evaluation-corpus.v1.yaml
```

Human-consumable architecture and behavior live primarily in TIED detail YAML, IMPL pseudo-code sidecars, and committed working markdown—not a standalone `docs/features/` tree unless the product team adds one outside TIED.

Operator guides: `tied-bundle/docs/brownfield-intent-elevation.md`, `tied-bundle/docs/tied-fidelity-research.md`, `tied-bundle/docs/request-evidence-envelope.md`, `tied-bundle/docs/working-artifact-placement.md`.

### 6.2 Portable EASAR export (optional)

Engagements outside TIED—or exports for external auditors—may still assemble a single directory:

```text
recovery/
  scope.md
  evaluation-contract.yaml
  inventory.json
  component-catalog.yaml
  architecture-model.md
  behavior-catalog.yaml
  contracts.yaml
  claims.jsonl
  evidence.jsonl
  uncertainties.yaml
  docs/
    system-overview.md
    components/
    features/
    interfaces/
    data-flows/
  evaluation/
    verification-report.json
    validation-cases.yaml
    validation-results.json
    quality-scorecard.md
    adjudication-log.md
  manifest.yaml
```

TIED does not require creating `recovery/` in the repo root; treat this layout as a **serialization target** mappable from the paths in §6.1.

The documentation is the human-consumable result. The other files provide the basis for automated verification, validation, auditing, grading, and subsequent reanalysis.

## 6.3 Stage-to-tool index (TIED)

| EASAR stage | Primary TIED entry points |
| --- | --- |
| 0 — Scope / contract | CITDP + `PLAN.md` + checklist tracker; `[PROC-CITDP]` |
| 1 — Discover / inventory | `[PROC-PROJECT_SURVEY_AND_SETUP]`; `tied_scoped_analysis_run` |
| 2 — Structural models | `tied_source_graph_*` → `source-graph-index.v1.json` |
| 3 — Behavior / intent | IMPL sidecars (Track C); fidelity research read-only audit |
| 4 — Claims / evidence | `tied_claims_evidence_review_run`; intent elevation matrix; `evidence_chain_profile_generate` |
| 5 — Synthesize docs | Project REQ/ARCH/IMPL YAML; working slug evidence |
| 6 — Independent verify | `tied_adversarial_inquiry_run`; `tied_validate_consistency`; claims review |
| 7 — Executable validation | Checklist TDD/E2E path; `test_adequacy_validate`; `tied_verify` |
| 8 — Grade / adjudicate | Envelope validate + gates; portable rubric in §Stage 8 |
| 9 — Publish / maintain | Git + LEAP; graph freshness; envelope backfill/patch |

## 7. Implementation bridge (for the upcoming build plan)

This section does not change EASAR logic; it tells planners and implementers **what to name**, **what already exists**, and **what shape new work will probably take** in the TIED store repo.

### 7.1 Portable filename → TIED canonical (implement the right column)

| Portable EASAR artifact | TIED canonical (current or planned) | Notes |
| --- | --- | --- |
| `scope.md` | `tied-project/working/{REQ}/PLAN.md` + CITDP scope fields | Do not add repo-root `scope.md` |
| `evaluation-contract.yaml` | `checklist-tracker.yaml` + `CITDP-*.yaml` + envelope `identity` | Prefer extending envelope/CITDP over a second contract file |
| `baseline.json` | Matrix header **Baseline revision** + **Scope tokens**; CITDP `scope` | Same facts as brownfield baseline lock |
| `inventory.json` | Receipt from `tied_scoped_analysis_run` (e.g. `walk_summary`) | **Gap:** structured `inventory.v1.json` under `evidence/` is a likely plan deliverable |
| `component-catalog.yaml` | Binding inventory + ARCH boundaries | Tie to `binding_inventory_validate` output |
| `structure.json` / `dependency-graph.json` | `tied-bundle/reports/source-graph/source-graph-index.v1.json` | TS/JS static only today |
| `architecture-model.md` | ARCH detail YAML + optional slug evidence markdown | Not `docs/architecture/` |
| `behavior-catalog.yaml` | REQ/IMPL sidecars + tests as evidence | **Gap:** machine `behavior-catalog.v1` optional later |
| `contracts.yaml` | IMPL pseudo-code PRE/POST/EFFECTS blocks | Contract vocabulary per `[PROC-IMPL_PSEUDOCODE_TOKENS]` |
| `execution-traces/` | Test logs, composition tests, inquiry manifests | Under local working or CI artifacts; envelope-indexed |
| `claims.jsonl` / `evidence.jsonl` | `intent-elevation-matrix.md` or `intent-elevation.v1` YAML; claims-review output dir | Separate from adversarial `finding-ledger.jsonl` |
| `uncertainties.yaml` | Matrix `unresolved` rows + proof boundaries | |
| `docs/`, `feature-catalog.md` | Project REQ tokens + FEAT views if used | Feature-oriented prose lives in TIED detail files |
| `traceability.json` | `tied_validate_consistency` + index cross-refs | |
| `verification-report.json` | `obligation-report.json` + `gate-result.json` (+ synthesis **Gap**) | Adapter may merge for export only |
| `validation-cases.yaml` | `tied-project/working/evaluation/evaluation-corpus.v1.yaml` rows | **Gap:** SWE-QA-style task bank per repo revision |
| `validation-results.json` | Test/verify receipts + corpus run reports | |
| `grade-report.json` / scorecard | `envelope-gap-report`, evidence-chain statistics, gate JSON | No default 85/100 rollup in TIED close-out |
| `manifest.yaml` | `evidence/request-evidence-envelope.v1.json` | Envelope is the in-repo manifest |
| `recovery/` tree | **Export-only** serializer (planned) | Read-only map from §6.1 → §6.2; never the git source of truth |

### 7.2 Stage maturity (today → plan target)

| Stage | Maturity | Existing traceability | Likely plan work |
| --- | --- | --- | --- |
| 0 | **Partial** | CITDP, PLAN, brownfield baseline | Optional `recovery-contract.v1` as envelope extension; document GQM questions in CITDP |
| 1 | **Partial** | `tied_scoped_analysis_run`, `[PROC-PROJECT_SURVEY_AND_SETUP]` | Versioned `inventory.v1.json` receipt; link rows to matrix `#` |
| 2 | **Partial (slice 1)** | `[REQ-TIED_SOURCE_GRAPH_COMPREHENSION]` | Multi-language graph, ARCH reflexion diff vs graph |
| 3 | **Partial** | Track C prompts, `[REQ-TIED_FIDELITY_RESEARCH]` | Behavior catalog generator from graph + sidecars; controlled execution hooks |
| 4 | **Partial** | `[REQ-TIED_BROWNFIELD_INTENT_ELEVATION]`, `[REQ-TIED_CLAIMS_EVIDENCE_REVIEW]` | Unified claim id namespace; wire challenger to inquiry without merging ledgers |
| 5 | **Partial** | TIED YAML MCP, promotion slugs | Diagram/view templates as committed evidence markdown, not new top-level `docs/` |
| 6 | **Partial** | `[REQ-TIED_ADVERSARIAL_INQUIRY]`, validators | Reflexion-model report artifact (ARCH ↔ implementation) |
| 7 | **Gap / partial** | Checklist TDD, `test_adequacy_validate`, `tied_verify` | Repository comprehension task suite (SWE-QA-aligned) in `working/evaluation/` |
| 8 | **Partial** | `[REQ-REQUEST_EVIDENCE_ENVELOPE]`, gates | Rubric **mapping** doc + optional scored pilot; keep fail-closed gates authoritative |
| 9 | **Partial** | LEAP, `tied_source_graph_freshness`, envelope patch/backfill | Claim invalidation rules when graph or symbols drift |

### 7.3 How implementation will probably be organized

1. **Single umbrella REQ** — Expect one store feature REQ (placeholder **`REQ-TIED_EASAR_RECOVERY`**) with satisfaction criteria derived from §7.2 gaps, depending on `[REQ-TIED_BROWNFIELD_INTENT_ELEVATION]`, `[REQ-TIED_SOURCE_GRAPH_COMPREHENSION]`, `[REQ-TIED_CLAIMS_EVIDENCE_REVIEW]`, `[REQ-TIED_FIDELITY_RESEARCH]`, `[REQ-TIED_ADVERSARIAL_INQUIRY]`, and `[REQ-REQUEST_EVIDENCE_ENVELOPE]`—not a fork of TIED layout.

2. **PROC composition** — Prefer **`[PROC-EASAR_RECOVERY]`** (or an extension of **`[PROC-BROWNFIELD_INTENT_ELEVATION]`**) that **references** existing slugs and tools; avoid a second full checklist parallel to `[PROC-AGENT_REQ_CHECKLIST]`.

3. **Tracker mode (resolved in store MVP)** — Reuse **`brownfield_intent_elevation.mode`** with facet **`engagement: easar_full`** for Mode C; do **not** add a parallel `recovery_engagement.mode` field. Enrolled stack: **`[REQ-TIED_EASAR_RECOVERY]`**, **`[ARCH-TIED_EASAR_ARTIFACT_MODEL]`**, **`[IMPL-TIED_EASAR_RECEIPTS]`**, **`[PROC-EASAR_RECOVERY]`** (MVP slices 0–4; slices 5–6 deferred).

4. **MCP surface** — New tools will probably be **receipt builders and exporters** (inventory, reflexion diff, validation task runner, `recovery-export` mapper) rather than mutating methodology YAML. Read/write project tokens stays on existing MCP/`tied-cli`.

5. **Artifact versioning** — Follow existing pattern: `*.v1.json`, `intent-elevation.v1`, schema in MCP tests; register new local prefixes in `mcp-server/src/working-root.ts` when adding high-volume trees.

6. **Working plan location** — Build plan artifacts: `tied-project/working/REQ-TIED_EASAR_RECOVERY/` (or the token chosen in CITDP): `PLAN.md`, CITDP, envelope, dogfood matrix on this repo.

7. **Close-out** — Same integrated contract as other store features: Authoritative Tracker, `request_evidence_envelope_validate` with blocking gaps when `depth_tier` warrants, optional adversarial inquiry activation—**not** a standalone EASAR score replacing gates.

### 7.4 Vocabulary and prompts (RECORD in plan, not ad hoc renames)

| EASAR term | TIED preferred term | Where to RECORD |
| --- | --- | --- |
| Architecture recovery engagement | **recovery engagement** (mode C) | `tied-project/vocab/` + routing keyword → this doc |
| Evidence-backed codebase model | **evidence-backed traceability stack** | quality-assurance / fidelity-research glossaries |
| Claim registry | **intent elevation matrix** + claims-review artifacts | brownfield template; claims-evidence module |
| Evaluation ledger | **request evidence envelope** + gate receipts | `request-evidence-envelope.md` |
| Grading | **comparable arms** + optional rubric pilot | quality-assurance; §Stage 8 portable rubric |

Agent prompts already split roles: Track C **creates** sidecars ([impl-pseudocode-from-code-agent-prompt.md](../../tied-bundle/docs/impl-pseudocode-from-code-agent-prompt.md)); fidelity audit **grades** them ([pseudocode-fidelity-audit-agent-prompt.md](../../tied-bundle/docs/pseudocode-fidelity-audit-agent-prompt.md)). A full recovery plan should **sequence** those prompts in Stages 3–6, not merge them into one mega-prompt.

### 7.5 Implementer anti-patterns (do not do in the build)

- Rename `tied-project/` → `recovery/` or move working roots to repo root (brownfield clients use `tied-install --migrate-layout` away from undivided `working/`).
- Collapse adversarial **finding-ledger.jsonl** and claims-review ledgers into one file (architecture explicitly keeps them distinct).
- Treat Track C sidecars or `observed` matrix rows as approved REQ intent.
- Add methodology content under client-writable paths or commit regenerable gate JSON under `tied-project/working/` to satisfy CI.
- Enforce portable **85/100** as a blocking gate without sponsor **costly choice**; map rubric dimensions to envelope/gap reports first.

### 7.6 Suggested plan slice order (dependency-safe)

1. Inventory + envelope hooks (Stages 0–1) — unblocks matrix row ↔ file coverage.
2. Source graph + matrix `code_graph` rows (Stage 2) — extends `[REQ-TIED_SOURCE_GRAPH_COMPREHENSION]`.
3. Matrix + claims-review choreography (Stage 4) — extends BFIE + claims evidence.
4. Reflexion / verification synthesis (Stage 6) — builds on graph + ARCH detail.
5. Validation task corpus (Stage 7) — extends `evaluation-corpus.v1.yaml`.
6. Portable `recovery/` export adapter (Stage 9 / §6.2) — read-only, last.

Related operator docs to keep in sync when the plan lands: [brownfield-intent-elevation.md](../../tied-bundle/docs/brownfield-intent-elevation.md), [client-development-index.md](../../tied-bundle/docs/client-development-index.md) (add a **Legacy / architecture recovery** scenario row), [processes.md](../../tied-bundle/docs/processes.md) § brownfield.

## 8. References

The most relevant methodological and research foundations are:

1. [Chikofsky & Cross — Reverse Engineering and Design Recovery: A Taxonomy (1990)](https://ieeexplore.ieee.org/document/43044/?utm_source=chatgpt.com). Defines the original engineering terminology.
2. [Kazman, O'Brien & Verhoef — Architecture Reconstruction Guidelines (2003)](https://www.sei.cmu.edu/library/architecture-reconstruction-guidelines-third-edition/?utm_source=chatgpt.com). Establishes the architecture recovery approach.
3. [ISO/IEC/IEEE 42010:2022](https://www.iso.org/standard/74393.html?utm_source=chatgpt.com). Specifies architectural description requirements.
4. [Murphy, Notkin & Sullivan — Software Reflexion Models (2001)](https://doi.org/10.1109/32.917525?utm_source=chatgpt.com). Provides design-to-implementation consistency analysis.
5. [Basili et al. — Goal–Question–Metric](https://onlinelibrary.wiley.com/doi/abs/10.1002/0471028959.sof142?utm_source=chatgpt.com). Provides goal-driven measurement principles.
6. [Hoang et al. — CodeWiki and CodeWikiBench (2026)](https://aclanthology.org/2026.findings-acl.288/?utm_source=chatgpt.com). Provides a recent AI-first repository documentation and evaluation approach.
7. [Peng et al. — SWE-QA (2025)](https://arxiv.org/abs/2509.14635?utm_source=chatgpt.com). Provides repository-level comprehension evaluation tasks.
8. [Barr et al. — The Oracle Problem in Software Testing (2015)](https://discovery.ucl.ac.uk/id/eprint/1471263/?utm_source=chatgpt.com). Explains the limitations of automated behavioral verification.

## 9. Central methodological requirement

The critical advancement in this proposed process is to make the evidence and evaluation structure as important as the documentation itself.

A successful AI system should not merely be able to answer:

"What does this codebase do?"

It should also be able to answer:

- What evidence supports that conclusion?
- What was actually tested?
- What remains unknown?
- Which conclusions were independently verified?
- What contradictory evidence was discovered?
- How complete is the recovered knowledge?
- What measurable evidence supports the assigned grade?

The intended final product is therefore not simply documentation. It is a versioned, evidence-backed model of the codebase whose quality can be independently assessed and whose claims can be revalidated as the implementation evolves.