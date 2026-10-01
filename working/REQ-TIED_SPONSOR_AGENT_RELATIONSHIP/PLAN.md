---
name: sponsor-agent-relationship-layer
overview: "Sponsor-Agent Relationship Layer: W0–W4, plan-close-out, and product traceable-commit complete (`85c5791`, `closeout-sar-2026-10-01`); REQ Implemented. Refine-plan pass aligned PLAN with disk and closed working-folder gaps."
todos:
  - id: refine
    content: "Refine: resolve sponsor terms, choose REQ/ARCH/IMPL tokens, change definition with non-goals and success criteria"
    status: completed
  - id: citdp-plan
    content: "CITDP Plan: depth_tier, profile_depth, gate policy, assurance profile, file-by-file change list (Tier A/B/C x project/templates), RED test list, tracker proposal"
    status: completed
  - id: plan-close-out
    content: "Implement gate + W4 plan-close-out (build-plan W0–W4, gates, tied_verify, handoff)"
    status: completed
  - id: traceable-commit
    content: "Sponsor: stage, commit using plan-close-out-handoff.md and co5-sponsor-commit-payload.v1.json"
    status: completed
  - id: refine-plan-pass
    content: "Refine-plan: reconcile PLAN with close-out evidence, authoritative Tracker path, sponsor decisions"
    status: completed
isProject: false
---

# Plan: Sponsor-Agent Relationship Layer for TIED ("instrument vs person")

**Status:** **Closed for product delivery** — W0–W4, plan-close-out (`closeout-sar-2026-10-01`), product **traceable-commit** `85c5791`, REQ **Implemented** (`tied_verify`). Refine-plan pass `refine-plan-pass-2026-10-01` updated this document and working-folder hygiene (see § 10).

**Verification-gated:** `[PROC-TIED_VERIFICATION_GATED]` — `REQ-TIED_SPONSOR_AGENT_RELATIONSHIP` status is **Implemented** only via `tied_verify` (receipt: `evidence/tied-verify-result.json`).

**Historical execution:** `build-plan` + `plan-close-out` run `closeout-sar-2026-10-01`; Cursor linked plans `/Users/fareed/.cursor/plans/sponsor-agent_relationship_layer_156132d8.plan.md` and `/Users/fareed/.cursor/plans/sar_w4_plan-close-out_c7e6fd60.plan.md`.

**Working scope:** `working/REQ-TIED_SPONSOR_AGENT_RELATIONSHIP/`

| Artifact | Path | Note |
| --- | --- | --- |
| **Per-request checklist copy** | `agent-req-implementation-checklist.yaml` | Human-readable disposition history; keep in sync with authoritative Tracker after edits. |
| **Authoritative Tracker** | `checklist-tracker.yaml` | Required for `tied gate check` / `tied_checklist_gate_validate` at verification and close_out ([`checklist-tracker.v1`](../../tied/vocab/fidelity-research.md)); added in refine-plan pass (was missing at first re-gate). |
| **CITDP (canonical)** | `tied/citdp/CITDP-REQ-TIED_SPONSOR_AGENT_RELATIONSHIP.yaml` | `leap_feedback.record_status: final`; working copy beside tracker. |
| **Refine receipt** | `refine-plan-pass-2026-10-01.md` | This refine-plan gate output. |

**TIED base path:** `tied_config_get_base_path` → `/Users/fareed/Documents/dev/chatgpt/stdd/tied` (confirmed via `tied-cli.sh`, read-only).

| Field | Value |
| --- | --- |
| **Sponsor intent** | Operating-principles model: system/agent = instrument (observe → act → measure → adapt); human = person with agency (express → listen → choose → respect → adapt); boundary condition "agency changes the operating principle". |
| **Prior analysis (sponsor-approved)** | Agent already on the instrument branch (delegation envelope at `translate-sponsor-intent`, RED/GREEN + LEAP micro-cycle, verification-gated status, ledgers as information, principle 14). Sponsor already on the person branch (`integrated_waiver` confirmation, strict human approval, BBCE `pending_human`, principle 14 ask-only-when-costly). Six gaps (roles vocab, fleet-local taxonomy, RESOLVE charter, hinge-field pattern, scattered escalation ladder, no failure-mode spot checks). |
| **Scope** | Full enhancement: Tier A (articulation), Tier B (checklist/principles), Tier C (enforcement where tests gate it), full TIED traceability, templates propagation decision. |
| **Hard constraints** | Do not weaken RED-before-GREEN, verification-gated status, `tied_validate_consistency`. No sponsor Q&A at every step. Route to existing PROC tokens; **no new `[PROC-*]`**. Sponsor default-proceed on reversible choices. |

---

## 1. Refine — Touchpoint 1 (RESOLVE / RECORD)

PRELOADED glossaries (routing match): `tied/vocab/tied-methodology.md` (agent-control layer, PROC catalog, bootstrap/propagation), `tied/vocab/pseudocode-and-citdp.md` (CITDP naming, sponsor default-proceed policy, reversible/costly fleet rows), `tied/vocab/prompt-composer.md` (plan-new-feature contract), `tied/vocab/quality-assurance.md` + `tied/vocab/fidelity-research.md` (depth tier, gate policy, waivers — required by AGENTS.md §3.3.1 for `depth_tier: minimal+`), `tied/vocab/decision-copilot.md` (tier-4 escalation). This repo is the TIED source, so `tied/vocab/` **is** the methodology layer; there is no `tied/methodology/vocab/` here.

### 1.1 Canonical terms (new rows → RECORD in new glossary at build time)

