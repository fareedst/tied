# Quality assurance (canonical)

**Scope:** Risk-triggered quality selection and evidence provenance for TIED changes.

**Traceability:** [REQ-QUALITY_ASSURANCE_EVIDENCE](../requirements/REQ-QUALITY_ASSURANCE_EVIDENCE.yaml) · [ARCH-QUALITY_ASSURANCE_PROFILES](../architecture-decisions/ARCH-QUALITY_ASSURANCE_PROFILES.yaml) · [IMPL-QUALITY_EVIDENCE_MANIFEST](../implementation-decisions/IMPL-QUALITY_EVIDENCE_MANIFEST.yaml) · [PROC-QUALITY_ASSURANCE](../docs/processes.md) · [PROC-QUALITY_EVIDENCE_PROVENANCE](../docs/processes.md)

**See also:** [`routing.md`](routing.md) · [`domain-references.md`](domain-references.md) · [`tied-methodology.md`](tied-methodology.md) · [`pseudocode-and-citdp.md`](pseudocode-and-citdp.md)

---

## Canonical terms

| Preferred term | Synonyms to resolve | Meaning | Naming bridge |
|---|---|---|---|
| quality attribute | quality dimension, quality concern | A property whose risk may require evidence, such as security, reliability, performance, privacy, accessibility, or maintainability. | `QUALITY_ATTRIBUTE` |
| risk tier | risk level, severity band | A bounded classification used to select assurance depth and escalation. | `RISK_TIER` |
| assurance profile | quality profile, test profile | A versioned applicability selector with triggers, evidence requirements, owner, and failure action. | `ASSURANCE_PROFILE` |
| quality evidence matrix | QA matrix, assurance matrix | Rows mapping quality attributes to applicability, rationale, risk, evidence, threshold, result, owner, limitation, and waiver. | `QUALITY_EVIDENCE_MATRIX` |
| evidence item | proof item, check result | One machine- or human-supported result tied to a matrix row and evidence provenance. | `EVIDENCE_ITEM` |
| evidence manifest | verification manifest, proof manifest | A machine-generated collection of reproducible command and validator results. | `VERIFICATION_EVIDENCE_MANIFEST` |
| evidence provenance | proof provenance, result provenance | The identity, environment, tool version, command, threshold, exit code, and artifact references behind evidence. | `EVIDENCE_PROVENANCE` |
| residual risk | remaining risk, accepted exposure | Risk remaining after implemented controls and available evidence. | `RESIDUAL_RISK` |
| waiver | exception, risk acceptance | A time-bounded approval to accept a known unmet or non-applicable obligation. | `QUALITY_WAIVER` |
| owner/expiry | accountable owner, review expiry | The person or role accountable for an evidence gap or waiver and the date it must be revisited. | `RISK_OWNER_EXPIRY` |
| pilot | controlled trial, evaluation cohort | A bounded application of a candidate gate before canonical promotion. | `ASSURANCE_PILOT` |
| stop criterion | stopping rule, abort threshold | A measurable condition that pauses or rolls back a pilot or gate. | `PILOT_STOP_CRITERION` |
| test adequacy | test sufficiency, test strength | Risk-relative confidence that selected tests exercise meaningful behavior, boundaries, and failure modes. | `TEST_ADEQUACY` |
| proof boundary | quality proof, validation guarantee | The explicit claim limit for one evidence source; it states what the evidence does and does not establish. | `PROOF_BOUNDARY` |
| abuse case | security scenario, attack case | A named external-input misuse or failure scenario that requires executable evidence or an owned waiver. | `ABUSE_CASE` |
| accepted risk | risk acceptance, waived obligation | A deliberate residual-risk decision with rationale, accountable owner, and expiry. | `ACCEPTED_RISK` |
| quality command declaration | quality command, verification command | A bounded argv, working directory, limits, and artifact destination used to collect executable evidence. | `QUALITY_COMMAND_DECLARATION` |
| artifact reference | output path, evidence artifact | A stable path or identifier pointing to command output retained as evidence provenance. | `ARTIFACT_REFERENCE` |
| evidence collection | command collection, proof collection | The composition step that executes declared quality commands before building the verification evidence manifest. | `EVIDENCE_COLLECTION` |
| attach provenance | wire evidence to profile, attach results to profile | Operator step: pass collected validator outputs and/or a verification evidence manifest into `evidence_chain_profile_generate` via `manifest_reference` and/or structural wiring so derived fields become `observed` instead of `not_measured`. Distinct from merely running validators during verification-gate without attaching outputs to the profile artifact. | `ATTACH_PROVENANCE` |
| idempotency key | deduplication key, replay key | A stable event identifier used to prevent duplicate webhook inbox entries. | `IDEMPOTENCY_KEY` |
| event claim | worker claim, competing claim | An atomic ownership transition that allows one worker to process a due event. | `EVENT_CLAIM` |
| evidence chain profile | chain completeness report, evidence-chain profile, maturity report (forbidden meaning) | A versioned, read-only artifact (`evidence-chain-profile.v1`) that reports completeness, provenance, denominators, and proof boundaries across vocabulary → REQ → ARCH → IMPL pseudo-code → tests → code → composition → quality evidence → change outcome. It is not an **assurance profile**, not a **read-only research profile**, and not a universal maturity score. | `EVIDENCE_CHAIN_PROFILE` |
| evidence-chain profile depth | profile depth (alone), integrated depth, human_research depth | Generator selector `integrated` or `human_research` for how much of the chain is measured in one run. Distinct from fidelity **integrated agent profile** / **human research profile** and from **assurance profile**. | `PROFILE_DEPTH` |
| evidence chain statistics report | multi-client stats report, maturity dashboard (forbidden meaning) | A versioned, read-only batch artifact (`evidence-chain-statistics-report.v1`) produced from already-generated **evidence chain profile** files. It is not an **assurance profile**, not a **verification evidence manifest**, and not a maturity score. | `EVIDENCE_CHAIN_STATISTICS_REPORT` |
| client cohort | reporting cohort, comparable client set | The set of accepted profile artifacts that share one `compatibility_key` (`schema_version` plus **evidence-chain profile depth**). Incompatible keys are never rolled up together. Distinct from an **assurance profile** pilot cohort. | `CLIENT_COHORT` |
| report input manifest | batch input list, report-inputs.yaml | The `evidence-chain-report-inputs.v1` document that names profile artifacts, optional **client alias** values, mode, and path-privacy. The aggregator does not discover clients by walking repositories. | `REPORT_INPUT_MANIFEST` |
| client alias | display name, human client name | Optional human-readable label on a **report input manifest** row. Stable identity remains the profile hashed `project_id`. | `CLIENT_ALIAS` |

