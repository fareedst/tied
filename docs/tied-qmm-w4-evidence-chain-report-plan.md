# TIED W4 — Client-cohort evidence-chain readouts

| Field | Value |
| --- | --- |
| **Status** | **Implement complete** (2026-10-10); evidence under [`PLAN-TIED-QMM-W4-EVIDENCE-CHAIN-REPORT/evidence/`](../tied-project/working/PLAN-TIED-QMM-W4-EVIDENCE-CHAIN-REPORT/evidence/) |
| **Change ID** | `PLAN-TIED-QMM-W4-EVIDENCE-CHAIN-REPORT` |
| **Parent program** | [`docs/tied-qmm-methodology-learning-plan.md`](tied-qmm-methodology-learning-plan.md) |
| **Working entry** | [`tied-project/working/PLAN-TIED-QMM-W4-EVIDENCE-CHAIN-REPORT/PLAN.md`](../tied-project/working/PLAN-TIED-QMM-W4-EVIDENCE-CHAIN-REPORT/PLAN.md) |
| **Tracker** | [`tied-project/working/PLAN-TIED-QMM-W4-EVIDENCE-CHAIN-REPORT/checklist-tracker.yaml`](../tied-project/working/PLAN-TIED-QMM-W4-EVIDENCE-CHAIN-REPORT/checklist-tracker.yaml) |
| **Existing product stack** | `[REQ-EVIDENCE_CHAIN_REPORT]` → `[ARCH-EVIDENCE_CHAIN_REPORT]` → `[IMPL-EVIDENCE_CHAIN_REPORT]` |
| **Last updated** | 2026-10-10 (implement complete; parent QMM program closed) |

## Program exit

Parent program [`PLAN-TIED-QMM-METHODOLOGY-LEARNING`](tied-qmm-methodology-learning-plan.md) is **closed** (2026-10-10). QMM **W6 waived** at program exit; Kaizen Phase 3 transport unchanged (**deferred** on Kaizen program).

## 0. Authority and delegated work envelope

**Plan-only pass (complete):** authored child plan, plan-only Tracker, and
non-activation gate. **Implement pass (authorized):** sponsor records
`w4_scope: implement` in
[`sponsor-authority-w4-implement-20261010.md`](../tied-project/working/PLAN-TIED-QMM-METHODOLOGY-LEARNING/evidence/sponsor-authority-w4-implement-20261010.md).

Implement may reconcile and extend the existing evidence-chain report stack,
run TDD only for confirmed gaps, and produce W4 demonstration evidence. It
does **not** mint a second report requirement, traverse client roots, mutate
project YAML, append finding-ledger entries, promote cases, or edit
`tied-bundle/`.

The existing `[REQ-EVIDENCE_CHAIN_REPORT]` stack remains the product
authority; W4 program success requires wave close-out evidence, not assumption
that prior implementation alone satisfies the QMM outcome.

### 0.1 RESOLVE term map

| Sponsor wording | Canonical term | Boundary |
| --- | --- | --- |
| cross-client statistics | **evidence chain statistics report** | Versioned, read-only batch artifact; not a maturity score |
| comparable client group | **client cohort** | Same `schema_version|profile_depth` compatibility key |
| list of report files | **report input manifest** | Explicit input list; no client discovery |
| denominator hash | **denominator fingerprint** | Stable v2 partition key, never a derived-value aggregate |
| denominator group | **denominator subcohort** | Same fingerprint inside one client cohort |
| output redaction mode | **privacy tier** | `operator_local` default; shareable export requires owner/expiry |
| what the evidence proves | **proof boundary** | Claim limit of each artifact or statistic |

These are existing vocabulary terms from `quality-assurance.md`,
`fidelity-research.md`, `pseudocode-and-citdp.md`, and
`sponsor-agent-relationship.md`; no new glossary concept is introduced.
Vocabulary RECORD is therefore **N/A for new terms**. Final
sub-vocabulary-sync VALIDATE remains a future close-out obligation if W4 is
implemented.

### 0.2 Costly choices and documented defaults

| Choice | Classification | Default | Sponsor hinge |
| --- | --- | --- | --- |
| Local path privacy | Reversible choice | `operator_local`, basenames only, no absolute paths | May be changed before implementation |
| Report version | Reversible choice | v1 default; v2 explicit | Existing v1 byte stability remains required |
| Shareable export | Costly choice | Not enabled | Requires named redaction owner, approval, and expiry |
| Canonical promotion | Costly choice | Outside W4 | Requires separate methodology change and LEAP |
| Cohort comparability | Reversible choice | Partition by `schema_version|profile_depth`; v2 also by denominator fingerprint | Cannot be relaxed by implementation convenience |

