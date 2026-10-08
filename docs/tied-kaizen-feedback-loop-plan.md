# TIED Kaizen feedback loop: from work observations to system improvement

**Status:** Refined planning document. Phase 1 capture and Phase 2 source normalization are implemented; Phases 3–7 are not.  
**Request:** `PLAN-TIED-KAIZEN-FEEDBACK-LOOP`  
**Latest pass:** `refine-plan` for **Phase 2** (`REQ-KAIZEN-SOURCE-NORMALIZATION`). `depth_tier: integrated` for the Phase 2 capability scope. `gate_policy: advisory`. Evidence-chain **profile depth** is `not_measured` for documentation edits.  
**Scope:** Name the loop, bound phased implementation, record sponsor decisions (2026-10-07), and refine Phase 2 source normalization before `plan-new-feature`.  
**Last updated:** 2026-10-07 (Phase 2 refine-plan)  
**Phase 2 working folder:** [`PLAN.md`](../tied-project/working/REQ-KAIZEN-SOURCE-NORMALIZATION/PLAN.md) · [`checklist-tracker.yaml`](../tied-project/working/REQ-KAIZEN-SOURCE-NORMALIZATION/checklist-tracker.yaml) · [`CITDP-REQ-KAIZEN-SOURCE-NORMALIZATION.yaml`](../tied-project/working/REQ-KAIZEN-SOURCE-NORMALIZATION/CITDP-REQ-KAIZEN-SOURCE-NORMALIZATION.yaml)
**Program execution checklist (Phases 0–7):** [`kaizen-program-execution-checklist.yaml`](../tied-project/working/PLAN-TIED-KAIZEN-FEEDBACK-LOOP/kaizen-program-execution-checklist.yaml) — central resume surface after sponsor batch approval (2026-10-07); one phase per `plan-new-feature` with its own per-REQ tracker copy.  
**Refine-pass tracker (documentation only):** [`checklist-tracker.yaml`](../tied-project/working/PLAN-TIED-KAIZEN-FEEDBACK-LOOP/checklist-tracker.yaml)  
**Commit handoff:** [`commit-pass-handoff.md`](../tied-project/working/PLAN-TIED-KAIZEN-FEEDBACK-LOOP/evidence/commit-pass-handoff.md) (separate `plan-close-out` pass)  
**CITDP:** [`CITDP-PLAN-TIED-KAIZEN-FEEDBACK-LOOP.yaml`](../tied-project/citdp/CITDP-PLAN-TIED-KAIZEN-FEEDBACK-LOOP.yaml)

This document is the linked plan for a possible TIED feedback capability. It is not a requirement, not a semantic token, and not evidence that the proposed behavior exists.

Vocabulary for the names below is [`feedback-to-tied.md`](../tied-project/vocab/feedback-to-tied.md). **Kaizen loop** is the sponsor label for the cycle. It is not a storage name or a score.

The records this plan builds on are:

- [REQ-FEEDBACK_TO_TIED](../tied-project/requirements/REQ-FEEDBACK_TO_TIED.yaml) — Implemented
- [ARCH-FEEDBACK_STORAGE](../tied-project/architecture-decisions/ARCH-FEEDBACK_STORAGE.yaml)
- [IMPL-MCP_FEEDBACK_TOOLS](../tied-project/implementation-decisions/IMPL-MCP_FEEDBACK_TOOLS.yaml)
- [REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION](../tied-project/requirements/REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION.yaml) — index status remains `Planned`
- [ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY](../tied-project/architecture-decisions/ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY.yaml) — Active
- [IMPL-TIED_FEEDBACK_PROMOTION](../tied-project/implementation-decisions/IMPL-TIED_FEEDBACK_PROMOTION.yaml) — Active, with `mcp-server/src/feedback-promotion.ts`

## Refine

Touchpoint 1 maps the sponsor wording onto canonical names. **RESOLVE** changes names only. Intent and non-goals stay with the sponsor; the three costly choices below are **recorded sponsor decisions** for the first behavior-changing phases (not runtime authorization by themselves).

| Sponsor wording | Canonical name | Where it lives |
|---|---|---|
| Kaizen, learning loop | **Kaizen loop** | Sponsor label in this plan and in `feedback-to-tied.md` |
| Abnormality, friction, what happened | **operational observation** | Feedback vocabulary |
| What kind of problem | **observation kind** | Proposed additive field; absent today |
| feature / bug / methodology type | **feedback entry type** | `feature_request`, `bug_report`, `methodology_improvement` |
| Local script, remembered exception | **workaround** | Evidence on the observation |
| Reviewed system change | **countermeasure** | Separate from workaround and from a one-off restore |
| Restore service, hotfix only | **correction** | Vocabulary distinction; not a stored status |
| Major redesign, new capability | **innovation** | Distinct from the Kaizen loop; may reset baseline |
| Prior condition | **baseline** | Input to an outcome observation |
| Did it get better | **outcome observation** | `improved`, `unchanged`, `regressed`, `inconclusive`, `not_measured` |
| Analysis write-up | **feedback analysis** and **feedback digest** | Derived projection |
| Ack at capture time | **receipt** | Local capture result |
| Alert | **notification policy** | `sent`, `queued`, `suppressed`, or `not_configured` |
| Review state on an entry | **promotion status** | Existing five values in `feedback.ts` |
| Hold for later | **deferred review** | No LEAP proposal; status stays `promotion_pending` |
| The thing being improved | **production system** | TIED work system, unless the observation names an application |
| Proposal after review | **non-canonical proposal** | [leap-proposal-queue.md](../tied-project/vocab/leap-proposal-queue.md) |

