# TIED Methodology Evaluation Framework

**Status:** Refined planning and inventory (2026-08-26; `refine-plan` pass)  
**Repository:** TIED methodology source (`stdd`)  
**Document type:** Evaluation charter — not a product requirement, not canonical project YAML; this refinement is documentation and vocabulary only  
**Supersedes:** Nothing (first edition)

---

## 0. Refine outcomes

This `refine-plan` pass resolves the charter's open terminology and operating
rules without changing behavior, creating semantic tokens, or mutating project
REQ/ARCH/IMPL YAML.

| Preferred term | Canonical meaning |
|---|---|
| **evaluation corpus** | Versioned `evaluation-corpus.v1` registry of control-project rows, stored at `working/evaluation/evaluation-corpus.v1.yaml`; distinct from a fidelity project manifest and a report input manifest. |
| **comparable arms** | `comparable-arms.v1` per-field metrics with explicit denominators and proof boundaries; never a maturity score. |
| **execution policy** | `live_ok`, `static_only`, or `live_attempted`, with the observed outcome recorded; every row is labeled `live` or `static`. |
| **control project** | Non-TIED or matched successful-change sample used to avoid incident-only selection bias. |
| **historical defect proxy** | Non-TIED revert, hotfix, or defect-labeled issue with `proof_boundary: human_decision`; it is not a confirmed finding. |
| **privacy tier** | `operator_local`, `shareable_hashed`, or `forbidden_export`, controlling path, identity, and source-tree export. |

Accepted operating decisions:

1. Phase 0's registry path and schema are fixed below; it is an operator
   artifact, not a `tied/` project record.
2. Phase 1 is fixture-ready, not client-pilot-complete. Existing evidence-chain
   fixtures and deferred-stats v2 acceptance are the grounding evidence; a
   future operator pass must select 3–5 real TIED clients at fixed commits.
3. Q1 publishes separate TIED confirmed-finding and non-TIED historical-defect-
   proxy arms on matched strata. Q5 pairs TIED MCP/checklist/wall-time cost
   with non-TIED git/PR/review/CI duration, never raw token or file counts.
4. The default shareable privacy tier is `shareable_hashed`; absolute paths and
   source trees are excluded. Secrets, credentials, and full trees are
   `forbidden_export`.
5. A denominator subcohort with `n < 2` stops publication of its ratio; report
   the subcohort as insufficient rather than emitting a ratio or treating it as
   zero.

Operating contract: `depth_tier: minimal`, `gate_policy: advisory`, and
evidence-chain `profile_depth: not_measured`. This is a docs-only pass with no
inquiry activation claim. CITDP persistence is skipped under
[`tied/docs/citdp-policy.md`](../tied/docs/citdp-policy.md) because the change
is non-executable documentation and vocabulary only; the per-request Tracker
records that rationale at
`working/evaluation/charter-refine-plan-20260826.yaml`.

---

## Subject

How the TIED methodology repository should **measure**, **compare**, and **improve** TIED based on evidence from:

1. **TIED vs non-TIED** — client or reference repositories that do and do not use TIED traceability, checklists, and MCP tooling.
2. **TIED-to-TIED** — the same repository at different TIED/methodology versions, or different TIED client repositories under comparable conditions.

The goal is **evidence-guided methodology self-improvement**: identify where TIED practices correlate with better outcomes, where they add cost without benefit, and where tooling or process gaps block adoption — without treating structural checks as proof of product quality.

---

## Scope

### In scope

- Inventory of **existing** measurement and evaluation surfaces in this repository and inherited client tooling.
- A **planned** evaluation program: corpus design, execution modes, aggregation rules, and improvement promotion.
- **Principles** for data collection, interpretation, and acting on results.
- Explicit treatment of **static/historical analysis** vs **live execution**, including the constraint that non-TIED repos cannot be executed reliably today.
- **Re-evaluation triggers** so this charter can be revised when capabilities or corpus policy change.

### Out of scope

