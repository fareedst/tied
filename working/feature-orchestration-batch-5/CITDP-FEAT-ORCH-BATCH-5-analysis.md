# CITDP-FEAT-ORCH-BATCH-5 analysis

## Change definition

Current behavior: existing fidelity research emits read-only candidate findings,
snapshots, evidence provenance, and confirmed case reports outside audited project
TIED YAML. Existing feedback entries capture basic feature requests, bug reports,
and methodology improvements. The LEAP proposal queue stores distinct
non-canonical proposals with explicit lifecycle operations. None of these surfaces
provides one structured research-record contract for decision evidence or a
source-aware operational feedback promotion boundary.

Desired behavior: Batch 5 adds two additive contracts. Research records represent
library comparisons, benchmarks, security findings, organizational constraints, and
experiments with source/date/method/conclusion/uncertainty, affected ARCH/IMPL
alternatives, evidence provenance, proof boundaries, freshness, and explicit
classification. Operational adapters normalize incidents, metrics, test failures,
and user reports into feedback entries, group duplicates, preserve proposed REQs,
and create reviewed non-canonical LEAP proposals without automatically writing
canonical project YAML.

Unchanged behavior:

- Existing fidelity, feedback, and LEAP tools remain the owning surfaces.
- Fidelity research remains read-only and its research dataset remains outside the
  audited project's project YAML when that profile applies.
- Feedback entries remain distinct from non-canonical LEAP proposals.
- Canonical REQ/ARCH/IMPL promotion remains a separate explicit human-reviewed
  action through existing TIED YAML tools.
- No lifecycle engine, scheduler, generated-view, migration/onboarding, Git
  branch/worktree, or universal quality-ceremony redesign is included.
- Production code and tests are not changed in this planning phase.

## Resolved sponsor terms and naming bridges

| Sponsor wording | Canonical term | Planned token/block |
|---|---|---|
| research note / study | research record | `REQ-TIED_RESEARCH_RECORDS` |
| technology comparison | library comparison | `library_comparison` |
| evidence age | freshness policy / freshness result | `EVALUATE_RESEARCH_FRESHNESS` |
| suspected defect | candidate finding | existing fidelity vocabulary |
| proven defect case | confirmed case report | existing fidelity vocabulary |
| accepted unknown | accepted uncertainty | `accepted_uncertainty` |
| production report | operational feedback | `REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION` |
| incident/telemetry/test/user input | operational source | `NORMALIZE_OPERATIONAL_SOURCE` |
| promote feedback | reviewed non-canonical LEAP proposal | `CREATE_REVIEWED_LEAP_PROPOSAL` |
| canonical update | explicit human-reviewed TIED action | outside adapter boundary |

Vocabulary RESOLVE and RECORD are complete using the four preloaded glossaries.
No new glossary file is required; existing naming bridges already define fidelity
classification, feedback entries, non-canonical proposals, feature identifiers,
and proof-boundary terminology. VALIDATE remains a pre-commit gate and is
intentionally deferred for this no-commit planning handoff.

## Token stack

Research records:

- `[REQ-TIED_RESEARCH_RECORDS]`
- `[ARCH-TIED_RESEARCH_RECORD_BOUNDARY]`
- `[IMPL-TIED_RESEARCH_RECORDS]`

Operational feedback promotion:

- `[REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION]`
- `[ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY]`
- `[IMPL-TIED_FEEDBACK_PROMOTION]`

Dependencies reused without redesign:

- `[REQ-TIED_FIDELITY_RESEARCH]`, `[ARCH-TIED_FIDELITY_RESEARCH]`,
  `[IMPL-TIED_FIDELITY_RESEARCH]`
- `[REQ-FEEDBACK_TO_TIED]`, `[ARCH-FEEDBACK_STORAGE]`,
  `[IMPL-MCP_FEEDBACK_TOOLS]`
- `[REQ-LEAP_PROPOSAL_QUEUE]`, `[ARCH-LEAP_PROPOSAL_QUEUE]`,
  `[IMPL-MCP_LEAP_PROPOSAL_QUEUE]`
- `[REQ-QUALITY_ASSURANCE_EVIDENCE]`,
  `[ARCH-QUALITY_ASSURANCE_PROFILES]`,
  `[IMPL-QUALITY_EVIDENCE_MANIFEST]`

## Artifact boundaries

| Artifact | Owns | Does not own |
|---|---|---|
| Fidelity research record/dataset | Source-backed research evidence, snapshots, provenance, freshness, candidate/case/uncertainty classification | Canonical project intent or automatic remediation |
| Feedback entry | Original operational source, affected feature, severity, evidence, duplicate grouping, proposed REQ, promotion status | LEAP proposal lifecycle or canonical decision |
| Non-canonical LEAP proposal | Reviewed proposal staging, proposal status, audit trail, feedback links | Feedback source history or automatic project YAML writes |
| Canonical REQ/ARCH/IMPL | Approved project intent and implementation decisions | Unreviewed research, feedback, or pending proposals |

The research record and feedback entry may link to one another through evidence
references, but neither becomes the other. A confirmed fidelity case report is an
adjudicated research artifact; it is not automatically a feedback entry or a
canonical requirement. A reviewed feedback promotion creates a non-canonical LEAP
proposal; it does not apply the proposal.