### Delegated work envelope for this pass

This pass may edit this plan, record the names above, copy a per-request Tracker, and persist the documentation CITDP. It may not add project REQ, ARCH, or IMPL records or change `feedback.yaml` behavior. Recording sponsor decisions here does not implement transport or new store fields.

### Sponsor decisions (costly choices)

Recorded **2026-10-07**. These bound the first behavior-changing `plan-new-feature` (Phase 1 onward). A later sponsor may reopen a hinge only through an explicit change request.

| Hinge | Sponsor decision | Approved policy for Phase 1–2 (and until changed) | Later authority still required |
|---|---|---|---|
| Upstream delivery | **Yes** — local append and export only; no upstream transport in the first behavior-changing request | Point-of-work **local append**, **receipt**, and `tied_feedback_export` (or equivalent export path). No issue, webhook, channel, or other upstream transport in Phase 1 or Phase 2. | Phase 3+ may add a transport port only after a separate sponsor-approved change; who may receive observations and which transport |
| Retention and export | **Yes** — **privacy tier** `operator_local` until a named owner and expiry exist for any `shareable_hashed` export | Default capture and digest projections use `operator_local`. `shareable_hashed` and `forbidden_export` require a named redaction or export owner, expiry, and a scoped REQ before use | Retention duration, redaction owner, and any export beyond the local file |
| **feedback entry type** enum | **Yes** — keep three values; add **observation kind** beside them | Persisted **feedback entry type** stays `feature_request`, `bug_report`, `methodology_improvement`. **observation kind** is the additive classifier; no fourth entry type in the first contract | A fourth **feedback entry type** only via an explicit client-contract change |

Reversible choices locked for planning, because they can be unwound inside a later REQ without a new authority model:

- An operational observation is recorded before any cause claim.
- Feedback analysis appends a facet. It does not overwrite the observation.
- Empty, missing, and unavailable inputs stay `unknown`, `not_measured`, or `not_applicable`.
- Trends use named counts, denominators, and proof boundaries. There is no universal score.
- Phase 5 reuses [ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY](../tied-project/architecture-decisions/ARCH-TIED_FEEDBACK_PROMOTION_BOUNDARY.yaml). It does not add a second queue.
- Digest text cites **promotion status** and LEAP status (`pending`, `approved`, `rejected`, `applied`). It does not store `accepted` or `deferred` as statuses.
- This pass’s `depth_tier: minimal` applies only to the documentation edit. The first behavior-changing phase must choose depth again.

### Checklist phase map for this pass

1. `translate-sponsor-intent` and `sub-vocabulary-sync` — names above.
2. `change-definition`, `impact-discovery`, `risk-assessment`, `test-strategy` — CITDP in this document.
3. `author-requirement` through `unit-test-green` and composition — not applicable. No new token and no runtime change.
4. `persist-citdp-record` and `verification-gate` — documentation CITDP and read-only checks.
5. `traceable-commit` and close-out — remain pending until a later `plan-close-out`. This pass does not commit.

## Plan

### Change definition — this pass

| | |
|---|---|
| Current | The linked plan described a Kaizen loop and used review words (`accepted`, `deferred`, a short kind list) that collide with **promotion status**, LEAP status, and **feedback entry type**. |
| Desired | One naming bridge, one module sequence, one test outline, and an explicit handoff that refuses to inherit this pass’s depth. |
| Unchanged | `tied_feedback_add`, `tied_feedback_export`, `normalizeOperationalSource`, duplicate grouping, and reviewed proposal creation keep their current behavior. |
| Non-goals | No new REQ/ARCH/IMPL, no store migration, no transport, no score, no automatic canonical YAML write, no commit. |
| Success | The plan, vocabulary, Tracker, and CITDP use the same names, and the three costly choices are recorded as sponsor decisions with dated approval. |

### Change definition — later capability

The later capability, when a sponsor authorizes `plan-new-feature` for one phase, should let a client record an **operational observation** at the point of work, queue ordinary friction, analyze recurrence with denominators, hand a reviewed finding to the existing LEAP proposal queue, and record an **outcome observation** against a **baseline**.

That capability is not authorized by this refine pass.

### Impact

Modules and records in the neighborhood:

| Surface | Current fact | This pass | Later phase that may touch it |
|---|---|---|---|
| `feedback.yaml` and `appendEntry` | Three **feedback entry types**; optional context | Read only | Phase 1, additive fields |
| `normalizeOperationalSource` | `user_report` becomes `feature_request`; other operational sources become `bug_report` | Read only | Phase 2 |
| **promotion status** | `promotion_pending`, `proposal_created`, `canonical_ready`, `rejected`, `duplicate` | Names only | Phase 5 uses these values |
| LEAP proposal queue | `pending`, `approved`, `rejected`, `applied`; non-canonical | Read only | Phase 5 calls the existing review path |
| REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION | Index status `Planned` while ARCH/IMPL are Active and `feedback-promotion.ts` exists | Noted, not edited | A later verification-gated pass may reconcile status. Hand edit is out of scope |
| Quality vocabulary | **privacy tier**, **idempotency key**, **proof boundary**, **client cohort**, denominator fingerprint | Cited | Phases 1, 3, 4, and 7 |
| Adversarial depth | This documentation CITDP is `minimal` with no eligibility trigger matched | Recorded | Phase 1 matches external input and persistence. Phase 3 also matches network. Those requests default to `integrated` unless a sponsor waiver is recorded |

