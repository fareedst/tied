# Integrated activation — enforcement and operator-path friction plan

**Status:** Refined execution plan (2026-08-23; plan-only)
**Audience:** TIED methodology maintainers, MCP implementers, prompt-type skill authors, operator pilots
**Motivation:** Client **`1787507684`** (`REQ-ROOTJOBS`) completed a valid **minimal** four-prompt pass with strong counterexample-driven tests, then required a **manual post-hoc integrated pilot** to produce MCP inquiry evidence. The pilot succeeded but exposed **enforcement holes** (checklist/gate trust) and **operator friction** (undocumented pairing fields, CITDP write ordering, artifact overwrite, metrics tagging).

**Parent plan:** [`integrated-activation-checklist-enforcement-plan.md`](integrated-activation-checklist-enforcement-plan.md) (Batch 2 Slices 1–3). This document **extends** that plan with pilot-derived fixes; it does not replace it.

**Related tokens:** `[REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]`, `[REQ-TIED_ADVERSARIAL_INQUIRY]`, `[REQ-MCP_USAGE_METRICS]`, `[PROC-AGENT_REQ_CHECKLIST]`, `[IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]`, `[IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST]`, `[IMPL-MCP_USAGE_METRICS]`

**Pilot artifacts:**

- Audit: `working/client-1787507684-activation-audit/`
- Client summary: `/Users/fareed/Documents/dev/test/1787507684/working/REQ-ROOTJOBS/integrated-activation-pilot-summary.md`

---

## 1. Executive summary

| Layer | Today | Target |
|-------|-------|--------|
| **Minimal adversarial thinking** | Triggered by checklist + CITDP (counterexamples, falsification, CE-* tests) | Unchanged — working as designed |
| **Integrated MCP inquiry** | Opt-in via `depth_tier`; **not** auto-enforced; **heavy manual assembly** | Auto-enforced at integrated depth; **one-command collect → gate** |
| **Checklist completion trust** | Parent steps can show `completed` while `sub-adversarial-inquiry-pass` stays `pending` | Fail closed when integrated; at minimal require `not_applicable` + rationale, not `pending` |
| **Operator runbook** | Missing `activation.expected`, phase artifact layout, CITDP upgrade path | Documented + MCP-assisted |

**Non-goal:** Force `depth_tier: integrated` on every REQ (e.g. read-only local CLI remains valid at minimal).

### Refinement outcome and build boundary

This pass is **plan-only**. It selects `depth_tier: minimal`,
`profile_depth: not_measured`, and `gate_policy: advisory` for the planning
activity itself; it does not claim integrated activation and does not authorize
RED tests or production code. The next implementation handoff is deliberately
split:

1. **Slice 0 hotfixes** — validator false-pass repairs and template hygiene.
2. **Parent Batch 2 Slice 1** — the enforcement core (`B + A2`): phase-aware
   auto-slugs, gate-time activation enforcement, phase-bound receipts, depth
   downgrade checks, and CITDP template fields.
3. **Phase persistence** — isolated `phase-{phase}` artifact directories and
   receipt path updates; independent of the collector, but required before the
   three-phase replay.
4. **CITDP upgrade path** — permit an open `minimal → integrated` record without
   activation; the progression gate, not the writer, blocks incomplete
   verification/close-out evidence.
5. **Collector** — the optional parent Batch 2 Slice 2
   `tied_checklist_activation_collect` surface after phase paths are stable.
6. **Metrics** — client attribution and project-root completeness analysis;
   parallel with persistence, with no activation claim from metrics alone.
7. **Go path** — Mode A builder/reference fixture first; native Mode B remains a
   separate future REQ.
8. **Prompt/checklist alignment** — update operator prose and static contracts
   only after the enforcement contract is stable; this does not create a
   second workflow.

The first `build-plan` handoff is **only the parent Batch 2 Slice 1 contract
(B + A2, parent plan §13)**. Slice 0 is a separately reviewable hotfix
proposal; it is not silently added to that handoff. Phase persistence, CITDP
upgrade, collector, metrics, Go, and prompt/checklist alignment are follow-on
slices with their dependencies below.