- Creating or mutating project REQ/ARCH/IMPL YAML from this document alone.
- Universal **maturity scores**, leaderboard rankings, or cross-cohort numeric rollups that collapse proof boundaries (forbidden by [REQ-EVIDENCE_CHAIN_REPORT] and quality-assurance vocabulary).
- Automatic promotion of findings into canonical methodology without human review ([PROC-LEAP], LEAP proposal queue, feedback promotion boundary).
- Replacing [docs/tied-fidelity-research-plan.md](tied-fidelity-research-plan.md), [docs/tied-improvement-roadmap.md](tied-improvement-roadmap.md), or [docs/tied-value-proposition-matrix.md](tied-value-proposition-matrix.md) — this document **integrates** them for the evaluation use case.

### Audience

Methodology maintainers, research operators, and sponsors deciding where to invest in TIED tooling, checklists, and adoption guidance.

### Re-evaluation

Revise this document when any of the following change materially:

- New cross-project aggregation or non-TIED adapter ships (or dormant contracts activate).
- Evidence-chain report schema or compatibility-key policy changes.
- Fidelity research pilot completes with adjudicated case reports.
- Non-TIED live-execution policy changes (e.g. standardized container/fixture corpus).
- Sponsor accepts or rejects a proposed **methodology improvement** backed by evaluation evidence.

Record revisions in the **Revision log** at the end; behavior-changing implementations follow normal TIED checklist and CITDP policy separately.

---

## Evaluation questions

The program must answer questions that **structural validation alone cannot**:

| # | Question | Primary comparison |
|---|----------|-------------------|
| Q1 | Do TIED projects show **fewer confirmed defects per behavior-changing change** than matched non-TIED projects? | TIED confirmed-finding arm vs non-TIED historical-defect-proxy arm on matched strata; never one combined defect rate |
| Q2 | Do **traceability and fidelity findings** predict later incidents or rework? | TIED-to-TIED + within-TIED |
| Q3 | Where do defects **originate** in the stack (vocabulary → REQ → ARCH → IMPL → tests → code → bindings)? | TIED (fidelity research) |
| Q4 | Does **checklist/adherence evidence** correlate with fewer gate failures or less LEAP rework? | TIED-to-TIED (version/tooling) |
| Q5 | What is the **cost** of TIED (time, tokens, tool calls, checklist steps) relative to observed benefit? | Pair TIED MCP metrics, checklist steps, and wall time with non-TIED git/PR cycle time, review volume, and CI duration; do not compare raw token or file counts |
| Q6 | Which methodology changes **reduce cost** without weakening proof boundaries? | TIED self-improvement loop |

Denominators must be explicit (prefer **change count** and **comparable cohort keys**, not raw token or file counts). See [docs/tied-fidelity-research-plan.md](tied-fidelity-research-plan.md) §9.

---

## Comparison dimensions

### A. TIED vs non-TIED

| Dimension | TIED signal (when present) | Non-TIED signal (static/historical) | Live execution today |
|-----------|---------------------------|-------------------------------------|----------------------|
| Traceability structure | `tied_validate_consistency`, `traceability_gap_report`, token audit | Absence of `tied/`; ad hoc comments; issue/PR references only | TIED: yes; non-TIED: N/A |
| Specification depth | REQ/ARCH/IMPL YAML + pseudo-code sidecars | README, ADRs, inline comments, OpenAPI/spec files | TIED: validators yes; non-TIED: parse only |
| Test discipline | Binding inventory, composition evidence, test adequacy metadata | Test file layout, CI config, coverage artifacts | TIED: usually yes; non-TIED: **unreliable** |
| Change analysis | CITDP records, quality evidence matrix | PR description, review threads, changelog | TIED: artifact read; non-TIED: git/PR only |
| Process adherence | Checklist Tracker, adherence ledger, gate receipts | Commit message patterns, CI gates (lint/test) | TIED: partial; non-TIED: CI logs only |
| Defect origin | Fidelity findings, case reports | Issues, revert commits, hotfix branches | TIED: inquiry + tests; non-TIED: historical |

Non-TIED repos enter the corpus as **control projects**. Comparisons are **stratified** (language, team size, domain, change size, binding complexity) — not naive global averages.

### B. TIED-to-TIED