`tied_tokens_new` for this pass is empty. `tied_tokens_affected` is empty because no token file changes.

### Risk

`research_profile: integrated-agent`. `assurance_profile: baseline-functional` for this documentation edit. `gate_policy: advisory`. `prior_depth_tier: null`.

Eligibility triggers matched by **this pass:** none. The pass edits a plan and a glossary. It does not accept external input, authenticate, open a network transport, or persist observations.

The later behavior-changing phases match external input and persistence (Phase 1) and network (Phase 3). Copying `minimal` forward is a disconfirming failure for the next request. Sponsor confirmation is required to waive `integrated` there. This CITDP does not contain that waiver.

| Risk | Quality attribute | Safeguard in this plan |
|---|---|---|
| A capture form forces a diagnosis | Usability | Observation and analysis stay separate facets |
| `user_report` is stored as a feature request before anyone knows that | Data integrity | Phase 2 recommendation: caller-supplied type wins; otherwise map defect-like kinds to `bug_report` and other kinds to `methodology_improvement` |
| A digest status overwrites **promotion status** | Data integrity | Digest cites the existing enums |
| Retry double-counts recurrence | Data integrity | **Idempotency key** before any outbox or trend count |
| Client payloads leave the machine | Privacy | Sponsor-approved **privacy tier** `operator_local`; typed refs; redaction status |
| A report becomes a methodology change | Authority | Human-reviewed non-canonical proposal, then a separate TIED YAML write |
| A finished fix is called an improvement | Proof boundary | Outcome requires a baseline and may be `inconclusive` or `not_measured` |
| Incompatible clients share one trend | Proof boundary | Compatibility key, denominator fingerprint, explicit exclusions |
| This minimal depth is reused for Phase 1 | Process | Depth-inheritance rule above |

Residual risk for this pass: a later agent can still ignore the handoff and start coding from the narrative. Owner: the next `plan-new-feature` session. Expiry: the first behavior-changing request. Mitigation: the Implement section is the execution contract.

Counterexamples for this documentation pass:

- A coherent plan can still describe a loop the repository does not implement.
- Active promotion code can coexist with a requirement record whose status is still `Planned`.
- Recorded sponsor decisions can still be read as authorization to implement Phase 1.

Falsification questions:

- Does every new storage word in the exchange sketches match **promotion status**, LEAP status, or an explicitly proposed field?
- Does the Implement section forbid inheriting `depth_tier: minimal` into Phase 1?
- Does the vocabulary avoid using **workaround** as the name of a **countermeasure**?

Disconfirming observations:

- Any new project REQ, ARCH, or IMPL token created by this pass.
- Any edit under `mcp-server/src/feedback.ts` or `feedback-promotion.ts` in this pass.
- Any sentence that treats `accepted` or `deferred` as a stored **promotion status**.

### Test strategy

This pass has no application tests. Verification is a read-only check that the plan, glossary, Tracker, and CITDP agree, plus `tied_validate_consistency` to show the token indexes were not broken.

The later capability uses this outline. Each phase is its own REQ. Tests lock the desired contract, including the cases where today’s adapter collapses a user report into `feature_request`.

| Phase | Module under test | Desired evidence | Proof boundary |
|---|---|---|---|
| 0 | Names and CITDP | Glossary rows and this plan agree | Does not prove runtime behavior |
| 1 | Observation capture | Unit tests for valid, incomplete, malformed, redacted, and idempotent retry; atomic write and restart | Does not prove a cause or an improvement |
| 2 | Source normalization | Fixtures for incident, metric, test failure, and user report; provenance kept; privacy rejection | Does not choose a countermeasure |
| 3 | Receipt and outbox | Offline append, retry, duplicate delivery, timeout, suppression | Transport adapters stay behind the outbox port |
| 4 | Feedback analysis | Golden fixtures for recurrence, denominator mismatch, missing evidence, incompatible cohorts, empty windows, rerun identity | Digest is a projection |
| 5 | Review bridge | Review required, reject, approve, attempted canonical write, stale evidence | Reuses the promotion boundary |
| 6 | Outcome | Missing baseline, inconclusive, regression routed back to analysis, evidence-link integrity | A restored service can still have outcome `not_measured` |
| 7 | Pilot | Named metrics with denominators and stop criteria | Pilot evidence is not a methodology change |

Composition tests cover adapter and MCP bindings. E2E is unnecessary while the surfaces are MCP, CLI, and file append.

`diff_scoped_crap` stays unset. The configured `dae.crap_threshold` of 30 does not run for this documentation pass. BBCE advisory enforcement stays off. The module table below is ordinary ownership, not a BBCE verification claim.

## Executive proposal