The costly choices are sponsor-owned. The agent may proceed with the
reversible defaults within the plan-only envelope, but may not convert a
shareable export or canonical promotion into an implementation default.

## 1. Change definition

### Current behavior

The TIED-side report module and CLI already implement the
`evidence-chain-statistics-report.v1` default and explicit v2 denominator
subcohort path. The QMM W4 program has not yet recorded a child plan that
defines its client-cohort readout, privacy boundary, and future gate evidence.

### Desired behavior

A later authorized W4 pass can deterministically consume an explicit
`evidence-chain-report-inputs.v1` manifest and already-generated
`evidence-chain-profile.v1` artifacts to produce:

1. compatibility-partitioned client cohorts;
2. count-only v1 statistics with visible statuses and proof boundaries;
3. v2 denominator subcohorts when fingerprints differ;
4. deterministic YAML authority plus Markdown projection;
5. explicit diagnostics for malformed, missing, duplicate, forbidden-field,
   and partial-mode inputs.

### Unchanged behavior and non-goals

- No live client discovery, repository traversal, project-YAML mutation,
  finding-ledger append, case promotion, or profile generation.
- No maturity score, universal ranking, SPC/DORA, derived-value averaging,
  or automatic methodology promotion.
- v1 remains the default and must remain byte-stable for unchanged inputs.
- Markdown never introduces statistics absent from authoritative YAML.
- Existing `[REQ-EVIDENCE_CHAIN_REPORT]` → `[ARCH-EVIDENCE_CHAIN_REPORT]` →
  `[IMPL-EVIDENCE_CHAIN_REPORT]` records remain unchanged.

### Success criteria for implement (authorized)

- Pass integrated `pre_implementation` with fresh activation (not plan-only receipt).
- Reconcile stack vs this plan; LEAP before gap-closing code.
- Unit + CLI matrix green; W4 demonstration artifacts under wave `evidence/`.
- `tied_verify` / `tied_validate_consistency` when project TIED touched.
- Verification and close_out gates with envelope and manifest references.
- Orchestrator `implement_status` complete only after wave close-out.

### Plan-only pass (complete)

- Child plan, plan-only Tracker, and non-activation gate recorded (refine pass 1).

## 2. Existing implementation alignment

The later implementation pass must reconcile, without assuming correctness:

- `mcp-server/src/fidelity-research/evidence-chain-report.ts`;
- `mcp-server/src/cli/evidence-chain-report.ts`;
- `mcp-server/src/fidelity-research/evidence-chain-report.test.ts`;
- `mcp-server/src/fidelity-research/evidence-chain-report.cli.test.ts`;
- `[IMPL-EVIDENCE_CHAIN_REPORT]` sidecar procedures:
  `VALIDATE_PROFILE_ARTIFACT`, `RESOLVE_INPUT_IDENTITY`,
  `PARTITION_CLIENT_COHORTS`, `AGGREGATE_COHORT_STATISTICS`,
  `COMPUTE_DENOMINATOR_FINGERPRINT`, `PARTITION_SUBCOHORTS`, and deterministic
  YAML/Markdown rendering.

Prior W1–W3 receipts are historical program evidence only. They are not
W4 activation evidence, do not satisfy W4's Tracker/CITDP contract, and
cannot be reused across phases.

## 3. Independent profile, depth, and gate selections

The dimensions are intentionally separate:

| Dimension | This plan-only pass | Future implementation default | Meaning |
| --- | --- | --- | --- |
| `profile_depth` | `integrated` | `integrated` | Evidence-chain report/profile measurement depth |
| `depth_tier` | `minimal` | `integrated` | Adversarial inquiry depth for the workflow |
| `gate_policy` | `advisory` | `per_citdp` | Whether checklist evidence can block progression |

The plan-only `minimal`/`advisory` selection is non-activating because no
runtime work is authorized. The future implementation path is expected to
select `integrated` because the CLI/reporting boundary handles external
artifact input, path privacy, and persistence-adjacent output. Any downgrade
requires a real sponsor-approved waiver with owner, expiry, rationale, and
approval; it cannot be inferred from prior W1–W3 receipts.

## 4. Future gate and evidence contracts

### 4.1 Implement entry / `pre_implementation`

The future implement pass may begin only with all of:

- explicit sponsor authority naming `w4_scope: implement`;
- this child plan and a fresh Authoritative Tracker;
- implement CITDP recording the independent dimensions above, risk triggers,
  assurance profile, test strategy, and proof boundaries;
- complete token-commented IMPL review and pseudo-code validation for any
  confirmed gap;
