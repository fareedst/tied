# Trial readout: PROMPT-GF-01 → client `1791731617`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-10-11 |
| **Touchpoint** | `/xlate` (translate-sponsor-intent) + facilitator inspection |
| **Trial prompt** | [PROMPT-GF-01](catalog-greenfield-plan-new-feature-prompts.md#prompt-gf-01) |
| **Catalog map** | [TIED-DEMO-01](catalog-tied-compact-tools.md#family-a--specification--vocabulary-tied-demo-0104) — Ambiguous policy resolver |
| **Exercise bridge** | REQ-01 style (requirement ambiguity) |
| **Client root** | `/Users/fareed/Documents/dev/test/1791731617` |
| **Product REQ** | `REQ-CLI_RELIABLE_MESSAGE_SENDER` (client `tied-project/`) |
| **Proof boundary (primary)** | `human_decision` — reliability interpretation is the graded artifact |
| **Outcome** | **Successful implementation and graded trial recorded** |

This page is **documentation-only** in the TIED store; it does not register catalog `[REQ-*]` tokens.

---

## Sponsor intent (stripped `/xlate` remainder)

Build a CLI “reliable message sender” from stdin with a flaky endpoint in tests; resolve vague “reliable” in writing before code; automated tests for nominal send and at least one failure mode.

---

## RESOLVE (Touchpoint 1)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| reliable message sender | **At-least-once** delivery within one process run: every non-blank stdin line POSTed until `2xx` or bounded retry exhaustion / permanent HTTP failure | Client `README.md` **Reliability contract**; `REQ-CLI_RELIABLE_MESSAGE_SENDER` non_goals + satisfaction_criteria |
| flaky endpoint | **Injectable `DeliveryTransport`**; tests use mock sequences (timeout, 5xx, 4xx) — not live network chaos | `ARCH-CLI_RELIABLE_MESSAGE_SENDER`; unit tests |
| reliable (rejected readings) | Not exactly-once, not crash durability, not unbounded retry, not parallel sends | REQ non_goals; README **Non-goals** |
| before coding, document interpretation | Contract in REQ detail + README before/alongside implementation | REQ `success_criteria`; client vocab `reliable-message-sender.md` |
| failure mode in tests | Transient retry path, permanent 4xx, exhaustion after max attempts | `tests/unit/reliable-sender.test.ts` |

**Costly choices (consequence ladder):** Retry duplicates POST bodies (at-least-once). Documented as non-goal; no idempotency keys — **reversible** for a disposable demo, **costly** if promoted to production without server dedupe.

---

## What was built (description)

- **Interface:** Node 20+ CLI (`reliable-message-sender-cli@0.1.0`), TypeScript, Vitest.
- **Behavior:** Line-delimited UTF-8 stdin → sequential `POST` (`text/plain`) to `--endpoint` with `--max-attempts`, `--backoff-ms`, `--timeout-ms`. Exit `0` / `1` / `2` per README.
- **Modules:** `RetryPolicy`, `DeliveryTransport` / `HttpTransport`, `ReliableSender`, thin CLI + composition test proving wiring.
- **TIED stack (client):** `REQ-CLI_RELIABLE_MESSAGE_SENDER`, `ARCH-CLI_RELIABLE_MESSAGE_SENDER`, `IMPL-CLI_RELIABLE_MESSAGE_SENDER` with pseudo-code sidecar; CITDP under client `tied-project/citdp/`; checklist tracker and request evidence envelope under `tied-project/working/REQ-CLI_RELIABLE_MESSAGE_SENDER/`.
- **Bootstrap:** Disposable client from `test-new-tied-client` pattern (TIED 3.0.0 install commit `0f875b0`, feature commits `4f4e0b2`, `e42372e`).
- **Verification (2026-10-11):** `npm test` — 12 tests, 3 files, all green; MCP `tied_validate_consistency` on client `tied-project/` — `ok: true`.

---

## Outcome record and feedback handoff

**Implementation outcome:** Successful. The client shipped the scoped CLI, its reliability contract, unit and composition tests, and the linked TIED records. Verification promoted `REQ-CLI_RELIABLE_MESSAGE_SENDER` to **Implemented** and kept `IMPL-CLI_RELIABLE_MESSAGE_SENDER` **Active**.

**Grading outcome:** The trial is recorded as a dimensioned readout: Requirement interpretation **A**, Traceability closure **A−**, Test strategy **A−**, Algorithm / implementation **B+**, Process adherence **B**, and Methodology learning readout **N/A**. These bands describe this session and its proof boundaries; they are not a universal score or a methodology-effectiveness result.

**Feedback observation:** Captured in the client feedback store as `fb-mv41etd4-ryzsty` (`observation_kind: discovery`, `type: methodology_improvement`, privacy tier `operator_local`). Its self-improvement signal is to preserve the successful pattern—RESOLVE the ambiguous term, label non-goals, test unit and composition seams, verify the TIED stack, and grade separate dimensions—then compile compatible future trial observations into feedback analysis before proposing a countermeasure.

**Future-test rule:** Later greenfield trials should add point-of-work observations with evidence references and retain their proof boundary. A single successful trial must not be treated as evidence of methodology effectiveness; a future cohort needs explicit baseline, outcome observation, and pairing disposition before making that claim.

## TIED db capture (prompts + interactions for analysis)

| Store | Location | Role |
| --- | --- | --- |
| **Interaction inventory** | Client `tied-project/working/REQ-CLI_RELIABLE_MESSAGE_SENDER/evidence/trial-prompt-interaction-inventory.v1.json` | Canonical list of sponsor turns (`@plan-new-feature` / PROMPT-GF-01, `/xlate`, close-out) and TIED MCP tools used |
| **Request envelope** | Client `tied-project/working/REQ-CLI_RELIABLE_MESSAGE_SENDER/evidence/request-evidence-envelope.v1.json` | Registers inventory as `trial_prompt_interaction_inventory` (revision 3+) |
| **Feedback store** | Client `tied-project/feedback.yaml` | `fb-mv41etd4-ryzsty` (successful trial discovery) · `fb-mv41jvfm-m8cso6` (inventory index for `tied_feedback_analysis_digest`) |
| **Analysis label** | `greenfield-trial-prompt-interaction.v1` | Custom tag in inventory + feedback `context` for future trial matching |
| **Kaizen digest cohort** | `feedback-event.v1\|operator_local` | Use with `tied_feedback_analysis_digest` (MCP derives cohort from capture schema + privacy tier) |
| **Digest preview** | Client `.../evidence/trial-feedback-analysis-preview.v1.json` | One-entry preview; expand when more trials share the capture schema |

**Proof boundary:** `facilitator_session_reconstruction` — documents prompts and tool names for cohort compilation, not live MCP metrics or full chat transcripts.

## Session grading vs [TIED compact demo catalog](catalog-tied-compact-tools.md)

Separate dimension readout (not a collapsed score). Weights from catalog defaults.

| Dimension | Weight | Band | Rationale |
| --- | --- | --- | --- |
| Requirement interpretation | 15% | **A** | Explicit at-least-once contract, labeled non-goals, vocab glossary; matches **TIED-DEMO-01** “RESOLVE before REQ; record assumptions in REQ text.” |
| Traceability closure | 20% | **A−** | Indexes + detail aligned after **`tied_verify`** (REQ **Implemented**, IMPL **Active**); `traceability.tests` on REQ/ARCH/IMPL; author-requirement/architecture evidence populated; `tied_validate_consistency` clean. Residual: envelope not re-backfilled after evidence edits. |
| Test strategy | 20% | **A−** | Unit + composition; L0 nominal, L2 isolated failures, **L3** combined transient sequence in `seeded flaky sequence succeeds within budget` (`503` + timeout + `200`). No property-based oracle beyond injectable transport mocks. |
| Algorithm / implementation | 20% | **B+** | Closed failure taxonomy, bounded retry, injectable transport; honest limits in README. REQ-01 bridge satisfied for ambiguity, not full exercise-catalog adversarial depth. |
| Process adherence | 15% | **B** | CITDP, checklist tracker, envelope backfill present; adversarial depth `minimal` with sponsor waiver in CITDP. Not a full gate/envelope close-out audit in this readout. |
| Methodology learning readout | 10% | **N/A** | Loop 3 not in scope for PROMPT-GF-01. |

**Catalog disposition note:** **TIED-DEMO-01** remains catalog `idea` until a facilitator promotes it; this client is a **built instance** of that idea via greenfield prompt **PROMPT-GF-01**.

**Disturbance ladder used:** L0 (first 2xx), L2 (isolated timeout, 5xx, 4xx, and exhaustion), and one L3 sequence (503 + timeout + 200). Primary **proof boundary:** `human_decision` — facilitator validates the reliability write-up and rejected interpretations, not only green tests.

---

## Facilitator follow-ups

| # | Action | Status (2026-10-11) |
| --- | --- | --- |
| 1 | `tied_verify` after green tests + verification checklist gate | **Done** — see client `tied-project/working/REQ-CLI_RELIABLE_MESSAGE_SENDER/evidence/tied-verify-followup-2026-10-11.md` |
| 2 | REQ/ARCH/IMPL `traceability.tests`; author-requirement + author-architecture evidence | **Done** |
| 3 | L3 disturbances or **PROMPT-GF-17** second session | **Partial** — existing suite already exercises one **L3** combined-fault path; full **TIED-DEMO-17** / PROMPT-GF-17 remains a separate trial |

---

## Deferred (separate trial)

- **PROMPT-GF-17** / **TIED-DEMO-17** (deadline-aware search) — not started; use a fresh disposable client when running that catalog row.

---

## Related

- [Greenfield prompt catalog](catalog-greenfield-plan-new-feature-prompts.md)
- [TIED compact demo tool catalog](catalog-tied-compact-tools.md)
- Client product README: `/Users/fareed/Documents/dev/test/1791731617/README.md`
- **Session handoff (client):** `/Users/fareed/Documents/dev/test/1791731617/tied-project/working/REQ-CLI_RELIABLE_MESSAGE_SENDER/evidence/session-handoff.md`