---

## 2. Evidence from client 1787507684

### 2.1 Original four-prompt run (minimal — valid)

| Signal | Result |
|--------|--------|
| CITDP counterexamples CE-001..003 | Present |
| Falsification / disconfirming observations | Present |
| Unit tests tagged CE-* | Present |
| `depth_tier` | `minimal` + documented `integrated_waiver` |
| `tied_adversarial_inquiry_run` | 0 calls |
| `sub-adversarial-inquiry-pass` | `pending` while callers marked `completed` |

**Conclusion:** Adversarial **thinking** was present; integrated **inquiry** was correctly not required at minimal depth. **Process integrity** was degraded.

### 2.2 Post-hoc integrated pilot (manual — succeeded with friction)

| Step | Friction encountered |
|------|----------------------|
| Upgrade CITDP to `integrated` | `citdp_record_write` rejected until activation pairing existed (chicken-and-egg) |
| Three inquiry runs | Canonical artifact dir **overwritten** each run; required manual `phase-{phase}/` snapshots |
| Gate validate pre_impl / verification | Failed with `missing_expected_identity` until `activation.expected` added by hand |
| Gate validate close_out | Initially **passed without valid pairing** because `close_out_inquiry_waiver` placeholders (`~`) looked non-empty |
| Metrics | Inquiry logged as `client: tied-cli`, not client alias `1787507684` |
| Mode A inputs (Go) | Hand-authored graph/fidelity JSON (no project-input adapter) |

---

## 3. Gap inventory

Gaps are grouped by **enforcement** (fail-closed behavior) vs **operator path** (human/agent steps to comply).

| ID | Gap | Type | Severity | Pilot symptom |
|----|-----|------|----------|---------------|
| **E1** | Integrated depth does not auto-require pairing / phase slugs inside gate | Enforcement | **High** | Parent plan Batch 2 Slice 1 — not shipped |
| **E2** | `sub-adversarial-inquiry-pass` can stay `pending` while parent steps `completed` | Enforcement | **High** | Checklist close-out claimed success |
| **E3** | `close_out_inquiry_waiver` accepts placeholder `~` as valid owner/expiry | Enforcement | **High** | Close-out gate passed without activation |
| **E4** | `validateActivationPairing` requires `expected` but gate/docs do not supply it | Enforcement + operator | **High** | `missing_expected_identity` until manual fix |
| **E5** | At minimal depth, no rule that sub-stub must be `not_applicable` (not `pending`) | Enforcement | **Medium** | Ambiguous checklist state |
| **O1** | `citdp_record_write` validates integrated depth at verification before inquiry exists | Operator | **High** | Required direct YAML edit to upgrade depth |
| **O2** | Inquiry persistence overwrites same four files for every phase | Operator | **High** | Manual per-phase snapshot copies |
| **O3** | No `tied_checklist_activation_collect` helper | Operator | **High** | Hand-built gate JSON payloads |
| **O4** | `activation.expected` undocumented in adoption guide / skills | Operator | **Medium** | Undiscoverable requirement |
| **O5** | Metrics client tag inconsistent (`tied-cli` vs project alias) | Operator | **Medium** | Weak per-client observability |
| **O6** | Go stacks lack Mode B adapter; Mode A graph/fidelity is manual | Operator | **Medium** | UNRELIABLE verdict; high assembly cost |
| **O7** | Prompt sequence defaults to minimal without sponsor confirm when eligibility triggers | Process | **Low** | No integrated path from skills alone |

---

## 4. Fix program (slices)

Slices are ordered by **risk reduction first**, then **operator ergonomics**. The
parent Batch 2 Slice 1 scope is the existing §6 Phase B contract; it is called
out explicitly below so it is not confused with the follow-on operator slices.

### Slice 0 — Validator hotfixes (separate prerequisite candidate)

**Goal:** Close false passes and silent checklist drift without new MCP tools.
This slice is **not part of the first build-plan scope**. It may be scheduled
before or alongside parent Batch 2 Slice 1 only through an explicitly scoped
child tracker or a later plan decision; its tasks must not be hidden in the
parent Slice 1 tracker.

