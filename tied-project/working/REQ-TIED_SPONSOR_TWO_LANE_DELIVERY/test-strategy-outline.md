# Test strategy outline — [REQ-TIED_SPONSOR_TWO_LANE_DELIVERY]

**Phase:** refine-plan pass 2 (pre-RED specification)  
**depth_tier:** minimal · **gate_policy:** advisory · **assurance_profile:** baseline-functional

## Module boundaries (validate independently before integration)

| Module | Path (planned) | Boundary |
| --- | --- | --- |
| **Lane classifier (pure)** | `mcp-server/src/relationship/sponsor-decision-lane.ts` | No MCP I/O; composes **`classifyDecisionConsequence`** from `consequence-ladder.ts` — does **not** reimplement ladder rungs |
| **Checklist adapter** | `mcp-server/src/checklist-validator.ts` | Warn-only **`mid_lane_sponsor_deferral`** diagnostic; reuses **`validateHingeFields`** — no duplicate hinge taxonomy |
| **Sponsor-questions (read-only MCP seam)** | `mcp-server/src/project-operations/sponsor-questions.ts` | Extends JSON readout with **lane** + phase filter; no writes to project YAML |

**Order:** unit tests for pure classifier → unit tests for sponsor-questions + checklist diagnostic → composition test for **`tied_sponsor_questions`** handler.

**Out of scope:** UI E2E; production deploy; **[REQ-TIED_FEATURE_ORCHESTRATION]** (deferred unless sponsor re-opens scope).

## Mandatory TDD order (@build-plan)

1. **`tied_token_create_with_detail`** REQ/ARCH/IMPL + sidecar `IMPL-TIED_SPONSOR_TWO_LANE_DELIVERY-pseudocode.md` (four blocks, token comments).
2. **`pseudocode_validate`** (Layer B gating) — **before any RED test**.
3. **RED** unit/contract tests (T-TLD-01..08).
4. **GREEN** docs/vocab (W1), checklist markers (W2), MCP (W3), bootstrap doc test (W4).
5. **`tied_validate_consistency`** after project YAML writes.
6. **`tied_verify`** when SC-TLD-001..005 mapped to passing tests.
7. Close-out: verification + **`close_out`** gates, **`sub-close-out-evidence-sync`**, envelope validate (`fail_on_error_gaps: true`), vocabulary **VALIDATE** (Touchpoint 3).

## Pseudo-code block → test mapping

| IMPL block | Test ID(s) | Token linkage |
| --- | --- | --- |
| **`CLASSIFY_SPONSOR_DECISION_LANE`** | T-TLD-01 | `[REQ-TIED_SPONSOR_TWO_LANE_DELIVERY]` `[ARCH-TIED_SPONSOR_TWO_LANE_DELIVERY]` `[IMPL-TIED_SPONSOR_TWO_LANE_DELIVERY]` |
| **`BATCH_CHARTER_COSTLY_CHOICES`** | T-TLD-01 (batch inputs), T-TLD-04 (slug at `risk-assessment`) | same |
| **`VALIDATE_SELECTION_EVIDENCE`** | T-TLD-03, T-TLD-02 (selection rows) | same |
| **`AUDIT_MID_LANE_SPONSOR_DEFERRAL`** | T-TLD-07, T-TLD-08 | same |

## Test matrix

| ID | Type | Target | Asserts |
| --- | --- | --- | --- |
| T-TLD-01 | Unit | `classifySponsorDecisionLane` | **`charter`** when scope-fix without product evidence; **`selection`** when `requires_product_evidence`; **`mid_lane_defer`** when reversible default documented; ladder input delegated to existing **`classifyDecisionConsequence`** where applicable |
| T-TLD-02 | Unit | `extractSponsorQuestions` | **`lane`**, **`deferred`**, optional **`phase`** filter; selection-lane costly rows require **`selection_evidence`** refs |
| T-TLD-03 | Unit | `validateSelectionEvidence` | Missing evidence → warn diagnostic, not throw |
| T-TLD-04 | Contract | Checklist MD + YAML | Markers at **`translate-sponsor-intent`**, **`change-definition`**, **`risk-assessment`**, **`verification-gate`**, **`sync-tied-stack`** (SC-TLD-003) |
| T-TLD-05 | Contract | `sponsor-two-lane-delivery.md` | Proof boundary, charter/selection sections, link from **client-development-index** (SC-TLD-002) |
| T-TLD-06 | Composition | **`tied_sponsor_questions`** MCP handler | JSON includes **lane** fields when CITDP carries **`sponsor_charter_backlog`** / **`sponsor_selection_backlog`** hints |
| T-TLD-07 | Unit | **`AUDIT_MID_LANE_SPONSOR_DEFERRAL`** | Backlog row + default documented → warn-only audit record; no hard-block |
| T-TLD-08 | Unit | `checklist-validator.ts` | Advisory **`gate_policy`**: **`mid_lane_sponsor_deferral`** diagnostic is warn-only (W3+); does not flip **`allowed`** for integrated inquiry |

## Gates and evidence (build-plan close-out)

| Phase | When | Receipt location |
| --- | --- | --- |
| **`pre_implementation`** | After refine-plan pass 2 (plan-only CITDP) — **required before @build-plan RED** | `tied-bundle/working/REQ-TIED_SPONSOR_TWO_LANE_DELIVERY/gates/` |
| **`verification`** | After MCP + checklist parity green | same |
| **`close_out`** | After **`tied_verify`**, CITDP **`citdp_record_write`** → `tied-project/citdp/` | same |

**Committed process evidence (git):** PLAN, **`checklist-tracker.yaml`**, draft CITDP, **`evidence/request-evidence-envelope.v1.json`**, **`verification-evidence-manifest.v1.json`** when blocking.

**Regenerable (gitignored):** gate JSON under **`tied-bundle/working/`** per [working-artifact-placement.md](../../../tied-bundle/docs/working-artifact-placement.md).

**Completion signals (do not collapse):** machine close-out (gate + envelope), process contract (**`tied_verify`** / checklist dispositions), adherence ledger when applicable — see **`completion-signals-handoff.md`**.