| Comparison type | Examples | Existing tooling |
|-----------------|----------|------------------|
| Same repo, different methodology version | Before/after `copy_files.sh` refresh | `compare_yaml_dirs`, methodology migration docs, git history |
| Same repo, different maturity | With/without pseudo-code sidecars, verification-gated mode | Evidence chain profile at `integrated` vs `human_research` depth |
| Different repos, same TIED version | Client cohort under one `compatibility_key` | Evidence chain statistics report v1/v2 |
| Same repo, different tool usage | Metrics on vs off, inquiry integrated vs minimal | MCP usage JSONL + `analyze_tied_mcp_metrics.rb` |

Two evidence chain profiles are comparable only when `schema_version`, `profile_depth`, and ratio **denominators** align ([tied/docs/evidence-chain-profile.md](../tied/docs/evidence-chain-profile.md) § Comparison rules). v2 adds **denominator fingerprint** sub-cohorts when denominators differ within a cohort.

---

## What exists now

Capabilities grouped by **proof boundary** — what each can and cannot establish.

### 1. Structural and traceability (TIED repos; partial static on any repo)

| Surface | Location / invocation | Proves | Does not prove |
|---------|----------------------|--------|----------------|
| `tied_validate_consistency` | TIED YAML MCP / `tied-cli.sh` | Index/detail consistency, REQ→ARCH→IMPL links | Runtime behavior |
| `pseudocode_validate` | MCP | Pseudo-code structure, token refs, contract grammar | Tests pass |
| `tied_scoped_analysis_run` | MCP; modes in [docs/scoped-analysis-and-ignore.md](scoped-analysis-and-ignore.md) | Token discovery, registry gaps, REQ↔test/production gaps | Semantic fidelity |
| `./scripts/validate_tokens.sh` | Repo root | Token registry coverage | Implementation correctness |
| `binding_inventory_validate` | MCP | Binding row completeness, E2E justification structure | Bindings work at runtime |
| `test_adequacy_validate` | MCP | Test-plan metadata completeness | Test strength |
| `tied_cycles`, `tied_backlog` | MCP | Dependency cycles, backlog shape | Delivery success |
| `yaml_semantic_compare`, `compare_yaml_dirs` | `scripts/` | YAML semantic equivalence, directory diff | Product behavior |
| `validate_vocab_index.rb` | `scripts/` | Glossary index shape | Domain correctness |
| `lint_yaml` / `yaml_tool.sh` | `scripts/` | Canonical YAML | Intent quality |

**Non-TIED use:** `token_scan` and TIED-specific modes are inapplicable. Generic scoped walks (custom roots via `.tiedanalysis.yaml`) can still count files, discover test patterns, and scan for comment conventions if configured — but there is no standard non-TIED profile yet.

### 2. Evidence chain completeness (TIED repos; live execution required for `observed` quality rows)

| Surface | Location | Proves | Does not prove |
|---------|----------|--------|----------------|
| `quality_evidence_collect_manifest` | MCP / CLI | Declared commands ran; provenance captured | Full quality bar met |
| `evidence_chain_profile_generate` | MCP / CLI | Chain completeness with denominators and proof boundaries | Universal maturity |
| `evidence-chain-report` CLI | `mcp-server/dist/cli/evidence-chain-report.js` | Multi-client **count statistics** within compatible cohorts | Cross-cohort ranking |
| Path B manual profile | [tied/docs/evidence-chain-profile.md](../tied/docs/evidence-chain-profile.md) | Documented assumptions when MCP validators unavailable | Validator results not run |

Fixtures and golden reports: `working/evidence-chain/`, `working/REQ-DEFERRED_STATS_ROADMAP/v2-acceptance/`.

**TIED-to-TIED:** Primary **implemented** cross-repo comparison path. Operators generate profiles per client revision, list them in `evidence-chain-report-inputs.v1`, run aggregator in `strict` or `partial` mode.

### 3. Fidelity, defect origin, and adversarial inquiry (TIED repos)