| Sponsor wording | Canonical term (preferred) | Avoid | Definition (one line) |
| --- | --- | --- | --- |
| system / AI agent / the tool | **agent** | the AI, the model, assistant (alone) | The AI coding assistant acting as an **instrument** under a **delegated work envelope**; directed, measured, corrected, adapted. |
| human / the person / user who sets goals | **sponsor** | user (alone), owner (alone), customer | The human with independent agency who owns intent, non-goals, approvals, and irreversible choices. Already canonical in `sponsor default-proceed policy`, `sponsor confirmation`, checklist sponsor context. |
| reviewer / human approver | **reviewer** | approver, human-in-the-loop (alone) | The human who adjudicates review-gated artifacts (`review_status: pending_human`, strict CITDP approval, observed findings). May be the sponsor; role is distinct. |
| delegated goals / delegation envelope | **delegated work envelope** | permission, scope (alone) | What the agent may do without asking: bounded by approved plan, CITDP, Tracker, and documented defaults. |
| "Observe → act → measure → adapt" | **instrument branch** | system model (alone) | Operating principle for the agent: failure is information; optimization of behavior/process/strategy/output is legitimate within the envelope. |
| "Express → listen → choose → respect → adapt" | **person branch** | human model (alone) | Operating principle toward the sponsor/reviewer: feedback is information, not authorization to control; control is replaced by communication, agreement, boundaries. |
| "Agency changes the operating principle" | **agency boundary condition** | the boundary | Rule that selects the branch: instrument → direct/optimize; person → agency is a constraint that must not be optimized away. |
| reversible vs costly decision (fleet-local today) | **reversible choice** / **costly choice** | cheap/expensive decision | General taxonomy generalizing the fleet rows `reversible sponsor choice (fleet)` / `costly sponsor choice (fleet)`; fleet rows become specializations. |
| hinge artifact / dual-purpose field | **hinge field** | approval field, waiver field (alone) | A CITDP or sub-pass field that is simultaneously **measurement for the agent** and **consent for the sponsor/reviewer**; must carry `owner` + `approval`/`review_status` + evidence path (and `expiry` when time-bounded). Instances: `integrated_waiver`, `depth_change_waiver`, `close_out_inquiry_waiver`, strict approval record, `bbce-shared-code-justification.v1` `review_status`, `od-*-acceptance.v1.json`, `disjoint_verifier_waiver`. |
| escalation ladder / who decides | **consequence ladder** | escalation path (alone) | Ordered rungs from documented default → documented default + evidence → reviewer confirmation → sponsor approval, linking `depth_tier`, `gate_policy`, BBCE `pending_human`, decision-copilot tier 4. |
| sponsor disagrees with existing spec | **sponsor-vs-TIED disagreement** | spec error, contradictory spec | Conflict between sponsor intent and existing REQ/ARCH/IMPL. Routes to **LEAP** (inside envelope) or a **sponsor question** (costly) — never binned with IMPL-vs-IMPL contradictions at `flag-contradictory-specs`. |
| manipulation, treating disagreement as error | **prohibited optimization target** | — | Sponsor/reviewer agency: non-goals, approvals, irreversible choices, disagreement. The agent must not pre-fill, reframe, or placeholder these. |
| applying human model to the system | **over-asking** | hesitation | Failure mode: agent asks the sponsor at reversible defaults or anthropomorphizes its own failure. |
| applying system model to the person | **instrumentalizing the sponsor** | — | Failure mode: agent proceeds on placeholder waivers, treats sponsor disagreement as a spec error, or optimizes the sponsor's choices. |
| RESOLVE rewording of sponsor text | **RESOLVE charter** | — | RESOLVE canonicalizes **concept names**; it never changes **intent authority** (non-goals, approvals, irreversible choices stay sponsor-owned). |

Reuse (no new rows): **agent-control layer**, **vocabulary layer**, **sponsor default-proceed policy**, **CITDP record**, **per-request checklist copy**, **LEAP**, **finding ledger**, **gate policy**, **depth tier**, **integrated waiver**.

### 1.2 Token names (RESOLVE → `REQ-TIED_*` methodology prefix per `tied-methodology.md` § Semantic token prefixes)

| Layer | Token | Note |
| --- | --- | --- |
| REQ | `REQ-TIED_SPONSOR_AGENT_RELATIONSHIP` | Sponsor's candidate accepted; `SPONSOR_AGENT` names both roles in the order sponsor → agent (person first). Alternative `REQ-TIED_AGENCY_BOUNDARY` rejected: names the rule, not the relationship layer. **OD-1** (rename is costly after propagation). |
| ARCH | `ARCH-TIED_SPONSOR_AGENT_RELATIONSHIP` | Decision: articulate in vocab + principles; enforce only through existing gate validator and parity tests; route to existing PROC tokens. |
| IMPL | `IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP` | Sidecar `IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP-pseudocode.md`, `Grammar-Version: v2`. |
| Blocks (UPPER_SNAKE) | `CLASSIFY_DECISION_CONSEQUENCE`, `VALIDATE_HINGE_FIELD`, `ROUTE_SPONSOR_TIED_DISAGREEMENT`, `AUDIT_RELATIONSHIP_LAYER_CONTRACT` | Each block maps 1:1 to a RED test group (§ 6). |
| PROC | none new | Compress into `[PROC-AGENT_REQ_CHECKLIST]`, `[PROC-VOCABULARY_INDEX]`, `[PROC-LEAP]`, `[PROC-TIED_VERIFICATION_GATED]`, `[PROC-CITDP]`. |

### 1.3 Change definition (`change-definition`)

**Current behavior.** The agent is treated as an instrument and the sponsor as a person *implicitly* across checklist, principles, citdp-policy, and decision-copilot docs. Roles (`sponsor`, `agent`, `reviewer`) have no glossary rows; the reversible/costly taxonomy is fleet-local; RESOLVE has no charter limiting it to names; hinge fields are enforced only for three waiver maps; the escalation ladder is scattered across five docs; the two failure modes have no review prompts; sponsor-vs-TIED disagreement has no explicit routing.

**Desired behavior.**
1. One canonical glossary (`tied/vocab/sponsor-agent-relationship.md`) defines the roles, branches, agency boundary condition, hinge field, consequence ladder, disagreement routing, prohibited optimization targets, and the two failure modes; routed from `routing.md`; cross-linked from the agent-control layer rows.
2. Principle 14 generalizes to the reversible/costly taxonomy and consequence ladder; principle 13 gains the RESOLVE charter sentence; a new principle 16 states the agency boundary condition; AGENTS.md §2 mirrors it in one bullet.
3. Checklist MD + YAML carry the layer at five slugs (`translate-sponsor-intent`, `risk-assessment`, `flag-contradictory-specs`, `sub-leap-micro-cycle`, `persist-citdp-record`) with stable markers that a parity test asserts; agentstream renders them unchanged.
4. `citdp-policy.md` documents the hinge-field rule; a new `tied/docs/sponsor-agent-relationship.md` holds the consequence ladder (text + Mermaid) and the failure-mode review prompts; both are installed by `copy_files.sh`.
5. `tied_checklist_gate_validate` emits a generalized `hinge_field_incomplete:<path>` diagnostic (warn-only under `advisory`, blocking under `strict-*`) for any present hinge field lacking owner/approval/evidence; existing `waiver_invalid` and `integrated_waiver` blocking are unchanged.
6. REQ/ARCH/IMPL stack with token-commented sidecar, `semantic-tokens.yaml`, CITDP, Tracker; R+A+I promoted to `templates/` (OD-2) so client glossary links resolve under `tied/methodology/`.

**Unchanged behavior.** RED before GREEN; verification-gated status via `tied_verify`; `tied_validate_consistency`; existing gate blocking for `integrated_waiver`, `depth_change_waiver`, `close_out_inquiry_waiver` placeholders; adversarial inquiry depth/pairing rules; `flag-contradictory-specs` IMPL-vs-IMPL error binning; sponsor default-proceed for reversible planned work; prompt-type skill procedures (one sentence added to `tied-refine.md`, one to `tied-plan-citdp.md`; gates unchanged).

**Non-goals.** No new `[PROC-*]` token. No runtime LLM behavior evaluation. No sponsor Q&A inserted into every slug. No change to `tied_verify` status derivation. No blocking diagnostic under `advisory` policy for the new generalized hinge check. No rewrite of fleet program doc (its rows become specializations by cross-reference only). No `.cursor/agents/` wrapper changes. No Jev/decision-copilot code changes (doc link only).