- `pre_implementation` gate receipt for this W4 request;
- if integrated eligibility applies, fresh identity-bound activation evidence
  under `tied-bundle/working/{REQ-TOKEN}/adversarial-inquiry/phase-pre_implementation/`.

This planning pass has no implement CITDP and no activation evidence. Its gate
attempt must remain a non-activation result.

### 4.2 Verification

The future verification contract must retain:

- unit receipts for manifest parsing, cohort partitioning, duplicate identity,
  forbidden score keys, missing/not-measured preservation, path privacy,
  denominator mismatch, strict/partial modes, stale-output removal, v1 byte
  stability, and v2 subcohort separation;
- CLI composition receipts for exit codes, YAML/Markdown agreement, strict
  no-output failure, partial success, invalid flags, v2 selection, and
  intent-YAML non-mutation;
- deterministic rerun comparison with identical input/output hashes;
- v1 and v2 fixture reports, including mixed `integrated` and
  `human_research` cohorts and differing denominator fingerprints;
- explicit path-privacy evidence showing basenames and no absolute paths by
  default;
- future `tied_verify` and `tied_validate_consistency` results;
- fresh verification-phase activation evidence when integrated eligibility
  applies.

The proof boundary is report behavior and artifact provenance only; these
receipts do not prove methodology effectiveness or a maturity ranking.

### 4.3 Close-out

Before any future W4 completion claim, the close-out contract must include:

- verification evidence manifest and request evidence envelope references;
- gate receipts for verification and close-out, not a reused pre-implementation
  receipt;
- vocabulary VALIDATE result for plan, report terms, fixtures, and output
  names;
- deterministic report artifacts with schema version, input identities,
  exclusions, validation errors, residual risks, and proof boundaries;
- explicit disposition of unresolved costly choices;
- `tied_validate_consistency` result for any project TIED records touched by
  the authorized implementation pass.

Plan-only completion means only that this contract is authored and reconciled;
it does not satisfy any future implementation or close-out gate.

## 5. Test and demonstration strategy for later authorization

### Unit matrix

| Area | Required demonstration |
| --- | --- |
| Manifest | Schema, defaults, mode override, stable input ordering |
| Artifact validation | Missing, malformed, duplicate, forbidden-field, and status preservation |
| Cohorts | Separate `schema_version|profile_depth` keys; no cross-cohort rollup |
| v2 denominators | Same compatibility key with different fingerprints yields separate subcohorts |
| Privacy | `operator_local` emits basenames only; explicit shareable path is owner/expiry gated |
| Determinism | Same inputs and injected clock produce byte-stable YAML/Markdown |
| Safety | Intent TIED YAML is not mutated; no output on strict rejection |

### Composition matrix

The CLI must prove exit codes, YAML/Markdown agreement, strict no-output
failure, partial success, invalid flags, v2 selection, stale-output removal,
and the caller-selected output path boundary without invoking a UI.

### Demonstration matrix

- mixed `integrated` and `human_research` inputs form separate cohorts;
- different denominator fingerprints form separate v2 subcohorts;
- invalid or missing inputs are excluded and diagnosed, never converted to
  zero;
- generated Markdown contains no statistic absent from authoritative YAML;
- prior W1–W3 receipts appear only as historical context, never as W4
  activation evidence.

## 6. Implement (authorized 2026-10-10)

**Authority:** [`sponsor-authority-w4-implement-20261010.md`](../tied-project/working/PLAN-TIED-QMM-METHODOLOGY-LEARNING/evidence/sponsor-authority-w4-implement-20261010.md)

**CITDP:** [`CITDP-PLAN-TIED-QMM-W4-IMPLEMENT.yaml`](../tied-project/citdp/CITDP-PLAN-TIED-QMM-W4-IMPLEMENT.yaml)

**Tracker:** [`implement-checklist-tracker.yaml`](../tied-project/working/PLAN-TIED-QMM-W4-EVIDENCE-CHAIN-REPORT/implement-checklist-tracker.yaml) — do **not** use the plan-only Tracker for RED.

1. Reconcile existing REQ/ARCH/IMPL, sidecar, fixtures, tests, and this plan.
2. `sub-adversarial-inquiry-pass` + integrated `pre_implementation` gate with fresh activation.
3. RED → GREEN for confirmed gaps only; composition CLI tests; demonstration matrix.
4. Verification and close-out gates, envelope, vocabulary VALIDATE, TIED consistency.

## 7. Validation snapshot

| Pass | Gate / evidence |
| --- | --- |
| Plan-only (complete) | Non-activation `pre_implementation`; `citdp: null` on planning Tracker |
| Implement (in progress) | Requires implement CITDP + fresh activation before RED |