## Profile applicability

| Profile | Trigger | Minimum evidence |
|---|---|---|
| baseline-functional | Every behavior-changing change | Unit TDD, applicable composition bindings, and traceability proof boundaries. |
| external-input-security | Untrusted input, authorization, API, CLI, message, file, or content boundary | Abuse cases, authorization checks, malformed-input handling, and sensitive-data review. |
| data-integrity-migration | Persistence, schema, migration, import/export, or idempotency change | Invariants, migration/replay evidence, backup/restore or recovery owner, and data-loss limitation. |
| stateful-reliability | Stateful workflow, retry, recovery, concurrency, or restart behavior | Failure transitions, replay/idempotency, recovery target, and deterministic reproduction. |
| performance-scale-cost | Workload, latency, throughput, memory, external call, or model/tool cost risk | Workload, budget, timeout/retry, resource behavior, and reproducible measurement. |
| user-facing-accessibility | User-visible behavior or interaction contract | Accessibility/usability acceptance and the relevant UI-free or E2E boundary. |
| regulated-privacy | Sensitive data, retention, consent, or regulatory obligation | Named owner, retention/consent evidence, limitation, and qualified review where required. |
| ai-enabled | Model, prompt, tool, agent, or generated-content boundary | Prompt-injection, sensitive-data, unsafe-output, authorization, sandbox, and abuse-volume checks. |

## External-input security case set

The `external-input-security` profile uses these canonical abuse cases:
`malformed-oversized-input`, `authentication-authorization`, `injection-unsafe-content`,
`path-traversal-file-access`, `replay-duplicate`, `secret-sensitive-data`,
`resource-exhaustion-timeout-rate-limit`, and `dependency-vulnerability-review`.