| # | Change | Location | Acceptance |
|---|--------|----------|------------|
| 0.1 | **Reject placeholder waivers:** treat `~`, empty string, and null as absent in `hasValidCloseOutInquiryWaiver` and waiver field validators | `mcp-server/src/checklist-validator.ts` | RED: CITDP with `owner: '~'` → waiver invalid; gate requires pairing or real waiver |
| 0.2 | **Derive `activation.expected` at the gate boundary** from `activation.receipt` when `expected` is omitted; never infer missing receipt fields | `validateChecklistGate` / MCP handler | Gate accepts a complete receipt+artifacts payload without hand-authored `expected`; incomplete receipt remains a failure |
| 0.3 | **Minimal sub-stub disposition rule:** if `depth_tier === 'minimal'` and phase slugs include sub-adversarial callers, require sub-stub `not_applicable` or `waived` with rationale — **`pending` fails** at any gate phase | `validateTracker` | RED: minimal fixture with pending sub-stub → `pending_required_step:sub-adversarial-inquiry-pass` |
| 0.4 | **Parent–child slug consistency (integrated):** if any auto-required slug is `completed`, `sub-adversarial-inquiry-pass` cannot be `pending` | `validateTracker` extension | Integrated fixture with completed `gate-pseudocode-validation` + pending sub-stub → fail |
| 0.5 | **CITDP template hygiene:** document null/omit for unused waivers; never `~` in examples | `tied/docs/citdp-record-template.yaml`, `citdp-policy.md` | Template lint or doc review |

**Tests:** extend `checklist-validator.test.ts`; add fixture using 1787507684 waiver shape.

**LEAP:** `[IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]` pseudo-code blocks for waiver validation and expected auto-derive.

---

### Parent Batch 2 Slice 1 — enforcement core

**Do not re-specify here.** Implement per parent plan §4.1, §6 Phase B, §13:

- Phase-aware `INTEGRATED_REQUIRED_SLUGS` auto-union
- `integrated_depth_requires_pairing` when activation omitted at integrated verification/close_out
- `missing_completion_activation`, `depth_downgrade_requires_waiver`, `receipt_identity_mismatch:phase`
- CITDP template fields: `prior_depth_tier`, `integrated_waiver`, `close_out_inquiry_waiver`

**1787507684 replay acceptance (H5):** integrated depth is selected before
inquiry; gates fail without pairing; pass with the collector when available, or
with a complete receipt/artifact payload whose `expected` is gate-derived.

---

### Follow-on Slice P — Phase-scoped artifact persistence (operator + integrity)

**Goal:** Eliminate manual snapshot copies after each inquiry run.

| # | Change | Location | Acceptance |
|---|--------|----------|------------|
| P.1 | When `activation.phase` is present, persist under `working/{REQ}/adversarial-inquiry/phase-{phase}/`; do not overwrite another phase | `checklist-integration.ts` `persistWorkingArtifacts` | Three runs → three isolated dirs; pairing hashes stable per phase |
| P.2 | Receipt + `activation.artifacts` paths reference only that phase directory | Same | Gate pairing matches on-disk paths and rejects cross-phase paths |
| P.3 | Document layout in `adversarial-inquiry-adoption.md` § Persist | Docs | Operator checklist names the phase directory and root policy |

**Tests:** `checklist-integration.test.ts` — two phases, same `request_token`, distinct dirs and hashes.

**Policy decision (recorded in vocab):** Phase directories are the authoritative
pairing locations. The canonical four root files are a latest/close-out
convenience projection only and are never used to satisfy another phase's
pairing.

---

### Follow-on Slice U — CITDP depth upgrade path (operator)

**Goal:** Allow lawful `minimal → integrated` upgrade without direct YAML bypass.