| Surface | Location | Proves | Does not prove |
|---------|----------|--------|----------------|
| Fidelity research plan + vocab | [docs/tied-fidelity-research-plan.md](tied-fidelity-research-plan.md), [tied/vocab/fidelity-research.md](../tied/vocab/fidelity-research.md) | Taxonomy, study design, control samples | Automated cross-project stats (partially implemented) |
| `tied_adversarial_inquiry_run` | MCP | Obligation graph, findings, gate results (when activated) | Methodology superiority |
| `tied_checklist_gate_validate` | MCP | Tracker/CITDP/activation evidence contracts | Developer productivity |
| `tied_adherence_reconcile_run` | MCP | Ledger vs Tracker vs gate consistency | Checklist was followed in intent |
| Pseudo-code fidelity audit prompt | [tied/docs/pseudocode-fidelity-audit-agent-prompt.md](../tied/docs/pseudocode-fidelity-audit-agent-prompt.md) | Bidirectional block-level analysis (human/agent) | Scale without adjudication |
| Controlled fixtures | e.g. `mcp-server/test/fixtures/adversarial-inquiry-*` | Regression of analysis tooling | Real-world defect rates |

**Non-TIED use:** Not applicable without TIED artifacts. Historical proxy: manual case study using git blame, test diffs, and issue links.

### 4. Operational and behavioral signals

| Surface | Location | Proves | Does not prove |
|---------|----------|--------|----------------|
| MCP usage metrics | `TIED_MCP_COLLECT_METRICS=1` → JSONL; [scripts/analyze_tied_mcp_metrics.rb](../scripts/analyze_tied_mcp_metrics.rb) | Tool adoption, duration, failure rate, client attribution | Outcome quality |
| Feedback export | `tied_feedback_export`, `tied/feedback.yaml` | Declared pain points and improvement ideas | Representative sample |
| LEAP proposal queue | [docs/leap-proposal-queue.md](leap-proposal-queue.md) | Reviewed promotion candidates | Accepted improvements |
| CITDP records | `tied/citdp/CITDP-*.yaml` | Change analysis audit trail | Analysis was correct |
| Checklist adherence ledger | `agent-adherence-event.v1` JSONL | Lifecycle event sequence with hashes | Agent understood instructions |
| Conversation/hook analysis | [docs/conversation-analysis-tools.md](conversation-analysis-tools.md) | Session patterns, tool use from Cursor hooks | Causal impact on defects |
| `agentstream` dry-run / pipeline | `tools/agentstream` | Checklist rendering, turn structure | Production outcomes |

### 5. Documentation and thesis artifacts (interpretive, not measured)

These guide **hypotheses** and **human review**, not automated scoring:

- [docs/tied-value-proposition-matrix.md](tied-value-proposition-matrix.md) — layer purposes and proof boundaries  
- [docs/leap-tied-citdp-costs-and-benefits.md](leap-tied-citdp-costs-and-benefits.md) — cost framing  
- [docs/tied-improvement-roadmap.md](tied-improvement-roadmap.md) — feature orchestration and feedback loops (Batch 5 research records)

### 6. Explicitly dormant (planned contracts, no runtime claim)

Per [REQ-DEFERRED_STATS_ROADMAP] close-out and quality-assurance vocabulary:

- `COLLECT_FILE_INVENTORY` — file population denominators for cross-repo comparison  
- `COLLECT_VOCAB_DRIFT` — glossary vs artifact naming drift  

Pseudo-code exists; orchestrator wiring, tests, and profile activation are **excluded** until a separate governed change.

---

## Execution modes: static/historical vs live

```text
                    ┌─────────────────────────────────────┐
                    │         Evaluation corpus            │
                    └─────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
   TIED client repos            TIED methodology repo        Non-TIED repos
   (live + static)              (live + static)              (static primary)
          │                           │                           │
          ├─ Live: tests, lint,       ├─ Full self-dogfooding     ├─ Git history, PRs,
          │  MCP validators,          │                           │  issues, CI logs
          │  quality manifest,        └─ Evidence chain +         ├─ File/test layout
          │  adversarial inquiry         fidelity on itself           scans (custom)
          │                                                      └─ Live run: **only when
          └─ Static: checkout at                                 build/test succeeds
             revision; profile from
             archived manifest
```

### TIED repositories (any client + `stdd`)

**Live execution (preferred when available):**

- Run project test/lint scripts; collect verification evidence manifest.  
- Generate evidence chain profile with `profile_depth: integrated` (or `human_research` for studies).  
- Run structural validators via MCP; optional `invoke_structural_validators: true`.  
- Enable opt-in metrics (`TIED_MCP_COLLECT_METRICS`, `TIED_MCP_PROJECT_ID`) for tool-cost comparisons.  
- For integrated depth, run adversarial inquiry per [REQ-TIED_ADVERSARIAL_INQUIRY] policy when feature applies.