**Success criteria (SC).**
- **SC-SAR-001 (vocab)** — `tied/vocab/sponsor-agent-relationship.md` exists with the 15 rows in § 1.1, required markers (`(canonical)`, Scope, Traceability, See also, Alphabetical index), is listed in `routing.md` and `domain-references.md`, and `ruby scripts/validate_vocab_index.rb` passes.
- **SC-SAR-002 (principles)** — `ai-principles.md` principles 13/14/16 and `AGENTS.md` §2 contain the markers `RESOLVE charter`, `reversible choice`, `costly choice`, `consequence ladder`, `agency boundary condition`.
- **SC-SAR-003 (checklist parity)** — For the five slugs, YAML `tasks` and the MD section both contain the slug's relationship markers (parity test green).
- **SC-SAR-004 (hinge diagnostic)** — `validateHingeFields` returns `hinge_field_incomplete:<path>` for a present hinge map missing `owner`, `approval|review_status`, or evidence path, and for placeholder values (`~`, empty); returns no diagnostic when the map is absent or `null`; wired into `tied_checklist_gate_validate` as warn-only under `advisory`; existing validator tests unchanged and green.
- **SC-SAR-005 (propagation)** — `tools/bootstrap/manifest.json` `DOCS_TO_COPY` includes `sponsor-agent-relationship.md`; vocab copy carries the new glossary (not in `SOURCE_ONLY_VOCAB_BASENAMES`); if OD-2 = promote, `templates/` holds the R+A+I + sidecar and `client-refresh-parity` passes.
- **SC-SAR-006 (traceability)** — `tied_validate_consistency` ok; Layer B `pseudocode_validate` and Layer C `pseudocode_analyze --gate_mode` pass for the sidecar; `lint_yaml` on all changed YAML.

**Counterexamples / falsification questions.** (a) If the glossary defines **sponsor** but the checklist still says "user" at `translate-sponsor-intent`, VALIDATE must fail. (b) If a CITDP carries `strict_approval: { reviewer: "~" }`, the gate must emit `hinge_field_incomplete`. (c) If a parity marker is added to YAML but not MD, SC-SAR-003 must fail. (d) If `hinge_field_incomplete` blocks under `advisory`, SC-SAR-004 is violated (over-enforcement). (e) If the new principle inserts a sponsor question into a reversible step, that is the **over-asking** failure mode and fails review-prompt spot check RP-1.

---

## 2. Plan — CITDP analysis summary

| Dimension | Selection | Rationale |
| --- | --- | --- |
| `depth_tier` | **`integrated`** | Tier C touches the fail-closed `checklist-validator.ts` gate (safety/correctness of gates). Precedent: all `REQ-TIED_CHECKLIST_GATE_ENFORCEMENT` slices used `integrated`/`advisory`. `eligibility_triggers_matched: []` (no external input/auth/network/persistence/strict close-out) — integrated is chosen voluntarily, recorded honestly; downgrade later would need `depth_change_waiver`. |
| `profile_depth` (evidence chain) | `integrated` | Default for agent-run evidence chain; distinct from research profile. |
| `research_profile` | `integrated-agent` | — |
| `assurance_profile` | `baseline-functional` only | Docs, vocab, checklist YAML, additive warn-only validator; no specialized trigger. Explicit N/A rows for external-input-security (validator reads repo-local CITDP YAML already parsed by the existing gate), data-integrity, performance, privacy. |
| `gate_policy` | `advisory` | Strict needs human CITDP approval; not requested. |
| `size` / `express_lane` | `M` / `false` | Five checklist slugs + validator + templates promotion. |
| BBCE declared surface | not requested (N/A) | Sponsor did not request locality discipline. |
| Residuality pass | N/A (`depth_tier` integrated but no stateful/data-integrity profile) | — |

### 2.1 Impact — `tied_context`

- `tied_tokens_new`: `REQ-TIED_SPONSOR_AGENT_RELATIONSHIP`, `ARCH-TIED_SPONSOR_AGENT_RELATIONSHIP`, `IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP`.
- `tied_tokens_affected` (cross-reference edits, no behavior change): `REQ-TIED_SETUP` (agent-control layer criterion mentions roles), `REQ-TIED_CHECKLIST_GATE_ENFORCEMENT` / `ARCH-…` / `IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT` (hinge diagnostic lives in its validator — `composed_with`), `REQ-TIED_VOCABULARY_OWNERSHIP` / `IMPL-TIED_VOCABULARY_REFRESH` (new methodology glossary), `IMPL-TIED_FILES` (manifest `DOCS_TO_COPY` row), `REQ-TIED_ADVERSARIAL_INQUIRY` (parity test sibling), `REQ-PROMPT_TYPE_GLOBAL_SKILLS` (one-line prompt-shared edits).
- IMPL inventory (read at W0): `IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT-pseudocode.md` (where `waiverDiagnosticsInvalid` is specified), `IMPL-TIED_FILES-pseudocode.md` (`BOOTSTRAP_TIED`, `MERGE_DOMAIN_VOCAB`), `IMPL-TIED_VOCABULARY_REFRESH-pseudocode.md`, `IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST-pseudocode.md` (checklist marker parity pattern).

### 2.2 Risks (→ CITDP `risk_analysis.risks`)

| id | Risk | Sev/Lik | Mitigation |
| --- | --- | --- | --- |
| RISK-SAR-001 | Generalized hinge check blocks existing client CITDPs that legitimately omit approval fields | High / Med | Warn-only under `advisory`; only *present* maps are checked; `null`/absent pass; fixture corpus regression (`fixture-corpus-regression.ts`) run before GREEN. |
| RISK-SAR-002 | Principle text re-introduces sponsor Q&A at reversible steps (over-asking) | Med / Med | Review prompt RP-1 in new doc; checklist tasks say "classify, then proceed on documented default"; only `risk-assessment` lists costly questions, surfaced at end. |
| RISK-SAR-003 | Checklist YAML/MD drift | Med / Med | Parity test with stable markers (precedent `checklist-yaml-md-parity.test.ts`); agentstream render unchanged. |
| RISK-SAR-004 | Glossary link `../requirements/REQ-TIED_SPONSOR_AGENT_RELATIONSHIP.yaml` dangles in clients if R+A+I not promoted to `templates/` | Med / High (if OD-2 = no) | Promote (OD-2 default) or use repo-relative absolute link style per `vocab.mjs` link normalization. |
| RISK-SAR-005 | Templates promotion changes every client's `tied/methodology/` on refresh | Low / High | Reversible: re-run `copy_files.sh` after removal; `client-refresh-parity` reports drift; OD-2 surfaced. |
| RISK-SAR-006 | Vocabulary validator fails on new glossary (missing markers / catalog membership) | Low / Med | RED static test + `ruby scripts/validate_vocab_index.rb` in verification. |
| RISK-SAR-007 | `AGENTS.md` is a `BASE_FILES` entry: new wording propagates to new clients but not existing ones | Low / High | Documented in methodology-migration note; copy-when-missing policy unchanged. |

### 2.3 Test strategy (classification)