TIED should treat client feedback as observations about the **production system**, as well as requests for features and reports of defects. The client should record an **operational observation** at the point of work, keep the **workaround** and the evidence that made it visible, and later decide whether a reviewed **countermeasure** changed the system.

```text
do the work
  → encounter reality
  → capture an operational observation
  → return a receipt
  → analyze recurrence, impact, and cause hypotheses
  → choose a reviewed countermeasure
  → change the production system through the existing TIED workflow
  → record an outcome observation against a baseline
  → feed that outcome into the next cycle
```

The loop wraps the existing feedback store. It keeps these artifacts distinct:

- a **feedback entry** and a canonical REQ, ARCH, or IMPL record
- an **operational observation** and a cause hypothesis
- a **non-canonical proposal** and a promoted TIED change
- a **receipt** and a notification
- a **workaround** and a **countermeasure**
- an automated status report and sponsor intent

### Sponsor Kaizen principles

These principles come from the sponsor’s Kaizen article. They bound what the **Kaizen loop** means here. They are not new storage fields or tokens. Canonical names live in [`feedback-to-tied.md`](../tied-project/vocab/feedback-to-tied.md).

**What Kaizen is not.** “Continuous improvement” as a slogan, retrospective action items without a **countermeasure**, and improvement backlogs that never change the **production system** are not the model. The model is a system that learns while doing real work: friction and abnormalities become visible, get investigated, and—when warranted—produce a deliberate system change whose effect can be observed against a **baseline**.

**Correction versus improvement.** Restoring service or patching a defect may be necessary **correction**. Kaizen-shaped work also asks why the condition was possible, embeds what was learned (tests, tools, constraints, clearer interfaces), and records an **outcome observation**. A one-off restore can exist without an improvement record; an improvement claim requires baseline and follow-up evidence.

**Innovation versus Kaizen.** A large redesign or new capability is **innovation**—it changes what is possible. Removing recurring friction, speeding feedback, or making the better path the default path is **Kaizen loop** work on the system you already have. Innovation may reset the **baseline**; Kaizen then learns how to operate the new system reliably.

**Output is not only code.** Prototypes, failed tests, and spikes can be valuable **discovery** output. The loop treats them as **operational observations** and evidence, not as “waste” to hide, when they reveal constraints or prevent larger wrong-direction work.

**Documented process versus lived process.** A workflow that looks fine on a diagram may rely on private scripts, remembered exceptions, and tolerated waiting. **Point-of-work capture** preserves **workarounds** and context so analysis can see the gap between intended and actual paths—not reward people for absorbing complexity in memory.

**Local encounter, non-local cause.** The person who hits friction is a sensor, but the **countermeasure** may require an organizational boundary, architecture, or ownership change. The review and sponsor boundary exists so causes outside immediate control can still change the **production system** instead of teaching people to hide problems.

**Constraints the loop attacks.** Understanding cost, communication cost, feedback latency, complexity, and the cost of safe change show up as waiting, rework, confusing interfaces, slow tests, painful deployment, and missing information. Improving those constraints increases how fast the system can learn from the next cycle of work.

**Nested production.** Operating the **production system** also produces improvements to that system—a second production process inside the first. Phases 1–7 implement pieces of that nested loop without replacing normal feature delivery.

**Organizational test.** When engineers repeatedly meet the same friction, the question is whether the organization improves the system or gets better at tolerating it. Good Kaizen moves discovered knowledge into tests, tools, and standards so the next person does not need private tricks.

## What the loop is improving

The object of improvement is the **production system**:

- sponsor language and vocabulary routing
- time to get useful feedback from tests and tools
- usability of the REQ → ARCH → IMPL workflow
- discoverability of evidence and proof boundaries
- client onboarding and methodology refresh
- cost of workarounds, waiting, rework, and repeated clarification
- reliability of the TIED MCP, CLI, validators, and generated reports

The person who meets the friction is a sensor. The record keeps the local **workaround** and the conditions that required it. The same observation may later show a missing guide, a tool defect, an unclear contract, an architectural constraint, or an organizational boundary.

A change is an improvement only when an **outcome observation** can be compared with a **baseline**. A useful **countermeasure** makes the better behavior easier, more visible, or more reliable for the next person.

## Current baseline and the gap

### Already available

1. `feedback.yaml` stores client **feedback entries** under the TIED base path.
2. `tied_feedback_add` records a `feature_request`, `bug_report`, or `methodology_improvement` and returns an identifier, timestamp, and report snippet.
3. `tied_feedback_export` emits all entries as Markdown or JSON.
4. Operational adapters accept incidents, metrics, test failures, and user reports with source identity, severity, affected feature, and evidence links. `normalizeOperationalSource` maps `user_report` to `feature_request` and the other sources to `bug_report`.
5. Duplicate grouping keeps original entries and identifies equivalent reports.
6. Reviewed promotion can create a distinct **non-canonical proposal**. It does not write canonical REQ, ARCH, or IMPL YAML. **promotion status** is `promotion_pending`, `proposal_created`, `canonical_ready`, `rejected`, or `duplicate`.

The requirement record [REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION](../tied-project/requirements/REQ-TIED_OPERATIONAL_FEEDBACK_PROMOTION.yaml) still says `Planned`. The architecture, the implementation decision, and `feedback-promotion.ts` are already present. This plan does not edit that status. A later verification-gated pass can reconcile it.