**Static/historical:**

- Checkout fixed commit; regenerate or reuse archived profiles and manifests.  
- Analyze CITDP, LEAP proposals, feedback exports, adherence ledgers at that revision.  
- Compare methodology versions via `compare_yaml_dirs` on `tied/methodology/` snapshots in git history.

**Constraint:** Confirm `tied_config_get_base_path` matches the target project's absolute `tied/` before any MCP write ([AGENTS.md](../AGENTS.md), CITDP RISK-010).

### Non-TIED repositories

**Static/historical (default and primary today):**

| Data source | Metrics examples | Limitations |
|-------------|------------------|-------------|
| Git log / tags | Change frequency, revert rate, hotfix ratio | No REQ linkage |
| Pull requests | Review depth, test mentions, time-to-merge | Inconsistent structure |
| Issues | Defect labels, time-to-close | Selection bias |
| CI workflow files + archived runs | Test presence, pass/fail trends | May be missing or flaky |
| Test file tree | Unit vs integration ratio, naming conventions | No binding inventory |
| Dependency/config files | Language, framework, lockfiles | Not behavior |

**Live execution (selective, opportunistic):**

- Attempt only when the repo has a **documented, reproducible** build/test entry (README, Makefile, `package.json`, CI parity).  
- Record **failure reason** when execution fails (missing deps, platform, secrets, broken upstream) — do not drop the repo silently.  
- Do **not** require live execution for non-TIED inclusion in the corpus; static arms remain valid with explicit `proof_boundary: human_decision` for outcome labels.

**Gap:** There is no first-class **non-TIED profile generator** analogous to `evidence_chain_profile_generate`. Cross-methodology comparison today is **hybrid**: TIED structural arms from existing tools + non-TIED static arms from git/CI/issue adapters (to be built).

---

## Planned evaluation program

Phases are ordered by dependency and risk. Each behavior-changing phase requires its own REQ/ARCH/IMPL stack and CITDP per normal TIED process — this section is the **charter**, not implementation authorization.

### Phase 0 — Corpus registry and normalization (P0)

**Deliverable:** Versioned `evaluation-corpus.v1` manifest at
`working/evaluation/evaluation-corpus.v1.yaml` listing one row per control
project. Each row has:

- `schema_version`, `project_id`, `client_alias`, TIED/non-TIED class,
  language, and domain tags
- analysis roots and ignore rules (`.tiedanalysis.yaml` or equivalent)
- TIED methodology snapshot id when applicable
- test-classifier overrides
- `execution_policy` (`live_ok`, `static_only`, or `live_attempted`) and
  recorded outcome
- `privacy_tier` (`operator_local`, `shareable_hashed`, or `forbidden_export`)
- fixed analysis commit

**Normalization gate:** No cross-project statistic until roots, exclusions, and versions are recorded ([docs/tied-fidelity-research-plan.md](tied-fidelity-research-plan.md) §7.2).

### Phase 1 — TIED-to-TIED cohort reporting (P0, operator pilot complete)

**Status (2026-08-27):** Operator pilot complete with four TIED clients at HEAD
(`nsync`, `treegrep`, `panorama`, `indescript`). Profiles generated at
`integrated` depth with `invoke_structural_validators: true`. Cross-client v2
report: `phase1-pilot-evidence-chain-report.yaml` (n=4, one denominator
sub-cohort). Within-repo HEAD vs historical: `phase1-within-repo-evidence-chain-report.yaml`.
Fixture baseline from prior pass retained under `phase1-evidence-chain-report.*`.

All clients declare `tied_methodology_version: 3.0.0`; effective coverage
varies by adoption (pseudocode sidecars, git-tracked `tied/`, validator
pass/fail). See `phase1-pilot-residual-risks.yaml` for per-client notes.

**Build on:** [REQ-EVIDENCE_CHAIN_REPORT], evidence chain profile, deferred stats roadmap v2 acceptance.

