# Feedback to TIED (canonical)

**Scope:** Upstream feedback captured in `tied/feedback.yaml`, entry types, MCP add/export tools, and naming for client→methodology feedback. **Vocabulary only** — append/export algorithms live in [`../../mcp-server/src/feedback.ts`](../../mcp-server/src/feedback.ts) and [IMPL-MCP_FEEDBACK_TOOLS-pseudocode.md](../implementation-decisions/IMPL-MCP_FEEDBACK_TOOLS-pseudocode.md).

**Traceability:** [REQ-FEEDBACK_TO_TIED](../requirements/REQ-FEEDBACK_TO_TIED.yaml) · [ARCH-FEEDBACK_STORAGE](../architecture-decisions/ARCH-FEEDBACK_STORAGE.yaml) · [IMPL-MCP_FEEDBACK_TOOLS](../implementation-decisions/IMPL-MCP_FEEDBACK_TOOLS.yaml)

**See also:** [`domain-references.md`](domain-references.md) · [`tied-yaml-mcp.md`](tied-yaml-mcp.md) · [`leap-proposal-queue.md`](leap-proposal-queue.md) · [`quality-assurance.md`](quality-assurance.md) · [`sponsor-agent-relationship.md`](sponsor-agent-relationship.md) · [`../docs/vocabulary-index-analysis-and-standards.md`](../../tied-bundle/docs/vocabulary-index-analysis-and-standards.md)

**Planning decisions (Kaizen loop):** Sponsor-approved costly choices for the first behavior-changing phases (local append/export only, default **privacy tier** `operator_local`, three **feedback entry types** plus additive **observation kind**) are recorded in [`../../docs/tied-kaizen-feedback-loop-plan.md`](../../docs/tied-kaizen-feedback-loop-plan.md) (2026-10-07). They bound REQ scope; they are not store fields.

**Program execution checklist:** Central orchestrator for Phases 0–7 after batch approval—resume, phase status, and sponsor-interrupt boundaries—at [`../working/PLAN-TIED-KAIZEN-FEEDBACK-LOOP/kaizen-program-execution-checklist.yaml`](../working/PLAN-TIED-KAIZEN-FEEDBACK-LOOP/kaizen-program-execution-checklist.yaml). Each phase still uses a per-REQ copy of the agent implementation checklist under `working/{REQ-TOKEN}/`.

Privacy tier, idempotency key, proof boundary, client cohort, and denominator fingerprint stay in [`quality-assurance.md`](quality-assurance.md). LEAP proposal status values stay in [`leap-proposal-queue.md`](leap-proposal-queue.md): `pending`, `approved`, `rejected`, `applied`.

---

## Preferred terms vs synonyms