## Research record contract

Required normalized fields are record type, source, source date, method,
conclusion, uncertainty, affected decision links, evidence provenance, freshness
policy, classification, and proof-boundary labels. Supported types are
`library_comparison`, `benchmark`, `security_finding`,
`organizational_constraint`, and `experiment`.

Freshness produces `current`, `stale`, or `freshness_unknown` with the source
date, evaluation date, policy, and provenance retained. Freshness is not proof of
runtime correctness, security, quality, or canonical intent.

Classification is explicit and mutually distinguishable:

- `candidate_finding`: observed, not adjudicated;
- `confirmed_case_report`: independently reviewed and supported by evidence;
- `accepted_uncertainty`: unresolved or intentionally accepted limitation with
  owner/rationale evidence.

## Operational feedback contract

Source adapters accept `incident`, `metric`, `test_failure`, and `user_report`.
They add source-aware metadata to existing feedback entries:
`source_type`, `affected_feature`, `severity`, `evidence_links`,
`duplicate_group`, `proposed_req`, and `promotion_status`.

Duplicate grouping is stable and append-only. Equivalent entries receive links
to the same group; original entries are not deleted or merged. A reviewer must
provide identity, decision, rationale, and evidence before a non-canonical LEAP
proposal is created. Canonical application remains an explicit subsequent action.

## Impact and module boundaries

Planned build modules:

1. **Research record normalizer** — validates schema, decision links, provenance,
   classification, and supported record types.
2. **Freshness evaluator** — applies explicit date/review policy and emits bounded
   freshness diagnostics.
3. **Research dataset boundary** — appends external records and rejects audited
   project YAML targets under the read-only profile.
4. **Operational source adapters** — normalize incidents, metrics, test failures,
   and user reports into existing feedback entries.
5. **Duplicate grouper** — computes stable identities and preserves source history.
6. **Review/promotion adapter** — creates distinct non-canonical LEAP proposals
   only after human review and rejects canonical write attempts.

The first three modules compose with existing fidelity research. The last three
compose with existing feedback and LEAP queue surfaces. No lifecycle or scheduler
module is touched.

## Risk assessment

- **Canonical pollution:** mitigated by external research storage, non-canonical
  proposal flags, and explicit rejection of canonical writes.
- **Feedback/proposal conflation:** mitigated by separate schemas, paths, IDs, and
  lifecycle ownership.
- **Duplicate undercounting or inflation:** mitigated by stable duplicate identity,
  append-only originals, and duplicate-link evidence.
- **Stale research driving decisions:** mitigated by required source dates,
  explicit freshness policies, and `freshness_unknown`.
- **Weak provenance:** mitigated by required source, method, revision/environment,
  command or method identity, result, and artifact references.
- **Proof confusion:** mitigated by labels stating that research/freshness,
  structural validation, quality evidence, runtime tests, and human approval are
  separate boundaries.
- **Overbroad adapter scope:** mitigated by reusing existing feedback and LEAP
  tools and excluding replacement surfaces, migration, Git, lifecycle, scheduler,
  and view redesign.
- **Sensitive operational evidence:** build-plan must select applicable quality
  and security profiles and define redaction/retention before accepting external
  incident or user-report payloads.

## Test strategy for build-plan

RED tests must precede production code:

- validate each supported research record type and required field;
- reject missing provenance, invalid decision links, unsupported classification,
  and malformed freshness policies;
- classify current, stale, and freshness-unknown records deterministically;
- preserve candidate, confirmed case, and accepted uncertainty distinctions;
- reject research dataset paths under audited project YAML;
- preserve research source, evidence, and proof-boundary provenance;
- normalize each operational source type with its source-specific evidence;
- group duplicates deterministically without deleting original feedback;
- preserve feedback/proposal identity and links;
- require human review before creating a non-canonical LEAP proposal;
- reject automatic canonical REQ/ARCH/IMPL write attempts;
- verify feedback, fidelity, and LEAP surfaces remain separately callable;
- composition tests cover adapter-to-existing-surface bindings without UI.

No E2E is justified at planning time: adapters, MCP/CLI handlers, storage
boundaries, and review transitions are unit- or composition-testable without UI.

## Proof boundaries

This planning and later validator set can establish:

- research-record schema and provenance completeness;
- freshness classification and stale-evidence diagnostics;
- read-only storage enforcement;
- feedback source normalization and duplicate grouping;
- explicit review and proposal separation;
- no automatic canonical write behavior.

It cannot establish runtime product correctness, security or quality evidence
without the applicable assurance profile, canonical intent completeness, or human
approval merely from an automated status.

## Planning gate and handoff

The unique Tracker is:
`working/feature-orchestration-batch-5/agent-req-implementation-checklist-CITDP-FEAT-ORCH-BATCH-5.yaml`.

The post-implementation CITDP record is intentionally deferred:
`tied/citdp/CITDP-FEAT-ORCH-BATCH-5.yaml` must be persisted after build-plan
implementation with actual tests, evidence provenance, divergences, and residual
risk.

Build entry point:

```text
build-plan
linked tracker:
working/feature-orchestration-batch-5/agent-req-implementation-checklist-CITDP-FEAT-ORCH-BATCH-5.yaml
start_at:
gate-pseudocode-validation
```