| Step | Action |
|------|--------|
| 1 | Use the existing evidence-chain fixtures as the contract baseline: [working/evidence-chain/example-report-inputs.yaml](../working/evidence-chain/example-report-inputs.yaml), `stdd-integrated.json`, `stdd-human_research.json`, client `1787461685` profiles, and [working/REQ-DEFERRED_STATS_ROADMAP/v2-acceptance/](../working/REQ-DEFERRED_STATS_ROADMAP/v2-acceptance/). |
| 2 | For the operator pilot, select 3–5 TIED clients at fixed commits; this pass does not invent or publish a client list. |
| 3 | At fixed commits, generate profiles plus optional quality manifests. |
| 4 | Aggregate with `evidence-chain-report` v2; respect denominator sub-cohorts. |
| 5 | Stratify by `profile_depth`, inquiry activation, and metrics opt-in — not one rollup. |
| 6 | Do not publish a ratio when any denominator subcohort has `n < 2`; emit an insufficient-sample status with numerator, denominator, and excluded inputs instead. |
| 7 | Publish read-only report artifacts under `working/evaluation/` with residual risks. |

**Outcome:** Repeatable **structural chain completeness** comparison across TIED clients; input to Q4 and Q6.

**Alignment recommendations (E0 approved 2026-08-27):** Per-client P0–P2 remediation actions derived from this pilot are published in [`docs/tied-project-alignment-recommendations.md`](tied-project-alignment-recommendations.md). Client execution handoffs live at [`working/evaluation/client-remediation-handoffs.yaml`](../working/evaluation/client-remediation-handoffs.yaml). Remediation runs in each client repository; the TIED repo holds observations, approval record, and operator-local profile artifacts only.

### Phase 2 — Fidelity research pilot with control sample (P0)

**Build on:** [REQ-TIED_FIDELITY_RESEARCH], adversarial inquiry, fidelity plan §7–9.

| Step | Action |
|------|--------|
| 1 | Per project, sample behavior-changing changes: all high-severity incidents + random successful controls. |
| 2 | Run specification-state analysis before classifying bugs vs spec changes. |
| 3 | Append candidate findings; adjudicate to case reports; store outside client YAML. |
| 4 | Measure origin-layer distribution, discovery layer, LEAP vs spec-change rate. |
| 5 | Test association: do structural gaps predict confirmed findings? (avoid circular definitions). |

**Outcome:** Evidence for Q2, Q3; methodology improvements tied to **confirmed** findings only.

### Phase 3 — Non-TIED static adapter (P1)

**New work (not yet implemented):**

- Read-only scanner producing **`comparable-arms.v1`** artifacts: change count, test-file ratio, CI presence, revert/hotfix proxies, review metadata — with explicit denominators and `proof_boundary` per field.  
- No fake TIED tokens; no maturity score.  
- Pair with TIED evidence chain statistics on matched strata (language, repo size band, change count band).

**Outcome:** Initial TIED vs non-TIED arms for Q1 and Q5 (cost vs defect proxies), with **static** outcome labels.

### Phase 4 — Activate dormant chain adapters (P1, gated)

**Build on:** Dormant `COLLECT_FILE_INVENTORY`, `COLLECT_VOCAB_DRIFT` contracts in [IMPL-EVIDENCE_CHAIN_PROFILE].

- Wire orchestrator only after independent module validation.  
- Enables fairer file-population denominators and vocabulary drift as **predictor** for Q2/Q3.

### Phase 5 — Selective non-TIED live execution sandbox (P2)

- Curated subset of non-TIED repos with reproducible Docker/Nix/CI fixtures.  
- Run test suites; collect pass/fail and duration only — not full TIED profile.  
- Compare executable behavior outcomes against TIED clients in matched domain/size strata.

**Stop criteria:** If &gt;50% of attempted live runs fail for environmental reasons, pause live arm expansion and report limitation.

### Phase 6 — Methodology improvement loop (ongoing)

**Build on:** [REQ-FEEDBACK_TO_TIED], LEAP proposal queue, [ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY].

```text
evaluation evidence
  → methodology_improvement feedback OR LEAP proposal
  → sponsor review
  → governed TIED change (REQ/ARCH/IMPL + tests)
  → re-run affected cohort arms
  → revision log entry in this document
```