- **Unit (static contract / pure):** `validateHingeFields` (pure over parsed CITDP); glossary/doc/principle contract assertions (file read + regex, precedent `prompt-type-subagent.test.ts`); checklist YAML/MD marker parity.
- **Integration / composition:** `tied_checklist_gate_validate` composition returns `hinge_field_incomplete` in `diagnostics` with `allowed: true` under advisory and `allowed: false` under strict fixture; bootstrap `docs.mjs` copies the new doc; vocab copy includes the new glossary; `client-refresh-parity` after templates promotion.
- **E2E:** none (no UI).
- Independent oracle: fixtures hand-written from § 1.3 counterexamples (a)–(e), not derived from the implementation.

---

## 3. File-by-file change list

Legend: **P** = project tree (`tied/` root, repo docs, code) · **T** = `templates/` (methodology, propagated to clients' `tied/methodology/`) · **B** = bootstrap/propagation surface (`tools/bootstrap/manifest.json`, `copy_files.sh`-copied docs/skills).

### Tier A — articulation (vocabulary)

| # | File | Loc | Change |
| --- | --- | --- | --- |
| A1 | `tied/vocab/sponsor-agent-relationship.md` (**new**) | P (copied to client `tied/methodology/vocab/` by vocab copy) | `(canonical)` glossary: Scope, Traceability (REQ/ARCH/IMPL links), See also; Preferred terms table (15 rows § 1.1); Naming bridge (hinge field instances → paths/schemas; consequence ladder rungs → `depth_tier`/`gate_policy`/`review_status`/tier 4); Pseudo-code block names (4 blocks); Alphabetical index. |
| A2 | `tied/vocab/routing.md` | P | Row `5j` with keywords: sponsor, agent, reviewer, delegated work envelope, instrument branch, person branch, agency boundary condition, hinge field, consequence ladder, reversible choice, costly choice, sponsor-vs-TIED disagreement, over-asking, instrumentalizing the sponsor, RESOLVE charter. |
| A3 | `tied/vocab/domain-references.md` | P | Canonical glossaries row `5j`; See-also link; cross-topic note "Sponsor/agent/reviewer roles vs agent-control layer vs sponsor default-proceed"; alphabetical index rows. |
| A4 | `tied/vocab/tied-methodology.md` | P | `agent-control layer` and `vocabulary layer` rows: append "roles defined in `sponsor-agent-relationship.md`"; alphabetical index unchanged (no new terms here). |
| A5 | `tied/vocab/pseudocode-and-citdp.md` | P | § Sponsor default-proceed policy — RECORD: fleet rows re-labelled as specializations of **reversible choice** / **costly choice**; link to new glossary. |
| A6 | `tied/vocab/decision-copilot.md` | P | Confidence-threshold row: link "low → escalate" to **consequence ladder** rung 4 (tier 4 frontier/human). |

### Tier B — checklist, principles, policy docs

| # | File | Loc | Change |
| --- | --- | --- | --- |
| B1 | `tied/docs/ai-principles.md` | P + B (`DOCS_TO_COPY`) | P13: add RESOLVE charter sentence. P14: generalize to **reversible choice / costly choice** table (general rows + fleet pointer), link consequence ladder. New **P16 "Sponsor–agent relationship (agency boundary condition)"** (numbered after existing P15 Adversarial Inquiry): instrument branch for the agent, person branch for sponsor/reviewer, prohibited optimization targets, two failure modes, disagreement routing. **TOC impact:** the document TOC links only to the **Core Principles** section (not per-principle anchors); add P16 in-body without new TOC rows. Grep cross-references to "principle 15" elsewhere if any prose assumes 15 was last. |
| B2 | `AGENTS.md` | P + B (`BASE_FILES`) | §2 one bullet "Sponsor–agent relationship" linking P16 and glossary; §3.3 one checkbox "classify costly choices at `risk-assessment`; surface at end". |
| B3 | `tied/docs/agent-req-implementation-checklist.md` | P + B | `translate-sponsor-intent` task 8: RESOLVE charter + delegated work envelope statement (marker `RESOLVE charter`). `risk-assessment` task 9: classify each open decision as **reversible choice** (proceed on documented default) or **costly choice** (list as sponsor question with recommended default; surface at end), record `consequence_ladder_rung` per hinge field (markers `reversible choice`, `costly choice`, `consequence ladder`). `flag-contradictory-specs`: new bullet "**sponsor-vs-TIED disagreement** is **not** an IMPL contradiction — route to `sub-leap-micro-cycle` or a sponsor question" (marker `sponsor-vs-TIED disagreement`). `sub-leap-micro-cycle` task: "IF the divergence originates from sponsor intent THEN confirm it is inside the delegated work envelope before LEAP; ELSE raise a sponsor question" (marker `delegated work envelope`). `persist-citdp-record` task 1: "every **hinge field** present carries owner, approval/review_status, evidence path; never placeholder" (marker `hinge field`). § References: new doc. |
| B4 | `tied/docs/agent-req-implementation-checklist.yaml` | P + B | Mirror B3 tasks verbatim-equivalent on the same five slugs; `last_updated` bump; no new slug, no flow change (agentstream renders unchanged). |
| B5 | `tied/docs/citdp-policy.md` | P + B | New § "Hinge fields": definition, required keys (`owner`, `approval` or `review_status`, evidence path, `expiry` when time-bounded), instances list, placeholder rule, diagnostic name `hinge_field_incomplete:<path>` and its advisory/strict severity. |
| B6 | `tied/docs/sponsor-agent-relationship.md` (**new**) | P + B (add to `DOCS_TO_COPY`) | Consequence ladder (table + Mermaid flowchart: rung 1 documented default → rung 2 default + evidence/receipt → rung 3 reviewer confirmation (`pending_human`, strict eligibility) → rung 4 sponsor approval (integrated waiver, strict approval, od-* acceptance, decision-copilot tier 4)); failure-mode review prompts **RP-1 over-asking** and **RP-2 instrumentalizing the sponsor** as spot checks for `verification-gate`/plan-close-out handoff; disagreement routing table. |
| B7 | `tied/docs/client-development-index.md` | P + B | Quick reads row for B6; one-line note under Core seven #2 (vocab) naming the roles glossary. |
| B8 | `tied/docs/processes.md` | P + B | `[PROC-VOCABULARY_INDEX]` § Core activities RESOLVE: append RESOLVE charter sentence. `[PROC-AGENT_REQ_CHECKLIST]`: one sentence pointing `risk-assessment` consequence classification to the new doc. No new PROC. (`templates/processes.md` is template-only/parity-excluded — leave untouched; reversible default.) |
| B9 | `tools/bundled-prompt-type-skills/prompt-shared/tied-refine.md` | P + B (client `.cursor/skills/`) | Step 2 append: "RESOLVE changes names, not intent authority (RESOLVE charter)". |
| B10 | `tools/bundled-prompt-type-skills/prompt-shared/tied-plan-citdp.md` | P + B | Step 4 append: "classify open decisions on the consequence ladder; proceed on reversible defaults; collect costly choices for the end-of-turn sponsor question". |
| B11 | `docs/pseudocode-constraint-v2-fleet-program.md` | P | § Sponsor default-proceed policy: one cross-reference line "general taxonomy: `tied/vocab/sponsor-agent-relationship.md`". |

### Tier C — enforcement (tests gate it)

| # | File | Loc | Change |
| --- | --- | --- | --- |
| C1 | `mcp-server/src/checklist-validator.ts` | P | New exported `validateHingeFields(citdp): ValidationResult` (block `VALIDATE_HINGE_FIELD`): walks known hinge paths (`risk_analysis.adversarial_inquiry.{integrated_waiver,depth_change_waiver,close_out_inquiry_waiver}`, `completion_criteria.strict_approval`, `risk_analysis.bbce_alignment.shared_code_justification` (`review_status`), `risk_analysis.residual_risk` (when `summary` present → `owner`,`expiry`), `record_identity.disjoint_verifier_waiver`); for each **present, non-null** map require `owner` + (`approval` or `review_status`) + one of (`evidence_path`, `evidence_ref`, `referenced_verification_run_id`, `rationale`); emit `hinge_field_incomplete:<dotted.path>`; reuse `PLACEHOLDER_WAIVER_VALUES` (~line 54) and placeholder semantics aligned with `waiverDiagnosticsInvalid` (~line 873). Wire into the gate: diagnostics appended; `allowed` unaffected under `advisory`; blocking under `strict-candidate`/`strict-approved`. `waiverDiagnosticsInvalid` unchanged. |
| C2 | `mcp-server/src/checklist-validator.test.ts` | P | New `describe("VALIDATE_HINGE_FIELD [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP]")` (see § 6). |
| C3 | `mcp-server/src/e2e/sponsor-agent-relationship-contract.test.ts` (**new**) | P | Static contract tests (block `AUDIT_RELATIONSHIP_LAYER_CONTRACT`): glossary rows/markers, routing + catalog membership, principles markers, AGENTS.md bullet, manifest `DOCS_TO_COPY`, new doc has Mermaid + RP-1/RP-2, templates promotion (if OD-2). |
| C4 | `mcp-server/src/adversarial-inquiry/sponsor-agent-checklist-parity.test.ts` (**new**, sibling of `checklist-yaml-md-parity.test.ts`) | P | `RELATIONSHIP_SLUG_MARKERS` for the five slugs (§ B3 markers); reuse the extract/contains helpers (export them from the existing test or a shared helper module — reversible default: small shared helper `checklist-parity-helpers.ts`). |
| C5 | `scripts/validate_vocab_index_test.rb` | P | Add a case: a glossary present on disk but missing from `routing.md` fails (already implied); add an explicit fixture run against the real tree to assert the new glossary is cataloged. |
| C6 | `tools/bootstrap/manifest.json` | B | `DOCS_TO_COPY` += `sponsor-agent-relationship.md`. |
| C7 | `tools/bootstrap/lib/docs.test.mjs` or `verify.test.mjs` (whichever asserts `DOCS_TO_COPY` coverage) | P | Assert the new doc is installed into a disposable client. |
| C8 | `mcp-server/src/fixture-corpus-regression.ts` corpus | P | Add two CITDP fixtures: complete hinge map (no diagnostic) and placeholder strict approval (`hinge_field_incomplete`). |

### TIED records (project YAML via `tied-cli.sh`; sidecar direct)

| # | File | Loc | Change |
| --- | --- | --- | --- |
| R1 | `tied/requirements.yaml` + `tied/requirements/REQ-TIED_SPONSOR_AGENT_RELATIONSHIP.yaml` | P | `tied_token_create_with_detail`; SC-SAR-001..006 with `criterion_id`s; `related_requirements.depends_on`: `REQ-TIED_SETUP`, `REQ-TIED_CHECKLIST_GATE_ENFORCEMENT`, `REQ-TIED_VOCABULARY_OWNERSHIP`; `related_to`: `REQ-TIED_ADVERSARIAL_INQUIRY`, `REQ-PROMPT_TYPE_GLOBAL_SKILLS`. `status: Planned` (verification-gated: set only via `tied_verify`). |
| R2 | `tied/architecture-decisions.yaml` + `tied/architecture-decisions/ARCH-TIED_SPONSOR_AGENT_RELATIONSHIP.yaml` | P | Decision: articulate (vocab/principles) + enforce via existing gate validator and parity tests; no new PROC; consequence ladder as the single escalation reference; alternatives considered: new PROC token (rejected: duplication), blocking hinge check under advisory (rejected: over-enforcement), extend `pseudocode-and-citdp.md` instead of new glossary (rejected: cross-cutting roles deserve own routing row). |
| R3 | `tied/implementation-decisions.yaml` + `tied/implementation-decisions/IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP.yaml` + `-pseudocode.md` | P | Sidecar with 4 procedures (§ 5), `code_locations` C1/C3/C4/C6, `composed_with: IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT, IMPL-TIED_FILES, IMPL-TIED_VOCABULARY_REFRESH`. |
| R4 | `tied/semantic-tokens.yaml` | P | Three rows. |
| R5 | Cross-reference touches: `REQ-TIED_SETUP.yaml` (agent-control layer criterion text), `IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT.yaml` (`composed_with`), `IMPL-TIED_FILES.yaml` (manifest row note) | P | Index + detail `cross_references` only; no status change. |
| R6 | `templates/requirements.yaml`, `templates/architecture-decisions.yaml`, `templates/implementation-decisions.yaml`, `templates/semantic-tokens.yaml` + detail files + sidecar | **T** (OD-2) | Promote R1–R4 (same "promoted quality record" pattern as `REQ-TIED_ADVERSARIAL_INQUIRY`). Then `node tools/bootstrap/...client-refresh-parity` on a disposable client. |
| R7 | `tied/citdp/CITDP-REQ-TIED_SPONSOR_AGENT_RELATIONSHIP.yaml` | P | § 4 draft via `citdp_record_write` at `persist-citdp-record`. |
| R8 | `CHANGELOG.md` | P | Entry at close-out. |

**Propagation summary.** Tier A glossary → client `tied/methodology/vocab/` automatically (vocab copy; not source-only). Tier B docs → client `tied/docs/` via `DOCS_TO_COPY` (copy-when-missing; existing clients see `doc drift report`); `AGENTS.md` via `BASE_FILES`; prompt-shared via skill install. Tier C → MCP server build (clients get it with the server). R+A+I → clients only if promoted to `templates/` (OD-2).

---

## 4. CITDP draft (historical spec — persisted at close-out)

**Persisted — see** `tied/citdp/CITDP-REQ-TIED_SPONSOR_AGENT_RELATIONSHIP.yaml`, `working/REQ-TIED_SPONSOR_AGENT_RELATIONSHIP/CITDP-REQ-TIED_SPONSOR_AGENT_RELATIONSHIP.yaml`, and `leap_feedback.record_status: final` at close-out (`closeout-sar-2026-10-01`). The block below is the original Plan-mode draft.

```yaml
CITDP-REQ-TIED_SPONSOR_AGENT_RELATIONSHIP:
  record_identity:
    change_request_id: "REQ-TIED_SPONSOR_AGENT_RELATIONSHIP"
    title: "Sponsor-Agent Relationship Layer (instrument vs person operating principles)"
    author: "AI Agent"
    recorded_at: "<build-plan date>"
    checklist_process: "PROC-AGENT_REQ_CHECKLIST"
    checklist_version: "agent_req_implementation_checklist 3.0.0"
    workspace_root: "/Users/fareed/Documents/dev/chatgpt/stdd"
    size: "M"
    express_lane: false
    tied_context:
      requirements: ["REQ-TIED_SPONSOR_AGENT_RELATIONSHIP"]
      architecture: ["ARCH-TIED_SPONSOR_AGENT_RELATIONSHIP"]
      implementation: ["IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP"]
  change_definition:
    current_behavior: "Agent-as-instrument and sponsor-as-person are implicit; roles have no vocab rows; reversible/costly taxonomy is fleet-local; RESOLVE has no charter; hinge fields enforced only for three waiver maps; escalation ladder scattered; no failure-mode review prompts; sponsor-vs-TIED disagreement unrouted."
    desired_behavior: "<§1.3 desired behavior items 1-6>"
    unchanged_behavior: ["RED before GREEN", "verification-gated status", "tied_validate_consistency", "existing waiver blocking", "IMPL-vs-IMPL contradiction binning", "sponsor default-proceed for reversible planned work"]
    non_goals: ["new PROC token", "runtime LLM evaluation", "sponsor Q&A at every slug", "blocking hinge diagnostic under advisory", "tied_verify changes", ".cursor/agents changes", "Jev code changes"]
    success_criteria: ["SC-SAR-001", "SC-SAR-002", "SC-SAR-003", "SC-SAR-004", "SC-SAR-005", "SC-SAR-006"]
    counterexamples: ["<§1.3 (a)-(e)>"]
  impact_analysis:
    files: ["<§3 A1-A6, B1-B11, C1-C8, R1-R8>"]
    tied_tokens_affected: ["REQ-TIED_SETUP", "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT", "ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT", "IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT", "REQ-TIED_VOCABULARY_OWNERSHIP", "IMPL-TIED_VOCABULARY_REFRESH", "IMPL-TIED_FILES", "REQ-TIED_ADVERSARIAL_INQUIRY", "REQ-PROMPT_TYPE_GLOBAL_SKILLS"]
    tied_tokens_new: ["REQ-TIED_SPONSOR_AGENT_RELATIONSHIP", "ARCH-TIED_SPONSOR_AGENT_RELATIONSHIP", "IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP"]
    modules: ["relationship_vocabulary", "principles_and_checklist_text", "hinge_field_validation", "contract_and_parity_tests", "bootstrap_propagation", "templates_promotion"]
  risk_analysis:
    quality_profiles: ["baseline-functional"]
    quality_evidence_matrix:
      - { attribute: "baseline-functional", applicability: "applicable", evidence_method: "static contract + unit + composition tests", command_or_test: "node --test dist/e2e/sponsor-agent-relationship-contract.test.js; node --test dist/checklist-validator.test.js; node --test dist/adversarial-inquiry/sponsor-agent-checklist-parity.test.js; ruby scripts/validate_vocab_index.rb", threshold: "all pass", owner: "AI Agent", limitation: "does not prove LLM behavior", proof_boundary: "traceability_structure" }
      - { attribute: "external-input-security", applicability: "not_applicable", rationale: "validator consumes repo-local CITDP YAML already parsed by the existing gate; no new input surface" }
      - { attribute: "data-integrity-migration", applicability: "not_applicable", rationale: "no persistence changes" }
      - { attribute: "performance-scale-cost", applicability: "not_applicable", rationale: "bounded path walk over one CITDP map" }
    adversarial_inquiry:
      depth_tier: "integrated"
      prior_depth_tier: null
      gate_policy: "advisory"
      research_profile: "integrated-agent"
      eligibility_triggers_matched: []
      depth_rationale: "No §7 trigger matched; integrated selected voluntarily because Tier C edits the fail-closed checklist gate validator (precedent: REQ-TIED_CHECKLIST_GATE_ENFORCEMENT slices)."
      integrated_waiver: null
      scope: { impl_tokens: ["IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP"], paths: ["mcp-server/src/checklist-validator.ts", "tied/docs/agent-req-implementation-checklist.yaml", "tied/vocab/sponsor-agent-relationship.md"] }
    evidence_chain_profile: { profile_depth: "integrated" }
    risks: ["<§2.2 RISK-SAR-001..007>"]
    consequence_ladder:   # new hinge-aware field introduced by this change (documented in citdp-policy.md § Hinge fields)
      open_decisions:
        - { id: "OD-1", kind: "costly", default: "accept REQ-TIED_SPONSOR_AGENT_RELATIONSHIP", status: "accepted" }
        - { id: "OD-2", kind: "costly", default: "promote R+A+I to templates/", status: "accepted" }
        - { id: "OD-3", kind: "costly", default: "warn-only under advisory; blocking under strict", status: "accepted" }
  test_strategy:
    red_before_green: true
    testability: { unit: ["validateHingeFields", "glossary/doc/principle contracts", "checklist marker parity"], integration: ["tied_checklist_gate_validate hinge diagnostics", "bootstrap DOCS_TO_COPY install", "client-refresh-parity after templates promotion"], e2e_only: [] }
    tests: ["<§6 T1-T7>"]
  completion_criteria: { verification: "tied_verify + tied_validate_consistency + pre_implementation/verification/close_out gates allowed: true", pseudocode_structural_validation: "Layer B + Layer C gate_mode pass" }
  leap_feedback: { divergences_from_analysis: [], tied_stack_updates_required: [], record_status: "draft" }
```

---

## 5. IMPL pseudo-code outline (full sidecar authored at W0; every block token-commented per `[PROC-IMPL_PSEUDOCODE_TOKENS]`)

```
# Grammar-Version: v2
# [IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP] [ARCH-TIED_SPONSOR_AGENT_RELATIONSHIP] [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP]
# How: articulate sponsor/agent/reviewer roles and the agency boundary condition in vocab + principles; enforce hinge-field hygiene and checklist parity through existing gates.

procedure CLASSIFY_DECISION_CONSEQUENCE
  # How: map an open decision to a consequence ladder rung so reversible choices proceed on documented defaults and costly choices become end-of-turn sponsor questions.
  Contract: INPUT decision{description, reversibility_evidence, affects_clients, affects_status}; OUTPUT rung ∈ {1 default, 2 default+evidence, 3 reviewer, 4 sponsor}; PRE decision non-empty; POST rung deterministic from inputs; EFFECTS pure; FAILURE_MODES {UNCLASSIFIABLE_DECISION}

procedure VALIDATE_HINGE_FIELD
  # [IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP] [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_SPONSOR_AGENT_RELATIONSHIP] [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP]
  # How: for each present hinge map in a CITDP require owner + approval|review_status + evidence path, rejecting placeholders; composed into the existing gate validator without changing waiver_invalid.
  Contract: INPUT citdp (parsed map); OUTPUT {ok, diagnostics: list of "hinge_field_incomplete:<path>"}; PRE citdp is a map; POST absent/null maps yield no diagnostic; EFFECTS pure; FAILURE_MODES {}; TERMINATION total

procedure ROUTE_SPONSOR_TIED_DISAGREEMENT
  # How: when sponsor intent conflicts with existing REQ/ARCH/IMPL, decide LEAP (inside delegated work envelope) vs sponsor question (costly) and never emit an IMPL contradiction finding.
  Contract: INPUT disagreement{sponsor_statement, conflicting_tokens, rung}; OUTPUT route ∈ {LEAP, SPONSOR_QUESTION}; PRE rung from CLASSIFY_DECISION_CONSEQUENCE; POST route ≠ CONTRADICTION_FINDING; EFFECTS pure

procedure AUDIT_RELATIONSHIP_LAYER_CONTRACT
  # How: static audit that glossary, routing/catalog, principles, AGENTS.md, checklist YAML/MD markers, manifest DOCS_TO_COPY, and (when promoted) templates carry the layer.
  Contract: INPUT repo_root; OUTPUT {ok, failures}; PRE files readable; POST every SC-SAR marker checked; EFFECTS IO (read-only); TERMINATION total
```

---

## 6. Proposed RED tests (written before any GREEN code at W1)

| id | File | Block | RED assertions |
| --- | --- | --- | --- |
| T1 | `mcp-server/src/checklist-validator.test.ts` → `describe("VALIDATE_HINGE_FIELD [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP]")` | `VALIDATE_HINGE_FIELD` | (a) absent/`null` hinge maps → `ok: true`, no diagnostics; (b) `completion_criteria.strict_approval: { reviewer: "~" }` → `hinge_field_incomplete:completion_criteria.strict_approval`; (c) BBCE `shared_code_justification` with `review_status: pending_human` but no `owner` → diagnostic; (d) complete `integrated_waiver` → no new diagnostic and `waiver_invalid` behavior unchanged; (e) `residual_risk.summary` present with `expiry: "~"` → diagnostic; (f) gate composition: advisory → `allowed` unaffected, diagnostics present; strict fixture → `allowed: false`. |
| T2 | `mcp-server/src/e2e/sponsor-agent-relationship-contract.test.ts` | `AUDIT_RELATIONSHIP_LAYER_CONTRACT` | glossary exists with `(canonical)`, Scope, Traceability, See also, Alphabetical index; contains all 15 preferred terms; `routing.md` and `domain-references.md` link it; `ai-principles.md` has markers `RESOLVE charter`, `reversible choice`, `costly choice`, `consequence ladder`, `agency boundary condition`; `AGENTS.md` §2 has "Sponsor–agent relationship"; `citdp-policy.md` has "## Hinge fields" and `hinge_field_incomplete`; new doc has a ```mermaid block and `RP-1`/`RP-2`; `manifest.json` `DOCS_TO_COPY` includes the doc; `tied-refine.md` has "RESOLVE charter"; `tied-plan-citdp.md` has "consequence ladder"; **if OD-2 = promote:** `templates/requirements/REQ-TIED_SPONSOR_AGENT_RELATIONSHIP.yaml`, ARCH, IMPL, sidecar exist and index rows present. |
| T3 | `mcp-server/src/adversarial-inquiry/sponsor-agent-checklist-parity.test.ts` | `AUDIT_RELATIONSHIP_LAYER_CONTRACT` | For `translate-sponsor-intent`{`RESOLVE charter`,`delegated work envelope`}, `risk-assessment`{`reversible choice`,`costly choice`,`consequence ladder`}, `flag-contradictory-specs`{`sponsor-vs-TIED disagreement`}, `sub-leap-micro-cycle`{`delegated work envelope`}, `persist-citdp-record`{`hinge field`}: at least one YAML task contains each marker and the MD section contains each marker. |
| T4 | `scripts/validate_vocab_index_test.rb` | `AUDIT_RELATIONSHIP_LAYER_CONTRACT` | Running the validator on the real tree passes; a temp copy with the glossary removed from `routing.md` fails with "missing from routing.md". |
| T5 | `tools/bootstrap/lib/*.test.mjs` (docs/verify) | `AUDIT_RELATIONSHIP_LAYER_CONTRACT` | Disposable client bootstrap installs `tied/docs/sponsor-agent-relationship.md` and `tied/methodology/vocab/sponsor-agent-relationship.md`. |
| T6 | `mcp-server/src/fixture-corpus-regression.ts` corpus | `VALIDATE_HINGE_FIELD` | Two new CITDP fixtures (complete / placeholder strict approval) with expected diagnostics; existing corpus unchanged and green. |
| T7 | `CLASSIFY_DECISION_CONSEQUENCE` / `ROUTE_SPONSOR_TIED_DISAGREEMENT` | pure helper unit tests (`mcp-server/src/relationship/consequence-ladder.test.ts`, new small module **`mcp-server/src/relationship/`**) | rung derivation table from § B6; disagreement never returns a contradiction finding; rung ≥ 3 → `SPONSOR_QUESTION`. **Default (reversible):** ship the pure module so IMPL blocks stay honestly testable. **Alternative:** doc-only — mark blocks `Template` stubs in the sidecar and skip T7 with N/A rows (sponsor must object to override default). |

### 6.1 Build slices W0–W4 (dependencies, gates, stop-before-commit)

| Slice | Status | Depends on | Work | Gate receipt / evidence |
| --- | --- | --- | --- | --- |
| **W0** | **Done** | Sponsor execute approval | `tied_config_get_base_path`; Tracker copy; R+A+I; sidecar + Layer B/C; CITDP; structural adversarial inquiry | `working/.../gates/` pre_implementation; `adversarial-inquiry/phase-pre_implementation/`; `evidence/pseudocode-validate-*` |
| **W1** | **Done** | W0 | RED T1–T7 | Test files §6 (checklist-validator, contract, parity, consequence-ladder, fixture-corpus) |
| **W2** | **Done** | W1 | GREEN Tier A/B/C + templates R6 | Product tree §3; `templates/` promotion; `evidence/client-refresh-parity-report.v1.json` |
| **W3** | **Done** | W2 | Composition (gate, bootstrap T5, parity, corpus T6) | `new-tied-client.test.ts`; `fixture-corpus-regression.test.ts` (17 cases) |
| **W4** | **Done** | W3 | verify, lint, consistency, close_out gates, handoff | `plan-close-out-handoff.md`; `evidence/tied-verify-result.json`; `gates/ledger.jsonl`; run `closeout-sar-2026-10-01` |

Mandatory order at build: W0 → W1 → W2 → W3 → W4 (see linked Cursor plan Mermaid).

---

## 7. Tracker (dispositions frozen at close-out)

Per-request copies: `agent-req-implementation-checklist.yaml` and **`checklist-tracker.yaml`** (`execution_evidence.request: REQ-TIED_SPONSOR_AGENT_RELATIONSHIP`). W0–W4 slugs **completed** at close-out; **`traceable-commit`** satisfied by git commit **`85c5791`** (message matches `evidence/co5-sponsor-commit-payload.v1.json`). `execution_evidence.close_out_evidence` records `closeout-sar-2026-10-01` receipt. Historical disposition plan:

| Slug | Disposition plan |
| --- | --- |
| session-bootstrap, translate-sponsor-intent, change-definition, impact-discovery, risk-assessment, test-strategy | `completed` at W0 with evidence refs to this PLAN.md (§1–§2) and CITDP draft |
| author-requirement, author-architecture, catalog…persist-implementation-records | `completed` at W0 (tied-cli writes, Layer B/C receipts) |
| sub-adversarial-inquiry-pass | **Structural:** W0 after CITDP + sidecar gates, before RED. **Pre-RED:** W1 boundary (optional receipt). **Verification + close_out:** W4. Each integrated pass: `tied_adversarial_inquiry_run` (advisory); persist **only** `obligation-report.json`, `finding-ledger.jsonl`, `gate-result.json`, `evidence-provenance.json` under `working/REQ-TIED_SPONSOR_AGENT_RELATIONSHIP/adversarial-inquiry/` (phase subdirs e.g. `phase-pre_implementation/` optional). Stub checklist text ≠ activation — require matching inquiry metric + four artifacts for integrated depth. |
| unit-test-red / unit-test-green / three-way-alignment-unit | W1–W2 |
| composition-integration | W3 (gate wiring, bootstrap install) |
| end-to-end-ui | `not_applicable` (no UI) with rationale |
| sub-residuality-analysis-pass, sub-bbce-advisory-verification-pass, sub-shared-code-change-justification-pass | `not_applicable` with rationale |
| verification-gate, sync-tied-stack, persist-citdp-record, gitignore-close-out-hygiene, traceable-commit | W4; **traceable-commit** → commit `85c5791` |

---

## 8. Open decisions

**Sponsor-locked (do not reopen unless factual conflict):**

| id | Decision | Status |
| --- | --- | --- |
| **OD-1** | `REQ/ARCH/IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP` | **Accepted** |
| **OD-2** | Promote R+A+I + sidecar to `templates/` | **Accepted** |
| **OD-3** | `hinge_field_incomplete` warn-only under `advisory`; blocking under `strict-*` | **Accepted** |

**Reversible defaults (proceed unless sponsor objects):** new glossary file (not extension), principle **P16**, doc filename `sponsor-agent-relationship.md`, **`templates/processes.md` untouched** vs **`tied/docs/processes.md` edited**, T7 pure **`mcp-server/src/relationship/`** module, integrated `depth_tier`, BBCE N/A.

**New open decisions:** none.

---

## 9. Implement gate

**Status: SATISFIED** — W0–W4 build slices and plan-close-out (`closeout-sar-2026-10-01`) complete.

- **`tied_checklist_gate_validate`:** `pre_implementation`, `verification`, and `close_out` → `allowed: true` (receipts under `working/REQ-TIED_SPONSOR_AGENT_RELATIONSHIP/gates/`).
- **Evidence envelope:** `request-evidence-envelope.v1.json` with `blocking_gaps=0` (see `evidence/closeout-run-close-out-gates-final.json`).
- **`tied_verify` (update):** ok — `REQ-TIED_SPONSOR_AGENT_RELATIONSHIP` → **Implemented** (`evidence/tied-verify-result.json`).
- **`tied_validate_consistency`:** ok (`evidence/tied-validate-consistency.json`).
- **Machine / process / adherence signals:** pass per `plan-close-out-handoff.md`.

**Product traceable-commit:** **Done** — `85c5791` on default branch; excludes unrelated untracked paths listed in `co5-sponsor-commit-payload.v1.json`.

**Re-gate note (refine-plan):** A naïve `tied gate check --phase close_out` after editing Tracker bytes may report `allowed: false` until receipts are re-hydrated with current Tracker/CITDP hashes and integrated activation pairing is re-collected. The **2026-10-01** close-out run remains the authoritative pass (`evidence/closeout-run-close-out-gates-final.json` → `merged_decision.allowed: true`, `blocking_gap_count: 0`). Use § 10.3 if you need a fresh close_out receipt.

---

## 10. Refine-plan pass (`refine-plan-pass-2026-10-01`)

### 10.1 Refine gate (Touchpoint 1)

- **Sponsor terms:** unchanged from § 1.1; glossary **`tied/vocab/sponsor-agent-relationship.md`** on disk matches plan rows.
- **Vocabulary RECORD/VALIDATE:** RECORD complete at build; VALIDATE passed at close-out (`ruby scripts/validate_vocab_index.rb`).
- **Open decisions:** **OD-1..OD-3 accepted**; no new costly choices.

### 10.2 CITDP Plan gate (read-only reconcile)

| Field | Value | Refine note |
| --- | --- | --- |
| `depth_tier` | `integrated` | Unchanged; adversarial-inquiry four-artifact sets exist under `adversarial-inquiry/phase-{pre_implementation,verification,close_out}/`. |
| `gate_policy` | `advisory` | Unchanged |
| CITDP | `tied/citdp/CITDP-REQ-TIED_SPONSOR_AGENT_RELATIONSHIP.yaml` | Persisted; not rewritten in this pass |

### 10.3 Gaps closed in this pass

| Gap | Resolution |
| --- | --- |
| PLAN claimed **traceable-commit pending** while commit **`85c5791`** existed | § 7–§ 9 and frontmatter aligned to git truth. |
| Missing **`checklist-tracker.yaml`** (gate default path) | Created as a sync copy of the per-request checklist; document dual-file hygiene in artifact table above. |
| Missing **`sub-adversarial-inquiry-pass-evidence.md`** referenced by reconcile | Stub points at phase artifact dirs (see `evidence/sub-adversarial-inquiry-pass-evidence.md`). |
| Stale gate hash warnings in reconcile report | Documented: edit Tracker → invalidate downstream receipts; re-run close-out tooling only if sponsor needs a new receipt. |

### 10.4 Implement gate preparation

- **No further product implementation** in this pass (scope was plan refinement only).
- **`tied_validate_consistency`:** ok (re-run via `tied-cli.sh` at refine time).
- **Optional sponsor follow-ups:** (1) commit updated `PLAN.md` + refine artifacts if you want them in git; (2) `git push` when ready; (3) refresh close_out gate only if Tracker/CITDP change again.

---

## 11. Actionable next steps (sponsor)

1. **Optional docs commit** — stage `working/REQ-TIED_SPONSOR_AGENT_RELATIONSHIP/PLAN.md`, `refine-plan-pass-2026-10-01.md`, `checklist-tracker.yaml`, and evidence stubs if you want working-folder parity in git (product code already committed).
2. **No REQ/ARCH/IMPL edits required** — stack is Implemented and consistent unless you change behavior.
3. **Re-audit gates** — only if you mutate Tracker or CITDP: run `node mcp-server/packages/cli/dist/index.js gate check --request-token REQ-TIED_SPONSOR_AGENT_RELATIONSHIP --phase close_out --tracker working/REQ-TIED_SPONSOR_AGENT_RELATIONSHIP/checklist-tracker.yaml` and refresh `gates/` receipts per `plan-close-out-handoff.md`.
4. **Exclude unrelated work** — keep `co5-sponsor-commit-payload.v1.json` `exclude_paths` in mind for any future SAR commits (`CITDP-REQ-USPS_ADDRESS_VERIFICATION.yaml`, `REQ-TIED_JEV_TOOL_SAFETY_GATING/`).