These capabilities support collection and a review boundary. They are not yet a **Kaizen loop**. There is no **observation kind**, no **receipt** distinct from the add result, no **feedback digest**, and no **outcome observation**.

### Questions the current shape does not answer

- What was the person doing when the observation occurred?
- What **baseline** or intended path was expected?
- How much waiting, rework, workaround effort, or blocked progress resulted?
- Was this a one-time discovery, a recurring condition, or a known exception?
- Which evidence supports the observation, and which supports a cause hypothesis?
- Which **countermeasure** changed the production system?
- Did recurrence or effort change afterward?
- Which observations should be communicated immediately, and which belong in **feedback analysis**?
- What denominator supports a trend, and what was `not_measured`?

## Proposed feedback model

Extend the existing entry contract additively. The first capture does not require every field.

### 1. Observation

Capture at or near the point of work:

- occurrence time and client or project identity
- workflow, checklist phase, tool surface, or work context
- **observation kind** from the closed set below
- description in the observer’s words
- expected standard or intended path, when known
- immediate impact: blocked work, delay, rework, defect escape, uncertainty, or context switching
- **workaround** taken, when one was used
- optional duration or count, with an explicit `unknown`

Closed **observation kind** values for the first contract:

`waiting`, `rework`, `repeated_clarification`, `confusing_interface`, `failed_test`, `deployment_failure`, `defect`, `workaround`, `discovery`, `missing_information`, `incident`, `other`

`other` carries a non-empty qualifier. A legacy entry with no kind is `unknown` in analysis. It is not counted as zero and it is not guessed.

Type mapping when the caller omits **feedback entry type** (sponsor-approved policy for the first contract):

- `defect`, `failed_test`, `deployment_failure`, `incident` → `bug_report`
- every other known kind → `methodology_improvement`
- an explicit caller type always wins

That mapping replaces the current `user_report` → `feature_request` default only in the phase that implements it.

### 2. Evidence and context

Keep typed, privacy-reviewed references:

- test, build, deployment, incident, or tool-run identifier
- command or report reference
- affected feature, REQ, ARCH, IMPL, module, or checklist phase when known
- TIED version, client version, and relevant environment
- screenshots or logs only when the client **privacy tier** allows them
- source identity and occurrence timestamp
- redaction status and an explanation of omitted data

Evidence links establish provenance. They do not establish causality, product correctness, user satisfaction, or a methodology change.

### 3. Analysis

Analysis is a separate facet:

- duplicate group and recurrence count
- impact estimate and denominator
- cause hypothesis with confidence and competing explanations
- missing specification, implementation lag, tool failure, environmental failure, or confirmed defect
- affected production-system boundary
- proposed **countermeasure** and expected mechanism
- reviewer, **promotion status**, and decision rationale
- residual uncertainty and **proof boundary**

The analyzer must not overwrite the original observation.

### 4. Countermeasure and outcome

When a change is selected, record:

- the **baseline** window or prior standard
- the reviewed **countermeasure**
- the TIED proposal or canonical tokens changed, if any
- the implementation and regression evidence
- the observation window after the change
- **outcome observation:** `improved`, `unchanged`, `regressed`, `inconclusive`, or `not_measured`
- residual risk and follow-up owner and expiry

Restoring a service and changing the system so the condition recurs less often are two records. Either one may exist without the other.

## Two communication paths

### Path A: point-of-work capture

```text
operational observation
  → local append
  → receipt
  → notification policy
  → later review
```

The **receipt** returns:

- feedback identifier and occurrence time
- **observation kind** and source
- severity or impact, or `unknown`
- idempotent-replay or duplicate-group status when already known
- evidence refs validated or rejected (capture-time validation only; not a **promotion status** or LEAP status)
- notification disposition: `sent`, `queued`, `suppressed`, or `not_configured`
- the next local action, when one is defined

Capture stays local-first. A client can record an observation while offline. A transport failure must not drop the local entry or turn it into a canonical change.

**Notification policy** is not one message per event. Escalation examples: a production outage, a repeated high-cost workaround, a privacy or security concern, or a threshold breach. Ordinary friction is queued.

An outbox for an issue, pull request, channel, or webhook waits until the receipt and retry contract exist. Sponsor decision (2026-10-07): Phase 1 and Phase 2 ship without upstream transport; export or copy only.

### Path B: feedback analysis

```text
feedback entries + operational evidence
  → deterministic grouping and cohort selection
  → feedback digest
  → human review
  → non-canonical proposal, rejection, or deferred review
  → canonical TIED change only after a separate approval
  → outcome observation
```

The digest reports named counts:

- analysis window and **client cohort**
- input manifest and compatibility key
- counts by **observation kind**, source, severity, and workflow, with `unknown` separated
- duplicate groups and recurrence
- numerators, denominators, and excluded or unknown inputs
- cause hypotheses and their proof boundaries
- workarounds and estimated cost, marked as estimates
- countermeasures and outcome status
- proposed methodology improvements
- **privacy tier**, redaction decisions, and path limitations
- unresolved review decisions, using **promotion status** and LEAP status
- residual risk

Only compatible schemas and denominator fingerprints are compared. An empty value stays `not_measured`, `unknown`, or `not_applicable`.