Improvements must cite **which question (Q1–Q6)** and **which proof boundary** the evidence supports.

---

## Principles

These govern collection, interpretation, and acting on results. They align with [tied/docs/ai-principles.md](../tied/docs/ai-principles.md), quality-assurance vocabulary, and fidelity-research vocabulary.

### 1. Proof boundaries are never conflated

Structural consistency, documentation completeness, checklist rendering, and generated views **do not** prove runtime correctness, security, or user satisfaction. Every metric declares its boundary (`traceability_structure`, `pseudo_code_structure`, `semantic_fidelity`, `executable_behavior`, `human_decision`).

### 2. Comparable cohorts only

Partition by `compatibility_key` (`schema_version` + evidence-chain profile depth). Use denominator fingerprints (v2) before comparing ratio statistics. Never merge incompatible denominators into one rollup.

### 3. Explicit denominators and missing data

Missing evidence remains `not_measured`, `unknown`, or `not_applicable` — never silent zero. Report numerators, denominators, and excluded inputs.

### 4. Control samples and selection bias

Include **successful behavior-changing changes** alongside incidents. Studying only failures cannot estimate defect rates or predictor value ([docs/tied-fidelity-research-plan.md](tied-fidelity-research-plan.md) §7.1).

### 5. Specification state before defect classification

Distinguish specification change, implementation lag, missing specification, and confirmed defects. Do not treat stale tests as authority for current behavior.

### 5a. Findings and historical proxies remain separate

A TIED **confirmed finding** is an adjudicated fidelity finding after
specification-state analysis. A non-TIED **historical defect proxy** is a
revert, hotfix, or defect-labeled issue with a human-decision proof boundary.
They are separate Q1 arms and are never reported as one defect statistic.

### 6. Read-only research boundary

Cross-project evaluation **must not** mutate audited client project YAML, methodology YAML in clients, or conflate research datasets with canonical intent. Remediation is a separate, approved workflow.

### 7. No universal maturity score

Forbidden: `maturity`, `score`, `maturity_score`, `universal_score`, and cross-cohort ranking dashboards. Statistics are **named counts and statuses** with proof boundaries.

### 8. Reproducibility

Record commit, TIED base path, methodology version, commands, tool versions, and artifact hashes. Same inputs → same report bytes (deterministic aggregators).

### 9. Privacy and path hygiene

Default `include_absolute_paths: false` in report manifests. Do not centralize secrets, credentials, or full source trees. Use hashed `project_id` and optional `client_alias`.

### 10. Human adjudication for methodology change

Candidate findings, static proxies, and agent observations stay **observations** until triaged. Methodology promotion requires sponsor review through feedback or LEAP proposal queue — not automatic YAML writes.

### 11. Cost–benefit symmetry

Measure TIED cost (time, checklist steps, MCP calls, token/doc volume) with the same rigor as benefit proxies. [docs/leap-tied-citdp-costs-and-benefits.md](leap-tied-citdp-costs-and-benefits.md) is the baseline framing.

### 12. Execution honesty

Label each corpus row `live` vs `static`. Non-TIED live failures are **data** (documented), not grounds for excluding the repo from static arms.

### 13. TIED dogfooding

Changes to evaluation tooling in `stdd` follow the same TIED dev cycle as other features; evaluation of the methodology uses the methodology's own evidence rules where applicable.

---

## Improvement decision rubric

When evaluation evidence proposes a methodology change, classify it:

| Class | Example | Route |
|-------|---------|-------|
| **Tooling gap** | Non-TIED static adapter missing | New REQ in `stdd` |
| **Process friction** | Checklist step redundant vs outcome | `methodology_improvement` feedback → checklist edit |
| **False signal** | Structural gate does not predict defects | Tighten proof-boundary docs; adjust gate policy |
| **Confirmed fidelity gap** | REQ→IMPL translation defects cluster | Fidelity vocab + training docs; optional checklist stub |
| **Adoption barrier** | MCP setup failures dominate metrics | Bootstrap/docs (`copy_files.sh`, MCP runbook) |

Reject changes that improve a metric by **weakening** a proof boundary (e.g. treating acknowledgment as verification).

---

## Relationship to existing documents

