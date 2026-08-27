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
| file inventory adapter | file counter, repository inventory | Read-only future adapter contract for file populations, ignored paths, denominators, and proof boundaries. Current Phase 4 scope is dormant `COLLECT_FILE_INVENTORY` pseudo-code only: no caller, registration, production symbol, test, or profile activation. | `COLLECT_FILE_INVENTORY` |
| vocabulary drift adapter | vocab checker, glossary drift scan | Read-only future adapter contract comparing routed preferred terms and naming bridges against selected artifacts with explicit denominators and ignored paths. Current Phase 4 scope is dormant `COLLECT_VOCAB_DRIFT` pseudo-code only: no caller, registration, production symbol, test, or profile activation. | `COLLECT_VOCAB_DRIFT` |
| evidence chain statistics report | multi-client stats report, maturity dashboard (forbidden meaning) | A versioned, read-only batch artifact (`evidence-chain-statistics-report.v1`) produced from already-generated **evidence chain profile** files. It is not an **assurance profile**, not a **verification evidence manifest**, and not a maturity score. | `EVIDENCE_CHAIN_STATISTICS_REPORT` |
| client cohort | reporting cohort, comparable client set | The set of accepted profile artifacts that share one `compatibility_key` (`schema_version` plus **evidence-chain profile depth**). Incompatible keys are never rolled up together. Distinct from an **assurance profile** pilot cohort. | `CLIENT_COHORT` |
| report input manifest | batch input list, report-inputs.yaml | The `evidence-chain-report-inputs.v1` document that names profile artifacts, optional **client alias** values, mode, and path-privacy. The aggregator does not discover clients by walking repositories. | `REPORT_INPUT_MANIFEST` |
| client alias | display name, human client name | Optional human-readable label on a **report input manifest** row. Stable identity remains the profile hashed `project_id`. | `CLIENT_ALIAS` |
| denominator fingerprint | denominator hash, cohort denominator key | Stable hash of required derived-path denominators plus structural denominators for one profile; used in v2 to partition **denominator subcohorts** inside a **client cohort**. Distinct from **proof boundary** and from summing derived-field values. | `DENOMINATOR_FINGERPRINT` |
| denominator subcohort | A subset of a **client cohort** whose members share the same **denominator fingerprint**. v2 never rolls incompatible denominators into one sub-cohort statistic. | `DENOMINATOR_SUBCOHORT` |
| evaluation corpus | Versioned `evaluation-corpus.v1` registry of control-project rows, including analysis scope, execution policy, privacy tier, and fixed commit; distinct from a fidelity project manifest and a report input manifest. | `EVALUATION_CORPUS` |
| comparable arms | Versioned `comparable-arms.v1` per-field comparison outputs with explicit denominators and proof boundaries; never a maturity score or universal ranking. | `COMPARABLE_ARMS` |
| execution policy | Corpus-row policy `live_ok`, `static_only`, or `live_attempted`, always paired with a recorded outcome and `live`/`static` label. | `EXECUTION_POLICY` |
| privacy tier | Corpus-row export boundary: `operator_local`, `shareable_hashed`, or `forbidden_export`; shareable output defaults to hashed identity without absolute paths or source trees. | `PRIVACY_TIER` |
| adherence ledger | adherence event log, session ledger (forbidden: evidence chain profile) | Append-only `agent-adherence-event.v1` JSONL storing hash/reference edges for six checklist lifecycle event classes; distinct from **evidence chain profile** and **verification evidence manifest**. | `ADHERENCE_LEDGER` |
| adherence event class | lifecycle event, stage event | One of six non-interchangeable classes: `instruction_rendered`, `agent_acknowledged`, `action_attempted`, `outcome_verified`, `gate_decided`, `status_mutated`. Each class has explicit non-implication rules vs adjacent stages. | `ADHERENCE_EVENT_CLASS` |
| adherence reconciliation | adherence audit, chain reconcile | Read-only report comparing ledger rows, Tracker, gate receipts, and TIED indexes; emits deterministic finding codes without mutating state. | `ADHERENCE_RECONCILIATION` |
| evidence ref resolution | resolve evidence refs, RESOLVE_EVIDENCE_REFS | Producer-side verification of Tracker `evidence_refs[]` before `completed` write; classifies refs as `file_path`, `manifest_ref`, or rejects `generic_prose`. | `EVIDENCE_REF_RESOLUTION` |
| resolved evidence ref | verified ref, artifact hash edge | One resolved entry with original ref, kind, and content hash used for `outcome_verified` correlation. | `RESOLVED_EVIDENCE_REF` |
| generic prose ref | prose evidence, self-reported success | Non-path evidence string rejected with `unresolved_evidence_ref` (e.g. "tests passed"). | `GENERIC_PROSE_REF` |
| manifest ref | verification manifest path | Tracker evidence ref pointing to `verification-evidence-manifest.v1` with all command exit codes zero. | `MANIFEST_REF` |
| outcome_verified event | verified outcome, evidence verified | Adherence ledger event class after successful ref resolution; does not authorize gate pass alone (non-implication rule). | `OUTCOME_VERIFIED_EVENT` |
| non-implication rule | stage non-implication, proof non-implication | Normative rule that one adherence event class never proves the next (e.g. acknowledgment never proves action). | `NON_IMPLICATION_RULE` |
| instruction binding | nonce binding, instruction hash binding | Per-turn `instruction_nonce` and `instruction_hash` tying rendered prompt bytes to Tracker completion receipt. | `INSTRUCTION_BINDING` |

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
| file inventory adapter | `COLLECT_FILE_INVENTORY` (dormant contract only) | `[IMPL-EVIDENCE_CHAIN_PROFILE]` |
| vocabulary drift adapter | `COLLECT_VOCAB_DRIFT` (dormant contract only) | `[IMPL-EVIDENCE_CHAIN_PROFILE]` |
| evidence chain statistics report | `evidence-chain-statistics-report.v1` / `evidence-chain-report` CLI | `[REQ-EVIDENCE_CHAIN_REPORT]` |
| adherence ledger | `agent-adherence-event.v1` / `ADHERENCE_LEDGER` | `[IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]` |
| adherence event class | `event_class` / `ADHERENCE_EVENT_CLASS` | `[IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]` |
| adherence reconciliation | `adherence-reconcile` / `RECONCILE_ADHERENCE_CHAIN` | `[IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]` |
| non-implication rule | non-implication / `NON_IMPLICATION_RULE` | `[IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]` |
| instruction binding | `instruction_nonce` + `instruction_hash` / `INSTRUCTION_BINDING` | `[IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]` |
| client cohort | `compatibility_key` / `CLIENT_COHORT` | `[ARCH-EVIDENCE_CHAIN_REPORT]` |
| report input manifest | `evidence-chain-report-inputs.v1` / `REPORT_INPUT_MANIFEST` | `[IMPL-EVIDENCE_CHAIN_REPORT]` |
| client alias | `client_alias` / `CLIENT_ALIAS` | `[REQ-EVIDENCE_CHAIN_REPORT]` |
| evaluation corpus | `working/evaluation/evaluation-corpus.v1.yaml` / `evaluation-corpus.v1` | `[REQ-EVIDENCE_CHAIN_REPORT]` |
| comparable arms | `comparable-arms.v1` | `[REQ-EVIDENCE_CHAIN_REPORT]` |
| execution policy | `execution_policy` | `[REQ-EVIDENCE_CHAIN_REPORT]` |
| privacy tier | `privacy_tier` | `[REQ-EVIDENCE_CHAIN_REPORT]` |
| idempotency key | `event_id` / `IDEMPOTENCY_KEY` | `[IMPL-QUALITY_ASSURANCE_PILOT_WEBHOOK]` |