Export a Markdown briefing and a versioned machine-readable digest. Ingest uses the existing feedback and promotion boundary. The digest does not authorize a methodology change.

## Proposed client-to-TIED exchange

Field names below are the planning contract. A later REQ still has to approve the schema version.

### Immediate event envelope

Used for observations that need routing beyond the local file. Phase 1 may persist the same fields locally and return a **receipt** without sending this envelope.

```yaml
schema_version: feedback-event.v1
client:
  project_id: hashed-or-local-identity
  tied_version: version
  privacy_tier: operator_local | shareable_hashed | forbidden_export
observation:
  id: client-generated-id
  occurred_at: ISO-8601
  kind: waiting | rework | repeated_clarification | confusing_interface | failed_test | deployment_failure | defect | workaround | discovery | missing_information | incident | other
  other_qualifier: required when kind is other
  title: short description
  impact: high | medium | low | unknown
  entry_type: feature_request | bug_report | methodology_improvement | omitted
evidence:
  refs: []
  redaction: applied | not_required | incomplete
delivery:
  idempotency_key: stable-key
  attempted_at: ISO-8601
```

### Feedback digest

```yaml
schema_version: feedback-analysis.v1
client_cohort:
  compatibility_key: schema-and-profile-key
  denominator_fingerprint: stable-hash
  analysis_window: start/end
inputs:
  manifest_ref: stable-reference
  entries: count
  excluded: count
  unknown: count
observations:
  by_kind: {}
  duplicate_groups: []
  recurrence: []
impact:
  numerator: value
  denominator: value
  unknown: value
findings:
  - observation_group: stable-id
    hypothesis: text
    confidence: low | medium | high
    proof_boundary: text
    promotion_status: promotion_pending | proposal_created | canonical_ready | rejected | duplicate
countermeasures:
  - name: text
    leap_status: pending | approved | rejected | applied | none
    outcome: improved | unchanged | regressed | inconclusive | not_measured
    outcome_ref: optional-reference
review:
  decision: proposal_created | rejected | deferred_review | duplicate
  reviewer: optional
```

`deferred_review` is a digest decision name for **deferred review**. It is not a new **promotion status** and not a LEAP status. The entry stays `promotion_pending`.

`duplicate` in `review.decision` is a digest **review outcome label** when the reviewer concludes the group is a duplicate. It is not a second stored field on the entry; when persisted, **promotion status** remains the authoritative enum on `entries[]`.

The digest references source entries and hashes so a reviewer can open the evidence without walking a client repository.

## Review and authority boundary

1. A client or tool records an **operational observation** inside its delegated work envelope.
2. A deterministic adapter checks shape, provenance, privacy tier, and idempotency.
3. **Feedback analysis** groups observations and proposes explanations. It does not hold intent authority.
4. A reviewer decides whether the group supports a **non-canonical proposal**, a rejection, or a **deferred review**.
5. The sponsor owns scope and canonical intent; costly-choice defaults for delivery, privacy tier, and entry-type shape are recorded in the Refine section unless reopened.
6. Canonical REQ, ARCH, and IMPL changes use the existing TIED YAML workflow, tests, verification, and LEAP.
7. An **outcome observation** is added against the **baseline**.

The agent may observe, act, measure, and adapt inside the delegated envelope. Feedback is information. It is not authorization.

## Implement

### This pass

Do not write production code from this document. Do not mint tokens. Do not start `unit-test-red`. The Tracker marks those steps not applicable for `PLAN-TIED-KAIZEN-FEEDBACK-LOOP`.

Before any behavior-changing phase:

1. Confirm `tied_config_get_base_path` is this repository’s `tied-project/`.
2. Start `plan-new-feature` for one phase only.
3. Select `depth_tier` again. Phase 1 and later match external input and persistence, so the default is `integrated` unless the sponsor records `integrated_waiver` with owner, expiry, rationale, and approval.
4. Apply the three **sponsor decisions** in the Refine section (recorded 2026-10-07) in that phase’s REQ scope; do not treat this plan text alone as implementation authorization.
5. Author IMPL pseudo-code with block token comments and run pseudo-code validation before RED tests.

### Later phases

Each phase is a separate TIED change with its own REQ, ARCH, IMPL, pseudo-code, RED tests, module validation, and composition evidence.

| Phase | Module | Owns | Leaves alone |
|---|---|---|---|
| 0 | Contract and vocabulary | Names, non-goals, sponsor decision record | Store and tools. Naming and costly-choice record are in this plan |
| 1 | Observation capture | Additive local append, **receipt**, idempotency, privacy/redaction status at **privacy tier** `operator_local` | Analysis, upstream transport, promotion |
| 2 | Source normalization | **observation kind**, workflow, workaround, baseline refs on existing adapters | Raw observation text and analysis facets |
| 3 | Outbox | Retry state and **notification policy** behind a transport port | Observation storage. Not in the first behavior-changing request (Phases 1–2 are local append and export only per sponsor decision) |
| 4 | Feedback analysis | Read-only grouping, denominators, versioned digest | Source entries and project YAML |
| 5 | Review bridge | Links from digest findings to existing ids; calls the current review path | A second promotion mechanism and canonical writes |
| 6 | Outcome loop | Baseline, follow-up window, outcome, evidence links | Automatic reopen of canonical requirements |
| 7 | Pilot | A small comparable cohort, named metrics, stop criteria | Treating pilot volume as success or as a methodology change |