| Document | Role in evaluation |
|----------|-------------------|
| [tied-fidelity-research-plan.md](tied-fidelity-research-plan.md) | Defect-origin study design, taxonomy, control samples |
| [tied/docs/evidence-chain-profile.md](../tied/docs/evidence-chain-profile.md) | Per-client chain measurement and comparison rules |
| [scoped-analysis-and-ignore.md](scoped-analysis-and-ignore.md) | Roots, ignore patterns, traceability gap CI |
| [conversation-analysis-tools.md](conversation-analysis-tools.md) | Agent/session behavioral signals |
| [tied-improvement-roadmap.md](tied-improvement-roadmap.md) | Product/orchestration improvements; Batch 5 research records |
| [tied-value-proposition-matrix.md](tied-value-proposition-matrix.md) | Hypothesis map for what each layer should prove |
| [quality-assurance.md](../tied/vocab/quality-assurance.md) | Cohort, manifest, and statistics vocabulary |
| [tied/docs/citdp-policy.md](../tied/docs/citdp-policy.md) | Policy permitting a CITDP skip for non-executable documentation-only changes |
| [docs/leap-proposal-queue.md](leap-proposal-queue.md) | Reviewed, non-canonical route for methodology improvement proposals |
| [tied-project-alignment-recommendations.md](tied-project-alignment-recommendations.md) | E0-approved per-client alignment actions and proof-boundary labels from the Phase 1 pilot |
| [working/evaluation/client-remediation-handoffs.yaml](../working/evaluation/client-remediation-handoffs.yaml) | Operator handoff for human execution of E1–E4 in each client repo |

---

## Initial operator checklist

Use when starting or re-running an evaluation cycle:

1. Confirm evaluation scope matches **Subject** and **Scope** above.  
2. Build or refresh corpus registry (Phase 0).  
3. For each TIED project: `tied_config_get_base_path`; record commit and methodology version.  
4. Choose mode: live profile generation vs archived artifact reuse.  
5. For non-TIED: static adapter only unless repo is on live-allowlist.  
6. Run aggregators in `strict` mode for publishable reports.  
7. Document excluded inputs, residual risks, and denominator mismatches.  
8. Route proposed improvements through feedback/LEAP — do not edit client YAML from research.  
9. Update **Revision log** when policy or phase status changes.

---

## Revision log

| Date | Author | Summary |
|------|--------|---------|
| 2026-08-26 | AI Agent | First edition: inventory, phased plan, static vs live policy, principles, re-evaluation triggers |
| 2026-08-26 | AI Agent | `refine-plan`: resolved corpus/schema, fixture grounding, Q1/Q5 pairing, privacy tiers, n<2 denominator-subcohort stop, and docs-only operating contract |
| 2026-08-27 | AI Agent | Phase 1 fixture-grounded cohort report: v2 aggregator on five archived profiles; insufficient-sample subcohorts documented; operator pilot deferred |
| 2026-08-27 | AI Agent | Phase 1 operator pilot: four TIED clients (nsync, treegrep, panorama, indescript) at HEAD; cross-client and within-repo v2 reports |
| 2026-08-27 | AI Agent | E0 approval: alignment recommendations and client remediation handoffs published |

---

## References (tokens and processes)

- `[REQ-EVIDENCE_CHAIN_PROFILE]`, `[REQ-EVIDENCE_CHAIN_REPORT]`, `[REQ-MCP_USAGE_METRICS]`  
- `[REQ-TIED_FIDELITY_RESEARCH]`, `[REQ-TIED_ADVERSARIAL_INQUIRY]`, `[REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]`  
- `[REQ-QUALITY_ASSURANCE_EVIDENCE]`, `[REQ-FEEDBACK_TO_TIED]`, `[REQ-LEAP_PROPOSAL_QUEUE]`  
- `[PROC-EVIDENCE_CHAIN]`, `[PROC-QUALITY_EVIDENCE_PROVENANCE]`, `[PROC-VOCABULARY_INDEX]`, `[PROC-LEAP]`, `[PROC-AGENT_REQ_CHECKLIST]`

This planning document introduces **no new semantic tokens**. Implementations that change behavior must register tokens through the normal TIED MCP workflow.