## Pseudo-code block names

| Preferred term | UPPER_SNAKE block | Owning IMPL |
|---|---|---|
| file inventory adapter | `COLLECT_FILE_INVENTORY` | `[IMPL-EVIDENCE_CHAIN_PROFILE]` |
| vocabulary drift adapter | `COLLECT_VOCAB_DRIFT` | `[IMPL-EVIDENCE_CHAIN_PROFILE]` |
| adherence chain reconciliation | `RECONCILE_ADHERENCE_CHAIN` | `[IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]` |
| gate decision receipt persistence | `PERSIST_GATE_DECISION_RECEIPT` | `[IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]` |
| status mutation receipt persistence | `PERSIST_STATUS_MUTATION_RECEIPT` | `[IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]` |

## Alphabetical index

| Term | Section |
|---|---|
| abuse case | Canonical terms |
| adherence event class | Canonical terms |
| adherence ledger | Canonical terms |
| adherence reconciliation | Canonical terms |
| accepted risk | Canonical terms |
| attach provenance | Canonical terms |
| artifact reference | Canonical terms |
| binding row fields | Naming bridge |
| COLLECT_FILE_INVENTORY | Pseudo-code block names |
| COLLECT_VOCAB_DRIFT | Pseudo-code block names |
| evidence collection | Canonical terms |
| evidence chain profile | Canonical terms |
| evidence-chain profile depth | Canonical terms |
| evidence chain statistics report | Canonical terms |
| client cohort | Canonical terms |
| comparable arms | Canonical terms |
| evaluation corpus | Canonical terms |
| execution policy | Canonical terms |
| report input manifest | Canonical terms |
| client alias | Canonical terms |
| event claim | Canonical terms |
| file inventory adapter | Canonical terms |
| instruction binding | Canonical terms |
| non-implication rule | Canonical terms |
| proof boundary | Canonical terms |
| quality command declaration | Canonical terms |
| vocabulary drift adapter | Canonical terms |
| privacy tier | Canonical terms |