Phase 1 exit evidence: unit tests for valid, incomplete, malformed, duplicate, and redacted inputs; persistence tests for atomic writes and restart; a receipt with no cause claim required.

Phase 2 exit evidence: source fixtures, provenance, privacy rejection, and composition tests for each adapter binding. A user report can remain a friction observation.

Phase 3 exit evidence: offline capture, retry, duplicate delivery, timeout, and suppression. MCP and CLI bindings are composition-testable.

Phase 4 exit evidence: golden fixtures for recurrence, denominator mismatch, missing evidence, incompatible clients, empty periods, and identical reruns.

Phase 5 exit evidence: review required, reject, approve, canonical-write attempt, stale evidence, and proposal link. Reuse `createReviewedLeapProposal`.

Phase 6 exit evidence: outcome transitions, missing baseline, inconclusive results, regression routed to analysis, and evidence-link integrity.

Phase 7 promotion rule: pilot results stay analysis evidence until a separate sponsor-approved TIED change promotes the capability. Stop criteria cover privacy incidents, notification overload, transport loss, and classification ambiguity that reviewers cannot resolve.

### Handoff

**Resume here (2026-10-07):** Phases **1–2 are implemented and committed** (`229ab6b`, `c4cc94f`). **Phase 3 (transport) is deferred** — sponsor confirmed finishing **Phases 4–7** first on local/export only. **Next agent step:** `P4-initiate` → **`plan-new-feature` for Phase 4 only** (suggested `REQ-KAIZEN-FEEDBACK-ANALYSIS`).

| Resource | Purpose |
| --- | --- |
| [`kaizen-program-execution-checklist.yaml`](../tied-project/working/PLAN-TIED-KAIZEN-FEEDBACK-LOOP/kaizen-program-execution-checklist.yaml) | `agent_handoff`, `current_step`, phase status |
| [`agent-resume-handoff.md`](../tied-project/working/PLAN-TIED-KAIZEN-FEEDBACK-LOOP/evidence/agent-resume-handoff.md) | One-page completions + Phase 4 workflow |
| [`PLAN.md`](../tied-project/working/PLAN-TIED-KAIZEN-FEEDBACK-LOOP/PLAN.md) | Working-folder status summary |

PRELOAD [`feedback-to-tied.md`](../tied-project/vocab/feedback-to-tied.md); confirm `tied_config_get_base_path` before MCP writes. Each phase: `build-plan` → `plan-close-out` (evidence + commit) → advance orchestrator. Continue **5 → 6 → 7** without pausing for closed hinges unless stop criteria fire.

## Phase 2 refine pass (source normalization)

**Request (planning):** `REQ-KAIZEN-SOURCE-NORMALIZATION`  
**Pass:** `refine-plan` only — no REQ/ARCH/IMPL tokens, no runtime change, no commit.  
**Depends on:** Phase 1 [REQ-KAIZEN-OBSERVATION-CAPTURE](../tied-project/requirements/REQ-KAIZEN-OBSERVATION-CAPTURE.yaml) (closed).  
**Program step:** `P2-initiate` on [`kaizen-program-execution-checklist.yaml`](../tied-project/working/PLAN-TIED-KAIZEN-FEEDBACK-LOOP/kaizen-program-execution-checklist.yaml).

### Refine — Phase 2

Touchpoint 1 RESOLVE for adapter normalization (distinct from Phase 1 point-of-work capture):

| Input surface | Canonical module | Notes |
|---|---|---|
| `tied_feedback_operational_add` | **operational source** adapter | Today: `normalizeOperationalSource` in `feedback-promotion.ts` |
| `tied_feedback_capture_observation` | **point-of-work capture** | Phase 1; Phase 2 aligns **entry type** inference when `entry_type` omitted |
| `source_type` incident / metric / test_failure / user_report | Maps to default **observation kind** | Provenance fields (`source_id`, `evidence_links`, `occurred_at`) preserved |
| Caller `entry_type` | **feedback entry type** | Always wins over kind inference (sponsor policy) |
| Kind-only capture or adapter payload | **observation kind** inference → **feedback entry type** | See table below |
| `workflow`, `workaround`, `baseline_ref` on payload | Additive context on the entry | Does not overwrite observation text or analysis facets |

**Kind → entry type when caller omits `entry_type`** (unchanged from program plan):

| **observation kind** | **feedback entry type** |
|---|---|
| `defect`, `failed_test`, `deployment_failure`, `incident` | `bug_report` |
| all other known kinds | `methodology_improvement` |

**Default kind from `source_type` when payload omits kind** (Phase 2 contract proposal):

| `source_type` | default **observation kind** | notes |
|---|---|---|
| `incident` | `incident` | |
| `test_failure` | `failed_test` | |
| `metric` | `missing_information` | caller may supply a narrower kind |
| `user_report` | `other` | requires `other_qualifier` on payload (e.g. `user_report`) so friction stays explicit, not auto-**feature_request** |

**Delegated envelope for this pass:** May edit this section, [`feedback-to-tied.md`](../tied-project/vocab/feedback-to-tied.md) bridge rows, and `tied-project/working/REQ-KAIZEN-SOURCE-NORMALIZATION/`. May not change `feedback.yaml` runtime behavior or mint tokens.