| Preferred | Avoid | Notes |
|-----------|-------|-------|
| **feedback entry** | ticket, issue (alone) | One row in `entries[]` |
| **feedback.yaml** | feedback json | YAML under `{TIED_BASE}/feedback.yaml` |
| **feature_request** | feature, enhancement (as type value) | Exact enum value |
| **bug_report** | bug | Exact enum value |
| **methodology_improvement** | process fix | Exact enum value |
| **operational observation** | feedback (alone), complaint, abnormality | A point-of-work account of friction, a workaround, a defect, or a discovery. It is an account of what happened, recorded before any diagnosis or canonical intent |
| **observation kind** | feedback type (alone), category | Closed classifier of an operational observation, stored separately from **feedback entry type**. Value `discovery` marks learning output (prototype, spike, failed experiment) that is not “waste” when it informed the next action |
| **feedback entry type** | type (alone) | Exact enum on a feedback entry: `feature_request`, `bug_report`, `methodology_improvement` |
| **point-of-work capture** | retrospective-only feedback | Recording an operational observation close to when the work occurs |
| **workaround** | standard process, countermeasure | A local temporary path that made the work possible. Preserve it as evidence of the condition that required it |
| **feedback analysis** | export (alone), dashboard | A derived, reviewable interpretation of feedback entries with provenance, denominators, uncertainty, and proof boundaries |
| **countermeasure** | fix (alone), workaround | A reviewed change to the production system intended to reduce recurrence or make useful work easier |
| **baseline** | before metric (alone) | The prior condition an **outcome observation** compares with a countermeasure |
| **outcome observation** | success metric (alone) | Follow-up evidence comparing a countermeasure with its baseline; may be improved, unchanged, regressed, inconclusive, or not measured |
| **feedback digest** | report (alone) | Versioned client-to-TIED analysis projection that references source feedback without replacing it |
| **receipt** | ack (alone) | Immediate local response from point-of-work capture. It confirms the append; it does not notify anyone and it does not authorize a change |
| **notification policy** | alert all | Rule for whether an observation is surfaced immediately, queued, or suppressed |
| **promotion status** | review status (alone) | Exact feedback-entry values: `promotion_pending`, `proposal_created`, `canonical_ready`, `rejected`, `duplicate` |
| **deferred review** | deferred status | A review decision that creates no LEAP proposal and leaves **promotion status** at `promotion_pending` |
| **Kaizen loop** | kaizen score, maturity, continuous improvement (alone) | Sponsor label for a **production system** that learns from work: operational observation → feedback analysis → reviewed countermeasure → outcome observation against a **baseline**. Not retrospectives-only, not an improvement backlog without system change, not a score. See [Kaizen principles](#kaizen-principles-sponsor-article) |
| **production system** | the product (alone) | The system in which TIED work happens: sponsor language, workflow, tools, evidence, and refresh. An application under test is in scope only when the observation names it |
| **correction** | improvement (alone), Kaizen (for a hotfix) | Restores working order (e.g. service restore, defect patch). Necessary but not sufficient for Kaizen-shaped improvement without a **countermeasure**, **baseline**, and **outcome observation** |
| **innovation** | Kaizen (alone) | Changes what is possible (major redesign, new capability). Distinct from the **Kaizen loop**, which learns how to run the resulting system better; innovation may establish a new **baseline** |
| **tied_feedback_add** | feedback add | MCP tool name |
| **tied_feedback_export** | feedback dump | MCP tool name |
| **tied_feedback_capture_observation** | capture observation | MCP tool name (Kaizen Phase 1 point-of-work capture) |

---

## Kaizen principles (sponsor article)

Normative background for the **Kaizen loop** label. Planning detail: [`../../docs/tied-kaizen-feedback-loop-plan.md`](../../docs/tied-kaizen-feedback-loop-plan.md) (section *Sponsor Kaizen principles*).

| Principle | Preferred terms |
|-----------|-----------------|
| Friction during real work is information about the **production system** | **operational observation**, **observation kind** |
| Capture close to the event, not only in retrospectives | **point-of-work capture**, **receipt** |
| Preserve local paths that hid the problem | **workaround** (not **countermeasure**) |
| Known prior state enables observing change | **baseline**, **outcome observation** |
| Separate restore from systemic change | **correction** vs **countermeasure** |
| Experiments and failed tests can be valuable output | **observation kind** `discovery` |
| Diagram process ≠ lived process | **workaround** evidence, workflow context on capture |
| Cause may lie outside the observer’s control | **feedback analysis**, review boundary, sponsor authority |
| Do not confuse endless churn with learning | **baseline**, proof boundary, `inconclusive`, `not_measured` |
| Use instruments (tests, metrics, incidents) to change the system | evidence refs, **feedback digest** |

---

## Naming bridge

| Concept | UI/doc label | Storage | MCP tool | Code symbol |
|---------|--------------|---------|----------|-------------|
| Feedback store | feedback file | `tied/feedback.yaml` | — | `getFeedbackPath()` |
| Add feedback | add entry | `entries[]` append | `tied_feedback_add` | `appendEntry()` |
| Capture observation | point-of-work capture | `entries[]` append + receipt | `tied_feedback_capture_observation` | `captureOperationalObservation()` |
| Export feedback | export report | markdown or json string | `tied_feedback_export` | export helpers in `feedback.ts` |
| Immediate feedback event | point-of-work event | `(proposed) feedback-event.v1` | `(proposed) event transport` | `(proposed) observation adapter` |
| Feedback analysis | analysis digest | `feedback-analysis.v1` | `(proposed) tied_feedback_analysis_digest` | `buildFeedbackDigest` in `feedback-analysis.ts` |
| Entry identifier | feedback id | `entries[].id` | returned by add | `fb-{timestamp}-{random}` pattern |
| Entry type | feedback entry type | `entries[].type` | add param `type` | `FeedbackType` |
| Observation kind | observation kind | `(proposed) entries[].observation_kind` | capture / operational adapter param | `(proposed) ObservationKind` |
| Source normalization | kind and entry type inference | `context.observation_kind`, workflow/workaround/baseline_ref on operational context | `tied_feedback_operational_add`, `tied_feedback_capture_observation` | `resolveFeedbackEntryType`, `defaultObservationKindFromSourceType` in `feedback-source-normalization.ts` |
| Promotion status | promotion status | `entries[].promotion_status` | promotion result | `PromotionStatus` |
| Local capture receipt | receipt | returned by capture; not a second store | `tied_feedback_capture_observation` | `buildCaptureReceipt()` |
| Optional context | context | `entries[].context` | add param `context` | `Record<string, unknown>` |

---

## Feedback entry schema (catalog)

Top-level shape:

```yaml
entries:
  - id: fb-...
    type: feature_request | bug_report | methodology_improvement
    title: string (non-empty)
    description: string (non-empty)
    context: optional object
    created_at: ISO8601 string
    promotion_status: optional promotion_pending | proposal_created | canonical_ready | rejected | duplicate
```

`observation_kind` is a proposed additive field. It is not part of the current store. Legacy entries without it stay `unknown` during **feedback analysis**.

---

## MCP tools

| Tool | Purpose |
|------|---------|
| `tied_feedback_add` | Validate and append one entry; returns `ok`, `id`, `created_at` |
| `tied_feedback_export` | Format all entries as markdown or json |
| `tied_feedback_capture_observation` | Phase 1 point-of-work capture with `operator_local` privacy, idempotency, and structured **receipt** |

---

## Pseudo-code block names

| Preferred term | UPPER_SNAKE block | Owning IMPL |
|----------------|-------------------|-------------|
| Load feedback file | `loadFeedback` | [IMPL-MCP_FEEDBACK_TOOLS](../implementation-decisions/IMPL-MCP_FEEDBACK_TOOLS.yaml) |
| Append entry | `appendEntry` | [IMPL-MCP_FEEDBACK_TOOLS](../implementation-decisions/IMPL-MCP_FEEDBACK_TOOLS.yaml) |
| MCP handler envelope | `MCP_HANDLER` | [IMPL-MCP_FEEDBACK_TOOLS](../implementation-decisions/IMPL-MCP_FEEDBACK_TOOLS.yaml) |

---

## Alphabetical index

| Term | Section |
|------|---------|
| appendEntry | Pseudo-code blocks |
| baseline | Preferred terms |
| bug_report | Preferred terms |
| correction | Preferred terms |
| countermeasure | Preferred terms |
| deferred review | Preferred terms |
| entries | Schema catalog |
| feature_request | Preferred terms |
| innovation | Preferred terms |
| feedback analysis | Preferred terms |
| feedback digest | Preferred terms |
| feedback entry | Preferred terms |
| feedback entry type | Preferred terms |
| feedback.yaml | Preferred terms |
| Kaizen loop | Preferred terms |
| loadFeedback | Pseudo-code blocks |
| methodology_improvement | Preferred terms |
| notification policy | Preferred terms |
| observation kind | Preferred terms |
| operational observation | Preferred terms |
| outcome observation | Preferred terms |
| point-of-work capture | Preferred terms |
| production system | Preferred terms |
| promotion status | Preferred terms |
| receipt | Preferred terms |
| tied_feedback_add | MCP tools |
| tied_feedback_export | MCP tools |
| workaround | Preferred terms |