| # | Change | Location | Acceptance |
|---|--------|----------|------------|
| U.1 | **Separate open-record shape from progression evidence:** allow `citdp_record_write` to persist `depth_tier: integrated` with activation omitted while the request is pre-inquiry; reject malformed activation when supplied | `citdp-writer.ts`, template | Minimal→integrated write succeeds before inquiry; verification/close-out gate still fails without pairing |
| U.2 | Require `prior_depth_tier: minimal` for a recorded upgrade and preserve it on subsequent writes; do not add an `upgrade_pending_inquiry` state | Same | Upgrade is auditable without a new status vocabulary |
| U.3 | Document the sequence: write depth → inquiry per phase → collect/assemble → gate → cite verification activation | `docs/adversarial-inquiry-adoption.md` | Matches the 1787507684 replay and avoids the chicken-and-egg path |

**Tests:** `citdp-writer.test.ts` — upgrade fixture from minimal to integrated
before inquiry (activation omitted), plus malformed-supplied-activation rejection.

---

### Parent Batch 2 Slice 2 — Activation collect MCP (operator)

**Goal:** One tool call replaces hand-built gate JSON.

| # | Deliverable | Details |
|---|-------------|---------|
| 3.1 | `tied_checklist_activation_collect` | Inputs: `request_token`, `phase`, `run_id`, optional `project_root`; reads phase artifact dir + metrics; outputs `{ receipt, artifacts, expected }` |
| 3.2 | `tied-cli.sh` wrapper | Same contract |
| 3.3 | Runbook | `tied/vocab/tied-yaml-mcp.md` + §8 operator checklist in parent plan |
| 3.4 | Composition test | inquiry → collect → gate → `allowed: true` using 1787507684 layout |

**Acceptance:** After phase persistence lands, the 1787507684 replay may use
collect for all three gate phases. Before Slice 2, manual assembly remains a
supported path only when the gate derives `expected` from a complete receipt.
Collector availability is not a prerequisite for Slice 1 or for the parent
plan’s gate contract.

---

### Follow-on Slice M — Metrics and observability (operator)

| # | Change | Location | Acceptance |
|---|--------|----------|------------|
| 4.1 | `tied-cli.sh` sets `TIED_MCP_METRICS_CLIENT` from env or `--client` flag defaulting to basename of `project_root` when under `dev/test/{id}` | `tied-cli.sh`, `usage-metrics.ts` | Metrics lines show `1787507684` |
| 4.2 | `analyze_tied_mcp_metrics.rb --project-root` checks phase subdirs + inquiry count ≥ required phases | Script | Pilot folder report shows activation complete |

---

### Follow-on Slice G — Go / non-Ruby operator path (deferred P1)

| # | Deliverable | Notes |
|---|-------------|-------|
| 5.1 | `scripts/build_adversarial_inquiry_from_tied.rb` (or extend Mode A builder) | Emit graph/fidelity from REQ/ARCH/IMPL + test file paths for Go |
| 5.2 | Native Go project-input adapter (Mode B) | Parent adoption doc P2 — out of scope for friction plan v1 |

**Interim:** Document 1787507684 graph/fidelity as **reference fixture** under `mcp-server/test/fixtures/adversarial-inquiry-go-rootjobs/`.

---

### Follow-on Slice A — Prompt-type and checklist process alignment

| # | Change | Location | Acceptance |
|---|--------|----------|------------|
| 6.1 | At `risk-assessment`, if eligibility table triggers integrated, **block** `integrated_waiver` without sponsor confirmation recorded in CITDP | Skills + checklist prose | Agent cannot silently waive on triggered work |
| 6.2 | Checklist `operator_evidence` template includes phase subdir paths and collect command | `agent-req-implementation-checklist.yaml` header | Copy hygiene for integrated pilots |
| 6.3 | `build-plan` / `plan-close-out` agents: call gate with activation when `depth_tier >= integrated` (fail handoff if gate `allowed: false`) | `.cursor/agents/build-plan.md`, `plan-close-out.md` | e2e test or agent contract test |

---

## 5. Implementation order and dependency map

```text
Slice 0 (hotfixes)          ──► first; unblocks trustworthy gates
Parent Batch 2 Slice 1      ──► after/with Slice 0; first build-plan scope
Slice P (phase persistence) ──► after artifact contract; before H5
Slice U (CITDP upgrade)     ──► after Slice 0; may parallel Slice P
Parent Batch 2 Slice 2      ──► after Slice P; collector consumes phase paths
Slice M (metrics)           ──► parallel with P/U; never gates activation alone
Slice G (Go path)           ──► after core gate; fixture first, Mode B deferred
Slice A (alignment)         ──► after core enforcement; refresh clients last
```