**Depth:** `minimal` for this refine-plan pass; **`implementation_depth_tier: integrated`** for the Phase 2 REQ (external operational input and persistence). Forbidden: inheriting this pass’s `minimal` depth into `build-plan` without reselecting integrated.

### Plan — Phase 2

| | |
|---|---|
| **Current** | `user_report` → `feature_request`; other sources → `bug_report`; no shared inference with capture; no `observation_kind` / workflow / workaround / baseline on operational entries |
| **Desired** | Shared `feedback-source-normalization` (proposed) exports kind inference and entry-type resolution; `normalizeOperationalSource` and capture both consume it; operational entries carry additive context; privacy tier rejected unless `operator_local` when tier is present on adapter payload |
| **Unchanged** | Phase 1 receipt and idempotency; promotion boundary; local-only transport policy for Phases 1–2 |
| **Non-goals** | Analysis/digest, outbox, changing raw observation prose, fourth entry type |
| **Success** | Fixture table in working CITDP; RED tests listed before code; composition coverage for MCP operational_add |

Impact neighborhood: `feedback-promotion.ts`, `feedback-capture.ts`, `tools/index.ts`, tests listed in working CITDP. New tokens deferred to `plan-new-feature`: `[REQ-KAIZEN-SOURCE-NORMALIZATION]`, `[ARCH-KAIZEN_SOURCE_NORMALIZATION]`, `[IMPL-KAIZEN_SOURCE_NORMALIZATION]`.

### Implement — Phase 2 (this pass)

Do not write production code from this subsection. Do not start `unit-test-red`.

**Next authorized session:** `plan-new-feature` or `build-plan` for Phase 2 only — mint tokens, author IMPL pseudo-code with block token comments, run `pre_implementation` gate with integrated activation, then RED tests per working [`test-strategy-evidence.md`](../tied-project/working/REQ-KAIZEN-SOURCE-NORMALIZATION/evidence/test-strategy-evidence.md).

**Exit evidence (unchanged from module table):** source fixtures (incident, metric, test_failure, user_report), provenance and privacy rejection, composition tests per adapter binding; a **user report** may remain a friction **operational observation** without becoming a **feature_request** by default.

## Risks and safeguards

| Risk | Safeguard |
|---|---|
| Feedback becomes a noisy issue dump | Separate point-of-work capture from feedback analysis; group by recurrence and impact |
| Capture interrupts the work | Local-first, short capture, optional enrichment, non-blocking receipt |
| A hypothesis is stored as the observation | Separate observation, hypothesis, evidence, and proof boundary |
| Raw client data leaves the machine | Privacy tier, typed references, redaction, opt-in transport |
| Duplicate events inflate trends | Idempotency key and duplicate grouping that keeps originals |
| Telemetry drowns human feedback | Keep usage metrics and feedback distinct until a bounded analysis adapter joins them |
| A report changes methodology by itself | Reviewed non-canonical proposal, then an explicit canonical write |
| A completed fix is called an improvement | Baseline plus outcome, including `inconclusive` and `not_measured` |
| The metric replaces the system | Named counts and proof limits; no universal score |
| Cohorts are incomparable | Versioned schemas, compatibility keys, denominator fingerprints, explicit exclusions |
| This plan’s minimal depth is reused for capture | Phase 1 reselects depth; integrated is the default when persistence and external input match |

## Definition of success

The future capability is successful when a TIED client can:

1. record an **operational observation** at the point of work and receive a **receipt**
2. communicate urgent observations under a **notification policy** while queueing ordinary friction
3. export a privacy-bounded **feedback digest** with recurrence, impact, uncertainty, and denominators
4. keep raw feedback, analysis, LEAP proposals, and canonical TIED intent distinct
5. review and implement a **countermeasure** through the existing TIED workflow
6. record an **outcome observation** against a **baseline**
7. use that outcome in the next cycle

The useful signal is that a recurring workaround becomes less necessary, that one client’s discovered knowledge is available to another, and that the evidence for that claim can still be inspected.

## Non-goals

- No automatic promotion into project REQ, ARCH, or IMPL YAML
- No replacement of the feedback store, LEAP proposal queue, CITDP, quality evidence, or verification gates
- No requirement that every observation include a root-cause diagnosis
- No centralized collection of secrets, full source trees, or unbounded telemetry
- No universal client score or cross-cohort ranking
- No claim that a green structural check or a successful countermeasure proves product correctness outside its proof boundary
- No implementation, token creation, or commit inside this refine pass

## Sponsor decisions (recorded)

Approved **2026-10-07**. Full policy table: Refine section *Sponsor decisions (costly choices)*.

| Question | Decision |
|---|---|
| May the first behavior-changing request ship with local append and export only, and with no upstream transport? | **Yes** |
| Is privacy tier `operator_local` acceptable until a named owner and expiry exist for any `shareable_hashed` export? | **Yes** |
| Should the persisted **feedback entry type** enum stay at three values, with **observation kind** added beside it? | **Yes** |

Reopening any hinge requires an explicit sponsor change request and CITDP update; Phase 3 transport and `shareable_hashed` export remain out of scope until separately authorized.