## Token links

- `[REQ-QUALITY_ASSURANCE_EVIDENCE]` defines the quality evidence obligation.
- `[ARCH-QUALITY_ASSURANCE_PROFILES]` defines profiles and proof boundaries.
- `[IMPL-QUALITY_EVIDENCE_MANIFEST]` defines machine-derived provenance.
- `[PROC-QUALITY_ASSURANCE]` selects profiles before design.
- `[PROC-QUALITY_EVIDENCE_PROVENANCE]` preserves executable evidence provenance.
- `[PROC-TEST_ADEQUACY]` selects advanced testing by risk.

Domain terms above are distinct from IMPL grammar keywords such as `INPUT`, `OUTPUT`, `DATA`, `CONTROL`, `PRE`, `POST`, and `EFFECTS`.

## Naming bridge

| Concept | TIED artifact or symbol | Related token |
|---|---|---|
| proof boundary | `proof_boundary` / `PROOF_BOUNDARY` | `[REQ-QUALITY_ASSURANCE_EVIDENCE]` |
| abuse case | `abuse_case` / `ABUSE_CASE` | `[IMPL-QUALITY_SECURITY_PROFILE_VALIDATION]` |
| accepted risk | `accepted_risk` / `ACCEPTED_RISK` | `[ARCH-QUALITY_ASSURANCE_PROFILES]` |
| binding row fields | `trigger`, `callee`, `arguments`, `effect`, `ordering`, `failure_behavior` | `[IMPL-QUALITY_BINDING_INVENTORY]` |
| quality command declaration | `QualityCommandDeclaration` / `QUALITY_COMMAND_DECLARATION` | `[IMPL-QUALITY_EVIDENCE_COMMAND_RUNNER]` |
| artifact reference | `artifacts` / `ARTIFACT_REFERENCE` | `[PROC-QUALITY_EVIDENCE_PROVENANCE]` |
| evidence collection | `collectVerificationEvidence` / `EVIDENCE_COLLECTION` | `[IMPL-QUALITY_EVIDENCE_COLLECTION]` |
| event claim | `claim` / `EVENT_CLAIM` | `[IMPL-QUALITY_ASSURANCE_PILOT_WEBHOOK]` |
| evidence chain profile | `evidence-chain-profile.v1` / `evidence_chain_profile_generate` | `[REQ-EVIDENCE_CHAIN_PROFILE]` |
| evidence-chain profile depth | `profile_depth` / `PROFILE_DEPTH` | `[ARCH-EVIDENCE_CHAIN_PROFILE]` |
| evidence chain statistics report | `evidence-chain-statistics-report.v1` / `evidence-chain-report` CLI | `[REQ-EVIDENCE_CHAIN_REPORT]` |
| client cohort | `compatibility_key` / `CLIENT_COHORT` | `[ARCH-EVIDENCE_CHAIN_REPORT]` |
| report input manifest | `evidence-chain-report-inputs.v1` / `REPORT_INPUT_MANIFEST` | `[IMPL-EVIDENCE_CHAIN_REPORT]` |
| client alias | `client_alias` / `CLIENT_ALIAS` | `[REQ-EVIDENCE_CHAIN_REPORT]` |
| idempotency key | `event_id` / `IDEMPOTENCY_KEY` | `[IMPL-QUALITY_ASSURANCE_PILOT_WEBHOOK]` |

## Alphabetical index

| Term | Section |
|---|---|
| abuse case | Canonical terms |
| accepted risk | Canonical terms |
| attach provenance | Canonical terms |
| artifact reference | Canonical terms |
| binding row fields | Naming bridge |
| evidence collection | Canonical terms |
| evidence chain profile | Canonical terms |
| evidence-chain profile depth | Canonical terms |
| evidence chain statistics report | Canonical terms |
| client cohort | Canonical terms |
| report input manifest | Canonical terms |
| client alias | Canonical terms |
| event claim | Canonical terms |
| idempotency key | Canonical terms |
| proof boundary | Canonical terms |
| quality command declaration | Canonical terms |