**Recommended first build-plan REQ:** continue `[REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]`
using `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT_batch2_tracker.yaml`,
with Slice 0 tasks prepended. That tracker must not silently absorb P/U/M/G/A;
each follow-on slice gets its own scoped tracker or explicit child section.

---

## 5.1 Ownership and evidence boundaries

- **Validator/MCP gate owner:** derives required slugs and expected identity,
  validates receipt/artifact identity, and returns the authoritative
  progression result. It does not persist inquiry artifacts or mutate
  canonical TIED YAML.
- **Inquiry integration owner:** writes the four bounded artifacts to the
  request-scoped phase directory and returns the receipt. It does not decide
  whether a checklist transition is allowed.
- **CITDP writer owner:** records the selected depth and upgrade history. An
  open integrated record may omit activation; verification and close-out gates
  remain responsible for requiring it.
- **Collector owner:** reads an already persisted phase and optional metrics
  record and assembles a gate payload. It cannot manufacture a receipt,
  artifacts, or activation status.
- **Metrics owner:** records sanitized tool-call attribution and reports
  observability/completeness. Metrics are supporting provenance, never
  integrated activation evidence by themselves.
- **Operator/pilot owner:** selects depth, supplies project/request scope,
  reviews findings, and records waivers. Checklist text, token presence,
  `profile_depth`, and TIED consistency cannot substitute for the paired
  inquiry metric and four artifacts.

At integrated depth, “activated” is claimable only for a specific request and
phase when the successful inquiry receipt, its four identity-bound artifacts,
and the corresponding metric/evidence provenance agree. A metric row is
supporting provenance, not a substitute for the receipt or artifacts. A
minimal client remains valid without those artifacts; the new validators must
not retroactively invalidate it.

---

## 6. Acceptance criteria

### 6.1 First build-plan handoff: parent Batch 2 Slice 1

The following are the completion criteria for the only initial
`build-plan` scope. They do not include Slice 0, P, U, C, M, G, or A:

| Criterion | Verification |
|-----------|--------------|
| Integrated depth fails without pairing at verification/close_out | Parent Batch 2 Slice 1 tests |
| Phase-aware auto-slugs cannot be omitted or subtracted by callers | Validator tests |
| Strict-candidate late-phase pairing is enforced | Validator test |
| Depth downgrade without a valid waiver fails closed | Validator test |
| Receipt phase cannot be reused across gate phases | Validator test |
| Existing minimal behavior and Batch 1 pairing-when-supplied behavior remain valid | Regression fixtures |

### 6.2 Follow-on acceptance

These criteria are program goals, not prerequisites for the first handoff:

| Criterion | Verification |
|-----------|--------------|
| Placeholder waiver cannot bypass close_out pairing | Validator test + 1787507684 CITDP shape |
| Gate works with receipt+artifacts only (`expected` auto-derived) | MCP test; adoption doc example |
| Minimal checklist cannot close with pending sub-stub | Validator test |
| Three inquiry phases persist without overwrite | Integration test + 1787507684 replay |
| CITDP upgrade minimal→integrated without YAML bypass | citdp-writer test |
| Operator replay uses phase persistence and collect when Slice 2 lands | H5 pilot script; manual assembly remains valid before Slice 2 |
| Metrics attribute inquiry to the intended client identity | Analyzer output with explicit identity provenance |
| No regression: minimal clients (1787503424, original 1787507684 minimal) remain valid | Retro test fixtures |

---

## 7. Test matrix (RED-first additions)

| Test file | New cases |
|-----------|-----------|
| `checklist-validator.test.ts` | Placeholder waiver invalid; minimal pending sub-stub; auto-expected pairing; parent completed + sub pending integrated |
| `checklist-gate-mcp.test.ts` | Gate with receipt only (no expected) |
| `checklist-integration.test.ts` | Phase-scoped artifact dirs |
| `citdp-writer.test.ts` | Depth upgrade path |
| `checklist-activation-collect.test.ts` or MCP composition test | collect → gate composition (parent Batch 2 Slice 2) |
| E2E | 1787507684 integrated replay script (working, not CI required initially) |

---

## 8. Documentation updates (operator path)

| Document | Update |
|----------|--------|
| [`adversarial-inquiry-adoption.md`](adversarial-inquiry-adoption.md) | § Gate pairing: `activation.expected` auto-derive; phase artifact layout; CITDP upgrade sequence |
| [`integrated-activation-checklist-enforcement-plan.md`](integrated-activation-checklist-enforcement-plan.md) | Cross-link this plan; add 1787507684 to motivation |
| [`tied/vocab/fidelity-research.md`](../tied/vocab/fidelity-research.md) | RECORD/VALIDATE: **phase artifact directory**, **activation expected identity**, **placeholder waiver** |
| `tied/docs/citdp-record-template.yaml` | Null omitted waivers; `prior_depth_tier` examples |
| Prompt-type skills | One paragraph: integrated path requires inquiry plus the checklist evidence gate, not checklist markers alone |

---

## 9. Rollout and client refresh

1. Execute parent Batch 2 Slice 1 (§13) through its own tracker; do not add
   Slice 0 or follow-on slices to that tracker.
2. Review and schedule Slice 0 as a separate scoped child if its hotfixes are
   still required after Slice 1’s RED matrix is inspected.
3. Run `./copy_files.sh` on pilot clients only after the relevant methodology
   changes land; **do not** retroactively fail completed minimal work.
4. Ship phase persistence and, when approved, the collector; then re-run
   1787507684 integrated replay using phase dirs and collect when available
   (manual assembly remains valid before Slice 2). Operator runbook:
   `working/client-1787507684-activation-audit/replay-integrated-activation.sh`
   (`--dry-run`, `--check`; not CI-required initially).
5. Update `working/client-1787507684-activation-audit/findings-report.yaml`
   only after that replay; Part H5 becomes complete only when its acceptance
   table passes.

---

## 10. Out of scope (this plan)

- Universal integrated depth on all REQs
- Strict-approved blocking pilots
- Fixing unrelated `tied_validate_consistency` failures on client 1787507684
- Automated YAML/checklist parity (F4 in integration checklist)
- Native Go Mode B adapter (Follow-on Slice G.2 — separate REQ)

---

## 10.1 Refinement checks and handoff

- **Scope boundary:** The parent plan remains authoritative. The first
  `build-plan` handoff is parent Batch 2 Slice 1 (§13) only; Slice 0 and all
  operator follow-ons require separate scope decisions.
- **Ownership boundary:** The gate validates progression, inquiry integration
  owns bounded artifacts, the collector assembles existing evidence, and
  metrics provide supporting provenance. No owner may manufacture activation.
- **Evidence boundary:** The existing `1787507684` audit demonstrates valid
  minimal evidence and checklist-integrity findings, not integrated activation.
  Its metrics, checklist text, and labels cannot substitute for a paired
  inquiry receipt and four artifacts.
- **Depth selectors for this pass:** `depth_tier: minimal`,
  `profile_depth: not_measured`, and `gate_policy: advisory`.
- **Gate status:** This refinement does not create a fresh
  `pre_implementation` gate result. The next `build-plan` must validate the
  current parent Slice 1 Tracker/CITDP with the checklist evidence gate before
  RED tests; historical or superseded gate JSON must not be reused.
- **TIED status:** No project TIED YAML or canonical REQ/ARCH/IMPL record was
  changed. CITDP persistence remains deferred to the behavior-changing
  implementation handoff.

---

## 11. Summary for sponsors

**1787507684 proved minimal adversarial thinking works; it also proved
integrated inquiry is still operator-heavy and gates can lie by accident.**
The first implementation handoff is the parent Batch 2 Slice 1
auto-enforcement contract; separately scoped hotfixes and operator follow-ons
then remove manual assembly through phase persistence, the CITDP upgrade path,
the collector, metrics, and the Go/prompt follow-ons. Minimal-tier greenfield
work stays valid; this refinement claims no integrated activation.
